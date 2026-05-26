import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, AlertTriangle, XCircle, Zap,
  Stethoscope, Syringe, Shield, ChevronRight,
  BarChart3, Clock, RefreshCw, Info, Sprout
} from "lucide-react";
import { useState } from "react";

// ── Severity helpers ──────────────────────────────────────────────
const SEVERITY_CONFIG = {
  none:     { label: "Healthy",   badgeClass: "badge-healthy",  Icon: CheckCircle2, color: "#2D7D3A", barColor: "#3D9A3F" },
  healthy:  { label: "Healthy",   badgeClass: "badge-healthy",  Icon: CheckCircle2, color: "#2D7D3A", barColor: "#3D9A3F" },
  moderate: { label: "Moderate",  badgeClass: "badge-moderate", Icon: AlertTriangle, color: "#92400E", barColor: "#D97706" },
  high:     { label: "High Risk", badgeClass: "badge-high",     Icon: AlertTriangle, color: "#C47A1E", barColor: "#F59E0B" },
  critical: { label: "Critical",  badgeClass: "badge-critical", Icon: XCircle,       color: "#C0352B", barColor: "#EF4444" },
};

function getSeverityConfig(severity) {
  return SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.moderate;
}

// ── Confidence bar ────────────────────────────────────────────────
function ConfidenceBar({ confidence }) {
  const barColor =
    confidence >= 80 ? "#3D9A3F" :
    confidence >= 60 ? "#D97706" :
    confidence >= 40 ? "#F59E0B" : "#EF4444";

  const glowClass =
    confidence >= 80 ? "bar-glow-green" :
    confidence >= 50 ? "bar-glow-yellow" : "bar-glow-red";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-body font-semibold uppercase tracking-wider" style={{ color: "var(--text-light)" }}>
          Confidence
        </span>
        <span className="font-mono text-xl font-bold" style={{ color: barColor }}>
          {confidence.toFixed(1)}%
        </span>
      </div>

      {/* Track */}
      <div
        className="h-2.5 rounded-full overflow-hidden"
        style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className={`h-full rounded-full ${glowClass}`}
          style={{ backgroundColor: barColor }}
        />
      </div>

      {confidence < 40 && (
        <p className="text-xs font-body flex items-center gap-1.5" style={{ color: "var(--amber)" }}>
          <Info className="w-3 h-3" />
          Low confidence — try a clearer, better-lit image of the leaf
        </p>
      )}
    </div>
  );
}

