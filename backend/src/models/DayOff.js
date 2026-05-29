const mongoose = require("mongoose");

const dayOffSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: [true, "Date is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"],
    },
    description: { type: String, required: true, trim: true },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null, // null means clinic-wide day off
    },
  },
  { timestamps: true }
);

// Each doctor or the clinic can only have one day off entry per date
dayOffSchema.index({ date: 1, doctor: 1 }, { unique: true });

module.exports = mongoose.model("DayOff", dayOffSchema);
