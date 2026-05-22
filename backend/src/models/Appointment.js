const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: { type: String, required: true },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorName: { type: String, required: true },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    serviceName: { type: String, required: true },
    date: {
      type: String,
      required: [true, "Appointment date is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"],
    },
    time: {
      type: String,
      required: [true, "Appointment time is required"],
      match: [/^\d{2}:\d{2}$/, "Time must be in HH:MM format"],
    },
    shiftType: {
      type: String,
      enum: {
        values: ["morning", "afternoon", "evening"],
        message: "Shift type must be: morning, afternoon, or evening",
      },
    },
    duration: { type: Number, default: 30 },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "confirmed",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "pending",
    },
    notes: { type: String, trim: true },
    doctorNotes: { type: String, trim: true },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
    fee: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    cancelReason: { type: String, trim: true },
    cancelledBy: { type: String, enum: ["patient", "doctor", "admin"] },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true },
);

appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ doctor: 1, date: 1, shiftType: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
