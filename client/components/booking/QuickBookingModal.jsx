"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { loadRazorpayScript } from "../../lib/razorpay";

export default function QuickBookingModal({ property, onClose }) {
  const router = useRouter();
  const { user } = useAuth();

  // Calculate default dates (Tomorrow -> +3 days)
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
  const [specialRequests, setSpecialRequests] = useState("");
  const [bookedRanges, setBookedRanges] = useState([]);
  const [availabilityError, setAvailabilityError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pay_on_confirmation");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (property?._id && !property._id.startsWith("demo-")) {
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

  // Nightly rate calculation based on monthly rent
  const rentPerMonth = property?.rentPerMonth || 15000;
  const nightlyRate = Math.round(rentPerMonth / 30);

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

  // Financial breakdown
  const basePrice = nights * nightlyRate;
  const cleaningFee = Math.round(basePrice * 0.05);
  const serviceFee = Math.round(basePrice * 0.03);
  const securityDeposit = property?.securityDeposit || 0;
  const totalPrice = basePrice + cleaningFee + serviceFee + securityDeposit;

  const totalGuests = guests.adults + guests.children;
  const isHost = user && property?.host?._id === user._id;

  async function handleConfirmBooking() {
    if (!user) {
      return router.push("/login");
    }
    if (availabilityError || nights <= 0 || isHost) return;

    setSubmitting(true);
    setError("");

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your connection.");
      }

      // Step 1: Create Razorpay Order
      const orderRes = await api.createRazorpayOrder(totalPrice, "stay_booking", {
        propertyId: property._id,
        propertyTitle: property.title,
      });

      // Step 2: Razorpay Modal Options
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "StayInture",
        description: property.title || "Stay Booking",
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

            // Payment verified -> Create booking with paid/confirmed status
            if (property._id && !property._id.startsWith("demo-")) {
              await api.createBooking({
                propertyId: property._id,
                checkIn,
                checkOut,
                guestsCount: guests,
                specialRequests,
                paymentMethod: "razorpay",
                // Pass real Razorpay IDs so the booking is marked paid + confirmed
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id || orderRes.id,
              });
            }

            setIsSuccess(true);
            setTimeout(() => {
              router.push("/trips");
            }, 1600);
          } catch (verifyErr) {
            setError(verifyErr.message || "Payment verification failed.");
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message || "Failed to initialize Razorpay payment.");
      setSubmitting(false);
    }
  }

  const checkInDateStr = new Date(checkIn).toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const checkOutDateStr = new Date(checkOut).toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl transition-all my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-ink hover:bg-black/10 transition"
        >
          ✕
        </button>

        {isSuccess ? (
          <div className="py-10 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-600 text-3xl">
              ✓
            </div>
            <h2 className="font-head text-2xl font-bold text-ink">Trip Requested!</h2>
            <p className="text-sm text-ink/70 max-w-md mx-auto">
              Your booking for <span className="font-semibold text-ink">{property.title}</span> has been created. Redirecting to your trips dashboard...
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-800">
                Explore Direct Booking
              </span>
              {property._id?.startsWith("demo-") && (
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Demo Preview
                </span>
              )}
            </div>
            <h2 className="font-head text-2xl font-bold text-ink">Book Your Stay</h2>
            <p className="text-xs text-ink/50 mb-5">Quick reservation directly from Explore</p>

            {/* Property Summary Header */}
            <div className="flex gap-3.5 rounded-2xl bg-teal-50/50 p-3.5 ring-1 ring-black/5 mb-5">
              <div className="h-16 w-16 flex-none rounded-xl bg-teal-100/60 flex items-center justify-center text-teal-700 font-bold uppercase text-xs overflow-hidden">
                {property.photos?.[0] ? (
                  <img src={property.photos[0]} alt={property.title} className="h-full w-full object-cover" />
                ) : (
                  <span>{property.category || "Stay"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="text-sm font-bold text-ink truncate">{property.title}</h3>
                <p className="text-xs text-ink/60 truncate">
                  {property.address ? `${property.address}, ` : ""}{property.city || "Kolkata"}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="font-bold text-teal-800">₹{nightlyRate.toLocaleString("en-IN")}<span className="font-normal text-ink/50">/night</span></span>
                  <span className="text-ink/30">•</span>
                  <span className="text-ink/60 text-[11px]">₹{Number(rentPerMonth).toLocaleString("en-IN")}/mo</span>
                </div>
              </div>
            </div>

            {/* Dates & Guest Selector Grid */}
            <div className="rounded-2xl border border-black/10 bg-slate-50/50 mb-5">
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
                    className="mt-0.5 w-full bg-transparent text-xs font-semibold text-ink outline-none cursor-pointer"
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
                    className="mt-0.5 w-full bg-transparent text-xs font-semibold text-ink outline-none cursor-pointer"
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
                  <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/10">
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
              <p className="mb-4 text-xs font-medium text-coral-600 bg-coral-50 p-2.5 rounded-xl">{availabilityError}</p>
            )}

            {/* Payment Method Selector */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-ink mb-2">Payment Option</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("pay_on_confirmation")}
                  className={`rounded-2xl border p-2.5 text-left transition ${
                    paymentMethod === "pay_on_confirmation"
                      ? "border-teal-600 bg-teal-50/50 text-teal-900 font-semibold ring-1 ring-teal-600"
                      : "border-black/10 hover:border-black/20 text-ink/70"
                  }`}
                >
                  <p className="text-xs font-bold">Pay Later</p>
                  <p className="text-[10px] opacity-70">On Host Confirm</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`rounded-2xl border p-2.5 text-left transition ${
                    paymentMethod === "card"
                      ? "border-teal-600 bg-teal-50/50 text-teal-900 font-semibold ring-1 ring-teal-600"
                      : "border-black/10 hover:border-black/20 text-ink/70"
                  }`}
                >
                  <p className="text-xs font-bold">Card</p>
                  <p className="text-[10px] opacity-70">Instant Pay</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`rounded-2xl border p-2.5 text-left transition ${
                    paymentMethod === "upi"
                      ? "border-teal-600 bg-teal-50/50 text-teal-900 font-semibold ring-1 ring-teal-600"
                      : "border-black/10 hover:border-black/20 text-ink/70"
                  }`}
                >
                  <p className="text-xs font-bold">UPI / GPay</p>
                  <p className="text-[10px] opacity-70">Instant Pay</p>
                </button>
              </div>
            </div>

            {/* Special Request */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Note for Host (Optional)
              </label>
              <input
                type="text"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g., Requesting early check-in or quiet room"
                className="w-full rounded-xl border border-black/10 p-2.5 text-xs outline-none focus:border-teal-500"
              />
            </div>

            {/* Price Summary */}
            {nights > 0 && !availabilityError && (
              <div className="rounded-2xl bg-slate-50 p-4 mb-5 border border-black/5 text-xs space-y-2">
                <div className="flex justify-between text-ink/70">
                  <span>₹{nightlyRate.toLocaleString("en-IN")} × {nights} night{nights > 1 ? "s" : ""} ({checkInDateStr} – {checkOutDateStr})</span>
                  <span>₹{basePrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-ink/70">
                  <span>Cleaning & service fee</span>
                  <span>₹{(cleaningFee + serviceFee).toLocaleString("en-IN")}</span>
                </div>
                {securityDeposit > 0 && (
                  <div className="flex justify-between text-teal-800">
                    <span>Refundable security deposit</span>
                    <span>₹{securityDeposit.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-black/10 pt-2 text-sm font-bold text-ink">
                  <span>Total Payable</span>
                  <span className="text-teal-800">₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}

            {error && <p className="mb-3 text-xs font-medium text-coral-600 bg-coral-50 p-2 rounded-lg">{error}</p>}
            {isHost && <p className="mb-3 text-xs font-medium text-amber-700 bg-amber-50 p-2 rounded-lg">You cannot book your own listing.</p>}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-black/10 py-3 text-xs font-semibold text-ink/70 hover:bg-black/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || Boolean(availabilityError) || nights <= 0 || isHost}
                onClick={handleConfirmBooking}
                className="flex-1 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 py-3 text-xs font-bold text-white shadow-md hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-1.5"
              >
                {submitting
                  ? "Processing Razorpay..."
                  : user
                  ? `Pay ₹${totalPrice.toLocaleString("en-IN")} via Razorpay`
                  : "Log in to Reserve"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
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
          className="flex h-7 w-7 items-center justify-center rounded-full border border-black/20 text-xs font-bold transition disabled:opacity-30 hover:border-black"
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
