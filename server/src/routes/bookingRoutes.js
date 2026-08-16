const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getPropertyAvailability,
  createBooking,
  getMyTrips,
  getHostReservations,
  getBookingById,
  updateBookingStatus,
  payBooking,
} = require("../controllers/bookingController");

// Public route for checking unavailable dates
router.get("/availability/:propertyId", getPropertyAvailability);

// Authenticated routes
router.use(protect);

router.post("/", createBooking);
router.get("/my-trips", getMyTrips);
router.get("/host-reservations", getHostReservations);
router.get("/:id", getBookingById);
router.patch("/:id/status", updateBookingStatus);
router.post("/:id/pay", payBooking);

module.exports = router;
