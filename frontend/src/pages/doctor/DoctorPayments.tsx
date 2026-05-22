import { useState, useEffect } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import { paymentApi, patientApi } from "../../services/api";

interface Payment {
  _id: string;
  invoiceNumber: string;
  patientName: string;
  amount: number;
  method: string;
  status: string;
  paidAt: string;
  description: string;
  createdAt: string;
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

export default function DoctorPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentApi.getAll();
      const data = res.data?.data?.data || res.data?.data || [];
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter((p) => {
    const matchSearch =
      !search ||
      p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = filtered
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);

  const handleShowQR = (p: Payment) => {
    setSelectedPayment(p);
    setShowQRModal(true);
  };

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f5f3ff 0%, #ede9fe 40%, #f0f9ff 100%)" }}>
      <DoctorSidebar />
      <div className="flex-1 lg:ml-0 min-w-0">
        {/* Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Thanh toán</h1>
            <p className="text-xs text-slate-400 mt-0.5">{payments.length} phiếu thanh toán</p>
          </div>
          <button
            onClick={() => setShowQRModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 14px rgba(124,58,237,0.4)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            QR MBBank
          </button>
        </div>

        <div className="p-6 lg:p-8 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Tổng phiếu", value: payments.length, color: "#7c3aed" },
              { label: "Đã thanh toán", value: payments.filter((p) => p.status === "paid").length, color: "#10b981" },
              { label: "Chờ thanh toán", value: payments.filter((p) => p.status === "pending").length, color: "#f59e0b" },
              { label: "Doanh thu", value: totalRevenue.toLocaleString("vi-VN") + " đ", color: "#0ea5e9" },
            ].map((s) => (
              <div key={s.label} className="card p-4 text-center border border-slate-100">
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="card card-hover p-3 flex-1 border border-slate-100 flex items-center gap-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
                placeholder="Tìm theo tên hoặc mã hóa đơn..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {["all", "paid", "pending"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === s ? "text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}
                  style={filterStatus === s ? { background: "linear-gradient(135deg, #7c3aed, #6d28d9)" } : {}}
                >
                  {s === "all" ? "Tất cả" : statusConfig[s]?.label || s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {!loading && filtered.length === 0 && (
            <div className="card text-center py-16">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, #7c3aed15, #6d28d915)" }}>
                <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="font-black text-slate-700 text-lg mb-2">Chưa có phiếu thanh toán</p>
              <p className="text-sm text-slate-400">Danh sách thanh toán sẽ hiển thị tại đây</p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="card overflow-hidden border border-slate-100">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Mã hóa đơn", "Bệnh nhân", "Số tiền", "Phương thức", "Trạng thái", "Ngày thanh toán", "Thao tác"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => {
                      const cfg = statusConfig[p.status] || statusConfig.pending;
                      return (
                        <tr
                          key={p._id || i}
                          className="border-b border-slate-50 hover:bg-slate-50 transition"
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-lg">
                              {p.invoiceNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800">{p.patientName}</p>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800">
                            {p.amount.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{ background: `${methodColors[p.method]}15`, color: methodColors[p.method] }}
                            >
                              {methodLabels[p.method] || p.method}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {p.paidAt ? new Date(p.paidAt).toLocaleDateString("vi-VN") : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleShowQR(p)}
                              className="px-3 py-1.5 rounded-lg text-violet-700 hover:bg-violet-50 font-medium text-xs transition border border-violet-200 bg-violet-50"
                            >
                              QR
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl skeleton" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {selectedPayment && (
        <QRModal payment={selectedPayment} open={showQRModal} onClose={() => { setShowQRModal(false); setSelectedPayment(null); }} />
      )}

      {/* QR creation modal (no payment selected) */}
      {!selectedPayment && (
        <QRCreateModal open={showQRModal} onClose={() => setShowQRModal(false)} onSuccess={loadPayments} />
      )}
    </div>
  );
}

function QRModal({ payment, open, onClose }: {
  payment: Payment; open: boolean; onClose: () => void;
}) {
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && payment.status === "pending") {
      generateQR();
    }
  }, [open]);

  const generateQR = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/payments/qr/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount: payment.amount,
          invoiceNumber: payment.invoiceNumber,
          patientName: payment.patientName,
        }),
      });
      const data = await res.json();
      if (data.success) setQrData(data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">QR Thanh toán</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4 text-center">
          {loading ? (
            <div className="py-8">Đang tạo mã QR...</div>
          ) : qrData ? (
            <>
              <div className="bg-white rounded-2xl p-4 inline-block shadow border border-slate-200">
                <img src={qrData.qrDataUrl} alt="QR" className="w-52 h-52" />
              </div>
              <div className="bg-violet-50 rounded-xl p-4">
                <p className="text-xs text-violet-600 font-semibold uppercase">Số tiền</p>
                <p className="text-2xl font-black text-violet-700">{Number(qrData.amount).toLocaleString("vi-VN")} đ</p>
              </div>
              <div className="text-left bg-slate-50 rounded-xl p-3">
                {[
                  { label: "Ngân hàng", value: "MB Bank (MBB)" },
                  { label: "STK", value: "280605666888" },
                  { label: "Tên", value: "Nguyen Thai Son" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-700">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-8 text-slate-500">
              <p>Mã QR chỉ hiển thị cho phiếu <strong>chờ thanh toán</strong>.</p>
              <p className="text-sm mt-2">Trạng thái hiện tại: <strong>{statusConfig[payment.status]?.label}</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QRCreateModal({ open, onClose, onSuccess }: {
  open: boolean; onClose: () => void; onSuccess: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [patientName, setPatientName] = useState("");
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/payments/qr/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          invoiceNumber: invoiceNumber || undefined,
          patientName: patientName || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) setQrData(data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Tạo QR Thanh toán MBBank</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {qrData ? (
            <div className="text-center space-y-4">
              <div className="bg-white rounded-2xl p-4 inline-block shadow border border-slate-200">
                <img src={qrData.qrDataUrl} alt="QR" className="w-52 h-52" />
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-xs text-emerald-600 font-bold uppercase">Số tiền</p>
                <p className="text-3xl font-black text-emerald-700">{Number(qrData.amount).toLocaleString("vi-VN")} đ</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-left text-sm space-y-2">
                <p className="font-bold text-blue-700">Thông tin tài khoản:</p>
                <p>🏦 Ngân hàng: <strong>MB Bank (MBB)</strong></p>
                <p>🔢 STK: <strong>280605666888</strong></p>
                <p>👤 Tên: <strong>Nguyen Thai Son</strong></p>
              </div>
              <button onClick={() => { setQrData(null); onSuccess(); }} className="w-full py-2 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
                Tạo QR khác
              </button>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-4 text-white text-center">
                <p className="font-bold">STK: 280605666888</p>
                <p className="text-violet-100 text-sm">Nguyen Thai Son - MBBank</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tên bệnh nhân</label>
                <input className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400" placeholder="Nhập tên bệnh nhân" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mã hóa đơn</label>
                <input className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400" placeholder="VD: INV-202505-0001" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Số tiền (VNĐ) *</label>
                <input type="number" className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 font-semibold" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading || !amount}
                className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
              >
                {loading ? "Đang tạo..." : "Tạo mã QR"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
