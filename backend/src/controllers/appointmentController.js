"use strict";

const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Shift = require("../models/Shift");
const Service = require("../models/Service");
const Payment = require("../models/Payment");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response");
const { getPagination, buildSort } = require("../utils/pagination");
const { buildPaymentQR, PAYMENT } = require("../config/payment");

const ALLOWED_SORT = ["date", "time", "status", "createdAt"];

// Aliases for backward compatibility with existing qrData response
const ACCOUNT_NO = PAYMENT.ACCOUNT_NO;
const ACCOUNT_NAME = PAYMENT.ACCOUNT_NAME;
const BANK_NAME = PAYMENT.BANK_NAME;

// GET /api/appointments  [admin, doctor]
const getAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const sort = buildSort(req.query, ALLOWED_SORT);
    const filter = {};

    if (req.user.role === "doctor") {
      filter.doctor = req.user._id;
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) filter.date = req.query.date;
    if (req.query.patientId) filter.patient = req.query.patientId;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("patient", "name email phone")
        .populate("doctor", "name email specialization")
        .populate("service", "name price duration category")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(filter),
    ]);

    return sendPaginated(res, appointments, total, page, limit);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /api/appointments/me  [patient]
const getMine = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { patient: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("doctor", "name email specialization")
        .populate("service", "name price duration")
        .sort({ date: -1, time: -1 })
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(filter),
    ]);

    return sendPaginated(res, appointments, total, page, limit);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /api/appointments/:id  [admin, doctor, or patient-owner]
const getById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name email phone")
      .populate("doctor", "name email specialization")
      .populate("service", "name price duration");

    if (!appointment) return sendError(res, 404, "Appointment not found.");

    if (
      req.user.role === "patient" &&
      appointment.patient._id.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, "Access denied.");
    }

    return sendSuccess(res, 200, "Appointment retrieved", appointment);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// POST /api/appointments  [patient]
const create = async (req, res) => {
  try {
    const { doctorId, serviceId, date, shiftType, notes } = req.body;

    if (!shiftType || !["morning", "afternoon", "evening"].includes(shiftType)) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn ca trực: sáng, chiều hoặc tối." });
    }

    if (!doctorId) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn bác sĩ." });
    }

    const doctor = await Doctor.findById(doctorId).populate("user");
    if (!doctor || !doctor.user || !doctor.user.isActive) {
      return res.status(404).json({ success: false, message: "Doctor not found." });
    }

    const userId = doctor.user._id;

    const shift = await Shift.findOne({ doctorId, date, shiftType, status: "active" });
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: `Bác sĩ chưa đăng ký ca trực này vào ngày ${date}. Vui lòng chọn ca khác.`
      });
    }

    const existingBookings = await Appointment.countDocuments({
      doctor: userId, date, shiftType,
      status: { $in: ["pending", "confirmed"] },
    });
    if (existingBookings >= shift.maxPatients) {
      return res.status(409).json({
        success: false,
        message: `Ca trực này đã đầy. Vui lòng chọn ca khác.`
      });
    }

    const duplicate = await Appointment.findOne({
      patient: req.user._id, doctor: userId, date, shiftType,
      status: { $in: ["pending", "confirmed"] },
    });
    if (duplicate) {
      return res.status(409).json({ success: false, message: "Bạn đã đặt lịch khám vào ca này rồi." });
    }

    let service = null;
    let serviceName = req.body.serviceName || "General Consultation";
    let fee = 0;
    if (serviceId) {
      service = await Service.findById(serviceId);
      if (service) {
        serviceName = service.name;
        fee = service.price;
      }
    }

    const appointment = await Appointment.create({
      patient:     req.user._id,
      patientName: req.user.name,
      doctor:      userId,
      doctorName:  doctor.name,
      service:     serviceId || undefined,
      serviceName,
      date,
      shiftType,
      time:        shift.startTime,
      duration:    service?.duration || 30,
      fee,
      notes,
    });

    await appointment.populate([
      { path: "doctor", select: "name email specialization" },
      { path: "service", select: "name price duration" },
    ]);

    return res.status(201).json({
      success: true,
      message: `Đặt lịch thành công!`,
      data: appointment,
    });
  } catch (err) {
    console.error("[APPOINTMENT CREATE ERROR]", err);
    return res.status(500).json({ success: false, message: err.message || "Internal server error." });
  }
};

