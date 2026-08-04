const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    messages: [messageSchema],

    // Simple booking/visit-request state machine
    visitStatus: {
      type: String,
      enum: ["none", "requested", "confirmed", "declined", "completed"],
      default: "none",
    },
    visitDate: { type: Date },
  },
  { timestamps: true }
);

// One conversation per (property, customer) pair
conversationSchema.index({ property: 1, customer: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", conversationSchema);
