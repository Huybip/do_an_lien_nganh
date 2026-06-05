const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Doctor (User) is required"],
    },
    doctorId: {
      // Doctor Model _id – dùng để query salary từ frontend
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    month: {
      type: Number,
      required: [true, "Month is required"],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
    },
    // Configuration parameters
    basicHourlyRate: {
      type: Number,
      default: 210000,
      min: 0,
    },
    degreeCoefficient: {
      type: Number,
      default: 1.0,
      min: 0,
    },
    // Shift data
    totalShifts: {
      type: Number,
      default: 0,
      min: 0,
    },
    shiftDetails: [
      {
        date: String, // YYYY-MM-DD
        shiftType: String, // morning, afternoon, evening
        startTime: String, // HH:MM
        endTime: String, // HH:MM
        workingHours: Number,
        shiftMultiplier: Number,
        patientsCount: Number,
        totalDifficulty: Number,
        equivalentHours: Number,
        shiftAmount: Number,
      },
    ],
    // Totals
    totalWorkingHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEquivalentHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDifficulty: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Status
    status: {
      type: String,
      enum: ["draft", "calculated", "approved", "paid", "cancelled"],
      default: "draft",
    },
    approvalNotes: { type: String, trim: true },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: { type: Date },
    paidDate: { type: Date },
  },
  { timestamps: true },
);

// Một bác sĩ chỉ có 1 record lương mỗi tháng/năm
salarySchema.index({ doctorId: 1, month: 1, year: 1 }, { unique: true });
salarySchema.index({ doctorId: 1, year: 1 });
salarySchema.index({ month: 1, year: 1 });
salarySchema.index({ status: 1 });

module.exports = mongoose.model("Salary", salarySchema);
