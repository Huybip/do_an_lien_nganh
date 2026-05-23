import { useState, useEffect } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { paymentApi, patientApi } from "../../services/api";
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
  reason: string;
  notes: string;
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
    paymentApi.getAll()
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

  const refreshAll = () => {
    refetch();
    paymentApi.getStats().then((res) => setStats(res.data?.data)).catch(() => {});
  };

  const filtered = (payments || []).filter((p: Payment) => {
    const matchSearch =
      !search ||
      p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalAmount = filtered.reduce((s, p) => s + (p.status === "paid" ? p.amount : 0), 0);

  // Build chart from locally loaded payments (always works, no backend dependency)
  const chartData = (() => {
    const months: Record<string, number> = {};
    const now = new Date();
    // Init last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months[`${d.getFullYear()}-${d.getMonth() + 1}`] = 0;
    }
    (payments || []).forEach((p) => {
      if (p.status !== "paid") return;
      const d = new Date(p.paidAt || p.createdAt);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (key in months) months[key] += p.amount;
    });
    const labels = Object.keys(months).map((k) => {
      const [y, m] = k.split("-");
      return `T${m}`;
    });
    const data = Object.values(months);
    const hasData = data.some((v) => v > 0);
    if (!hasData) return null;
    return {
      labels,
      datasets: [{
        label: "Doanh thu (VNĐ)",
        data,
        fill: true,
        backgroundColor: "rgba(14,165,233,0.08)",
        borderColor: "#0ea5e9",
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: "#0ea5e9",
        pointRadius: 4,
      }],
    };
  })();

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
                      {["Mã hóa đơn", "Bệnh nhân", "Số tiền", "Phương thức", "Trạng thái", "Lí do", "Ngày tạo", "Thao tác"].map((h) => (
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
                          <td className="px-4 py-3 text-xs text-slate-500 max-w-[140px] truncate" title={p.reason || "—"}>
                            {p.reason || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {new Date(p.createdAt).toLocaleDateString("vi-VN")}
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
                        <td colSpan={5} />
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
        onCreated={() => { setShowCreateModal(false); refreshAll(); }}
      />

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          open={showDetailModal}
          onClose={() => { setShowDetailModal(false); setSelectedPayment(null); }}
          onUpdated={() => { refreshAll(); }}
        />
      )}

      {/* QR Payment Modal */}
      <QRPaymentModal
        open={showQRModal}
        onClose={() => setShowQRModal(false)}
        onSuccess={() => { setShowQRModal(false); refreshAll(); }}
      />
    </div>
  );
}

function CreatePaymentModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    userId: "", patientId: "", appointmentId: "", amount: "",
    method: "cash", description: "", reason: "", discount: "0", tax: "0",
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

  const loadAppointments = async (patientId: string) => {
    setAppointments([]);
    const { appointmentApi: aptApi } = await import("../../services/api");
    try {
      const patient = patients.find((p) => p._id === patientId);
      if (!patient) return;

      const patientName = patient.name.trim().toLowerCase();
      const res: any = await aptApi.getAll();
      const paginated = res.data?.data ?? res.data;
      const all: any[] = Array.isArray(paginated?.data)
        ? paginated.data
        : Array.isArray(paginated)
        ? paginated
        : [];
      setAppointments(all.filter((a) =>
        a.patientName?.trim().toLowerCase() === patientName
      ));
    } catch {}
  };

  const addService = () => {
    if (!form.serviceName.trim()) return;
    setServices([...services, { name: form.serviceName.trim(), price: Number(form.servicePrice) || 0 }]);
    setForm({ ...form, serviceName: "", servicePrice: "" });
  };

  const removeService = (i: number) => setServices(services.filter((_, idx) => idx !== i));

  const total = services.reduce((s, sv) => s + sv.price, 0) - Number(form.discount || 0) + Number(form.tax || 0);

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
        reason: form.reason,
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Lí do thanh toán</label>
                <input
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500"
                  placeholder="VD: Thanh toán khám răng, Trồng implant..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  style={{ background: "#fafafa" }}
                />
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
  const [cashReceived, setCashReceived] = useState("");
  const [qrData, setQrData] = useState<any>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const change = cashReceived && !isNaN(Number(cashReceived))
    ? Math.max(0, Number(cashReceived) - payment.amount)
    : null;

  useEffect(() => {
    setStatus(payment.status);
    setCashReceived("");
    setQrData(null);
    setQrLoading(false);
  }, [payment]);

  // Generate QR for bank_transfer pending payments
  useEffect(() => {
    if (open && payment.method === "bank_transfer" && payment.status === "pending" && !qrData && !qrLoading) {
      setQrLoading(true);
      paymentApi.generateQR({ amount: payment.amount, invoiceNumber: payment.invoiceNumber })
        .then((res) => { if (res.data?.success) setQrData(res.data.data); })
        .catch(() => {})
        .finally(() => setQrLoading(false));
    }
  }, [open]);

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      await paymentApi.update(payment._id, { status: "paid" });
      alert("Xac nhan thanh toan thanh cong!");
      onUpdated();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Cap nhat that bai.");
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async () => {
    const received = Number(cashReceived);
    if (!cashReceived || isNaN(received) || received < payment.amount) {
      alert("So tien nhan phai lon hon hoac bang so tien can thanh toan!");
      return;
    }
    setLoading(true);
    try {
      await paymentApi.update(payment._id, {
        status: "paid",
        notes: (payment.notes || "") + `\n[Tien mat] Nhan: ${received.toLocaleString("vi-VN")} VND | Tra lai: ${change?.toLocaleString("vi-VN")} VND`,
      });
      alert(`Thanh toan thanh cong!\nTien nhan: ${received.toLocaleString("vi-VN")} VND\nTien thua tra lai: ${change?.toLocaleString("vi-VN")} VND`);
      onUpdated();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Thanh toan that bai.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      await paymentApi.update(payment._id, { status });
      onUpdated();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Cap nhat that bai.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintQR = () => {
    if (!qrData?.qrDataUrl) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>In QR Thanh Toan</title><style>body{font-family:Arial;text-align:center;padding:40px;}h2{color:#003A70;}p{font-size:14px;color:#555;}img{border:4px solid #003A70;border-radius:12px;}.info{margin-top:16px;font-weight:bold;color:#059669;}</style></head><body><h2>Phong Kham Nha Khoa VinaMec</h2><p>Ma hoa don: ${payment.invoiceNumber}</p><p>Benh nhan: ${payment.patientName}</p><img src="${qrData.qrDataUrl}" width="300"/><p class="info">So tien: ${Number(qrData.amount).toLocaleString("vi-VN")} VND</p><p>STK: 280605666888 - Nguyen Thai Son</p><p>Noi dung: ${qrData.addInfo}</p><script>window.print();<\/script></body></html>`);
    win.document.close();
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

          {/* Total */}
          <div className="flex justify-between items-center rounded-xl p-4"
            style={{ background: "linear-gradient(135deg, #003A70 0%, #0055A4 100%)" }}
          >
            <span className="font-bold text-white text-sm">Tong cong</span>
            <span className="text-2xl font-black text-white">{payment.amount.toLocaleString("vi-VN")} VND</span>
          </div>

          {/* Method + Status badge */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Phuong thuc</p>
              <p className="text-sm font-bold text-slate-800" style={{ color: methodColors[payment.method] }}>
                {methodLabels[payment.method] || payment.method}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig[payment.status]?.bg} ${statusConfig[payment.status]?.text}`}>
              {statusConfig[payment.status]?.label}
            </span>
          </div>

          {/* ALREADY PAID — no action needed */}
          {payment.status === "paid" ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold text-emerald-800">Da thanh toan!</p>
              <p className="text-xs text-emerald-600 mt-1">
                Ngay: {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString("vi-VN") : "—"}
              </p>
            </div>
          ) : payment.status === "cancelled" ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="font-bold text-red-700">Da huy phieu thu</p>
            </div>
          ) : (
            /* PENDING — show payment action based on method */
            <div className="space-y-4">
              {/* CASH — input received amount */}
              {payment.method === "cash" && (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center">
                        <span className="text-white font-black text-sm">C</span>
                      </div>
                      <p className="font-bold text-amber-800 text-sm">Thanh toan tien mat</p>
                    </div>

                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">So tien nhan (VND)</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl text-lg font-bold text-slate-800 focus:outline-none focus:border-amber-500 bg-white"
                        placeholder="0"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                      />
                    </div>

                    {change !== null && (
                      <div className="flex justify-between items-center bg-white border border-amber-300 rounded-xl px-4 py-3">
                        <span className="text-sm text-slate-600">Tien thua tra lai</span>
                        <span className="text-lg font-black text-emerald-600">{change.toLocaleString("vi-VN")} VND</span>
                      </div>
                    )}

                    <button
                      onClick={handleCashPayment}
                      disabled={loading || !cashReceived || Number(cashReceived) < payment.amount}
                      className="w-full mt-3 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }}
                    >
                      {loading ? "Dang xu ly..." : `Xac nhan thanh toan ${payment.amount.toLocaleString("vi-VN")} VND`}
                    </button>
                  </div>
                </div>
              )}

              {/* BANK TRANSFER — QR code */}
              {payment.method === "bank_transfer" && (
                <div className="space-y-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #003A70, #0055A4)" }}>
                        <span className="text-white font-black text-sm">MB</span>
                      </div>
                      <p className="font-bold text-slate-800 text-sm">Thanh toan QR MBBank</p>
                    </div>

                    {qrLoading ? (
                      <div className="text-center py-6 text-slate-500 text-sm">Dang tao ma QR...</div>
                    ) : qrData ? (
                      <div className="space-y-3">
                        {/* QR Code */}
                        <div className="bg-white rounded-xl p-3 text-center border border-slate-200">
                          <img src={qrData.qrDataUrl} alt="QR" className="w-48 h-48 mx-auto rounded-xl" />
                          <p className="text-xs text-slate-400 mt-2">Quet ma QR bang ung dung ngan hang</p>
                        </div>

                        {/* Bank details */}
                        <div className="bg-slate-50 rounded-xl overflow-hidden">
                          <div className="px-4 py-2.5" style={{ background: "linear-gradient(135deg, #003A70 0%, #0055A4 100%)" }}>
                            <p className="text-white text-xs font-bold uppercase">Thong tin tai khoan</p>
                          </div>
                          {[
                            { label: "So tai khoan", value: "280605666888" },
                            { label: "Ten tai khoan", value: "Nguyen Thai Son" },
                            { label: "Noi dung CK", value: qrData.addInfo },
                          ].map((item) => (
                            <div key={item.label} className="flex justify-between px-4 py-2.5 border-b border-slate-100 last:border-0">
                              <span className="text-xs text-slate-400">{item.label}</span>
                              <span className="text-xs font-bold text-slate-700">{item.value}</span>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={handlePrintQR} className="py-2.5 rounded-xl font-semibold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                            In QR
                          </button>
                          <button
                            onClick={handleConfirmPayment}
                            disabled={loading}
                            className="py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }}
                          >
                            {loading ? "Dang xu ly..." : "Da nhan duoc tien"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500 text-sm">Khong the tao ma QR.</div>
                    )}
                  </div>
                </div>
              )}

              {/* OTHER METHODS — manual status update */}
              {(payment.method !== "cash" && payment.method !== "bank_transfer") && (
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-600 mb-3">
                      Phuong thuc thanh toan: <strong>{methodLabels[payment.method]}</strong>
                    </p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
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
                    <button
                      onClick={handleUpdateStatus}
                      disabled={loading || status === payment.status}
                      className="w-full py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }}
                    >
                      {loading ? "Dang xu ly..." : "Cap nhat trang thai"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {payment.description && (
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mo ta</p>
              <p className="text-sm text-slate-600">{payment.description}</p>
            </div>
          )}

          {/* Reason */}
          {payment.reason && (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Lí do thanh toán</p>
              <p className="text-sm text-amber-800 font-medium">{payment.reason}</p>
            </div>
          )}

          {/* Close button */}
          <button onClick={onClose} className="w-full py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
            Dong
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── QR Payment Modal ──────────────────────────────────────────────────────────
function QRPaymentModal({ open, onClose, onSuccess }: {
  open: boolean; onClose: () => void; onSuccess: () => void;
}) {
  const [step, setStep] = useState<"patient" | "receipt" | "qr">("patient");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [services, setServices] = useState<Array<{ name: string; price: number }>>([]);
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null);
  const [createdPayment, setCreatedPayment] = useState<any>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingQR, setLoadingQR] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoadingPatients(true);
      patientApi.getAll().then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setPatients(list);
      }).catch(() => {}).finally(() => setLoadingPatients(false));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setStep("patient");
      setSelectedPatient(null);
      setSelectedAppointment(null);
      setAppointments([]);
      setServices([]);
      setReason("");
      setDescription("");
      setServiceName("");
      setServicePrice("");
      setCreatedPaymentId(null);
      setCreatedPayment(null);
      setQrData(null);
    }
  }, [open]);

  const loadAppointments = async (patientId: string) => {
    setLoadingAppointments(true);
    setAppointments([]);
    setSelectedAppointment(null);
    const { appointmentApi: aptApi } = await import("../../services/api");
    try {
      // Resolve patient name from the local patients list (avoids extra API call + ID mismatch)
      const patient = patients.find((p) => p._id === patientId);
      if (!patient) { setLoadingAppointments(false); return; }

      const patientName = patient.name.trim().toLowerCase();
      const res: any = await aptApi.getAll();
      const paginated = res.data?.data ?? res.data;
      const all: any[] = Array.isArray(paginated?.data)
        ? paginated.data
        : Array.isArray(paginated)
        ? paginated
        : [];
      setAppointments(all.filter((a) =>
        a.patientName?.trim().toLowerCase() === patientName
      ));
    } catch {} finally {
      setLoadingAppointments(false);
    }
  };

  const addService = () => {
    if (!serviceName.trim()) return;
    setServices([...services, { name: serviceName.trim(), price: Number(servicePrice) || 0 }]);
    setServiceName("");
    setServicePrice("");
  };

  const removeService = (i: number) => setServices(services.filter((_, idx) => idx !== i));

  const totalFromAppointment = selectedAppointment ? selectedAppointment.fee : 0;
  const total = totalFromAppointment + services.reduce((s, sv) => s + sv.price, 0);

  const handleCreateReceiptAndQR = async () => {
    if (!selectedPatient || total <= 0) {
      alert("Vui lòng chọn bệnh nhân và nhập số tiền hợp lệ.");
      return;
    }
    if (!reason.trim()) {
      alert("Vui lòng nhập lí do thanh toán.");
      return;
    }
    setLoadingQR(true);
    try {
      // 1. Create payment receipt (pending)
      const paymentRes = await paymentApi.create({
        patientId: selectedPatient._id,
        appointmentId: selectedAppointment?._id || null,
        amount: total,
        method: "bank_transfer",
        status: "pending",
        description: description || `Thanh toán QR MBBank`,
        services: selectedAppointment
          ? [{ name: selectedAppointment.serviceName, price: selectedAppointment.fee }, ...services]
          : services,
        discount: 0,
        tax: 0,
        notes: "Phiếu thu QR MBBank",
        reason: reason.trim(),
      });
      const newPayment = paymentRes.data?.data;
      if (!newPayment?._id) throw new Error("Không tạo được phiếu thu");
      setCreatedPaymentId(newPayment._id);
      setCreatedPayment(newPayment);

      // 2. Generate QR
      const qrRes = await paymentApi.generateQR({
        amount: total,
        invoiceNumber: newPayment.invoiceNumber,
        patientName: selectedPatient.name,
        description: description || `Thanh toan ${newPayment.invoiceNumber}`,
      });
      const qr = qrRes.data?.data;
      if (!qr) throw new Error("Không tạo được mã QR");
      setQrData(qr);

      // Refresh parent table immediately after payment is created
      onSuccess();

      setStep("receipt");
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Lỗi khi tạo phiếu thu.");
    } finally {
      setLoadingQR(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!createdPaymentId) return;
    setConfirmLoading(true);
    try {
      await paymentApi.confirmPayment(createdPaymentId, reason);
      alert("Xác nhận thanh toán thành công! Phiếu thu đã được cập nhật.");
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Xác nhận thất bại.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handlePrintQR = () => {
    if (!qrData?.qrDataUrl || !createdPayment) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>In QR Thanh Toan</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:40px;}h2{color:#003A70;}p{font-size:14px;color:#555;}img{border:4px solid #003A70;border-radius:12px;}.info{margin-top:16px;font-weight:bold;color:#059669;}.receipt{border:1px solid #ddd;padding:20px;max-width:400px;margin:0 auto;}</style></head><body><h2>Phong Kham Nha Khoa VinaMec</h2><p>Ma hoa don: ${createdPayment.invoiceNumber}</p><p>Benh nhan: ${selectedPatient?.name}</p><p>Lí do: ${reason}</p><hr/><img src="${qrData.qrDataUrl}" width="300"/><p class="info">So tien: ${total.toLocaleString("vi-VN")} VND</p><p>STK: 280605666888 - Nguyen Thai Son</p><p>Noi dung: ${qrData.addInfo}</p><script>window.print();<\/script></body></html>`);
    win.document.close();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="sticky top-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #003A70 0%, #0055A4 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center">
              <span className="text-white font-black text-base">MB</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Tạo phiếu thu & QR MBBank</h2>
              <p className="text-blue-200 text-xs">
                {step === "patient" ? "Bước 1: Chọn bệnh nhân & dịch vụ" : step === "receipt" ? "Bước 2: Xác nhận thanh toán" : "Quét mã QR"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white text-2xl font-light">X</button>
        </div>

        <div className="p-6 space-y-5">
          {/* ── Step 1: Patient + Appointment + Services ── */}
          {step === "patient" && (
            <>
              {/* Bank info banner */}
              <div
                className="rounded-xl p-4 text-white text-center"
                style={{ background: "linear-gradient(135deg, #003A70 0%, #0055A4 100%)" }}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-black text-base">MB</span>
                </div>
                <p className="font-bold text-sm">MBBank VietQR</p>
                <p className="text-blue-200 text-xs mt-1">STK: 280605666888 - Nguyen Thai Son</p>
              </div>

              {/* Select Patient */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Chọn bệnh nhân <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition"
                  style={{ background: "#fafafa" }}
                  value={selectedPatient?._id || ""}
                  onChange={(e) => {
                    const p = patients.find((x) => x._id === e.target.value) || null;
                    setSelectedPatient(p);
                    if (p) loadAppointments(p._id);
                    else { setAppointments([]); setSelectedAppointment(null); }
                  }}
                >
                  <option value="">— Chọn bệnh nhân —</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
                  ))}
                </select>
              </div>

              {/* Select Appointment (linked to patient) */}
              {selectedPatient && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Liên kết lịch hẹn (tùy chọn)
                  </label>
                  {loadingAppointments ? (
                    <div className="flex items-center gap-2 text-sm text-slate-400 py-3">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Đang tải lịch hẹn...
                    </div>
                  ) : appointments.length > 0 ? (
                    <div className="space-y-2">
                      {appointments.map((a) => (
                        <div
                          key={a._id}
                          onClick={() => setSelectedAppointment(selectedAppointment?._id === a._id ? null : a)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                            selectedAppointment?._id === a._id
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedAppointment?._id === a._id ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                          }`}>
                            {selectedAppointment?._id === a._id && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800">{a.serviceName}</p>
                            <p className="text-xs text-slate-400">{a.date} lúc {a.time}</p>
                            <p className={`text-xs font-bold mt-1 ${a.isPaid ? "text-emerald-600" : "text-amber-600"}`}>
                              {a.isPaid ? "Đã thanh toán" : `${a.fee?.toLocaleString("vi-VN")} đ — Chưa thanh toán`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 py-2">Không có lịch hẹn nào cho bệnh nhân này.</p>
                  )}
                </div>
              )}

              {/* Manual Services */}
              {selectedPatient && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Dịch vụ bổ sung (thêm dịch vụ nếu cần)
                  </label>
                  <div className="space-y-2">
                    {services.map((s, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                        <span className="text-sm text-slate-700">{s.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-sky-600">{s.price.toLocaleString("vi-VN")} đ</span>
                          <button onClick={() => removeService(i)} className="w-5 h-5 rounded bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center text-xs">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                      placeholder="Tên dịch vụ"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      style={{ background: "#fafafa" }}
                    />
                    <input
                      type="number"
                      className="w-28 px-3 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                      placeholder="Giá (đ)"
                      value={servicePrice}
                      onChange={(e) => setServicePrice(e.target.value)}
                      style={{ background: "#fafafa" }}
                    />
                    <button onClick={addService} className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-semibold text-sm hover:bg-emerald-200 transition">+</button>
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Lí do thanh toán <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition"
                  placeholder="VD: Thanh toán khám răng, Trồng implant,..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ background: "#fafafa" }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nội dung ghi chú</label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition resize-none h-20"
                  placeholder="Ghi chú thêm (tùy chọn)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ background: "#fafafa" }}
                />
              </div>

              {/* Total preview */}
              {(total > 0 || selectedAppointment) && (
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
                  <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Tổng cộng</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">{total.toLocaleString("vi-VN")} đ</p>
                  {selectedAppointment && (
                    <p className="text-xs text-emerald-500 mt-1">Bao gồm phí lịch hẹn: {selectedAppointment.fee?.toLocaleString("vi-VN")} đ + dịch vụ bổ sung</p>
                  )}
                </div>
              )}

              <button
                onClick={handleCreateReceiptAndQR}
                disabled={loadingQR || !selectedPatient || total <= 0}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }}
              >
                {loadingQR ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Đang tạo phiếu thu & mã QR...
                  </span>
                ) : (
                  "Tạo phiếu thu & mã QR MBBank"
                )}
              </button>
            </>
          )}

          {/* ── Step 2: Receipt Summary + QR ── */}
          {step === "receipt" && createdPayment && (
            <>
              {/* Receipt summary */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div
                  className="px-5 py-4 text-white"
                  style={{ background: "linear-gradient(135deg, #003A70 0%, #0055A4 100%)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center">
                      <span className="text-white font-black text-base">MB</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm">PHIẾU THU</p>
                      <p className="text-blue-200 text-xs font-mono">{createdPayment.invoiceNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 font-semibold uppercase">Bệnh nhân</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedPatient?.name}</p>
                      <p className="text-xs text-slate-400">{selectedPatient?.email}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 font-semibold uppercase">Ngày tạo</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {new Date(createdPayment.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                      <p className="text-xs text-slate-400">bởi {createdPayment.recordedByName}</p>
                    </div>
                  </div>

                  {/* Linked appointment */}
                  {selectedAppointment && (
                    <div className="bg-sky-50 rounded-lg p-3 border border-sky-100">
                      <p className="text-xs text-sky-600 font-semibold uppercase">Lịch hẹn liên kết</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedAppointment.serviceName}</p>
                      <p className="text-xs text-slate-500">{selectedAppointment.date} lúc {selectedAppointment.time}</p>
                    </div>
                  )}

                  {/* Services */}
                  {createdPayment.services?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Dịch vụ</p>
                      {createdPayment.services.map((s: any, i: number) => (
                        <div key={i} className="flex justify-between bg-slate-50 rounded-lg px-3 py-2 mb-1">
                          <span className="text-sm text-slate-700">{s.name}</span>
                          <span className="text-sm font-semibold text-slate-800">{s.price.toLocaleString("vi-VN")} đ</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reason */}
                  {reason && (
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                      <p className="text-xs text-amber-600 font-semibold uppercase">Lí do thanh toán</p>
                      <p className="text-sm font-bold text-amber-800 mt-0.5">{reason}</p>
                    </div>
                  )}

                  {/* Total */}
                  <div
                    className="flex justify-between items-center rounded-xl p-4 text-white"
                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                  >
                    <span className="font-bold text-sm">TỔNG CỘNG</span>
                    <span className="text-2xl font-black">{total.toLocaleString("vi-VN")} đ</span>
                  </div>

                  {/* Payment method */}
                  <div className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-amber-400 flex items-center justify-center">
                        <span className="text-white font-black text-[10px]">MB</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">QR MBBank</span>
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Chờ thanh toán</span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              {qrData && (
                <>
                  <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-100">
                    <img src={qrData.qrDataUrl} alt="QR Code" className="w-56 h-56 mx-auto rounded-2xl" />
                    <p className="text-xs text-slate-400 mt-3">Quét mã bằng ứng dụng ngân hàng MBBank</p>
                  </div>

                  {/* Bank info */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div
                      className="px-4 py-2.5"
                      style={{ background: "linear-gradient(135deg, #003A70 0%, #0055A4 100%)" }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-amber-400 flex items-center justify-center">
                          <span className="text-white font-black text-[9px]">MB</span>
                        </div>
                        <p className="text-white text-xs font-bold uppercase tracking-wider">MBBank - Thông tin tài khoản</p>
                      </div>
                    </div>
                    {[
                      { label: "Số tài khoản", value: "280605666888" },
                      { label: "Tên tài khoản", value: "Nguyen Thai Son" },
                      { label: "Nội dung CK", value: qrData.addInfo },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
                        <span className="text-xs font-medium text-slate-400">{item.label}</span>
                        <span className="text-sm font-bold text-slate-700">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm font-bold text-blue-700 mb-2">Hướng dẫn thanh toán:</p>
                    <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                      <li>Mở ứng dụng <strong>MBBank</strong> hoặc app <strong>VietQR</strong></li>
                      <li>Chọn tính năng <strong>Quét mã QR</strong></li>
                      <li>Quét mã QR bên trên</li>
                      <li>Nhập đúng số tiền: <strong>{total.toLocaleString("vi-VN")} VND</strong></li>
                      <li>Xác nhận thanh toán</li>
                    </ol>
                  </div>
                </>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep("patient")}
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

              {/* Confirm Payment */}
              {createdPaymentId && (
                <div className="space-y-3">
                  <button
                    onClick={handleConfirmPayment}
                    disabled={confirmLoading}
                    className="w-full py-4 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
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
                      <>
                        ✓ Đã nhận được tiền — Xác nhận thanh toán thành công
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-400">
                    Sau khi bệnh nhân chuyển khoản xong, bấm nút trên để xác nhận thanh toán thành công và cập nhật vào quản lý thanh toán.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
