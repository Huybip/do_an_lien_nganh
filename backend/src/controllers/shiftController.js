"use strict";

const Shift = require("../models/Shift");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response");
const { getPagination, buildSort } = require("../utils/pagination");

// ── Helper: resolve Doctor Model _id from auth user ────────────────────────────
const resolveDoctorId = async (userId) => {
  const doc = await Doctor.findOne({ user: userId });
  return doc?._id || null;
};

// ── Shift type labels & time ranges ────────────────────────────────────────────
const SHIFT_CONFIG = {
  morning:   { label: "Ca sáng",    start: "08:00", end: "12:00", color: "#f59e0b" },
  afternoon: { label: "Ca chiều",   start: "13:00", end: "17:00", color: "#8b5cf6" },
  evening:   { label: "Ca tối",     start: "18:00", end: "21:00", color: "#0ea5e9" },
};

// ── GET /api/shifts  [admin, doctor]
const getAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const sort = buildSort(req.query, ["date", "shiftType", "createdAt"]);
    const filter = {};

    if (req.user.role === "doctor") {
      filter.doctorId = await resolveDoctorId(req.user._id);
    }
    if (req.query.date)       filter.date       = req.query.date;
    if (req.query.doctorId)   filter.doctorId   = req.query.doctorId;
    if (req.query.shiftType)  filter.shiftType  = req.query.shiftType;
    if (req.query.status)     filter.status     = req.query.status;

    const [shifts, total] = await Promise.all([
      Shift.find(filter)
        .populate("doctor", "name email specialization")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Shift.countDocuments(filter),
    ]);

    return sendPaginated(res, shifts, total, page, limit);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ── GET /api/shifts/me  [doctor – own shifts]
const getMine = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const doctorId = await resolveDoctorId(req.user._id);
    const filter = {};
    if (doctorId) filter.doctorId = doctorId;
    if (req.query.date)       filter.date       = req.query.date;
    if (req.query.shiftType)  filter.shiftType  = req.query.shiftType;
    if (req.query.status)     filter.status     = req.query.status;

    const [shifts, total] = await Promise.all([
      Shift.find(filter)
        .sort({ date: 1, shiftType: 1 })
        .skip(skip)
        .limit(limit),
      Shift.countDocuments(filter),
    ]);

    return sendPaginated(res, shifts, total, page, limit);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ── GET /api/shifts/:id
const getById = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id)
      .populate("doctor", "name email specialization");
    if (!shift) return sendError(res, 404, "Shift not found.");
    return sendSuccess(res, 200, "Shift retrieved", shift);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ── POST /api/shifts  [doctor – register own shift]
const create = async (req, res) => {
  try {
    const { date, shiftType, startTime, endTime, maxPatients, notes } = req.body;

    // Validate shift type
    if (!SHIFT_CONFIG[shiftType]) {
      return sendError(res, 400, "Shift type must be morning, afternoon, or evening.");
    }

    // Default times if not provided
    const cfg = SHIFT_CONFIG[shiftType];
    const resolvedStart = startTime || cfg.start;
    const resolvedEnd   = endTime   || cfg.end;

    // Validate date is not in the past
    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      return sendError(res, 400, "Cannot register a shift for a past date.");
    }

    // req.user._id = User ID. We need Doctor Model _id for the shift.
    // Lookup the Doctor record to get the correct doctorId.
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return sendError(res, 404, "Doctor profile not found.");
    }

    // Check duplicate: same doctor + same date + same shiftType
    const existing = await Shift.findOne({ doctorId: doctor._id, date, shiftType });
    if (existing) {
      return sendError(
        res, 409,
        `Bạn đã đăng ký ca ${cfg.label} ngày ${date} rồi. Không thể đăng ký trùng.`
      );
    }

    const shift = await Shift.create({
      doctor:     req.user._id,  // User ID – used in Appointment.doctor queries
      doctorId:   doctor._id,    // Doctor Model _id – matches doctorApi.getAll() output
      doctorName: doctor.name,
      date,
      shiftType,
      startTime:  resolvedStart,
      endTime:    resolvedEnd,
      maxPatients: maxPatients || 5,
      notes:      notes || "",
      status:     "active",
    });

    return sendSuccess(res, 201, `Đăng ký ca ${cfg.label} thành công!`, shift);
  } catch (err) {
    // MongoDB duplicate key error
    if (err.code === 11000) {
      return sendError(res, 409, "Ca trực này đã tồn tại. Không thể đăng ký trùng.");
    }
    return sendError(res, 500, err.message);
  }
};

