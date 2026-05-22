import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import { shiftApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
const SHIFT_CONFIG = {
    morning: { label: "Ca sáng", range: "08:00–12:00", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", icon: "🌅" },
    afternoon: { label: "Ca chiều", range: "13:00–17:00", bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500", icon: "🌤️" },
    evening: { label: "Ca tối", range: "18:00–21:00", bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500", icon: "🌙" },
};
export default function AdminShifts() {
    const { data: shifts, loading, refetch } = useApi(() => shiftApi.getAll());
    const { toast } = useToast();
    const [filter, setFilter] = useState({ date: "", doctorId: "", shiftType: "" });
    const [selectedShift, setSelectedShift] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const today = new Date().toISOString().split("T")[0];
    const filtered = (shifts || []).filter((s) => {
        if (filter.date && s.date !== filter.date)
            return false;
        if (filter.doctorId && (s.doctor?._id || s.doctor) !== filter.doctorId)
            return false;
        if (filter.shiftType && s.shiftType !== filter.shiftType)
            return false;
        return true;
    });
    const columns = [
        {
            key: "doctor",
            header: "Bác sĩ",
            render: (s) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md", children: (s.doctorName || "BS").charAt(0) }), _jsx("span", { className: "font-medium text-slate-700", children: s.doctorName || s.doctor?.name || "—" })] })),
        },
        {
            key: "date",
            header: "Ngày",
            render: (s) => (_jsxs("span", { className: `text-sm font-mono font-semibold ${s.date < today ? "text-slate-400" : "text-slate-700"}`, children: [s.date, s.date === today && (_jsx("span", { className: "ml-2 text-xs font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full", children: "H\u00F4m nay" }))] })),
        },
        {
            key: "shiftType",
            header: "Ca trực",
            render: (s) => {
                const cfg = SHIFT_CONFIG[s.shiftType];
                return (_jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${cfg.dot}` }), cfg.icon, " ", cfg.label] }));
            },
        },
        {
            key: "time",
            header: "Giờ",
            render: (s) => (_jsxs("span", { className: "text-sm text-slate-500", children: [s.startTime, " \u2013 ", s.endTime] })),
        },
        {
            key: "capacity",
            header: "Sức chứa",
            render: (s) => (_jsxs("span", { className: "text-sm font-semibold text-slate-600", children: [s.maxPatients, " b\u1EC7nh nh\u00E2n"] })),
        },
        {
            key: "status",
            header: "Trạng thái",
            render: (s) => (_jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.status === "active"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"}`, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${s.status === "active" ? "bg-emerald-500" : "bg-red-500"}` }), s.status === "active" ? "Hoạt động" : "Đã hủy"] })),
        },
        {
            key: "actions",
            header: "",
            render: (s) => (_jsx("button", { onClick: () => { setSelectedShift(s); setShowDetail(true); }, className: "px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition", children: "Chi ti\u1EBFt" })),
        },
    ];
    // Stats
    const activeShifts = (shifts || []).filter((s) => s.status === "active");
    const todayShifts = activeShifts.filter((s) => s.date === today);
    const morningShifts = activeShifts.filter((s) => s.shiftType === "morning");
    const afternoonShifts = activeShifts.filter((s) => s.shiftType === "afternoon");
    const eveningShifts = activeShifts.filter((s) => s.shiftType === "evening");
    return (_jsxs("div", { className: "flex min-h-screen", style: { background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }, children: [_jsx(AdminSidebar, {}), _jsxs("div", { className: "flex-1 lg:ml-0 min-w-0", children: [_jsx("div", { className: "glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3", children: _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-slate-800", children: "Qu\u1EA3n l\u00FD ca tr\u1EF1c" }), _jsx("p", { className: "text-sm text-slate-400 mt-0.5", children: "Xem v\u00E0 qu\u1EA3n l\u00FD l\u1ECBch tr\u1EF1c c\u1EE7a b\u00E1c s\u0129" })] }) }), _jsxs("div", { className: "p-6 lg:p-8 space-y-6 animate-fade-in", children: [_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
                                    { label: "Tổng ca trực", value: activeShifts.length, icon: "📋", color: "from-sky-500 to-blue-600" },
                                    { label: "Trực hôm nay", value: todayShifts.length, icon: "📅", color: "from-emerald-500 to-green-600" },
                                    { label: "Ca sáng", value: morningShifts.length, icon: "🌅", color: "from-amber-500 to-orange-600" },
                                    { label: "Ca chiều", value: afternoonShifts.length, icon: "🌤️", color: "from-violet-500 to-purple-600" },
                                ].map((item) => (_jsx("div", { className: "card card-hover p-5 border border-slate-100", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: `w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg text-xl`, children: item.icon }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-black text-slate-800", children: item.value }), _jsx("p", { className: "text-xs text-slate-400", children: item.label })] })] }) }, item.label))) }), _jsx("div", { className: "card card-hover p-5 border border-slate-100", children: _jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase mb-1 block", children: "Ng\u00E0y" }), _jsx("input", { type: "date", className: "input", value: filter.date, onChange: (e) => setFilter({ ...filter, date: e.target.value }) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-slate-500 uppercase mb-1 block", children: "Ca tr\u1EF1c" }), _jsxs("select", { className: "input", value: filter.shiftType, onChange: (e) => setFilter({ ...filter, shiftType: e.target.value }), children: [_jsx("option", { value: "", children: "T\u1EA5t c\u1EA3" }), _jsx("option", { value: "morning", children: "Ca s\u00E1ng" }), _jsx("option", { value: "afternoon", children: "Ca chi\u1EC1u" }), _jsx("option", { value: "evening", children: "Ca t\u1ED1i" })] })] }), _jsx("div", { className: "flex items-end", children: _jsx("button", { onClick: () => setFilter({ date: "", doctorId: "", shiftType: "" }), className: "px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition", children: "X\u00F3a l\u1ECDc" }) })] }) }), _jsx("div", { className: "card overflow-hidden border border-slate-100", children: _jsx(Table, { columns: columns, data: filtered, loading: loading }) })] }), _jsx(Modal, { open: showDetail, onClose: () => { setShowDetail(false); setSelectedShift(null); }, title: "Chi ti\u1EBFt ca tr\u1EF1c", children: selectedShift && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 flex items-center gap-4", children: [_jsx("div", { className: "w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg", children: (selectedShift.doctorName || "BS").charAt(0) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-slate-800", children: selectedShift.doctorName || selectedShift.doctor?.name }), _jsx("p", { className: "text-sm text-slate-500", children: selectedShift.doctor?.email || "Bác sĩ" })] })] }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: [
                                        { label: "Ngày", value: selectedShift.date, highlight: selectedShift.date === today },
                                        { label: "Ca trực", value: SHIFT_CONFIG[selectedShift.shiftType]?.label },
                                        { label: "Giờ bắt đầu", value: selectedShift.startTime },
                                        { label: "Giờ kết thúc", value: selectedShift.endTime },
                                        { label: "Sức chứa", value: `${selectedShift.maxPatients} bệnh nhân` },
                                        { label: "Trạng thái", value: selectedShift.status === "active" ? "Hoạt động" : "Đã hủy", isStatus: true },
                                    ].map(({ label, value, highlight, isStatus }) => (_jsxs("div", { className: "bg-slate-50 rounded-xl p-3", children: [_jsx("p", { className: "text-xs text-slate-400 font-medium mb-1", children: label }), _jsx("p", { className: `text-sm font-semibold ${highlight ? "text-emerald-600" : "text-slate-700"}`, children: isStatus
                                                    ? _jsx("span", { className: `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedShift.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`, children: value })
                                                    : value })] }, label))) }), selectedShift.notes && (_jsxs("div", { className: "bg-amber-50 rounded-xl p-4", children: [_jsx("p", { className: "text-xs font-bold text-amber-600 uppercase mb-1", children: "Ghi ch\u00FA" }), _jsx("p", { className: "text-sm text-slate-700", children: selectedShift.notes })] })), _jsx("div", { className: "flex gap-3", children: _jsx("button", { onClick: () => { setShowDetail(false); setSelectedShift(null); }, className: "flex-1 px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition", children: "\u0110\u00F3ng" }) })] })) })] })] }));
}