// PUT /api/appointments/:id  [admin, doctor]
const update = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return sendError(res, 404, "Appointment not found.");

    // Doctor can only update their own appointments
    if (
      req.user.role === "doctor" &&
      appointment.doctor.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, "Access denied. Not your appointment.");
    }

    const allowed = [
      "status",
      "date",
      "time",
      "doctorNotes",
      "notes",
      "duration",
      "isPaid",
      "fee",
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) appointment[field] = req.body[field];
    });

    await appointment.save();
    return sendSuccess(res, 200, "Appointment updated", appointment);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// PUT /api/appointments/:id/cancel  [patient – cancel own; admin/doctor – cancel any]
const cancel = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return sendError(res, 404, "Appointment not found.");

    if (
      req.user.role === "patient" &&
      appointment.patient.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, "Access denied.");
    }

    if (["completed", "cancelled"].includes(appointment.status)) {
      return sendError(
        res,
        400,
        `Cannot cancel an appointment that is already ${appointment.status}.`,
      );
    }

    appointment.status = "cancelled";
    appointment.cancelReason = req.body.reason || "";
    appointment.cancelledBy = req.user.role;
    await appointment.save();

    return sendSuccess(res, 200, "Appointment cancelled", appointment);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// DELETE /api/appointments/:id  [admin]
