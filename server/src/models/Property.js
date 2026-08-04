const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    category: {
      type: String,
      enum: ["flat", "bungalow", "pg"],
      required: true,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    address: { type: String, required: true },
    city: { type: String, required: true },

    // GeoJSON Point - powers the "nearest properties" radius search
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        // [longitude, latitude] -- GeoJSON order, not [lat, lng]
        type: [Number],
        required: true,
      },
    },

    rentPerMonth: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },

    // Category-specific fields - only some apply depending on `category`
    bedrooms: { type: Number }, // flat / bungalow
    bathrooms: { type: Number }, // flat / bungalow
    floors: { type: Number }, // bungalow
    roomSharing: { type: String, enum: ["single", "double", "triple"] }, // pg
    foodIncluded: { type: Boolean, default: false }, // pg

    amenities: [{ type: String }], // e.g. ["WiFi", "Power backup", "Parking"]
    photos: [{ type: String }], // Cloudinary URLs

    isActive: { type: Boolean, default: true },

    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 2dsphere index is required for $near / $geoWithin radius queries
propertySchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Property", propertySchema);
