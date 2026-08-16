const Booking = require("../models/Booking");
const Property = require("../models/Property");
const Conversation = require("../models/Conversation");

// Helper function to check overlapping bookings
async function isDatesAvailable(propertyId, start, end, excludeBookingId = null) {
  const query = {
    property: propertyId,
    status: { $in: ["pending", "confirmed"] },
    $or: [
      { checkIn: { $lt: end }, checkOut: { $gt: start } },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existing = await Booking.findOne(query);
  return !existing;
}

// GET /api/bookings/availability/:propertyId
async function getPropertyAvailability(req, res) {
  const { propertyId } = req.params;
  const bookings = await Booking.find({
    property: propertyId,
    status: { $in: ["pending", "confirmed"] },
  }).select("checkIn checkOut status");

  res.json({ bookings });
}

// POST /api/bookings
async function createBooking(req, res) {
  const {
    propertyId,
    checkIn,
    checkOut,
    guestsCount = { adults: 1, children: 0, infants: 0 },
    specialRequests,
    paymentMethod = "pay_on_confirmation",
  } = req.body;

  if (!propertyId || !checkIn || !checkOut) {
    return res.status(400).json({ message: "propertyId, checkIn, and checkOut are required" });
  }

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return res.status(400).json({ message: "Invalid checkIn or checkOut date format" });
  }

  if (startDate < today) {
    return res.status(400).json({ message: "Check-in date cannot be in the past" });
  }

  if (endDate <= startDate) {
    return res.status(400).json({ message: "Check-out date must be after check-in date" });
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    return res.status(404).json({ message: "Property not found" });
  }

  if (!property.isActive) {
    return res.status(400).json({ message: "This property is not currently accepting bookings" });
  }

  if (property.host.equals(req.user._id)) {
    return res.status(400).json({ message: "You cannot book your own listing" });
  }

  // Check date collision
  const available = await isDatesAvailable(propertyId, startDate, endDate);
  if (!available) {
    return res.status(400).json({ message: "Selected dates are already booked or reserved." });
  }

  // Calculate pricing
  const diffTime = Math.abs(endDate - startDate);
  const totalNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const nightlyRate = Math.round(property.rentPerMonth / 30);
  const basePrice = totalNights * nightlyRate;
  const cleaningFee = Math.round(basePrice * 0.05); // 5% cleaning fee
  const serviceFee = Math.round(basePrice * 0.03); // 3% StayInture service fee
  const securityDeposit = property.securityDeposit || 0;
  const totalPrice = basePrice + cleaningFee + serviceFee + securityDeposit;

  // Determine initial payment status if paid upfront vs pay on confirmation
  const isPaidUpfront = paymentMethod === "card" || paymentMethod === "upi";
  const paymentStatus = isPaidUpfront ? "paid" : "unpaid";
  const status = isPaidUpfront ? "confirmed" : "pending";

  const bookingData = {
    property: propertyId,
    guest: req.user._id,
    host: property.host,
    checkIn: startDate,
    checkOut: endDate,
    guestsCount,
    totalNights,
    nightlyRate,
    cleaningFee,
    serviceFee,
    securityDeposit,
    totalPrice,
    status,
    paymentStatus,
    specialRequests,
  };

  if (isPaidUpfront) {
    bookingData.paymentDetails = {
      transactionId: "TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      paymentMethod,
      paidAt: new Date(),
    };
  }

  const booking = await Booking.create(bookingData);

  // Auto-post message in conversation thread
  try {
    let conversation = await Conversation.findOne({
      property: propertyId,
      customer: req.user._id,
    });
    if (!conversation) {
      conversation = await Conversation.create({
        property: propertyId,
        customer: req.user._id,
        host: property.host,
        messages: [],
      });
    }

    const checkInStr = startDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    const checkOutStr = endDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    
    const msgText = `📅 Booking Request Created!\nDates: ${checkInStr} - ${checkOutStr} (${totalNights} night${totalNights > 1 ? "s" : ""})\nTotal: ₹${totalPrice.toLocaleString("en-IN")}\nStatus: ${status.toUpperCase()}`;
    
    conversation.messages.push({
      sender: req.user._id,
      text: msgText,
    });
    await conversation.save();
  } catch (err) {
    console.error("Error creating conversation message for booking:", err);
  }

  const populated = await Booking.findById(booking._id)
    .populate("property", "title city address photos category rentPerMonth")
    .populate("host", "name email phone avatarUrl")
    .populate("guest", "name email phone avatarUrl");

  res.status(201).json({ booking: populated });
}

// GET /api/bookings/my-trips
async function getMyTrips(req, res) {
  const bookings = await Booking.find({ guest: req.user._id })
    .populate("property", "title city address photos category rentPerMonth ratingAvg")
    .populate("host", "name email phone avatarUrl")
    .sort({ createdAt: -1 });

  res.json({ bookings });
}

// GET /api/bookings/host-reservations
async function getHostReservations(req, res) {
  const bookings = await Booking.find({ host: req.user._id })
    .populate("property", "title city address photos category rentPerMonth")
    .populate("guest", "name email phone avatarUrl")
    .sort({ createdAt: -1 });

  res.json({ bookings });
}

// GET /api/bookings/:id
async function getBookingById(req, res) {
  const booking = await Booking.findById(req.params.id)
    .populate("property")
    .populate("host", "name email phone avatarUrl")
    .populate("guest", "name email phone avatarUrl");

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const isAuthorized =
    booking.guest._id.equals(req.user._id) || booking.host._id.equals(req.user._id);

  if (!isAuthorized) {
    return res.status(403).json({ message: "Not authorized to view this booking" });
  }

  res.json({ booking });
}

// PATCH /api/bookings/:id/status
async function updateBookingStatus(req, res) {
  const { status, cancellationReason } = req.body;
  const allowed = ["confirmed", "rejected", "cancelled", "completed"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${allowed.join(", ")}` });
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const isGuest = booking.guest.equals(req.user._id);
  const isHost = booking.host.equals(req.user._id);

  if (!isGuest && !isHost) {
    return res.status(403).json({ message: "Not authorized to modify this booking" });
  }

  // Permission rules
  if (["confirmed", "rejected"].includes(status) && !isHost) {
    return res.status(403).json({ message: "Only the host can confirm or reject a booking request" });
  }

  if (status === "cancelled") {
    if (booking.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel a completed trip" });
    }
    booking.cancellationReason = cancellationReason || "Cancelled by user";
    if (booking.paymentStatus === "paid") {
      booking.paymentStatus = "refunded";
    }
  }

  booking.status = status;
  await booking.save();

  // Notify via conversation thread
  try {
    const conversation = await Conversation.findOne({
      property: booking.property,
      customer: booking.guest,
    });
    if (conversation) {
      let statusMsg = `🔔 Booking status updated to: ${status.toUpperCase()}`;
      if (cancellationReason) {
        statusMsg += `\nReason: ${cancellationReason}`;
      }
      conversation.messages.push({
        sender: req.user._id,
        text: statusMsg,
      });
      await conversation.save();
    }
  } catch (err) {
    console.error("Error logging status update in conversation:", err);
  }

  const updated = await Booking.findById(booking._id)
    .populate("property", "title city address photos category")
    .populate("host", "name email phone avatarUrl")
    .populate("guest", "name email phone avatarUrl");

  res.json({ booking: updated });
}

// POST /api/bookings/:id/pay
async function payBooking(req, res) {
  const { paymentMethod = "card" } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (!booking.guest.equals(req.user._id)) {
    return res.status(403).json({ message: "Only the guest can pay for this booking" });
  }

  if (booking.paymentStatus === "paid") {
    return res.status(400).json({ message: "Booking is already paid" });
  }

  if (booking.status === "cancelled" || booking.status === "rejected") {
    return res.status(400).json({ message: `Cannot pay for a ${booking.status} booking` });
  }

  booking.paymentStatus = "paid";
  booking.status = "confirmed";
  booking.paymentDetails = {
    transactionId: "TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    paymentMethod,
    paidAt: new Date(),
  };

  await booking.save();

  // Notify conversation
  try {
    const conversation = await Conversation.findOne({
      property: booking.property,
      customer: booking.guest,
    });
    if (conversation) {
      conversation.messages.push({
        sender: req.user._id,
        text: `💳 Payment of ₹${booking.totalPrice.toLocaleString("en-IN")} received via ${paymentMethod.toUpperCase()}! Booking is now CONFIRMED.`,
      });
      await conversation.save();
    }
  } catch (err) {
    console.error("Error sending payment notification to conversation:", err);
  }

  const updated = await Booking.findById(booking._id)
    .populate("property", "title city address photos category")
    .populate("host", "name email phone avatarUrl")
    .populate("guest", "name email phone avatarUrl");

  res.json({ booking: updated });
}

module.exports = {
  getPropertyAvailability,
  createBooking,
  getMyTrips,
  getHostReservations,
  getBookingById,
  updateBookingStatus,
  payBooking,
};
