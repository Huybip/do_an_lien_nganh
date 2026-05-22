import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../services/api";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);
export default function AdminDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        adminApi.getDashboard()
            .then(res => setData(res.data?.data ?? null))
            .catch(err => console.error("Failed to fetch dashboard:", err))
            .finally(() => setLoading(false));
    }, []);
    const formatMoney = (n) => n >= 1000000 ? (n / 1000000).toFixed(1) + "M" : n >= 1000 ? (n / 1000).toFixed(0) + "K" : String(n);
    const getRevenueData = () => {
        const trend = data?.analytics?.monthlyAppointmentTrend || [];
        const trendMap = new Map();
        trend.forEach((item) => { if (item._id?.month)
            trendMap.set(item._id.month, item.count); });
        const labels = [], revenueData = [], expenseData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            labels.push(`T${date.getMonth() + 1}`);
            const count = trendMap.get(date.getMonth() + 1) || 5;
            revenueData.push(Math.max(50, count * 8));
            expenseData.push(Math.max(20, count * 5));
        }
        return {
            labels,
            datasets: [
                { label: "Doanh thu", data: revenueData, fill: true, backgroundColor: "rgba(14,165,233,0.08)", borderColor: "#0ea5e9", tension: 0.4, borderWidth: 2, pointRadius: 4, pointBackgroundColor: "#0ea5e9", pointBorderColor: "#fff", pointBorderWidth: 2 },
                { label: "Chi phí", data: expenseData, fill: true, backgroundColor: "rgba(239,68,68,0.08)", borderColor: "#ef4444", tension: 0.4, borderWidth: 2, pointRadius: 4, pointBackgroundColor: "#ef4444", pointBorderColor: "#fff", pointBorderWidth: 2 },
            ],
        };
    };
    const getServiceData = () => {
        const services = data?.analytics?.topServices || [];
        const labels = services.length > 0 ? services.map((s) => s._id) : ["Nhổ răng", "Kiểm tra", "Tẩy trắng", "Niềng răng", "Trám khoang"];
        const vals = services.length > 0 ? services.map((s) => s.count) : [35, 28, 18, 12, 7];
        return {
            labels,
            datasets: [{ data: vals, backgroundColor: ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"], borderColor: "#fff", borderWidth: 2 }],
        };
    };
    const todayLabel = new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    if (loading) {
        return (_jsxs("div", { className: "flex min-h-screen", style: { background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }, children: [_jsx(AdminSidebar, {}), _jsx("div", { className: "flex-1 lg:ml-0 min-w-0 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-12 h-12 rounded-full border-[3px] border-sky-300 border-t-sky-600 animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-slate-500 font-medium", children: "\u0110ang t\u1EA3i d\u1EEF li\u1EC7u..." })] }) })] }));
    }
    return (_jsxs("div", { className: "flex min-h-screen", style: { background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }, children: [_jsx(AdminSidebar, {}), _jsxs("div", { className: "flex-1 lg:ml-0 min-w-0", children: [_jsxs("div", { className: "glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-slate-800", children: "T\u1ED5ng quan" }), _jsxs("p", { className: "text-xs text-slate-400 mt-0.5", children: ["H\u00F4m nay, ", todayLabel] })] }), _jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [_jsxs("button", { onClick: () => navigate("/admin/payments"), className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg", style: { background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }, children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" }) }), "Thanh to\u00E1n"] }), _jsxs("button", { onClick: () => navigate("/admin/reports"), className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg", style: { background: "linear-gradient(135deg, #0ea5e9, #0369a1)", boxShadow: "0 4px 14px rgba(14,165,233,0.35)" }, children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" }) }), "Xu\u1EA5t b\u00E1o c\u00E1o"] })] })] }), _jsxs("div", { className: "p-6 lg:p-8 space-y-5 max-w-7xl mx-auto", children: [_jsxs("div", { className: "relative overflow-hidden rounded-2xl p-6 lg:p-8 text-slate-800 animate-fade-in", style: { background: "linear-gradient(135deg, #ffffff 0%, #eff6ff 50%, #f0f9ff 100%)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #bae6fd" }, children: [_jsx("div", { className: "absolute inset-0 pointer-events-none", children: _jsx("div", { className: "absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10", style: { background: "radial-gradient(circle, #0ea5e9, transparent)" } }) }), _jsxs("div", { className: "relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sky-600 text-xs font-bold tracking-wide uppercase mb-1", children: "Ch\u00E0o m\u1EEBng quay tr\u1EDF l\u1EA1i" }), _jsxs("h2", { className: "text-2xl lg:text-3xl font-black leading-tight text-slate-900", children: ["H\u1EC7 th\u1ED1ng ", _jsx("span", { style: { color: "#0ea5e9" }, children: "VinaMec" })] }), _jsx("p", { className: "text-slate-500 text-sm mt-2 max-w-md leading-relaxed", children: "Theo d\u00F5i to\u00E0n b\u1ED9 ho\u1EA1t \u0111\u1ED9ng c\u1EE7a ph\u00F2ng kh\u00E1m nha khoa t\u1EEB \u0111\u00E2y." })] }), _jsx("div", { className: "flex gap-3 flex-wrap", children: [
                                                    { label: "Bệnh nhân", value: `${data?.users?.patients || 0} người`, color: "#0ea5e9" },
                                                    { label: "Lịch hẹn hôm nay", value: `${data?.appointments?.today || 0} lịch`, color: "#10b981" },
                                                    { label: "Doanh thu", value: `${formatMoney(data?.revenue?.total || 0)}`, color: "#f59e0b" },
                                                ].map((s, i) => (_jsxs("div", { className: "px-4 py-3 rounded-xl text-center", style: { background: "rgba(255,255,255,0.8)", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }, children: [_jsx("p", { className: "text-lg font-black text-slate-900", children: s.value }), _jsx("p", { className: "text-[10px] text-slate-400 font-medium mt-0.5", children: s.label })] }, i))) })] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
                                    { label: "Tổng bệnh nhân", value: data?.users?.total || 0, sub: `+${data?.users?.newThisMonth || 0} tháng này`, icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" }) })), color: "#0ea5e9" },
                                    { label: "Lịch hẹn hôm nay", value: data?.appointments?.today || 0, sub: `${data?.appointments?.pending || 0} chưa xác nhận`, icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) })), color: "#10b981" },
                                    { label: "Doanh thu trong ngày", value: formatMoney(data?.revenue?.total || 0), sub: "Triệu VND", icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })), color: "#f59e0b" },
                                    { label: "Lịch chờ khám", value: data?.appointments?.pending || 0, sub: "Bệnh nhân đang đợi", icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) })), color: "#ef4444" },
                                ].map((stat, i) => (_jsxs("div", { className: `card card-hover p-5 border border-slate-100 animate-fade-in stagger-${i + 1}`, children: [_jsx("div", { className: "flex items-start justify-between mb-4", children: _jsx("div", { className: "w-11 h-11 rounded-xl flex items-center justify-center text-white", style: { background: `linear-gradient(135deg, ${stat.color}, ${stat.color}99)`, boxShadow: `0 4px 12px ${stat.color}30` }, children: stat.icon }) }), _jsx("p", { className: "text-3xl font-black text-slate-800", children: stat.value }), _jsx("p", { className: "text-xs font-semibold text-slate-400 mt-1", children: stat.label }), _jsx("p", { className: "text-xs text-emerald-600 font-semibold mt-0.5", children: stat.sub })] }, stat.label))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-5", children: [_jsxs("div", { className: "lg:col-span-2 card p-6 border border-slate-100 animate-fade-in", children: [_jsx("h3", { className: "text-base font-bold text-slate-800 mb-1", children: "Doanh thu & Chi ph\u00ED" }), _jsx("p", { className: "text-xs text-slate-400 mb-4", children: "Th\u1ED1ng k\u00EA 6 th\u00E1ng g\u1EA7n nh\u1EA5t (Tri\u1EC7u VND)" }), _jsx("div", { style: { height: "260px" }, children: _jsx(Line, { data: getRevenueData(), options: {
                                                        responsive: true, maintainAspectRatio: false,
                                                        plugins: { legend: { position: "top", labels: { usePointStyle: true, padding: 16 } } },
                                                        scales: { y: { beginAtZero: true, grid: { color: "#f1f5f9" } }, x: { grid: { display: false } } },
                                                    } }) })] }), _jsxs("div", { className: "card p-6 border border-slate-100 animate-fade-in", children: [_jsx("h3", { className: "text-base font-bold text-slate-800 mb-1", children: "C\u01A1 c\u1EA5u d\u1ECBch v\u1EE5" }), _jsx("p", { className: "text-xs text-slate-400 mb-4", children: "T\u1EF7 l\u1EC7 s\u1EED d\u1EE5ng c\u00E1c d\u1ECBch v\u1EE5" }), _jsx("div", { style: { height: "260px" }, children: _jsx(Pie, { data: getServiceData(), options: {
                                                        responsive: true, maintainAspectRatio: false,
                                                        plugins: { legend: { position: "bottom", labels: { usePointStyle: true, padding: 12 } } },
                                                    } }) })] })] }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4", children: [
                                    { label: "Bác sĩ", value: data?.users?.doctors || 0, color: "#0ea5e9" },
                                    { label: "Tổng lịch khám", value: data?.appointments?.total || 0, color: "#10b981" },
                                    { label: "Hồ sơ y tế", value: data?.records?.total || 0, color: "#8b5cf6" },
                                    { label: "Dịch vụ", value: data?.services?.active || 0, color: "#f59e0b" },
                                    { label: "Điểm sức khỏe TB", value: `${data?.analytics?.avgDentalScore || 0}%`, color: "#14b8a6" },
                                ].map((s) => (_jsxs("div", { className: "card p-4 text-center border border-slate-100", children: [_jsx("p", { className: "text-2xl font-black", style: { color: s.color }, children: s.value }), _jsx("p", { className: "text-xs font-semibold text-slate-400 mt-1", children: s.label })] }, s.label))) }), _jsxs("div", { className: "card p-6 border border-slate-100 animate-fade-in", children: [_jsx("h3", { className: "text-sm font-bold text-slate-800 mb-4", children: "Thao t\u00E1c nhanh" }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
                                            { label: "Quản lý bệnh nhân", path: "/admin/users", icon: "👥", color: "#0ea5e9" },
                                            { label: "Lịch hẹn", path: "/admin/appointments", icon: "📅", color: "#10b981" },
                                            { label: "Bác sĩ", path: "/admin/doctors", icon: "👨‍⚕️", color: "#8b5cf6" },
                                            { label: "Dịch vụ", path: "/admin/services", icon: "🦷", color: "#f59e0b" },
                                        ].map((a) => (_jsxs("button", { onClick: () => navigate(a.path), className: "flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition group border border-slate-100 hover:border-slate-200", children: [_jsx("span", { className: "text-2xl", children: a.icon }), _jsx("span", { className: "text-sm font-semibold text-slate-600 group-hover:text-slate-800", children: a.label })] }, a.path))) })] })] })] })] }));
}
