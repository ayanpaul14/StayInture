"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "Search PG near Salt Lake...",
  "Search Flats near Newtown...",
  "Search Bungalows near Rajarhat...",
  "Search anything within 2km...",
];

export default function TypewriterSearch() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = PHRASES[phraseIndex];
    const speed = deleting ? 28 : 45;

    const timeout = setTimeout(() => {
      if (!deleting) {
        if (text.length < current.length) {
          setText(current.slice(0, text.length + 1));
        } else {
          setTimeout(() => setDeleting(true), 1200);
        }
      } else {
        if (text.length > 0) {
          setText(current.slice(0, text.length - 1));
        } else {
          setDeleting(false);
          setPhraseIndex((i) => (i + 1) % PHRASES.length);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [text, deleting, phraseIndex]);

  return (
    <div className="flex w-full max-w-md items-center gap-2 rounded-full bg-white/95 px-5 py-3.5 shadow-lg">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-none text-teal-600">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="text-sm text-ink/70">
        {text}
        <span className="animate-pulse text-teal-600">|</span>
      </span>
    </div>
  );
}