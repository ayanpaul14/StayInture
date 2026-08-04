"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";

const EMPTY_FORM = {
  category: "flat",
  title: "",
  description: "",
  address: "",
  city: "",
  latitude: "",
  longitude: "",
  rentPerMonth: "",
  bedrooms: "",
  bathrooms: "",
  floors: "",
  roomSharing: "single",
  foodIncluded: false,
  amenities: "",
};

export default function ListPropertyPage() {
  const { user, ready, refreshMe } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (ready && !user) {
    router.push("/login");
    return null;
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        category: form.category,
        title: form.title,
        description: form.description,
        address: form.address,
        city: form.city,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        rentPerMonth: Number(form.rentPerMonth),
        amenities: form.amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
      };
      if (form.category !== "pg") {
        payload.bedrooms = Number(form.bedrooms) || undefined;
        payload.bathrooms = Number(form.bathrooms) || undefined;
      }
      if (form.category === "bungalow") {
        payload.floors = Number(form.floors) || undefined;
      }
      if (form.category === "pg") {
        payload.roomSharing = form.roomSharing;
        payload.foodIncluded = form.foodIncluded;
      }

      const res = await api.createProperty(payload);
      await refreshMe();
      router.push(`/property/${res.property._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="font-head text-2xl font-bold">List your property</h1>
      <p className="mb-6 text-sm text-ink/60">
        Fields adjust based on the category you pick.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex gap-2">
          {["flat", "bungalow", "pg"].map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => update("category", c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
                form.category === c ? "bg-teal-600 text-white" : "bg-black/5 text-ink/60"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <Field label="Title">
          <input required value={form.title} onChange={(e) => update("title", e.target.value)} className={inputCls} />
        </Field>

        <Field label="Description">
          <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} className={inputCls} />
        </Field>

        <Field label="Address">
          <input required value={form.address} onChange={(e) => update("address", e.target.value)} className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="City">
            <input required value={form.city} onChange={(e) => update("city", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Rent per month (₹)">
            <input required type="number" value={form.rentPerMonth} onChange={(e) => update("rentPerMonth", e.target.value)} className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude">
            <input required type="number" step="any" value={form.latitude} onChange={(e) => update("latitude", e.target.value)} className={inputCls} placeholder="e.g. 22.5726" />
          </Field>
          <Field label="Longitude">
            <input required type="number" step="any" value={form.longitude} onChange={(e) => update("longitude", e.target.value)} className={inputCls} placeholder="e.g. 88.3639" />
          </Field>
        </div>
        <p className="-mt-2 text-xs text-ink/40">
          In production, wire this to Google Places autocomplete instead of typing lat/lng by hand.
        </p>

        {form.category !== "pg" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bedrooms">
              <input type="number" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Bathrooms">
              <input type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} className={inputCls} />
            </Field>
          </div>
        )}

        {form.category === "bungalow" && (
          <Field label="Number of floors">
            <input type="number" value={form.floors} onChange={(e) => update("floors", e.target.value)} className={inputCls} />
          </Field>
        )}

        {form.category === "pg" && (
          <div className="grid grid-cols-2 items-end gap-3">
            <Field label="Room sharing">
              <select value={form.roomSharing} onChange={(e) => update("roomSharing", e.target.value)} className={inputCls}>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 pb-2.5 text-sm text-ink/70">
              <input type="checkbox" checked={form.foodIncluded} onChange={(e) => update("foodIncluded", e.target.checked)} />
              Food included
            </label>
          </div>
        )}

        <Field label="Amenities (comma separated)">
          <input value={form.amenities} onChange={(e) => update("amenities", e.target.value)} placeholder="WiFi, Power backup, Parking" className={inputCls} />
        </Field>

        {error && <p className="text-xs text-coral-600">{error}</p>}

        <button disabled={loading} className="mt-2 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50">
          {loading ? "Publishing..." : "Publish listing"}
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-teal-400 w-full";

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-ink/70">
      {label}
      {children}
    </label>
  );
}
