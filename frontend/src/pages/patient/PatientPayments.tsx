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
  const [showCash, setShowCash] = useState(false);
  const [cashInvoice, setCashInvoice] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [checking, setChecking] = useState(false);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [currentInvoice, setCurrentInvoice] = useState("");

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    let timer: any;
    if (showQR && !isSuccess && currentInvoice) {
      // Poll every 3 seconds to check if status is paid
      timer = setInterval(async () => {
        try {
          const res = await paymentApi.getMine();
          const list = res.data?.data || res.data || [];
          const found = list.find((p: any) => p.invoiceNumber === currentInvoice);
          if (found && found.status === "paid") {
            setIsSuccess(true);
            loadPayments(); // Reload list behind modal
          }
        } catch {}
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [showQR, isSuccess, currentInvoice]);

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
    setIsSuccess(false);
    setChecking(false);
    setCurrentAmount(amount);
    setCurrentInvoice(invoiceNumber);
    try {
      const res = await paymentApi.generateQR({ amount, invoiceNumber });
      if (res.data?.success) setQrData(res.data.data);
    } catch {} finally {
      setQrLoading(false);
    }
  };

  const handleShowCash = (invoiceNumber: string) => {
    setCashInvoice(invoiceNumber);
    setShowCash(true);
  };

  const handleCheckPaymentManual = async () => {
    if (checking) return;
    setChecking(true);
    setTimeout(async () => {
      try {
        const res = await paymentApi.getMine();
        const list = res.data?.data || res.data || [];
        const found = list.find((p: any) => p.invoiceNumber === currentInvoice);
        if (found && found.status === "paid") {
          setIsSuccess(true);
          loadPayments();
        } else {
          alert("Chưa tìm thấy giao dịch chuyển khoản. Nếu bạn đã hoàn thành chuyển khoản, vui lòng đợi ít phút để hệ thống kiểm tra ngân hàng.");
        }
      } catch {
        alert("Lỗi khi kiểm tra. Vui lòng thử lại sau.");
      } finally {
        setChecking(false);
      }
    }, 1500);
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleShowCash(p.invoiceNumber)}
                            className="px-4 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs transition-all border border-slate-200 hover:-translate-y-0.5 active:scale-95"
                          >
                            Tiền mặt
                          </button>
                          <button
                            onClick={() => handleShowQR(p.amount, p.invoiceNumber)}
                            className="px-5 py-2.5 rounded-xl font-bold text-white text-xs transition-all hover:-translate-y-0.5 active:scale-95 shadow-md shadow-emerald-100 hover:shadow-emerald-200"
                            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
                          >
                            Thanh toán QR
                          </button>
                        </div>
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-scale-in">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {isSuccess ? "Thanh toán thành công" : "Quét mã QR để thanh toán"}
              </h2>
              <button onClick={() => { setShowQR(false); setQrData(null); }} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4 text-center">
              {isSuccess ? (
                <div className="space-y-4 py-4 animate-bounce-in">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-500 flex items-center justify-center mx-auto shadow-md">
                    <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-emerald-700">Giao dịch hoàn tất!</h3>
                    <p className="text-sm text-slate-600">
                      Hệ thống đã tự động nhận diện khoản chuyển khoản của bạn.
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-left text-xs space-y-1 font-semibold text-emerald-800">
                    <p>Mã hóa đơn: <span className="font-mono text-sm font-bold">{currentInvoice}</span></p>
                    <p>Số tiền: <span>{currentAmount.toLocaleString("vi-VN")} đ</span></p>
                    <p>Trạng thái: <span>Đã thanh toán thành công</span></p>
                  </div>
                  <button
                    onClick={() => { setShowQR(false); setQrData(null); }}
                    className="w-full btn-emerald justify-center font-bold"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              ) : qrLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <svg className="animate-spin w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <p className="text-sm text-slate-500">Đang khởi tạo VietQR giao dịch...</p>
                </div>
              ) : qrData ? (
                <>
                  <div className="bg-white rounded-2xl p-4 inline-block shadow border border-slate-200 relative">
                    <img src={qrData.qrDataUrl} alt="QR" className="w-52 h-52" />
                    <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none rounded-2xl" />
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <p className="text-xs text-emerald-600 font-bold uppercase">Số tiền cần thanh toán</p>
                    <p className="text-3xl font-black text-emerald-700">{Number(qrData.amount).toLocaleString("vi-VN")} đ</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-left text-sm space-y-2 border border-blue-100">
                    <p className="font-bold text-blue-700">Thông tin tài khoản:</p>
                    <p>🏦 Ngân hàng: <strong>{qrData.bankId || "BIDV BANK"}</strong></p>
                    <p>🔢 STK: <strong>{qrData.accountNo || "1231270139"}</strong></p>
                    <p>👤 Tên: <strong>{qrData.accountName || "TRAN QUOC HUY"}</strong></p>
                    <p>📝 Nội dung: <strong className="text-indigo-700 font-mono">{qrData.addInfo}</strong></p>
                  </div>
                  
                  {/* Realtime Status Bar */}
                  <div className="flex items-center justify-center gap-2 bg-slate-50 rounded-xl py-2 px-3 border border-slate-100 text-xs text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 status-dot-pulse" />
                    <span>Đang chờ giao dịch... Tự động nhận diện (3s)</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCheckPaymentManual}
                      disabled={checking}
                      className="flex-1 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs transition border border-slate-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {checking ? (
                        <>
                          <svg className="animate-spin w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Đang kiểm tra...
                        </>
                      ) : (
                        <>🔍 Kiểm tra ngay</>
                      )}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Cash Modal */}
      {showCash && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Thanh toán tiền mặt</h2>
              <button onClick={() => { setShowCash(false); setCashInvoice(""); }} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-2 text-3xl">
                💵
              </div>
              <p className="text-sm text-slate-600">
                Để thanh toán bằng tiền mặt, quý khách vui lòng đến trực tiếp quầy tiếp đón hoặc quầy thu ngân của phòng khám Nha khoa VinaMec.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left space-y-2">
                <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Thông tin thanh toán:</p>
                <p className="text-sm text-slate-700">Mã hóa đơn: <strong className="font-mono text-emerald-800 text-base">{cashInvoice}</strong></p>
                <p className="text-xs text-slate-400">Vui lòng cung cấp mã hóa đơn trên cho nhân viên quầy để được hỗ trợ thực hiện giao dịch nhanh chóng.</p>
              </div>
              <button
                onClick={() => { setShowCash(false); setCashInvoice(""); }}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg text-white font-bold rounded-xl transition text-sm"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
