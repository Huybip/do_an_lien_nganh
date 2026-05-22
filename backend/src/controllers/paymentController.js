"use strict";

const Payment = require("../models/Payment");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Patient = require("../models/Patient");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response");
const { getPagination, buildSort } = require("../utils/pagination");

const ALLOWED_SORT = ["createdAt", "paidAt", "amount", "status"];

// GET /api/payments  [admin]
const getAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const sort = buildSort(req.query, ALLOWED_SORT);
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.patientId) filter.patient = req.query.patientId;
    if (req.query.method) filter.method = req.query.method;
    if (req.query.from || req.query.to) {
      filter.paidAt = {};
      if (req.query.from) filter.paidAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.paidAt.$lte = new Date(req.query.to + "T23:59:59");
    }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("patient", "name email phone")
        .populate("recordedBy", "name")
        .populate("appointment", "date time serviceName")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter),
    ]);

    return sendPaginated(res, payments, total, page, limit);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /api/payments/me  [patient]
const getMine = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const [payments, total] = await Promise.all([
      Payment.find({ patient: req.user._id })
        .populate("recordedBy", "name")
        .populate("appointment", "date time serviceName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments({ patient: req.user._id }),
    ]);

    return sendPaginated(res, payments, total, page, limit);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /api/payments/:id  [admin, or patient owner]
const getById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("patient", "name email phone")
      .populate("recordedBy", "name")
      .populate("appointment", "date time serviceName");

    if (!payment) return sendError(res, 404, "Payment not found.");

    if (
      req.user.role === "patient" &&
      payment.patient._id.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, "Access denied.");
    }

    return sendSuccess(res, 200, "Payment retrieved", payment);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// POST /api/payments  [admin]
const create = async (req, res) => {
  try {
    const {
      patientId,
      appointmentId,
      amount,
      method,
      description,
      services,
      discount,
      tax,
      notes,
    } = req.body;

    // Resolve patient
    let patientUser = await User.findById(patientId);
    let patientName = "";

    if (!patientUser) {
      const patientRecord = await Patient.findById(patientId);
      if (!patientRecord) {
        return sendError(res, 404, "Patient not found.");
      }
      patientUser = await User.findById(patientRecord.user);
      patientName = patientRecord.name;
    } else {
      patientName = patientUser.name;
    }

    if (!patientUser || patientUser.role !== "patient") {
      return sendError(res, 400, "Invalid patient.");
    }

    const payment = await Payment.create({
      patient: patientUser._id,
      patientName,
      appointment: appointmentId || undefined,
      amount,
      method: method || "cash",
      description,
      services: services || [],
      discount: discount || 0,
      tax: tax || 0,
      notes,
      status: "paid",
      paidAt: new Date(),
      recordedBy: req.user._id,
      recordedByName: req.user.name,
    });

    // Update appointment payment status
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { isPaid: true });
    }

    await payment.populate([
      { path: "patient", select: "name email" },
      { path: "recordedBy", select: "name" },
    ]);

    return sendSuccess(res, 201, "Payment recorded successfully", payment);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// PUT /api/payments/:id  [admin – mark as paid/refunded]
const update = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return sendError(res, 404, "Payment not found.");

    const allowed = ["status", "method", "notes", "amount", "discount", "tax"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        payment[field] = req.body[field];
      }
    });

    if (req.body.status === "paid" && !payment.paidAt) {
      payment.paidAt = new Date();
    }

    await payment.save();

    // Sync with appointment
    if (payment.appointment) {
      await Appointment.findByIdAndUpdate(payment.appointment, {
        isPaid: payment.status === "paid",
      });
    }

    await payment.populate([
      { path: "patient", select: "name email" },
      { path: "recordedBy", select: "name" },
    ]);

    return sendSuccess(res, 200, "Payment updated", payment);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /api/payments/stats/summary  [admin]
const getStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalRevenue, monthRevenue, pendingPayments, totalPayments] = await Promise.all([
      Payment.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        {
          $match: {
            status: "paid",
            $or: [
              { paidAt: { $gte: startOfMonth } },
              {
                $and: [
                  { $or: [{ paidAt: { $exists: false } }, { paidAt: null }] },
                  { createdAt: { $gte: startOfMonth } },
                ],
              },
            ],
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.countDocuments({ status: "pending" }),
      Payment.countDocuments(),
    ]);

    const methodBreakdown = await Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: "$method", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const monthlyTrend = await Payment.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: {
            year: { $year: { $ifNull: ["$paidAt", "$createdAt"] } },
            month: { $month: { $ifNull: ["$paidAt", "$createdAt"] } },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 24 },
    ]);

    return sendSuccess(res, 200, "Payment stats retrieved", {
      totalRevenue: totalRevenue[0]?.total || 0,
      monthRevenue: monthRevenue[0]?.total || 0,
      pendingPayments,
      totalPayments,
      methodBreakdown,
      monthlyTrend,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// DELETE /api/payments/:id  [admin]
const remove = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return sendError(res, 404, "Payment not found.");
    return sendSuccess(res, 200, "Payment deleted");
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
  getStats,
  remove,
};
