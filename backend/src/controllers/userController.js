"use strict";

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response");
const { getPagination, buildSort } = require("../utils/pagination");

const ALLOWED_SORT = ["name", "email", "role", "createdAt"];

// GET /api/users  [admin]
const getAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const sort = buildSort(req.query, ALLOWED_SORT);
    const filter = {};

    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return sendPaginated(res, users, total, page, limit);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// GET /api/users/:id  [admin]
const getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, "User not found.");
    return sendSuccess(res, 200, "User retrieved", user);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// POST /api/users  [admin]
const create = async (req, res) => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) return sendError(res, 409, "Email already exists.");

    const user = await User.create(req.body);

    // Auto-create matching role profiles to prevent orphans
    if (user.role === "doctor") {
      await Doctor.create({
        user: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        specialization: user.specialization || "General Dentistry",
      });
    } else if (user.role === "patient") {
      await Patient.create({
        user: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      });
    }

    return sendSuccess(res, 201, "User created", user);
  } catch (err) {
    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return sendError(res, 400, messages.join(", "));
    }
    // Handle duplicate key error
    if (err.code === 11000) return sendError(res, 409, "Email already exists.");
    return sendError(res, 500, err.message);
  }
};

// PUT /api/users/:id  [admin]
const update = async (req, res) => {
  try {
    // Don't allow password change through this endpoint
    delete req.body.password;

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return sendError(res, 404, "User not found.");
    return sendSuccess(res, 200, "User updated", user);
  } catch (err) {
    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return sendError(res, 400, messages.join(", "));
    }
    // Handle duplicate key error
    if (err.code === 11000) return sendError(res, 409, "Email already exists.");
    return sendError(res, 500, err.message);
  }
};

// DELETE /api/users/:id  [admin]
const remove = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 400, "Cannot delete your own account.");
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return sendError(res, 404, "User not found.");
    return sendSuccess(res, 200, "User deleted");
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// PUT /api/users/:id/toggle-active  [admin]
const toggleActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, "User not found.");
    user.isActive = !user.isActive;
    await user.save();
    return sendSuccess(
      res,
      200,
      `User ${user.isActive ? "activated" : "deactivated"}`,
      user,
    );
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

module.exports = { getAll, getById, create, update, remove, toggleActive };
