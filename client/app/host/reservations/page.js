"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import Avatar from "../../../components/Avatar";

export default function HostReservationsPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) return router.push("/login");

    fetchReservations();
  }, [ready, user, router]);

  function fetchReservations() {
    setLoading(true);
    api.getHostReservations()
      .then((res) => setReservations(res.bookings || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleUpdateStatus(bookingId, status) {
    let cancellationReason = "";
    if (status === "rejected") {
      cancellationReason = prompt("Reason for declining this request (optional):") || "Declined by host";
    }

    setActionLoading(bookingId);
    try {
      await api.updateBookingStatus(bookingId, status, cancellationReason);
      fetchReservations();
    } catch (err) {
      alert(err.message || "Failed to update reservation status");
    } finally {
      setActionLoading(null);
    }
  }

  if (!ready || loading) {
    return <p className="mx-auto max-w-5xl px-5 py-16 text-center text-ink/50">Loading reservations...</p>;
  }

  const pending = reservations.filter((r) => r.status === "pending");
  const confirmed = reservations.filter((r) => r.status === "confirmed");
  const cancelled = reservations.filter((r) => r.status === "cancelled" || r.status === "rejected");

  let displayReservations = reservations;
  if (activeTab === "pending") displayReservations = pending;
  if (activeTab === "confirmed") displayReservations = confirmed;
  if (activeTab === "cancelled") displayReservations = cancelled;

  const totalEarnings = confirmed.reduce((sum, r) => sum + (r.totalPrice || 0), 0);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-head text-3xl font-bold text-ink">Host Reservations</h1>
          <p className="text-xs text-ink/60 mt-1">Review incoming booking requests and manage guest stays</p>
        </div>
        <Link
          href="/host/dashboard"
          className="w-fit rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-ink/80 transition hover:bg-slate-50"
        >
          ← Host Dashboard
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Pending Requests" value={pending.length} tone="amber" />
        <StatCard label="Confirmed Stays" value={confirmed.length} tone="teal" />
        <StatCard label="Total Reservations" value={reservations.length} tone="neutral" />
        <StatCard label="Est. Revenue" value={`₹${totalEarnings.toLocaleString("en-IN")}`} tone="coral" />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-black/10 pb-3">
        <TabButton label="All" count={reservations.length} active={activeTab === "all"} onClick={() => setActiveTab("all")} />
        <TabButton label="Pending Action" count={pending.length} active={activeTab === "pending"} onClick={() => setActiveTab("pending")} />
        <TabButton label="Confirmed" count={confirmed.length} active={activeTab === "confirmed"} onClick={() => setActiveTab("confirmed")} />
        <TabButton label="Cancelled/Declined" count={cancelled.length} active={activeTab === "cancelled"} onClick={() => setActiveTab("cancelled")} />
      </div>

      {error && <p className="mb-4 text-xs text-coral-600">{error}</p>}

      {displayReservations.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-medium text-ink/60">No reservations found under "{activeTab}".</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {displayReservations.map((r) => (
            <ReservationCard
              key={r._id}
              reservation={r}
              actionLoading={actionLoading === r._id}
              onApprove={() => handleUpdateStatus(r._id, "confirmed")}
              onDecline={() => handleUpdateStatus(r._id, "rejected")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tone }) {
  const toneClasses =
    tone === "amber"
      ? "bg-amber-50 text-amber-900 border-amber-200"
      : tone === "teal"
      ? "bg-teal-50 text-teal-900 border-teal-200"
      : tone === "coral"
      ? "bg-coral-50 text-coral-900 border-coral-200"
      : "bg-slate-50 text-ink border-black/5";

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClasses}`}>
      <p className="font-head text-xl font-bold">{value}</p>
      <p className="text-[11px] opacity-70 mt-0.5">{label}</p>
    </div>
  );
}

function TabButton({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
        active
          ? "bg-teal-600 text-white shadow-sm"
          : "bg-slate-100 text-ink/70 hover:bg-slate-200"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] ${
          active ? "bg-white/20 text-white" : "bg-black/10 text-ink/70"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function ReservationCard({ reservation, actionLoading, onApprove, onDecline }) {
  const property = reservation.property || {};
  const guest = reservation.guest || {};

  const checkInStr = new Date(reservation.checkIn).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const checkOutStr = new Date(reservation.checkOut).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const totalGuests = (reservation.guestsCount?.adults || 1) + (reservation.guestsCount?.children || 0);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 pb-4">
        {/* Guest info */}
        <div className="flex items-center gap-3">
          <Avatar name={guest.name} email={guest.email} size={40} />
          <div>
            <h3 className="text-sm font-bold text-ink">{guest.name || "Guest"}</h3>
            <p className="text-xs text-ink/50">{guest.email} {guest.phone ? `· ${guest.phone}` : ""}</p>
          </div>
        </div>

        {/* Status Badge */}
        <HostStatusBadge status={reservation.status} paymentStatus={reservation.paymentStatus} />
      </div>

      {/* Reservation Details */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 rounded-2xl bg-slate-50 p-3 text-xs">
        <div>
          <p className="text-[10px] uppercase font-bold text-ink/40">Property</p>
          <p className="font-semibold text-ink truncate">{property.title}</p>
          <p className="text-[10px] text-ink/50">{property.city}</p>
        </div>

        <div>
          <p className="text-[10px] uppercase font-bold text-ink/40">Dates</p>
          <p className="font-semibold text-ink">{checkInStr} – {checkOutStr}</p>
          <p className="text-[10px] text-teal-700 font-medium">{reservation.totalNights} night{reservation.totalNights > 1 ? "s" : ""}</p>
        </div>

        <div>
          <p className="text-[10px] uppercase font-bold text-ink/40">Guests</p>
          <p className="font-semibold text-ink">{totalGuests} guest{totalGuests > 1 ? "s" : ""}</p>
          {reservation.guestsCount?.infants > 0 && (
            <p className="text-[10px] text-ink/50">{reservation.guestsCount.infants} infant</p>
          )}
        </div>

        <div>
          <p className="text-[10px] uppercase font-bold text-ink/40">Payout Amount</p>
          <p className="font-bold text-ink">₹{reservation.totalPrice?.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-ink/50">{reservation.paymentStatus === "paid" ? "Paid by guest" : "Pay on check-in"}</p>
        </div>
      </div>

      {reservation.specialRequests && (
        <div className="mt-3 rounded-2xl bg-amber-50/50 p-3 text-xs text-amber-900 border border-amber-200/50">
          <span className="font-bold">Guest Note:</span> "{reservation.specialRequests}"
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
        <Link
          href="/messages"
          className="rounded-xl border border-black/10 px-3.5 py-1.5 text-xs font-semibold text-ink/70 hover:bg-slate-50"
        >
          Message Guest
        </Link>

        {reservation.status === "pending" && (
          <div className="flex gap-2">
            <button
              disabled={actionLoading}
              onClick={onDecline}
              className="rounded-xl border border-coral-200 px-3.5 py-1.5 text-xs font-semibold text-coral-600 hover:bg-coral-50 disabled:opacity-50"
            >
              Decline Request
            </button>
            <button
              disabled={actionLoading}
              onClick={onApprove}
              className="rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : "Approve Booking"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function HostStatusBadge({ status, paymentStatus }) {
  if (status === "confirmed") {
    return (
      <span className="w-fit rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold text-teal-800 uppercase">
        Confirmed
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800 uppercase">
        Requires Approval
      </span>
    );
  }
  return (
    <span className="w-fit rounded-full bg-coral-50 px-3 py-1 text-[11px] font-bold text-coral-700 uppercase">
      {status}
    </span>
  );
}
