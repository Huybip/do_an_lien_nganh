import { useState } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import AppointmentCalendar from "../../components/ui/AppointmentCalendar";
import { appointmentApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import type { Appointment } from "../../types";

const statusColor: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-violet-50 text-violet-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

const approvalColor: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

export default function DoctorAppointments() {
  const {
    data: appointments,
    loading,
    refetch,
  } = useApi<Appointment[]>(() => appointmentApi.getAll());
  const { toast } = useToast();
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [viewType, setViewType] = useState<"calendar" | "table">("calendar");

  // Complete + QR modal state
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [completeResult, setCompleteResult] = useState<any>(null);

  const today = new Date().toISOString().split("T")[0];
  const todayCount = (appointments || []).filter(
    (a) => a.date === today && a.status !== "cancelled",
  ).length;

  const filtered = (appointments || []).filter(
    (a) => filter === "all" || a.status === filter,
  );

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(true);
      await appointmentApi.approve(id);
      toast.success("Appointment approved successfully");
      refetch();
      setShowModal(false);
      setSelected(null);
    } catch (error) {
      toast.error("Failed to approve appointment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (apt: Appointment) => {
    try {
      setCompletingId(apt.id);
      const res = await appointmentApi.complete(apt.id, {});
      const result = res.data?.data;
      setCompleteResult(result);
      setShowModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Khong the hoan thanh lich hen.");
    } finally {
      setCompletingId(null);
    }
  };

  const handleConfirmPayment = async (paymentId: string) => {
    setConfirmingId(paymentId);
    try {
      const { paymentApi: pApi } = await import("../../services/api");
      await pApi.confirmQR(paymentId);
      toast.success("Da xac nhan thanh toan thanh cong!");
      setCompleteResult(null);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Xac nhan that bai.");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      if (!rejectReason.trim()) {
        toast.error("Vui long nhap ly do tu choi.");
        return;
      }
      setActionLoading(true);
      await appointmentApi.reject(id, { reason: rejectReason });
      toast.success("Appointment rejected successfully");
      refetch();
      setShowModal(false);
      setShowRejectModal(false);
      setRejectReason("");
      setSelected(null);
    } catch (error) {
      toast.error("Failed to reject appointment");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: "patientName",
      header: "Bệnh nhân",
      render: (a: Appointment) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
            {a.patientName?.charAt(0)}
          </div>
          <span className="font-medium text-slate-700">{a.patientName}</span>
        </div>
      ),
    },
    {
      key: "service",
      header: "Dịch vụ",
      render: (a: Appointment) => (
        <span className="text-slate-600">
          {typeof a.service === "string"
            ? a.service
            : a.service?.name || "Khám tổng quát"}
        </span>
      ),
    },
    { key: "date", header: "Ngày", render: (a: Appointment) => (
      <span className="text-slate-600">{a.date}</span>
    )},
    {
      key: "shiftType",
      header: "Ca khám",
      render: (a: Appointment) => {
        const type = (a as any).shiftType || "morning";
        const SHIFT_MAP: Record<string, any> = {
          morning:   { label: "Sáng",   bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   icon: "🌅" },
          afternoon: { label: "Chiều",  bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-500",  icon: "🌤️" },
          evening:   { label: "Tối",     bg: "bg-sky-50",     text: "text-sky-700",     dot: "bg-sky-500",     icon: "🌙" },
        };
        const cfg = SHIFT_MAP[type] || SHIFT_MAP.morning;
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.icon} {cfg.label}
          </span>
        );
      },
    },
    { key: "time", header: "Giờ", render: (a: Appointment) => (
      <span className="text-slate-600">{a.time}</span>
    )},
    {
      key: "approvalStatus",
      header: "Phê duyệt",
      render: (a: Appointment) => (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${approvalColor[(a as any).approvalStatus || "pending"]}`}
        >
          {(a as any).approvalStatus === "approved" && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          )}
          {(a as any).approvalStatus === "rejected" && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          )}
          {((a as any).approvalStatus || "pending") === "pending" ? "Đang chờ" : (a as any).approvalStatus === "approved" ? "Đã duyệt" : "Đã từ chối"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (a: Appointment) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColor[a.status]}`}>
          {a.status === "pending" && "⏳"}
          {a.status === "confirmed" && "✓"}
          {a.status === "completed" && "✅"}
          {a.status === "cancelled" && "✕"}
          {a.status === "pending" ? "Chờ xác nhận" : a.status === "confirmed" ? "Đã xác nhận" : a.status === "completed" ? "Hoàn thành" : "Đã hủy"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Hành động",
      render: (a: Appointment) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelected(a);
              setShowModal(true);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
          >
            Chi tiết
          </button>
          {(a as any).approvalStatus === "pending" && (
            <>
              <button
                onClick={() => handleApprove(a.id)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                disabled={actionLoading}
              >
                Duyệt
              </button>
              <button
                onClick={() => {
                  setSelected(a);
                  setShowRejectModal(true);
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                disabled={actionLoading}
              >
                Từ chối
              </button>
            </>
          )}
          {a.status === "confirmed" &&
            (a as any).approvalStatus === "approved" && (
              <button
                onClick={() => handleComplete(a)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                disabled={completingId === a.id}
              >
                {completingId === a.id ? "..." : "Hoan thanh"}
              </button>
            )}
        </div>
      ),
    },
  ];

  const filters = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xác nhận" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "completed", label: "Hoàn thành" },
    { key: "cancelled", label: "Đã hủy" },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <DoctorSidebar />
      <div className="flex-1 lg:ml-0 min-w-0 overflow-y-auto">
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Lịch hẹn</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Quản lý lịch hẹn khám bệnh
            </p>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card card-hover p-5 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{todayCount}</p>
                  <p className="text-sm text-slate-400">Lịch hẹn hôm nay</p>
                </div>
              </div>
            </div>
            <div className="card card-hover p-5 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">
                    {(appointments || []).filter((a) => a.status === "pending").length}
                  </p>
                  <p className="text-sm text-slate-400">Chờ xác nhận</p>
                </div>
              </div>
            </div>
            <div className="card card-hover p-5 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">
                    {(appointments || []).filter((a) => a.status === "completed").length}
                  </p>
                  <p className="text-sm text-slate-400">Hoàn thành</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card card-hover p-5 border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
              <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewType("calendar")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewType === "calendar"
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Lịch
                  </span>
                </button>
                <button
                  onClick={() => setViewType("table")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewType === "table"
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Danh sách
                  </span>
                </button>
              </div>

              {viewType === "table" && (
                <div className="flex flex-wrap gap-2">
                  {filters.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                        filter === f.key
                          ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {f.label}
                      {f.key !== "all" && (
                        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                          filter === f.key ? "bg-white/20" : "bg-slate-200"
                        }`}>
                          {(appointments || []).filter((a) => a.status === f.key).length}
                        </span>
                      )}
                      {f.key === "all" && (
                        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                          filter === f.key ? "bg-white/20" : "bg-slate-200"
                        }`}>
                          {(appointments || []).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {viewType === "calendar" ? (
              <div className="rounded-xl overflow-hidden">
                <AppointmentCalendar
                  appointments={appointments || []}
                  onSelectAppointment={(apt) => {
                    setSelected(apt);
                    setShowModal(true);
                  }}
                  loading={loading}
                />
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden">
                <Table columns={columns} data={filtered} loading={loading} />
              </div>
            )}
          </div>
        </div>

        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title="Chi tiết lịch hẹn"
        >
          {selected && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {selected.patientName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{selected.patientName}</h3>
                    <p className="text-sm text-slate-500">Bệnh nhân</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColor[selected.status]}`}>
                    {selected.status === "pending" && "⏳"}
                    {selected.status === "confirmed" && "✓"}
                    {selected.status === "completed" && "✅"}
                    {selected.status === "cancelled" && "✕"}
                    {selected.status === "pending" ? "Chờ xác nhận" : selected.status === "confirmed" ? "Đã xác nhận" : selected.status === "completed" ? "Hoàn thành" : "Đã hủy"}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${approvalColor[(selected as any).approvalStatus || "pending"]}`}>
                    {(selected as any).approvalStatus === "approved" && "✓"}
                    {(selected as any).approvalStatus === "rejected" && "✕"}
                    {((selected as any).approvalStatus || "pending") === "pending" ? "Đang chờ duyệt" : (selected as any).approvalStatus === "approved" ? "Đã duyệt" : "Đã từ chối"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-medium mb-1">Ngày</p>
                  <p className="text-sm font-semibold text-slate-700">{selected.date}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-medium mb-1">Ca khám</p>
                  <p className="text-sm font-semibold text-slate-700">{selected.time}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-medium mb-1">Bác sĩ</p>
                  <p className="text-sm font-semibold text-slate-700">{selected.doctorName || "—"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-medium mb-1">Dịch vụ</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {typeof selected.service === "string"
                      ? selected.service
                      : selected.service?.name || "Khám tổng quát"}
                  </p>
                </div>
              </div>

              {selected.notes && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-xs text-amber-600 font-medium mb-1">Ghi chú bệnh nhân</p>
                  <p className="text-sm text-slate-700">{selected.notes}</p>
                </div>
              )}

              {selected.doctorNotes && (
                <div className="bg-violet-50 rounded-xl p-4">
                  <p className="text-xs text-violet-600 font-medium mb-1">Ghi chú bác sĩ</p>
                  <p className="text-sm text-slate-700">{selected.doctorNotes}</p>
                </div>
              )}

              {(selected as any).rejectionReason && (
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-xs text-red-600 font-medium mb-1">Lý do từ chối</p>
                  <p className="text-sm text-slate-700">{(selected as any).rejectionReason}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2 flex-wrap">
                {(selected as any).approvalStatus === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(selected.id)}
                      className="flex-1 min-w-fit px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95"
                      style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Đang xử lý..." : "✓ Duyệt lịch hẹn"}
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="flex-1 min-w-fit px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95"
                      style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
                      disabled={actionLoading}
                    >
                      ✕ Từ chối
                    </button>
                  </>
                )}
                {selected.status === "confirmed" &&
                  (selected as any).approvalStatus === "approved" && (
                    <button
                      onClick={() => handleComplete(selected)}
                      className="flex-1 min-w-fit px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95"
                      style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                      disabled={completingId === selected.id}
                    >
                      {completingId === selected.id ? "Dang xu ly..." : "+ Hoan thanh + Tao QR"}
                    </button>
                  )}
              </div>
            </div>
          )}
        </Modal>

        <Modal
          open={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setRejectReason("");
          }}
          title="Từ chối lịch hẹn"
        >
          <div className="space-y-5">
            <div className="bg-red-50 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-slate-700">
                Vui lòng cung cấp lý do từ chối lịch hẹn này. Bệnh nhân sẽ được thông báo.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Lý do từ chối
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleReject(selected?.id || "")}
                className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95"
                style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? "Đang xử lý..." : "Xác nhận từ chối"}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all duration-200 active:scale-95"
                disabled={actionLoading}
              >
                Hủy
              </button>
            </div>
          </div>
        </Modal>
        {/* QR Payment Result Modal */}
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
  qrData: any;
  appointment: any;
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
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Hoan thanh &amp; Tao QR</h2>
              <p className="text-emerald-100 text-xs">Phieu thu da duoc tao</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-100 hover:text-white text-2xl font-light">✕</button>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <p className="font-bold text-emerald-800">Da hoan thanh kham!</p>
            <p className="text-xs text-emerald-600 mt-1">
              Phieu thu <strong>{qrData.invoiceNumber}</strong> da duoc tao tu dong.
            </p>
          </div>
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 text-center border border-sky-200">
            <p className="text-xs text-sky-600 font-bold uppercase tracking-wider">So tien can thanh toan</p>
            <p className="text-3xl font-black text-sky-700 mt-1">
              {Number(qrData.amount).toLocaleString("vi-VN")}
              <span className="text-lg"> đ</span>
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-slate-200 shadow-sm">
            <img src={qrData.qrDataUrl} alt="QR" className="w-56 h-56 mx-auto rounded-xl" />
            <p className="text-xs text-slate-400 mt-2">Quet ma QR bang ung dung ngan hang</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2">
              <p className="text-white text-xs font-bold uppercase tracking-wider">Thong tin tai khoan</p>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { label: "Ngan hang", value: "MB Bank (MBB)" },
                { label: "So tai khoan", value: qrData.accountNo },
                { label: "Ten tai khoan", value: qrData.accountName },
                { label: "Noi dung CK", value: qrData.addInfo },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs font-semibold text-slate-400">{item.label}</span>
                  <span className="text-sm font-bold text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handlePrintQR} className="py-3 rounded-xl font-semibold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition">
              In QR
            </button>
            <button onClick={onClose} className="py-3 rounded-xl font-semibold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
              Dong
            </button>
          </div>
          <button
            onClick={() => onConfirm(paymentId)}
            disabled={confirmingId === paymentId}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }}
          >
            {confirmingId === paymentId ? "Dang xu ly..." : "Da nhan duoc tien — Xac nhan thanh toan"}
          </button>
          <p className="text-center text-xs text-slate-400 -mt-2">
            Sau khi benh nhan chuyen khoan xong, bam nut tren de xac nhan.
          </p>
        </div>
      </div>
    </div>
  );
}

