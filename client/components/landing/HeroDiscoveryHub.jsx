"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const SplineMiniHome3D = dynamic(() => import("./SplineMiniHome3D"), {
  ssr: false,
  loading: () => null,
});

export default function HeroDiscoveryHub() {
  const [activeRoom, setActiveRoom] = useState("all");
  const [isNight, setIsNight] = useState(false);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* 1. FULL-SCREEN 3D WEBGL CANVAS BACKGROUND */}
      <SplineMiniHome3D activeRoom={activeRoom} isNight={isNight} />

      {/* Subtle Lighter Gradient Overlay for Contrast & Readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-teal-950/85 via-teal-950/20 to-teal-950/40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-teal-950/85 via-teal-950/25 to-transparent" />

      {/* 2. ULTRA-MINIMALIST SMALL FLOATING ROOM NAVBAR (NO OUTSIDE BOX) */}
      <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-full max-w-xl px-2">
        <div className="flex items-center justify-center gap-1 overflow-x-auto py-1 px-1 no-scrollbar">
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
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium transition-all backdrop-blur-md ${
                activeRoom === btn.id
                  ? "bg-coral-500 text-white shadow-md ring-1 ring-coral-300 scale-105"
                  : "bg-black/40 text-teal-100/90 hover:bg-black/60 hover:text-white"
              }`}
            >
              {btn.label}
            </button>
          ))}

          {/* Integrated Day/Night Lighting Mode Pill */}
          <button
            onClick={() => setIsNight(!isNight)}
            className="whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium text-amber-300 bg-black/40 hover:bg-black/60 backdrop-blur-md transition"
          >
            {isNight ? "🌙 Night" : "☀️ Day"}
          </button>
        </div>
      </div>
    </div>
  );
}
