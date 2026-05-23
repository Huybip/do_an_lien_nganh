"use strict";

// ── Thong tin tai khoan BIDV – dùng chung cho toàn bộ hệ thống ───────────────
const PAYMENT = {
  BANK_NAME:    "BIDV",
  BANK_CODE:    "310805",
  ACCOUNT_NO:   "1231270139",
  ACCOUNT_NAME: "TRAN QUOC HUY",
};

// ── VietQR URL (SePay – public, khong can API key) ──────────────────────────────
const QR_URL = "https://qr.sepay.vn/img";

/**
 * Tao URL QR VietQR cho SePay
 * @param {number} amount   – so tien VND
 * @param {string} invoice  – ma hoa don (hien trong noi dung CK)
 * @returns {{ qrDataUrl: string, qrString: string, addInfo: string }}
 */
function buildPaymentQR(amount, invoice) {
  const addInfo = invoice
    ? `Thanh toan hoa don ${invoice}`
    : "Thanh toan phong kham nha khoa";

  const params = new URLSearchParams({
    acc: PAYMENT.ACCOUNT_NO,
    bank: PAYMENT.BANK_NAME,
    amount: String(Math.round(amount)),
    des: addInfo,
    template: "compact",
  });

  const url = `${QR_URL}?${params.toString()}`;
  return { qrDataUrl: url, qrString: url, addInfo };
}

module.exports = { PAYMENT, QR_URL, buildPaymentQR };
