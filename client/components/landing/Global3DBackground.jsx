"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const SplineMiniHome3D = dynamic(() => import("./SplineMiniHome3D"), {
  ssr: false,
  loading: () => null,
});

export default function Global3DBackground() {
  const [activeRoom, setActiveRoom] = useState("all");
  const [isNight, setIsNight] = useState(false);

  return (
    <>
      {/* 1. PERSISTENT FIXED 3D WEBGL CANVAS BACKGROUND LAYER (Z-0) */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-auto">
        <SplineMiniHome3D activeRoom={activeRoom} isNight={isNight} />

        {/* Light Vignette Ambient Overlay for Text Readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-teal-950/40 via-transparent to-teal-950/50" />
      </div>

      {/* 2. FIXED FLOATING ROOM NAVBAR (PAGE-WIDE ACCESSIBLE Z-30) */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto w-full max-w-2xl px-3">
        <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto py-2 px-3.5 rounded-2xl bg-teal-950/85 border border-white/20 backdrop-blur-2xl shadow-2xl no-scrollbar">
          {[
            { id: "all", label: "🏠 House" },
            { id: "living", label: "🛋️ Living" },
            { id: "kitchen", label: "🍳 Kitchen" },
            { id: "bedroom", label: "🛏️ Bed" },
            { id: "garden", label: "🏊 Pool & Garden" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveRoom(btn.id)}
              className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                activeRoom === btn.id
                  ? "bg-coral-500 text-white shadow-lg ring-1 ring-coral-300 scale-105"
                  : "text-teal-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              {btn.label}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-white/20 mx-1 flex-none" />

          {/* Integrated Day/Night Mode Toggle */}
          <button
            onClick={() => setIsNight(!isNight)}
            className="whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold text-amber-300 bg-white/10 hover:bg-white/20 transition flex-none border border-white/15"
          >
            {isNight ? "🌙 Night" : "☀️ Day"}
          </button>
        </div>
      </div>
    </>
  );
}
