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
    invoiceNumber: { type: String, unique: true, required: true },
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
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const count = await mongoose.model("Payment").countDocuments({
      createdAt: {
        $gte: new Date(`${year}-${month}-01`),
        $lt: new Date(`${year}-${month + 1}-01`),
      },
    });
    this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
