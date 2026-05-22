import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientSidebar from "../../components/layout/PatientSidebar";
import { appointmentApi, recordApi, scoreApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";
const statusConfig = {
    confirmed: { label: "Đã xác nhận", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
    pending: { label: "Chờ xác nhận", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-200" },
    completed: { label: "Hoàn thành", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" },
    cancelled: { label: "Đã hủy", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", border: "border-red-200" },
};
const tips = [
    {
        emoji: "🌞",
        color: "#0ea5e9",
        bg: "bg-blue-50",
        border: "border-blue-100",
        tip: "Đánh răng ít nhất 2 lần/ngày, mỗi lần 2 phút với kem đánh răng fluoride.",
    },
    {
        emoji: "🪥",
        color: "#14b8a6",
        bg: "bg-teal-50",
        border: "border-teal-100",
        tip: "Dùng chỉ nha khoa hàng ngày để loại bỏ mảng bám giữa các răng.",
    },
    {
        emoji: "❤️",
        color: "#f43f5e",
        bg: "bg-rose-50",
        border: "border-rose-100",
        tip: "Khám nha khoa định kỳ mỗi 6 tháng một lần để phát hiện sớm vấn đề.",
    },
];
export default function PatientDashboard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ appointments: 0, records: 0 });
    const [upcoming, setUpcoming] = useState([]);
    const [score, setScore] = useState(null);
    useEffect(() => {
        Promise.allSettled([
            appointmentApi.getMine(),
            recordApi.getMine(),
            scoreApi.getMine(),
        ]).then(([a, r, s]) => {
            const appts = a.status === "fulfilled"
                ? a.value.data?.data || a.value.data || []
                : [];
            setStats({
                appointments: appts.length,
                records: r.status === "fulfilled"
                    ? (r.value.data?.data || r.value.data || []).length
                    : 0,
            });
            setUpcoming(appts
                .filter((x) => x.status === "pending" || x.status === "confirmed")
                .slice(0, 4));
            const today = new Date().toISOString().split("T")[0];
            const todayAppts = appts.filter((apt) => apt.date === today);
            if (todayAppts.length > 0) {
                const list = todayAppts.map((apt) => `${apt.doctorName} - ${apt.time}`).join(", ");
                toast.info(`Hôm nay bạn có ${todayAppts.length} lịch khám: ${list}`, 5000);
            }
            if (s.status === "fulfilled")
                setScore(s.value.data?.data || s.value.data);
        });
    }, [toast]);
    const scoreValue = score?.overall ?? 78;
    const scoreColor = scoreValue >= 80 ? "#10b981" : scoreValue >= 60 ? "#f59e0b" : "#ef4444";
    const scoreLabel = scoreValue >= 80 ? "Xuất sắc" : scoreValue >= 60 ? "Khá tốt" : "Cần cải thiện";
    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12)
            return "Buổi sáng tốt lành";
        if (hour < 18)
            return "Buổi chiều vui vẻ";
        return "Buổi tối an lành";
    };
    const todayLabel = new Date().toLocaleDateString("vi-VN", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    return (_jsxs("div", { className: "flex min-h-screen", style: { background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }, children: [_jsx(PatientSidebar, {}), _jsxs("div", { className: "flex-1 lg:ml-0 min-w-0", children: [_jsxs("div", { className: "glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 lg:hidden" }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-slate-800", children: "T\u1ED5ng quan" }), _jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: todayLabel })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "hidden sm:block text-right", children: [_jsxs("p", { className: "text-xs font-medium text-slate-500", children: [greeting(), ","] }), _jsx("p", { className: "text-sm font-bold text-slate-700", children: user?.name })] }), _jsx("div", { className: "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md", style: { background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", boxShadow: "0 4px 12px rgba(14,165,233,0.3)" }, children: user?.name?.charAt(0)?.toUpperCase() || "P" })] })] }), _jsxs("div", { className: "p-6 lg:p-8 space-y-5 max-w-7xl mx-auto", children: [_jsxs("div", { className: "relative overflow-hidden rounded-2xl p-6 lg:p-8 text-slate-800 animate-fade-in", style: { background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #ecfdf5 100%)", boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)", border: "1px solid #d1fae5" }, children: [_jsxs("div", { className: "absolute inset-0 pointer-events-none", children: [_jsx("div", { className: "absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10", style: { background: "radial-gradient(circle, #10b981, transparent)" } }), _jsx("div", { className: "absolute bottom-0 left-1/2 w-40 h-40 rounded-full opacity-5", style: { background: "radial-gradient(circle, #0ea5e9, transparent)" } })] }), _jsxs("div", { className: "relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6", children: [_jsxs("div", { children: [_jsx("p", { className: "text-emerald-600 text-xs font-bold tracking-wide uppercase mb-1", children: greeting() }), _jsxs("h2", { className: "text-2xl lg:text-3xl font-black leading-tight text-slate-900", children: ["Ch\u00E0o m\u1EEBng tr\u1EDF l\u1EA1i, ", _jsx("span", { style: { color: "#0d9488" }, children: user?.name?.split(" ").pop() })] }), _jsx("p", { className: "text-slate-500 text-sm mt-2 max-w-md leading-relaxed", children: "C\u1EA3m \u01A1n b\u1EA1n \u0111\u00E3 tin t\u01B0\u1EDFng VinaMec. H\u00E3y c\u00F9ng ch\u0103m s\u00F3c s\u1EE9c kh\u1ECFe r\u0103ng mi\u1EC7ng m\u1ED7i ng\u00E0y nh\u00E9!" }), _jsxs("div", { className: "flex gap-3 mt-5 flex-wrap", children: [_jsxs("button", { onClick: () => navigate("/patient/appointments"), className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg", style: { background: "linear-gradient(135deg, #0f766e, #0d9488)", boxShadow: "0 4px 14px rgba(13,148,136,0.35)" }, children: [_jsxs("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: [_jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }), _jsx("path", { strokeLinecap: "round", d: "M16 2v4M8 2v4M3 10h18" })] }), "\u0110\u1EB7t l\u1ECBch kh\u00E1m"] }), _jsxs("button", { onClick: () => navigate("/patient/chat"), className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:shadow-md", style: { background: "rgba(255,255,255,0.9)", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }, children: [_jsx("svg", { className: "w-4 h-4", style: { color: "#0d9488" }, fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }), "Nh\u1EAFn tin b\u00E1c s\u0129"] })] })] }), _jsx("div", { className: "flex gap-3 flex-wrap", children: [
                                                    { label: "Hôm nay", value: `${upcoming.length} lịch`, color: "#0ea5e9" },
                                                    { label: "Đã khám", value: `${stats.records} hồ sơ`, color: "#14b8a6" },
                                                    { label: "Điểm răng", value: `${scoreValue}`, color: scoreColor },
                                                ].map((s, i) => (_jsxs("div", { className: "px-4 py-3 rounded-xl text-center", style: { background: "rgba(255,255,255,0.8)", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }, children: [_jsx("p", { className: "text-lg font-black text-slate-900", children: s.value }), _jsx("p", { className: "text-[10px] text-slate-400 font-medium mt-0.5", children: s.label })] }, i))) })] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
                                    {
                                        label: "Lịch hẹn", value: stats.appointments, icon: (_jsxs("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: [_jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }), _jsx("path", { strokeLinecap: "round", d: "M16 2v4M8 2v4M3 10h18" })] })),
                                        color: "#0ea5e9", gradient: "from-blue-50 to-sky-50", borderColor: "border-blue-100",
                                        progress: Math.min((stats.appointments / 10) * 100, 100),
                                        progressColor: "from-blue-400 to-sky-400",
                                    },
                                    {
                                        label: "Hồ sơ y tế", value: stats.records, icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) })),
                                        color: "#14b8a6", gradient: "from-teal-50 to-emerald-50", borderColor: "border-teal-100",
                                        progress: Math.min((stats.records / 5) * 100, 100),
                                        progressColor: "from-teal-400 to-emerald-400",
                                    },
                                    {
                                        label: "Điểm sức khỏe", value: scoreValue, icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) })),
                                        color: scoreColor, gradient: "from-emerald-50 to-teal-50", borderColor: "border-emerald-100",
                                        progress: scoreValue,
                                        progressColor: "from-emerald-400 to-teal-400",
                                        suffix: "/100",
                                    },
                                ].map((stat, i) => (_jsxs("div", { className: `card card-hover p-5 border ${stat.borderColor} animate-fade-in stagger-${i + 1}`, children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsx("div", { className: `w-11 h-11 rounded-xl flex items-center justify-center text-white`, style: { background: `linear-gradient(135deg, ${stat.color}, ${stat.color}99)`, boxShadow: `0 4px 12px ${stat.color}30` }, children: stat.icon }), i === 2 && (_jsx("span", { className: "text-xs font-bold px-2.5 py-1 rounded-full", style: { background: `${stat.color}15`, color: stat.color }, children: scoreLabel }))] }), _jsxs("p", { className: "text-3xl font-black text-slate-800", children: [stat.value, stat.suffix || ""] }), _jsx("p", { className: "text-xs font-semibold text-slate-400 mt-1", children: stat.label }), _jsx("div", { className: "mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out", style: { width: `${stat.progress}%`, backgroundImage: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)` } }) })] }, stat.label))) }), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-5", children: [_jsxs("div", { className: "xl:col-span-2 card p-0 animate-fade-in stagger-4", children: [_jsxs("div", { className: "px-5 pt-5 pb-4 flex items-center justify-between border-b border-slate-100", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-slate-800", children: "L\u1ECBch h\u1EB9n s\u1EAFp t\u1EDBi" }), _jsxs("p", { className: "text-xs text-slate-400 mt-0.5", children: [upcoming.length, " l\u1ECBch h\u1EB9n trong tu\u1EA7n n\u00E0y"] })] }), _jsxs("button", { onClick: () => navigate("/patient/appointments"), className: "text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition", children: ["Xem t\u1EA5t c\u1EA3", _jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M9 5l7 7-7 7" }) })] })] }), upcoming.length === 0 ? (_jsxs("div", { className: "text-center py-14 px-6", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4", children: _jsxs("svg", { className: "w-8 h-8 text-emerald-500", fill: "none", stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24", children: [_jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }), _jsx("path", { strokeLinecap: "round", d: "M16 2v4M8 2v4M3 10h18" })] }) }), _jsx("p", { className: "font-bold text-slate-600 mb-1", children: "Ch\u01B0a c\u00F3 l\u1ECBch h\u1EB9n n\u00E0o" }), _jsx("p", { className: "text-sm text-slate-400 mb-5", children: "\u0110\u1EB7t l\u1ECBch kh\u00E1m ngay \u0111\u1EC3 ch\u0103m s\u00F3c s\u1EE9c kh\u1ECFe r\u0103ng mi\u1EC7ng" }), _jsxs("button", { onClick: () => navigate("/patient/appointments"), className: "btn-emerald", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M12 4v16m8-8H4" }) }), "\u0110\u1EB7t l\u1ECBch h\u1EB9n"] })] })) : (_jsx("div", { className: "divide-y divide-slate-50", children: upcoming.map((apt) => {
                                                    const cfg = statusConfig[apt.status] || statusConfig.pending;
                                                    const serviceName = typeof apt.service === "string" ? apt.service : apt.service?.name;
                                                    const date = new Date(apt.date);
                                                    return (_jsxs("div", { onClick: () => navigate("/patient/appointments"), className: "flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition cursor-pointer group", children: [_jsxs("div", { className: "flex-shrink-0 w-13 h-13 rounded-xl flex flex-col items-center justify-center font-bold text-white", style: { background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", boxShadow: "0 4px 12px rgba(14,165,233,0.25)", minWidth: "52px", minHeight: "52px" }, children: [_jsx("span", { className: "text-[10px] font-semibold opacity-80 uppercase", children: date.toLocaleDateString("vi-VN", { month: "short" }) }), _jsx("span", { className: "text-lg leading-none", children: date.getDate() })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-bold text-slate-800 text-sm", children: serviceName }), _jsxs("div", { className: "flex items-center gap-3 mt-1", children: [_jsxs("span", { className: "flex items-center gap-1 text-xs text-slate-400", children: [_jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }), "Dr. ", apt.doctorName] }), _jsxs("span", { className: "flex items-center gap-1 text-xs text-slate-400", children: [_jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }), apt.time] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${cfg.dot}` }), cfg.label] }), _jsx("svg", { className: "w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-200", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M9 5l7 7-7 7" }) })] })] }, apt.id));
                                                }) }))] }), _jsxs("div", { className: "space-y-4 animate-fade-in stagger-5", children: [_jsxs("div", { className: "card p-5 border border-emerald-100", children: [_jsx("h3", { className: "text-sm font-bold text-slate-800 mb-4", children: "\u0110i\u1EC3m s\u1EE9c kh\u1ECFe r\u0103ng" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "relative w-20 h-20 flex-shrink-0", children: [_jsxs("svg", { className: "w-full h-full -rotate-90", viewBox: "0 0 80 80", children: [_jsx("circle", { cx: "40", cy: "40", r: "32", fill: "none", stroke: "#f1f5f9", strokeWidth: "6" }), _jsx("circle", { cx: "40", cy: "40", r: "32", fill: "none", stroke: scoreColor, strokeWidth: "6", strokeDasharray: 2 * Math.PI * 32, strokeDashoffset: 2 * Math.PI * 32 * (1 - scoreValue / 100), strokeLinecap: "round", style: { transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)" } })] }), _jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: _jsx("span", { className: "text-xl font-black", style: { color: scoreColor }, children: scoreValue }) })] }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs font-semibold text-slate-500", children: "\u0110i\u1EC3m t\u1ED5ng th\u1EC3" }), _jsx("p", { className: "text-sm font-bold", style: { color: scoreColor }, children: scoreLabel }), _jsxs("button", { onClick: () => navigate("/patient/dental-score"), className: "mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition", children: ["Xem chi ti\u1EBFt", _jsx("svg", { className: "w-3 h-3", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M9 5l7 7-7 7" }) })] })] })] })] }), _jsxs("div", { className: "card p-5", children: [_jsx("h3", { className: "text-sm font-bold text-slate-800 mb-4", children: "M\u1EB9o ch\u0103m s\u00F3c r\u0103ng" }), _jsx("div", { className: "space-y-3", children: tips.map((t, i) => (_jsxs("div", { className: `flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm cursor-default ${t.bg} ${t.border}`, children: [_jsx("span", { className: "text-2xl flex-shrink-0", children: t.emoji }), _jsx("p", { className: "text-xs text-slate-600 leading-relaxed", children: t.tip })] }, i))) })] }), _jsxs("div", { className: "card p-5", children: [_jsx("h3", { className: "text-sm font-bold text-slate-800 mb-3", children: "Thao t\u00E1c nhanh" }), _jsx("div", { className: "space-y-2", children: [
                                                            { label: "Đặt lịch khám", path: "/patient/appointments", icon: "calendar", color: "#0ea5e9" },
                                                            { label: "Chat với bác sĩ", path: "/patient/chat", icon: "chat", color: "#14b8a6" },
                                                            { label: "Xem điểm răng", path: "/patient/dental-score", icon: "shield", color: "#10b981" },
                                                            { label: "Hình ảnh răng", path: "/patient/images", icon: "image", color: "#8b5cf6" },
                                                        ].map((action) => (_jsxs("button", { onClick: () => navigate(action.path), className: "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition group", children: [_jsxs("div", { className: "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", style: { background: `${action.color}12` }, children: [action.icon === "calendar" && _jsxs("svg", { className: "w-4 h-4", style: { color: action.color }, fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: [_jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }), _jsx("path", { strokeLinecap: "round", d: "M16 2v4M8 2v4M3 10h18" })] }), action.icon === "chat" && _jsx("svg", { className: "w-4 h-4", style: { color: action.color }, fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }), action.icon === "shield" && _jsx("svg", { className: "w-4 h-4", style: { color: action.color }, fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) }), action.icon === "image" && _jsxs("svg", { className: "w-4 h-4", style: { color: action.color }, fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: [_jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }), _jsx("circle", { cx: "8.5", cy: "8.5", r: "1.5" }), _jsx("path", { strokeLinecap: "round", d: "M21 15l-5-5L5 21" })] })] }), _jsx("span", { className: "text-sm font-semibold text-slate-600 group-hover:text-slate-800", children: action.label }), _jsx("svg", { className: "w-4 h-4 text-slate-300 ml-auto group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-200", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M9 5l7 7-7 7" }) })] }, action.label))) })] })] })] })] })] })] }));
}
