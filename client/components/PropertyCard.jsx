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

export default function PropertyCard({ property, size = "lg", delay = 0, demo = false }) {
  const image = property.photos?.[0] || placeholderFor(property);
  const Wrapper = demo ? "div" : Link;
  const wrapperProps = demo
    ? { title: "Sample listing — not a real property" }
    : { href: `/property/${property._id}` };

  return (
    <Wrapper
      {...wrapperProps}
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative flex h-full w-full animate-riseIn flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 ${
        demo ? "cursor-default opacity-90" : "hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-900/10"
      }`}
    >
      <div className="relative min-h-[64px] w-full flex-1 overflow-hidden bg-teal-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={property.title}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-500 ${!demo ? "group-hover:scale-105" : ""}`}
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
      </div>
      <div className="flex flex-none flex-col gap-1 p-3">
        <h3 className="truncate text-sm font-semibold text-ink">{property.title}</h3>
        <p className="text-xs text-ink/60">{property.city}</p>
        <p className="mt-auto text-sm font-semibold text-ink">
          ₹{Number(property.rentPerMonth).toLocaleString("en-IN")}
          <span className="text-xs font-normal text-ink/50"> / month</span>
        </p>
      </div>
    </Wrapper>
  );
}