"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("Hi! Is this still available?");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

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
    return <p className="mx-auto max-w-3xl px-5 py-16 text-center text-ink/50">Loading...</p>;
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-5 py-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="col-span-2 h-64 rounded-2xl bg-teal-50" />
          <div className="flex flex-col gap-2">
            <div className="h-[7.75rem] rounded-2xl bg-teal-50" />
            <div className="h-[7.75rem] rounded-2xl bg-coral-50" />
          </div>
        </div>

        <span className="mb-1 inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-800">
          {property.category}
        </span>
        <h1 className="font-head text-2xl font-bold">{property.title}</h1>
        <p className="mt-1 text-sm text-ink/60">{property.address}, {property.city}</p>

        <div className="mt-4 flex gap-2 text-xs">
          {property.bedrooms && (
            <span className="rounded-full bg-black/5 px-3 py-1">{property.bedrooms} beds</span>
          )}
          {property.bathrooms && (
            <span className="rounded-full bg-black/5 px-3 py-1">{property.bathrooms} baths</span>
          )}
          {property.roomSharing && (
            <span className="rounded-full bg-black/5 px-3 py-1">{property.roomSharing} sharing</span>
          )}
        </div>

        {property.description && (
          <p className="mt-5 text-sm leading-relaxed text-ink/70">{property.description}</p>
        )}

        {property.amenities?.length > 0 && (
          <div className="mt-5">
            <h2 className="mb-2 text-sm font-semibold">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((a) => (
                <span key={a} className="rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-800">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <p className="font-head text-2xl font-bold">
          ₹{Number(property.rentPerMonth).toLocaleString("en-IN")}
          <span className="text-sm font-normal text-ink/50"> / month</span>
        </p>
        {property.host?.name && (
          <p className="mt-1 text-xs text-ink/50">Hosted by {property.host.name}</p>
        )}

        {sent ? (
          <p className="mt-4 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">
            Message sent — check Messages for the reply.
          </p>
        ) : (
          <form onSubmit={handleContact} className="mt-4 flex flex-col gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="rounded-xl border border-black/10 p-3 text-sm outline-none focus:border-teal-400"
            />
            <button
              disabled={sending}
              className="rounded-xl bg-coral-400 py-2.5 text-sm font-semibold text-white transition hover:bg-coral-600 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Contact host"}
            </button>
          </form>
        )}
        {error && <p className="mt-2 text-xs text-coral-600">{error}</p>}
      </aside>
    </div>
  );
}
