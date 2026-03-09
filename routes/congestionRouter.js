const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const congestion = require("../controllers/congestionController");

// All routes require login
router.use(auth.protect);

// Full prediction page data
router.get("/", congestion.getCongestionPrediction);

// Lightweight — for dashboard card
router.get("/now", congestion.getCongestionNow);

module.exports = router;

// ── Mount in app.js ──────────────────────────────────────
// app.use("/api/v1/gymspire/congestion", require("./routes/congestionRouter"));
