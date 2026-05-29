const mongoose = require("mongoose");

const shiftConfigSchema = new mongoose.Schema(
  {
    shiftType: {
      type: String,
      required: true,
      unique: true,
      enum: ["morning", "afternoon", "evening"],
    },
    label: { type: String, required: true },
    startTime: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}$/, "End time must be in HH:MM format"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShiftConfig", shiftConfigSchema);
