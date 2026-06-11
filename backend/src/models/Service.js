const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      unique: true,
    },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ['Preventive', 'Restorative', 'Cosmetic', 'Emergency', 'General', 'Orthodontics', 'Surgery'],
      default: 'General',
    },
    duration: { type: Number, default: 30, min: 5 },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'VND' },
    requirements: [{ type: String }],
    aftercare: { type: String, trim: true },
    difficultyLevel: {
      type: Number,
      default: 0.0,
      enum: [0.0, 0.2, 0.3, 0.5],
      comment: 'Hệ số độ khó của dịch vụ – đồng bộ với appointment.difficulty',
    },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

serviceSchema.index({ category: 1 });
serviceSchema.index({ active: 1 });

module.exports = mongoose.model('Service', serviceSchema);