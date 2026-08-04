"use client";

function spanFor(indexInPattern) {
  if (indexInPattern === 0) return "col-span-2 row-span-2";
  return "col-span-1 row-span-1";
}

export default function SkeletonGrid({ count = 9 }) {
  return (
    <div className="grid auto-rows-[130px] grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => {
        const span = spanFor(i % 5);
        return (
          <div
            key={i}
            className={`${span} animate-pulse overflow-hidden rounded-2xl bg-white ring-1 ring-black/5`}
          >
            <div className="h-full w-full bg-gradient-to-br from-teal-50 to-canvas" />
          </div>
        );
      })}
    </div>
  );
}