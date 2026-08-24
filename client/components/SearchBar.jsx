"use client";

import { useEffect, useState, useRef } from "react";

export default function SearchBar({ value = "", onChange, placeholder = "Search by city or property name...", autoFocus = false }) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    const timeout = setTimeout(() => onChange(draft), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="group flex w-full items-center gap-2.5 sm:gap-3 rounded-full border border-black/10 bg-white px-5 py-3 shadow-sm transition-all focus-within:border-teal-500 focus-within:shadow-md focus-within:shadow-teal-600/10 focus-within:ring-2 focus-within:ring-teal-500/20">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-none text-ink/35 transition group-focus-within:text-teal-600">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.5" />
        <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="w-full text-xs sm:text-sm text-ink outline-none placeholder:text-ink/40 bg-transparent"
      />
      {draft && (
        <button
          type="button"
          onClick={() => {
            setDraft("");
            onChange("");
          }}
          className="flex-none rounded-full px-2.5 py-1 text-xs font-medium text-ink/40 transition hover:bg-canvas hover:text-ink"
          aria-label="Clear search"
        >
          Clear
        </button>
      )}
    </div>
  );
}