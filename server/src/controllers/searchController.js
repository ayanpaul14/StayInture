const Property = require("../models/Property");

// GET /api/search?lat=..&lng=..&radiusKm=2&category=flat&minRent=&maxRent=&q=
// Powers the "nearest properties" home screen search, plus free-text search
// on title/city/address via `q` (used by the search bar on the Explore page).
async function searchProperties(req, res) {
  const { lat, lng, radiusKm = 2, category, minRent, maxRent, q } = req.query;

  const query = { isActive: true };

  // Geo radius search only applies when we have coordinates (from the
  // browser's geolocation). If lat/lng are missing but `q` is present,
  // fall back to a plain text search with no distance sort.
  if (lat && lng) {
    const radiusMeters = Number(radiusKm) * 1000;
    query.location = {
      $near: {
        $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
        $maxDistance: radiusMeters,
      },
    };
  } else if (!q) {
    return res.status(400).json({
      message: "Provide lat and lng, or a search term (q)",
    });
  }

  if (category) query.category = category;
  if (minRent || maxRent) {
    query.rentPerMonth = {};
    if (minRent) query.rentPerMonth.$gte = Number(minRent);
    if (maxRent) query.rentPerMonth.$lte = Number(maxRent);
  }
  if (q) {
    const regex = new RegExp(q.trim(), "i");
    query.$or = [{ title: regex }, { city: regex }, { address: regex }];
  }

  // $near already sorts by distance, closest first (when present)
  const properties = await Property.find(query).limit(50).populate(
    "host",
    "name rating"
  );

  res.json({ count: properties.length, properties });
}

module.exports = { searchProperties };