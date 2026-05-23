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
        <QRModal payment={selectedPayment} open={showQRModal} onClose={() => { setShowQRModal(false); setSelectedPayment(null); }} onSuccess={loadPayments} />
      )}

      {/* QR creation modal (no payment selected) */}
      {!selectedPayment && (
        <QRCreateModal open={showQRModal} onClose={() => setShowQRModal(false)} onSuccess={loadPayments} />
      )}
    </div>
  );
}

function QRModal({ payment, open, onClose, onSuccess }: {
  payment: Payment; open: boolean; onClose: () => void; onSuccess?: () => void;
}) {
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) { setQrData(null); return; }
    if (payment.status === "pending") generateQR();
  }, [open]);

  const generateQR = async () => {
    setLoading(true);
    try {
      const res = await paymentApi.generateQR({
        amount: payment.amount,
        invoiceNumber: payment.invoiceNumber,
        patientName: payment.patientName,
      });
      if (res.data?.success) setQrData(res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await paymentApi.confirmQR(payment._id);
      alert("Da xac nhan thanh toan thanh cong!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Xac nhan that bai.");
    } finally {
      setConfirming(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #003A70 0%, #0055A4 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center">
              <span className="text-white font-black text-base">MB</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">QR Thanh toan</h2>
              <p className="text-blue-200 text-xs">Ma hoa don: {payment.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white text-2xl font-light">X</button>
        </div>

        <div className="p-6 space-y-4 text-center">
          {loading ? (
            <div className="py-8 text-slate-500">Dang tao ma QR...</div>
          ) : qrData ? (
            <>
              {/* Amount */}
              <div
                className="rounded-xl p-4 text-center"
                style={{ background: "linear-gradient(135deg, #003A70 0%, #0055A4 100%)" }}
              >
                <p className="text-blue-200 text-xs font-bold uppercase">So tien thanh toan</p>
                <p className="text-3xl font-black text-white mt-1">
                  {Number(qrData.amount).toLocaleString("vi-VN")}
                  <span className="text-lg font-bold ml-1">VND</span>
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-white rounded-xl p-4 text-center border border-slate-200 shadow-sm">
                <img src={qrData.qrDataUrl} alt="QR" className="w-52 h-52 mx-auto rounded-xl" />
                <p className="text-xs text-slate-400 mt-2">Quet ma QR bang ung dung ngan hang</p>
              </div>

              {/* Bank details */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div
                  className="px-4 py-2.5"
                  style={{ background: "linear-gradient(135deg, #003A70 0%, #0055A4 100%)" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-amber-400 flex items-center justify-center">
                      <span className="text-white font-black text-[9px]">MB</span>
                    </div>
                    <p className="text-white text-xs font-bold uppercase tracking-wider">MBBank - Thong tin tai khoan</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { label: "So tai khoan", value: "280605666888" },
                    { label: "Ten tai khoan", value: "Nguyen Thai Son" },
                    { label: "Noi dung CK", value: qrData.addInfo },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-4 py-3">
                      <span className="text-xs font-medium text-slate-400">{item.label}</span>
                      <span className="text-sm font-bold text-slate-700">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm button (only for pending) */}
              {payment.status === "pending" && (
                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }}
                >
                  {confirming ? "Dang xu ly..." : "Da nhan duoc tien - Xac nhan thanh toan"}
                </button>
              )}
            </>
          ) : (
            <div className="py-8 text-slate-500">
              <p>Ma QR chi hien thi cho phieu <strong>cho thanh toan</strong>.</p>
              <p className="text-sm mt-2">Trang thai hien tai: <strong>{statusConfig[payment.status]?.label}</strong></p>
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
  const [step, setStep] = useState<"setup" | "qr">("setup");
  const [patientName, setPatientName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("setup");
      setQrData(null);
      setPatientName("");
      setInvoiceNumber("");
      setAmount("");
      setDescription("");
      setCreatedPaymentId(null);
    }
  }, [open]);

  const handleGenerate = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ.");
      return;
    }
    setLoading(true);
    try {
      // Generate QR
      const res = await paymentApi.generateQR({
        amount: Number(amount),
        invoiceNumber: invoiceNumber || undefined,
        patientName: patientName || undefined,
        description: description || undefined,
      });
      if (res.data?.success) {
        setQrData(res.data.data);
        setStep("qr");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể tạo mã QR.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!createdPaymentId) return;
    setConfirmLoading(true);
    try {
      await paymentApi.confirmQR(createdPaymentId);
      alert("Đã xác nhận thanh toán thành công!");
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Xác nhận thất bại.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handlePrintQR = () => {
    if (!qrData?.qrDataUrl) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>In QR Thanh Toan</title><style>body{font-family:Arial;text-align:center;padding:40px;}h2{color:#0c4a6e;}p{font-size:14px;color:#555;}img{border:4px solid #003A70;border-radius:12px;}.info{margin-top:16px;font-weight:bold;color:#059669;}</style></head><body><h2>Phong Kham Nha Khoa VinaMec</h2><p>Ma hoa don: ${invoiceNumber || ""}</p><p>Benh nhan: ${patientName || ""}</p><img src="${qrData.qrDataUrl}" width="300"/><p class="info">So tien: ${Number(qrData.amount).toLocaleString("vi-VN")} VND</p><p>STK: 280605666888 - Nguyen Thai Son</p><p>Noi dung: ${qrData.addInfo}</p><script>window.print();<\/script></body></html>`);
    win.document.close();
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
          {step === "setup" ? (
            <>
              {/* MBBank info banner */}
              <div
                className="rounded-xl p-4 text-white text-center"
                style={{ background: "linear-gradient(135deg, #003A70 0%, #0055A4 100%)" }}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-black text-base">MB</span>
                </div>
                <p className="font-bold text-sm">QR MBBank VietQR</p>
                <p className="text-blue-200 text-xs mt-1">STK: 280605666888 - Nguyen Thai Son</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tên bệnh nhân</label>
                <input
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
                  placeholder="Nhập tên bệnh nhân"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mã hóa đơn</label>
                <input
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
                  placeholder="VD: INV-202506-0001"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả</label>
                <input
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
                  placeholder="Mô tả dịch vụ"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Số tiền (VNĐ) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 font-semibold"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading || !amount}
                className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 14px rgba(124,58,237,0.4)" }}
              >
                {loading ? "Đang tạo mã QR..." : "Tạo mã QR"}
              </button>
            </>
          ) : (
            /* QR Display step */
            <div className="space-y-4">
              {/* Amount display */}
              <div
                className="rounded-xl p-4 text-center"
                style={{ background: "linear-gradient(135deg, #003A70 0%, #0055A4 100%)" }}
              >
                <p className="text-blue-200 text-xs font-bold uppercase">So tien thanh toan</p>
                <p className="text-3xl font-black text-white mt-1">
                  {Number(qrData.amount).toLocaleString("vi-VN")}
                  <span className="text-lg font-bold ml-1">VND</span>
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-white rounded-xl p-4 text-center border border-slate-200 shadow-sm">
                <img src={qrData.qrDataUrl} alt="QR" className="w-52 h-52 mx-auto rounded-xl" />
                <p className="text-xs text-slate-400 mt-2">Quet ma QR bang ung dung ngan hang</p>
              </div>

              {/* Bank details */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div
                  className="px-4 py-2.5"
                  style={{ background: "linear-gradient(135deg, #003A70 0%, #0055A4 100%)" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-amber-400 flex items-center justify-center">
                      <span className="text-white font-black text-[9px]">MB</span>
                    </div>
                    <p className="text-white text-xs font-bold uppercase tracking-wider">MBBank - Thong tin tai khoan</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { label: "So tai khoan", value: "280605666888" },
                    { label: "Ten tai khoan", value: "Nguyen Thai Son" },
                    { label: "Noi dung CK", value: qrData.addInfo },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-4 py-3">
                      <span className="text-xs font-medium text-slate-400">{item.label}</span>
                      <span className="text-sm font-bold text-slate-700">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handlePrintQR}
                  className="py-3 rounded-xl font-semibold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  In QR
                </button>
                <button
                  onClick={() => setStep("setup")}
                  className="py-3 rounded-xl font-semibold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  Tao QR khac
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
