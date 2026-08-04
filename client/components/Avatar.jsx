"use client";

const PALETTE = ["#2F5233", "#4C7A45", "#C9A227", "#96791C"];

function getInitials(name, email) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }
  return (email?.[0] || "?").toUpperCase();
}

function getColor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function Avatar({ name, email, size = 36 }) {
  const initials = getInitials(name, email);
  const bg = getColor(email || name || "?");

  return (
    <div
      style={{ width: size, height: size, backgroundColor: bg, fontSize: size * 0.4 }}
      className="flex flex-none items-center justify-center rounded-full font-semibold text-white"
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}