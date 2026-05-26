import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

const steps = [
  "Preprocessing image…",
  "Extracting features…",
  "Running CNN inference…",
  "Mapping to disease database…",
  "Preparing results…",
];

// ── FIX: Proper neural network node layout with actual inter-layer
//         edges instead of flat horizontal lines through y=30.
//         Nodes are arranged in columns; edges connect each node in
//         one layer to each node in the next layer.                 ──
const LAYERS = [
  [12, 24, 36],          // layer 0 — 3 nodes
  [18, 30],              // layer 1 — 2 nodes
  [12, 24, 36],          // layer 2 — 3 nodes
  [18, 30],              // layer 3 — 2 nodes
  [12, 24, 36],          // layer 4 — 3 nodes
];
const LAYER_X = [30, 90, 150, 210, 270];

function NeuralNetSVG() {
  const edges = [];
  for (let li = 0; li < LAYERS.length - 1; li++) {
    const fromX = LAYER_X[li];
    const toX   = LAYER_X[li + 1];
    for (const fy of LAYERS[li]) {
      for (const ty of LAYERS[li + 1]) {
        edges.push({ fromX, fromY: fy, toX, toY: ty, key: `${li}-${fy}-${ty}` });
      }
    }
  }

  return (
    <svg viewBox="0 0 300 48" className="w-full max-w-[280px] mx-auto">
      {/* Edges */}
      {edges.map((e, i) => (
        <motion.line
          key={e.key}
          x1={e.fromX} y1={e.fromY} x2={e.toX} y2={e.toY}
          stroke="var(--green-300)"
          strokeWidth={0.7}
          animate={{ opacity: [0.08, 0.4, 0.08] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: (i % 5) * 0.18 }}
        />
      ))}
      {/* Nodes */}
      {LAYERS.map((ys, li) =>
        ys.map((y, ki) => (
          <motion.circle
            key={`${li}-${ki}`}
            cx={LAYER_X[li]}
            cy={y}
            r={3.5}
            fill="var(--green-500)"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: li * 0.2 + ki * 0.1 }}
          />
        ))
      )}
    </svg>
  );
}

export default function LoadingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        className="rounded-3xl p-8 sm:p-12 text-center space-y-8"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Animated icon cluster */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Outer ripple */}
            <motion.div
              animate={{ scale: [1, 1.8, 1], opacity: [0.15, 0, 0.15] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 rounded-full"
              style={{ background: "var(--green-200)" }}
            />
            {/* Mid ripple */}
            <motion.div
              animate={{ scale: [1, 1.45, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
              className="absolute inset-0 rounded-full"
              style={{ background: "var(--green-200)" }}
            />
            {/* Center */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #2D7D3A 0%, #3D9A3F 100%)",
                boxShadow: "var(--shadow-md-green)",
              }}
            >
              <Leaf className="w-7 h-7 text-white" />
            </motion.div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <p className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            AI Analysing Your Crop
          </p>
          <p className="text-sm font-body" style={{ color: "var(--text-muted)" }}>
            Deep learning model is processing the image…
          </p>
        </div>

        {/* Progress steps */}
        <div className="max-w-xs mx-auto space-y-3">
          {steps.map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.5, duration: 0.4 }}
              className="flex items-center gap-3 text-left"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.5 + 0.2, type: "spring", stiffness: 300 }}
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--green-50)", border: "1.5px solid var(--green-300)" }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--green-500)" }}
                />
              </motion.div>
              <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>

        {/* FIX: replaced broken flat-line SVG with proper layered neural
              network showing diagonal edges between node columns       */}
        <div className="pt-2 opacity-30">
          <NeuralNetSVG />
        </div>
      </div>
    </motion.div>
  );
}