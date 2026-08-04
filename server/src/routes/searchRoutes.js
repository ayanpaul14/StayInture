const express = require("express");
const { searchProperties } = require("../controllers/searchController");

const router = express.Router();

// Public - browsing doesn't require login
router.get("/", searchProperties);

module.exports = router;
