"use client";

import Link from "next/link";
import PropertyCard from "./PropertyCard";

// Repeating 5-item pattern: one large tile, four regular tiles.
// grid-flow-dense lets the smaller tiles fill in around the large one.
function spanFor(indexInPattern) {
  if (indexInPattern === 0) return "col-span-2 row-span-2";
  return "col-span-1 row-span-1";
}

export default function BentoGrid({ properties, onWidenRadius, radiusKm, onBookProperty }) {
  const list = properties || [];
  const hasItems = list.length > 0;

  return (
    <div>
      {!hasItems ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-black/10 bg-white p-12 text-center shadow-sm">
          <div className="h-12 w-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-lg">
            🏠
          </div>
          <div>
            <p className="text-base font-bold text-ink">No properties found within {radiusKm} km</p>
            <p className="mt-1 text-xs text-ink/50 max-w-sm">
              Be the first to host a stay in this location or expand your search radius!
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            {onWidenRadius && radiusKm < 25 && (
              <button
                onClick={onWidenRadius}
                className="whitespace-nowrap rounded-full bg-teal-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-teal-700 shadow-sm"
              >
                Expand radius to {Math.min(25, radiusKm + 5)} km
              </button>
            )}
            <Link
              href="/host/new"
              className="whitespace-nowrap rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-bold text-ink transition hover:bg-slate-50"
            >
              + List your property
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid auto-rows-[130px] grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {list.map((p, i) => {
            const patternIndex = i % 5;
            const span = spanFor(patternIndex);
            const size = patternIndex === 0 ? "lg" : "sm";
            return (
              <div key={p._id} className={span}>
                <PropertyCard property={p} size={size} delay={i * 60} demo={false} onBook={onBookProperty} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}