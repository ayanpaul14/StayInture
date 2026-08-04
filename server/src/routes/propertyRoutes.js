const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createProperty,
  getProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
} = require("../controllers/propertyController");

const router = express.Router();

// NOTE: any logged-in user can call createProperty - that's what turns
// their account into a host account (see propertyController.createProperty).
router.post("/", protect, createProperty);
router.get("/mine", protect, getMyProperties);
router.get("/:id", getProperty); // public - anyone can view a listing
router.patch("/:id", protect, updateProperty);
router.delete("/:id", protect, deleteProperty);

module.exports = router;
