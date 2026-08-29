const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay with real credentials from .env
const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!KEY_ID || !KEY_SECRET) {
  console.warn("[Payment] WARNING: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set in .env");
}

const razorpayInstance = new Razorpay({
  key_id: KEY_ID || "missing_key",
  key_secret: KEY_SECRET || "missing_secret",
});

// POST /api/payments/create-order   { amount, receipt, notes }
async function createOrder(req, res) {
  const { amount, receipt, notes } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Valid amount in INR is required" });
  }

  const amountInPaise = Math.round(Number(amount) * 100);

  if (!KEY_ID) {
    return res.status(500).json({ message: "Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env" });
  }

  try {
    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    });
    return res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    return res.status(500).json({ message: err.message || "Failed to create Razorpay order" });
  }
}

// POST /api/payments/verify   { razorpay_order_id, razorpay_payment_id, razorpay_signature }
async function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id) {
    return res.status(400).json({ message: "Order ID and Payment ID are required" });
  }

  if (process.env.RAZORPAY_KEY_SECRET) {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid Razorpay payment signature" });
    }
  }

  res.json({
    success: true,
    message: "Payment verified successfully",
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
  });
}

module.exports = { createOrder, verifyPayment };
