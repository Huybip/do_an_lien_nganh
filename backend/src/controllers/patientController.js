"use strict";

const Patient = require("../models/Patient");
const User = require("../models/User");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response");
const { getPagination, buildSort } = require("../utils/pagination");

const ALLOWED_SORT = ["name", "email", "createdAt"];

// GET /api/patients  [admin, doctor]
const getAll = async (req, res) => {
  try {
    console.log("[PATIENT GETALL] user:", req.user?._id, req.user?.role);
    const { page, limit, skip } = getPagination(req.query);
    const sort = buildSort(req.query, ALLOWED_SORT);
    const filter = { isActive: true };

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
        { phone: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .populate("user", "name email role isActive lastLogin")
        .populate("assignedDoctor", "name specialization")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Patient.countDocuments(filter),
    ]);

    console.log("[PATIENT GETALL] found:", patients.length, "total:", total);
    return sendPaginated(res, patients, total, page, limit);
  } catch (err) {
    console.error("[PATIENT GETALL] ERROR:", err);
    return sendError(res, 500, err.message);
  }
};

// GET /api/patients/me  [patient]
const getMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id })
      .populate("user", "name email role lastLogin")
      .populate("assignedDoctor", "name specialization");

    if (!patient) return sendError(res, 404, "Patient profile not found.");
    return sendSuccess(res, 200, "Patient profile retrieved", patient);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /api/patients/:id  [admin, doctor, or self]
const getById = async (req, res) => {
  try {
    console.log("[PATIENT GETBYID] params.id:", req.params.id);
    const patient = await Patient.findById(req.params.id)
      .populate("user", "name email role lastLogin")
      .populate("assignedDoctor", "name specialization");

    if (!patient) {
      console.log("[PATIENT GETBYID] Not found for id:", req.params.id);
      return sendError(res, 404, "Patient not found.");
    }

    console.log("[PATIENT GETBYID] Found:", patient._id, "user:", patient.user?._id || patient.user);

    // Patient can only view own profile
    if (
      req.user.role === "patient" &&
      patient.user._id.toString() !== req.user._id.toString()
    ) {
      return sendError(
        res,
        403,
        "Access denied. You can only view your own profile.",
      );
    }

    return sendSuccess(res, 200, "Patient retrieved", patient);
  } catch (err) {
    console.error("[PATIENT GETBYID] ERROR:", err.message, err.stack);
    return sendError(res, 500, err.message);
  }
};

// PUT /api/patients/me  [patient – update own]
const updateMyProfile = async (req, res) => {
  try {
    const forbidden = ["user", "isActive"];
    forbidden.forEach((f) => delete req.body[f]);

    const patient = await Patient.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true, runValidators: true },
    ).populate("user", "name email role");

    if (!patient) return sendError(res, 404, "Patient profile not found.");
    return sendSuccess(res, 200, "Profile updated", patient);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// PUT /api/patients/:id  [admin or patient (own record)]
const update = async (req, res) => {
  try {
    let patient = await Patient.findById(req.params.id);

    // If patient not found by ID and user is a patient, try finding by user ID
    // (patient may have provided their user ID instead of patient ID)
    if (!patient && req.user.role === "patient") {
      patient = await Patient.findOne({ user: req.params.id });
    }

    if (!patient) return sendError(res, 404, "Patient not found.");

    // Patient can only update own record
    if (
      req.user.role === "patient" &&
      patient.user._id.toString() !== req.user._id.toString()
    ) {
      return sendError(
        res,
        403,
        "Access denied. You can only update your own profile.",
      );
    }

    delete req.body.user;
    const updated = await Patient.findByIdAndUpdate(patient._id, req.body, {
      new: true,
      runValidators: true,
    }).populate("user", "name email role");

    return sendSuccess(res, 200, "Patient updated", updated);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// DELETE /api/patients/:id  [admin]
const remove = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!patient) return sendError(res, 404, "Patient not found.");
    return sendSuccess(res, 200, "Patient deactivated");
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

module.exports = {
  getAll,
  getMyProfile,
  getById,
  updateMyProfile,
  update,
  remove,
};
