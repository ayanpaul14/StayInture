"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import BookingWidget from "../../../components/booking/BookingWidget";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("Hi! Is this still available?");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showContactHost, setShowContactHost] = useState(false);

  useEffect(() => {
    api
      .getProperty(id)
      .then((res) => setProperty(res.property))
      .catch((err) => setError(err.message));
  }, [id]);

  async function handleContact(e) {
    e.preventDefault();
    if (!user) return router.push("/login");
    setSending(true);
    setError("");
    try {
      await api.startConversation(id, message);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (error && !property) {
    return <p className="mx-auto max-w-3xl px-5 py-16 text-center text-coral-600">{error}</p>;
  }
  if (!property) {
    return <p className="mx-auto max-w-3xl px-5 py-16 text-center text-ink/50">Loading property details...</p>;
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 py-8 md:grid-cols-3">
      {/* Property Information */}
      <div className="md:col-span-2">
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="col-span-2 h-64 sm:h-80 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-800 text-sm font-semibold">
            {property.photos?.[0] ? (
              <img src={property.photos[0]} alt={property.title} className="h-full w-full object-cover rounded-2xl" />
            ) : (
              "Property Photo"
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-[7.75rem] sm:h-[9.75rem] rounded-2xl bg-teal-50 flex items-center justify-center text-teal-800 text-xs">
              {property.photos?.[1] ? (
                <img src={property.photos[1]} alt={property.title} className="h-full w-full object-cover rounded-2xl" />
              ) : (
                "Interior"
              )}
            </div>
            <div className="h-[7.75rem] sm:h-[9.75rem] rounded-2xl bg-coral-50 flex items-center justify-center text-coral-800 text-xs">
              {property.photos?.[2] ? (
                <img src={property.photos[2]} alt={property.title} className="h-full w-full object-cover rounded-2xl" />
              ) : (
                "View"
              )}
            </div>
          </div>
        </div>

        <span className="mb-1 inline-block rounded-full bg-teal-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-teal-800">
          {property.category}
        </span>
        <h1 className="font-head text-3xl font-bold text-ink">{property.title}</h1>
        <p className="mt-1 text-sm text-ink/60">{property.address}, {property.city}</p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
          {property.bedrooms && (
            <span className="rounded-full bg-black/5 px-3 py-1.5">{property.bedrooms} bedrooms</span>
          )}
          {property.bathrooms && (
            <span className="rounded-full bg-black/5 px-3 py-1.5">{property.bathrooms} bathrooms</span>
          )}
          {property.roomSharing && (
            <span className="rounded-full bg-black/5 px-3 py-1.5">{property.roomSharing} sharing</span>
          )}
          {property.floors && (
            <span className="rounded-full bg-black/5 px-3 py-1.5">{property.floors} floors</span>
          )}
        </div>

        {property.description && (
          <div className="mt-6 border-t border-black/5 pt-6">
            <h2 className="text-base font-bold text-ink mb-2">About this space</h2>
            <p className="text-sm leading-relaxed text-ink/70">{property.description}</p>
          </div>
        )}

        {property.amenities?.length > 0 && (
          <div className="mt-6 border-t border-black/5 pt-6">
            <h2 className="mb-3 text-base font-bold text-ink">What this place offers</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {property.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 rounded-2xl bg-teal-50/60 px-3.5 py-2 text-xs font-semibold text-teal-900">
                  <span>✓</span>
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collapsible Contact Host Section */}
        <div className="mt-8 rounded-2xl border border-black/10 bg-slate-50/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink">Have questions for the host?</h3>
              <p className="text-xs text-ink/50">Send a direct message before booking</p>
            </div>
            <button
              onClick={() => setShowContactHost((v) => !v)}
              className="rounded-xl bg-white border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-slate-100"
            >
              {showContactHost ? "Hide" : "Message Host"}
            </button>
          </div>

          {showContactHost && (
            <div className="mt-4 border-t border-black/10 pt-4">
              {sent ? (
                <p className="rounded-xl bg-teal-50 px-4 py-3 text-xs font-semibold text-teal-800">
                  Message sent — check your Messages tab for the reply!
                </p>
              ) : (
                <form onSubmit={handleContact} className="flex flex-col gap-2">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="rounded-2xl border border-black/10 p-3 text-xs outline-none focus:border-teal-500 bg-white"
                  />
                  <button
                    disabled={sending}
                    className="w-fit rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Airbnb Reservation Sidebar Widget */}
      <div>
        <BookingWidget property={property} />
      </div>
    </div>
  );
}
