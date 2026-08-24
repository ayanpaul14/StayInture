const Razorpay = require("razorpay");
const crypto = require("crypto");

// Razorpay test credentials fallback if .env keys are not provided
const KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_stayinture";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "dev_secret_stayinture";

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// POST /api/payments/create-order   { amount, receipt, notes }
async function createOrder(req, res) {
  const { amount, receipt, notes } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Valid amount in INR is required" });
  }

  const amountInPaise = Math.round(Number(amount) * 100);

  if (razorpayInstance) {
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

  // Development mode fallback order object
  const dummyOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  res.json({
    id: dummyOrderId,
    amount: amountInPaise,
    currency: "INR",
    keyId: KEY_ID,
    isDevMode: true,
  });
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
