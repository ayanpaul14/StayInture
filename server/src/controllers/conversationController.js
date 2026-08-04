const Conversation = require("../models/Conversation");
const Property = require("../models/Property");

// POST /api/conversations   { propertyId, message }
// Starts a conversation (or reuses the existing one) between the logged-in
// customer and the property's host, and adds the first message.
async function startOrContinueConversation(req, res) {
  const { propertyId, message } = req.body;
  if (!propertyId || !message) {
    return res.status(400).json({ message: "propertyId and message are required" });
  }

  const property = await Property.findById(propertyId);
  if (!property) return res.status(404).json({ message: "Property not found" });

  if (property.host.equals(req.user._id)) {
    return res.status(400).json({ message: "You can't message yourself about your own listing" });
  }

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

  conversation.messages.push({ sender: req.user._id, text: message });
  await conversation.save();

  res.status(201).json({ conversation });
}

// GET /api/conversations
// Returns every conversation the logged-in user is part of, as either
// customer or host - lets one screen serve both roles.
async function getMyConversations(req, res) {
  const conversations = await Conversation.find({
    $or: [{ customer: req.user._id }, { host: req.user._id }],
  })
    .populate("property", "title city photos")
    .populate("customer", "name avatarUrl")
    .populate("host", "name avatarUrl")
    .sort({ updatedAt: -1 });

  res.json({ conversations });
}

// POST /api/conversations/:id/messages   { message }
async function sendMessage(req, res) {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "Message text is required" });

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) return res.status(404).json({ message: "Conversation not found" });

  const isParticipant =
    conversation.customer.equals(req.user._id) || conversation.host.equals(req.user._id);
  if (!isParticipant) {
    return res.status(403).json({ message: "Not part of this conversation" });
  }

  conversation.messages.push({ sender: req.user._id, text: message });
  await conversation.save();
  res.status(201).json({ conversation });
}

// PATCH /api/conversations/:id/visit   { status, visitDate? }
// Customer requests a visit; host confirms/declines.
async function updateVisitStatus(req, res) {
  const { status, visitDate } = req.body;
  const allowed = ["requested", "confirmed", "declined", "completed"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${allowed.join(", ")}` });
  }

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) return res.status(404).json({ message: "Conversation not found" });

  const isCustomer = conversation.customer.equals(req.user._id);
  const isHost = conversation.host.equals(req.user._id);
  if (!isCustomer && !isHost) {
    return res.status(403).json({ message: "Not part of this conversation" });
  }

  // Only the customer can request; only the host can confirm/decline
  if (status === "requested" && !isCustomer) {
    return res.status(403).json({ message: "Only the customer can request a visit" });
  }
  if (["confirmed", "declined"].includes(status) && !isHost) {
    return res.status(403).json({ message: "Only the host can confirm or decline a visit" });
  }

  conversation.visitStatus = status;
  if (visitDate) conversation.visitDate = visitDate;
  await conversation.save();

  res.json({ conversation });
}

module.exports = {
  startOrContinueConversation,
  getMyConversations,
  sendMessage,
  updateVisitStatus,
};
