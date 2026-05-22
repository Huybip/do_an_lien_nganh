"use strict";

const router = require("express").Router();
const {
  getAll,
  getMine,
  getById,
  create,
  update,
  cancel,
  remove,
  getStats,
  getAvailableSlots,
  approve,
  reject,
  complete,
} = require("../controllers/appointmentController");
const { auth, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const Joi = require("joi");

const createSchema = {
  body: Joi.object({
    doctorId: Joi.string().required(),
    serviceId: Joi.string().allow("", null),
    serviceName: Joi.string().allow("", null),
    date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
    shiftType: Joi.string()
      .valid("morning", "afternoon", "evening")
      .required(),
    notes: Joi.string().allow("", null),
  }),
};

// Stats
router.get("/stats", auth, authorize("admin", "doctor"), getStats);

// Available slots for booking
router.get("/slots", auth, getAvailableSlots);

// Patient routes
router.get("/me", auth, authorize("patient"), getMine);
router.post("/", auth, authorize("patient"), validate(createSchema), create);

// Shared (ownership enforced in controller)
router.get("/:id", auth, getById);
router.put("/:id/cancel", auth, cancel);
router.put("/:id/approve", auth, authorize("doctor"), approve);
router.put("/:id/reject", auth, authorize("doctor"), reject);
router.put("/:id/complete", auth, authorize("admin", "doctor"), complete);

// Doctor + Admin management
router.get("/", auth, authorize("admin", "doctor"), getAll);
router.put("/:id", auth, authorize("admin", "doctor"), update);
router.delete("/:id", auth, authorize("admin"), remove);

module.exports = router;
