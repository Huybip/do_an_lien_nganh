"use strict";

const DayOff = require("../models/DayOff");
const Doctor = require("../models/Doctor");
const { sendSuccess, sendError } = require("../utils/response");

// GET /api/days-off
const getAll = async (req, res) => {
  try {
    const filter = {};
    // If a doctor calls, they see clinic-wide days off AND their own days off
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (doctor) {
        filter.$or = [{ doctor: null }, { doctor: doctor._id }];
      } else {
        filter.doctor = null;
      }
    }

    const daysOff = await DayOff.find(filter)
      .populate({
        path: "doctor",
        select: "name email specialization"
      })
      .sort({ date: 1 });

    return sendSuccess(res, 200, "Days off retrieved", daysOff);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// POST /api/days-off [admin only]
const create = async (req, res) => {
  try {
    const { date, description, doctorId } = req.body;

    if (!date) {
      return sendError(res, 400, "Date is required.");
    }

    let doctor = null;
    if (doctorId) {
      doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return sendError(res, 404, "Doctor not found.");
      }
    }

    // Check duplicate
    const existing = await DayOff.findOne({ date, doctor: doctor ? doctor._id : null });
    if (existing) {
      return sendError(res, 409, "Day off already scheduled for this date.");
    }

    const dayOff = await DayOff.create({
      date,
      description,
      doctor: doctor ? doctor._id : null,
    });

    if (doctor) {
      await dayOff.populate({ path: "doctor", select: "name email specialization" });
    }

    return sendSuccess(res, 201, "Day off created successfully", dayOff);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// DELETE /api/days-off/:id [admin only]
const remove = async (req, res) => {
  try {
    const dayOff = await DayOff.findByIdAndDelete(req.params.id);
    if (!dayOff) {
      return sendError(res, 404, "Day off not found.");
    }
    return sendSuccess(res, 200, "Day off deleted successfully");
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

module.exports = {
  getAll,
  create,
  remove,
};
