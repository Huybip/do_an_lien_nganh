import { useState, useEffect } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Table from "../../components/ui/Table";
import { appointmentApi, unwrap } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import type { Appointment } from "../../types";

const SHIFT_CONFIG = {
  morning:   { label: "Ca sáng",  range: "08:00–12:00", bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   icon: "🌅" },
  afternoon: { label: "Ca chiều", range: "13:00–17:00", bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-500",  icon: "🌤️" },
  evening:   { label: "Ca tối",    range: "18:00–21:00", bg: "bg-sky-50",     text: "text-sky-700",     dot: "bg-sky-500",     icon: "🌙" },
};

const statusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  "checked-in": "Đã tiếp đón",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  "no-show": "Không đến",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "checked-in": "bg-violet-50 text-violet-700 border-violet-200",
  completed: "bg-sky-50 text-sky-700 border-sky-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  "no-show": "bg-slate-100 text-slate-600 border-slate-200",
};

export default function AdminCheckin() {
  const { toast } = useToast();
  const { data: appointments, loading, refetch } = useApi<Appointment[]>(() => appointmentApi.getAll());

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "waiting" | "checked-in" | "completed">("all");
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  const todayDate = new Date().toISOString().split("T")[0];

  // Exclusively today's appointments
  const todayAppointments = (appointments || []).filter((apt) => apt.date === todayDate);

  const filtered = todayAppointments.filter((apt) => {
    const matchSearch =
      !search ||
      apt.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      apt.doctorName?.toLowerCase().includes(search.toLowerCase());

    let matchStatus = false;
    if (statusFilter === "all") {
      matchStatus = true;
    } else if (statusFilter === "waiting") {
      matchStatus = apt.status === "pending" || apt.status === "confirmed";
    } else {
      matchStatus = apt.status === statusFilter;
    }

    return matchSearch && matchStatus;
  });

  const handleCheckIn = async (apt: Appointment) => {
    setCheckingInId(apt.id);
    try {
      await appointmentApi.update(apt.id, { status: "checked-in" });
      toast.success(`Đã tiếp đón bệnh nhân "${apt.patientName}" thành công!`);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Tiếp đón bệnh nhân thất bại.");
    } finally {
      setCheckingInId(null);
    }
  };

  // Stats for today
  const totalCount = todayAppointments.length;
  const waitingCount = todayAppointments.filter(a => a.status === "pending" || a.status === "confirmed").length;
  const checkedInCount = todayAppointments.filter(a => a.status === "checked-in").length;
  const completedCount = todayAppointments.filter(a => a.status === "completed").length;

  const columns = [
    {
      key: "patient",
      header: "BỆNH NHÂN",
      render: (apt: Appointment) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-black shadow-md">
            {apt.patientName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{apt.patientName}</p>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">ID: #{apt.id.slice(-6)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "doctor",
      header: "BÁC SĨ PHỤ TRÁCH",
      render: (apt: Appointment) => (
        <span className="flex items-center gap-2 text-slate-700 font-medium">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #14b8a6)" }}>
            {apt.doctorName?.charAt(0).toUpperCase()}
          </span>
          Dr. {apt.doctorName}
        </span>
      ),
    },
    {
      key: "shift",
      header: "CA HẸN",
      render: (apt: Appointment) => {
        const type = (apt as any).shiftType || "morning";
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
      key: "service",
      header: "DỊCH VỤ ĐĂNG KÝ",
      render: (apt: Appointment) => (
        <span className="text-slate-600 text-sm font-semibold max-w-[200px] truncate block" title={apt.serviceName}>
          {apt.serviceName || (typeof apt.service === "string" ? apt.service : apt.service?.name) || "Khám tổng quát"}
        </span>
      ),
    },
    {
      key: "status",
      header: "TRẠNG THÁI",
      render: (apt: Appointment) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusColors[apt.status] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {statusLabels[apt.status] || apt.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "TIẾP ĐÓN",
      render: (apt: Appointment) => {
        const isWaiting = apt.status === "pending" || apt.status === "confirmed";
        if (isWaiting) {
          return (
            <button
              onClick={() => handleCheckIn(apt)}
              disabled={checkingInId === apt.id}
              className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md hover:shadow-lg transition-all"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #14b8a6)" }}
            >
              {checkingInId === apt.id ? "Đang xử lý..." : "Check-in (Tiếp đón)"}
            </button>
          );
        }

        if (apt.status === "checked-in") {
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-3 py-2 rounded-xl">
              🏥 Đã tiếp đón / Chờ khám
            </span>
          );
        }

        if (apt.status === "completed") {
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
              ✅ Đã hoàn tất khám
            </span>
          );
        }

        return (
          <span className="text-slate-400 text-xs italic font-medium">Không thể tiếp đón</span>
        );
      },
    },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <AdminSidebar />
      <div className="flex-1 lg:ml-0 min-w-0">
        
        {/* Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Quầy Tiếp Đón Bệnh Nhân</h1>
            <p className="text-sm text-slate-400 mt-0.5">Tiếp nhận bệnh nhân đến khám ngày hôm nay ({todayDate})</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-all flex items-center gap-2 self-start"
          >
            🔄 Tải lại dữ liệu
          </button>
        </div>

        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Tổng bệnh nhân hôm nay", value: totalCount, icon: "👥", color: "from-sky-500 to-blue-600" },
              { label: "Chờ check-in / tiếp đón", value: waitingCount, icon: "🕒", color: "from-amber-500 to-orange-600" },
              { label: "Đã vào phòng chờ", value: checkedInCount, icon: "🏥", color: "from-violet-500 to-purple-600" },
              { label: "Đã hoàn thành khám", value: completedCount, icon: "✅", color: "from-emerald-500 to-green-600" },
            ].map((item) => (
              <div key={item.label} className="card card-hover p-5 border border-slate-100/80 bg-white/75 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg text-xl`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-800">{item.value}</p>
                    <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="card p-5 border border-slate-100 bg-white/75 backdrop-blur-md shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="flex-1 max-w-md flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-slate-400">🔍</span>
                <input
                  type="text"
                  className="bg-transparent border-0 text-sm w-full focus:outline-none focus:ring-0 text-slate-700 py-1"
                  placeholder="Tìm kiếm bệnh nhân hoặc bác sĩ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch("")} className="text-slate-400 text-xs hover:text-slate-600">×</button>
                )}
              </div>

              {/* Status Filters switcher */}
              <div className="flex gap-1 p-1 bg-white/80 border border-slate-200/85 rounded-2xl shadow-sm self-start">
                {[
                  { id: "all", label: "Tất cả", count: totalCount },
                  { id: "waiting", label: "Chờ tiếp đón", count: waitingCount },
                  { id: "checked-in", label: "Đã tiếp đón", count: checkedInCount },
                  { id: "completed", label: "Hoàn thành", count: completedCount },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                      statusFilter === tab.id
                        ? "text-white shadow-md"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                    style={statusFilter === tab.id ? { background: "linear-gradient(135deg, #0ea5e9, #14b8a6)" } : {}}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* Today's appointments check-in Table */}
          <div className="card overflow-hidden border border-slate-100 bg-white/75 backdrop-blur-md shadow-sm">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Danh Sách Tiếp Đón Ngày Hôm Nay</h3>
            </div>
            <Table columns={columns} data={filtered} loading={loading} />
          </div>

        </div>

      </div>
    </div>
  );
}
