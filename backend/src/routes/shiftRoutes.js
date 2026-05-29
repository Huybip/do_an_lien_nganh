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
  getByDoctor,
  getAvailableByDate,
  getUpcoming,
  getConfigs,
  updateConfigs,
} = require("../controllers/shiftController");
const { auth, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const Joi = require("joi");

const createSchema = {
  body: Joi.object({
    date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
    shiftType: Joi.string()
      .valid("morning", "afternoon", "evening")
      .required(),
    startTime: Joi.string()
      .pattern(/^\d{2}:\d{2}$/)
      .allow("", null),
    endTime: Joi.string()
      .pattern(/^\d{2}:\d{2}$/)
      .allow("", null),
    maxPatients: Joi.number().min(1).max(20).allow("", null),
    notes: Joi.string().allow("", null),
    doctorId: Joi.string().allow("", null),
  }),
};

const updateSchema = {
  body: Joi.object({
    date:       Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow("", null),
    shiftType:  Joi.string().valid("morning", "afternoon", "evening").allow("", null),
    startTime:  Joi.string().pattern(/^\d{2}:\d{2}$/).allow("", null),
    endTime:    Joi.string().pattern(/^\d{2}:\d{2}$/).allow("", null),
    maxPatients: Joi.number().min(1).max(20).allow("", null),
    notes:      Joi.string().allow("", null),
  }),
};

// Config routes
router.get("/configs",  auth, getConfigs);
router.put("/configs",  auth, authorize("admin"), updateConfigs);

// Shared upcoming
router.get("/upcoming", auth, getUpcoming);

// Doctor & Admin routes
router.get("/me",  auth, authorize("doctor"), getMine);
router.post("/",    auth, authorize("doctor", "admin"), validate(createSchema), create);
router.put("/:id", auth, authorize("doctor", "admin"), validate(updateSchema), update);
router.delete("/:id/cancel", auth, authorize("doctor", "admin"), cancel);

// Admin routes
router.get("/",      auth, authorize("admin"), getAll);
router.delete("/:id", auth, authorize("admin"), remove);

// Shared
router.get("/by-doctor/:doctorId", auth, getByDoctor);
router.get("/available",           auth, getAvailableByDate);
router.get("/:id",                auth, getById);

module.exports = router;
