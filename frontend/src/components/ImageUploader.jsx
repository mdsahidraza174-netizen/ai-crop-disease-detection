import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud, Camera, Image as ImageIcon, X,
  Loader2, Microscope, AlertCircle, Smartphone
} from "lucide-react";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const ACCEPTED_TYPES = { "image/jpeg": [], "image/png": [], "image/webp": [], "image/bmp": [] };

export default function ImageUploader({ onPredict, isLoading }) {
  const [preview, setPreview]     = useState(null);
  const [file, setFile]           = useState(null);
  const [error, setError]         = useState(null);
  const [uploadPct, setUploadPct] = useState(0);
  const cameraRef                  = useRef(null);

  // ── File processing ───────────────────────────────────────────
  const processFile = useCallback((f) => {
    setError(null);
    if (!f.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, or WebP).");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 15 MB.");
      return;
    }
    const url = URL.createObjectURL(f);
    setPreview(url);
    setFile(f);
    setUploadPct(0);
  }, []);

  const onDrop = useCallback(
    (accepted, rejected) => {
      if (rejected.length > 0) {
        const r = rejected[0].errors[0];
        setError(r?.message || "File rejected. Check format and size.");
        return;
      }
      if (accepted[0]) processFile(accepted[0]);
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled: isLoading,
  });

  const handleCameraCapture = (e) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = "";
  };

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    setError(null);
    setUploadPct(0);
  };

  const handleAnalyze = () => {
    if (file && onPredict) {
      onPredict(file, setUploadPct);
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">

      {/* Drop zone / preview */}
      <AnimatePresence mode="wait">
        {!preview ? (
          /* ── Empty drop zone ── */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            <div
              {...getRootProps()}
              className={`upload-zone rounded-3xl p-8 sm:p-14 cursor-pointer
                          flex flex-col items-center justify-center gap-6 min-h-[280px]
                          ${isDragActive ? "active" : ""}
                          ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input {...getInputProps()} />

              {/* Upload icon */}
              <motion.div
                animate={{ y: isDragActive ? -6 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: isDragActive
                      ? "linear-gradient(135deg, #2D7D3A 0%, #3D9A3F 100%)"
                      : "var(--green-50)",
                    border: `2px solid ${isDragActive ? "#3D9A3F" : "var(--green-200)"}`,
                    transition: "all 0.2s ease",
                  }}
                >
                  <UploadCloud
                    className="w-8 h-8"
                    style={{ color: isDragActive ? "#ffffff" : "var(--green-600)" }}
                  />
                </div>
              </motion.div>

              {/* Text */}
              <div className="text-center space-y-1.5">
                <p className="font-display text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  {isDragActive ? "Release to upload" : "Upload a leaf image"}
                </p>
                <p className="text-sm font-body" style={{ color: "var(--text-light)" }}>
                  Drag & drop, or click to browse · JPEG, PNG, WebP · Max 15 MB
                </p>
              </div>

              {/* Supported crops chips */}
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  
                ].map((c) => (
                  <span
                    key={c.label}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text-body)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <span>{c.emoji}</span> {c.label}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── Preview card ── */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl overflow-hidden"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {/* Image */}
            <div className="relative">
              <img
                src={preview}
                alt="Uploaded crop leaf"
                className="w-full max-h-[380px] object-contain"
                style={{ background: "var(--surface-alt)" }}
              />

              {/* Scan overlay during loading */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    key="scan"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "rgba(247,249,244,0.65)" }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(61,154,63,0.08) 1px, transparent 1px)," +
                          "linear-gradient(90deg, rgba(61,154,63,0.08) 1px, transparent 1px)",
                        backgroundSize: "36px 36px",
                      }}
                    />
                    <motion.div
                      className="scan-line"
                      initial={{ top: "0%" }}
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      style={{ position: "absolute", width: "100%" }}
                    />
                    {[
                      "top-3 left-3 border-t-2 border-l-2",
                      "top-3 right-3 border-t-2 border-r-2",
                      "bottom-3 left-3 border-b-2 border-l-2",
                      "bottom-3 right-3 border-b-2 border-r-2",
                    ].map((cls, i) => (
                      <div
                        key={i}
                        className={`absolute w-5 h-5 ${cls}`}
                        style={{ borderColor: "var(--green-500)" }}
                      />
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="flex items-center gap-2 px-4 py-2 rounded-full font-body text-sm font-medium"
                        style={{
                          background: "var(--surface)",
                          boxShadow: "var(--shadow-md)",
                          border: "1px solid var(--border)",
                          color: "var(--green-700)",
                        }}
                      >
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--green-500)" }} />
                        Analysing…
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Clear button */}
              {!isLoading && (
                <button
                  onClick={clearImage}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-sm)",
                    color: "var(--text-muted)",
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* File info bar */}
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ borderTop: "1px solid var(--border)", background: "var(--surface-alt)" }}
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                <span className="text-sm font-body truncate max-w-[200px]" style={{ color: "var(--text-body)" }}>
                  {file?.name}
                </span>
              </div>
              <span className="text-xs font-mono" style={{ color: "var(--text-light)" }}>
                {file ? (file.size / 1024).toFixed(1) + " KB" : ""}
              </span>
            </div>

            {/* Upload progress bar */}
            {isLoading && uploadPct > 0 && uploadPct < 100 && (
              <div style={{ height: "3px", background: "var(--border)" }}>
                <motion.div
                  style={{ height: "100%", background: "var(--green-500)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadPct}%` }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)" }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "var(--red)" }} />
            <p className="text-sm font-body" style={{ color: "var(--red)" }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* FIX: Camera capture — labeled as mobile-only so desktop users
              aren't confused by a button that just opens a file picker.
              The Smartphone icon + tooltip make the intent clear.       */}
        <label
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl
                      font-body font-medium text-sm cursor-pointer transition-all duration-200
                      ${isLoading ? "opacity-40 pointer-events-none" : ""}`}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-body)",
            boxShadow: "var(--shadow-sm)",
          }}
          title="Opens camera on mobile devices"
        >
          <Smartphone className="w-4 h-4" style={{ color: "var(--text-light)" }} />
          <Camera className="w-4 h-4" />
          <span>Take Photo</span>
          {/* FIX: input inside label — hidden via `label > input[type="file"]`
                rule in index.css (targeted, not global)                  */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            ref={cameraRef}
            disabled={isLoading}
          />
        </label>

        {/* Analyse button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleAnalyze}
          disabled={!file || isLoading}
          className={`flex-[2] flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl
                      font-body font-semibold text-sm transition-all duration-200
                      ${file && !isLoading ? "btn-primary cursor-pointer" : "cursor-not-allowed"}`}
          style={
            !file || isLoading
              ? { background: "var(--border)", color: "var(--text-light)" }
              : {}
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analysing Crop…
            </>
          ) : (
            <>
              <Microscope className="w-4 h-4" />
              Analyse Disease
            </>
          )}
        </motion.button>
      </div>

      {/* FIX: Helper hint shown when no image is selected — guides users
            who click the disabled button and wonder why nothing happens  */}
      <AnimatePresence>
        {!file && !isLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-xs font-body"
            style={{ color: "var(--text-light)" }}
          >
            Upload or capture a leaf image above to enable analysis
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}