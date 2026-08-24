"use client";

export default function RadiusSlider({ value, onChange }) {
  const min = 1;
  const max = 25;
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="flex min-w-[220px] items-center gap-3">
      <span className="whitespace-nowrap text-sm text-ink/60">
        Radius: <span className="font-semibold text-ink">{value} km</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, #4C8577 ${pct}%, #E9EFEE ${pct}%)`,
        }}
        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full accent-teal-600"
      />
    </div>
  );
}