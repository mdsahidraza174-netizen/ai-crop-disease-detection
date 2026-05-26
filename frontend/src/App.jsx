import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Header from "./components/Header";
import ImageUploader from "./components/ImageUploader";
import LoadingAnimation from "./components/LoadingAnimation";
import PredictionCard from "./components/PredictionCard";
import Footer from "./components/Footer";
import { checkHealth, predictDisease } from "./api/api";

// ── Application states ────────────────────────────────────────────
const STATE = {
  IDLE: "idle",
  LOADING: "loading",
  RESULT: "result",
  ERROR: "error",
};

export default function App() {
  const [appState, setAppState]   = useState(STATE.IDLE);
  const [result, setResult]       = useState(null);
  const [errorMsg, setErrorMsg]   = useState(null);
  const [apiStatus, setApiStatus] = useState("checking"); // checking | online | offline

  // ── Health check on mount ─────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        await checkHealth();
        if (mounted) setApiStatus("online");
      } catch {
        if (mounted) setApiStatus("offline");
      }
    };
    poll();
    const interval = setInterval(poll, 30000); // poll every 30s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // ── Predict handler ───────────────────────────────────────────
  const handlePredict = useCallback(async (file, setUploadPct) => {
    setAppState(STATE.LOADING);
    setErrorMsg(null);
    setResult(null);

    try {
      const data = await predictDisease(file, setUploadPct);
      setResult(data);
      setAppState(STATE.RESULT);
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      setAppState(STATE.ERROR);
    }
  }, []);

  // ── Reset ─────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setAppState(STATE.IDLE);
    setResult(null);
    setErrorMsg(null);
  }, []);

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-mesh min-h-screen relative overflow-x-hidden">
      {/* Decorative botanical leaf shapes — purely visual */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Large soft circle top-right */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #3D9A3F, transparent 70%)" }}
        />
        {/* Small accent bottom-left */}
        <div
          className="absolute -bottom-24 -left-24 w-[320px] h-[320px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #2D7D3A, transparent 70%)" }}
        />
        {/* Floating leaf SVG shapes */}
        {[
          { top: "8%",  left: "4%",  size: 40, rotate: 15,  opacity: 0.12 },
          { top: "18%", left: "92%", size: 28, rotate: -30, opacity: 0.09 },
          { top: "60%", left: "96%", size: 34, rotate: 45,  opacity: 0.08 },
          { top: "82%", left: "3%",  size: 24, rotate: -15, opacity: 0.10 },
        ].map((leaf, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ top: leaf.top, left: leaf.left }}
            animate={{ y: [0, -10, 0], rotate: [leaf.rotate, leaf.rotate + 5, leaf.rotate] }}
            transition={{ duration: 7 + i * 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 1.2 }}
          >
            <svg width={leaf.size} height={leaf.size} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6 2 2 8 2 14c0 4 2.5 7 6 8 1-3 3-5 5-6-2 1-4 3-4 6h2c0-3 2-5 4-6s4 0 6-2c2-2 2-6 0-8-2-2-6-4-9-4z"
                fill="#3D9A3F"
                opacity={leaf.opacity}
              />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <Header apiStatus={apiStatus} />

        {/* FIX: Persistent offline banner — shown across ALL states, not
              just IDLE. Prevents silent failures when the user uploads an
              image and clicks Analyse while the backend is unreachable.
              Dismissed automatically once the backend comes back online.  */}
        <AnimatePresence>
          {apiStatus === "offline" && appState !== STATE.ERROR && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 flex items-start gap-3 px-4 py-3.5 rounded-2xl max-w-2xl mx-auto"
              style={{ background: "var(--red-bg)", border: "1px solid var(--red-border)" }}
            >
              <span className="text-base mt-0.5">⚠️</span>
              <p className="text-sm font-body" style={{ color: "var(--red)" }}>
                Backend server is offline. Start the FastAPI server on{" "}
                <code className="font-mono text-xs px-1.5 py-0.5 rounded-md bg-red-100 text-red-700">
                  localhost:8000
                </code>{" "}
                before analysing.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content area */}
        <main className="mt-6 pb-4">
          <AnimatePresence mode="wait">

            {/* ── IDLE: show uploader ── */}
            {appState === STATE.IDLE && (
              <motion.div
                key="uploader"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
              >
                <ImageUploader onPredict={handlePredict} isLoading={false} />
              </motion.div>
            )}

            {/* ── LOADING ── */}
            {appState === STATE.LOADING && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
              >
                <LoadingAnimation />
              </motion.div>
            )}

            {/* ── RESULT ── */}
            {appState === STATE.RESULT && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
              >
                <PredictionCard result={result} onReset={handleReset} />
              </motion.div>
            )}

            {/* ── ERROR ── */}
            {appState === STATE.ERROR && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-2xl mx-auto"
              >
                <div className="card-elevated p-10 text-center space-y-5">
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl"
                       style={{ background: "var(--red-bg)" }}>
                    🌿
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-semibold" style={{ color: "var(--red)" }}>
                      Analysis Failed
                    </h3>
                    <p className="text-sm font-body max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
                      {errorMsg}
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-body font-semibold transition-all duration-200"
                    style={{
                      background: "var(--green-50)",
                      color: "var(--green-700)",
                      border: "1px solid var(--green-200)",
                    }}
                  >
                    Try Again
                  </motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}