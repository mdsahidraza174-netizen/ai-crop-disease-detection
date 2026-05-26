import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export default function Footer() {
return (
<motion.footer
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.6 }}
className="mt-16 pb-10"
>
{/* Top divider */} <div className="divider mb-8" />

  {/* Bottom bar */}
  <div
    className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body pt-4"
    style={{
      color: "var(--text-light)",
      borderTop: "1px solid var(--border)",
    }}
  >
    {/* Brand section */}
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{
          background: "var(--green-50)",
          border: "1px solid var(--green-200)",
        }}
      >
        <Leaf
          className="w-4 h-4"
          style={{ color: "var(--green-700)" }}
        />
      </div>

      <div>
        <p
          className="font-semibold text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          KrishakMitram AI
        </p>

        <p
          className="text-[11px]"
          style={{ color: "var(--text-light)" }}
        >
          Smart Crop Disease Detection Platform
        </p>
      </div>
    </div>

    {/* AI Info */}
    <div className="flex items-center gap-3 flex-wrap justify-center">
      <span
        className="px-3 py-1 rounded-full text-[10px] font-medium"
        style={{
          background: "var(--green-50)",
          color: "var(--green-700)",
          border: "1px solid var(--green-200)",
        }}
      >
        Powerful CNN trained on 15K+ crop disease images
      </span>
    </div>
  </div>

  {/* Copyright */}
  <p
    className="text-center text-[12px] font-body mt-8"
    style={{
      color: "var(--text-light)",
      opacity: 0.7,
      letterSpacing: "0.3px",
    }}
  >
    © 2026 KrishakMitram AI. All rights reserved by MD SAHID RAZA,Y VARUN, ARYAN JAISWAL.
  </p>
</motion.footer>


);
}

