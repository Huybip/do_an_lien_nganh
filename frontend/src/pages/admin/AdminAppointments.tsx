import { useState } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import { appointmentApi, paymentApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import type { Appointment } from "../../types";

interface CompleteResult {
  appointment: Appointment;
  payment: any;
  message: string;
}

export default function AdminAppointments() {
  const { data: appointments, loading, refetch } = useApi<Appointment[]>(() =>
    appointmentApi.getAll()
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");

  // Complete + QR modal state
  const [completeResult, setCompleteResult] = useState<CompleteResult | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const filtered = (appointments || []).filter((apt) => {
    const matchSearch =
      !search ||
      apt.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      apt.doctorName?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || apt.status === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa lịch hẹn này?")) return;
    setDeleting(id);
    try {
      await appointmentApi.delete(id);
      refetch();
    } finally {
      setDeleting(null);
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await appointmentApi.update(id, { status: "checked-in" });
      alert("Đã tiếp đón bệnh nhân thành công!");
      refetch();
    } catch (error) {
      alert("Tiếp đón bệnh nhân thất bại.");
    }
  };

  const handleComplete = async (apt: Appointment) => {
    if (!confirm(`Hoàn thành khám cho bệnh nhân "${apt.patientName}" và tự động tạo hóa đơn tiền mặt?`)) return;
    setCompletingId(apt.id);
    try {
      const res = await appointmentApi.complete(apt.id, {});
      const result = res.data?.data;
      setCompleteResult(result);
      alert(`Hoàn thành khám cho bệnh nhân "${apt.patientName}" thành công!`);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể hoàn thành lịch hẹn.");
    } finally {
      setCompletingId(null);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "checked-in": "bg-violet-50 text-violet-700 border-violet-200",
    completed: "bg-sky-50 text-sky-700 border-sky-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    "no-show": "bg-slate-100 text-slate-600 border-slate-200",
  };

  const statusLabels: Record<string, string> = {
    pending: "Chờ",
    confirmed: "Đã duyệt",
    "checked-in": "Chờ khám",
    completed: "Hoàn tất",
    cancelled: "Hủy",
    "no-show": "Vắng",
  };

  const statusBadgeColors: Record<string, string> = {
    pending: "bg-gradient-to-r from-amber-400 to-orange-400",
    confirmed: "bg-gradient-to-r from-emerald-400 to-teal-400",
    "checked-in": "bg-gradient-to-r from-violet-400 to-purple-500",
    completed: "bg-gradient-to-r from-sky-400 to-blue-500",
    cancelled: "bg-gradient-to-r from-red-400 to-rose-500",
    "no-show": "bg-gradient-to-r from-slate-400 to-gray-500",
  };

  const columns = [
    {
      key: "date",
      header: "NGÀY",
      render: (apt: Appointment) => (
        <span className="font-semibold text-slate-800">{apt.date}</span>
      ),
    },
    {
      key: "patientName",
      header: "BỆNH NHÂN",
      render: (apt: Appointment) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
            {apt.patientName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-slate-700 font-medium">{apt.patientName}</p>
            <p className="text-xs text-slate-400">{apt.patient?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "doctorName",
      header: "BÁC SĨ",
      render: (apt: Appointment) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
            BS
          </div>
          <span className="text-slate-700">Dr. {apt.doctorName}</span>
        </div>
      ),
    },
    {
      key: "time",
      header: "GIỜ",
      render: (apt: Appointment) => (
        <span className="text-slate-600 font-semibold bg-slate-50 px-3 py-1 rounded-lg">
          {apt.time}
        </span>
      ),
    },
    {
      key: "service",
      header: "DỊCH VỤ / PHÍ KHÁM",
      render: (apt: Appointment) => (
        <div>
          <p className="text-slate-600">
            {typeof apt.service === "string"
              ? apt.service
              : apt.service?.name}
          </p>
          {(apt.fee || 0) > 0 ? (
            <p className="text-xs text-emerald-600 font-semibold">
              {(apt.fee || 0).toLocaleString("vi-VN")} đ
            </p>
          ) : (
            <p className="text-xs text-slate-400">Chưa có phí</p>
          )}
        </div>
      ),
    },
    {
      key: "isPaid",
      header: "THANH TOÁN",
      render: (apt: Appointment) => (
        apt.isPaid ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đã thanh toán
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Chưa thanh toán
          </span>
        )
      ),
    },
    {
      key: "status",
      header: "TRẠNG THÁI",
      render: (apt: Appointment) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusColors[apt.status] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            apt.status === "pending" ? "bg-amber-500 animate-pulse" :
            apt.status === "confirmed" ? "bg-emerald-500" :
            apt.status === "completed" ? "bg-sky-500" : "bg-red-500"
          }`} />
          {statusLabels[apt.status] || apt.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "THAO TÁC",
      render: (apt: Appointment) => (
        <div className="flex gap-1.5 flex-wrap">
          {/* Check-in button */}
          {apt.status === "confirmed" && (
            <button
              onClick={() => handleCheckIn(apt.id)}
              className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold text-xs transition-all border border-sky-200"
            >
              Tiếp đón
            </button>
          )}
          {/* Complete button */}
          {apt.status === "checked-in" && (
            <button
              onClick={() => handleComplete(apt)}
              disabled={completingId === apt.id}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-200 font-semibold text-xs transition-all disabled:opacity-50"
            >
              {completingId === apt.id ? "..." : "Hoàn thành"}
            </button>
          )}
          {/* Chi tiet */}
          <button
            onClick={() => { setSelected(apt); setShowModal(true); }}
            className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-medium text-xs transition-all border border-sky-200"
          >
            Chi tiết
          </button>
          {/* Xoa */}
          <button
            onClick={() => handleDelete(apt.id)}
            disabled={deleting === apt.id}
            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium text-xs transition-all border border-red-200 disabled:opacity-50"
          >
            {deleting === apt.id ? "..." : "Xóa"}
          </button>
        </div>
      ),
    },
  ];

  const stats = [
    {
      label: "Tổng lịch hẹn",
      value: appointments?.length || 0,
      color: "sky",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Đang chờ",
      value: appointments?.filter((a) => a.status === "pending").length || 0,
      color: "amber",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Xác nhận",
      value: appointments?.filter((a) => a.status === "confirmed" || a.status === "checked-in").length || 0,
      color: "emerald",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Hủy",
      value: appointments?.filter((a) => a.status === "cancelled").length || 0,
      color: "red",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const filterPills = [
    { key: "all", label: "Tất cả", count: appointments?.length || 0 },
    { key: "pending", label: "Chờ duyệt", count: appointments?.filter((a) => a.status === "pending").length || 0 },
    { key: "confirmed", label: "Đã duyệt", count: appointments?.filter((a) => a.status === "confirmed").length || 0 },
    { key: "checked-in", label: "Chờ khám", count: appointments?.filter((a) => a.status === "checked-in").length || 0 },
    { key: "completed", label: "Hoàn tất", count: appointments?.filter((a) => a.status === "completed").length || 0 },
    { key: "cancelled", label: "Hủy", count: appointments?.filter((a) => a.status === "cancelled").length || 0 },
  ];

  return (
    <div className="flex h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <AdminSidebar />
      <div className="flex-1 lg:ml-0 min-w-0 overflow-y-auto">
        {/* Glass Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Quản lý Lịch hẹn</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "table" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <svg className="w-4 h-4 inline-block mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Bảng
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "calendar" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <svg className="w-4 h-4 inline-block mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Lịch
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8 animate-fade-in">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="card card-hover p-5 animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br from-${stat.color}-400 to-${stat.color}-500 flex items-center justify-center text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Pills & Search */}
          <div className="card card-hover p-5 mb-6 animate-scale-in" style={{ animationDelay: "200ms" }}>
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {filterPills.map((pill) => (
                  <button
                    key={pill.key}
                    onClick={() => setFilter(pill.key)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      filter === pill.key
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {pill.label}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${filter === pill.key ? "bg-white/20" : "bg-slate-200"}`}>
                      {pill.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex-1">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Tìm bệnh nhân hoặc bác sĩ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="card p-0 overflow-hidden animate-scale-in" style={{ animationDelay: "300ms" }}>
            {viewMode === "table" ? (
              <div className="overflow-x-auto">
                <Table columns={columns} data={filtered} loading={loading} />
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Chế độ xem lịch</h3>
                <p className="text-slate-500 text-sm">Hiển thị {filtered.length} lịch hẹn</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Chi tiết lịch hẹn">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-lg font-bold shadow-md">
                {selected.patientName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{selected.patientName}</p>
                <p className="text-sm text-slate-500">Bệnh nhân</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Bác sĩ</p>
                <p className="font-semibold text-slate-700">Dr. {selected.doctorName}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Ngày</p>
                <p className="font-semibold text-slate-700">{selected.date}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Giờ</p>
                <p className="font-semibold text-slate-700">{selected.time}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Phí khám</p>
                <p className="font-semibold text-emerald-700">
                  {(selected.fee || 0) > 0 ? `${(selected.fee || 0).toLocaleString("vi-VN")} đ` : "Chưa có"}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl col-span-2">
                <p className="text-xs text-slate-400 mb-1">Dịch vụ</p>
                <p className="font-semibold text-slate-700">
                  {typeof selected.service === "string" ? selected.service : selected.service?.name || "—"}
                </p>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
              <p className="text-xs text-slate-400 mb-2">Trạng thái</p>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${statusBadgeColors[selected.status] || "from-slate-400 to-gray-500"}`}>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {statusLabels[selected.status] || selected.status}
              </span>
            </div>
            {selected.isPaid && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-sm font-semibold text-emerald-700">Đã thanh toán</p>
              </div>
            )}
            {selected.doctorNotes && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs text-amber-600 font-bold mb-1">Ghi chú bác sĩ</p>
                <p className="text-sm text-slate-700">{selected.doctorNotes}</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
              >
                Đóng
              </button>
              {selected.status === "confirmed" && (
                <button
                  onClick={() => {
                    handleCheckIn(selected.id);
                    setShowModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Tiếp đón
                </button>
              )}
              {selected.status === "checked-in" && (
                <button
                  onClick={() => {
                    handleComplete(selected);
                    setShowModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Hoàn thành khám
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Cash Checkout Result Modal */}
      {completeResult?.payment && (
        <CashCheckoutModal
          payment={completeResult.payment}
          appointment={completeResult.appointment}
          onClose={() => { setCompleteResult(null); }}
          onSuccess={() => { setCompleteResult(null); refetch(); }}
        />
      )}
    </div>
  );
}

// ── Cash Checkout Modal ──────────────────────────────────────────────────────
function CashCheckoutModal({
  payment,
  appointment,
  onClose,
  onSuccess
}: {
  payment: any;
  appointment: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [cashReceived, setCashReceived] = useState("");
  const [loading, setLoading] = useState(false);

  const amount = payment.amount || 0;
  const received = Number(cashReceived);
  const change = cashReceived && !isNaN(received) ? Math.max(0, received - amount) : null;
  const isEnough = cashReceived && !isNaN(received) && received >= amount;

  const handleConfirmCash = async () => {
    if (!isEnough) return;
    setLoading(true);
    try {
      await paymentApi.update(payment._id || payment.id, {
        status: "paid",
        notes: `[Thanh toan tien mat] Nhan: ${received.toLocaleString("vi-VN")} đ | Tra lai: ${change?.toLocaleString("vi-VN")} đ`,
      });
      alert(`Thanh toán tiền mặt thành công!\nSố tiền nhận: ${received.toLocaleString("vi-VN")} đ\nTiền thừa trả khách: ${change?.toLocaleString("vi-VN")} đ`);
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || "Thao tác thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Phiếu Thu Tiền Mặt</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 40px; color: #334155; }
        .invoice-card { max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        h2 { color: #0f172a; margin-bottom: 5px; font-weight: 800; }
        .subtitle { color: #64748b; font-size: 14px; margin-bottom: 20px; }
        .divider { border-top: 2px dashed #cbd5e1; margin: 20px 0; }
        .item-row { display: flex; justify-content: space-between; font-size: 14px; margin: 10px 0; }
        .total-row { display: flex; justify-content: space-between; font-weight: 800; font-size: 18px; color: #16a34a; margin-top: 15px; }
        .footer-text { margin-top: 30px; font-size: 12px; color: #94a3b8; }
      </style></head>
      <body>
        <div class="invoice-card">
          <h2>PHÒNG KHÁM NHA KHOA VINAMEC</h2>
          <div class="subtitle">Phiếu Thu Tiền Mặt (Bản In)</div>
          <p style="text-align: left; font-size: 13px;">
            <strong>Mã hóa đơn:</strong> ${payment.invoiceNumber}<br/>
            <strong>Khách hàng:</strong> ${appointment.patientName}<br/>
            <strong>Ngày lập:</strong> ${new Date().toLocaleDateString("vi-VN")}
          </p>
          <div class="divider"></div>
          <div class="item-row">
            <span>Dịch vụ điều trị:</span>
            <strong>${appointment.serviceName || "Khám nha khoa"}</strong>
          </div>
          <div class="item-row">
            <span>Đơn giá:</span>
            <span>${amount.toLocaleString("vi-VN")} đ</span>
          </div>
          <div class="divider"></div>
          <div class="total-row">
            <span>TỔNG TIỀN:</span>
            <span>${amount.toLocaleString("vi-VN")} đ</span>
          </div>
          ${isEnough ? `
            <div class="divider"></div>
            <div class="item-row" style="color: #64748b;">
              <span>Khách đưa:</span>
              <span>${received.toLocaleString("vi-VN")} đ</span>
            </div>
            <div class="item-row" style="color: #64748b;">
              <span>Trả lại:</span>
              <span>${change?.toLocaleString("vi-VN")} đ</span>
            </div>
          ` : ""}
          <p class="footer-text">Cảm ơn quý khách đã tin tưởng dịch vụ của VinaMec!</p>
        </div>
        <script>window.print();<\/script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">Thanh Toán Tiền Mặt</h2>
              <p className="text-emerald-100 text-xs">Mã hóa đơn: {payment.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-100 hover:text-white text-2xl font-light">✕</button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <p className="font-bold text-emerald-800 text-sm">Đã Hoàn Thành Khám Bệnh!</p>
            <p className="text-xs text-emerald-600 mt-1">Hồ sơ bệnh án và hóa đơn đã được ghi nhận.</p>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-center text-white shadow-md">
            <p className="text-xs text-emerald-100 font-bold uppercase tracking-wider">Số tiền cần thu</p>
            <p className="text-3xl font-black mt-1">
              {amount.toLocaleString("vi-VN")}
              <span className="text-lg font-bold ml-1">VNĐ</span>
            </p>
          </div>

          {/* Checkout calculator */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Số tiền khách đưa (VNĐ)</label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="Ví dụ: 200000"
                className="w-full px-4 py-3 border-2 border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl text-lg font-bold text-slate-800 transition"
              />
            </div>

            {isEnough && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center animate-fade-in">
                <span className="text-sm font-semibold text-slate-500">Tiền thừa trả khách</span>
                <span className="text-xl font-black text-emerald-600">{change?.toLocaleString("vi-VN")} đ</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={handlePrintReceipt} className="py-3 rounded-xl font-semibold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition">
              In phiếu thu
            </button>
            <button onClick={onClose} className="py-3 rounded-xl font-semibold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
              Thanh toán sau
            </button>
          </div>

          <button
            onClick={handleConfirmCash}
            disabled={loading || !isEnough}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: isEnough ? "linear-gradient(135deg, #10b981, #059669)" : "#cbd5e1", boxShadow: isEnough ? "0 4px 14px rgba(16,185,129,0.4)" : "none" }}
          >
            {loading ? "Đang xử lý..." : "Xác nhận đã nhận tiền mặt"}
          </button>
        </div>
      </div>
    </div>
  );
}
