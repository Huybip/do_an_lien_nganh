import { useState } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import { appointmentApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import type { Appointment } from "../../types";

interface QRData {
  invoiceNumber: string;
  amount: number;
  qrDataUrl: string;
  qrString: string;
  addInfo: string;
  paymentId: string;
  bankId: string;
  accountNo: string;
  accountName: string;
}

interface CompleteResult {
  appointment: Appointment;
  payment: any;
  qrData: QRData;
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

  const handleComplete = async (apt: Appointment) => {
    if (!confirm(`Hoàn thành lịch hẹn của "${apt.patientName}"?\n\nHệ thống sẽ tự động tạo phiếu thu và mã QR thanh toán.`)) return;
    setCompletingId(apt.id);
    try {
      const res = await appointmentApi.complete(apt.id, {});
      const result = res.data?.data;
      setCompleteResult(result);
      alert(`Hoan thanh lich hen "${apt.patientName}" thanh cong!\nMa QR thanh toan da duoc tao.`);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể hoàn thành lịch hẹn.");
    } finally {
      setCompletingId(null);
    }
  };

  const handleConfirmPayment = async (paymentId: string) => {
    setConfirmingId(paymentId);
    try {
      const { paymentApi: pApi } = await import("../../services/api");
      await pApi.confirmQR(paymentId);
      alert("Đã xác nhận thanh toán thành công!");
      setCompleteResult(null);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || "Xác nhận thất bại.");
    } finally {
      setConfirmingId(null);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-sky-50 text-sky-700 border-sky-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    "no-show": "bg-slate-100 text-slate-600 border-slate-200",
  };

  const statusLabels: Record<string, string> = {
    pending: "Chờ",
    confirmed: "Xác nhận",
    completed: "Hoàn tất",
    cancelled: "Hủy",
    "no-show": "Vắng",
  };

  const statusBadgeColors: Record<string, string> = {
    pending: "bg-gradient-to-r from-amber-400 to-orange-400",
    confirmed: "bg-gradient-to-r from-emerald-400 to-teal-400",
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
          {/* Hoan thanh button */}
          {apt.status !== "completed" && apt.status !== "cancelled" && (
            <button
              onClick={() => handleComplete(apt)}
              disabled={completingId === apt.id}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-200 font-medium text-xs transition-all disabled:opacity-50"
              title="Hoan thanh kham va tao QR thanh toan"
            >
              {completingId === apt.id ? "..." : (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Hoàn thành
                </span>
              )}
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
      value: appointments?.filter((a) => a.status === "confirmed").length || 0,
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
    { key: "pending", label: "Chờ", count: appointments?.filter((a) => a.status === "pending").length || 0 },
    { key: "confirmed", label: "Xác nhận", count: appointments?.filter((a) => a.status === "confirmed").length || 0 },
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
              {selected.status !== "completed" && selected.status !== "cancelled" && (
                <button
                  onClick={() => {
                    handleComplete(selected);
                    setShowModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all"
                >
                  Hoàn thành + QR
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* QR Payment Modal */}
      {completeResult?.qrData && (
        <QRPaymentResultModal
          qrData={completeResult.qrData}
          appointment={completeResult.appointment}
          paymentId={completeResult.qrData.paymentId}
          onConfirm={handleConfirmPayment}
          confirmingId={confirmingId}
          onClose={() => { setCompleteResult(null); }}
        />
      )}
    </div>
  );
}

// ── QR Payment Result Modal ──────────────────────────────────────────────────
function QRPaymentResultModal({
  qrData,
  appointment,
  paymentId,
  onConfirm,
  confirmingId,
  onClose,
}: {
  qrData: QRData;
  appointment: Appointment;
  paymentId: string;
  onConfirm: (id: string) => void;
  confirmingId: string | null;
  onClose: () => void;
}) {
  const handlePrintQR = () => {
    if (!qrData.qrDataUrl) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>In QR Thanh Toan</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
        h2 { color: #0c4a6e; } p { font-size: 14px; color: #555; }
        img { border: 4px solid #0ea5e9; border-radius: 12px; }
        .info { margin-top: 16px; font-weight: bold; color: #059669; }
      </style></head>
      <body>
        <h2>Phong Kham Nha Khoa VinaMec</h2>
        <p>Ma hoa don: ${qrData.invoiceNumber}</p>
        <p>Benh nhan: ${appointment.patientName}</p>
        <img src="${qrData.qrDataUrl}" width="300" />
        <p class="info">So tien: ${Number(qrData.amount).toLocaleString("vi-VN")} VND</p>
        <p>STK: ${qrData.accountNo} - ${qrData.accountName}</p>
        <p>Noi dung: ${qrData.addInfo}</p>
        <script>window.print();<\/script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header - MBBank style */}
        <div
          className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-100"
          style={{ background: "linear-gradient(135deg, #003A70 0%, #0055A4 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center">
              <span className="text-white font-black text-base">MB</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Thanh Toan QR</h2>
              <p className="text-blue-200 text-xs">Phieu thu da duoc tao</p>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white text-2xl font-light">X</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Success message */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-bold text-emerald-800">Đã hoàn thành khám!</p>
            <p className="text-xs text-emerald-600 mt-1">
              Phiếu thu <strong>{qrData.invoiceNumber}</strong> đã được tạo tự động.
            </p>
          </div>

          {/* Patient info */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
              {appointment.patientName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{appointment.patientName}</p>
              <p className="text-xs text-slate-400">Dịch vụ: {appointment.serviceName}</p>
            </div>
          </div>

          {/* Amount - MBBank style */}
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: "linear-gradient(135deg, #003A70 0%, #0055A4 100%)" }}
          >
            <p className="text-blue-200 text-xs font-bold uppercase tracking-wider">So tien thanh toan</p>
            <p className="text-3xl font-black text-white mt-1">
              {Number(qrData.amount).toLocaleString("vi-VN")}
              <span className="text-lg font-bold ml-1">VND</span>
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-xl p-4 text-center border border-slate-200 shadow-sm">
            <img
              src={qrData.qrDataUrl}
              alt="QR Code"
              className="w-56 h-56 mx-auto rounded-xl"
            />
            <p className="text-xs text-slate-400 mt-2">Quet ma QR bang ung dung ngan hang</p>
          </div>

          {/* Bank details - MBBank style */}
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
                { label: "So tai khoan", value: qrData.accountNo },
                { label: "Ten tai khoan", value: qrData.accountName },
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
              onClick={onClose}
              className="py-3 rounded-xl font-semibold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
            >
              Dong
            </button>
          </div>

          {/* Confirm payment button */}
          <button
            onClick={() => onConfirm(paymentId)}
            disabled={confirmingId === paymentId}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }}
          >
            {confirmingId === paymentId ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Dang xu ly...
              </span>
            ) : "Da nhan duoc tien - Xac nhan thanh toan"}
          </button>
          <p className="text-center text-xs text-slate-400 -mt-2">
            Sau khi benh nhan chuyen khoan xong, bam nut tren de xac nhan.
          </p>
        </div>
      </div>
    </div>
  );
}
