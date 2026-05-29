const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientName: { type: String, required: true },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorName: { type: String, required: true },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    type: {
      type: String,
      enum: ['examination', 'treatment', 'surgery', 'checkup'],
      default: 'examination',
    },
    date: {
      type: String,
      required: true,
      default: () => new Date().toISOString().split('T')[0],
    },
    chiefComplaint: { type: String, trim: true },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
    },
    treatment: {
      type: String,
      required: [true, 'Treatment is required'],
      trim: true,
    },
    prescription: { type: String, trim: true },
    teeth: [
      {
        number: Number,
        condition: String,
        treatment: String,
      },
    ],
    vitalSigns: {
      bloodPressure: String,
      pulse: Number,
      temperature: Number,
    },
    followUpDate: { type: String },
    notes: { type: String, trim: true },
    attachments: [{ type: String }],
    isConfidential: { type: Boolean, default: false },
  },
  { timestamps: true }
);

medicalRecordSchema.index({ patient: 1, createdAt: -1 });
medicalRecordSchema.index({ doctor: 1 });
medicalRecordSchema.index({ appointment: 1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);