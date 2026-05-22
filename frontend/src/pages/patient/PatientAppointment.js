import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import PatientSidebar from "../../components/layout/PatientSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import AppointmentCalendar from "../../components/ui/AppointmentCalendar";
import { api, unwrap, serviceApi, doctorApi, appointmentApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
const SHIFT_CONFIG = {
    morning: { label: "Ca sáng", range: "08:00–12:00", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", icon: "🌅" },
    afternoon: { label: "Ca chiều", range: "13:00–17:00", bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500", icon: "🌤️" },
    evening: { label: "Ca tối", range: "18:00–21:00", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", dot: "bg-sky-500", icon: "🌙" },
};
const statusConfig = {
    confirmed: { label: "Đã xác nhận", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    pending: { label: "Chờ xác nhận", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    completed: { label: "Hoàn thành", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    cancelled: { label: "Đã hủy", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};
const statusCounts = (appointments) => Object.entries(statusConfig).map(([key, cfg]) => ({
    key, ...cfg,
    count: (appointments || []).filter((a) => a.status === key).length,
})).filter((s) => s.count > 0);
export default function PatientAppointment() {
    const { data: appointments, loading, refetch } = useApi(() => appointmentApi.getMine());
    const { data: services } = useApi(() => serviceApi.getAll());
    const { data: doctors } = useApi(() => doctorApi.getAll());
    const [showModal, setShowModal] = useState(false);
    const [viewType, setViewType] = useState("calendar");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const columns = [
        {
            key: "service",
            header: "Dịch vụ",
            render: (a) => (_jsx("span", { className: "font-bold text-slate-700", children: typeof a.service === "string" ? a.service : a.service?.name })),
        },
        {
            key: "doctorName",
            header: "Bác sĩ",
            render: (a) => (_jsxs("span", { className: "flex items-center gap-2 text-slate-600", children: [_jsx("span", { className: "w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0", style: { background: "linear-gradient(135deg, #0ea5e9, #14b8a6)" }, children: a.doctorName?.charAt(0).toUpperCase() }), "Dr. ", a.doctorName] })),
        },
        { key: "date", header: "Ngày", render: (a) => _jsx("span", { className: "text-slate-500 text-sm font-mono", children: a.date }) },
        {
            key: "shiftType",
            header: "Ca khám",
            render: (a) => {
                const type = a.shiftType || "morning";
                const cfg = SHIFT_CONFIG[type] || SHIFT_CONFIG.morning;
                return (_jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${cfg.dot}` }), cfg.icon, " ", cfg.label, " (", cfg.range, ")"] }));
            },
        },
        {
            key: "status",
            header: "Trạng thái",
            render: (a) => {
                const cfg = statusConfig[a.status] || statusConfig.pending;
                return (_jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${cfg.dot}` }), cfg.label] }));
            },
        },
        {
            key: "actions",
            header: "",
            render: (a) => a.status === "pending" ? (_jsx("button", { onClick: async (e) => { e.stopPropagation(); await appointmentApi.cancel(a.id); refetch(); }, className: "text-xs font-semibold text-red-500 hover:text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-50 transition", children: "H\u1EE7y" })) : null,
        },
    ];
    return (_jsxs("div", { className: "flex min-h-screen", style: { background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }, children: [_jsx(PatientSidebar, {}), _jsxs("div", { className: "flex-1 lg:ml-0 min-w-0", children: [_jsxs("div", { className: "glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-slate-800", children: "L\u1ECBch h\u1EB9n" }), _jsxs("p", { className: "text-xs text-slate-400 mt-0.5", children: [(appointments || []).length, " l\u1ECBch h\u1EB9n \u0111\u00E3 \u0111\u1EB7t"] })] }), _jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [statusCounts(appointments || []).map((s) => (_jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${s.dot}` }), s.label, ": ", s.count] }, s.key))), _jsxs("button", { onClick: () => setShowModal(true), className: "btn-emerald", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2.5, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M12 4v16m8-8H4" }) }), "\u0110\u1EB7t l\u1ECBch kh\u00E1m"] })] })] }), _jsxs("div", { className: "space-y-5 p-6 lg:p-8", children: [_jsx("div", { className: "flex items-center gap-3 animate-fade-in", children: _jsx("div", { className: "flex gap-1 p-1 rounded-xl bg-white border border-slate-200 shadow-sm", children: [
                                        { key: "calendar", label: "Lịch", icon: (_jsxs("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: [_jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }), _jsx("path", { strokeLinecap: "round", d: "M16 2v4M8 2v4M3 10h18" })] })) },
                                        { key: "table", label: "Danh sách", icon: (_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M4 6h16M4 12h16M4 18h16" }) })) },
                                    ].map((v) => (_jsxs("button", { onClick: () => setViewType(v.key), className: `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${viewType === v.key ? "text-white shadow-md" : "text-slate-500 hover:text-slate-700"}`, style: viewType === v.key ? { background: "linear-gradient(135deg, #0ea5e9, #14b8a6)" } : {}, children: [v.icon, v.label] }, v.key))) }) }), viewType === "calendar" ? (_jsx("div", { className: "animate-fade-in", children: _jsx(AppointmentCalendar, { appointments: appointments || [], onSelectAppointment: (apt) => setSelectedAppointment(apt), loading: loading }) })) : (_jsx("div", { className: "card overflow-hidden animate-fade-in", children: _jsx(Table, { columns: columns, data: appointments || [], loading: loading }) }))] }), selectedAppointment && (_jsx(Modal, { open: !!selectedAppointment, onClose: () => setSelectedAppointment(null), title: "Chi ti\u1EBFt l\u1ECBch kh\u00E1m", children: _jsxs("div", { className: "space-y-4", children: [[
                                    ["Bác sĩ", selectedAppointment.doctorName],
                                    ["Dịch vụ", typeof selectedAppointment.service === "string" ? selectedAppointment.service : selectedAppointment.service?.name || "Khám tổng quát"],
                                    ["Ngày", selectedAppointment.date],
                                    [
                                        "Ca khám",
                                        (() => {
                                            const type = selectedAppointment.shiftType || "morning";
                                            const cfg = SHIFT_CONFIG[type] || SHIFT_CONFIG.morning;
                                            return `${cfg.icon} ${cfg.label} (${cfg.range})`;
                                        })(),
                                    ],
                                    ["Ghi chú", selectedAppointment.notes || "—"],
                                ].map(([k, v]) => (_jsxs("div", { className: "flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition", children: [_jsx("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider w-24 flex-shrink-0 pt-1", children: k }), _jsx("span", { className: "text-sm font-semibold text-slate-700", children: v })] }, k))), _jsxs("div", { className: "pt-2 border-t border-slate-100", children: [_jsx("p", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider mb-2", children: "Tr\u1EA1ng th\u00E1i" }), (() => {
                                            const cfg = statusConfig[selectedAppointment.status] || statusConfig.pending;
                                            return (_jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${cfg.dot}` }), cfg.label] }));
                                        })()] }), _jsxs("div", { className: "flex gap-3 pt-3", children: [selectedAppointment.status === "pending" && (_jsxs("button", { onClick: async () => {
                                                await appointmentApi.cancel(selectedAppointment.id);
                                                refetch();
                                                setSelectedAppointment(null);
                                            }, className: "flex items-center gap-2 flex-1 justify-center px-4 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-lg", style: { background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 12px rgba(239,68,68,0.25)" }, children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M6 18L18 6M6 6l12 12" }) }), "H\u1EE7y l\u1ECBch"] })), _jsx("button", { onClick: () => setSelectedAppointment(null), className: "flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition", children: "\u0110\u00F3ng" })] })] }) })), _jsx(Modal, { open: showModal, onClose: () => setShowModal(false), title: "\u0110\u1EB7t l\u1ECBch kh\u00E1m theo ca tr\u1EF1c", children: _jsx(BookingForm, { services: services || [], doctors: doctors || [], onClose: () => { setShowModal(false); refetch(); } }) })] })] }));
}
// ── Booking Form with Shift Selection ────────────────────────────────────────
function BookingForm({ services, doctors, onClose }) {
    const [form, setForm] = useState({ serviceId: "", doctorId: "", date: "" });
    const [shiftType, setShiftType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [shifts, setShifts] = useState([]);
    const fetchShifts = async (doctorId, date) => {
        if (!doctorId || !date) {
            setShifts([]);
            return;
        }
        setSlotsLoading(true);
        try {
            // Call API directly + unwrap to get clean payload: { doctorId, date, shifts, availableCount }
            const payload = unwrap(await api.get("/appointments/slots", { params: { doctorId, date } }));
            setShifts(Array.isArray(payload?.shifts) ? payload.shifts : []);
        }
        catch {
            setShifts([]);
        }
        finally {
            setSlotsLoading(false);
        }
    };
    const handleDoctorChange = (id) => {
        setForm({ ...form, doctorId: id, date: "" });
        setShiftType("");
        setShifts([]);
    };
    const handleDateChange = (date) => {
        const newForm = { ...form, date };
        setForm(newForm);
        setShiftType("");
        fetchShifts(newForm.doctorId, date);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!shiftType) {
            setError("Vui lòng chọn một ca trực.");
            return;
        }
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
        }
        catch (err) {
            console.error("[BOOKING] error:", err);
            const msg = err.response?.data?.message || err.message || "Đặt lịch thất bại. Vui lòng thử lại.";
            setError(msg);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [error && (_jsxs("div", { className: "flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-semibold", children: [_jsx("svg", { className: "w-5 h-5 flex-shrink-0", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }), error] })), [
                { label: "Dịch vụ", key: "serviceId", options: services.map(s => ({ value: s._id, label: `${s.name} – ${Number(s.price).toLocaleString("vi-VN")} ₫` })) },
                { label: "Bác sĩ", key: "doctorId", options: doctors.map(d => ({ value: d._id, label: `Dr. ${d.name} – ${d.specialization || "Tổng quát"}` })) },
            ].map(({ label, key, options }) => (_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2", children: label }), _jsxs("select", { className: "input", value: form[key], onChange: (e) => {
                            if (key === "doctorId")
                                handleDoctorChange(e.target.value);
                            else
                                setForm({ ...form, [key]: e.target.value });
                        }, required: true, children: [_jsxs("option", { value: "", children: ["Ch\u1ECDn ", label.toLowerCase(), "..."] }), options.map((o) => _jsx("option", { value: o.value, children: o.label }, o.value))] })] }, key))), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2", children: "Ng\u00E0y kh\u00E1m" }), _jsx("input", { type: "date", className: "input", value: form.date, min: new Date().toISOString().split("T")[0], onChange: (e) => handleDateChange(e.target.value), required: true })] }), form.doctorId && form.date && (_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2", children: "Ch\u1ECDn ca tr\u1EF1c" }), slotsLoading ? (_jsx("div", { className: "flex items-center justify-center py-6", children: _jsx("div", { className: "w-6 h-6 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" }) })) : shifts.length === 0 && form.doctorId && form.date ? (_jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-xl p-4 text-center", children: [_jsx("p", { className: "text-sm font-semibold text-amber-700", children: "B\u00E1c s\u0129 ch\u01B0a \u0111\u0103ng k\u00FD ca tr\u1EF1c v\u00E0o ng\u00E0y n\u00E0y." }), _jsx("p", { className: "text-xs text-amber-500 mt-1", children: "Vui l\u00F2ng ch\u1ECDn ng\u00E0y kh\u00E1c ho\u1EB7c li\u00EAn h\u1EC7 ph\u00F2ng kh\u00E1m." })] })) : (_jsx("div", { className: "grid grid-cols-1 gap-2", children: ["morning", "afternoon", "evening"].map((type) => {
                            const shift = shifts.find((s) => s.shiftType === type);
                            const cfg = SHIFT_CONFIG[type];
                            const available = shift?.available;
                            const isRegistered = shift?.isRegistered;
                            return (_jsxs("label", { className: `relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${!isRegistered
                                    ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
                                    : shiftType === type
                                        ? `${cfg.border} ${cfg.bg}`
                                        : available
                                            ? "border-slate-200 hover:border-slate-300 bg-white cursor-pointer"
                                            : "opacity-60 cursor-not-allowed border-slate-200 bg-slate-50"}`, children: [_jsx("input", { type: "radio", name: "shiftType", value: type, disabled: !isRegistered || !available, checked: shiftType === type, onChange: () => setShiftType(type), className: "w-4 h-4 accent-emerald-600" }), _jsx("div", { className: "text-2xl", children: cfg.icon }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: `text-sm font-bold ${cfg.text}`, children: cfg.label }), _jsx("p", { className: "text-xs text-slate-400", children: cfg.range }), isRegistered && (_jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: available
                                                    ? `Còn ${shift.remaining}/${shift.maxPatients} chỗ`
                                                    : `Đã đầy (${shift.booked}/${shift.maxPatients})` })), !isRegistered && (_jsx("p", { className: "text-xs text-amber-500 mt-0.5", children: "B\u00E1c s\u0129 ch\u01B0a \u0111\u0103ng k\u00FD ca n\u00E0y" }))] }), !isRegistered ? (_jsx("span", { className: "text-xs font-semibold text-slate-400", children: "Ch\u01B0a c\u00F3" })) : available ? (_jsx("span", { className: "text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full", children: "C\u00F2n ch\u1ED7" })) : (_jsx("span", { className: "text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full", children: "\u0110\u1EA7y" }))] }, type));
                        }) }))] })), !form.doctorId && (_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-4 text-center", children: [_jsx("p", { className: "text-sm font-semibold text-blue-700", children: "Vui l\u00F2ng ch\u1ECDn b\u00E1c s\u0129 v\u00E0 ng\u00E0y kh\u00E1m tr\u01B0\u1EDBc" }), _jsx("p", { className: "text-xs text-blue-500 mt-1", children: "Sau \u0111\u00F3 h\u1EC7 th\u1ED1ng s\u1EBD hi\u1EC3n th\u1ECB c\u00E1c ca tr\u1EF1c c\u00F3 s\u1EB5n" })] })), form.doctorId && !form.date && (_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-4 text-center", children: _jsx("p", { className: "text-sm font-semibold text-blue-700", children: "Ch\u1ECDn ng\u00E0y \u0111\u1EC3 xem ca tr\u1EF1c" }) })), _jsxs("div", { className: "flex gap-3 pt-2 flex-wrap", children: [_jsx("button", { type: "submit", disabled: loading || !shiftType, className: "btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }), " \u0110ang \u0111\u1EB7t..."] })) : (_jsxs(_Fragment, { children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2.5, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M5 13l4 4L19 7" }) }), " \u0110\u1EB7t l\u1ECBch theo ca"] })) }), _jsx("button", { type: "button", onClick: onClose, className: "px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition", children: "H\u1EE7y" })] })] }));
}
