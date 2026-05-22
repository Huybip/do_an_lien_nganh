"use strict";

const router = require("express").Router();

router.use("/auth", require("./authRoutes"));
router.use("/admin", require("./adminRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/patients", require("./patientRoutes"));
router.use("/doctors", require("./doctorRoutes"));
router.use("/appointments", require("./appointmentRoutes"));
router.use("/records", require("./recordRoutes"));
router.use("/services", require("./serviceRoutes"));
router.use("/images", require("./imageRoutes"));
router.use("/scores", require("./scoreRoutes"));
router.use("/payments", require("./paymentRoutes"));
router.use("/shifts", require("./shiftRoutes"));
router.use("/chat", require("./chatRoutes"));
router.use("/conversations", require("./conversationRoutes"));
router.use("/predict", require("./predictionRoutes"));
router.use("/voice", require("./voiceRoutes"));

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "VinaMec API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
