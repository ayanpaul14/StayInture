"use client";

const CATEGORIES = [
  { value: "", label: "All", icon: null },
  { value: "flat", label: "Flat / Apartment", icon: "🏢" },
  { value: "bungalow", label: "Bungalow", icon: "🏡" },
  { value: "pg", label: "PG", icon: "🛏️" },
];

export default function CategoryChips({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => {
        const active = value === c.value;
        return (
          <button
            key={c.value}
            onClick={() => onChange(c.value)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              active
                ? "bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                : "bg-teal-50 text-teal-800 hover:bg-teal-100"
            }`}
          >
            {c.icon && <span className="text-xs">{c.icon}</span>}
            {c.label}
          </button>
        );
      })}
    </div>
  );
}