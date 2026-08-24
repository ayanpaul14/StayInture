const Property = require("../models/Property");

// GET /api/search?lat=..&lng=..&radiusKm=2&category=flat&minRent=&maxRent=&q=
// Powers the "nearest properties" home screen search, plus free-text search
// on title/city/address via `q` (used by the search bar on the Explore page).
async function searchProperties(req, res) {
  const { lat, lng, radiusKm = 2, category, minRent, maxRent, q } = req.query;

  const baseQuery = { isActive: true };

  if (category) baseQuery.category = category;
  if (minRent || maxRent) {
    baseQuery.rentPerMonth = {};
    if (minRent) baseQuery.rentPerMonth.$gte = Number(minRent);
    if (maxRent) baseQuery.rentPerMonth.$lte = Number(maxRent);
  }
  if (q) {
    const regex = new RegExp(q.trim(), "i");
    baseQuery.$or = [{ title: regex }, { city: regex }, { address: regex }];
  }

  let query = { ...baseQuery };

  if (lat && lng) {
    const radiusMeters = Number(radiusKm) * 1000;
    query.location = {
      $near: {
        $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
        $maxDistance: radiusMeters,
      },
    };
  }

  let properties = [];
  try {
    properties = await Property.find(query).limit(50).populate("host", "name rating");
  } catch (err) {
    // If $near query fails or index missing, fall back to basic query
    properties = await Property.find(baseQuery).sort({ createdAt: -1 }).limit(50).populate("host", "name rating");
  }

  // If strict radius cutoff returned 0 properties, fall back to showing nearest active properties
  if (properties.length === 0 && lat && lng) {
    try {
      const fallbackQuery = { ...baseQuery };
      fallbackQuery.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
        },
      };
      properties = await Property.find(fallbackQuery).limit(50).populate("host", "name rating");
    } catch (err) {
      properties = await Property.find(baseQuery).sort({ createdAt: -1 }).limit(50).populate("host", "name rating");
    }
  }

  // Final fallback to ensure all listed properties are returned
  if (properties.length === 0) {
    properties = await Property.find(baseQuery).sort({ createdAt: -1 }).limit(50).populate("host", "name rating");
  }

  res.json({ count: properties.length, properties });
}

module.exports = { searchProperties };