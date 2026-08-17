"use client";

import Link from "next/link";
import PropertyCard from "./PropertyCard";

// Repeating 5-item pattern: one large tile, four regular tiles.
// grid-flow-dense lets the smaller tiles fill in around the large one.
function spanFor(indexInPattern) {
  if (indexInPattern === 0) return "col-span-2 row-span-2";
  return "col-span-1 row-span-1";
}

export default function BentoGrid({ properties, onWidenRadius, radiusKm }) {
  const hasReal = properties?.length > 0;

  if (!hasReal) {
    return (
      <div className="flex flex-col items-center gap-3 py-14 text-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-ink/30">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="text-sm font-semibold text-ink">Property not found</p>
        <p className="max-w-xs text-xs text-ink/50">
          We couldn&rsquo;t find any listings within {radiusKm} km that match your search.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {onWidenRadius && radiusKm < 3 && (
            <button
              onClick={onWidenRadius}
              className="whitespace-nowrap rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-800"
            >
              Widen radius to {Math.min(3, radiusKm + 0.5)} km
            </button>
          )}
          <Link
            href="/host/new"
            className="whitespace-nowrap rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-ink transition hover:bg-canvas"
          >
            List your property
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid auto-rows-[130px] grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {properties.map((p, i) => {
        const patternIndex = i % 5;
        const span = spanFor(patternIndex);
        const size = patternIndex === 0 ? "lg" : "sm";
        return (
          <div key={p._id} className={span}>
            <PropertyCard property={p} size={size} delay={i * 60} demo={false} />
          </div>
        );
      })}
    </div>
  );
}