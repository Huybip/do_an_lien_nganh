const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Doctor is required"],
    },
    doctorId: {
      // Doctor Model _id – dùng để query shift từ frontend (doctorApi trả về cái này)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    doctorName: { type: String, required: true },
    date: {
      type: String,
      required: [true, "Date is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"],
    },
    shiftType: {
      type: String,
      required: [true, "Shift type is required"],
      enum: {
        values: ["morning", "afternoon", "evening"],
        message: "Shift type must be: morning, afternoon, or evening",
      },
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^\d{2}:\d{2}$/, "End time must be in HH:MM format"],
    },
    maxPatients: {
      type: Number,
      default: 5,
      min: [1, "Max patients must be at least 1"],
      max: [20, "Max patients cannot exceed 20"],
    },
    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Một bác sĩ chỉ có 1 ca trực mỗi ngày (morning/afternoon/evening)
shiftSchema.index({ doctorId: 1, date: 1, shiftType: 1 }, { unique: true });
shiftSchema.index({ doctorId: 1, date: 1 });
shiftSchema.index({ doctor: 1, date: 1 }); // keep for backward compat if doctor/User._id is used
shiftSchema.index({ date: 1 });

module.exports = mongoose.model("Shift", shiftSchema);
