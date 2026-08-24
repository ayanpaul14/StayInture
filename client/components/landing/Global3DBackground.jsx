"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const SplineMiniHome3D = dynamic(() => import("./SplineMiniHome3D"), {
  ssr: false,
  loading: () => null,
});

export default function Global3DBackground() {
  const [isNight, setIsNight] = useState(false);

  return (
    <>
      {/* 1. PERSISTENT FIXED 3D WEBGL CANVAS BACKGROUND LAYER (Z-0) */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-auto">
        <SplineMiniHome3D activeRoom="all" isNight={isNight} />

        {/* Light Vignette Ambient Overlay for Text Readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-teal-950/40 via-transparent to-teal-950/50" />
      </div>

      {/* 2. COMPACT FIXED DAY/NIGHT TOGGLE BUTTON (Z-30) */}
      <div className="fixed bottom-5 right-5 z-30 pointer-events-auto">
        <button
          onClick={() => setIsNight(!isNight)}
          className="flex items-center gap-2 rounded-full bg-teal-950/85 border border-white/20 px-4 py-2.5 text-xs font-bold text-amber-300 backdrop-blur-xl shadow-2xl transition hover:bg-teal-900 active:scale-95"
          aria-label="Toggle Day/Night Mode"
        >
          <span>{isNight ? "🌙 Night Mode" : "☀️ Day Mode"}</span>
        </button>
      </div>
    </>
  );
}
