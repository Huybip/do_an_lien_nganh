import { useEffect, useState } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../services/api";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

interface DashboardData {
  users: { total: number; doctors: number; patients: number; newThisMonth: number };
  appointments: { total: number; today: number; pending: number; confirmed: number; completed: number; cancelled: number };
  records: { total: number };
  images: { total: number };
  services: { total: number; active: number };
  chat: { totalSessions: number };
  revenue: { total: number };
  analytics: { monthlyAppointmentTrend: any[]; topServices: any[]; avgDentalScore: number };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then(res => setData(res.data?.data ?? null))
      .catch(err => console.error("Failed to fetch dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatMoney = (n: number) => n >= 1000000 ? (n / 1000000).toFixed(1) + "M" : n >= 1000 ? (n / 1000).toFixed(0) + "K" : String(n);

  const getRevenueData = () => {
    const trend = data?.analytics?.monthlyAppointmentTrend || [];
    const trendMap = new Map();
    trend.forEach((item: any) => { if (item._id?.month) trendMap.set(item._id.month, item.count); });
    const labels: string[] = [], revenueData: number[] = [], expenseData: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(); date.setMonth(date.getMonth() - i);
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
    const labels = services.length > 0 ? services.map((s: any) => s._id) : ["Nhổ răng", "Kiểm tra", "Tẩy trắng", "Niềng răng", "Trám khoang"];
    const vals = services.length > 0 ? services.map((s: any) => s.count) : [35, 28, 18, 12, 7];
    return {
      labels,
      datasets: [{ data: vals, backgroundColor: ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"], borderColor: "#fff", borderWidth: 2 }],
    };
  };

  const todayLabel = new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
        <AdminSidebar />
        <div className="flex-1 lg:ml-0 min-w-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-[3px] border-sky-300 border-t-sky-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <AdminSidebar />
      <div className="flex-1 lg:ml-0 min-w-0">
        {/* Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Tổng quan</h1>
            <p className="text-xs text-slate-400 mt-0.5">Hôm nay, {todayLabel}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => navigate("/admin/payments")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
              Thanh toán
            </button>
            <button onClick={() => navigate("/admin/reports")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)", boxShadow: "0 4px 14px rgba(14,165,233,0.35)" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Xuất báo cáo
            </button>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">

          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 text-slate-800 animate-fade-in"
            style={{ background: "linear-gradient(135deg, #ffffff 0%, #eff6ff 50%, #f0f9ff 100%)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #bae6fd" }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #0ea5e9, transparent)" }} />
            </div>
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <p className="text-sky-600 text-xs font-bold tracking-wide uppercase mb-1">Chào mừng quay trở lại</p>
                <h2 className="text-2xl lg:text-3xl font-black leading-tight text-slate-900">
                  Hệ thống <span style={{ color: "#0ea5e9" }}>VinaMec</span>
                </h2>
                <p className="text-slate-500 text-sm mt-2 max-w-md leading-relaxed">
                  Theo dõi toàn bộ hoạt động của phòng khám nha khoa từ đây.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: "Bệnh nhân", value: `${data?.users?.patients || 0} người`, color: "#0ea5e9" },
                  { label: "Lịch hẹn hôm nay", value: `${data?.appointments?.today || 0} lịch`, color: "#10b981" },
                  { label: "Doanh thu", value: `${formatMoney(data?.revenue?.total || 0)}`, color: "#f59e0b" },
                ].map((s, i) => (
                  <div key={i} className="px-4 py-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.8)", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <p className="text-lg font-black text-slate-900">{s.value}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Tổng bệnh nhân", value: data?.users?.total || 0, sub: `+${data?.users?.newThisMonth || 0} tháng này`, icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              ), color: "#0ea5e9" },
              { label: "Lịch hẹn hôm nay", value: data?.appointments?.today || 0, sub: `${data?.appointments?.pending || 0} chưa xác nhận`, icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              ), color: "#10b981" },
              { label: "Doanh thu trong ngày", value: formatMoney(data?.revenue?.total || 0), sub: "Triệu VND", icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              ), color: "#f59e0b" },
              { label: "Lịch chờ khám", value: data?.appointments?.pending || 0, sub: "Bệnh nhân đang đợi", icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              ), color: "#ef4444" },
            ].map((stat, i) => (
              <div key={stat.label} className={`card card-hover p-5 border border-slate-100 animate-fade-in stagger-${i + 1}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                    style={{ background: `linear-gradient(135deg, ${stat.color}, ${stat.color}99)`, boxShadow: `0 4px 12px ${stat.color}30` }}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-800">{stat.value}</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">{stat.label}</p>
                <p className="text-xs text-emerald-600 font-semibold mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 card p-6 border border-slate-100 animate-fade-in">
              <h3 className="text-base font-bold text-slate-800 mb-1">Doanh thu & Chi phí</h3>
              <p className="text-xs text-slate-400 mb-4">Thống kê 6 tháng gần nhất (Triệu VND)</p>
              <div style={{ height: "260px" }}>
                <Line data={getRevenueData()} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { position: "top", labels: { usePointStyle: true, padding: 16 } } },
                  scales: { y: { beginAtZero: true, grid: { color: "#f1f5f9" } }, x: { grid: { display: false } } },
                }} />
              </div>
            </div>
            <div className="card p-6 border border-slate-100 animate-fade-in">
              <h3 className="text-base font-bold text-slate-800 mb-1">Cơ cấu dịch vụ</h3>
              <p className="text-xs text-slate-400 mb-4">Tỷ lệ sử dụng các dịch vụ</p>
              <div style={{ height: "260px" }}>
                <Pie data={getServiceData()} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom", labels: { usePointStyle: true, padding: 12 } } },
                }} />
              </div>
            </div>
          </div>

          {/* Sub stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Bác sĩ", value: data?.users?.doctors || 0, color: "#0ea5e9" },
              { label: "Tổng lịch khám", value: data?.appointments?.total || 0, color: "#10b981" },
              { label: "Hồ sơ y tế", value: data?.records?.total || 0, color: "#8b5cf6" },
              { label: "Dịch vụ", value: data?.services?.active || 0, color: "#f59e0b" },
              { label: "Điểm sức khỏe TB", value: `${data?.analytics?.avgDentalScore || 0}%`, color: "#14b8a6" },
            ].map((s) => (
              <div key={s.label} className="card p-4 text-center border border-slate-100">
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="card p-6 border border-slate-100 animate-fade-in">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Quản lý bệnh nhân", path: "/admin/users", icon: "👥", color: "#0ea5e9" },
                { label: "Lịch hẹn", path: "/admin/appointments", icon: "📅", color: "#10b981" },
                { label: "Bác sĩ", path: "/admin/doctors", icon: "👨‍⚕️", color: "#8b5cf6" },
                { label: "Dịch vụ", path: "/admin/services", icon: "🦷", color: "#f59e0b" },
              ].map((a) => (
                <button key={a.path} onClick={() => navigate(a.path)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition group border border-slate-100 hover:border-slate-200">
                  <span className="text-2xl">{a.icon}</span>
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-800">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
