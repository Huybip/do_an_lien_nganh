"use strict";

const Payment = require("../models/Payment");
const Appointment = require("../models/Appointment");
const { sendSuccess, sendError } = require("../utils/response");
const { buildPaymentQR, PAYMENT } = require("../config/payment");

/**
 * POST /api/payments/qr/generate
 * Generate QR code using shared BIDV VietQR config
 */
const generateQR = async (req, res) => {
  try {
    const { amount, invoiceNumber, patientName, description } = req.body;

    if (!amount || amount <= 0) {
      return sendError(res, 400, "Số tiền phải lớn hơn 0.");
    }

    const des = invoiceNumber
      ? `Thanh toan hoa don ${invoiceNumber}`
      : description || "Thanh toan phong kham nha khoa";

    const qr = buildPaymentQR(amount, invoiceNumber || description || "");

    return sendSuccess(res, 200, "QR code generated", {
      qrDataUrl: qr.qrDataUrl,
      qrString: qr.qrString,
      bankId: PAYMENT.BANK_NAME,
      accountNo: PAYMENT.ACCOUNT_NO,
      accountName: PAYMENT.ACCOUNT_NAME,
      amount,
      invoiceNumber,
      addInfo: qr.addInfo,
    });
  } catch (err) {
    return sendError(res, 500, "Failed to generate QR code: " + err.message);
  }
};

/**
 * POST /api/payments/qr/confirm
 * Admin confirms that payment was made via QR (marks payment as paid)
 */
const confirmQRPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return sendError(res, 400, "paymentId is required.");
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return sendError(res, 404, "Payment not found.");
    }

    if (payment.status === "paid") {
      return sendError(res, 400, "Payment already marked as paid.");
    }

    payment.status = "paid";
    payment.method = "bank_transfer";
    payment.paidAt = new Date();
    payment.notes = (payment.notes || "") + "\n[QR] Da xac nhan thanh toan chuyen khoan QR MBBank.";
    await payment.save();

    // Sync with appointment
    if (payment.appointment) {
      await Appointment.findByIdAndUpdate(payment.appointment, { isPaid: true });
    }

    await payment.populate([
      { path: "patient", select: "name email" },
      { path: "recordedBy", select: "name" },
    ]);

    return sendSuccess(res, 200, "Payment confirmed successfully", payment);
  } catch (err) {
    return sendError(res, 500, "Failed to confirm payment: " + err.message);
  }
};

module.exports = {
  generateQR,
  confirmQRPayment,
};
