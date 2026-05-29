"use strict";

const router = require("express").Router();
const { getAll, create, remove } = require("../controllers/dayOffController");
const { auth, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const Joi = require("joi");

const createSchema = {
  body: Joi.object({
    date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
    description: Joi.string().required(),
    doctorId: Joi.string().allow("", null),
  }),
};

router.get("/", auth, getAll);
router.post("/", auth, authorize("admin"), validate(createSchema), create);
router.delete("/:id", auth, authorize("admin"), remove);

module.exports = router;
