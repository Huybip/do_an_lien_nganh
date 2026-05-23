"use strict";

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: { type: String, required: true },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    invoiceNumber: { type: String, unique: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ["cash", "bank_transfer", "momo", "vnpay", "zalo_pay", "insurance", "other"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "cancelled"],
      default: "pending",
    },
    paidAt: { type: Date },
    dueDate: { type: Date },
    description: { type: String, trim: true },
    services: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    reason: { type: String, trim: true },
    notes: { type: String, trim: true },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    recordedByName: { type: String },
  },
  { timestamps: true }
);

paymentSchema.index({ patient: 1 });
paymentSchema.index({ invoiceNumber: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paidAt: 1 });

// Auto-generate invoice number before save
paymentSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    // Safe date boundaries using Date constructor (handles year rollover for December)
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd   = new Date(year, month, 1);
    // Count only valid-dated records (skip any corrupted "Invalid Date" records)
    const count = await mongoose.model("Payment").countDocuments({
      createdAt: { $gte: monthStart, $lt: monthEnd, $type: "date" },
    });
    this.invoiceNumber = `INV-${year}${String(month).padStart(2, "0")}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
