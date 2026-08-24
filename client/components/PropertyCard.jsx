"use client";

import Link from "next/link";

const CATEGORY_COLOR = {
  flat: "bg-teal-50 text-teal-800",
  bungalow: "bg-coral-50 text-coral-600",
  pg: "bg-teal-100 text-teal-900",
};

// Deterministic placeholder so a listing without host-uploaded photos still
// shows *something* instead of a blank tile, and stays stable across renders.
function placeholderFor(property) {
  const seed = encodeURIComponent(property._id || property.title || "xid");
  return `https://picsum.photos/seed/${seed}/480/480`;
}

export default function PropertyCard({ property, size = "lg", delay = 0, demo = false, onBook }) {
  const image = property.photos?.[0] || placeholderFor(property);
  const Wrapper = demo ? "div" : Link;
  const wrapperProps = demo
    ? { title: "Sample listing — preview mode" }
    : { href: `/property/${property._id}` };

  const handleQuickBook = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBook) onBook(property);
  };

  return (
    <Wrapper
      {...wrapperProps}
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative flex h-full w-full animate-riseIn flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 ${
        demo ? "hover:-translate-y-0.5 hover:shadow-md" : "hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-900/10"
      }`}
    >
      <div className="relative min-h-[64px] w-full flex-1 overflow-hidden bg-teal-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm ${
            CATEGORY_COLOR[property.category] || "bg-teal-50 text-teal-800"
          }`}
        >
          {property.category}
        </span>
        {demo && (
          <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
            Demo
          </span>
        )}

        {/* Quick Book overlay button on hover */}
        {onBook && (
          <button
            type="button"
            onClick={handleQuickBook}
            className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-teal-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-teal-700 hover:scale-105 active:scale-95"
          >
            <span>Book Stay</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-none flex-col gap-1 p-3">
        <h3 className="truncate text-sm font-semibold text-ink">{property.title}</h3>
        <p className="text-xs text-ink/60">{property.city}</p>
        <div className="mt-auto flex items-center justify-between pt-1">
          <p className="text-sm font-semibold text-ink">
            ₹{Number(property.rentPerMonth).toLocaleString("en-IN")}
            <span className="text-xs font-normal text-ink/50"> / mo</span>
          </p>
          {onBook && (
            <button
              type="button"
              onClick={handleQuickBook}
              className="text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline"
            >
              Quick Book
            </button>
          )}
        </div>
      </div>
    </Wrapper>
  );
}