const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    specialization: {
      type: String,
      trim: true,
      default: 'General Dentistry',
    },
    licenseNumber: { type: String, trim: true },
    qualifications: [{ type: String, trim: true }],
    experience: { type: Number, min: 0 },
    bio: { type: String, trim: true },
    workingHours: {
      monday:    { start: String, end: String, available: { type: Boolean, default: true } },
      tuesday:   { start: String, end: String, available: { type: Boolean, default: true } },
      wednesday: { start: String, end: String, available: { type: Boolean, default: true } },
      thursday:  { start: String, end: String, available: { type: Boolean, default: true } },
      friday:    { start: String, end: String, available: { type: Boolean, default: true } },
      saturday:  { start: String, end: String, available: { type: Boolean, default: false } },
      sunday:    { start: String, end: String, available: { type: Boolean, default: false } },
    },
    degree: {
      type: String,
      enum: ["Đại học", "Thạc sỹ", "Tiến sỹ", "Phó giáo sư", "Giáo sư"],
      default: "Đại học",
    },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    totalPatients: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

doctorSchema.index({ specialization: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);