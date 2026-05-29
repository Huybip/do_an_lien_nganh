import { useState, useEffect } from "react"; // Admin Records Page
import AdminSidebar from "../../components/layout/AdminSidebar";
import Modal from "../../components/ui/Modal";
import { recordApi, patientApi, doctorApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import type { MedicalRecord } from "../../types";

interface Patient {
  id: string;
  _id: string;
  name: string;
  email: string;
}

interface Doctor {
  id: string;
  _id: string;
  name: string;
  email: string;
  specialization?: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  completed: { label: "Hoàn tất", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  pending: { label: "Đang điều trị", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-200" },
  followup: { label: "Tái khám", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" },
};

const typeIconConfig: Record<string, { icon: string; color: string; bg: string }> = {
  examination: { icon: "🩺", color: "#0ea5e9", bg: "bg-sky-50" },
  treatment: { icon: "💊", color: "#10b981", bg: "bg-emerald-50" },
  surgery: { icon: "🏥", color: "#f59e0b", bg: "bg-amber-50" },
  checkup: { icon: "✅", color: "#8b5cf6", bg: "bg-violet-50" },
};

export default function AdminRecords() {
  const { data: records, loading, refetch } = useApi<MedicalRecord[]>(() => recordApi.getAll());
  const [selected, setSelected] = useState<MedicalRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = (records || []).filter((r) => {
    const matchesSearch =
      r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
      r.treatment?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || r.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <AdminSidebar />
      <div className="flex-1 lg:ml-0 min-w-0">
        {/* Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Quản lý Bệnh án</h1>
            <p className="text-xs text-slate-400 mt-0.5">{filtered.length} hồ sơ bệnh án</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white rounded-xl p-1 border border-slate-100 shadow-sm">
              {[
                { id: "all", label: "Tất cả" },
                { id: "examination", label: "🩺 Khám" },
                { id: "treatment", label: "💊 Điều trị" },
                { id: "surgery", label: "🏥 Phẫu thuật" },
              ].map((f) => {
                const isActive = filter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                    style={isActive ? { background: "linear-gradient(135deg, #0ea5e9, #0284c7)" } : {}}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)", boxShadow: "0 4px 14px rgba(14, 165, 233, 0.4)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M12 4v16m8-8H4" />
              </svg>
              Tạo mới
            </button>
          </div>
        </div>

        <div className="space-y-4 p-6 lg:p-8">
          {/* Search bar */}
          <div className="card card-hover p-4 border border-slate-100 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0ea5e915, #0284c715)" }}>
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
                placeholder="Tìm kiếm hồ sơ theo tên bệnh nhân, chẩn đoán, hoặc điều trị..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex items-center justify-center transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl skeleton" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="card text-center py-20 animate-fade-in">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "linear-gradient(135deg, #0ea5e915, #0284c715)" }}>
                <svg className="w-10 h-10 text-sky-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-black text-slate-700 text-lg mb-2">Không tìm thấy hồ sơ bệnh án nào</p>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                {search ? "Thử thay đổi từ khóa tìm kiếm" : "Hồ sơ bệnh án sẽ xuất hiện sau khi được tạo"}
              </p>
            </div>
          )}

          {/* Records Grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
              {filtered.map((r, idx) => {
                const cfg = statusConfig[r.status as keyof typeof statusConfig] || statusConfig.completed;
                const iconCfg = typeIconConfig[r.type as keyof typeof typeIconConfig] || typeIconConfig.examination;
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelected(r);
                      setShowModal(true);
                    }}
                    className="card card-hover cursor-pointer border border-slate-100 animate-fade-in group bg-white/70"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-start gap-4 p-5">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                          style={{ background: `${iconCfg.color}15`, boxShadow: `0 4px 12px ${iconCfg.color}25` }}>
                          {iconCfg.icon}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 text-base line-clamp-1">{r.diagnosis}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {r.patientName}
                              </span>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            BS: {r.doctorName}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                            {r.date}
                          </span>
                        </div>

                        <p className="text-sm text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                          {r.treatment}
                        </p>
                      </div>

                      <svg className="w-5 h-5 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <Modal open={showModal} onClose={() => setShowModal(false)} title="Chi tiết bệnh án" size="lg">
          {selected && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-sky-50 border border-sky-200">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-2xl flex-shrink-0 shadow-md">
                  🩺
                </div>
                <div>
                  <p className="font-black text-slate-800 text-base">{selected.diagnosis}</p>
                  <p className="text-sm text-sky-600 font-semibold mt-0.5">Bác sĩ: {selected.doctorName} · {selected.date}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bệnh nhân</p>
                      <p className="text-sm font-semibold text-slate-700">{selected.patientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hình thức</p>
                      <p className="text-sm font-semibold text-slate-700 capitalize">{selected.type || "Khám bệnh"}</p>
                    </div>
                  </div>
                </div>

                {[
                  { label: "Chẩn đoán", value: selected.diagnosis, icon: "🩺" },
                  { label: "Phương pháp điều trị", value: selected.treatment, icon: "💊" },
                ].map(({ label, value, icon }) => (
                  <div key={label}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
                    <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-4">
                      <span className="text-lg">{icon}</span>
                      <p className="text-sm font-semibold text-slate-700 leading-relaxed">{value}</p>
                    </div>
                  </div>
                ))}

                {selected.prescription && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Đơn thuốc</p>
                    <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                      <p className="text-sm font-mono text-sky-800 leading-relaxed whitespace-pre-wrap">{selected.prescription}</p>
                    </div>
                  </div>
                )}

                {selected.notes && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ghi chú</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{selected.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (confirm("Bạn có chắc chắn muốn xóa bệnh án này không?")) {
                      await recordApi.delete(selected.id);
                      setShowModal(false);
                      refetch();
                    }
                  }}
                  className="px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold text-sm hover:bg-red-100 transition"
                >
                  Xóa bệnh án
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition text-center"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Create Form Modal */}
        <Modal open={showForm} onClose={() => setShowForm(false)} title="Tạo hồ sơ bệnh án mới" size="lg">
          <RecordForm
            onClose={() => {
              setShowForm(false);
              refetch();
            }}
          />
        </Modal>
      </div>
    </div>
  );
}

function RecordForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    type: "examination",
    diagnosis: "",
    treatment: "",
    prescription: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(() => {
    const fetchLists = async () => {
      setLoadingLists(true);
      try {
        const [patRes, docRes] = await Promise.all([patientApi.getAll(), doctorApi.getAll()]);
        setPatients(Array.isArray(patRes.data) ? patRes.data : []);
        setDoctors(Array.isArray(docRes.data) ? docRes.data : []);
      } catch (err: any) {
        console.error("[fetchLists] error:", err);
      } finally {
        setLoadingLists(false);
      }
    };
    fetchLists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await recordApi.create(form);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Lưu hồ sơ thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Chọn bệnh nhân *</label>
          <select
            className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 transition"
            value={form.patientId}
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            required
            disabled={loadingLists}
            style={{ background: "#fafafa" }}
          >
            <option value="">Chọn bệnh nhân...</option>
            {patients.map((p) => (
              <option key={p.id || p._id} value={p.id || p._id}>
                {p.name} - {p.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Bác sĩ phụ trách *</label>
          <select
            className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 transition"
            value={form.doctorId}
            onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
            required
            disabled={loadingLists}
            style={{ background: "#fafafa" }}
          >
            <option value="">Chọn bác sĩ điều trị...</option>
            {doctors.map((d) => (
              <option key={d.id || d._id} value={d.id || d._id}>
                Dr. {d.name} - {d.specialization || "General Dentistry"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Hình thức khám</label>
          <select
            className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 transition"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            required
            style={{ background: "#fafafa" }}
          >
            <option value="examination">🩺 Khám bệnh</option>
            <option value="treatment">💊 Điều trị</option>
            <option value="surgery">🏥 Phẫu thuật</option>
            <option value="checkup">✅ Kiểm tra định kỳ</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Ngày khám</label>
          <input
            type="date"
            className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 transition"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            style={{ background: "#fafafa" }}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Chẩn đoán *</label>
        <input
          className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 transition"
          placeholder="Chẩn đoán lâm sàng..."
          value={form.diagnosis}
          onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
          required
          style={{ background: "#fafafa" }}
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Phương pháp điều trị *</label>
        <textarea
          className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 transition resize-none"
          rows={3}
          placeholder="Mô tả các thao tác điều trị đã tiến hành..."
          value={form.treatment}
          onChange={(e) => setForm({ ...form, treatment: e.target.value })}
          required
          style={{ background: "#fafafa" }}
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Đơn thuốc (Tùy chọn)</label>
        <textarea
          className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 transition resize-none"
          rows={2}
          placeholder="Liều lượng, tên thuốc..."
          value={form.prescription}
          onChange={(e) => setForm({ ...form, prescription: e.target.value })}
          style={{ background: "#fafafa" }}
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Ghi chú thêm (Tùy chọn)</label>
        <textarea
          className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 transition resize-none"
          rows={2}
          placeholder="Lưu ý phục hồi, dặn dò..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ background: "#fafafa" }}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
          disabled={loading || !form.patientId || !form.doctorId}
          style={{ background: loading || !form.patientId || !form.doctorId ? "#9ca3af" : "linear-gradient(135deg, #0ea5e9, #0284c7)", boxShadow: loading || !form.patientId || !form.doctorId ? "none" : "0 4px 14px rgba(14,165,233,0.4)" }}
        >
          {loading ? "Đang xử lý..." : "Lưu bệnh án"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