const remove = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return sendError(res, 404, "Appointment not found.");
    return sendSuccess(res, 200, "Appointment deleted");
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /api/appointments/stats  [admin, doctor]
const getStats = async (req, res) => {
  try {
    const filter = req.user.role === "doctor" ? { doctor: req.user._id } : {};
    const today = new Date().toISOString().split("T")[0];

    const [total, todayCount, pending, confirmed, completed, cancelled] =
      await Promise.all([
        Appointment.countDocuments(filter),
        Appointment.countDocuments({ ...filter, date: today }),
        Appointment.countDocuments({ ...filter, status: "pending" }),
        Appointment.countDocuments({ ...filter, status: "confirmed" }),
        Appointment.countDocuments({ ...filter, status: "completed" }),
        Appointment.countDocuments({ ...filter, status: "cancelled" }),
      ]);

    return sendSuccess(res, 200, "Appointment stats", {
      total,
      today: todayCount,
      pending,
      confirmed,
      completed,
      cancelled,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /api/appointments/slots?doctorId=&date=  [auth: all]
// Returns available shifts (from Shift model) for a doctor on a date
// doctorId = Doctor Model _id (from doctorApi.getAll())
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return sendError(res, 400, "doctorId and date query params are required.");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return sendError(res, 400, "date must be in YYYY-MM-DD format.");
    }

    // Get all active shifts for this doctor on this date – query by doctorId field
    const shifts = await Shift.find({ doctorId, date, status: "active" });

    // For each shift, count bookings using s.doctor (User _id)
    const shiftTypes = ["morning", "afternoon", "evening"];
    const SHIFT_LABELS = { morning: "Ca sáng (08:00–12:00)", afternoon: "Ca chiều (13:00–17:00)", evening: "Ca tối (18:00–21:00)" };
    const SHIFT_COLORS = { morning: "#f59e0b", afternoon: "#8b5cf6", evening: "#0ea5e9" };

    const result = shiftTypes.map((type) => {
      const shift = shifts.find((s) => s.shiftType === type);
      return {
        shiftType: type,
        label: SHIFT_LABELS[type],
        color: SHIFT_COLORS[type],
        startTime: shift?.startTime || null,
        endTime:   shift?.endTime   || null,
        maxPatients: shift?.maxPatients || 0,
        isRegistered: !!shift,
        isActive:    shift?.status === "active",
        booked: 0,
        remaining: 0,
        isFull: false,
        available: false,
      };
    });

    // Count bookings for each shift using s.doctor (User _id)
    await Promise.all(result.map(async (item) => {
      if (!item.isRegistered) return;
      const shift = shifts.find((s) => s.shiftType === item.shiftType);
      const booked = await Appointment.countDocuments({
        doctor:    shift.doctor,   // User _id stored in Shift.doctor
        date,
        shiftType: item.shiftType,
        status:    { $in: ["pending", "confirmed"] },
      });
      item.booked    = booked;
      item.remaining = Math.max(0, item.maxPatients - booked);
      item.isFull    = booked >= item.maxPatients;
      item.available = item.isActive && !item.isFull;
    }));

    return sendSuccess(res, 200, "Available slots retrieved", {
      doctorId,
      date,
      shifts: result,
      availableCount: result.filter((s) => s.available).length,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// PUT /api/appointments/:id/approve  [doctor – approve own appointments]
const approve = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return sendError(res, 404, "Appointment not found.");

    // Only doctor can approve their own appointments
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Access denied. Not your appointment.");
    }

    if (appointment.approvalStatus !== "pending") {
      return sendError(
        res,
        400,
        `Appointment approval status is already ${appointment.approvalStatus}.`,
      );
    }

    appointment.approvalStatus = "approved";
    appointment.status = "confirmed";
    appointment.approvedBy = req.user._id;
    appointment.approvedAt = new Date();
    appointment.doctorNotes = req.body.notes || appointment.doctorNotes;

    await appointment.save();
    await appointment.populate([
      { path: "patient", select: "name email phone" },
      { path: "approvedBy", select: "name email" },
    ]);

    return sendSuccess(res, 200, "Appointment approved", appointment);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// PUT /api/appointments/:id/reject  [doctor – reject own appointments]
const reject = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return sendError(res, 404, "Appointment not found.");

    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Access denied. Not your appointment.");
    }

    if (appointment.approvalStatus !== "pending") {
      return sendError(res, 400, `Appointment approval status is already ${appointment.approvalStatus}.`);
    }

    const reason = req.body.reason || "Doctor rejected the appointment";

    appointment.approvalStatus = "rejected";
    appointment.status = "cancelled";
    appointment.rejectionReason = reason;
    appointment.approvedBy = req.user._id;
    appointment.approvedAt = new Date();
    appointment.cancelledBy = "doctor";

    await appointment.save();
    await appointment.populate([
      { path: "patient", select: "name email phone" },
      { path: "approvedBy", select: "name email" },
    ]);

    return sendSuccess(res, 200, "Appointment rejected", appointment);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ── Auto-complete appointment with payment + QR ────────────────────────────────
// PUT /api/appointments/:id/complete  [doctor, admin]
const complete = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return sendError(res, 404, "Appointment not found.");

    // Doctors can only complete their own appointments
    if (
      req.user.role === "doctor" &&
      appointment.doctor.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, "Access denied. Not your appointment.");
    }

    if (appointment.status === "completed") {
      return sendError(res, 400, "Appointment is already completed.");
    }
    if (appointment.status === "cancelled") {
      return sendError(res, 400, "Cannot complete a cancelled appointment.");
    }

    // ── Auto-resolve fee from Service if not set ───────────────────────────────
    let fee = appointment.fee || 0;
    if (appointment.service && fee === 0) {
      const service = await Service.findById(appointment.service);
      if (service && service.price > 0) {
        fee = service.price;
        appointment.fee = fee;
      }
    }

    // ── Mark appointment completed ────────────────────────────────────────────
    appointment.status = "completed";
    appointment.doctorNotes = req.body.notes || appointment.doctorNotes || appointment.doctorNotes;
    await appointment.save();

    // ── Create Payment record ───────────────────────────────────────────────────
    let payment = null;
    let qrData = null;

    if (fee > 0) {
      // Count existing payments this month for invoice number (using safe Date constructor)
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd   = new Date(year, month, 1);
      const count = await Payment.countDocuments({
        createdAt: { $gte: monthStart, $lt: monthEnd },
      });
      const invoiceNumber = `INV-${year}${String(month).padStart(2, "0")}-${String(count + 1).padStart(4, "0")}`;

      payment = await Payment.create({
        patient: appointment.patient,
        patientName: appointment.patientName,
        appointment: appointment._id,
        invoiceNumber,
        amount: fee,
        method: "bank_transfer",
        status: "pending",
        description: `Thanh toan kham ${appointment.serviceName || "dich vu"} ngay ${appointment.date}`,
        services: [
          {
            name: appointment.serviceName || "Dich vu kham",
            price: fee,
          },
        ],
        discount: 0,
        tax: 0,
        notes: `Tu dong tao tu lich hen ${appointment.date} ${appointment.time}`,
        recordedBy: req.user._id,
        recordedByName: req.user.name,
      });

      // ── Generate QR code ──────────────────────────────────────────────────────
      const qr = buildPaymentQR(fee, invoiceNumber);
      qrData = {
        invoiceNumber,
        amount: fee,
        qrDataUrl: qr.qrDataUrl,
        qrString: qr.qrString,
        addInfo: qr.addInfo,
        paymentId: payment._id,
        bankId: BANK_NAME,
        accountNo: ACCOUNT_NO,
        accountName: ACCOUNT_NAME,
      };
    }

    await appointment.populate([
      { path: "patient", select: "name email phone" },
      { path: "doctor", select: "name email" },
      { path: "service", select: "name price" },
    ]);

    return sendSuccess(res, 200, "Appointment completed", {
      appointment,
      payment,
      qrData,
      message: fee > 0
        ? `Da hoan thanh kham va tao phieu thu ${fee.toLocaleString("vi-VN")} VND. Ma QR da duoc tao.`
        : "Da hoan thanh kham (khong co phi kham).",
    });
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
  getStats,
  getAvailableSlots,
  approve,
  reject,
  complete,
};
