import { useEffect, useState } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import { appointmentApi, patientApi, recordApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler, ArcElement,
} from "chart.js";
import type { Appointment } from "../../types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  confirmed: { label: "Xác nhận", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  pending:   { label: "Chờ duyệt", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  completed:  { label: "Hoàn tất", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  cancelled:  { label: "Đã hủy", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({ patients: 0, todayAppts: 0, records: 0 });
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    Promise.allSettled([
      appointmentApi.getAll(),
      patientApi.getAll(),
      recordApi.getAll(),
    ]).then(([a, p, r]) => {
      const appts: Appointment[] = a.status === "fulfilled" ? a.value.data?.data ?? a.value.data ?? [] : [];
      const today = new Date().toISOString().split("T")[0];
      const todayAppts = appts.filter((x: Appointment) => x.date === today);
      setAllAppointments(appts);
      setStats({
        patients: p.status === "fulfilled" ? (p.value.data?.data ?? p.value.data ?? []).length : 0,
        todayAppts: todayAppts.length,
        records: r.status === "fulfilled" ? (r.value.data?.data ?? r.value.data ?? []).length : 0,
      });
      setUpcoming(appts.filter((x: Appointment) => x.status === "pending" || x.status === "confirmed").slice(0, 5));
      if (todayAppts.length > 0) {
        toast.info(`Hôm nay bạn có ${todayAppts.length} lịch khám: ${todayAppts.map(apt => `${apt.patientName} - ${apt.time}`).join(", ")}`, 5000);
      }
      setLoading(false);
    });
  }, [toast]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buổi sáng tốt lành";
    if (hour < 18) return "Buổi chiều vui vẻ";
    return "Buổi tối an lành";
  };

  const todayLabel = new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const getAppointmentTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(); date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });
    return {
      labels: last7Days.map(d => {
        const date = new Date(d);
        return `T${date.getDate()}`;
      }),
      datasets: [
        {
          label: "Tổng lịch hẹn",
          data: last7Days.map(day => allAppointments.filter(apt => apt.date === day).length),
          fill: true,
          backgroundColor: "rgba(14,165,233,0.08)",
          borderColor: "#0ea5e9",
          tension: 0.4, borderWidth: 2, pointRadius: 4,
          pointBackgroundColor: "#0ea5e9", pointBorderColor: "#fff", pointBorderWidth: 2,
        },
        {
          label: "Lịch xác nhận",
          data: last7Days.map(day => allAppointments.filter(apt => apt.date === day && apt.status === "confirmed").length),
          fill: true,
          backgroundColor: "rgba(16,185,129,0.08)",
          borderColor: "#10b981",
          tension: 0.4, borderWidth: 2, pointRadius: 4,
          pointBackgroundColor: "#10b981", pointBorderColor: "#fff", pointBorderWidth: 2,
        },
      ],
    };
  };

  const getServiceChartData = () => {
    const serviceCount: Record<string, number> = {};
    allAppointments.forEach(apt => {
      const name = typeof apt.service === "string" ? apt.service : apt.service?.name;
      if (name) serviceCount[name] = (serviceCount[name] || 0) + 1;
    });
    const labels = Object.keys(serviceCount).slice(0, 5);
    return {
      labels,
      datasets: [{
        data: labels.map(l => serviceCount[l]),
        backgroundColor: ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
        borderColor: "#fff", borderWidth: 2,
      }],
    };
  };

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <DoctorSidebar />
      <div className="flex-1 lg:ml-0 min-w-0">
        {/* Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:hidden" />
            <div>
              <h1 className="text-xl font-bold text-slate-800">Tổng quan</h1>
              <p className="text-xs text-slate-400 mt-0.5">{todayLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-slate-500">{greeting()},</p>
              <p className="text-sm font-bold text-slate-700">Dr. {user?.name?.split(" ").pop()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}>
              {user?.name?.charAt(0)?.toUpperCase() || "D"}
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">

          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 text-slate-800 animate-fade-in"
            style={{ background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #f3e8ff 100%)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #e9d5ff" }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
            </div>
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <p className="text-violet-600 text-xs font-bold tracking-wide uppercase mb-1">{greeting()}</p>
                <h2 className="text-2xl lg:text-3xl font-black leading-tight text-slate-900">
                  Xin chào, <span style={{ color: "#7c3aed" }}>Dr. {user?.name?.split(" ").pop()}</span>
                </h2>
                <p className="text-slate-500 text-sm mt-2 max-w-md leading-relaxed">
                  Cảm ơn bạn đã làm việc cùng VinaMec. Hãy cùng chăm sóc sức khỏe răng miệng cho bệnh nhân nhé!
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: "Hôm nay", value: `${stats.todayAppts} lịch`, color: "#0ea5e9" },
                  { label: "Bệnh nhân", value: `${stats.patients} BN`, color: "#7c3aed" },
                  { label: "Hồ sơ", value: `${stats.records} HS`, color: "#10b981" },
                ].map((s, i) => (
                  <div key={i} className="px-4 py-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.8)", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <p className="text-lg font-black text-slate-900">{s.value}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Bệnh nhân", value: stats.patients, icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              ), color: "#7c3aed", gradient: "from-violet-50 to-purple-50", borderColor: "border-violet-100" },
              { label: "Lịch hẹn hôm nay", value: stats.todayAppts, icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              ), color: "#0ea5e9", gradient: "from-sky-50 to-blue-50", borderColor: "border-sky-100" },
              { label: "Hồ sơ y tế", value: stats.records, icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              ), color: "#10b981", gradient: "from-emerald-50 to-teal-50", borderColor: "border-emerald-100" },
            ].map((stat, i) => (
              <div key={stat.label}
                className={`card card-hover p-5 border ${stat.borderColor} animate-fade-in stagger-${i + 1}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                    style={{ background: `linear-gradient(135deg, ${stat.color}, ${stat.color}99)`, boxShadow: `0 4px 12px ${stat.color}30` }}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-800">{loading ? "—" : stat.value}</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 card p-6 border border-slate-100 animate-fade-in">
              <h3 className="text-base font-bold text-slate-800 mb-1">Xu hướng lịch hẹn</h3>
              <p className="text-xs text-slate-400 mb-4">7 ngày gần nhất</p>
              <div style={{ height: "260px" }}>
                <Line data={getAppointmentTrendData()} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { position: "top", labels: { usePointStyle: true, padding: 16 } } },
                  scales: { y: { beginAtZero: true, grid: { color: "#f1f5f9" }, ticks: { stepSize: 1 } }, x: { grid: { display: false } } },
                }} />
              </div>
            </div>
            <div className="card p-6 border border-slate-100 animate-fade-in">
              <h3 className="text-base font-bold text-slate-800 mb-1">Phân bổ dịch vụ</h3>
              <p className="text-xs text-slate-400 mb-4">Top 5 dịch vụ</p>
              <div style={{ height: "260px" }}>
                <Pie data={getServiceChartData()} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom", labels: { usePointStyle: true, padding: 12 } } },
                }} />
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="card p-0 border border-slate-100 animate-fade-in">
            <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">Lịch hẹn sắp tới</h3>
                <p className="text-xs text-slate-400 mt-0.5">{upcoming.length} lịch hẹn trong tuần</p>
              </div>
            </div>
            {upcoming.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <p className="font-bold text-slate-600 mb-1">Không có lịch hẹn sắp tới</p>
                <p className="text-sm text-slate-400">Các lịch hẹn sẽ hiển thị ở đây</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {upcoming.map((apt) => {
                  const cfg = statusConfig[apt.status] || statusConfig.pending;
                  const serviceName = typeof apt.service === "string" ? apt.service : apt.service?.name;
                  const date = new Date(apt.date);
                  return (
                    <div key={apt.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition cursor-pointer group">
                      <div className="flex-shrink-0 w-13 h-13 rounded-xl flex flex-col items-center justify-center font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 12px rgba(124,58,237,0.25)", minWidth: "52px", minHeight: "52px" }}>
                        <span className="text-[10px] font-semibold opacity-80 uppercase">{date.toLocaleDateString("vi-VN", { month: "short" })}</span>
                        <span className="text-lg leading-none">{date.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm">{serviceName || "Khám tổng quát"}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                            {apt.patientName}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            {apt.time}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