// ── PUT /api/shifts/:id  [doctor – update own shift]
const update = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) return sendError(res, 404, "Shift not found.");

    if (shift.doctor.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Access denied. Not your shift.");
    }

    if (shift.status === "cancelled") {
      return sendError(res, 400, "Cannot update a cancelled shift.");
    }

    // Check for duplicate on new date/shiftType combo (excluding self)
    const { date, shiftType, startTime, endTime, maxPatients, notes } = req.body;
    if (date || shiftType) {
      const newDate      = date      || shift.date;
      const newShiftType = shiftType || shift.shiftType;
      const duplicate = await Shift.findOne({
        _id:       { $ne: shift._id },
        doctorId:  shift.doctorId,  // use the shift's already-correct doctorId
        date:      newDate,
        shiftType: newShiftType,
      });
      if (duplicate) {
        const cfg = SHIFT_CONFIG[newShiftType];
        return sendError(res, 409,
          `Bạn đã có ca ${cfg?.label || newShiftType} ngày ${newDate} rồi.`);
      }
    }

    const cfg = SHIFT_CONFIG[shiftType || shift.shiftType];
    if (date)              shift.date       = date;
    if (shiftType)         shift.shiftType  = shiftType;
    if (startTime)         shift.startTime  = startTime;
    if (endTime)           shift.endTime    = endTime;
    if (maxPatients)       shift.maxPatients = maxPatients;
    if (notes !== undefined) shift.notes    = notes;

    await shift.save();
    return sendSuccess(res, 200, "Shift updated", shift);
  } catch (err) {
    if (err.code === 11000) {
      return sendError(res, 409, "Ca trực này đã tồn tại.");
    }
    return sendError(res, 500, err.message);
  }
};

// ── DELETE /api/shifts/:id  [doctor – cancel own shift]
const cancel = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) return sendError(res, 404, "Shift not found.");

    if (shift.doctor.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Access denied.");
    }

    // Check for existing appointments in this shift
    const conflict = await Appointment.findOne({
      doctor:  req.user._id,
      date:    shift.date,
      shiftType: shift.shiftType,
      status:  { $in: ["pending", "confirmed"] },
    });
    if (conflict) {
      return sendError(res, 409,
        "Không thể hủy ca trực: có lịch hẹn đang chờ xử lý trong ca này. " +
        "Vui lòng hủy hoặc xử lý lịch hẹn trước."
      );
    }

    shift.status = "cancelled";
    await shift.save();
    return sendSuccess(res, 200, "Ca trực đã được hủy", shift);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ── DELETE /api/shifts/:id  [admin – delete any shift]
const remove = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);
    if (!shift) return sendError(res, 404, "Shift not found.");
    return sendSuccess(res, 200, "Shift deleted");
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ── GET /api/shifts/by-doctor/:doctorId  [auth – shifts for a specific doctor]
const getByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    // doctorId here is the Doctor Model _id (from doctorApi.getAll())
    const filter = { doctorId, status: "active" };
    if (date) filter.date = date;

    const shifts = await Shift.find(filter)
      .sort({ date: 1, shiftType: 1 });

    // Get booked count per shift
    const shiftsWithCount = await Promise.all(
      shifts.map(async (s) => {
        const booked = await Appointment.countDocuments({
          doctor:    s.doctor,   // s.doctor = User _id (used in Appointment.doctor)
          date:      s.date,
          shiftType: s.shiftType,
          status:    { $in: ["pending", "confirmed"] },
        });
        return {
          ...s.toObject(),
          booked,
          remaining: Math.max(0, s.maxPatients - booked),
          isFull:    booked >= s.maxPatients,
        };
      })
    );

    // doctorName is already stored in the shift document
    const doctorName = shifts[0]?.doctorName || "Bác sĩ";
    return sendSuccess(res, 200, "Doctor shifts retrieved", {
      doctorId,
      doctorName,
      shifts: shiftsWithCount,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ── GET /api/shifts/available?date=YYYY-MM-DD  [auth – shifts available on a date]
const getAvailableByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return sendError(res, 400, "date query param is required.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return sendError(res, 400, "date must be in YYYY-MM-DD format.");
    }

    const shifts = await Shift.find({ date, status: "active" })
      .populate("doctor", "name specialization");

    const result = await Promise.all(
      shifts.map(async (s) => {
        const booked = await Appointment.countDocuments({
          doctor:    s.doctor._id,
          date:      s.date,
          shiftType: s.shiftType,
          status:    { $in: ["pending", "confirmed"] },
        });
        return {
          ...s.toObject(),
          booked,
          remaining: Math.max(0, s.maxPatients - booked),
          isFull:    booked >= s.maxPatients,
        };
      })
    );

    return sendSuccess(res, 200, "Available shifts retrieved", result);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

module.exports = {
  getAll,
  getMine,
  getById,
  create,
  update,
  cancel,
  remove,
  getByDoctor,
  getAvailableByDate,
  SHIFT_CONFIG,
};
