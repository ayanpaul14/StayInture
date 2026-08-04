"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function HostDashboardPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!user) return router.push("/login");

    api
      .getMyProperties()
      .then((res) => setProperties(res.properties || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ready, user, router]);

  if (!ready || loading) {
    return <p className="mx-auto max-w-4xl px-5 py-16 text-center text-ink/50">Loading...</p>;
  }

  const active = properties.filter((p) => p.isActive).length;

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-head text-2xl font-bold">My listings</h1>
        <Link
          href="/host/new"
          className="rounded-full bg-coral-400 px-4 py-2 text-sm font-semibold text-white transition hover:bg-coral-600"
        >
          + New listing
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Active listings" value={active} tone="teal" />
        <Stat label="Total listings" value={properties.length} tone="coral" />
        <Stat label="Avg. rating" value={avgRating(properties)} tone="neutral" />
      </div>

      {error && <p className="mb-4 text-sm text-coral-600">{error}</p>}

      <div className="flex flex-col gap-3">
        {properties.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink/50 ring-1 ring-black/5">
            You haven't listed anything yet.
          </p>
        )}
        {properties.map((p) => (
          <Link
            key={p._id}
            href={`/property/${p._id}`}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="h-11 w-11 flex-none rounded-xl bg-teal-50" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{p.title}</p>
              <p className="text-xs text-ink/50">
                {p.city} · ₹{Number(p.rentPerMonth).toLocaleString("en-IN")}/mo
              </p>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-semibold uppercase text-teal-800">
              {p.category}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function avgRating(properties) {
  const rated = properties.filter((p) => p.ratingCount > 0);
  if (rated.length === 0) return "—";
  const avg = rated.reduce((sum, p) => sum + p.ratingAvg, 0) / rated.length;
  return avg.toFixed(1);
}

function Stat({ label, value, tone }) {
  const toneClass =
    tone === "teal" ? "bg-teal-50 text-teal-800" : tone === "coral" ? "bg-coral-50 text-coral-600" : "bg-black/5 text-ink";
  return (
    <div className={`rounded-2xl p-4 ${toneClass}`}>
      <p className="font-head text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-70">{label}</p>
    </div>
  );
}
