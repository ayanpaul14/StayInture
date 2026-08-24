"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";

import { loadRazorpayScript } from "../../../lib/razorpay";

const EMPTY_FORM = {
  category: "flat",
  title: "",
  description: "",
  address: "",
  city: "Kolkata",
  latitude: "22.5726",
  longitude: "88.3639",
  rentPerMonth: "",
  bedrooms: "",
  bathrooms: "",
  floors: "",
  roomSharing: "single",
  foodIncluded: false,
  amenities: "",
};

const SAMPLE_PRESET_IMAGES = [
  { label: "Modern Flat Interior", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop" },
  { label: "Cozy Living Room", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop" },
  { label: "Luxury Bungalow Exterior", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop" },
  { label: "Spacious PG Room", url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop" },
];

export default function ListPropertyPage() {
  const { user, ready, refreshMe } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [photos, setPhotos] = useState([]);
  const [photoInput, setPhotoInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Host listing fee state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const listingFee = 39; // ₹39 listing cost

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((f) => ({
            ...f,
            latitude: String(pos.coords.latitude),
            longitude: String(pos.coords.longitude),
          }));
        },
        () => {}
      );
    }
  }, []);

  if (ready && !user) {
    router.push("/login");
    return null;
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleAddPhoto() {
    if (!photoInput.trim()) return;
    setPhotos((prev) => [...prev, photoInput.trim()]);
    setPhotoInput("");
  }

  function handleAddPreset(url) {
    if (photos.includes(url)) return;
    setPhotos((prev) => [...prev, url]);
  }

  function handleRemovePhoto(index) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    setError("");

    if (photos.length === 0) {
      setError("Please add at least 1 property photo (Mandatory).");
      return;
    }

    // Open listing fee payment modal
    setShowPaymentModal(true);
  }

  async function handleFinalPublish() {
    setLoading(true);
    setError("");
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your network connection.");
      }

      // Step 1: Create Razorpay Order
      const orderRes = await api.createRazorpayOrder(listingFee, "host_listing_fee", {
        title: form.title,
        city: form.city,
      });

      // Step 2: Payload for Property Creation after payment verification
      const payload = {
        category: form.category,
        title: form.title,
        description: form.description,
        address: form.address,
        city: form.city,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        rentPerMonth: Number(form.rentPerMonth),
        photos,
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

      // Step 3: Open Razorpay Checkout Modal
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "StayInture",
        description: `Host Listing Fee - ₹${listingFee}`,
        order_id: orderRes.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#0D9488",
        },
        handler: async function (response) {
          try {
            await api.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id || orderRes.id,
              razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || "dev_signature",
            });

            // Payment verified -> Publish property listing
            const res = await api.createProperty(payload);
            await refreshMe();
            setShowPaymentModal(false);
            router.push(`/property/${res.property._id}`);
          } catch (verifyErr) {
            setError(verifyErr.message || "Payment verification failed.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message || "Failed to initialize payment process.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-head text-2xl font-bold text-ink">List your property</h1>
          <p className="text-xs sm:text-sm text-ink/60 mt-0.5">
            Fill in stay details, add photos, and pay the ₹{listingFee} listing fee to go live.
          </p>
        </div>
        <span className="w-fit whitespace-nowrap rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
          Listing Fee: ₹{listingFee}
        </span>
      </div>

      <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 rounded-3xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-black/5">
        {/* Category selector */}
        <div>
          <label className="block text-xs font-bold uppercase text-ink/50 mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {["flat", "bungalow", "pg"].map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => update("category", c)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase transition ${
                  form.category === c ? "bg-teal-600 text-white shadow-sm" : "bg-black/5 text-ink/60 hover:bg-black/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <Field label="Property Title *">
          <input required value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Luxury 2BHK Apartment near City Center" className={inputCls} />
        </Field>

        <Field label="Description">
          <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the space, neighborhood, and unique features..." className={inputCls} />
        </Field>

        <Field label="Address *">
          <input required value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Full street address" className={inputCls} />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="City *">
            <input required value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="City name" className={inputCls} />
          </Field>
          <Field label="Rent per month (₹) *">
            <input required type="number" value={form.rentPerMonth} onChange={(e) => update("rentPerMonth", e.target.value)} placeholder="Monthly rent" className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Latitude *">
            <input required type="number" step="any" value={form.latitude} onChange={(e) => update("latitude", e.target.value)} className={inputCls} placeholder="e.g. 22.5726" />
          </Field>
          <Field label="Longitude *">
            <input required type="number" step="any" value={form.longitude} onChange={(e) => update("longitude", e.target.value)} className={inputCls} placeholder="e.g. 88.3639" />
          </Field>
        </div>

        {form.category !== "pg" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Bedrooms">
              <input type="number" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} placeholder="No. of beds" className={inputCls} />
            </Field>
            <Field label="Bathrooms">
              <input type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} placeholder="No. of baths" className={inputCls} />
            </Field>
          </div>
        )}

        {form.category === "bungalow" && (
          <Field label="Number of floors">
            <input type="number" value={form.floors} onChange={(e) => update("floors", e.target.value)} placeholder="Total floors" className={inputCls} />
          </Field>
        )}

        {form.category === "pg" && (
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2">
            <Field label="Room sharing">
              <select value={form.roomSharing} onChange={(e) => update("roomSharing", e.target.value)} className={inputCls}>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 pb-2.5 text-xs font-semibold text-ink/70 cursor-pointer">
              <input type="checkbox" checked={form.foodIncluded} onChange={(e) => update("foodIncluded", e.target.checked)} className="rounded text-teal-600 focus:ring-teal-500" />
              Food included
            </label>
          </div>
        )}

        <Field label="Amenities (comma separated)">
          <input value={form.amenities} onChange={(e) => update("amenities", e.target.value)} placeholder="WiFi, Power backup, Parking, AC" className={inputCls} />
        </Field>

        {/* Mandatory Property Photos Section */}
        <div className="rounded-2xl border border-black/10 bg-slate-50/50 p-3.5 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
            <label className="text-xs font-bold uppercase text-ink/70">
              Property Photos <span className="text-coral-600 font-extrabold">* (Mandatory)</span>
            </label>
            <span className="text-[11px] font-medium text-ink/50">{photos.length} photo{photos.length !== 1 ? "s" : ""} added</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input
              type="url"
              value={photoInput}
              onChange={(e) => setPhotoInput(e.target.value)}
              placeholder="Paste Image URL (https://...)"
              className="flex-1 rounded-xl border border-black/10 px-3.5 py-2 text-xs outline-none focus:border-teal-500 bg-white"
            />
            <button
              type="button"
              onClick={handleAddPhoto}
              className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 whitespace-nowrap"
            >
              Add URL
            </button>
          </div>

          {/* Quick Presets */}
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase text-ink/40 mb-1.5">Or tap sample photos to add:</p>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PRESET_IMAGES.map((preset, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleAddPreset(preset.url)}
                  className="rounded-lg bg-white border border-black/10 px-2.5 py-1 text-[11px] font-semibold text-ink/70 hover:border-teal-600 hover:text-teal-700 transition"
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Previews */}
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
              {photos.map((url, idx) => (
                <div key={idx} className="relative group h-24 rounded-xl overflow-hidden bg-slate-200 border border-black/5">
                  <img src={url} alt={`Property ${idx + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white text-xs hover:bg-coral-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-coral-600 bg-coral-50 p-2.5 rounded-xl border border-coral-200 text-center font-medium mt-2">
              ⚠️ You must add at least 1 image before listing your property.
            </p>
          )}
        </div>

        {error && <p className="text-xs font-semibold text-coral-600">{error}</p>}

        <button
          type="submit"
          className="mt-2 rounded-2xl bg-gradient-to-r from-coral-500 to-coral-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:brightness-105"
        >
          Proceed to Pay ₹{listingFee} & Publish Listing
        </button>
      </form>

      {/* Host Listing Fee Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl my-8">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-ink hover:bg-black/10"
            >
              ✕
            </button>

            <h2 className="font-head text-2xl font-bold text-ink mb-1">Host Listing Fee</h2>
            <p className="text-xs text-ink/50 mb-5">Pay a one-time listing fee to publish your property on StayInture</p>

            {/* Listing Summary Box */}
            <div className="rounded-2xl bg-teal-50/50 p-4 border border-teal-200 mb-5 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-ink">
                <span className="truncate pr-2">{form.title}</span>
                <span className="uppercase text-teal-800 font-bold whitespace-nowrap">{form.category}</span>
              </div>
              <p className="text-ink/60 truncate">{form.address}, {form.city}</p>
              <div className="flex justify-between border-t border-black/10 pt-2 font-semibold text-ink mt-2">
                <span>Listing Fee</span>
                <span className="text-sm font-bold text-coral-600">₹{listingFee}</span>
              </div>
            </div>

            {/* Razorpay Secured Payment Badge */}
            <div className="mb-5 rounded-2xl bg-slate-50 border border-black/10 p-3.5 flex items-center justify-between text-xs text-ink/70">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold">Razorpay Checkout</span>
              </div>
              <span className="text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                UPI / Card / NetBanking
              </span>
            </div>

            {error && <p className="mb-3 text-xs font-semibold text-coral-600">{error}</p>}

            <button
              disabled={loading}
              onClick={handleFinalPublish}
              className="w-full rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 py-3.5 text-sm font-semibold text-white shadow-md hover:brightness-105 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                "Processing with Razorpay..."
              ) : (
                <>
                  <span>Pay ₹{listingFee} via Razorpay & Publish</span>
                  <span>&rarr;</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
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
