import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { adminApi, paymentApi } from "../../services/api";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler, } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);
const METHOD_LABELS = {
    cash: "Tiền mặt",
    bank_transfer: "Chuyển khoản",
    momo: "MoMo",
    vnpay: "VNPay",
    zalo_pay: "ZaloPay",
    insurance: "Bảo hiểm",
    other: "Khác",
};
const METHOD_COLORS = {
    cash: "#10b981",
    bank_transfer: "#0ea5e9",
    momo: "#ec4899",
    vnpay: "#6366f1",
    zalo_pay: "#06b6d4",
    insurance: "#f59e0b",
    other: "#8b5cf6",
};
const CHART_COLORS = [
    "#0ea5e9", "#10b981", "#f59e0b", "#ec4899",
    "#6366f1", "#06b6d4", "#8b5cf6",
];
export default function AdminReports() {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("month");
    const [exporting, setExporting] = useState(false);
    const [selectedReport, setSelectedReport] = useState("revenue");
    const [exportData, setExportData] = useState(null);
    // Shared stats for all report types
    const [reportData, setReportData] = useState(null);
    const [paymentStats, setPaymentStats] = useState(null);
    useEffect(() => {
        loadAllData();
    }, [period]);
    const loadAllData = async () => {
        setLoading(true);
        try {
            const [dashRes, payRes] = await Promise.allSettled([
                adminApi.getDashboard(),
                paymentApi.getStats(),
            ]);
            // Dashboard data
            let dashData = { appointments: {}, users: {}, revenue: { total: 0, month: 0 } };
            if (dashRes.status === "fulfilled") {
                dashData = dashRes.value.data?.data || {};
            }
            else {
                console.error("Dashboard API failed:", dashRes.reason);
            }
            // Payment stats
            let payData = { totalRevenue: 0, monthRevenue: 0, pendingPayments: 0, totalPayments: 0, methodBreakdown: [], monthlyTrend: [] };
            if (payRes.status === "fulfilled") {
                payData = payRes.value.data?.data || {};
            }
            else {
                console.error("Payment stats API failed:", payRes.reason);
            }
            const periodLabel = period === "month" ? "Tháng này" : "Năm nay";
            setReportData({
                period: periodLabel,
                appointments: {
                    totalAppointments: dashData.appointments?.total || 0,
                    completedAppointments: dashData.appointments?.completed || 0,
                    cancelledAppointments: dashData.appointments?.cancelled || 0,
                },
                revenue: payData.totalRevenue || 0,
                monthRevenue: payData.monthRevenue || 0,
                newPatients: dashData.users?.newThisMonth || 0,
            });
            setPaymentStats({
                totalRevenue: payData.totalRevenue || 0,
                monthRevenue: payData.monthRevenue || 0,
                pendingPayments: payData.pendingPayments || 0,
                totalPayments: payData.totalPayments || 0,
                methodBreakdown: payData.methodBreakdown || [],
                monthlyTrend: payData.monthlyTrend || [],
            });
            setExportData({
                reportData: {
                    period: periodLabel,
                    appointments: {
                        totalAppointments: dashData.appointments?.total || 0,
                        completedAppointments: dashData.appointments?.completed || 0,
                        cancelledAppointments: dashData.appointments?.cancelled || 0,
                    },
                    revenue: payData.totalRevenue || 0,
                    monthRevenue: payData.monthRevenue || 0,
                    newPatients: dashData.users?.newThisMonth || 0,
                },
                paymentStats: {
                    totalRevenue: payData.totalRevenue || 0,
                    monthRevenue: payData.monthRevenue || 0,
                    pendingPayments: payData.pendingPayments || 0,
                    totalPayments: payData.totalPayments || 0,
                    methodBreakdown: payData.methodBreakdown || [],
                    monthlyTrend: payData.monthlyTrend || [],
                },
            });
        }
        catch (err) {
            console.error("Failed to load report:", err);
        }
        finally {
            setLoading(false);
        }
    };
    // ── Chart data ────────────────────────────────────────────────
    const revenueLineData = paymentStats?.monthlyTrend?.length > 0
        ? {
            labels: paymentStats.monthlyTrend.map((t) => {
                const m = String(t._id.month).padStart(2, "0");
                return `${m}/${t._id.year}`;
            }),
            datasets: [
                {
                    label: "Doanh thu (VNĐ)",
                    data: paymentStats.monthlyTrend.map((t) => t.total),
                    fill: true,
                    backgroundColor: "rgba(14,165,233,0.08)",
                    borderColor: "#0ea5e9",
                    tension: 0.4,
                    borderWidth: 2.5,
                    pointBackgroundColor: "#0ea5e9",
                    pointRadius: 5,
                    pointHoverRadius: 7,
                },
            ],
        }
        : null;
    const methodDoughnutData = paymentStats?.methodBreakdown?.length > 0
        ? {
            labels: paymentStats.methodBreakdown.map((m) => METHOD_LABELS[m._id] || m._id),
            datasets: [
                {
                    data: paymentStats.methodBreakdown.map((m) => m.total),
                    backgroundColor: paymentStats.methodBreakdown.map((m) => METHOD_COLORS[m._id] || "#94a3b8"),
                    borderWidth: 0,
                    hoverOffset: 8,
                },
            ],
        }
        : null;
    const methodBarData = paymentStats?.methodBreakdown?.length > 0
        ? {
            labels: paymentStats.methodBreakdown.map((m) => METHOD_LABELS[m._id] || m._id),
            datasets: [
                {
                    label: "Doanh thu (VNĐ)",
                    data: paymentStats.methodBreakdown.map((m) => m.total),
                    backgroundColor: paymentStats.methodBreakdown.map((m) => METHOD_COLORS[m._id] || "#94a3b8"),
                    borderRadius: 8,
                    borderSkipped: false,
                },
            ],
        }
        : null;
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => ` ${ctx.parsed.y.toLocaleString("vi-VN")} đ`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: "#f1f5f9" },
                ticks: {
                    callback: (v) => v >= 1000000
                        ? (v / 1000000).toFixed(1) + "M"
                        : v >= 1000
                            ? (v / 1000).toFixed(0) + "K"
                            : v,
                },
            },
            x: { grid: { display: false } },
        },
    };
    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    padding: 16,
                    usePointStyle: true,
                    font: { size: 12 },
                },
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => ` ${ctx.label}: ${ctx.parsed.toLocaleString("vi-VN")} đ`,
                },
            },
        },
        cutout: "65%",
    };
    // ── Export functions ─────────────────────────────────────────
    const buildCsvContent = () => {
        if (!exportData)
            return "";
        const { reportData: rd, paymentStats: ps } = exportData;
        const rows = [
            `BÁO CÁO QUẢN LÝ PHÒNG KHÁM NHA KHOA`,
            `Kỳ báo cáo,${rd.period}`,
            `Ngày in,${new Date().toLocaleDateString("vi-VN")}`,
            `Giờ in,${new Date().toLocaleTimeString("vi-VN")}`,
            ``,
            `=== THỐNG KÊ LỊCH HẸN ===`,
            `Tổng lịch hẹn,${rd.appointments.totalAppointments}`,
            `Lịch hẹn hoàn tất,${rd.appointments.completedAppointments}`,
            `Lịch hẹn hủy,${rd.appointments.cancelledAppointments}`,
            `Tỷ lệ hoàn tất,${rd.appointments.totalAppointments > 0
                ? ((rd.appointments.completedAppointments /
                    rd.appointments.totalAppointments) *
                    100).toFixed(1) + "%"
                : "0%"}`,
            ``,
            `=== THỐNG KÊ THANH TOÁN ===`,
            `Tổng doanh thu,${rd.revenue}`,
            `Doanh thu tháng,${rd.monthRevenue}`,
            `Tổng phiếu thanh toán,${ps.totalPayments}`,
            `Chờ thanh toán,${ps.pendingPayments}`,
            ``,
            `=== DOANH THU THEO PHƯƠNG THỨC ===`,
            `Phương thức,Doanh thu (VNĐ),Số lần`,
            ...(ps.methodBreakdown || []).map((m) => `${METHOD_LABELS[m._id] || m._id},${m.total},${m.count}`),
            ``,
            `=== XU HƯỚNG DOANH THU HÀNG THÁNG ===`,
            `Tháng,Doanh thu (VNĐ),Số giao dịch`,
            ...(ps.monthlyTrend || []).map((t) => `${t._id.month}/${t._id.year},${t.total},${t.count}`),
            ``,
            `=== NGƯỜI DÙNG MỚI ===`,
            `Bệnh nhân mới,${rd.newPatients}`,
        ];
        return rows.join("\n");
    };
    const handleExportCSV = () => {
        setExporting(true);
        try {
            const csvContent = buildCsvContent();
            const blob = new Blob(["\uFEFF" + csvContent], {
                type: "text/csv;charset=utf-8;",
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `bao-cao-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
        catch (err) {
            console.error("Export failed:", err);
        }
        finally {
            setExporting(false);
        }
    };
    const handleExportPDF = () => {
        setExporting(true);
        try {
            if (!exportData)
                return;
            const { reportData: rd, paymentStats: ps } = exportData;
            const methodRows = (ps.methodBreakdown || [])
                .map((m) => `  - ${METHOD_LABELS[m._id] || m._id}: ${m.total.toLocaleString("vi-VN")} đ (${m.count} lần)`)
                .join("\n");
            const trendRows = (ps.monthlyTrend || [])
                .map((t) => `  - ${String(t._id.month).padStart(2, "0")}/${t._id.year}: ${t.total.toLocaleString("vi-VN")} đ`)
                .join("\n");
            const content = `
BÁO CÁO QUẢN LÝ PHÒNG KHÁM NHA KHOA
=====================================
Kỳ báo cáo: ${rd.period}
Ngày in: ${new Date().toLocaleDateString("vi-VN")} lúc ${new Date().toLocaleTimeString("vi-VN")}

=== 1. THỐNG KÊ LỊCH HẸN ===
- Tổng lịch hẹn: ${rd.appointments.totalAppointments}
- Hoàn tất: ${rd.appointments.completedAppointments}
- Hủy: ${rd.appointments.cancelledAppointments}
- Tỷ lệ hoàn tất: ${rd.appointments.totalAppointments > 0
                ? ((rd.appointments.completedAppointments /
                    rd.appointments.totalAppointments) *
                    100).toFixed(1) + "%"
                : "0%"}

=== 2. THỐNG KÊ THANH TOÁN & DOANH THU ===
- Tổng doanh thu: ${rd.revenue.toLocaleString("vi-VN")} VND
- Doanh thu tháng: ${rd.monthRevenue.toLocaleString("vi-VN")} VND
- Tổng phiếu thanh toán: ${ps.totalPayments}
- Chờ thanh toán: ${ps.pendingPayments}

=== 3. DOANH THU THEO PHƯƠNG THỨC THANH TOÁN ===
${methodRows || "  (Không có dữ liệu)"}

=== 4. XU HƯỚNG DOANH THU HÀNG THÁNG ===
${trendRows || "  (Không có dữ liệu)"}

=== 5. NGƯỜI DÙNG MỚI ===
- Bệnh nhân mới (30 ngày): ${rd.newPatients}

=====================================
Báo cáo được tạo tự động bởi hệ thống
`.trim();
            const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `bao-cao-${new Date().toISOString().slice(0, 10)}.txt`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
        catch (err) {
            console.error("Export failed:", err);
        }
        finally {
            setExporting(false);
        }
    };
    const reportTypes = [
        {
            id: "revenue",
            title: "Doanh thu",
            description: "Báo cáo doanh thu chi tiết từ thanh toán",
            icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })),
            gradient: "from-emerald-400 to-teal-500",
            active: true,
        },
        {
            id: "appointments",
            title: "Lịch hẹn",
            description: "Thống kê lịch hẹn theo ngày, tuần, tháng",
            icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) })),
            gradient: "from-sky-400 to-blue-500",
            active: false,
        },
        {
            id: "patients",
            title: "Bệnh nhân",
            description: "Danh sách và thông tin bệnh nhân",
            icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" }) })),
            gradient: "from-violet-400 to-purple-500",
            active: false,
        },
        {
            id: "doctors",
            title: "Bác sĩ",
            description: "Thống kê hiệu suất bác sĩ",
            icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) })),
            gradient: "from-amber-400 to-orange-500",
            active: false,
        },
    ];
    if (loading) {
        return (_jsxs("div", { className: "flex h-screen", style: {
                background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)",
            }, children: [_jsx(AdminSidebar, {}), _jsx("div", { className: "flex-1 lg:ml-0 min-w-0 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center mx-auto mb-4 animate-pulse", children: _jsxs("svg", { className: "w-8 h-8 text-white animate-spin", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }) }), _jsx("p", { className: "text-slate-600 font-medium", children: "\u0110ang t\u1EA3i b\u00E1o c\u00E1o..." })] }) })] }));
    }
    const completionRate = reportData && reportData.appointments.totalAppointments > 0
        ? ((reportData.appointments.completedAppointments /
            reportData.appointments.totalAppointments) *
            100).toFixed(1)
        : "0";
    return (_jsxs("div", { className: "flex h-screen", style: {
            background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)",
        }, children: [_jsx(AdminSidebar, {}), _jsxs("div", { className: "flex-1 lg:ml-0 min-w-0 overflow-y-auto", children: [_jsx("div", { className: "glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50", children: _jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-slate-800", children: "B\u00E1o c\u00E1o & Th\u1ED1ng k\u00EA" }), _jsx("p", { className: "text-sm text-slate-400 mt-0.5", children: new Date().toLocaleDateString("vi-VN", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            }) })] }), _jsx("div", { className: "flex items-center gap-3", children: _jsxs("select", { value: period, onChange: (e) => setPeriod(e.target.value), className: "px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all", children: [_jsx("option", { value: "month", children: "Th\u00E1ng n\u00E0y" }), _jsx("option", { value: "year", children: "N\u0103m nay" })] }) })] }) }), _jsxs("div", { className: "p-6 lg:p-8 space-y-6 animate-fade-in", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-slate-800 mb-4", children: "Ch\u1ECDn lo\u1EA1i b\u00E1o c\u00E1o" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: reportTypes.map((report, index) => (_jsxs("button", { onClick: () => setSelectedReport(report.id), className: `card card-hover p-5 text-left animate-scale-in transition-all ${selectedReport === report.id
                                                ? "ring-2 ring-sky-500 border-sky-300"
                                                : ""}`, style: { animationDelay: `${index * 100}ms` }, children: [_jsx("div", { className: `w-12 h-12 rounded-xl bg-gradient-to-br ${report.gradient} flex items-center justify-center text-white mb-4 shadow-lg`, children: report.icon }), _jsx("h3", { className: "font-bold text-slate-800 mb-1", children: report.title }), _jsx("p", { className: "text-xs text-slate-500", children: report.description })] }, report.id))) })] }), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "card card-hover p-5 animate-scale-in", style: { animationDelay: "200ms" }, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-500 mb-1", children: "T\u1ED5ng l\u1ECBch h\u1EB9n" }), _jsx("p", { className: "text-3xl font-bold text-sky-600", children: reportData?.appointments.totalAppointments })] }), _jsx("div", { className: "w-11 h-11 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-lg", children: _jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) })] }) }), _jsx("div", { className: "card card-hover p-5 animate-scale-in", style: { animationDelay: "300ms" }, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-500 mb-1", children: "Ho\u00E0n t\u1EA5t" }), _jsx("p", { className: "text-3xl font-bold text-emerald-600", children: reportData?.appointments.completedAppointments }), _jsxs("p", { className: "text-xs text-emerald-500 mt-1", children: [completionRate, "%"] })] }), _jsx("div", { className: "w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg", children: _jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }) })] }) }), _jsx("div", { className: "card card-hover p-5 animate-scale-in", style: { animationDelay: "400ms" }, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-500 mb-1", children: "Doanh thu th\u00E1ng" }), _jsx("p", { className: "text-2xl font-bold text-violet-600", children: (reportData?.monthRevenue || 0).toLocaleString("vi-VN") }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "VND" })] }), _jsx("div", { className: "w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white shadow-lg", children: _jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) })] }) }), _jsx("div", { className: "card card-hover p-5 animate-scale-in", style: { animationDelay: "500ms" }, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-500 mb-1", children: "B\u1EC7nh nh\u00E2n m\u1EDBi" }), _jsx("p", { className: "text-3xl font-bold text-amber-600", children: reportData?.newPatients })] }), _jsx("div", { className: "w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg", children: _jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" }) }) })] }) })] }), selectedReport === "revenue" && paymentStats && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 animate-scale-in", style: { animationDelay: "100ms" }, children: [_jsxs("div", { className: "card p-5 border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50", children: [_jsx("p", { className: "text-sm font-semibold text-emerald-600 mb-1", children: "T\u1ED5ng doanh thu" }), _jsx("p", { className: "text-2xl font-black text-emerald-700", children: (paymentStats.totalRevenue || 0).toLocaleString("vi-VN") }), _jsx("p", { className: "text-xs text-emerald-500 mt-1", children: "T\u1EA5t c\u1EA3 th\u1EDDi gian (VN\u0110)" })] }), _jsxs("div", { className: "card p-5 border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50", children: [_jsx("p", { className: "text-sm font-semibold text-sky-600 mb-1", children: "Doanh thu th\u00E1ng" }), _jsx("p", { className: "text-2xl font-black text-sky-700", children: (paymentStats.monthRevenue || 0).toLocaleString("vi-VN") }), _jsxs("p", { className: "text-xs text-sky-500 mt-1", children: ["Th\u00E1ng ", new Date().getMonth() + 1, " / ", new Date().getFullYear(), " (VN\u0110)"] })] }), _jsxs("div", { className: "card p-5 border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50", children: [_jsx("p", { className: "text-sm font-semibold text-amber-600 mb-1", children: "Ch\u1EDD thanh to\u00E1n" }), _jsx("p", { className: "text-2xl font-black text-amber-700", children: paymentStats.pendingPayments }), _jsx("p", { className: "text-xs text-amber-500 mt-1", children: "Phi\u1EBFu thanh to\u00E1n \u0111ang ch\u1EDD" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 animate-scale-in", style: { animationDelay: "200ms" }, children: [_jsxs("div", { className: "card p-5 border border-slate-100 lg:col-span-2", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-slate-800", children: "Xu h\u01B0\u1EDBng doanh thu" }), _jsx("p", { className: "text-xs text-slate-400", children: "12 th\u00E1ng g\u1EA7n nh\u1EA5t" })] }), _jsxs("div", { className: "flex items-center gap-1.5 text-xs text-sky-600 font-semibold bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100", children: [_jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" }) }), "Theo thanh to\u00E1n"] })] }), revenueLineData ? (_jsx("div", { style: { height: "240px" }, children: _jsx(Line, { data: revenueLineData, options: chartOptions }) })) : (_jsx("div", { className: "h-60 flex items-center justify-center text-slate-400 text-sm", children: "Ch\u01B0a c\u00F3 d\u1EEF li\u1EC7u doanh thu thanh to\u00E1n" }))] }), _jsxs("div", { className: "card p-5 border border-slate-100", children: [_jsx("h3", { className: "text-base font-bold text-slate-800 mb-1", children: "Theo ph\u01B0\u01A1ng th\u1EE9c" }), _jsx("p", { className: "text-xs text-slate-400 mb-4", children: "T\u1ED5ng doanh thu" }), methodDoughnutData ? (_jsx("div", { style: { height: "200px" }, children: _jsx(Doughnut, { data: methodDoughnutData, options: doughnutOptions }) })) : (_jsx("div", { className: "h-52 flex items-center justify-center text-slate-400 text-sm", children: "Ch\u01B0a c\u00F3 d\u1EEF li\u1EC7u" }))] })] }), methodBarData && (_jsxs("div", { className: "card p-5 border border-slate-100 animate-scale-in", style: { animationDelay: "300ms" }, children: [_jsx("h3", { className: "text-base font-bold text-slate-800 mb-4", children: "Doanh thu theo ph\u01B0\u01A1ng th\u1EE9c thanh to\u00E1n" }), _jsx("div", { style: { height: "200px" }, children: _jsx(Bar, { data: methodBarData, options: {
                                                        ...chartOptions,
                                                        plugins: {
                                                            ...chartOptions.plugins,
                                                            legend: { display: false },
                                                        },
                                                    } }) })] })), _jsxs("div", { className: "card overflow-hidden border border-slate-100 animate-scale-in", style: { animationDelay: "400ms" }, children: [_jsx("div", { className: "bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3 border-b border-emerald-100", children: _jsx("h3", { className: "text-base font-bold text-emerald-800", children: "Chi ti\u1EBFt doanh thu" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsx("tr", { className: "bg-slate-50 border-b border-slate-100", children: ["Phương thức", "Số giao dịch", "Doanh thu (VNĐ)", "Tỷ lệ"].map((h) => (_jsx("th", { className: "px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider", children: h }, h))) }) }), _jsxs("tbody", { children: [(paymentStats.methodBreakdown || []).map((m, i) => {
                                                                    const pct = paymentStats.totalRevenue > 0
                                                                        ? ((m.total / paymentStats.totalRevenue) * 100).toFixed(1)
                                                                        : "0";
                                                                    return (_jsxs("tr", { className: "border-b border-slate-50 hover:bg-slate-50 transition", children: [_jsx("td", { className: "px-4 py-3", children: _jsxs("span", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold", style: {
                                                                                        background: `${METHOD_COLORS[m._id] || "#94a3b8"}15`,
                                                                                        color: METHOD_COLORS[m._id] || "#94a3b8",
                                                                                    }, children: [_jsx("span", { className: "w-2 h-2 rounded-full", style: { background: METHOD_COLORS[m._id] || "#94a3b8" } }), METHOD_LABELS[m._id] || m._id] }) }), _jsx("td", { className: "px-4 py-3 font-semibold text-slate-700", children: m.count }), _jsxs("td", { className: "px-4 py-3 font-bold text-slate-800", children: [m.total.toLocaleString("vi-VN"), " \u0111"] }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-24", children: _jsx("div", { className: "h-full rounded-full transition-all duration-500", style: {
                                                                                                    width: `${pct}%`,
                                                                                                    background: METHOD_COLORS[m._id] || "#94a3b8",
                                                                                                } }) }), _jsxs("span", { className: "text-xs font-bold text-slate-500 w-12 text-right", children: [pct, "%"] })] }) })] }, m._id));
                                                                }), (paymentStats.methodBreakdown || []).length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "px-4 py-8 text-center text-slate-400 text-sm", children: "Ch\u01B0a c\u00F3 d\u1EEF li\u1EC7u thanh to\u00E1n" }) }))] }), _jsx("tfoot", { children: _jsxs("tr", { className: "bg-emerald-50 border-t-2 border-emerald-200", children: [_jsx("td", { className: "px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider", children: "T\u1ED5ng c\u1ED9ng" }), _jsx("td", { className: "px-4 py-3 font-black text-slate-700", children: paymentStats.totalPayments }), _jsxs("td", { className: "px-4 py-3 font-black text-emerald-700", children: [paymentStats.totalRevenue.toLocaleString("vi-VN"), " \u0111"] }), _jsx("td", { className: "px-4 py-3 font-black text-emerald-600", children: "100%" })] }) })] }) })] })] })), selectedReport === "appointments" && reportData && (_jsxs("div", { className: "card p-6 border border-slate-100 animate-scale-in", style: { animationDelay: "100ms" }, children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-800 mb-6", children: ["Chi ti\u1EBFt b\u00E1o c\u00E1o l\u1ECBch h\u1EB9n \u2014 ", reportData.period] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center py-4 px-5 bg-slate-50 rounded-xl", children: [_jsx("span", { className: "text-slate-600 font-medium", children: "T\u1ED5ng l\u1ECBch h\u1EB9n" }), _jsx("span", { className: "font-bold text-slate-800", children: reportData.appointments.totalAppointments })] }), _jsxs("div", { className: "flex justify-between items-center py-4 px-5 bg-emerald-50 rounded-xl", children: [_jsx("span", { className: "text-slate-600 font-medium", children: "L\u1ECBch h\u1EB9n ho\u00E0n t\u1EA5t" }), _jsx("span", { className: "font-bold text-emerald-600", children: reportData.appointments.completedAppointments })] }), _jsxs("div", { className: "flex justify-between items-center py-4 px-5 bg-red-50 rounded-xl", children: [_jsx("span", { className: "text-slate-600 font-medium", children: "L\u1ECBch h\u1EB9n h\u1EE7y" }), _jsx("span", { className: "font-bold text-red-600", children: reportData.appointments.cancelledAppointments })] }), _jsxs("div", { className: "flex justify-between items-center py-4 px-5 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl", children: [_jsx("span", { className: "text-slate-600 font-medium", children: "Doanh thu th\u00E1ng" }), _jsxs("span", { className: "font-bold text-violet-700 text-lg", children: [(reportData.monthRevenue || 0).toLocaleString("vi-VN"), " VND"] })] })] }), _jsxs("div", { className: "mt-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm font-medium text-slate-600", children: "T\u1EF7 l\u1EC7 ho\u00E0n t\u1EA5t" }), _jsxs("span", { className: "text-sm font-bold text-sky-600", children: [completionRate, "%"] })] }), _jsx("div", { className: "h-3 bg-slate-100 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500", style: { width: `${completionRate}%` } }) })] })] })), (selectedReport === "patients" || selectedReport === "doctors") && (_jsxs("div", { className: "card p-12 text-center border border-slate-100 animate-scale-in", style: { animationDelay: "100ms" }, children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-8 h-8 text-slate-400", fill: "none", stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }) }), _jsx("p", { className: "font-bold text-slate-600 text-lg mb-2", children: selectedReport === "patients" ? "Báo cáo bệnh nhân" : "Báo cáo bác sĩ" }), _jsx("p", { className: "text-sm text-slate-400", children: selectedReport === "patients"
                                            ? "Thống kê chi tiết bệnh nhân sẽ được cập nhật."
                                            : "Thống kê hiệu suất bác sĩ sẽ được cập nhật." }), _jsxs("div", { className: "mt-4 text-sm text-sky-600", children: [_jsx("span", { className: "font-semibold", children: "B\u1EC7nh nh\u00E2n m\u1EDBi (30 ng\u00E0y): " }), _jsx("span", { className: "font-bold", children: reportData?.newPatients || 0 })] })] })), _jsx("div", { className: "card card-hover p-6 animate-scale-in", style: { animationDelay: "600ms" }, children: _jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-slate-800 mb-1", children: "Xu\u1EA5t b\u00E1o c\u00E1o" }), _jsx("p", { className: "text-sm text-slate-500", children: "T\u1EA3i xu\u1ED1ng b\u00E1o c\u00E1o (CSV/TXT) bao g\u1ED3m d\u1EEF li\u1EC7u thanh to\u00E1n v\u00E0 doanh thu" })] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsxs("button", { onClick: handleExportCSV, disabled: exporting, className: "inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }), "Xu\u1EA5t CSV"] }), _jsxs("button", { onClick: handleExportPDF, disabled: exporting, className: "inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-200 transition-all disabled:opacity-50", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" }) }), "Xu\u1EA5t TXT"] }), _jsxs("button", { onClick: () => window.print(), className: "inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" }) }), "In"] })] })] }) })] })] })] }));
}
