import { useState } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import { shiftApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";

const SHIFT_CONFIG = {
  morning:   { label: "Ca sáng",  range: "08:00–12:00", bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   icon: "🌅" },
  afternoon: { label: "Ca chiều", range: "13:00–17:00", bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-500",  icon: "🌤️" },
  evening:   { label: "Ca tối",    range: "18:00–21:00", bg: "bg-sky-50",     text: "text-sky-700",     dot: "bg-sky-500",     icon: "🌙" },
};

export default function AdminShifts() {
  const { data: shifts, loading } = useApi<any[]>(() => shiftApi.getAll());
  const [filter, setFilter] = useState({ date: "", doctorId: "", shiftType: "" });
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const filtered = (shifts || []).filter((s) => {
    if (filter.date && s.date !== filter.date) return false;
    if (filter.doctorId && (s.doctor?._id || s.doctor) !== filter.doctorId) return false;
    if (filter.shiftType && s.shiftType !== filter.shiftType) return false;
    return true;
  });

  const columns = [
    {
      key: "doctor",
      header: "Bác sĩ",
      render: (s: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
            {(s.doctorName || "BS").charAt(0)}
          </div>
          <span className="font-medium text-slate-700">{s.doctorName || s.doctor?.name || "—"}</span>
        </div>
      ),
    },
    {
      key: "date",
      header: "Ngày",
      render: (s: any) => (
        <span className={`text-sm font-mono font-semibold ${s.date < today ? "text-slate-400" : "text-slate-700"}`}>
          {s.date}
          {s.date === today && (
            <span className="ml-2 text-xs font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">Hôm nay</span>
          )}
        </span>
      ),
    },
    {
      key: "shiftType",
      header: "Ca trực",
      render: (s: any) => {
        const cfg = SHIFT_CONFIG[s.shiftType as keyof typeof SHIFT_CONFIG];
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.icon} {cfg.label}
          </span>
        );
      },
    },
    {
      key: "time",
      header: "Giờ",
      render: (s: any) => (
        <span className="text-sm text-slate-500">{s.startTime} – {s.endTime}</span>
      ),
    },
    {
      key: "capacity",
      header: "Sức chứa",
      render: (s: any) => (
        <span className="text-sm font-semibold text-slate-600">{s.maxPatients} bệnh nhân</span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (s: any) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
          s.status === "active"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-red-50 text-red-700"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
          {s.status === "active" ? "Hoạt động" : "Đã hủy"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (s: any) => (
        <button
          onClick={() => { setSelectedShift(s); setShowDetail(true); }}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition">
          Chi tiết
        </button>
      ),
    },
  ];

  // Stats
  const activeShifts = (shifts || []).filter((s) => s.status === "active");
  const todayShifts  = activeShifts.filter((s) => s.date === today);
  const morningShifts  = activeShifts.filter((s) => s.shiftType === "morning");
  const afternoonShifts = activeShifts.filter((s) => s.shiftType === "afternoon");

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <AdminSidebar />
      <div className="flex-1 lg:ml-0 min-w-0">
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Quản lý ca trực</h1>
            <p className="text-sm text-slate-400 mt-0.5">Xem và quản lý lịch trực của bác sĩ</p>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Tổng ca trực", value: activeShifts.length, icon: "📋", color: "from-sky-500 to-blue-600" },
              { label: "Trực hôm nay", value: todayShifts.length, icon: "📅", color: "from-emerald-500 to-green-600" },
              { label: "Ca sáng", value: morningShifts.length, icon: "🌅", color: "from-amber-500 to-orange-600" },
              { label: "Ca chiều", value: afternoonShifts.length, icon: "🌤️", color: "from-violet-500 to-purple-600" },
            ].map((item) => (
              <div key={item.label} className="card card-hover p-5 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg text-xl`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-800">{item.value}</p>
                    <p className="text-xs text-slate-400">{item.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="card card-hover p-5 border border-slate-100">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ngày</label>
                <input type="date" className="input"
                  value={filter.date}
                  onChange={(e) => setFilter({ ...filter, date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ca trực</label>
                <select className="input"
                  value={filter.shiftType}
                  onChange={(e) => setFilter({ ...filter, shiftType: e.target.value })}>
                  <option value="">Tất cả</option>
                  <option value="morning">Ca sáng</option>
                  <option value="afternoon">Ca chiều</option>
                  <option value="evening">Ca tối</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={() => setFilter({ date: "", doctorId: "", shiftType: "" })}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition">
                  Xóa lọc
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden border border-slate-100">
            <Table columns={columns} data={filtered} loading={loading} />
          </div>
        </div>

        {/* Detail Modal */}
        <Modal open={showDetail} onClose={() => { setShowDetail(false); setSelectedShift(null); }} title="Chi tiết ca trực">
          {selectedShift && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {(selectedShift.doctorName || "BS").charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{selectedShift.doctorName || selectedShift.doctor?.name}</h3>
                  <p className="text-sm text-slate-500">{selectedShift.doctor?.email || "Bác sĩ"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Ngày", value: selectedShift.date, highlight: selectedShift.date === today },
                  { label: "Ca trực", value: SHIFT_CONFIG[selectedShift.shiftType as keyof typeof SHIFT_CONFIG]?.label },
                  { label: "Giờ bắt đầu", value: selectedShift.startTime },
                  { label: "Giờ kết thúc", value: selectedShift.endTime },
                  { label: "Sức chứa", value: `${selectedShift.maxPatients} bệnh nhân` },
                  { label: "Trạng thái", value: selectedShift.status === "active" ? "Hoạt động" : "Đã hủy", isStatus: true },
                ].map(({ label, value, highlight, isStatus }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
                    <p className={`text-sm font-semibold ${highlight ? "text-emerald-600" : "text-slate-700"}`}>
                      {isStatus
                        ? <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            selectedShift.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}>
                            {value}
                          </span>
                        : value}
                    </p>
                  </div>
                ))}
              </div>

              {selectedShift.notes && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-amber-600 uppercase mb-1">Ghi chú</p>
                  <p className="text-sm text-slate-700">{selectedShift.notes}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setShowDetail(false); setSelectedShift(null); }}
                  className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
                  Đóng
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
