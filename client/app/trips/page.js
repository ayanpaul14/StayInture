"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/Avatar";

export default function MyTripsPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) return router.push("/login");

    fetchTrips();
  }, [ready, user, router]);

  function fetchTrips() {
    setLoading(true);
    api.getMyTrips()
      .then((res) => setBookings(res.bookings || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleCancelTrip(bookingId) {
    const reason = prompt("Please specify a reason for cancellation:");
    if (reason === null) return; // user pressed cancel in prompt

    setActionLoading(bookingId);
    try {
      await api.updateBookingStatus(bookingId, "cancelled", reason || "Cancelled by guest");
      fetchTrips();
    } catch (err) {
      alert(err.message || "Failed to cancel trip");
    } finally {
      setActionLoading(null);
    }
  }

  async function handlePayBooking(bookingId) {
    setActionLoading(bookingId);
    try {
      await api.payBooking(bookingId, "card");
      fetchTrips();
    } catch (err) {
      alert(err.message || "Failed to process payment");
    } finally {
      setActionLoading(null);
    }
  }

  if (!ready || loading) {
    return <p className="mx-auto max-w-5xl px-5 py-16 text-center text-ink/50">Loading your trips...</p>;
  }

  // Filter bookings by tab
  const now = new Date();
  const upcoming = bookings.filter((b) => b.status !== "cancelled" && b.status !== "rejected" && new Date(b.checkOut) >= now);
  const completed = bookings.filter((b) => b.status === "completed" || (b.status === "confirmed" && new Date(b.checkOut) < now));
  const cancelled = bookings.filter((b) => b.status === "cancelled" || b.status === "rejected");

  let displayBookings = upcoming;
  if (activeTab === "completed") displayBookings = completed;
  if (activeTab === "cancelled") displayBookings = cancelled;

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-head text-3xl font-bold text-ink">My Trips</h1>
          <p className="text-xs text-ink/60 mt-1">Manage your reservations and trip history</p>
        </div>
        <Link
          href="/explore"
          className="w-fit rounded-full bg-teal-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-teal-700"
        >
          Explore Places
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-black/10 pb-3">
        <TabButton
          label="Upcoming"
          count={upcoming.length}
          active={activeTab === "upcoming"}
          onClick={() => setActiveTab("upcoming")}
        />
        <TabButton
          label="Completed"
          count={completed.length}
          active={activeTab === "completed"}
          onClick={() => setActiveTab("completed")}
        />
        <TabButton
          label="Cancelled"
          count={cancelled.length}
          active={activeTab === "cancelled"}
          onClick={() => setActiveTab("cancelled")}
        />
      </div>

      {error && <p className="mb-4 text-xs text-coral-600">{error}</p>}

      {displayBookings.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-medium text-ink/60">No {activeTab} trips found.</p>
          <p className="text-xs text-ink/40 mt-1">When you book a stay, your reservations will show up here.</p>
          <Link
            href="/explore"
            className="mt-4 inline-block rounded-2xl bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-800 transition hover:bg-teal-100"
          >
            Find a place to stay
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {displayBookings.map((b) => (
            <TripCard
              key={b._id}
              booking={b}
              actionLoading={actionLoading === b._id}
              onCancel={() => handleCancelTrip(b._id)}
              onPay={() => handlePayBooking(b._id)}
              onViewReceipt={() => setSelectedReceipt(b)}
            />
          ))}
        </div>
      )}

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal booking={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      )}
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

function TripCard({ booking, actionLoading, onCancel, onPay, onViewReceipt }) {
  const property = booking.property || {};
  const host = booking.host || {};

  const checkInStr = new Date(booking.checkIn).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const checkOutStr = new Date(booking.checkOut).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const totalGuests = (booking.guestsCount?.adults || 1) + (booking.guestsCount?.children || 0);

  return (
    <div className="flex flex-col md:flex-row gap-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      {/* Property Image Placeholder / Category Icon */}
      <div className="flex-none md:w-48 h-36 rounded-2xl bg-teal-50 flex items-center justify-center p-3">
        <div className="text-center">
          <span className="inline-block rounded-full bg-teal-200/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-800">
            {property.category || "Property"}
          </span>
          <p className="mt-2 text-xs font-bold text-ink/80 truncate max-w-[150px]">{property.city}</p>
        </div>
      </div>

      {/* Main Trip Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/property/${property._id}`} className="font-head text-lg font-bold text-ink hover:text-teal-600 transition">
                {property.title}
              </Link>
              <p className="text-xs text-ink/50 mt-0.5">{property.address}, {property.city}</p>
            </div>
            <StatusBadge status={booking.status} paymentStatus={booking.paymentStatus} />
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-ink/40">Dates</p>
              <p className="font-semibold text-ink">{checkInStr} – {checkOutStr}</p>
              <p className="text-[10px] text-teal-700 font-medium">{booking.totalNights} night{booking.totalNights > 1 ? "s" : ""}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-ink/40">Guests</p>
              <p className="font-semibold text-ink">{totalGuests} guest{totalGuests > 1 ? "s" : ""}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-ink/40">Total Amount</p>
              <p className="font-bold text-ink">₹{booking.totalPrice?.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-ink/50">{booking.paymentStatus === "paid" ? "Paid" : "Payable"}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions & Host Info */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-3">
          <div className="flex items-center gap-2">
            <Avatar name={host.name} email={host.email} size={28} />
            <span className="text-xs font-medium text-ink/70">Hosted by {host.name || "Host"}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onViewReceipt}
              className="rounded-xl border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-slate-50"
            >
              Receipt
            </button>

            <Link
              href="/messages"
              className="rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100"
            >
              Message Host
            </Link>

            {booking.paymentStatus === "unpaid" && booking.status !== "cancelled" && booking.status !== "rejected" && (
              <button
                disabled={actionLoading}
                onClick={onPay}
                className="rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
              >
                {actionLoading ? "Paying..." : "Pay Now"}
              </button>
            )}

            {booking.status !== "cancelled" && booking.status !== "completed" && booking.status !== "rejected" && (
              <button
                disabled={actionLoading}
                onClick={onCancel}
                className="rounded-xl border border-coral-200 px-3 py-1.5 text-xs font-semibold text-coral-600 hover:bg-coral-50 disabled:opacity-50"
              >
                Cancel Trip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, paymentStatus }) {
  if (status === "cancelled" || status === "rejected") {
    return <span className="rounded-full bg-coral-50 px-3 py-1 text-[11px] font-bold text-coral-600 uppercase">Cancelled</span>;
  }
  if (status === "completed") {
    return <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 uppercase">Completed</span>;
  }
  if (paymentStatus === "paid") {
    return <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 uppercase">Confirmed & Paid</span>;
  }
  return <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 uppercase">Pending Approval</span>;
}

function ReceiptModal({ booking, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-ink hover:bg-black/10"
        >
          ✕
        </button>

        <h3 className="font-head text-xl font-bold text-ink">StayInture Receipt</h3>
        <p className="text-xs text-ink/50">Booking Ref: #{booking._id?.slice(-8).toUpperCase()}</p>

        <div className="mt-4 border-t border-b border-black/10 py-3 space-y-2 text-xs">
          <div className="flex justify-between font-semibold">
            <span>Property</span>
            <span className="text-right">{booking.property?.title}</span>
          </div>
          <div className="flex justify-between">
            <span>Check-in</span>
            <span>{new Date(booking.checkIn).toLocaleDateString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span>Check-out</span>
            <span>{new Date(booking.checkOut).toLocaleDateString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span>Duration</span>
            <span>{booking.totalNights} night(s)</span>
          </div>
        </div>

        <div className="mt-3 space-y-2 text-xs text-ink/70">
          <div className="flex justify-between">
            <span>Nightly Rate (×{booking.totalNights})</span>
            <span>₹{(booking.nightlyRate * booking.totalNights).toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span>Cleaning fee</span>
            <span>₹{booking.cleaningFee?.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span>Service fee</span>
            <span>₹{booking.serviceFee?.toLocaleString("en-IN")}</span>
          </div>
          {booking.securityDeposit > 0 && (
            <div className="flex justify-between text-teal-800">
              <span>Security Deposit</span>
              <span>₹{booking.securityDeposit?.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-black/10 pt-2 text-sm font-bold text-ink">
            <span>Total Paid/Due</span>
            <span>₹{booking.totalPrice?.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {booking.paymentDetails?.transactionId && (
          <div className="mt-4 rounded-xl bg-slate-50 p-2.5 text-[11px] text-ink/60">
            <p>Transaction ID: <span className="font-mono text-ink">{booking.paymentDetails.transactionId}</span></p>
            <p>Payment Method: <span className="font-semibold text-ink uppercase">{booking.paymentDetails.paymentMethod}</span></p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-black py-2.5 text-xs font-semibold text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}
