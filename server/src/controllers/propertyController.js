const Property = require("../models/Property");
const User = require("../models/User");

// POST /api/properties
// Creating your first property is what flips isHost to true on the account.
async function createProperty(req, res) {
  const {
    category, title, description, address, city,
    longitude, latitude, rentPerMonth, securityDeposit,
    bedrooms, bathrooms, floors, roomSharing, foodIncluded,
    amenities, photos,
  } = req.body;

  if (!category || !title || !address || !city || !rentPerMonth) {
    return res.status(400).json({ message: "Missing required listing fields" });
  }
  if (longitude === undefined || latitude === undefined) {
    return res.status(400).json({ message: "Property location (longitude, latitude) is required" });
  }

  const validPhotos = Array.isArray(photos) ? photos.filter((p) => typeof p === "string" && p.trim().length > 0) : [];
  if (validPhotos.length === 0) {
    return res.status(400).json({ message: "At least one property photo is required to publish a listing." });
  }

  const property = await Property.create({
    host: req.user._id,
    category,
    title,
    description,
    address,
    city,
    location: { type: "Point", coordinates: [longitude, latitude] },
    rentPerMonth,
    securityDeposit,
    bedrooms,
    bathrooms,
    floors,
    roomSharing,
    foodIncluded,
    amenities,
    photos,
  });

  // First listing makes this account a host from now on
  if (!req.user.isHost) {
    req.user.isHost = true;
    req.user.activeRole = "host";
    await req.user.save();
  }

  res.status(201).json({ property });
}

// GET /api/properties/:id
async function getProperty(req, res) {
  const property = await Property.findById(req.params.id).populate(
    "host",
    "name avatarUrl rating ratingCount"
  );
  if (!property) return res.status(404).json({ message: "Property not found" });
  res.json({ property });
}

// PATCH /api/properties/:id  (host must own the listing)
async function updateProperty(req, res) {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found" });
  if (!property.host.equals(req.user._id)) {
    return res.status(403).json({ message: "You can only edit your own listings" });
  }

  const updatable = [
    "title", "description", "rentPerMonth", "securityDeposit",
    "bedrooms", "bathrooms", "floors", "roomSharing", "foodIncluded",
    "amenities", "photos", "isActive",
  ];
  updatable.forEach((field) => {
    if (req.body[field] !== undefined) property[field] = req.body[field];
  });

  // Allow moving the pin if the host corrects the address
  if (req.body.longitude !== undefined && req.body.latitude !== undefined) {
    property.location = { type: "Point", coordinates: [req.body.longitude, req.body.latitude] };
  }

  await property.save();
  res.json({ property });
}

// DELETE /api/properties/:id  (host must own the listing)
async function deleteProperty(req, res) {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found" });
  if (!property.host.equals(req.user._id)) {
    return res.status(403).json({ message: "You can only delete your own listings" });
  }

  await property.deleteOne();
  res.json({ message: "Listing deleted" });
}

// GET /api/properties/mine  - host dashboard "My listings"
async function getMyProperties(req, res) {
  const properties = await Property.find({ host: req.user._id }).sort({ createdAt: -1 });
  res.json({ properties });
}

module.exports = {
  createProperty,
  getProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
};
