"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Global3DBackground() {
  const [isNight, setIsNight] = useState(false);

  return (
    <>
      {/* 1. PERSISTENT FIXED REAL BUNGALOW BACKGROUND IMAGE LAYER (Z-0) */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative w-full h-full"
        >
          <Image
            src="/images/bungalow_2.jpg"
            alt="Modern Flat Bungalow"
            fill
            priority
            quality={90}
            className={`object-cover object-center transition-all duration-700 ${
              isNight ? "brightness-[0.45] contrast-125 saturate-90" : "brightness-[0.7] contrast-110"
            }`}
          />
        </motion.div>

        {/* Ambient Dark Gradient Overlay for Maximum Readability */}
        <div
          className={`absolute inset-0 transition-colors duration-700 ${
            isNight
              ? "bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90 backdrop-blur-[1px]"
              : "bg-gradient-to-b from-teal-950/70 via-black/40 to-teal-950/85"
          }`}
        />

        {/* Radial Center Highlight Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/60 pointer-events-none" />
      </div>

      {/* 2. COMPACT FIXED DAY/NIGHT MOOD TOGGLE BUTTON (Z-30) */}
      <div className="fixed bottom-5 right-5 z-30 pointer-events-auto">
        <button
          onClick={() => setIsNight(!isNight)}
          className="flex items-center gap-2 rounded-full bg-teal-950/85 border border-white/20 px-4 py-2.5 text-xs font-bold text-amber-300 backdrop-blur-xl shadow-2xl transition hover:bg-teal-900 active:scale-95 cursor-pointer"
          aria-label="Toggle Day/Night View"
        >
          <span>{isNight ? "🌙 Night Mood" : "☀️ Day View"}</span>
        </button>
      </div>
    </>
  );
}

