import { useState, useEffect } from "react";
import PatientSidebar from "../../components/layout/PatientSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import AppointmentCalendar from "../../components/ui/AppointmentCalendar";
import { api, unwrap, serviceApi, doctorApi, appointmentApi, shiftApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import type { Appointment, Service, User } from "../../types";

const SHIFT_CONFIG = {
  morning:   { label: "Ca sáng",  range: "08:00–12:00", bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500",   icon: "🌅" },
  afternoon: { label: "Ca chiều", range: "13:00–17:00", bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  dot: "bg-violet-500",  icon: "🌤️" },
  evening:   { label: "Ca tối",    range: "18:00–21:00", bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     dot: "bg-sky-500",     icon: "🌙" },
};

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  confirmed: { label: "Đã xác nhận", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  pending:   { label: "Chờ xác nhận", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  completed:  { label: "Hoàn thành", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  cancelled:  { label: "Đã hủy", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

const statusCounts = (appointments: Appointment[]) =>
  Object.entries(statusConfig).map(([key, cfg]) => ({
    key, ...cfg,
    count: (appointments || []).filter((a) => a.status === key).length,
  })).filter((s) => s.count > 0);

export default function PatientAppointment() {
  const { data: appointments, loading, refetch } = useApi<Appointment[]>(() => appointmentApi.getMine());
  const { data: services } = useApi<Service[]>(() => serviceApi.getAll());
  const { data: doctors } = useApi<User[]>(() => doctorApi.getAll());
  const [showModal, setShowModal] = useState(false);
  const [viewType, setViewType] = useState<"calendar" | "table">("calendar");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const columns = [
    {
      key: "service",
      header: "Dịch vụ",
      render: (a: Appointment) => (
        <span className="font-bold text-slate-700">
          {(a as any).serviceName || (typeof a.service === "string" ? a.service : a.service?.name) || "Khám tổng quát"}
        </span>
      ),
    },
    {
      key: "doctorName",
      header: "Bác sĩ",
      render: (a: Appointment) => (
        <span className="flex items-center gap-2 text-slate-600 font-medium">
          <span className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #14b8a6)" }}>
            {a.doctorName?.charAt(0).toUpperCase()}
          </span>
          Dr. {a.doctorName}
        </span>
      ),
    },
    { key: "date", header: "Ngày khám", render: (a: Appointment) => <span className="text-slate-500 text-sm font-mono font-semibold">{a.date}</span> },
    {
      key: "shiftType",
      header: "Ca khám",
      render: (a: Appointment) => {
        const type = (a as any).shiftType || "morning";
        const cfg = SHIFT_CONFIG[type as keyof typeof SHIFT_CONFIG] || SHIFT_CONFIG.morning;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.icon} {cfg.label} ({cfg.range})
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (a: Appointment) => {
        const cfg = statusConfig[a.status] || statusConfig.pending;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      render: (a: Appointment) =>
        a.status === "pending" ? (
          <button onClick={async (e) => { e.stopPropagation(); await appointmentApi.cancel(a.id); refetch(); }}
            className="text-xs font-semibold text-red-500 hover:text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-50 transition">
            Hủy lịch
          </button>
        ) : null,
    },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <PatientSidebar />
      <div className="flex-1 lg:ml-0 min-w-0 overflow-y-auto">
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Lịch hẹn của tôi</h1>
            <p className="text-xs text-slate-400 mt-0.5">{(appointments || []).length} lịch hẹn đã đặt</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {statusCounts(appointments || []).map((s) => (
              <span key={s.key} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {s.label}: {s.count}
              </span>
            ))}
            <button onClick={() => setShowModal(true)} className="btn-emerald">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M12 4v16m8-8H4"/>
              </svg>
              Đặt lịch khám
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6 lg:p-8">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="flex gap-1 p-1 rounded-xl bg-white border border-slate-200 shadow-sm">
              {[
                { key: "calendar" as const, label: "Lịch trực quan", icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>
                ) },
                { key: "table" as const, label: "Danh sách", icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
                ) },
              ].map((v) => (
                <button key={v.key} onClick={() => setViewType(v.key)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 text-slate-500 hover:text-slate-700"
                  style={viewType === v.key ? { background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", color: "white" } : {}}>
                  {v.icon}{v.label}
                </button>
              ))}
            </div>
          </div>

          {viewType === "calendar" ? (
            <div className="animate-fade-in">
              <AppointmentCalendar
                appointments={appointments || []}
                onSelectAppointment={(apt) => setSelectedAppointment(apt)}
                loading={loading}
              />
            </div>
          ) : (
            <div className="card overflow-hidden animate-fade-in">
              <Table columns={columns} data={appointments || []} loading={loading} />
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedAppointment && (
          <Modal open={!!selectedAppointment} onClose={() => setSelectedAppointment(null)} title="Chi tiết lịch khám">
            <div className="space-y-4">
              {[
                ["Bác sĩ phụ trách", `Dr. ${selectedAppointment.doctorName}`],
                ["Dịch vụ đã chọn", selectedAppointment.serviceName || (typeof selectedAppointment.service === "string" ? selectedAppointment.service : selectedAppointment.service?.name) || "Khám tổng quát"],
                ["Ngày khám", selectedAppointment.date],
                [
                  "Khung giờ khám",
                  (() => {
                    const type = (selectedAppointment as any).shiftType || "morning";
                    const cfg = SHIFT_CONFIG[type as keyof typeof SHIFT_CONFIG] || SHIFT_CONFIG.morning;
                    return `${cfg.icon} ${cfg.label} (${cfg.range})`;
                  })(),
                ],
                ["Phí dịch vụ", `${Number(selectedAppointment.fee || 0).toLocaleString("vi-VN")} ₫`],
                ["Ghi chú khám", selectedAppointment.notes || "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-32 flex-shrink-0 pt-1">{k}</span>
                  <span className="text-sm font-semibold text-slate-700">{v}</span>
                </div>
              ))}

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trạng thái đặt lịch</p>
                {(() => {
                  const cfg = statusConfig[selectedAppointment.status] || statusConfig.pending;
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  );
                })()}
              </div>

              <div className="flex gap-3 pt-3">
                {selectedAppointment.status === "pending" && (
                  <button onClick={async () => {
                    await appointmentApi.cancel(selectedAppointment.id);
                    refetch();
                    setSelectedAppointment(null);
                  }}
                    className="flex items-center gap-2 flex-1 justify-center px-4 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-lg"
                    style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 12px rgba(239,68,68,0.25)" }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    Hủy lịch hẹn
                  </button>
                )}
                <button onClick={() => setSelectedAppointment(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition">
                  Đóng
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Dynamic Booking Flow Modal */}
        <Modal open={showModal} onClose={() => setShowModal(false)} title="Đăng ký lịch khám theo ca trực bác sĩ">
          <BookingFlow services={services || []} onClose={() => { setShowModal(false); refetch(); }} />
        </Modal>
      </div>
    </div>
  );
}

// ── Booking Flow Component with Shift card selector & service compiler ──────
function BookingFlow({ services, onClose }: { services: Service[]; onClose: () => void }) {
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any | null>(null);

  // Filters for shift browser
  const [searchDoc, setSearchDoc] = useState("");
  const [searchSpec, setSearchSpec] = useState("");

  // Step 2 Booking details
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUpcomingShifts = async () => {
      setShiftsLoading(true);
      try {
        const res = await shiftApi.getUpcoming();
        setUpcomingShifts(unwrap(res) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setShiftsLoading(false);
      }
    };
    fetchUpcomingShifts();
  }, []);

  // Filter logic
  const filteredShifts = upcomingShifts.filter((s: any) => {
    const nameMatch = s.doctorName?.toLowerCase().includes(searchDoc.toLowerCase()) || 
                      s.doctor?.name?.toLowerCase().includes(searchDoc.toLowerCase());
    const specMatch = !searchSpec || 
                      s.doctor?.specialization?.toLowerCase() === searchSpec.toLowerCase();
    return nameMatch && specMatch;
  });

  // Extract unique specializations for filter dropdown
  const specializations = Array.from(new Set(
    upcomingShifts.map((s: any) => s.doctor?.specialization).filter(Boolean)
  ));

  const handleServiceToggle = (id: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSelectShift = (shift: any) => {
    setSelectedShift(shift);
    setError("");
    setSelectedServiceIds([]);
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServiceIds.length === 0) {
      setError("Vui lòng chọn ít nhất một dịch vụ khám bệnh.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await appointmentApi.create({
        doctorId: selectedShift.doctorId || selectedShift.doctor?._id || selectedShift.doctor,
        date: selectedShift.date,
        shiftType: selectedShift.shiftType,
        serviceIds: selectedServiceIds,
        notes: notes,
      });
      onClose();
    } catch (err: any) {
      console.error("[BOOKING] error:", err);
      const msg = err.response?.data?.message || err.message || "Đăng ký khám thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const totalFee = services
    .filter((s) => selectedServiceIds.includes(s._id))
    .reduce((sum, s) => sum + s.price, 0);

  const totalDuration = services
    .filter((s) => selectedServiceIds.includes(s._id))
    .reduce((sum, s) => sum + s.duration, 0);

  // SCREEN 1: BROWSE UPCOMING SHIFTS
  if (!selectedShift) {
    return (
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div>
          <p className="text-sm text-slate-500">Lựa chọn bác sĩ và thời gian trực phù hợp để đặt lịch khám nhanh chóng.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex-1">
            <input
              type="text"
              className="input text-sm py-2"
              placeholder="Tìm tên bác sĩ..."
              value={searchDoc}
              onChange={(e) => setSearchDoc(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <select
              className="input text-sm py-2"
              value={searchSpec}
              onChange={(e) => setSearchSpec(e.target.value)}
            >
              <option value="">Tất cả chuyên khoa</option>
              {specializations.map((spec: any) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Shift list grid */}
        {shiftsLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 text-center">
            <p className="font-semibold text-amber-800 text-sm">Không tìm thấy ca trực nào phù hợp.</p>
            <p className="text-xs text-amber-500 mt-1">Vui lòng thay đổi từ khóa tìm kiếm hoặc quay lại sau.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredShifts.map((s: any) => {
              const cfg = SHIFT_CONFIG[s.shiftType as keyof typeof SHIFT_CONFIG] || SHIFT_CONFIG.morning;
              const isFull = s.remaining <= 0 || s.isFull;

              return (
                <div
                  key={s.id || s._id}
                  className={`card p-4 border border-slate-100 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 ${
                    isFull ? "opacity-75" : ""
                  }`}
                >
                  <div className="space-y-3">
                    {/* Doctor Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow">
                        {(s.doctorName || s.doctor?.name || "BS").charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Dr. {s.doctorName || s.doctor?.name}</h4>
                        <p className="text-[11px] text-slate-400 font-semibold uppercase">{s.doctor?.specialization || "Nha khoa Tổng quát"}</p>
                      </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Shift specifics */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold bg-slate-50 px-2 py-1 rounded-lg">
                        <span>📅</span>
                        <span>{s.date}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${cfg.bg} ${cfg.text}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium">Khung giờ trực: <span className="font-mono font-bold text-slate-700">{s.startTime} – {s.endTime}</span></p>
                  </div>

                  {/* Booking state */}
                  <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-50">
                    <span className={`text-xs font-bold ${isFull ? "text-red-500" : "text-emerald-600"}`}>
                      {isFull ? "Đã đầy chỗ" : `Còn ${s.remaining}/${s.maxPatients} chỗ`}
                    </span>
                    <button
                      onClick={() => handleSelectShift(s)}
                      disabled={isFull}
                      className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all ${
                        isFull
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 hover:shadow"
                      }`}
                    >
                      Đăng ký khám
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // SCREEN 2: SELECT SERVICES & SUBMIT
  const selectedCfg = SHIFT_CONFIG[selectedShift.shiftType as keyof typeof SHIFT_CONFIG] || SHIFT_CONFIG.morning;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-semibold">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          {error}
        </div>
      )}

      {/* Selected Shift Information Banner */}
      <div className="bg-gradient-to-r from-sky-50/50 to-blue-50/50 border border-sky-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-base font-black shadow-md">
            {(selectedShift.doctorName || selectedShift.doctor?.name || "BS").charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Dr. {selectedShift.doctorName || selectedShift.doctor?.name}</h4>
            <p className="text-xs text-slate-400 font-semibold uppercase">{selectedShift.doctor?.specialization || "Nha khoa Tổng quát"}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-bold bg-white text-slate-600 px-2.5 py-1 rounded-lg border border-slate-100">
            {selectedShift.date}
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase ${selectedCfg.bg} ${selectedCfg.text}`}>
            {selectedCfg.icon} {selectedCfg.label} ({selectedShift.startTime}–{selectedShift.endTime})
          </span>
        </div>
      </div>

      {/* Multiple Services Choice (Checkboxes) */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Chọn dịch vụ khám (Được chọn nhiều)</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
          {services.map((s) => {
            const isChecked = selectedServiceIds.includes(s._id);
            return (
              <label
                key={s._id}
                className={`relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  isChecked
                    ? "border-emerald-500 bg-emerald-50/30"
                    : "border-slate-100 hover:border-slate-200 bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleServiceToggle(s._id)}
                  className="w-4.5 h-4.5 accent-emerald-500 rounded border-slate-300"
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700">{s.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Thời gian: {s.duration || 30} phút</p>
                </div>
                <span className={`text-xs font-extrabold ${isChecked ? "text-emerald-700" : "text-slate-600"}`}>
                  {Number(s.price).toLocaleString("vi-VN")} ₫
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Notes Textarea */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ghi chú triệu chứng / yêu cầu</label>
        <textarea
          className="input min-h-[70px] text-sm"
          placeholder="Ví dụ: Đau răng hàm dưới bên trái, muốn nhổ răng khôn..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Fee & Duration Summary */}
      {selectedServiceIds.length > 0 && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center flex-wrap gap-2">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ước tính thời lượng</p>
            <p className="text-sm font-semibold text-slate-700">⏱️ {totalDuration} phút</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng phí thanh toán</p>
            <p className="text-base font-extrabold text-emerald-600">{totalFee.toLocaleString("vi-VN")} ₫</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => setSelectedShift(null)}
          className="px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition"
        >
          Quay lại
        </button>

        <button
          type="submit"
          disabled={submitting || selectedServiceIds.length === 0}
          className="flex-1 px-5 py-3 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #0ea5e9, #14b8a6)" }}
        >
          {submitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang đăng ký...
            </div>
          ) : (
            "Xác nhận đăng ký khám"
          )}
        </button>
      </div>
    </form>
  );
}