// ── Top-3 predictions ─────────────────────────────────────────────
function Top3({ top3 }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-body font-semibold uppercase tracking-wider" style={{ color: "var(--text-light)" }}>
        Top Predictions
      </p>
      {top3.map((item, i) => {
        const label = item.class
          .replace(/___/g, " — ")
          .replace(/_/g, " ")
          .replace(/Sugarcane /g, "Sugarcane — ");
        return (
          <div key={i} className="flex items-center gap-3">
            <span
              className="text-xs font-mono font-semibold w-4 shrink-0"
              style={{ color: i === 0 ? "var(--green-600)" : "var(--text-light)" }}
            >
              {i + 1}
            </span>
            <div
              className="flex-1 h-2 rounded-full overflow-hidden"
              style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.confidence}%` }}
                transition={{ duration: 0.9, delay: i * 0.15, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: i === 0
                    ? "linear-gradient(90deg, #2D7D3A, #3D9A3F)"
                    : "var(--green-200)",
                }}
              />
            </div>
            <span className="text-xs font-mono w-12 text-right shrink-0" style={{ color: "var(--text-body)" }}>
              {item.confidence.toFixed(1)}%
            </span>
            {/* FIX: removed fixed max-w-[110px]/[160px] that was cutting off disease
                  names. Using flex-1 + min-w-0 + truncate lets the row reflow
                  naturally and shows as much of the label as space allows.     */}
            <span
              className="text-xs font-body flex-1 min-w-0 truncate"
              style={{ color: i === 0 ? "var(--text-primary)" : "var(--text-muted)" }}
              title={label}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Info section (accordion) ──────────────────────────────────────
function InfoSection({ icon: Icon, title, items, color = "#3D9A3F", bgColor = "#EEF4E8", borderColor = "#B5DA95" }) {
  const [expanded, setExpanded] = useState(true);

  if (!items || items.length === 0) return null;

  return (
    <motion.div
      layout
      className="overflow-hidden rounded-2xl"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 transition-colors duration-150"
        style={{ cursor: "pointer" }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--surface-alt)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
          <span className="font-body font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            {title}
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium"
            style={{ backgroundColor: bgColor, color, border: `1px solid ${borderColor}` }}
          >
            {items.length}
          </span>
        </div>
        <ChevronRight
          className="w-4 h-4 transition-transform duration-200"
          style={{
            color: "var(--text-light)",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div style={{ borderTop: "1px solid var(--border)" }}>
              <ul className="px-5 py-4 space-y-2.5">
                {items.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-3 text-sm font-body leading-relaxed"
                    style={{ color: "var(--text-body)" }}
                  >
                    <span
                      className="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main PredictionCard ───────────────────────────────────────────
export default function PredictionCard({ result, onReset }) {
  if (!result) return null;

  const { disease_info, confidence, top3_predictions, inference_time_ms, low_confidence_warning } =
    result;

  const severity  = disease_info?.severity || "moderate";
  const sevConfig = getSeverityConfig(severity);
  const SevIcon   = sevConfig.Icon;
  const isHealthy = disease_info?.status === "healthy";

  const cropName    = disease_info?.crop    || "Unknown Crop";
  const diseaseName = disease_info?.disease || "Unknown";

  const staggerChildren = {
    animate: { transition: { staggerChildren: 0.07 } },
  };
  const fadeUp = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-2xl mx-auto space-y-4"
    >

      {/* ── Result hero card ─── */}
      <motion.div
        variants={staggerChildren}
        initial="initial"
        animate="animate"
        className="rounded-3xl overflow-hidden"
        style={{
          background: "var(--surface)",
          border: isHealthy ? "1px solid var(--green-200)" : "1px solid var(--border)",
          // FIX: was referencing var(--shadow-md-green) which was missing —
          //      now defined in index.css so this renders correctly
          boxShadow: isHealthy ? "var(--shadow-md-green)" : "var(--shadow-md)",
        }}
      >
        {/* Coloured top accent strip */}
        <div
          className="h-1.5 w-full"
          style={{
            background: isHealthy
              ? "linear-gradient(90deg, #2D7D3A, #3D9A3F)"
              : `linear-gradient(90deg, ${sevConfig.barColor}aa, ${sevConfig.barColor})`,
          }}
        />

        <div className="p-5 sm:p-7 space-y-6">
          {/* Crop + disease row */}
          <motion.div variants={fadeUp} className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-2">
                <Sprout className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--green-500)" }} />
                <span
                  className="text-[11px] font-body font-semibold uppercase tracking-widest"
                  style={{ color: "var(--text-light)" }}
                >
                  Crop Identified
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                {cropName}
              </h2>
              <p className="font-body font-semibold text-base" style={{ color: sevConfig.color }}>
                {diseaseName}
              </p>
            </div>

            {/* Severity badge */}
            <div className="shrink-0 flex flex-col items-end gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-semibold ${sevConfig.badgeClass}`}>
                <SevIcon className="w-3.5 h-3.5" />
                {sevConfig.label}
              </div>
              {isHealthy && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-body font-medium"
                  style={{ background: "var(--green-50)", color: "var(--green-700)", border: "1px solid var(--green-200)" }}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  No disease detected
                </div>
              )}
            </div>
          </motion.div>

          {/* Confidence bar */}
          <motion.div variants={fadeUp}>
            <ConfidenceBar confidence={confidence} />
          </motion.div>

          {/* Low-confidence warning */}
          {low_confidence_warning && (
            <motion.div
              variants={fadeUp}
              className="flex items-start gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "var(--amber-bg)", border: "1px solid var(--amber-border)" }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--amber)" }} />
              <p className="text-xs font-body leading-relaxed" style={{ color: "var(--amber)" }}>
                Low confidence prediction. Ensure the leaf is clearly visible, centred, and well-lit.
              </p>
            </motion.div>
          )}

          {/* Meta row */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center gap-4 pt-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {[
              { Icon: Clock,    text: `${inference_time_ms} ms` },
              { Icon: Zap,      text: "CNN inference" },
              { Icon: BarChart3, text: "17-class model" },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs font-mono" style={{ color: "var(--text-light)" }}>
                <Icon className="w-3.5 h-3.5" />
                {text}
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* FIX: guard against empty array — was rendering an empty card if
            the API returned top3_predictions: []                        */}
      {top3_predictions?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="rounded-3xl p-5"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Top3 top3={top3_predictions} />
        </motion.div>
      )}

      {/* ── Description ─── */}
      {disease_info?.description && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.23 }}
          className="rounded-2xl p-5"
          style={{
            background: "var(--surface-alt)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2 mb-2.5">
            <Info className="w-4 h-4" style={{ color: "var(--green-500)" }} />
            <span
              className="text-[11px] font-body font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-light)" }}
            >
              About this condition
            </span>
          </div>
          <p className="text-sm font-body leading-relaxed" style={{ color: "var(--text-body)" }}>
            {disease_info.description}
          </p>
        </motion.div>
      )}

      {/* ── Expandable info sections ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        {!isHealthy && (
          <InfoSection
            icon={Stethoscope}
            title="Symptoms"
            items={disease_info?.symptoms}
            color="#2D7D3A"
            bgColor="#EEF4E8"
            borderColor="#B5DA95"
          />
        )}

        {disease_info?.causes?.length > 0 && (
          <InfoSection
            icon={AlertTriangle}
            title="Causes"
            items={disease_info?.causes}
            color="#92400E"
            bgColor="#FFFBEB"
            borderColor="#FDE68A"
          />
        )}

        {disease_info?.cure?.length > 0 && (
          <InfoSection
            icon={Syringe}
            title="Treatment & Cure"
            items={disease_info?.cure}
            color="#1E5E28"
            bgColor="#EEF4E8"
            borderColor="#B5DA95"
          />
        )}

        <InfoSection
          icon={Shield}
          title="Prevention Tips"
          items={disease_info?.prevention}
          color="#1E40AF"
          bgColor="#EFF6FF"
          borderColor="#BFDBFE"
        />
      </motion.div>

      {/* ── Reset button ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="pt-1 pb-4"
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.01 }}
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl
                     font-body font-semibold text-sm transition-all duration-200"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-body)",
            boxShadow: "var(--shadow-sm)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "var(--green-300)";
            e.currentTarget.style.color = "var(--green-700)";
            e.currentTarget.style.background = "var(--green-50)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-body)";
            e.currentTarget.style.background = "var(--surface)";
          }}
        >
          <RefreshCw className="w-4 h-4" />
          Analyse Another Image
        </motion.button>
      </motion.div>
    </motion.div>
  );
}