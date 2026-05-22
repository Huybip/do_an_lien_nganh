"use strict";

const router = require("express").Router();
const { generateQR, confirmQRPayment } = require("../controllers/qrPaymentController");
const { auth, authorize } = require("../middleware/auth");

// POST /api/payments/qr/generate - Generate QR code for payment (admin only)
router.post("/qr/generate", auth, authorize("admin"), generateQR);

// POST /api/payments/qr/confirm - Confirm QR payment received (admin only)
router.post("/qr/confirm", auth, authorize("admin"), confirmQRPayment);

module.exports = router;
