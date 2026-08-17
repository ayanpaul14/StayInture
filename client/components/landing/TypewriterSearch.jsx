"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PHRASES = [
  "Search PG near Salt Lake...",
  "Search Flats near Newtown...",
  "Search Bungalows near Rajarhat...",
  "Search anything within 2km...",
];

export default function TypewriterSearch() {
  const router = useRouter();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const current = PHRASES[phraseIndex];
    const speed = deleting ? 28 : 45;

    const timeout = setTimeout(() => {
      if (!deleting) {
        if (placeholderText.length < current.length) {
          setPlaceholderText(current.slice(0, placeholderText.length + 1));
        } else {
          setTimeout(() => setDeleting(true), 1200);
        }
      } else {
        if (placeholderText.length > 0) {
          setPlaceholderText(current.slice(0, placeholderText.length - 1));
        } else {
          setDeleting(false);
          setPhraseIndex((i) => (i + 1) % PHRASES.length);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [placeholderText, deleting, phraseIndex]);

  function handleSearch() {
    const trimmed = query.trim();
    if (trimmed.length === 0) return;
    router.push(`/explore?q=${encodeURIComponent(trimmed)}`);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <div className="flex w-full max-w-md items-center gap-2 rounded-full bg-white/95 px-5 py-2 shadow-lg">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-none text-teal-600">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholderText}
        className="flex-1 bg-transparent text-sm text-ink/70 placeholder:text-ink/50 outline-none"
      />

      <button
        type="button"
        onClick={handleSearch}
        aria-label="Search"
        className="flex-none rounded-full bg-teal-600 p-2 text-white transition hover:bg-teal-700"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}