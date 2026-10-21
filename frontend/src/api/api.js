import axios from "axios";

// ── Base URL ────────────────────────────────────────────────────
// Change this to your production URL when deploying
const BASE_URL = process.env.REACT_APP_API_URL || "https://ai-crop-disease-detection-wrew.onrender.com/";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60s — model inference can be slow on CPU
});

// ── Request interceptor ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with non-2xx
      const msg =
        error.response.data?.detail ||
        error.response.data?.message ||
        `Server error ${error.response.status}`;
      return Promise.reject(new Error(msg));
    } else if (error.request) {
      // No response received
      return Promise.reject(
        new Error(
          "Cannot connect to the server. Make sure the FastAPI backend is running on " +
            BASE_URL
        )
      );
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────
// API functions
// ─────────────────────────────────────────────────────────────────

/**
 * Check backend health
 */
export async function checkHealth() {
  const res = await api.get("/health");
  return res.data;
}

/**
 * Submit an image for crop disease prediction
 * @param {File} imageFile - The image file to predict
 * @param {function} onProgress - Optional upload progress callback (0-100)
 * @returns {Promise<Object>} Prediction result
 */
export async function predictDisease(imageFile, onProgress) {
  const formData = new FormData();
  formData.append("file", imageFile);

  const res = await api.post("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(pct);
      }
    },
  });

  return res.data;
}

/**
 * Get all supported classes
 */
export async function getClasses() {
  const res = await api.get("/classes");
  return res.data;
}

export default api;
