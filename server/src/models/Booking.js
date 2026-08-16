const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },

    guestsCount: {
      adults: { type: Number, default: 1, min: 1 },
      children: { type: Number, default: 0, min: 0 },
      infants: { type: Number, default: 0, min: 0 },
    },

    totalNights: { type: Number, required: true },
    nightlyRate: { type: Number, required: true },
    cleaningFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    securityDeposit: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled", "completed"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },

    paymentDetails: {
      transactionId: { type: String },
      paymentMethod: { type: String }, // 'card', 'upi', 'pay_on_confirmation'
      paidAt: { type: Date },
    },

    specialRequests: { type: String, trim: true },
    cancellationReason: { type: String, trim: true },
  },
  { timestamps: true }
);

// Indexes for faster lookups
bookingSchema.index({ property: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ guest: 1 });
bookingSchema.index({ host: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
