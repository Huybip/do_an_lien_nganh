import { useState } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import AppointmentCalendar from "../../components/ui/AppointmentCalendar";
import { appointmentApi, recordApi, paymentApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import type { Appointment } from "../../types";

const statusColor: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-violet-50 text-violet-700",
  "checked-in": "bg-sky-50 text-sky-700 border-sky-200",
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

  // New exam form states
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState({
    diagnosis: "",
    treatment: "",
    prescription: "",
    fee: 0,
    notes: ""
  });

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

  const handleCheckIn = async (id: string) => {
    setActionLoading(true);
    try {
      await appointmentApi.update(id, { status: "checked-in" });
      toast.success("Đã tiếp đón bệnh nhân thành công");
      refetch();
    } catch (error) {
      toast.error("Tiếp đón bệnh nhân thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenExam = (apt: Appointment) => {
    setSelected(apt);
    const serviceFee = typeof apt.service === "object" ? (apt.service as any)?.price : apt.fee;
    setExamForm({
      diagnosis: "",
      treatment: "",
      prescription: "",
      fee: apt.fee || serviceFee || 0,
      notes: ""
    });
    setShowExamModal(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setActionLoading(true);
    try {
      // 1. Create Medical Record
      await recordApi.create({
        patientId: typeof selected.patient === "object" ? (selected.patient as any)?._id : selected.patient,
        diagnosis: examForm.diagnosis,
        treatment: examForm.treatment,
        prescription: examForm.prescription,
        notes: examForm.notes,
        date: selected.date,
        appointmentId: selected.id
      });

      // 2. Complete appointment & generate cash payment
      const res = await appointmentApi.complete(selected.id, {
        notes: examForm.notes || examForm.diagnosis,
        fee: Number(examForm.fee)
      });
      const result = res.data?.data;
      
      // Close exam modal
      setShowExamModal(false);
      
      // 3. Show cash payment checkout invoice modal
      setCompleteResult(result);
      refetch();
      toast.success("Đã hoàn thành khám và tạo hồ sơ bệnh án thành công!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể lưu thông tin khám bệnh.");
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
          {a.status === "checked-in" && "🩺"}
          {a.status === "completed" && "✅"}
          {a.status === "cancelled" && "✕"}
          {a.status === "pending" ? "Chờ xác nhận" : a.status === "confirmed" ? "Đã duyệt" : a.status === "checked-in" ? "Chờ khám" : a.status === "completed" ? "Hoàn thành" : "Đã hủy"}
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
                onClick={() => handleCheckIn(a.id)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all active:scale-95"
                disabled={actionLoading}
              >
                Tiếp đón
              </button>
            )}
          {a.status === "checked-in" && (
            <button
              onClick={() => handleOpenExam(a)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 shadow-sm transition-all active:scale-95 animate-pulse"
              disabled={actionLoading}
            >
              🩺 Khám bệnh
            </button>
          )}
        </div>
      ),
    },
  ];

  const filters = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xác nhận" },
    { key: "confirmed", label: "Đã duyệt" },
    { key: "checked-in", label: "Chờ khám" },
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
                    {selected.status === "checked-in" && "🩺"}
                    {selected.status === "completed" && "✅"}
                    {selected.status === "cancelled" && "✕"}
                    {selected.status === "pending" ? "Chờ xác nhận" : selected.status === "confirmed" ? "Đã duyệt" : selected.status === "checked-in" ? "Chờ khám" : selected.status === "completed" ? "Hoàn thành" : "Đã hủy"}
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
                      onClick={() => {
                        handleCheckIn(selected.id);
                        setShowModal(false);
                      }}
                      className="flex-1 min-w-fit px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95"
                      style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" }}
                      disabled={actionLoading}
                    >
                      Tiếp đón bệnh nhân
                    </button>
                  )}
                {selected.status === "checked-in" && (
                  <button
                    onClick={() => {
                      handleOpenExam(selected);
                      setShowModal(false);
                    }}
                    className="flex-1 min-w-fit px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95 animate-pulse"
                    style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)" }}
                    disabled={actionLoading}
                  >
                    🩺 Khám bệnh &amp; Lập hồ sơ
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
        {/* Exam and Medical Record Modal */}
        <Modal
          open={showExamModal}
          onClose={() => setShowExamModal(false)}
          title="🩺 Khám bệnh &amp; Cập nhật hồ sơ bệnh án"
          size="lg"
        >
          {selected && (
            <form onSubmit={handleSaveExam} className="space-y-4">
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
                <p className="text-sm font-bold text-slate-800">Thông tin ca khám</p>
                <div className="grid grid-cols-2 gap-4 mt-2 text-xs text-slate-500 font-medium">
                  <p>Bệnh nhân: <span className="font-bold text-slate-700">{selected.patientName}</span></p>
                  <p>Dịch vụ: <span className="font-bold text-slate-700">{selected.serviceName}</span></p>
                  <p>Ngày khám: <span className="font-bold text-slate-700">{selected.date}</span></p>
                  <p>Thời gian: <span className="font-bold text-slate-700">{selected.time}</span></p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Chẩn đoán bệnh lý *</label>
                <input
                  type="text"
                  required
                  value={examForm.diagnosis}
                  onChange={(e) => setExamForm({ ...examForm, diagnosis: e.target.value })}
                  placeholder="Ví dụ: Sâu răng khôn số 38, viêm tủy cấp..."
                  className="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-violet-500 focus:outline-none rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phương pháp điều trị *</label>
                <textarea
                  required
                  rows={3}
                  value={examForm.treatment}
                  onChange={(e) => setExamForm({ ...examForm, treatment: e.target.value })}
                  placeholder="Ví dụ: Chỉ định nhổ răng khôn số 38, kê đơn kháng sinh..."
                  className="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-violet-500 focus:outline-none rounded-xl text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Đơn thuốc kê thêm (Tùy chọn)</label>
                <textarea
                  rows={2}
                  value={examForm.prescription}
                  onChange={(e) => setExamForm({ ...examForm, prescription: e.target.value })}
                  placeholder="Ví dụ: 1. Amoxicillin 500mg x 10 viên (ngày 2 lần, mỗi lần 1 viên)..."
                  className="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-violet-500 focus:outline-none rounded-xl text-sm resize-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Chi phí khám &amp; Dịch vụ (VNĐ)</label>
                  <input
                    type="number"
                    value={examForm.fee}
                    onChange={(e) => setExamForm({ ...examForm, fee: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-violet-500 focus:outline-none rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ghi chú lâm sàng</label>
                  <input
                    type="text"
                    value={examForm.notes}
                    onChange={(e) => setExamForm({ ...examForm, notes: e.target.value })}
                    placeholder="Hẹn tái khám sau 7 ngày..."
                    className="w-full px-4 py-2.5 border-2 border-slate-200 focus:border-violet-500 focus:outline-none rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-lg text-white font-bold rounded-xl transition disabled:opacity-50 text-sm"
                >
                  {actionLoading ? "Đang xử lý..." : "✓ Hoàn thành khám &amp; Tạo hóa đơn"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition text-sm"
                >
                  Hủy
                </button>
              </div>
            </form>
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

