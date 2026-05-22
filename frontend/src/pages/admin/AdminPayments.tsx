import { useState, useEffect } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Modal from "../../components/ui/Modal";
import { paymentApi, patientApi, appointmentApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface Payment {
  _id: string;
  invoiceNumber: string;
  patient: { _id: string; name: string; email: string };
  patientName: string;
  appointment?: { _id: string; date: string; time: string; serviceName: string };
  amount: number;
  method: string;
  status: string;
  paidAt: string;
  description: string;
  services: Array<{ name: string; price: number }>;
  discount: number;
  tax: number;
  recordedByName: string;
  createdAt: string;
}

interface Patient {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
}

interface Appointment {
  _id: string;
  id?: string;
  patientName: string;
  serviceName: string;
  date: string;
  time: string;
  fee: number;
  isPaid: boolean;
  status: string;
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

const formatMoney = (n: number) =>
  n >= 1000000
    ? (n / 1000000).toFixed(1) + "M"
    : n >= 1000
    ? (n / 1000).toFixed(0) + "K"
    : String(n);

export default function AdminPayments() {
  const { data: payments, loading, refetch } = useApi<Payment[]>(() =>
    paymentApi.getAll().then((res) => {
      const p = res.data?.data;
      return Array.isArray(p?.data) ? p.data : Array.isArray(p) ? p : [];
    })
  );

  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    paymentApi.getStats().then((res) => setStats(res.data?.data)).catch(() => {});
  }, []);

  const filtered = (payments || []).filter((p) => {
    const matchSearch =
      !search ||
      p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalAmount = (filtered || []).reduce((s, p) => s + (p.status === "paid" ? p.amount : 0), 0);

  const chartData = stats?.monthlyTrend?.length > 0
    ? {
        labels: stats.monthlyTrend.map((t: any) => `T${t._id.month}`),
        datasets: [{
          label: "Doanh thu (VNĐ)",
          data: stats.monthlyTrend.map((t: any) => t.total),
          fill: true,
          backgroundColor: "rgba(14,165,233,0.08)",
          borderColor: "#0ea5e9",
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: "#0ea5e9",
        }],
      }
    : null;

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <AdminSidebar />
      <div className="flex-1 lg:ml-0 min-w-0">
        {/* Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Quản lý thanh toán</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {(payments || []).length} phiếu thanh toán
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQRModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 4px 14px rgba(16,185,129,0.4)",
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              QR MBBank
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)", boxShadow: "0 4px 14px rgba(14,165,233,0.4)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M12 4v16m8-8H4" />
              </svg>
              Tạo phiếu thu
            </button>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-5">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Tổng doanh thu", value: formatMoney(stats.totalRevenue) + " đ", color: "#0ea5e9" },
                { label: "Doanh thu tháng", value: formatMoney(stats.monthRevenue) + " đ", color: "#10b981" },
                { label: "Chờ thanh toán", value: stats.pendingPayments, color: "#f59e0b" },
                { label: "Tổng phiếu", value: stats.totalPayments, color: "#8b5cf6" },
              ].map((s) => (
                <div key={s.label} className="card p-4 text-center border border-slate-100 animate-scale-in">
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs font-semibold text-slate-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Chart */}
          {chartData && (
            <div className="card p-5 border border-slate-100 animate-fade-in">
              <h3 className="text-base font-bold text-slate-800 mb-1">Xu hướng doanh thu</h3>
              <p className="text-xs text-slate-400 mb-4">12 tháng gần nhất</p>
              <div style={{ height: "200px" }}>
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: "#f1f5f9" } }, x: { grid: { display: false } } },
                  }}
                />
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="card card-hover p-3 flex-1 border border-slate-100 flex items-center gap-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
                placeholder="Tìm theo tên, email, hoặc mã hóa đơn..."
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
              {["all", "paid", "pending", "failed", "refunded", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === s
                      ? "text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                  style={filterStatus === s ? { background: "linear-gradient(135deg, #0ea5e9, #0369a1)" } : {}}
                >
                  {s === "all" ? "Tất cả" : statusConfig[s]?.label || s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {!loading && filtered.length === 0 && (
            <div className="card text-center py-16 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, #0ea5e915, #0369a115)" }}>
                <svg className="w-8 h-8 text-sky-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="font-black text-slate-700 text-lg mb-2">Chưa có phiếu thanh toán</p>
              <p className="text-sm text-slate-400">Tạo phiếu thu đầu tiên cho phòng khám</p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="card overflow-hidden border border-slate-100 animate-fade-in">
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
                          className="border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer"
                          onClick={() => { setSelectedPayment(p); setShowDetailModal(true); }}
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-lg">
                              {p.invoiceNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800">{p.patientName}</p>
                            <p className="text-xs text-slate-400">{p.patient?.email}</p>
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
                              onClick={(e) => { e.stopPropagation(); setSelectedPayment(p); setShowDetailModal(true); }}
                              className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-medium text-xs transition border border-sky-200"
                            >
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {filtered.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-50 border-t-2 border-slate-200">
                        <td colSpan={2} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng cộng</td>
                        <td className="px-4 py-3 font-black text-sky-700">{totalAmount.toLocaleString("vi-VN")} đ</td>
                        <td colSpan={4} />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl skeleton" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Payment Modal */}
      <CreatePaymentModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => { setShowCreateModal(false); refetch(); }}
      />

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          open={showDetailModal}
          onClose={() => { setShowDetailModal(false); setSelectedPayment(null); }}
          onUpdated={() => { refetch(); }}
        />
      )}

      {/* QR Payment Modal */}
      <QRPaymentModal
        open={showQRModal}
        onClose={() => setShowQRModal(false)}
        onSuccess={() => { setShowQRModal(false); refetch(); }}
      />
    </div>
  );
}

function CreatePaymentModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    userId: "", patientId: "", appointmentId: "", amount: "",
    method: "cash", description: "", discount: "0", tax: "0",
    notes: "", serviceName: "", servicePrice: "",
  });
  const [services, setServices] = useState<Array<{ name: string; price: number }>>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"patient" | "services" | "payment">("patient");

  useEffect(() => {
    if (open) {
      patientApi.getAll().then((res) => setPatients(Array.isArray(res.data) ? res.data : []));
    }
  }, [open]);

  const loadAppointments = async (userId: string) => {
    appointmentApi.getAll().then((res) => {
      const all = res.data?.data;
      const list: Appointment[] = Array.isArray(all?.data) ? all.data : Array.isArray(all) ? all : [];
      setAppointments(list.filter((a) => {
        const pid = (a as any).patient?._id || (a as any).patient;
        return pid === userId;
      }));
    });
  };

  const addService = () => {
    if (!form.serviceName.trim()) return;
    setServices([...services, { name: form.serviceName.trim(), price: Number(form.servicePrice) || 0 }]);
    setForm({ ...form, serviceName: "", servicePrice: "" });
  };

  const removeService = (i: number) => setServices(services.filter((_, idx) => idx !== i));

  const total = services.reduce((s, sv) => s + sv.price, 0) - Number(form.discount || 0) + Number(form.tax || 0);
  // userId: User ID for API calls (Patient.user from Patient document)
  const userId = form.userId;

  const handleSubmit = async () => {
    if (!form.userId || !form.amount) return;
    setLoading(true);
    try {
      await paymentApi.create({
        patientId: form.userId,
        appointmentId: form.appointmentId || null,
        amount: Number(form.amount),
        method: form.method,
        description: form.description,
        services,
        discount: Number(form.discount || 0),
        tax: Number(form.tax || 0),
        notes: form.notes,
      });
      onCreated();
    } catch (err: any) {
      alert(err.response?.data?.message || "Tạo phiếu thu thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Tạo phiếu thu mới</h2>
            <p className="text-sm text-slate-500 mt-1">Bước {step === "patient" ? "1" : step === "services" ? "2" : "3"} / 3</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {step === "patient" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn bệnh nhân *</label>
                <select
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 transition"
                  value={form.userId}
                  onChange={(e) => { setForm({ ...form, userId: e.target.value }); loadAppointments(e.target.value); }}
                  required
                  style={{ background: "#fafafa" }}
                >
                  <option value="">— Chọn bệnh nhân —</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
                  ))}
                </select>
              </div>
              {appointments.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Liên kết lịch hẹn (tùy chọn)</label>
                  <select
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 transition"
                    value={form.appointmentId}
                    onChange={(e) => setForm({ ...form, appointmentId: e.target.value })}
                    style={{ background: "#fafafa" }}
                  >
                    <option value="">— Không liên kết —</option>
                    {appointments.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.serviceName} — {a.date} {a.time} — {a.fee?.toLocaleString("vi-VN")} đ
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={() => setStep("services")}
                disabled={!form.userId}
                className="w-full btn-primary disabled:opacity-50"
              >
                Tiếp tục →
              </button>
            </>
          )}

          {step === "services" && (
            <>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm font-bold text-slate-700 mb-3">Dịch vụ đã thêm ({services.length})</p>
                {services.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Chưa có dịch vụ nào</p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {services.map((s, i) => (
                      <div key={i} className="flex items-center justify-between bg-white rounded-lg p-2 border border-slate-100">
                        <span className="text-sm text-slate-700">{s.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-sky-600">{s.price.toLocaleString("vi-VN")} đ</span>
                          <button onClick={() => removeService(i)} className="w-5 h-5 rounded bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center text-xs">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tên dịch vụ</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500"
                    placeholder="Ví dụ: Nhổ răng khôn"
                    value={form.serviceName}
                    onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
                    style={{ background: "#fafafa" }}
                  />
                  <input
                    type="number"
                    className="w-28 px-3 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500"
                    placeholder="Giá (đ)"
                    value={form.servicePrice}
                    onChange={(e) => setForm({ ...form, servicePrice: e.target.value })}
                    style={{ background: "#fafafa" }}
                  />
                  <button onClick={addService} className="px-3 py-2 bg-sky-100 text-sky-700 rounded-xl font-semibold text-sm hover:bg-sky-200 transition">+</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Giảm giá (đ)</label>
                  <input type="number" className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500" placeholder="0"
                    value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} style={{ background: "#fafafa" }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Thuế (đ)</label>
                  <input type="number" className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500" placeholder="0"
                    value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} style={{ background: "#fafafa" }} />
                </div>
              </div>

              <div className="bg-sky-50 rounded-xl p-4 text-center">
                <p className="text-xs text-sky-600 font-semibold uppercase tracking-wider">Tổng cộng</p>
                <p className="text-2xl font-black text-sky-700 mt-1">{total.toLocaleString("vi-VN")} đ</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("patient")} className="flex-1 btn-secondary">← Quay lại</button>
                <button onClick={() => setStep("payment")} className="flex-1 btn-primary">Tiếp tục →</button>
              </div>
            </>
          )}

          {step === "payment" && (
            <>
              <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-200">
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Số tiền thanh toán</p>
                <p className="text-3xl font-black text-emerald-700 mt-1">{total.toLocaleString("vi-VN")} đ</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phương thức thanh toán</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(methodLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setForm({ ...form, method: key })}
                      className={`px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
                        form.method === key
                          ? "border-sky-400 bg-sky-50 text-sky-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mô tả</label>
                <textarea className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 resize-none h-20"
                  placeholder="Mô tả phiếu thu..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ background: "#fafafa" }} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú</label>
                <textarea className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 resize-none h-16"
                  placeholder="Ghi chú thêm (tùy chọn)..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ background: "#fafafa" }} />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep("services")} className="flex-1 btn-secondary">← Quay lại</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : `Xác nhận thanh toán ${total.toLocaleString("vi-VN")} đ`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentDetailModal({ payment, open, onClose, onUpdated }: {
  payment: Payment; open: boolean; onClose: () => void; onUpdated: () => void;
}) {
  const [status, setStatus] = useState(payment.status);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setStatus(payment.status); }, [payment]);

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      await paymentApi.update(payment._id, { status });
      setStatus(status);
      onUpdated();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Chi tiết phiếu thu</h2>
            <p className="text-sm text-slate-500 mt-1 font-mono">{payment.invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bệnh nhân</p>
              <p className="text-sm font-semibold text-slate-800">{payment.patientName}</p>
              <p className="text-xs text-slate-400">{payment.patient?.email}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ngày tạo</p>
              <p className="text-sm font-semibold text-slate-800">{new Date(payment.createdAt).toLocaleDateString("vi-VN")}</p>
              <p className="text-xs text-slate-400">bởi {payment.recordedByName}</p>
            </div>
          </div>

          {payment.appointment && (
            <div className="bg-sky-50 rounded-xl p-3 border border-sky-100">
              <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">Lịch hẹn liên kết</p>
              <p className="text-sm font-semibold text-slate-800">{payment.appointment.serviceName}</p>
              <p className="text-xs text-slate-500">{payment.appointment.date} {payment.appointment.time}</p>
            </div>
          )}

          {payment.services?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dịch vụ</p>
              <div className="space-y-1">
                {payment.services.map((s, i) => (
                  <div key={i} className="flex justify-between bg-slate-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-slate-700">{s.name}</span>
                    <span className="text-sm font-semibold text-slate-800">{s.price.toLocaleString("vi-VN")} đ</span>
                  </div>
                ))}
              </div>
              {payment.discount > 0 && (
                <div className="flex justify-between bg-green-50 rounded-lg px-3 py-2 mt-1">
                  <span className="text-sm text-green-700">Giảm giá</span>
                  <span className="text-sm font-semibold text-green-700">-{payment.discount.toLocaleString("vi-VN")} đ</span>
                </div>
              )}
              {payment.tax > 0 && (
                <div className="flex justify-between bg-slate-50 rounded-lg px-3 py-2 mt-1">
                  <span className="text-sm text-slate-700">Thuế</span>
                  <span className="text-sm font-semibold text-slate-800">+{payment.tax.toLocaleString("vi-VN")} đ</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <span className="font-bold text-slate-700">Tổng cộng</span>
            <span className="text-2xl font-black text-emerald-700">{payment.amount.toLocaleString("vi-VN")} đ</span>
          </div>

          <div className="flex justify-between items-center bg-slate-50 rounded-xl p-3">
            <span className="text-sm text-slate-600">Phương thức</span>
            <span
              className="text-sm font-semibold"
              style={{ color: methodColors[payment.method] }}
            >
              {methodLabels[payment.method] || payment.method}
            </span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Cập nhật trạng thái</label>
            <div className="grid grid-cols-3 gap-2">
              {["paid", "pending", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition ${
                    status === s
                      ? `border-sky-400 ${statusConfig[s]?.bg} ${statusConfig[s]?.text}`
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {statusConfig[s]?.label}
                </button>
              ))}
            </div>
          </div>

          {payment.description && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mô tả</p>
              <p className="text-sm text-slate-600">{payment.description}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-secondary">Đóng</button>
            <button
              onClick={handleUpdateStatus}
              disabled={loading || status === payment.status}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật trạng thái"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── QR Payment Modal ──────────────────────────────────────────────────────────
function QRPaymentModal({ open, onClose, onSuccess }: {
  open: boolean; onClose: () => void; onSuccess: () => void;
}) {
  const [step, setStep] = useState<"setup" | "qr">("setup");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      patientApi.getAll().then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setPatients(list);
      }).catch(() => {});
    }
  }, [open]);

  const handleGenerateQR = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ.");
      return;
    }
    setLoading(true);
    try {
      const res = await paymentApi.generateQR({
        amount: Number(amount),
        invoiceNumber: invoiceNumber || undefined,
        patientName: selectedPatient?.name,
        description: description || undefined,
      });
      setQrData(res.data?.data);
      setStep("qr");

      // Auto-create pending payment record
      if (selectedPatient) {
        try {
          const paymentRes = await paymentApi.create({
            patientId: selectedPatient._id,
            amount: Number(amount),
            method: "bank_transfer",
            status: "pending",
            description: description || `Thanh toan QR MBBank ${invoiceNumber || ""}`,
            services: [],
            discount: 0,
            tax: 0,
            notes: "Cho thanh toan QR MBBank",
          });
          const newPayment = paymentRes.data?.data;
          if (newPayment?._id) setCreatedPaymentId(newPayment._id);
        } catch (_) {}
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
      alert("Xác nhận thanh toán thành công!");
      onSuccess();
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
    win.document.write(`
      <html><head><title>In QR Thanh Toan</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
        h2 { color: #0c4a6e; }
        p { font-size: 14px; color: #555; }
        img { border: 4px solid #0ea5e9; border-radius: 12px; }
        .info { margin-top: 16px; font-weight: bold; color: #059669; }
      </style></head>
      <body>
        <h2>Phong Kham Nha Khoa VinaMec</h2>
        <p>Quet ma QR de thanh toan</p>
        <img src="${qrData.qrDataUrl}" width="300" />
        <p class="info">So tien: ${Number(qrData.amount).toLocaleString("vi-VN")} VND</p>
        <p>STK: ${qrData.accountNo} - ${qrData.accountName}</p>
        <p>${qrData.addInfo}</p>
        <script>window.print();<\/script>
      </body></html>
    `);
    win.document.close();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">QR Thanh toán MBBank</h2>
              <p className="text-sm text-slate-500">
                {step === "setup" ? "Thiết lập thanh toán" : "Quét mã QR để thanh toán"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {step === "setup" && (
            <>
              {/* Bank info banner */}
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-4 text-white text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="font-bold">Ngân hàng BIDV</span>
                </div>
                <p className="text-emerald-100 text-sm">STK: <strong>1231270139</strong></p>
                <p className="text-emerald-100 text-sm">Tên: <strong>TRAN QUOC HUY</strong></p>
              </div>

              {/* Patient selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn bệnh nhân (tùy chọn)</label>
                <select
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition"
                  style={{ background: "#fafafa" }}
                  onChange={(e) => {
                    const p = patients.find((x) => x._id === e.target.value);
                    setSelectedPatient(p || null);
                  }}
                >
                  <option value="">— Không chọn —</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
                  ))}
                </select>
              </div>

              {/* Invoice number */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mã hóa đơn (tùy chọn)</label>
                <input
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition"
                  placeholder="VD: INV-202505-0001"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  style={{ background: "#fafafa" }}
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Số tiền thanh toán (VNĐ) *</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full px-4 py-3 pr-16 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition font-semibold"
                    placeholder="0"
                    min="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ background: "#fafafa" }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-semibold">VND</span>
                </div>
                {amount && (
                  <p className="text-xs text-emerald-600 mt-1 font-semibold">
                    Bằng chữ: {Number(amount).toLocaleString("vi-VN")} đồng
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nội dung thanh toán</label>
                <input
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition"
                  placeholder="VD: Thanh toan kham rang"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ background: "#fafafa" }}
                />
              </div>

              <button
                onClick={handleGenerateQR}
                disabled={loading || !amount}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Đang tạo mã QR...
                  </span>
                ) : (
                  "Tạo mã QR"
                )}
              </button>
            </>
          )}

          {step === "qr" && qrData && (
            <>
              {/* QR Code Display */}
              <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-100">
                <div className="bg-white rounded-2xl p-4 inline-block shadow-md border border-slate-200">
                  <img
                    src={qrData.qrDataUrl}
                    alt="QR Code"
                    className="w-56 h-56 mx-auto"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-3">Quét mã bằng ứng dụng ngân hàng</p>
              </div>

              {/* Payment Info */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200 text-center">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Số tiền cần thanh toán</p>
                <p className="text-3xl font-black text-emerald-700">
                  {Number(qrData.amount).toLocaleString("vi-VN")} <span className="text-lg">đ</span>
                </p>
              </div>

              {/* Bank Details */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2">
                  <p className="text-white text-xs font-bold uppercase tracking-wider">Thông tin tài khoản</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { label: "Ngân hàng", value: "BIDV" },
                    { label: "Mã ngân hàng", value: "970422" },
                    { label: "Số tài khoản", value: "1231270139" },
                    { label: "Tên tài khoản", value: "TRAN QUOC HUY" },
                    { label: "Nội dung CK", value: qrData.addInfo },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-4 py-3">
                      <span className="text-xs font-semibold text-slate-400">{item.label}</span>
                      <span className={`text-sm font-bold ${item.label === "So tai khoan" ? "font-mono text-emerald-600" : "text-slate-700"}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR String */}
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                <p className="text-xs text-amber-600 font-semibold mb-1">Mã QR:</p>
                <p className="text-xs font-mono text-slate-500 break-all">{qrData.qrString}</p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm font-bold text-blue-700 mb-2">Hướng dẫn thanh toán:</p>
                <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                  <li>Mở ứng dụng ngân hàng MBBank hoặc app VietQR</li>
                  <li>Chọn tính năng <strong>Quét mã QR</strong></li>
                  <li>Quét mã QR bên trên hoặc nhập thông tin thủ công</li>
                  <li>Nhập đúng số tiền: <strong>{Number(qrData.amount).toLocaleString("vi-VN")} VND</strong></li>
                  <li>Xác nhận thanh toán</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep("setup")}
                  className="py-3 rounded-xl font-semibold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  ← Tạo lại
                </button>
                <button
                  onClick={handlePrintQR}
                  className="py-3 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  In QR
                </button>
              </div>

              {/* Confirm Payment Button */}
              {createdPaymentId && (
                <button
                  onClick={handleConfirmPayment}
                  disabled={confirmLoading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }}
                >
                  {confirmLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Đang xác nhận...
                    </span>
                  ) : (
                    "Da nhan duoc tien — Xac nhan thanh toan"
                  )}
                </button>
              )}
              <p className="text-center text-xs text-slate-400">
                Sau khi bệnh nhân chuyển khoản xong, bấm nút trên để xác nhận thanh toán.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
