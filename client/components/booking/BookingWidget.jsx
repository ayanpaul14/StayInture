"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import BookingCheckoutModal from "./BookingCheckoutModal";

export default function BookingWidget({ property }) {
  const router = useRouter();
  const { user } = useAuth();

  // Date calculation defaults (tomorrow checkin, +3 days checkout)
  const today = new Date();
  const defaultCheckIn = new Date(today);
  defaultCheckIn.setDate(today.getDate() + 1);

  const defaultCheckOut = new Date(defaultCheckIn);
  defaultCheckOut.setDate(defaultCheckIn.getDate() + 3);

  const formatDate = (date) => date.toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(formatDate(defaultCheckIn));
  const [checkOut, setCheckOut] = useState(formatDate(defaultCheckOut));
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0 });
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [availabilityError, setAvailabilityError] = useState("");

  useEffect(() => {
    if (property?._id) {
      api
        .getAvailability(property._id)
        .then((res) => {
          if (res?.bookings) {
            setBookedRanges(
              res.bookings.map((b) => ({
                start: new Date(b.checkIn),
                end: new Date(b.checkOut),
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [property?._id]);

  // Nightly rate calculation
  const nightlyRate = Math.round((property?.rentPerMonth || 0) / 30);

  // Calculate nights
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  
  let nights = 0;
  if (!isNaN(startDate) && !isNaN(endDate) && endDate > startDate) {
    nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  }

  // Check collision with existing bookings
  useEffect(() => {
    if (nights <= 0) {
      setAvailabilityError("Check-out date must be after check-in date");
      return;
    }

    const hasOverlap = bookedRanges.some((range) => {
      return startDate < range.end && endDate > range.start;
    });

    if (hasOverlap) {
      setAvailabilityError("Selected dates overlap with an existing reservation");
    } else {
      setAvailabilityError("");
    }
  }, [checkIn, checkOut, bookedRanges, nights]);

  // Financial calculations
  const basePrice = nights * nightlyRate;
  const cleaningFee = Math.round(basePrice * 0.05);
  const serviceFee = Math.round(basePrice * 0.03);
  const securityDeposit = property?.securityDeposit || 0;
  const totalPrice = basePrice + cleaningFee + serviceFee + securityDeposit;

  const totalGuests = guests.adults + guests.children;

  function handleReserveClick() {
    if (!user) {
      return router.push("/login");
    }
    if (availabilityError || nights <= 0) return;
    setIsCheckoutOpen(true);
  }

  const isHost = user && property?.host?._id === user._id;

  return (
    <>
      <aside className="sticky top-24 h-fit rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-head text-2xl font-bold text-ink">
              ₹{nightlyRate.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-ink/60"> / night</span>
          </div>
          <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
            ₹{Number(property.rentPerMonth).toLocaleString("en-IN")}/mo
          </span>
        </div>

        <div className="mt-5 rounded-2xl border border-black/10 bg-slate-50/50">
          <div className="grid grid-cols-2 border-b border-black/10">
            <div className="p-3 border-r border-black/10">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-ink/60">
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                min={formatDate(today)}
                onChange={(e) => setCheckIn(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-xs font-semibold text-ink outline-none"
              />
            </div>
            <div className="p-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-ink/60">
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || formatDate(today)}
                onChange={(e) => setCheckOut(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-xs font-semibold text-ink outline-none"
              />
            </div>
          </div>

          <div className="relative p-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink/60">
              Guests
            </label>
            <button
              type="button"
              onClick={() => setShowGuestPicker((v) => !v)}
              className="mt-0.5 flex w-full items-center justify-between text-left text-xs font-semibold text-ink"
            >
              <span>
                {totalGuests} guest{totalGuests > 1 ? "s" : ""}
                {guests.infants > 0 ? `, ${guests.infants} infant` : ""}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                className={`transition-transform ${showGuestPicker ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {showGuestPicker && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/10">
                <GuestCounter
                  label="Adults"
                  sublabel="Age 13+"
                  value={guests.adults}
                  min={1}
                  onChange={(val) => setGuests({ ...guests, adults: val })}
                />
                <GuestCounter
                  label="Children"
                  sublabel="Ages 2–12"
                  value={guests.children}
                  min={0}
                  onChange={(val) => setGuests({ ...guests, children: val })}
                />
                <GuestCounter
                  label="Infants"
                  sublabel="Under 2"
                  value={guests.infants}
                  min={0}
                  onChange={(val) => setGuests({ ...guests, infants: val })}
                />
                <button
                  type="button"
                  onClick={() => setShowGuestPicker(false)}
                  className="mt-2 w-full rounded-xl bg-black/5 py-1.5 text-center text-xs font-semibold text-ink hover:bg-black/10"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>

        {availabilityError && (
          <p className="mt-3 text-xs font-medium text-coral-600">{availabilityError}</p>
        )}

        <button
          onClick={handleReserveClick}
          disabled={Boolean(availabilityError) || nights <= 0 || isHost}
          className="mt-4 w-full rounded-2xl bg-gradient-to-r from-coral-500 to-coral-600 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isHost ? "This is your listing" : "Reserve Now"}
        </button>

        {!isHost && (
          <p className="mt-2 text-center text-[11px] text-ink/50">
            You won't be charged until request is confirmed
          </p>
        )}

        {nights > 0 && !availabilityError && (
          <div className="mt-5 border-t border-black/5 pt-4 text-xs space-y-2.5 text-ink/70">
            <div className="flex justify-between">
              <span>
                ₹{nightlyRate.toLocaleString("en-IN")} × {nights} night{nights > 1 ? "s" : ""}
              </span>
              <span>₹{basePrice.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Cleaning fee</span>
              <span>₹{cleaningFee.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>StayInture service fee</span>
              <span>₹{serviceFee.toLocaleString("en-IN")}</span>
            </div>
            {securityDeposit > 0 && (
              <div className="flex justify-between text-teal-800">
                <span>Refundable deposit</span>
                <span>₹{securityDeposit.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-black/10 pt-3 text-sm font-bold text-ink">
              <span>Total</span>
              <span>₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>
        )}
      </aside>

      {isCheckoutOpen && (
        <BookingCheckoutModal
          property={property}
          bookingDetails={{
            checkIn,
            checkOut,
            nights,
            guests,
            nightlyRate,
            basePrice,
            cleaningFee,
            serviceFee,
            securityDeposit,
            totalPrice,
          }}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </>
  );
}

function GuestCounter({ label, sublabel, value, min, onChange }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
      <div>
        <p className="text-xs font-semibold text-ink">{label}</p>
        <p className="text-[10px] text-ink/50">{sublabel}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-black/20 text-xs font-bold transition disabled:opacity-30"
        >
          -
        </button>
        <span className="w-5 text-center text-xs font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-black/20 text-xs font-bold transition hover:border-black"
        >
          +
        </button>
      </div>
    </div>
  );
}
