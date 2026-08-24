"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { loadRazorpayScript } from "../../lib/razorpay";

export default function BookingCheckoutModal({ property, bookingDetails, onClose }) {
  const router = useRouter();
  const { user } = useAuth();
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    checkIn,
    checkOut,
    nights,
    guests,
    basePrice,
    cleaningFee,
    serviceFee,
    securityDeposit,
    totalPrice,
  } = bookingDetails;

  const totalGuests = guests.adults + guests.children;

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

  async function handleConfirmBooking() {
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

            // Payment verified -> Create booking with paid status
            await api.createBooking({
              propertyId: property._id,
              checkIn,
              checkOut,
              guestsCount: guests,
              specialRequests,
              paymentMethod: "razorpay",
            });

            setIsSuccess(true);
            setTimeout(() => {
              router.push("/trips");
            }, 1800);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-ink hover:bg-black/10"
        >
          ✕
        </button>

        {isSuccess ? (
          <div className="py-10 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-600 text-3xl">
              ✓
            </div>
            <h2 className="font-head text-2xl font-bold text-ink">Booking Requested!</h2>
            <p className="text-sm text-ink/70 max-w-md mx-auto">
              Your reservation has been created. Redirecting to your trips dashboard...
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-head text-2xl font-bold text-ink mb-1">Confirm your booking</h2>
            <p className="text-xs text-ink/50 mb-6">Review stay details and choose your payment preference</p>

            {/* Property Header Summary */}
            <div className="flex gap-4 rounded-2xl bg-teal-50/50 p-3.5 ring-1 ring-black/5 mb-5">
              <div className="h-16 w-16 flex-none rounded-xl bg-teal-100/60 flex items-center justify-center text-teal-700 font-bold uppercase text-xs">
                {property.category}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-ink truncate">{property.title}</h3>
                <p className="text-xs text-ink/60 truncate">
                  {property.address}, {property.city}
                </p>
                {property.host?.name && (
                  <p className="mt-1 text-[11px] text-teal-800 font-medium">
                    Hosted by {property.host.name}
                  </p>
                )}
              </div>
            </div>

            {/* Trip Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-2xl border border-black/10 p-3 bg-slate-50/30">
                <p className="text-[10px] font-bold uppercase text-ink/50">Dates</p>
                <p className="text-xs font-semibold text-ink mt-0.5">{checkInDateStr} – {checkOutDateStr}</p>
                <p className="text-[11px] text-teal-700 font-medium">{nights} night{nights > 1 ? "s" : ""}</p>
              </div>

              <div className="rounded-2xl border border-black/10 p-3 bg-slate-50/30">
                <p className="text-[10px] font-bold uppercase text-ink/50">Guests</p>
                <p className="text-xs font-semibold text-ink mt-0.5">
                  {totalGuests} guest{totalGuests > 1 ? "s" : ""}
                </p>
                {guests.infants > 0 && (
                  <p className="text-[11px] text-ink/60">{guests.infants} infant</p>
                )}
              </div>
            </div>

            {/* Special Requests */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Special requests / Note for host (optional)
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={2}
                placeholder="e.g. Estimated arrival time, parking requirement..."
                className="w-full rounded-2xl border border-black/10 p-3 text-xs outline-none focus:border-teal-500"
              />
            </div>

            {/* Razorpay Secured Badge */}
            <div className="mb-5 rounded-2xl bg-slate-50 border border-black/10 p-3.5 flex items-center justify-between text-xs text-ink/70">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold">Razorpay Secure Checkout</span>
              </div>
              <span className="text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                UPI / Cards / NetBanking
              </span>
            </div>

            {/* Total Price Summary */}
            <div className="rounded-2xl bg-slate-50 p-4 mb-5 border border-black/5">
              <div className="flex justify-between text-xs text-ink/70 mb-1">
                <span>Base stay price</span>
                <span>₹{basePrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-xs text-ink/70 mb-1">
                <span>Cleaning + Service fees</span>
                <span>₹{(cleaningFee + serviceFee).toLocaleString("en-IN")}</span>
              </div>
              {securityDeposit > 0 && (
                <div className="flex justify-between text-xs text-teal-800 mb-1">
                  <span>Refundable deposit</span>
                  <span>₹{securityDeposit.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-black/10 pt-2 text-base font-bold text-ink">
                <span>Total Amount</span>
                <span>₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {error && <p className="mb-3 text-xs font-medium text-coral-600 bg-coral-50 p-2 rounded-lg">{error}</p>}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-black/10 py-3 text-xs font-semibold text-ink/70 hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmBooking}
                className="flex-1 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 py-3 text-xs font-bold text-white shadow-md hover:brightness-110 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
              >
                {submitting ? "Processing Razorpay..." : `Pay ₹${totalPrice.toLocaleString("en-IN")} via Razorpay`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
