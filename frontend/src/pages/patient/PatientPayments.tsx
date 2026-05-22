import { useState, useEffect } from "react";
import PatientSidebar from "../../components/layout/PatientSidebar";
import { paymentApi } from "../../services/api";

interface Payment {
  _id: string;
  invoiceNumber: string;
  amount: number;
  method: string;
  status: string;
  paidAt: string;
  description: string;
  services: Array<{ name: string; price: number }>;
  discount: number;
  tax: number;
  createdAt: string;
  recordedByName: string;
}

const methodLabels: Record<string, string> = {
  cash: "Tiền mặt",
  bank_transfer: "Chuyển khoản",
  momo: "MoMo",
  vnpay: "VNPay",
  zalo_pay: "ZaloPay",
  insurance: "Bảo hiểm",
  other: "Khác",
};

const methodColors: Record<string, string> = {
  cash: "#10b981",
  bank_transfer: "#0ea5e9",
  momo: "#ec4899",
  vnpay: "#6366f1",
  zalo_pay: "#06b6d4",
  insurance: "#f59e0b",
  other: "#8b5cf6",
};

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Chờ thanh toán", bg: "bg-amber-50", text: "text-amber-700" },
  paid: { label: "Đã thanh toán", bg: "bg-emerald-50", text: "text-emerald-700" },
  failed: { label: "Thất bại", bg: "bg-red-50", text: "text-red-700" },
  refunded: { label: "Đã hoàn tiền", bg: "bg-blue-50", text: "text-blue-700" },
  cancelled: { label: "Đã hủy", bg: "bg-slate-100", text: "text-slate-600" },
};

export default function PatientPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentApi.getMine();
      const data = res.data?.data || res.data || [];
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amount, 0);

  const handleShowQR = async (amount: number, invoiceNumber: string) => {
    setQrLoading(true);
    setShowQR(true);
    try {
      const res = await fetch("http://localhost:5000/api/payments/qr/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ amount, invoiceNumber }),
      });
      const data = await res.json();
      if (data.success) setQrData(data.data);
    } catch {} finally {
      setQrLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f5fffe 100%)" }}>
      <PatientSidebar />
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Thanh toán</h1>
            <p className="text-xs text-slate-400 mt-0.5">{payments.length} phiếu thanh toán</p>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4 text-center border border-slate-100">
              <p className="text-2xl font-black text-emerald-600">{payments.length}</p>
              <p className="text-xs font-semibold text-slate-400 mt-1">Tổng phiếu</p>
            </div>
            <div className="card p-4 text-center border border-slate-100">
              <p className="text-2xl font-black text-emerald-600">{totalPaid.toLocaleString("vi-VN")}</p>
              <p className="text-xs font-semibold text-slate-400 mt-1">Đã thanh toán (đ)</p>
            </div>
            <div className="card p-4 text-center border border-slate-100">
              <p className="text-2xl font-black text-amber-600">{totalPending.toLocaleString("vi-VN")}</p>
              <p className="text-xs font-semibold text-slate-400 mt-1">Chờ thanh toán (đ)</p>
            </div>
          </div>

          {/* Pending payments - QR pay now */}
          {payments.filter((p) => p.status === "pending").length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Phiếu chờ thanh toán
              </h3>
              {payments
                .filter((p) => p.status === "pending")
                .map((p) => (
                  <div key={p._id} className="card border border-amber-200 bg-amber-50/30 overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="font-mono text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-lg">{p.invoiceNumber}</span>
                          <p className="text-sm text-slate-500 mt-1">{new Date(p.createdAt).toLocaleDateString("vi-VN")}</p>
                        </div>
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">Chờ thanh toán</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400">Số tiền cần thanh toán</p>
                          <p className="text-2xl font-black text-amber-700">{p.amount.toLocaleString("vi-VN")} đ</p>
                        </div>
                        <button
                          onClick={() => handleShowQR(p.amount, p.invoiceNumber)}
                          className="px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5"
                          style={{ background: "linear-gradient(135deg, #059669, #10b981)", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }}
                        >
                          Thanh toán QR
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* All payments */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl skeleton" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, #05966915, #10b98115)" }}>
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="font-black text-slate-700 text-lg mb-2">Chưa có phiếu thanh toán</p>
              <p className="text-sm text-slate-400">Các phiếu thanh toán sẽ hiển thị tại đây</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments
                .filter((p) => p.status !== "pending")
                .map((p) => {
                  const cfg = statusConfig[p.status] || statusConfig.paid;
                  return (
                    <div key={p._id} className="card border border-slate-100 overflow-hidden">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${methodColors[p.method]}15` }}>
                            <span style={{ color: methodColors[p.method] }} className="text-lg">💳</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{methodLabels[p.method] || p.method}</p>
                            <p className="text-xs text-slate-400 font-mono">{p.invoiceNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-800">{p.amount.toLocaleString("vi-VN")} đ</p>
                          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Quét mã QR để thanh toán</h2>
              <button onClick={() => { setShowQR(false); setQrData(null); }} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4 text-center">
              {qrLoading ? (
                <div className="py-8 text-slate-500">Đang tạo mã QR...</div>
              ) : qrData ? (
                <>
                  <div className="bg-white rounded-2xl p-4 inline-block shadow border border-slate-200">
                    <img src={qrData.qrDataUrl} alt="QR" className="w-52 h-52" />
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-xs text-emerald-600 font-bold uppercase">Số tiền cần thanh toán</p>
                    <p className="text-3xl font-black text-emerald-700">{Number(qrData.amount).toLocaleString("vi-VN")} đ</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-left text-sm space-y-2">
                    <p className="font-bold text-blue-700">Thông tin tài khoản:</p>
                    <p>🏦 Ngân hàng: <strong>MB Bank (MBB)</strong></p>
                    <p>🔢 STK: <strong>280605666888</strong></p>
                    <p>👤 Tên: <strong>Nguyen Thai Son</strong></p>
                    <p>📝 Nội dung: <strong>{qrData.addInfo}</strong></p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
                    Sau khi chuyển khoản thành công, vui lòng mang biên laại đến quầy để xác nhận thanh toán.
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
