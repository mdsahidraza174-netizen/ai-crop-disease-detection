# 🌿 AgriScan AI — Crop Disease Detection

> A production-grade, fully-local AI web application that detects crop diseases from leaf images using a TensorFlow CNN model. No external AI APIs — everything runs on your machine.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Technology Stack](#technology-stack)
4. [Where to Place Your Model](#where-to-place-your-model)
5. [Step-by-Step Setup](#step-by-step-setup)
6. [How It Works (Data Flow)](#how-it-works-data-flow)
7. [API Reference](#api-reference)
8. [Supported Classes](#supported-classes)
9. [Troubleshooting](#troubleshooting)
10. [Production Deployment](#production-deployment)

---

## 🎯 Project Overview

AgriScan AI accepts a photo of a crop leaf (uploaded from desktop or captured from a mobile camera), runs it through a locally-hosted TensorFlow SavedModel CNN, and returns:

- ✅ **Crop name** (Corn, Potato, Rice, Sugarcane, Wheat)
- 🔬 **Disease name** (or "Healthy")
- 📊 **Confidence score** with visual bar
- 📖 **Disease description**
- 🩺 **Symptoms**
- ⚠️ **Causes**
- 💊 **Treatment / Cure**
- 🛡️ **Prevention tips**
- 🏆 **Top-3 alternative predictions**
- ⚡ **Inference time in ms**

---

## 📁 Folder Structure

```
crop-disease-detection/
│
├── backend/                        ← FastAPI Python server
│   ├── main.py                     ← API server (load model, /predict endpoint)
│   ├── disease_db.json             ← Local disease information database
│   ├── requirements.txt            ← Python dependencies
│   └── models_1/                   ← ⭐ YOUR MODEL GOES HERE (see below)
│       ├── assets/
│       ├── variables/
│       │   ├── variables.index
│       │   └── variables.data-00000-of-00001
│       ├── keras_metadata.pb
│       └── saved_model.pb
│
├── frontend/                       ← React.js application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js              ← Axios API layer (connects to FastAPI)
│   │   ├── components/
│   │   │   ├── Header.jsx          ← App header with status indicator
│   │   │   ├── ImageUploader.jsx   ← Drag-drop + camera capture uploader
│   │   │   ├── LoadingAnimation.jsx← Scanning animation during inference
│   │   │   ├── PredictionCard.jsx  ← Full results display card
│   │   │   └── Footer.jsx          ← Supported crops footer
│   │   ├── App.jsx                 ← Root component, state orchestration
│   │   ├── index.js                ← React entry point
│   │   └── index.css               ← Global CSS + Tailwind + Google Fonts
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md                       ← This file
```

---

## 🛠️ Technology Stack

| Layer     | Technology                                |
|-----------|-------------------------------------------|
| Frontend  | React 18, Tailwind CSS, Framer Motion     |
| Backend   | FastAPI, Uvicorn                          |
| AI Model  | TensorFlow 2.x SavedModel CNN             |
| HTTP      | Axios (frontend ↔ FastAPI)               |
| Image     | Pillow (Python image preprocessing)       |
| Drag-Drop | react-dropzone                            |

---

## ⭐ Where to Place Your Model

**Your model directory structure:**
```
models_1/
├── assets/
├── variables/
│   ├── variables.index
│   └── variables.data-00000-of-00001
├── keras_metadata.pb
└── saved_model.pb
```

**Place it inside the `backend/` folder:**
```
crop-disease-detection/
└── backend/
    └── models_1/        ← Copy your entire models_1/ folder here
        ├── assets/
        ├── variables/
        ├── keras_metadata.pb
        └── saved_model.pb
```

The backend loads it with:
```python
model = tf.keras.models.load_model("models_1")
```

✅ Path in code: `backend/main.py` line ~20:
```python
MODEL_PATH = Path(__file__).parent / "models_1"
```

---

## 🚀 Step-by-Step Setup

### Prerequisites

| Tool       | Version Required | Check Command        |
|------------|------------------|----------------------|
| Python     | 3.9 – 3.11       | `python --version`   |
| Node.js    | 18+              | `node --version`     |
| npm        | 9+               | `npm --version`      |
| pip        | latest           | `pip --version`      |

---

### Step 1 — Clone / Download the Project

```bash
# If using git:
git clone <your-repo-url>
cd crop-disease-detection

# Or just extract the downloaded zip
cd crop-disease-detection
```

---

### Step 2 — Place Your Model

Copy your `models_1/` directory into `backend/`:

```bash
# Example (adjust source path):
cp -r /path/to/your/models_1 backend/models_1

# Verify it's there:
ls backend/models_1/
# Should show: assets  variables  keras_metadata.pb  saved_model.pb
```

---

### Step 3 — Set Up the Backend

```bash
# Navigate to backend
cd backend

# Create a Python virtual environment (strongly recommended)
python -m venv venv

# Activate it:
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

> ⚠️ **TensorFlow Note**: TensorFlow 2.16 requires Python 3.9–3.11.  
> If you're on Python 3.12, use `tensorflow==2.15.0` instead.

---

### Step 4 — Start the Backend Server

```bash
# Make sure you're in the backend/ directory with venv activated
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Expected output:**
```
INFO     Starting Crop Disease Detection API …
INFO     Disease database loaded — 17 entries
INFO     Loading TensorFlow SavedModel from: .../backend/models_1
INFO     Model loaded in 4.32s
INFO     Model warm-up complete
INFO     Uvicorn running on http://0.0.0.0:8000
```

Test it: open http://localhost:8000 in your browser — you should see a JSON status response.

---

### Step 5 — Set Up the Frontend

Open a **new terminal** (keep the backend running):

```bash
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Start the React development server
npm start
```

The app will open at **http://localhost:3000** automatically.

---

### Step 6 — Use the App! 🎉

1. Open **http://localhost:3000**
2. Watch the green "AI Model Online" indicator appear
3. Upload a crop leaf image by dragging, clicking, or using the camera button
4. Click **"Analyse Disease"**
5. View the detailed prediction results

---

## 🔄 How It Works (Data Flow)

```
User uploads image
        │
        ▼
React frontend (localhost:3000)
        │  Axios POST /predict  (multipart/form-data)
        ▼
FastAPI backend (localhost:8000)
        │
        ├─ Reads image bytes from UploadFile
        ├─ Opens with Pillow → RGB conversion
        ├─ Resizes to 256×256 pixels
        ├─ Normalizes pixel values ÷ 255 → [0.0, 1.0]
        ├─ Adds batch dimension → shape (1, 256, 256, 3)
        │
        ├─ model.predict(tensor)
        │   └─ Returns softmax probabilities shape (1, 17)
        │
        ├─ argmax → predicted class index
        ├─ CLASS_LABELS[index] → class name
        ├─ disease_db[class_name] → full disease info
        │
        └─ Returns JSON response
                │
                ▼
        React receives JSON
                │
                ├─ PredictionCard renders:
                │   • Crop name + disease name
                │   • Confidence bar (animated)
                │   • Severity badge
                │   • Top-3 predictions chart
                │   • Description
                │   • Symptoms (expandable)
                │   • Causes (expandable)
                │   • Treatment (expandable)
                │   └─ Prevention (expandable)
                │
                └─ Shown to user ✅
```

---

## 📡 API Reference

### `GET /`
Health check — returns server status.

### `GET /health`
```json
{
  "status": "ok",
  "model_loaded": true,
  "db_loaded": true
}
```

### `GET /classes`
Returns all 17 supported class labels.

### `POST /predict`

**Request:** `multipart/form-data` with field `file` (image file)

**Response:**
```json
{
  "success": true,
  "predicted_class": "Potato___Late_Blight",
  "confidence": 94.73,
  "inference_time_ms": 312.5,
  "low_confidence_warning": false,
  "top3_predictions": [
    { "class": "Potato___Late_Blight", "confidence": 94.73 },
    { "class": "Potato___Early_Blight", "confidence": 4.12 },
    { "class": "Potato___Healthy", "confidence": 1.15 }
  ],
  "disease_info": {
    "crop": "Potato",
    "disease": "Late Blight",
    "status": "diseased",
    "severity": "critical",
    "description": "...",
    "symptoms": ["...", "..."],
    "causes": ["...", "..."],
    "cure": ["...", "..."],
    "prevention": ["...", "..."]
  }
}
```

---

## 🌾 Supported Classes

| # | Class                          | Crop      | Status   |
|---|-------------------------------|-----------|----------|
| 0 | Corn___Common_Rust             | Corn      | Diseased |
| 1 | Corn___Gray_Leaf_Spot          | Corn      | Diseased |
| 2 | Corn___Healthy                 | Corn      | Healthy  |
| 3 | Corn___Northern_Leaf_Blight    | Corn      | Diseased |
| 4 | Potato___Early_Blight          | Potato    | Diseased |
| 5 | Potato___Healthy               | Potato    | Healthy  |
| 6 | Potato___Late_Blight           | Potato    | Diseased |
| 7 | Rice___Brown_Spot              | Rice      | Diseased |
| 8 | Rice___Healthy                 | Rice      | Healthy  |
| 9 | Rice___Leaf_Blast              | Rice      | Diseased |
|10 | Rice___Neck_Blast              | Rice      | Diseased |
|11 | Sugarcane_Bacterial Blight     | Sugarcane | Diseased |
|12 | Sugarcane_Healthy              | Sugarcane | Healthy  |
|13 | Sugarcane_Red Rot              | Sugarcane | Diseased |
|14 | Wheat___Brown_Rust             | Wheat     | Diseased |
|15 | Wheat___Healthy                | Wheat     | Healthy  |
|16 | Wheat___Yellow_Rust            | Wheat     | Diseased |

---

## 🔧 Troubleshooting

### ❌ "Cannot connect to the server"
- Make sure FastAPI is running: `uvicorn main:app --port 8000`
- Check firewall isn't blocking port 8000
- Verify the React app is pointing to `http://localhost:8000` (check `src/api/api.js`)

### ❌ "Model directory not found"
- Confirm `models_1/` is inside the `backend/` folder
- Check that `saved_model.pb` exists: `ls backend/models_1/`

### ❌ TensorFlow import errors
- Ensure Python version is 3.9–3.11
- Reinstall: `pip install tensorflow==2.16.1`
- On Apple Silicon Mac: use `tensorflow-macos` and `tensorflow-metal`

### ❌ Low confidence predictions
- Use clear, well-lit, close-up photos of single leaves
- Ensure the leaf fills most of the frame
- Avoid blurry, dark, or heavily shadowed images

### ❌ CORS errors in browser console
- FastAPI CORS is pre-configured for `localhost:3000` and `localhost:5173`
- If using a different port, add it to `allow_origins` in `backend/main.py`

### ❌ `npm install` fails
- Try: `npm install --legacy-peer-deps`
- Or update Node: `nvm use 20`

---

## 🏭 Production Deployment

### Backend
```bash
# No --reload in production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
```
- Use Nginx as reverse proxy
- Run with Gunicorn + Uvicorn workers for multi-process
- Remove `"*"` from CORS `allow_origins` in `main.py` and list your domain

### Frontend
```bash
cd frontend
npm run build
# Serve the build/ folder with Nginx or any static host
```

### Environment Variables
Create `frontend/.env`:
```
REACT_APP_API_URL=https://your-api-domain.com
```

---

## 📝 Disclaimer

> AgriScan AI is intended for advisory/educational purposes. Always confirm diagnoses with a certified agricultural expert or plant pathologist before applying treatments.
