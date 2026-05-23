import { useState } from "react";
import PatientSidebar from "../../components/layout/PatientSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import AppointmentCalendar from "../../components/ui/AppointmentCalendar";
import { api, unwrap, serviceApi, doctorApi, appointmentApi } from "../../services/api";
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
        <span className="font-bold text-slate-700">{typeof a.service === "string" ? a.service : a.service?.name}</span>
      ),
    },
    {
      key: "doctorName",
      header: "Bác sĩ",
      render: (a: Appointment) => (
        <span className="flex items-center gap-2 text-slate-600">
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #14b8a6)" }}>
            {a.doctorName?.charAt(0).toUpperCase()}
          </span>
          Dr. {a.doctorName}
        </span>
      ),
    },
    { key: "date", header: "Ngày", render: (a: Appointment) => <span className="text-slate-500 text-sm font-mono">{a.date}</span> },
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
            Hủy
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
            <h1 className="text-xl font-bold text-slate-800">Lịch hẹn</h1>
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
                { key: "calendar" as const, label: "Lịch", icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>
                ) },
                { key: "table" as const, label: "Danh sách", icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
                ) },
              ].map((v) => (
                <button key={v.key} onClick={() => setViewType(v.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    viewType === v.key ? "text-white shadow-md" : "text-slate-500 hover:text-slate-700"
                  }`}
                  style={viewType === v.key ? { background: "linear-gradient(135deg, #0ea5e9, #14b8a6)" } : {}}>
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
                ["Bác sĩ", selectedAppointment.doctorName],
                ["Dịch vụ", typeof selectedAppointment.service === "string" ? selectedAppointment.service : selectedAppointment.service?.name || "Khám tổng quát"],
                ["Ngày", selectedAppointment.date],
                [
                  "Ca khám",
                  (() => {
                    const type = (selectedAppointment as any).shiftType || "morning";
                    const cfg = SHIFT_CONFIG[type as keyof typeof SHIFT_CONFIG] || SHIFT_CONFIG.morning;
                    return `${cfg.icon} ${cfg.label} (${cfg.range})`;
                  })(),
                ],
                ["Ghi chú", selectedAppointment.notes || "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24 flex-shrink-0 pt-1">{k}</span>
                  <span className="text-sm font-semibold text-slate-700">{v}</span>
                </div>
              ))}

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trạng thái</p>
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
                    Hủy lịch
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

        {/* Booking Modal */}
        <Modal open={showModal} onClose={() => setShowModal(false)} title="Đặt lịch khám theo ca trực">
          <BookingForm services={services || []} doctors={doctors || []} onClose={() => { setShowModal(false); refetch(); }} />
        </Modal>
      </div>
    </div>
  );
}

// ── Booking Form with Shift Selection ────────────────────────────────────────
function BookingForm({ services, doctors, onClose }: { services: Service[]; doctors: User[]; onClose: () => void }) {
  const [form, setForm] = useState({ serviceId: "", doctorId: "", date: "" });
  const [shiftType, setShiftType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [shifts, setShifts] = useState<any[]>([]);

  const fetchShifts = async (doctorId: string, date: string) => {
    if (!doctorId || !date) { setShifts([]); return; }
    setSlotsLoading(true);
    try {
      // Call API directly + unwrap to get clean payload: { doctorId, date, shifts, availableCount }
      const payload = unwrap<{ shifts: any[] }>(await api.get("/appointments/slots", { params: { doctorId, date } }));
      setShifts(Array.isArray(payload?.shifts) ? payload.shifts : []);
    } catch {
      setShifts([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDoctorChange = (id: string) => {
    setForm({ ...form, doctorId: id, date: "" });
    setShiftType("");
    setShifts([]);
  };

  const handleDateChange = (date: string) => {
    const newForm = { ...form, date };
    setForm(newForm);
    setShiftType("");
    fetchShifts(newForm.doctorId, date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftType) { setError("Vui lòng chọn một ca trực."); return; }
    setLoading(true);
    setError("");
    try {
      await appointmentApi.create({
        serviceId: form.serviceId,
        doctorId: form.doctorId,
        date: form.date,
        shiftType,
        notes: "",
      });
      onClose();
    } catch (err: any) {
      console.error("[BOOKING] error:", err);
      const msg = err.response?.data?.message || err.message || "Đặt lịch thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-semibold">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          {error}
        </div>
      )}

      {[
        { label: "Dịch vụ", key: "serviceId" as const, options: services.map(s => ({ value: s._id, label: `${s.name} – ${Number(s.price).toLocaleString("vi-VN")} ₫` })) },
        { label: "Bác sĩ", key: "doctorId" as const, options: doctors.map(d => ({ value: d._id, label: `Dr. ${d.name} – ${d.specialization || "Tổng quát"}` })) },
      ].map(({ label, key, options }) => (
        <div key={key}>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
          <select
            className="input"
            value={form[key]}
            onChange={(e) => {
              if (key === "doctorId") handleDoctorChange(e.target.value);
              else setForm({ ...form, [key]: e.target.value });
            }}
            required
          >
            <option value="">Chọn {label.toLowerCase()}...</option>
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      ))}

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ngày khám</label>
        <input type="date" className="input"
          value={form.date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => handleDateChange(e.target.value)}
          required />
      </div>

      {/* Shift Selection */}
      {form.doctorId && form.date && (
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Chọn ca trực
          </label>

          {slotsLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : shifts.length === 0 && form.doctorId && form.date ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-amber-700">Bác sĩ chưa đăng ký ca trực vào ngày này.</p>
              <p className="text-xs text-amber-500 mt-1">Vui lòng chọn ngày khác hoặc liên hệ phòng khám.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {(["morning", "afternoon", "evening"] as const).map((type) => {
                const shift = shifts.find((s: any) => s.shiftType === type);
                const cfg = SHIFT_CONFIG[type];
                const available = shift?.available;
                const isRegistered = shift?.isRegistered;

                return (
                  <label key={type}
                    className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      !isRegistered
                        ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
                        : shiftType === type
                        ? `${cfg.border} ${cfg.bg}`
                        : available
                        ? "border-slate-200 hover:border-slate-300 bg-white cursor-pointer"
                        : "opacity-60 cursor-not-allowed border-slate-200 bg-slate-50"
                    }`}>
                    <input
                      type="radio"
                      name="shiftType"
                      value={type}
                      disabled={!isRegistered || !available}
                      checked={shiftType === type}
                      onChange={() => setShiftType(type)}
                      className="w-4 h-4 accent-emerald-600"
                    />
                    <div className="text-2xl">{cfg.icon}</div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</p>
                      <p className="text-xs text-slate-400">{cfg.range}</p>
                      {isRegistered && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {available
                            ? `Còn ${shift.remaining}/${shift.maxPatients} chỗ`
                            : `Đã đầy (${shift.booked}/${shift.maxPatients})`}
                        </p>
                      )}
                      {!isRegistered && (
                        <p className="text-xs text-amber-500 mt-0.5">Bác sĩ chưa đăng ký ca này</p>
                      )}
                    </div>
                    {!isRegistered ? (
                      <span className="text-xs font-semibold text-slate-400">Chưa có</span>
                    ) : available ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">Còn chỗ</span>
                    ) : (
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full">Đầy</span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!form.doctorId && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-blue-700">Vui lòng chọn bác sĩ và ngày khám trước</p>
          <p className="text-xs text-blue-500 mt-1">Sau đó hệ thống sẽ hiển thị các ca trực có sẵn</p>
        </div>
      )}

      {form.doctorId && !form.date && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-blue-700">Chọn ngày để xem ca trực</p>
        </div>
      )}

      <div className="flex gap-3 pt-2 flex-wrap">
        <button type="submit" disabled={loading || !shiftType}
          className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang đặt...</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M5 13l4 4L19 7"/></svg> Đặt lịch theo ca</>
          )}
        </button>
        <button type="button" onClick={onClose}
          className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition">
          Hủy
        </button>
      </div>
    </form>
  );
}
