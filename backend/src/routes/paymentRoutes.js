"use strict";

const router = require("express").Router();
const {
  getAll,
  getMine,
  getById,
  create,
  update,
  getStats,
  remove,
  confirmPayment,
} = require("../controllers/paymentController");
const { generateQR, confirmQRPayment } = require("../controllers/qrPaymentController");
const { auth, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const Joi = require("joi");

const createSchema = {
  body: Joi.object({
    patientId: Joi.string().required(),
    appointmentId: Joi.string().allow("", null),
    amount: Joi.number().min(0).required(),
    method: Joi.string()
      .valid("cash", "bank_transfer", "momo", "vnpay", "zalo_pay", "insurance", "other")
      .default("cash"),
    status: Joi.string()
      .valid("pending", "paid", "failed", "refunded", "cancelled")
      .default("pending"),
    description: Joi.string().allow("", null),
    services: Joi.array()
      .items(Joi.object({ name: Joi.string().required(), price: Joi.number().required() }))
      .allow(null),
    discount: Joi.number().min(0).default(0),
    tax: Joi.number().min(0).default(0),
    reason: Joi.string().allow("", null),
    notes: Joi.string().allow("", null),
  }),
};

const updateSchema = {
  body: Joi.object({
    status: Joi.string()
      .valid("pending", "paid", "failed", "refunded", "cancelled")
      .allow("", null),
    method: Joi.string()
      .valid("cash", "bank_transfer", "momo", "vnpay", "zalo_pay", "insurance", "other")
      .allow("", null),
    amount: Joi.number().min(0).allow("", null),
    discount: Joi.number().min(0).allow("", null),
    tax: Joi.number().min(0).allow("", null),
    reason: Joi.string().allow("", null),
    notes: Joi.string().allow("", null),
  }),
};

// Admin: full access
router.get("/", auth, authorize("admin"), getAll);
router.post("/", auth, authorize("admin"), validate(createSchema), create);
router.get("/stats", auth, authorize("admin"), getStats);
router.get("/:id", auth, authorize("admin"), getById);
router.put("/:id", auth, authorize("admin"), validate(updateSchema), update);
router.delete("/:id", auth, authorize("admin"), remove);

// Patient: view own payments
router.get("/me", auth, authorize("patient"), getMine);

// ── QR Payment routes ──────────────────────────────────────────────────────────
// POST /api/payments/qr/generate - Generate QR code for MBBank payment (admin + doctor)
router.post("/qr/generate", auth, authorize("admin", "doctor"), generateQR);

// POST /api/payments/qr/confirm - Admin/doctor confirms QR transfer received
router.post("/qr/confirm", auth, authorize("admin", "doctor"), confirmQRPayment);

// POST /api/payments/confirm - Admin confirms a pending payment as paid
router.post("/confirm", auth, authorize("admin"), confirmPayment);

module.exports = router;
