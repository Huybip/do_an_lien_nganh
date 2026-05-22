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

// Doctor routes
router.get("/me",  auth, authorize("doctor"), getMine);
router.post("/",    auth, authorize("doctor"), validate(createSchema), create);
router.put("/:id", auth, authorize("doctor"), validate(updateSchema), update);
router.delete("/:id/cancel", auth, authorize("doctor"), cancel);

// Admin routes
router.get("/",      auth, authorize("admin"), getAll);
router.delete("/:id", auth, authorize("admin"), remove);

// Shared
router.get("/by-doctor/:doctorId", auth, getByDoctor);
router.get("/available",           auth, getAvailableByDate);
router.get("/:id",                auth, getById);

module.exports = router;
