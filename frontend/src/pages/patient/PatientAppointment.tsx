import { useState, useEffect } from "react";
import PatientSidebar from "../../components/layout/PatientSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import AppointmentCalendar from "../../components/ui/AppointmentCalendar";
import { api, unwrap, serviceApi, doctorApi, appointmentApi, shiftApi, dayOffApi } from "../../services/api";
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
        <Modal open={showModal} onClose={() => setShowModal(false)} title="Đăng ký lịch khám theo ca trực bác sĩ" size="xl">
          <BookingFlow services={services || []} onClose={() => { setShowModal(false); refetch(); }} />
        </Modal>
      </div>
    </div>
  );
}

// ── Booking Flow Component with Splitscreen Monthly Calendar ─────────────────
function BookingFlow({ services, onClose }: { services: Service[]; onClose: () => void }) {
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [daysOff, setDaysOff] = useState<any[]>([]);

  // Form selections
  const [form, setForm] = useState({
    doctorId: "",
    date: "",
    shiftType: "",
    notes: "",
  });
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Monthly Calendar Navigation & Filter states
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 4, 1)); // May 2026
  const [filterMorning, setFilterMorning] = useState(true);
  const [filterAfternoon, setFilterAfternoon] = useState(true);
  const [filterEvening, setFilterEvening] = useState(true);

  useEffect(() => {
    const fetchUpcomingShifts = async () => {
      setShiftsLoading(true);
      try {
        const [shRes, doRes] = await Promise.all([
          shiftApi.getUpcoming(),
          dayOffApi.getAll(),
        ]);
        setUpcomingShifts(unwrap(shRes) || []);
        setDaysOff(unwrap<any[]>(doRes?.data ?? doRes) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setShiftsLoading(false);
      }
    };
    fetchUpcomingShifts();
  }, []);

  const handleServiceToggle = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectShift = (s: any) => {
    const docId = s.doctorId || s.doctor?._id || s.doctor;
    setForm((prev) => ({
      ...prev,
      doctorId: docId,
      date: s.date,
      shiftType: s.shiftType,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.doctorId) { setError("Vui lòng chọn bác sĩ từ lịch trực."); return; }
    if (!form.date) { setError("Vui lòng chọn ngày khám từ lịch trực."); return; }
    if (!form.shiftType) { setError("Vui lòng chọn ca khám từ lịch trực."); return; }
    if (selectedServiceIds.length === 0) {
      setError("Vui lòng chọn ít nhất một dịch vụ khám bệnh.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await appointmentApi.create({
        doctorId: form.doctorId,
        date: form.date,
        shiftType: form.shiftType,
        serviceIds: selectedServiceIds,
        notes: form.notes,
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

  // Month navigation
  const prevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  // Generate 42 calendar grid cells (Sunday starts)
  const calendarCells = (() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0-6
    const calendarStart = new Date(firstDay);
    calendarStart.setDate(firstDay.getDate() - startDayOfWeek);

    const cells = [];
    for (let i = 0; i < 42; i++) {
      cells.push(new Date(calendarStart));
      calendarStart.setDate(calendarStart.getDate() + 1);
    }
    return cells;
  })();

  const selectedShiftDetails = upcomingShifts.find(
    (s) =>
      (s.doctorId === form.doctorId || s.doctor?._id === form.doctorId) &&
      s.date === form.date &&
      s.shiftType === form.shiftType
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-h-[80vh] overflow-y-auto pr-1">
      {/* LEFT COLUMN: BOOKING FORM */}
      <form onSubmit={handleSubmit} className="w-full lg:w-[38%] space-y-4 pr-1 border-r border-slate-100 flex flex-col justify-between">
        <div className="space-y-4">
          <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
            Thông tin đặt lịch
          </h4>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-semibold animate-shake">
              {error}
            </div>
          )}

          {/* Date & Shift */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Ngày khám *</label>
              <input
                type="text"
                className="input bg-slate-50 text-slate-600 font-mono font-bold cursor-not-allowed"
                value={form.date || "nn/mm/yyyy"}
                readOnly
                placeholder="nn/mm/yyyy"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Ca khám *</label>
              <input
                type="text"
                className="input bg-slate-50 text-slate-600 font-semibold cursor-not-allowed"
                value={
                  form.shiftType === "morning"
                    ? "Ca sáng"
                    : form.shiftType === "afternoon"
                    ? "Ca chiều"
                    : form.shiftType === "evening"
                    ? "Ca tối"
                    : "— Chọn ca —"
                }
                readOnly
                placeholder="— Chọn ca —"
              />
            </div>
          </div>

          {/* Chosen Doctor Card / Select on calendar alert */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Bác sĩ *</label>
            {selectedShiftDetails ? (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow animate-scale-in">
                  {selectedShiftDetails.doctorName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-800">Dr. {selectedShiftDetails.doctorName}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">{selectedShiftDetails.doctor?.specialization || "Nha khoa tổng quát"}</p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-amber-700 text-xs font-semibold flex items-center gap-2">
                <span>👉</span>
                <span>Chọn ca trực trên lịch bên phải</span>
              </div>
            )}
          </div>

          {/* Multiple Services Choice checkboxes */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block font-bold">Dịch vụ (Được chọn nhiều) *</label>
            <div className="grid grid-cols-1 gap-1.5 bg-slate-50 p-3 rounded-xl border max-h-[140px] overflow-y-auto">
              {services.map((s) => {
                const isChecked = selectedServiceIds.includes(s._id);
                return (
                  <label key={s._id} className={`flex items-center gap-2 p-1.5 rounded-lg border cursor-pointer text-xs font-bold transition select-none ${isChecked ? "bg-emerald-50/50 border-emerald-300 text-emerald-800" : "bg-white border-slate-100 text-slate-700"}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleServiceToggle(s._id)}
                      className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                    />
                    <span className="flex-1 truncate text-[11px]">{s.name}</span>
                    <span className="text-emerald-600 shrink-0 text-[11px]">{Number(s.price).toLocaleString("vi-VN")} ₫</span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-1.5 text-right font-bold">
              Tổng cộng: <span className="text-emerald-600 font-extrabold text-sm">{services.filter(s => selectedServiceIds.includes(s._id)).reduce((sum, s) => sum + s.price, 0).toLocaleString("vi-VN")} ₫</span>
            </p>
          </div>

          {/* Notes Textarea */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Triệu chứng / Ghi chú</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Mô tả triệu chứng..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-4 border-t border-slate-50">
          <button
            type="submit"
            disabled={submitting || selectedServiceIds.length === 0}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-sm hover:shadow-lg disabled:opacity-50"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang đặt...
              </div>
            ) : (
              "Xác nhận đặt lịch"
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition"
          >
            Hủy
          </button>
        </div>
      </form>

      {/* RIGHT COLUMN: MONTHLY SHIFTS CALENDAR */}
      <div className="w-full lg:w-[62%] flex flex-col justify-between space-y-4">
        {/* Month picker and filter chips header */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
          {/* Month Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition"
            >
              ‹
            </button>
            <span className="font-bold text-slate-800 text-sm px-2">
              Tháng {calendarDate.getMonth() + 1} {calendarDate.getFullYear()}
            </span>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition"
            >
              ›
            </button>
          </div>

          {/* Shift filter pills */}
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setFilterMorning(!filterMorning)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                filterMorning ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-slate-50 text-slate-400 border-slate-100"
              }`}
            >
              🌅 Ca Sáng
            </button>
            <button
              type="button"
              onClick={() => setFilterAfternoon(!filterAfternoon)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                filterAfternoon ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-400 border-slate-100"
              }`}
            >
              🌤️ Ca Chiều
            </button>
            <button
              type="button"
              onClick={() => setFilterEvening(!filterEvening)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                filterEvening ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-slate-50 text-slate-400 border-slate-100"
              }`}
            >
              🌙 Ca Tối
            </button>
          </div>
        </div>

        {/* Monthly Calendar Grid */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-inner flex-1">
          {/* Weekdays header */}
          <div className="grid grid-cols-7 bg-slate-50 text-center py-2 border-b border-slate-200">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((w) => (
              <span key={w} className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                {w}
              </span>
            ))}
          </div>

          {/* Days grid */}
          {shiftsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-slate-100">
              {calendarCells.map((d, index) => {
                const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                const dayShifts = upcomingShifts.filter((s: any) => s.date === dayStr);
                const visibleShifts = dayShifts.filter((s: any) => {
                  if (s.shiftType === "morning") return filterMorning;
                  if (s.shiftType === "afternoon") return filterAfternoon;
                  if (s.shiftType === "evening") return filterEvening;
                  return true;
                });

                const isCurrentMonth = d.getMonth() === calendarDate.getMonth();
                const clinicDayOff = (daysOff || []).find((dOff: any) => dOff.date === dayStr && !dOff.doctor);

                return (
                  <div
                    key={index}
                    className={`min-h-[72px] p-1.5 flex flex-col justify-between ${
                      isCurrentMonth ? (clinicDayOff ? "bg-rose-50/50" : "bg-white") : "bg-slate-50/50"
                    }`}
                  >
                    {/* Day number */}
                    <div className="text-right">
                      <span className={`text-[10px] font-mono font-extrabold ${isCurrentMonth ? "text-slate-700" : "text-slate-300"}`}>
                        {d.getDate()}
                      </span>
                    </div>

                    {/* Shifts list / Holiday banner */}
                    <div className="space-y-1 mt-1">
                      {clinicDayOff ? (
                        <div className="px-1 py-1 rounded text-[7.5px] font-black text-rose-700 bg-rose-100/50 border border-rose-200/30 text-center truncate select-none" title={`Lịch nghỉ phòng khám: ${clinicDayOff.description}`}>
                          🎉 Nghỉ: {clinicDayOff.description}
                        </div>
                      ) : (
                        visibleShifts.map((s: any) => {
                          const doctorShort = s.doctorName ? s.doctorName.trim().split(" ").pop() : "BS";
                          const doctorDayOff = (daysOff || []).find((dOff: any) => dOff.date === dayStr && dOff.doctor && (dOff.doctor === s.doctorId || dOff.doctor._id === s.doctorId || dOff.doctor === s.doctor?._id || dOff.doctor?._id === s.doctor?._id));
                          const isDoctorOff = !!doctorDayOff;
                          const isFull = s.remaining <= 0 || s.isFull;
                          const isSelected =
                            form.doctorId === (s.doctorId || s.doctor?._id || s.doctor) &&
                            form.date === s.date &&
                            form.shiftType === s.shiftType;

                          // Color config depending on shiftType or if doctor is off
                          let colorClass = "";
                          if (isDoctorOff) {
                            colorClass = "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed line-through opacity-70";
                          } else if (isFull) {
                            colorClass = "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through";
                          } else if (isSelected) {
                            colorClass = "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300 shadow";
                          } else {
                            if (s.shiftType === "morning") {
                              colorClass = "bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100 hover:border-sky-200";
                            } else if (s.shiftType === "afternoon") {
                              colorClass = "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 hover:border-amber-200";
                            } else {
                              colorClass = "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100 hover:border-purple-200";
                            }
                          }

                          return (
                            <div
                              key={s.id || s._id}
                              onClick={() => !isFull && !isDoctorOff && handleSelectShift(s)}
                              className={`px-1 py-0.5 rounded text-[8px] font-black border flex items-center justify-between cursor-pointer select-none transition ${colorClass}`}
                              title={isDoctorOff ? `Dr. ${s.doctorName} nghỉ phép: ${doctorDayOff.description}` : `Dr. ${s.doctorName} | Ca ${s.shiftType === "morning" ? "Sáng" : s.shiftType === "afternoon" ? "Chiều" : "Tối"} | Còn ${s.remaining}/${s.maxPatients} chỗ`}
                            >
                              <span className="truncate">{doctorShort}</span>
                              <span className="font-semibold text-[7px] shrink-0 ml-0.5">
                                {isDoctorOff ? "OFF" : `${s.booked}/${s.maxPatients}`}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10px]">
          <div className="flex gap-3">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              Có thể đặt
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Đang chọn
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              Đã đầy
            </span>
          </div>
          <span className="text-slate-400 font-semibold text-right">
            Nhấp vào ca trực để điền form đặt lịch nhanh chóng
          </span>
        </div>
      </div>
    </div>
  );
}
