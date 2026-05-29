"use strict";

const MedicalRecord = require("../models/MedicalRecord");
const User = require("../models/User");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response");
const { getPagination, buildSort } = require("../utils/pagination");

const ALLOWED_SORT = ["date", "createdAt", "diagnosis"];

// GET /api/records  [admin, doctor]
const getAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const sort = buildSort(req.query, ALLOWED_SORT);
    const filter = {};

    if (req.user.role === "doctor") filter.doctor = req.user._id;
    if (req.query.patientId) filter.patient = req.query.patientId;
    if (req.query.search) {
      filter.$or = [
        { diagnosis: { $regex: req.query.search, $options: "i" } },
        { patientName: { $regex: req.query.search, $options: "i" } },
        { treatment: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const [records, total] = await Promise.all([
      MedicalRecord.find(filter)
        .populate("patient", "name email phone")
        .populate("doctor", "name email specialization")
        .populate("appointment", "date time serviceName")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      MedicalRecord.countDocuments(filter),
    ]);

    return sendPaginated(res, records, total, page, limit);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /api/records/me  [patient]
const getMine = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const [records, total] = await Promise.all([
      MedicalRecord.find({ patient: req.user._id })
        .populate("doctor", "name email specialization")
        .populate("appointment", "date time serviceName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MedicalRecord.countDocuments({ patient: req.user._id }),
    ]);

    return sendPaginated(res, records, total, page, limit);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /api/records/:id  [admin, doctor, or patient-owner]
const getById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate("patient", "name email phone")
      .populate("doctor", "name email specialization")
      .populate("appointment", "date time serviceName");

    if (!record) return sendError(res, 404, "Medical record not found.");

    if (
      req.user.role === "patient" &&
      record.patient._id.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, "Access denied. This is not your record.");
    }

    return sendSuccess(res, 200, "Medical record retrieved", record);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// POST /api/records  [doctor, admin]
const create = async (req, res) => {
  try {
    const {
      patientId,
      appointmentId,
      date,
      type,
      chiefComplaint,
      diagnosis,
      treatment,
      prescription,
      notes,
      teeth,
      vitalSigns,
      followUpDate,
      doctorId,
    } = req.body;

    // Validate patient - try as Patient ID first, then as User ID
    const Patient = require("../models/Patient");
    let patientRecord = await Patient.findById(patientId);
    let userId = patientId;
    let patientName = "";

    if (patientRecord) {
      // patientId is a Patient ID
      userId = patientRecord.user.toString();
      patientName = patientRecord.name;
    } else {
      // patientId might be a User ID - verify it's a patient
      const user = await User.findById(patientId);
      if (!user || user.role !== "patient") {
        return sendError(res, 404, "Patient not found.");
      }
      patientName = user.name;
      userId = patientId;
    }

    // Resolve doctor record
    let doctorUserId = req.user._id;
    let doctorName = req.user.name;

    if (req.user.role === "admin") {
      if (!doctorId) {
        return sendError(res, 400, "doctorId is required when admin creates a medical record.");
      }
      const Doctor = require("../models/Doctor");
      let doctorRecord = await Doctor.findById(doctorId).populate("user");
      if (doctorRecord) {
        doctorUserId = doctorRecord.user._id || doctorRecord.user;
        doctorName = doctorRecord.name;
      } else {
        const userDoc = await User.findById(doctorId);
        if (userDoc && userDoc.role === "doctor") {
          doctorUserId = userDoc._id;
          doctorName = userDoc.name;
        } else {
          return sendError(res, 404, "Doctor not found.");
        }
      }
    }

    const record = await MedicalRecord.create({
      patient: userId,
      patientName,
      doctor: doctorUserId,
      doctorName,
      appointment: appointmentId || undefined,
      date: date || new Date().toISOString().split("T")[0],
      type: type || "examination",
      chiefComplaint,
      diagnosis,
      treatment,
      prescription,
      notes,
      teeth,
      vitalSigns,
      followUpDate,
    });

    await record.populate([
      { path: "patient", select: "name email" },
      { path: "doctor", select: "name email specialization" },
    ]);

    return sendSuccess(res, 201, "Medical record created", record);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// PUT /api/records/:id  [doctor-owner, admin]
const update = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return sendError(res, 404, "Medical record not found.");

    if (
      req.user.role === "doctor" &&
      record.doctor.toString() !== req.user._id.toString()
    ) {
      return sendError(
        res,
        403,
        "Access denied. You can only edit your own records.",
      );
    }

    const allowed = [
      "chiefComplaint",
      "diagnosis",
      "treatment",
      "prescription",
      "notes",
      "teeth",
      "vitalSigns",
      "followUpDate",
      "attachments",
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) record[field] = req.body[field];
    });

    await record.save();
    return sendSuccess(res, 200, "Medical record updated", record);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// DELETE /api/records/:id  [admin only]
const remove = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndDelete(req.params.id);
    if (!record) return sendError(res, 404, "Medical record not found.");
    return sendSuccess(res, 200, "Medical record deleted");
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

module.exports = { getAll, getMine, getById, create, update, remove };
