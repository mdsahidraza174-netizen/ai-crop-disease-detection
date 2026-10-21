"""
Crop Disease Detection API
FastAPI backend with TensorFlow SavedModel inference
"""

import os
import json
import time
import logging
import numpy as np
from pathlib import Path
from contextlib import asynccontextmanager

import tensorflow as tf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import io
# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(levelname)s │ %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)
# Constants

MODEL_PATH = Path(__file__).parent / "models_1"   # SavedModel directory
DISEASE_DB_PATH = Path(__file__).parent / "disease_db.json"
IMAGE_SIZE = (256, 256)                            # Model input size
CONFIDENCE_THRESHOLD = 0.30                        # Min confidence to trust prediction

CLASS_LABELS = [
    "Corn___Common_Rust",
    "Corn___Gray_Leaf_Spot",
    "Corn___Healthy",
    "Corn___Northern_Leaf_Blight",
    "Potato___Early_Blight",
    "Potato___Healthy",
    "Potato___Late_Blight",
    "Rice___Brown_Spot",
    "Rice___Healthy",
    "Rice___Leaf_Blast",
    "Rice___Neck_Blast",
    "Sugarcane_Bacterial Blight",
    "Sugarcane_Healthy",
    "Sugarcane_Red Rot",
    "Wheat___Brown_Rust",
    "Wheat___Healthy",
    "Wheat___Yellow_Rust",
]


state: dict = {
    "model": None,
    "disease_db": None,
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Crop Disease Detection API …")

    if not DISEASE_DB_PATH.exists():
        raise FileNotFoundError(f"Disease DB not found at {DISEASE_DB_PATH}")
    with open(DISEASE_DB_PATH, "r", encoding="utf-8") as f:
        state["disease_db"] = json.load(f)
    logger.info(f"Disease database loaded — {len(state['disease_db'])} entries")

    # TensorFlow SavedModel
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model directory not found at {MODEL_PATH}. "
            "Please place the 'models_1' folder inside the backend/ directory."
        )
    logger.info(f"Loading TensorFlow SavedModel from: {MODEL_PATH}")
    t0 = time.time()
    state["model"] = tf.keras.models.load_model(str(MODEL_PATH))
    logger.info(f" Model loaded in {time.time() - t0:.2f}s")

    dummy = np.zeros((1, *IMAGE_SIZE, 3), dtype=np.float32)
    state["model"].predict(dummy, verbose=0)
    logger.info("Model warm-up complete")

    yield  

    logger.info(" Shutting down …")

app = FastAPI(
    title="Crop Disease Detection API",
    description="AI-powered crop disease detection using TensorFlow CNN",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # React dev
        "http://localhost:5173",   # Vite dev (if used)
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://ai-crop-disease-detection-1-d2gu.onrender.com/",
        "*",                       
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Utility: preprocess image
def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Convert raw image bytes to a normalized tensor of shape (1, 256, 256, 3).
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {exc}")

    img = img.resize(IMAGE_SIZE, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)   # Normalize to [0, 1]
    return np.expand_dims(arr, axis=0)               



# Routes

@app.get("/", tags=["health"])
async def root():
    return {
        "status": "running",
        "service": "Crop Disease Detection API",
        "version": "1.0.0",
        "model_loaded": state["model"] is not None,
        "classes": len(CLASS_LABELS),
    }


@app.get("/health", tags=["health"])
async def health():
    return {
        "status": "ok",
        "model_loaded": state["model"] is not None,
        "db_loaded": state["disease_db"] is not None,
    }


@app.get("/classes", tags=["info"])
async def get_classes():
    """Return all supported crop/disease classes."""
    return {"classes": CLASS_LABELS, "total": len(CLASS_LABELS)}


@app.post("/predict", tags=["prediction"])
async def predict(file: UploadFile = File(...)):
    """
    Accept a crop leaf image and return:
    - predicted class
    - confidence score
    - top-3 predictions
    - full disease information from the local database
    """
    if state["model"] is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet. Please retry.")
    if state["disease_db"] is None:
        raise HTTPException(status_code=503, detail="Disease database not loaded.")

    allowed_types = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"}
    content_type = file.content_type or ""
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{content_type}'. Use JPEG, PNG, or WebP.",
        )

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(image_bytes) > 15 * 1024 * 1024:  # 15 MB limit
        raise HTTPException(status_code=413, detail="File too large. Maximum 15 MB allowed.")

    tensor = preprocess_image(image_bytes)

    t0 = time.time()
    predictions = state["model"].predict(tensor, verbose=0)[0]  
    print(predictions)
    print("predicted index :" ,np.argmax(predictions))# shape: (num_classes,)
    inference_ms = round((time.time() - t0) * 1000, 1)

    pred_idx = int(np.argmax(predictions))
    confidence = float(predictions[pred_idx])
    predicted_class = CLASS_LABELS[pred_idx]

    # Top-3 predictions
    top3_indices = np.argsort(predictions)[::-1][:3]
    top3 = [
        {
            "class": CLASS_LABELS[i],
            "confidence": round(float(predictions[i]) * 100, 2),
        }
        for i in top3_indices
    ]

    disease_info = state["disease_db"].get(predicted_class)
    if disease_info is None:
        logger.warning(f"Class '{predicted_class}' not found in disease DB")
        disease_info = {
            "crop": predicted_class.split("___")[0].replace("_", " "),
            "disease": predicted_class.split("___")[-1].replace("_", " "),
            "status": "unknown",
            "description": "No detailed information available for this class.",
            "symptoms": [],
            "causes": [],
            "cure": [],
            "prevention": [],
        }

    response = {
        "success": True,
        "predicted_class": predicted_class,
        "confidence": round(confidence * 100, 2),  # percent
        "inference_time_ms": inference_ms,
        "top3_predictions": top3,
        "low_confidence_warning": confidence < CONFIDENCE_THRESHOLD,
        "disease_info": disease_info,
    }

    logger.info(
        f"Prediction: {predicted_class} | {confidence*100:.1f}% | {inference_ms}ms"
    )
    return JSONResponse(content=response)
