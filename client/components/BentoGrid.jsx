"use client";

import Link from "next/link";
import PropertyCard from "./PropertyCard";
import { DEMO_PROPERTIES } from "../lib/demoData";

// Repeating 5-item pattern: one large tile, four regular tiles.
// grid-flow-dense lets the smaller tiles fill in around the large one.
function spanFor(indexInPattern) {
  if (indexInPattern === 0) return "col-span-2 row-span-2";
  return "col-span-1 row-span-1";
}

export default function BentoGrid({ properties, onWidenRadius, radiusKm }) {
  const hasReal = properties?.length > 0;
  const list = hasReal ? properties : DEMO_PROPERTIES;

  return (
    <div>
      {!hasReal && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-dashed border-black/10 bg-white/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">No properties found within {radiusKm} km yet</p>
            <p className="mt-0.5 text-xs text-ink/50">Showing sample listings below so you can see how it looks.</p>
          </div>
          <div className="flex items-center gap-3">
            {onWidenRadius && radiusKm < 3 && (
              <button
                onClick={onWidenRadius}
                className="whitespace-nowrap rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-800"
              >
                Widen radius to {Math.min(3, radiusKm + 0.5)} km
              </button>
            )}
            <Link
              href="/list-property"
              className="whitespace-nowrap rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-ink transition hover:bg-canvas"
            >
              List your property
            </Link>
          </div>
        </div>
      )}

      <div className="grid auto-rows-[130px] grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {list.map((p, i) => {
          const patternIndex = i % 5;
          const span = spanFor(patternIndex);
          const size = patternIndex === 0 ? "lg" : "sm";
          return (
            <div key={p._id} className={span}>
              <PropertyCard property={p} size={size} delay={i * 60} demo={!hasReal} />
            </div>
          );
        })}
      </div>
    </div>
  );
}