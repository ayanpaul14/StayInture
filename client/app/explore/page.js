"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../lib/api";
import CategoryChips from "../../components/CategoryChips";
import RadiusSlider from "../../components/RadiusSlider";
import BentoGrid from "../../components/BentoGrid";
import SkeletonGrid from "../../components/SkeletonGrid";
import SearchBar from "../../components/SearchBar";
import MapView from "../../components/MapView";

const DEFAULT_COORDS = { lat: 22.5726, lng: 88.3639 };

export default function HomePage() {
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  // Search waits for this to be true, so it only ever runs once we know
  // the REAL location - not once with the fallback and again with GPS.
  const [locationReady, setLocationReady] = useState(false);
  const [category, setCategory] = useState("");
  const [radiusKm, setRadiusKm] = useState(2);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("list");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationReady(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationReady(true);
      },
      () => {
        setCoords(DEFAULT_COORDS);
        setLocationReady(true);
      },
      { timeout: 6000 }
    );
  }, []);

  useEffect(() => {
    if (!locationReady) return;

    let cancelled = false;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const res = await api.search({ lat: coords.lat, lng: coords.lng, radiusKm, category, q: query });
        if (!cancelled) setProperties(res.properties || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [locationReady, coords, category, radiusKm, query]);

  function widenRadius() {
    setRadiusKm((r) => Math.min(3, r + 0.5));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="font-head text-2xl font-bold tracking-tight text-ink sm:text-3xl sm:text-4xl">
          Find a place to call home.
        </h1>
        <p className="mt-2 text-sm text-ink/60 sm:text-[15px]">
          Flat, Bungalow or PG — sorted by what&rsquo;s nearest to you.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="mb-4"
      >
        <SearchBar value={query} onChange={setQuery} />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="static z-10 mb-5 flex flex-col gap-3 rounded-2xl border border-black/5 bg-white/90 p-3.5 shadow-[0_8px_24px_-12px_rgba(20,40,36,0.18)] backdrop-blur sm:sticky sm:top-[72px] sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4"
      >
        <CategoryChips value={category} onChange={setCategory} />
        <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-4">
          <RadiusSlider value={radiusKm} onChange={setRadiusKm} />
          <div className="flex flex-none rounded-full bg-canvas p-1 text-xs font-semibold ring-1 ring-black/5">
            <button
              onClick={() => setView("list")}
              className={`rounded-full px-3 py-1.5 transition ${
                view === "list" ? "bg-teal-600 text-white shadow-sm" : "text-ink/50 hover:text-ink"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView("map")}
              className={`rounded-full px-3 py-1.5 transition ${
                view === "map" ? "bg-teal-600 text-white shadow-sm" : "text-ink/50 hover:text-ink"
              }`}
            >
              Map
            </button>
          </div>
        </div>
      </motion.section>

      {error && (
        <p className="mb-4 rounded-xl bg-coral-50 px-4 py-3 text-sm text-coral-600">
          {error} — make sure the backend is running and NEXT_PUBLIC_API_URL is set.
        </p>
      )}

      {loading ? (
        <SkeletonGrid />
      ) : view === "map" ? (
        <div className="h-[70vh] overflow-hidden rounded-2xl ring-1 ring-black/5 sm:h-[520px]">
          <MapView center={coords} radiusKm={radiusKm} properties={properties} />
        </div>
      ) : (
        <BentoGrid properties={properties} onWidenRadius={widenRadius} radiusKm={radiusKm} />
      )}
    </div>
  );
}