import { useState } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import { shiftApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import type { Appointment } from "../../types";

const SHIFT_CONFIG = {
  morning:   { label: "Ca sáng",   range: "08:00–12:00", bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500"   },
  afternoon: { label: "Ca chiều",  range: "13:00–17:00", bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  dot: "bg-violet-500"  },
  evening:   { label: "Ca tối",    range: "18:00–21:00", bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     dot: "bg-sky-500"     },
};

const statusConfig = {
  active:    { label: "Hoạt động", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { label: "Đã hủy",    bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500"     },
};

export default function DoctorShifts() {
  const { data: shifts, loading, refetch } = useApi<any[]>(() => shiftApi.getMine());
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [viewType, setViewType] = useState<"cards" | "table">("cards");
  const [filter, setFilter] = useState<"all" | "active" | "cancelled">("active");
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const filtered = (shifts || []).filter(
    (s) => filter === "all" || s.status === filter
  );

  const handleCreate = async (data: any) => {
    setSubmitting(true);
    try {
      await shiftApi.create(data);
      toast.success("Đăng ký ca trực thành công!");
      setShowModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedShift) return;
    setSubmitting(true);
    try {
      await shiftApi.cancel(selectedShift.id);
      toast.success("Đã hủy ca trực.");
      setShowCancelModal(false);
      setSelectedShift(null);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Hủy ca trực thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: "date",
      header: "Ngày",
      render: (s: any) => (
        <span className={`text-sm font-mono font-semibold ${s.date < today ? "text-slate-400" : "text-slate-700"}`}>
          {s.date}
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
            {cfg.label} ({cfg.range})
          </span>
        );
      },
    },
    {
      key: "maxPatients",
      header: "Sức chứa",
      render: (s: any) => (
        <span className="text-sm font-semibold text-slate-600">{s.maxPatients} bệnh nhân</span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (s: any) => {
        const cfg = statusConfig[s.status as keyof typeof statusConfig];
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: "notes",
      header: "Ghi chú",
      render: (s: any) => (
        <span className="text-sm text-slate-500 italic">{s.notes || "—"}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (s: any) =>
        s.status === "active" && s.date >= today ? (
          <button
            onClick={() => { setSelectedShift(s); setShowCancelModal(true); }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
          >
            Hủy ca
          </button>
        ) : null,
    },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <DoctorSidebar />
      <div className="flex-1 lg:ml-0 min-w-0">
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Ca trực của tôi</h1>
            <p className="text-xs text-slate-400 mt-0.5">{(shifts || []).length} ca trực đã đăng ký</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1 p-1 rounded-xl bg-white border border-slate-200 shadow-sm">
              {(["active", "cancelled", "all"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    filter === f
                      ? "text-white shadow"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  style={filter === f ? { background: "linear-gradient(135deg, #7c3aed, #6d28d9)" } : {}}>
                  {f === "active" ? "Đang hoạt động" : f === "cancelled" ? "Đã hủy" : "Tất cả"}
                </button>
              ))}
            </div>
            <div className="flex gap-1 p-1 rounded-xl bg-white border border-slate-200 shadow-sm">
              {(["cards", "table"] as const).map((v) => (
                <button key={v} onClick={() => setViewType(v)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewType === v ? "text-white shadow" : "text-slate-500 hover:text-slate-700"}`}
                  style={viewType === v ? { background: "linear-gradient(135deg, #7c3aed, #6d28d9)" } : {}}>
                  {v === "cards" ? "Thẻ" : "Bảng"}
                </button>
              ))}
            </div>
            <button onClick={() => setShowModal(true)}
              className="btn-emerald flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M12 4v16m8-8H4"/>
              </svg>
              Đăng ký ca trực
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6 lg:p-8">
          {/* Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: "morning",   label: "Ca sáng",   color: "from-amber-500 to-orange-600",   icon: "🌅", count: (shifts || []).filter(s => s.shiftType === "morning" && s.status === "active").length },
              { key: "afternoon", label: "Ca chiều",  color: "from-violet-500 to-purple-600",  icon: "🌤️", count: (shifts || []).filter(s => s.shiftType === "afternoon" && s.status === "active").length },
              { key: "evening",   label: "Ca tối",    color: "from-sky-500 to-blue-600",       icon: "🌙", count: (shifts || []).filter(s => s.shiftType === "evening" && s.status === "active").length },
            ].map((item) => (
              <div key={item.key} className="card card-hover p-5 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg text-2xl`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-800">{item.count}</p>
                    <p className="text-sm text-slate-400">{item.label} đang hoạt động</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-600 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-lg font-bold text-slate-600">Chưa có ca trực nào</h3>
              <p className="text-slate-400 mt-2 text-sm">Nhấn "Đăng ký ca trực" để bắt đầu</p>
            </div>
          ) : viewType === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((shift) => {
                const cfg = SHIFT_CONFIG[shift.shiftType as keyof typeof SHIFT_CONFIG];
                const sc   = statusConfig[shift.status as keyof typeof statusConfig];
                const isPast = shift.date < today;
                return (
                  <div key={shift.id} className={`card p-5 border-2 transition-all hover:shadow-lg ${
                    shift.status === "cancelled"
                      ? "border-slate-200 opacity-60"
                      : isPast
                      ? "border-slate-200 opacity-70"
                      : `${cfg.border} bg-gradient-to-br from-white to-slate-50`
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span className={`text-sm font-mono font-semibold ${isPast ? "text-slate-400" : "text-slate-700"}`}>
                          {shift.date} ({new Date(shift.date).toLocaleDateString("vi-VN", { weekday: "short" })})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span className="text-sm text-slate-500">{shift.startTime} – {shift.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
                        </svg>
                        <span className="text-sm text-slate-500">Tối đa {shift.maxPatients} bệnh nhân</span>
                      </div>
                      {shift.notes && (
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                          <span className="text-xs text-slate-400 italic">{shift.notes}</span>
                        </div>
                      )}
                    </div>

                    {shift.status === "active" && shift.date >= today && (
                      <div className="pt-3 border-t border-slate-100">
                        <button
                          onClick={() => { setSelectedShift(shift); setShowCancelModal(true); }}
                          className="w-full py-2.5 text-xs font-semibold rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center justify-center gap-2">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                          Hủy ca trực
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card overflow-hidden">
              <Table columns={columns} data={filtered} loading={loading} />
            </div>
          )}
        </div>

        {/* Create Shift Modal */}
        <Modal open={showModal} onClose={() => setShowModal(false)} title="Đăng ký ca trực">
          <ShiftForm onSubmit={handleCreate} onClose={() => setShowModal(false)} loading={submitting} />
        </Modal>

        {/* Cancel Confirm Modal */}
        <Modal open={showCancelModal} onClose={() => { setShowCancelModal(false); setSelectedShift(null); }} title="Xác nhận hủy ca trực">
          {selectedShift && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Bạn có chắc chắn muốn hủy ca trực này?</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Hành động này không thể hoàn tác.
                    {selectedShift.status !== "active" && " Ca này đã bị hủy trước đó."}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Ca</span>
                  <span className="font-semibold text-slate-700">
                    {SHIFT_CONFIG[selectedShift.shiftType as keyof typeof SHIFT_CONFIG]?.label}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Ngày</span>
                  <span className="font-semibold text-slate-700">{selectedShift.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Giờ</span>
                  <span className="font-semibold text-slate-700">{selectedShift.startTime} – {selectedShift.endTime}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={submitting}
                  className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
                >
                  {submitting ? "Đang hủy..." : "Xác nhận hủy"}
                </button>
                <button
                  onClick={() => { setShowCancelModal(false); setSelectedShift(null); }}
                  className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Quay lại
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

// ── Shift Registration Form ──────────────────────────────────────────────────
function ShiftForm({ onSubmit, onClose, loading }: { onSubmit: (d: any) => void; onClose: () => void; loading: boolean }) {
  const [form, setForm] = useState({
    date: "",
    shiftType: "morning",
    maxPatients: 5,
    notes: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.date) { setError("Vui lòng chọn ngày."); return; }
    onSubmit(form);
  };

  const shiftTypes = [
    { value: "morning",   label: "🌅 Ca sáng (08:00–12:00)", desc: "Buổi sáng" },
    { value: "afternoon", label: "🌤️ Ca chiều (13:00–17:00)", desc: "Buổi chiều" },
    { value: "evening",   label: "🌙 Ca tối (18:00–21:00)", desc: "Buổi tối" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-semibold">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ngày trực</label>
        <input type="date" className="input"
          value={form.date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chọn ca</label>
        <div className="grid grid-cols-1 gap-2">
          {shiftTypes.map((st) => {
            const cfg = SHIFT_CONFIG[st.value as keyof typeof SHIFT_CONFIG];
            return (
              <label key={st.value}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  form.shiftType === st.value ? `${cfg.border} ${cfg.bg}` : "border-slate-200 hover:border-slate-300 bg-white"
                }`}>
                <input type="radio" name="shiftType" value={st.value}
                  checked={form.shiftType === st.value}
                  onChange={() => setForm({ ...form, shiftType: st.value })}
                  className="w-4 h-4 accent-violet-600" />
                <div>
                  <p className={`text-sm font-bold ${form.shiftType === st.value ? cfg.text : "text-slate-700"}`}>{st.label}</p>
                  <p className="text-xs text-slate-400">{st.desc}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Số bệnh nhân tối đa <span className="text-slate-300">(mặc định: 5)</span>
        </label>
        <input type="number" className="input" min="1" max="20"
          value={form.maxPatients}
          onChange={(e) => setForm({ ...form, maxPatients: Number(e.target.value) })} />
        <div className="flex gap-2 mt-2">
          {[3, 5, 8, 10].map((n) => (
            <button type="button" key={n}
              onClick={() => setForm({ ...form, maxPatients: n })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                form.maxPatients === n
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ghi chú (tùy chọn)</label>
        <textarea className="input resize-none" rows={2}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="VD: Ca trực đặc biệt, lưu ý riêng..." />
      </div>

      <div className="flex gap-3 pt-2 flex-wrap">
        <button type="submit" disabled={loading}
          className="btn-primary flex-1 justify-center disabled:opacity-50">
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang đăng ký...</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M5 13l4 4L19 7"/>
            </svg> Đăng ký ca trực</>
          )}
        </button>
        <button type="button" onClick={onClose}
          className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition">
          Hủy
        </button>
      </div>
    </form>
  );
}
