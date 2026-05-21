import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import { appointmentApi, patientApi, recordApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement, } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);
export default function DoctorDashboard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [stats, setStats] = useState({
        patients: 0,
        todayAppts: 0,
        records: 0,
    });
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allAppointments, setAllAppointments] = useState([]);
    useEffect(() => {
        Promise.allSettled([
            appointmentApi.getAll(),
            patientApi.getAll(),
            recordApi.getAll(),
        ]).then(([a, p, r]) => {
            const appts = a.status === "fulfilled"
                ? a.value.data?.data || a.value.data || []
                : [];
            const today = new Date().toISOString().split("T")[0];
            const todayAppts = appts.filter((x) => x.date === today);
            setAllAppointments(appts);
            setStats({
                patients: p.status === "fulfilled"
                    ? (p.value.data?.data || p.value.data || []).length
                    : 0,
                todayAppts: todayAppts.length,
                records: r.status === "fulfilled"
                    ? (r.value.data?.data || r.value.data || []).length
                    : 0,
            });
            setUpcoming(appts
                .filter((x) => x.status === "pending" || x.status === "confirmed")
                .slice(0, 5));
            // Check for today's appointments
            if (todayAppts.length > 0) {
                const appointmentsList = todayAppts
                    .map((apt) => `${apt.patientName} - ${apt.time}`)
                    .join(", ");
                toast.info(`🗓️ Hôm nay bạn có ${todayAppts.length} lịch khám: ${appointmentsList}`, 5000);
            }
            setLoading(false);
        });
    }, [toast]);
    // Chart data for appointment trend
    const getAppointmentTrendData = () => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toISOString().split("T")[0];
        });
        const appointmentsPerDay = last7Days.map((day) => allAppointments.filter((apt) => apt.date === day).length);
        const confirmedPerDay = last7Days.map((day) => allAppointments.filter((apt) => apt.date === day && apt.status === "confirmed").length);
        return {
            labels: last7Days.map((d) => {
                const date = new Date(d);
                return `T${date.getDate()}`;
            }),
            datasets: [
                {
                    label: "Tổng lịch hẹn",
                    data: appointmentsPerDay,
                    fill: true,
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    borderColor: "#3b82f6",
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 5,
                    pointBackgroundColor: "#3b82f6",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                },
                {
                    label: "Lịch hẹn xác nhận",
                    data: confirmedPerDay,
                    fill: true,
                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                    borderColor: "#22c55e",
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 5,
                    pointBackgroundColor: "#22c55e",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                },
            ],
        };
    };
    const appointmentChartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: "top",
                labels: { usePointStyle: true, padding: 15 },
            },
            title: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: "#e2e8f0" },
                ticks: { stepSize: 1 },
            },
            x: { grid: { display: false } },
        },
    };
    // Chart data for service distribution
    const getServiceChartData = () => {
        const serviceCount = {};
        allAppointments.forEach((apt) => {
            const serviceName = typeof apt.service === "string" ? apt.service : apt.service?.name;
            if (serviceName) {
                serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
            }
        });
        const labels = Object.keys(serviceCount).slice(0, 5);
        const data = labels.map((label) => serviceCount[label]);
        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: [
                        "#3b82f6",
                        "#14b8a6",
                        "#f59e0b",
                        "#ef4444",
                        "#8b5cf6",
                    ],
                    borderColor: "#fff",
                    borderWidth: 2,
                },
            ],
        };
    };
    const serviceChartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: "right",
                labels: { usePointStyle: true, padding: 20 },
            },
        },
    };
    return (_jsxs("div", { className: "flex", children: [_jsx(DoctorSidebar, {}), _jsxs("div", { className: "flex-1 ml-64", children: [_jsxs("div", { className: "sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "T\u1ED5ng quan" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: new Date().toLocaleDateString("vi-VN", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }) })] }), _jsx("div", { className: "text-right", children: _jsxs("p", { className: "text-sm text-gray-600", children: ["Xin ch\u00E0o,", " ", _jsxs("span", { className: "font-semibold", children: ["Dr. ", user?.name?.split(" ").pop()] })] }) })] }), _jsxs("div", { className: "space-y-6 p-8", children: [_jsxs("div", { className: "card bg-gradient-dental text-white border-0", children: [_jsx("p", { className: "text-dental-100 text-sm", children: "Good morning," }), _jsxs("h2", { className: "font-display font-bold text-2xl mt-1 text-white", children: ["Dr. ", user?.name?.split(" ").pop()] }), _jsxs("p", { className: "text-dental-200 text-sm mt-1", children: ["You have ", stats.todayAppts, " appointments today"] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6 border-l-4 border-purple-500", children: [_jsx("p", { className: "text-sm text-gray-500 font-medium", children: "B\u1EC7nh nh\u00E2n" }), _jsx("p", { className: "text-3xl font-bold text-gray-900 mt-2", children: loading ? "—" : stats.patients })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6 border-l-4 border-blue-500", children: [_jsx("p", { className: "text-sm text-gray-500 font-medium", children: "L\u1ECBch h\u1EB9n h\u00F4m nay" }), _jsx("p", { className: "text-3xl font-bold text-gray-900 mt-2", children: loading ? "—" : stats.todayAppts })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6 border-l-4 border-green-500", children: [_jsx("p", { className: "text-sm text-gray-500 font-medium", children: "H\u1ED3 s\u01A1 y t\u1EBF" }), _jsx("p", { className: "text-3xl font-bold text-gray-900 mt-2", children: loading ? "—" : stats.records })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-2", children: "Xu h\u01B0\u1EDBng l\u1ECBch h\u1EB9n" }), _jsx("p", { className: "text-xs text-gray-500 mb-4", children: "7 ng\u00E0y g\u1EA7n nh\u1EA5t" }), _jsx("div", { style: { height: "300px" }, children: _jsx(Line, { data: getAppointmentTrendData(), options: appointmentChartOptions }) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-2", children: "Ph\u00E2n b\u1ED5 d\u1ECBch v\u1EE5" }), _jsx("p", { className: "text-xs text-gray-500 mb-4", children: "Top 5 d\u1ECBch v\u1EE5" }), _jsx("div", { style: { height: "300px" }, children: _jsx(Pie, { data: getServiceChartData(), options: serviceChartOptions }) })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "L\u1ECBch h\u1EB9n s\u1EAFp t\u1EDBi" }), upcoming.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500 text-center py-8", children: "Kh\u00F4ng c\u00F3 l\u1ECBch h\u1EB9n s\u1EAFp t\u1EDBi" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "border-b border-gray-200", children: _jsxs("tr", { className: "text-gray-600 font-semibold", children: [_jsx("th", { className: "text-left py-3 px-4", children: "B\u1EC7nh nh\u00E2n" }), _jsx("th", { className: "text-left py-3 px-4", children: "Ng\u00E0y" }), _jsx("th", { className: "text-left py-3 px-4", children: "Gi\u1EDD" }), _jsx("th", { className: "text-left py-3 px-4", children: "D\u1ECBch v\u1EE5" }), _jsx("th", { className: "text-left py-3 px-4", children: "Tr\u1EA1ng th\u00E1i" })] }) }), _jsx("tbody", { children: upcoming.map((apt) => (_jsxs("tr", { className: "border-b border-gray-100 hover:bg-gray-50 transition", children: [_jsx("td", { className: "py-3 px-4 font-medium text-gray-900", children: apt.patientName }), _jsx("td", { className: "py-3 px-4 text-gray-600", children: apt.date }), _jsx("td", { className: "py-3 px-4 text-gray-600", children: apt.time }), _jsx("td", { className: "py-3 px-4 text-gray-600", children: typeof apt.service === "string"
                                                                    ? apt.service
                                                                    : apt.service?.name }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: `inline-block px-3 py-1 rounded-full text-xs font-semibold ${apt.status === "confirmed"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : apt.status === "pending"
                                                                            ? "bg-amber-100 text-amber-700"
                                                                            : apt.status === "completed"
                                                                                ? "bg-blue-100 text-blue-700"
                                                                                : "bg-red-100 text-red-700"}`, children: apt.status === "confirmed"
                                                                        ? "Xác nhận"
                                                                        : apt.status === "pending"
                                                                            ? "Chờ"
                                                                            : apt.status === "completed"
                                                                                ? "Hoàn tất"
                                                                                : "Hủy" }) })] }, apt.id))) })] }) }))] })] })] })] }));
}
