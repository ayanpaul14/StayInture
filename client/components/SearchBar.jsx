"use client";

import { useEffect, useState } from "react";

export default function SearchBar({ value, onChange, placeholder = "Search by city or property name..." }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => onChange(draft), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <div className="group flex w-full items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 shadow-sm transition-all focus-within:border-teal-400 focus-within:shadow-md focus-within:shadow-teal-600/10">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="flex-none text-ink/35 transition group-focus-within:text-teal-600">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm text-ink outline-none placeholder:text-ink/40"
      />
      {draft && (
        <button
          onClick={() => setDraft("")}
          className="flex-none rounded-full px-2 py-1 text-xs font-medium text-ink/40 transition hover:bg-canvas hover:text-ink"
          aria-label="Clear search"
        >
          Clear
        </button>
      )}
    </div>
  );
}