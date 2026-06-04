import { useState, useEffect } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import { shiftApi, dayOffApi, doctorApi, unwrap } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";

const DEFAULT_SHIFT_CONFIG = {
  morning:   { label: "Ca sáng",  range: "08:00–12:00", bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   icon: "🌅" },
  afternoon: { label: "Ca chiều", range: "13:00–17:00", bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-500",  icon: "🌤️" },
  evening:   { label: "Ca tối",    range: "18:00–21:00", bg: "bg-sky-50",     text: "text-sky-700",     dot: "bg-sky-500",     icon: "🌙" },
};

export default function AdminShifts() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"shifts" | "dayoffs" | "configs">("shifts");

  // Fetch shift configs
  const [configs, setConfigs] = useState<any>({
    morning: { label: "Ca sáng", start: "08:00", end: "12:00" },
    afternoon: { label: "Ca chiều", start: "13:00", end: "17:00" },
    evening: { label: "Ca tối", start: "18:00", end: "21:00" },
  });
  const [configsLoading, setConfigsLoading] = useState(false);

  const fetchConfigs = async () => {
    setConfigsLoading(true);
    try {
      const res = await shiftApi.getConfigs();
      const unwrapped = unwrap(res);
      if (unwrapped) {
        setConfigs({
          morning: unwrapped.morning || { label: "Ca sáng", start: "08:00", end: "12:00" },
          afternoon: unwrapped.afternoon || { label: "Ca chiều", start: "13:00", end: "17:00" },
          evening: unwrapped.evening || { label: "Ca tối", start: "18:00", end: "21:00" },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConfigsLoading(false);
    }
  };

  // State arrays
  const { data: shifts, loading: shiftsLoading, refetch: refetchShifts } = useApi<any[]>(() => shiftApi.getAll());
  const { data: doctors } = useApi<any[]>(() => doctorApi.getAll().then(res => res.data));
  const [daysOff, setDaysOff] = useState<any[]>([]);
  const [daysOffLoading, setDaysOffLoading] = useState(false);

  const fetchDaysOff = async () => {
    setDaysOffLoading(true);
    try {
      const res = await dayOffApi.getAll();
      setDaysOff(unwrap(res) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setDaysOffLoading(false);
    }
  };

  useEffect(() => {
    fetchDaysOff();
    fetchConfigs();
  }, []);

  const [filter, setFilter] = useState({ date: "", doctorId: "", shiftType: "" });
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Modals state
  const [showAddShift, setShowAddShift] = useState(false);
  const [showAddDayOff, setShowAddDayOff] = useState(false);

  // Modal forms
  const [shiftForm, setShiftForm] = useState({
    doctorId: "",
    date: "",
    shiftType: "morning",
    maxPatients: 10,
    notes: "",
  });

  const [dayOffForm, setDayOffForm] = useState({
    date: "",
    description: "",
    doctorId: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const filteredShifts = (shifts || []).filter((s) => {
    if (filter.date && s.date !== filter.date) return false;
    if (filter.doctorId && (s.doctor?._id || s.doctor) !== filter.doctorId) return false;
    if (filter.shiftType && s.shiftType !== filter.shiftType) return false;
    return true;
  });

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftForm.doctorId || !shiftForm.date || !shiftForm.shiftType) {
      toast.error("Vui lòng điền đầy đủ thông tin ca trực.");
      return;
    }
    try {
      await shiftApi.create({
        doctorId: shiftForm.doctorId,
        date: shiftForm.date,
        shiftType: shiftForm.shiftType,
        maxPatients: Number(shiftForm.maxPatients || 10),
        notes: shiftForm.notes,
      });
      toast.success("Tạo lịch trực thành công!");
      refetchShifts();
      setShowAddShift(false);
      setShiftForm({ doctorId: "", date: "", shiftType: "morning", maxPatients: 10, notes: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Không thể tạo lịch trực.");
    }
  };

  const handleAddDayOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayOffForm.date || !dayOffForm.description) {
      toast.error("Vui lòng nhập đầy đủ ngày và lý do nghỉ.");
      return;
    }
    try {
      await dayOffApi.create({
        date: dayOffForm.date,
        description: dayOffForm.description,
        doctorId: dayOffForm.doctorId || null,
      });
      toast.success("Thêm ngày nghỉ thành công!");
      fetchDaysOff();
      setShowAddDayOff(false);
      setDayOffForm({ date: "", description: "", doctorId: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Không thể thêm ngày nghỉ.");
    }
  };

  const handleDeleteDayOff = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ngày nghỉ này không?")) return;
    try {
      await dayOffApi.delete(id);
      toast.success("Xóa ngày nghỉ thành công!");
      fetchDaysOff();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Không thể xóa ngày nghỉ.");
    }
  };

  const handleSaveConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        morning: {
          label: configs.morning.label,
          startTime: configs.morning.start,
          endTime: configs.morning.end,
        },
        afternoon: {
          label: configs.afternoon.label,
          startTime: configs.afternoon.start,
          endTime: configs.afternoon.end,
        },
        evening: {
          label: configs.evening.label,
          startTime: configs.evening.start,
          endTime: configs.evening.end,
        },
      };
      await shiftApi.updateConfigs(body);
      toast.success("Cập nhật cấu hình ca trực thành công!");
      fetchConfigs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Không thể cập nhật cấu hình.");
    }
  };

  const columns = [
    {
      key: "doctor",
      header: "Bác sĩ",
      render: (s: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
            {(s.doctorName || s.doctor?.name || "BS").charAt(0)}
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
        const cfg = DEFAULT_SHIFT_CONFIG[s.shiftType as keyof typeof DEFAULT_SHIFT_CONFIG] || DEFAULT_SHIFT_CONFIG.morning;
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
        <div className="flex gap-2">
          <button
            onClick={() => { setSelectedShift(s); setShowDetail(true); }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition">
            Chi tiết
          </button>
          {s.status === "active" && (
            <button
              onClick={async () => {
                if (window.confirm("Bạn có chắc chắn muốn hủy ca trực này không?")) {
                  try {
                    await shiftApi.delete(s.id || s._id);
                    toast.success("Hủy ca trực thành công!");
                    refetchShifts();
                  } catch (err: any) {
                    toast.error(err.response?.data?.message || err.message || "Không thể hủy ca trực.");
                  }
                }
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
              Hủy ca
            </button>
          )}
        </div>
      ),
    },
  ];

  const dayOffColumns = [
    {
      key: "date",
      header: "Ngày nghỉ",
      render: (d: any) => <span className="font-bold text-slate-800 text-base font-mono">{d.date}</span>,
    },
    {
      key: "target",
      header: "Đối tượng nghỉ",
      render: (d: any) => {
        if (d.doctor) {
          return (
            <div className="flex items-center gap-2.5">
              <span className="w-7.5 h-7.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-black flex items-center justify-center shadow-sm">BS</span>
              <span className="text-base font-semibold text-slate-700">Bác sĩ: {d.doctorName || d.doctor?.name || "Bác sĩ"}</span>
            </div>
          );
        }
        return (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
            🏥 Toàn bộ phòng khám
          </span>
        );
      },
    },
    {
      key: "description",
      header: "Lý do / Mô tả",
      render: (d: any) => <span className="text-base font-medium text-slate-600">{d.description || "Nghỉ lễ/hội nghị"}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (d: any) => (
        <button
          onClick={() => handleDeleteDayOff(d.id || d._id)}
          className="px-4.5 py-2 text-sm font-bold rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition shadow-sm border border-red-100 hover:scale-105 active:scale-95 duration-150">
          Xóa
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
        
        {/* Header with Navigation Tabs */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Quản lý lịch trực & ca trực</h1>
            <p className="text-sm text-slate-400 mt-0.5">Quản lý ca trực bác sĩ, thiết lập ngày nghỉ và thời gian biểu</p>
          </div>

          {/* Elegant Tabs switcher */}
          <div className="flex gap-1 p-1 bg-white/60 border border-slate-200/80 rounded-2xl shadow-sm self-start">
            {[
              { id: "shifts", label: "Lịch trực bác sĩ", icon: "📋" },
              { id: "dayoffs", label: "Ngày nghỉ / Lễ", icon: "🏖️" },
              { id: "configs", label: "Cấu hình ca trực", icon: "⚙️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "text-white shadow-md"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
                style={activeTab === tab.id ? { background: "linear-gradient(135deg, #0ea5e9, #14b8a6)" } : {}}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
          
          {/* TAB 1: SHIFTS LIST */}
          {activeTab === "shifts" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Tổng ca trực", value: activeShifts.length, icon: "📋", color: "from-sky-500 to-blue-600" },
                  { label: "Trực hôm nay", value: todayShifts.length, icon: "📅", color: "from-emerald-500 to-green-600" },
                  { label: "Ca sáng", value: morningShifts.length, icon: "🌅", color: "from-amber-500 to-orange-600" },
                  { label: "Ca chiều", value: afternoonShifts.length, icon: "🌤️", color: "from-violet-500 to-purple-600" },
                ].map((item) => (
                  <div key={item.label} className="card card-hover p-5 border border-slate-100/80 bg-white/75 backdrop-blur-md">
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

              {/* Filters & Action Bar */}
              <div className="card p-5 border border-slate-100 bg-white/75 backdrop-blur-md shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ngày</label>
                      <input type="date" className="input"
                        value={filter.date}
                        onChange={(e) => setFilter({ ...filter, date: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Bác sĩ</label>
                      <select className="input"
                        value={filter.doctorId}
                        onChange={(e) => setFilter({ ...filter, doctorId: e.target.value })}>
                        <option value="">Tất cả bác sĩ</option>
                        {(doctors || []).map((d: any) => (
                          <option key={d.id || d._id} value={d.id || d._id}>Dr. {d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ca trực</label>
                      <select className="input"
                        value={filter.shiftType}
                        onChange={(e) => setFilter({ ...filter, shiftType: e.target.value })}>
                        <option value="">Tất cả ca</option>
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

                  <div className="flex items-end">
                    <button
                      onClick={() => setShowAddShift(true)}
                      className="px-5 py-2.5 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-xl transition-all"
                      style={{ background: "linear-gradient(135deg, #0ea5e9, #14b8a6)" }}
                    >
                      Phân lịch trực mới
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="card overflow-hidden border border-slate-100 bg-white/75 backdrop-blur-md shadow-sm">
                <Table columns={columns} data={filteredShifts} loading={shiftsLoading} />
              </div>
            </>
          )}

          {/* TAB 2: DAYS OFF */}
          {activeTab === "dayoffs" && (
            <>
              {/* DayOff actions header */}
              <div className="flex justify-between items-center bg-white/75 backdrop-blur-md p-5 rounded-2xl border border-slate-100/80 shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Ngày nghỉ & Lễ của phòng khám</h3>
                  <p className="text-sm text-slate-400">Các bác sĩ sẽ không thể nhận lịch khám trong những ngày nghỉ được gán.</p>
                </div>
                <button
                  onClick={() => setShowAddDayOff(true)}
                  className="px-5 py-2.5 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-xl transition-all"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #eab308)" }}
                >
                  Thêm ngày nghỉ / lễ
                </button>
              </div>

              {/* DayOff list Table */}
              <div className="card overflow-hidden border border-slate-100 bg-white/75 backdrop-blur-md shadow-sm">
                <Table columns={dayOffColumns} data={daysOff} loading={daysOffLoading} />
              </div>
            </>
          )}

          {/* TAB 3: SHIFT CONFIGS */}
          {activeTab === "configs" && (
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSaveConfigs} className="space-y-6">
                <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-slate-100/80 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Cấu hình khung giờ các ca trực</h3>
                    <p className="text-sm text-slate-400">Thiết lập thời gian bắt đầu và kết thúc chuẩn cho 3 ca chính.</p>
                  </div>

                  {configsLoading ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Morning Config */}
                      <div className="card p-5 border border-slate-100/80 bg-gradient-to-b from-amber-50/40 to-white flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🌅</span>
                          <div>
                            <h4 className="font-bold text-slate-700">Ca sáng</h4>
                            <input
                              type="text"
                              className="input text-xs font-semibold py-1 px-2 border-0 bg-transparent text-slate-400 max-w-[120px]"
                              value={configs.morning.label}
                              onChange={(e) => setConfigs({
                                ...configs,
                                morning: { ...configs.morning, label: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                        <hr className="border-slate-100" />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Giờ bắt đầu</label>
                            <input
                              type="time"
                              className="input font-mono text-sm py-1.5"
                              value={configs.morning.start}
                              onChange={(e) => setConfigs({
                                ...configs,
                                morning: { ...configs.morning, start: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Giờ kết thúc</label>
                            <input
                              type="time"
                              className="input font-mono text-sm py-1.5"
                              value={configs.morning.end}
                              onChange={(e) => setConfigs({
                                ...configs,
                                morning: { ...configs.morning, end: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Afternoon Config */}
                      <div className="card p-5 border border-slate-100/80 bg-gradient-to-b from-violet-50/40 to-white flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🌤️</span>
                          <div>
                            <h4 className="font-bold text-slate-700">Ca chiều</h4>
                            <input
                              type="text"
                              className="input text-xs font-semibold py-1 px-2 border-0 bg-transparent text-slate-400 max-w-[120px]"
                              value={configs.afternoon.label}
                              onChange={(e) => setConfigs({
                                ...configs,
                                afternoon: { ...configs.afternoon, label: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                        <hr className="border-slate-100" />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Giờ bắt đầu</label>
                            <input
                              type="time"
                              className="input font-mono text-sm py-1.5"
                              value={configs.afternoon.start}
                              onChange={(e) => setConfigs({
                                ...configs,
                                afternoon: { ...configs.afternoon, start: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Giờ kết thúc</label>
                            <input
                              type="time"
                              className="input font-mono text-sm py-1.5"
                              value={configs.afternoon.end}
                              onChange={(e) => setConfigs({
                                ...configs,
                                afternoon: { ...configs.afternoon, end: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Evening Config */}
                      <div className="card p-5 border border-slate-100/80 bg-gradient-to-b from-sky-50/40 to-white flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🌙</span>
                          <div>
                            <h4 className="font-bold text-slate-700">Ca tối</h4>
                            <input
                              type="text"
                              className="input text-xs font-semibold py-1 px-2 border-0 bg-transparent text-slate-400 max-w-[120px]"
                              value={configs.evening.label}
                              onChange={(e) => setConfigs({
                                ...configs,
                                evening: { ...configs.evening, label: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                        <hr className="border-slate-100" />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Giờ bắt đầu</label>
                            <input
                              type="time"
                              className="input font-mono text-sm py-1.5"
                              value={configs.evening.start}
                              onChange={(e) => setConfigs({
                                ...configs,
                                evening: { ...configs.evening, start: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Giờ kết thúc</label>
                            <input
                              type="time"
                              className="input font-mono text-sm py-1.5"
                              value={configs.evening.end}
                              onChange={(e) => setConfigs({
                                ...configs,
                                evening: { ...configs.evening, end: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-6 py-3 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all"
                      style={{ background: "linear-gradient(135deg, #0ea5e9, #14b8a6)" }}
                    >
                      Lưu cấu hình ca trực
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Create Shift Modal */}
        <Modal open={showAddShift} onClose={() => setShowAddShift(false)} title="Phân lịch trực bác sĩ">
          <form onSubmit={handleAddShift} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bác sĩ trực</label>
              <select
                className="input"
                value={shiftForm.doctorId}
                onChange={(e) => setShiftForm({ ...shiftForm, doctorId: e.target.value })}
                required
              >
                <option value="">Chọn bác sĩ...</option>
                {(doctors || []).map((d: any) => (
                  <option key={d.id || d._id} value={d.id || d._id}>Dr. {d.name} ({d.specialization || "Nha khoa"})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ngày trực</label>
                <input
                  type="date"
                  className="input"
                  min={today}
                  value={shiftForm.date}
                  onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ca trực</label>
                <select
                  className="input"
                  value={shiftForm.shiftType}
                  onChange={(e) => setShiftForm({ ...shiftForm, shiftType: e.target.value })}
                  required
                >
                  <option value="morning">Ca sáng</option>
                  <option value="afternoon">Ca chiều</option>
                  <option value="evening">Ca tối</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sức chứa (bệnh nhân tối đa)</label>
              <input
                type="number"
                className="input"
                min={1}
                max={50}
                value={shiftForm.maxPatients}
                onChange={(e) => setShiftForm({ ...shiftForm, maxPatients: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ghi chú</label>
              <textarea
                className="input min-h-[80px]"
                placeholder="Ghi chú công việc ca trực nếu có..."
                value={shiftForm.notes}
                onChange={(e) => setShiftForm({ ...shiftForm, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 px-5 py-3 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #14b8a6)" }}
              >
                Tạo lịch trực
              </button>
              <button
                type="button"
                onClick={() => setShowAddShift(false)}
                className="px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition"
              >
                Hủy
              </button>
            </div>
          </form>
        </Modal>

        {/* Create DayOff Modal */}
        <Modal open={showAddDayOff} onClose={() => setShowAddDayOff(false)} title="Thêm ngày nghỉ / lễ">
          <form onSubmit={handleAddDayOff} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Đối tượng nghỉ</label>
              <select
                className="input"
                value={dayOffForm.doctorId}
                onChange={(e) => setDayOffForm({ ...dayOffForm, doctorId: e.target.value })}
              >
                <option value="">Toàn bộ phòng khám (Clinic holiday)</option>
                {(doctors || []).map((d: any) => (
                  <option key={d.id || d._id} value={d.id || d._id}>Chỉ Bác sĩ: Dr. {d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ngày nghỉ</label>
              <input
                type="date"
                className="input"
                value={dayOffForm.date}
                onChange={(e) => setDayOffForm({ ...dayOffForm, date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lý do nghỉ</label>
              <input
                type="text"
                className="input"
                placeholder="Ví dụ: Tết Dương Lịch, Nghỉ mát hè, Tập huấn y tế..."
                value={dayOffForm.description}
                onChange={(e) => setDayOffForm({ ...dayOffForm, description: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 px-5 py-3 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all"
                style={{ background: "linear-gradient(135deg, #f59e0b, #eab308)" }}
              >
                Thêm ngày nghỉ
              </button>
              <button
                type="button"
                onClick={() => setShowAddDayOff(false)}
                className="px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition"
              >
                Hủy
              </button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        <Modal open={showDetail} onClose={() => { setShowDetail(false); setSelectedShift(null); }} title="Chi tiết ca trực">
          {selectedShift && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {(selectedShift.doctorName || selectedShift.doctor?.name || "BS").charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{selectedShift.doctorName || selectedShift.doctor?.name}</h3>
                  <p className="text-sm text-slate-500">{selectedShift.doctor?.email || "Bác sĩ chuyên khoa"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Ngày", value: selectedShift.date, highlight: selectedShift.date === today },
                  { label: "Ca trực", value: (DEFAULT_SHIFT_CONFIG[selectedShift.shiftType as keyof typeof DEFAULT_SHIFT_CONFIG] || DEFAULT_SHIFT_CONFIG.morning).label },
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
                  <p className="text-xs font-bold text-amber-600 uppercase mb-1">Ghi chú ca trực</p>
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
