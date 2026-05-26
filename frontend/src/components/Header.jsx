import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

// ── Status config ─────────────────────────────────────────────────
const STATUS = {
online:   { dot: "#3D9A3F", pulse: true,  label: "AI Model Online", bg: "#EEF4E8", border: "#B5DA95", text: "#1E5E28" },
offline:  { dot: "#C0352B", pulse: false, label: "Backend Offline", bg: "#FEF0EE", border: "#F4B2AC", text: "#9B1C1C" },
checking: { dot: "#C47A1E", pulse: true,  label: "Connecting…",     bg: "#FFFBEB", border: "#F0C878", text: "#78350F" },
};

export default function Header({ apiStatus }) {
const s = STATUS[apiStatus] || STATUS.checking;

return (
<motion.header
initial={{ opacity: 0, y: -24 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
className="relative z-10 pt-10 pb-8 text-center"
>
{/* Nav-style top bar */} <div className="flex items-center justify-between mb-10">
{/* Logo mark */}
<motion.div
initial={{ opacity: 0, x: -12 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: 0.1 }}
className="flex items-center gap-2"
>
<div
className="w-8 h-8 rounded-xl flex items-center justify-center"
style={{
background:
"linear-gradient(135deg, #2D7D3A 0%, #3D9A3F 100%)",
}}
> <Leaf className="w-4 h-4 text-white" /> </div>


      <span
        className="font-display font-semibold text-base"
        style={{ color: "var(--text-primary)" }}
      >
        KrishakMitram
      </span>
    </motion.div>

    {/* Status pill */}
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.25 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-body font-medium"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.text,
      }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{
          backgroundColor: s.dot,
          animation: s.pulse
            ? "pulse-dot 2s ease-in-out infinite"
            : "none",
        }}
      />
      {s.label}
    </motion.div>
  </div>

  {/* Hero section */}
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      delay: 0.15,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    }}
    className="space-y-6"
  >
    {/* Feature tag */}
    <div className="flex justify-center">
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body font-medium"
        style={{
          background: "var(--green-50)",
          color: "var(--green-700)",
          border: "1px solid var(--green-200)",
        }}
      >
        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
        AI Powered Detection System
      </div>
    </div>

    {/* Main heading */}
    <div>
      <h1
        className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        Crop Disease{" "}
        <span
          className="italic"
          style={{ color: "var(--green-600)" }}
        >
          Detection
        </span>
      </h1>
    </div>

    {/* Subtitle */}
    <p
      className="text-base sm:text-lg max-w-2xl mx-auto font-body leading-relaxed"
      style={{ color: "var(--text-muted)" }}
    >
      Upload a leaf image and get an instant AI diagnosis including
      disease name, confidence score, treatment suggestions, and
      prevention methods — all processed locally with deep learning.
    </p>

    {/* Professional info badges */}
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex flex-wrap items-center justify-center gap-3 pt-3"
    >
      <div
        className="px-4 py-2 rounded-full text-sm font-medium"
        style={{
          background: "var(--green-50)",
          color: "var(--green-700)",
          border: "1px solid var(--green-200)",
        }}
      >
        Advanced CNN Architecture
      </div>

      <div
        className="px-4 py-2 rounded-full text-sm font-medium"
        style={{
          background: "#ffffff",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        }}
      >
        Trained on 15K+ Crop Disease Images
      </div>

      <div
        className="px-4 py-2 rounded-full text-sm font-medium"
        style={{
          background: "var(--green-50)",
          color: "var(--green-700)",
          border: "1px solid var(--green-200)",
        }}
      >
        Fast & Accurate Local Detection
      </div>
    </motion.div>
  </motion.div>

  {/* Bottom divider */}
  <motion.div
    initial={{ scaleX: 0 }}
    animate={{ scaleX: 1 }}
    transition={{ delay: 0.5, duration: 0.5 }}
    className="divider mt-10"
  />
</motion.header>

);
}
