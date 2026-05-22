import { useState, useEffect } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import Modal from "../../components/ui/Modal";
import { recordApi, patientApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import type { MedicalRecord } from "../../types";

interface Patient {
  id: string;
  _id: string;
  name: string;
  email: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  completed: { label: "Hoàn tất", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  pending: { label: "Đang điều trị", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-200" },
  followup: { label: "Tái khám", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" },
};

const typeIconConfig: Record<string, { icon: string; color: string; bg: string }> = {
  examination: { icon: "🩺", color: "#8b5cf6", bg: "bg-violet-50" },
  treatment: { icon: "💊", color: "#a855f7", bg: "bg-purple-50" },
  surgery: { icon: "🏥", color: "#c084fc", bg: "bg-fuchsia-50" },
  checkup: { icon: "✅", color: "#9333ea", bg: "bg-violet-50" },
};

export default function DoctorRecords() {
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
      <DoctorSidebar />
      <div className="flex-1 lg:ml-0 min-w-0">
        {/* Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Hồ sơ y tế</h1>
            <p className="text-xs text-slate-400 mt-0.5">{filtered.length} hồ sơ</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter pills */}
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
                    style={isActive ? { background: "linear-gradient(135deg, #7c3aed, #6d28d9)" } : {}}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 14px rgba(109, 40, 217, 0.4)" }}
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
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed15, #6d28d915)" }}>
                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "linear-gradient(135deg, #7c3aed15, #6d28d915)" }}>
                <svg className="w-10 h-10 text-violet-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-black text-slate-700 text-lg mb-2">Không tìm thấy hồ sơ</p>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                {search ? "Thử thay đổi từ khóa tìm kiếm" : "Hồ sơ bệnh án sẽ xuất hiện sau khi bạn tạo"}
              </p>
            </div>
          )}

          {/* Records Grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
                    className="card card-hover cursor-pointer border border-slate-100 animate-fade-in group"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Timeline indicator */}
                    <div className="flex items-start gap-4 p-5">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                          style={{ background: `${iconCfg.color}15`, boxShadow: `0 4px 12px ${iconCfg.color}25` }}>
                          {iconCfg.icon}
                        </div>
                        {/* Timeline line */}
                        {idx < filtered.length - 1 && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-8 -mt-2" style={{ background: "linear-gradient(to bottom, #e2e8f0, transparent)" }} />
                        )}
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
                            Dr. {r.doctorName}
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

                        <div className="flex items-center gap-2 mt-3">
                          {r.prescription && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                              Đơn thuốc
                            </span>
                          )}
                          {r.notes && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Ghi chú
                            </span>
                          )}
                        </div>
                      </div>

                      <svg className="w-5 h-5 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
        <Modal open={showModal} onClose={() => setShowModal(false)} title="Chi tiết hồ sơ y tế" size="lg">
          {selected && (
            <div className="space-y-5">
              {/* Header card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: "linear-gradient(135deg, #faf5ff, #f3e8ff)", border: "1px solid #e9d5ff" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 12px rgba(109,40,217,0.25)" }}>
                  🏥
                </div>
                <div>
                  <p className="font-black text-slate-800 text-base">{selected.diagnosis}</p>
                  <p className="text-sm text-violet-600 font-semibold mt-0.5">Dr. {selected.doctorName} · {selected.date}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Patient info */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed15, #6d28d915)" }}>
                    <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bệnh nhân</p>
                    <p className="text-sm font-semibold text-slate-700">{selected.patientName}</p>
                  </div>
                </div>

                {[
                  { label: "Chẩn đoán", value: selected.diagnosis, icon: "🩺", color: "#7c3aed" },
                  { label: "Điều trị", value: selected.treatment, icon: "💊", color: "#a855f7" },
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
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <p className="text-sm font-mono text-purple-800 leading-relaxed whitespace-pre-wrap">{selected.prescription}</p>
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

              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition"
              >
                Đóng
              </button>
            </div>
          )}
        </Modal>

        {/* Create Form Modal */}
        <Modal open={showForm} onClose={() => setShowForm(false)} title="Tạo hồ sơ y tế mới" size="lg">
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
    diagnosis: "",
    treatment: "",
    prescription: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true);
      try {
        const res = await patientApi.getAll();
        // patientApi.getAll() unwraps to { ...res, data: patients[] }
        // So res.data should be the patients array
        const list: Patient[] = Array.isArray(res.data) ? res.data : [];
        setPatients(list);
        console.log("[fetchPatients] loaded:", list.length, "patients");
      } catch (err: any) {
        console.error("[fetchPatients] error:", err?.response?.data || err);
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Chọn bệnh nhân</label>
        <select
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
          value={form.patientId}
          onChange={(e) => setForm({ ...form, patientId: e.target.value })}
          required
          disabled={loadingPatients}
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Ngày</label>
          <input
            type="date"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            style={{ background: "#fafafa" }}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Chẩn đoán</label>
        <input
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
          placeholder="Nhập chẩn đoán..."
          value={form.diagnosis}
          onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
          required
          style={{ background: "#fafafa" }}
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Điều trị</label>
        <textarea
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition resize-none"
          rows={3}
          placeholder="Mô tả phương pháp điều trị..."
          value={form.treatment}
          onChange={(e) => setForm({ ...form, treatment: e.target.value })}
          required
          style={{ background: "#fafafa" }}
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Đơn thuốc (tùy chọn)</label>
        <textarea
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition resize-none"
          rows={2}
          placeholder="Nhập đơn thuốc nếu có..."
          value={form.prescription}
          onChange={(e) => setForm({ ...form, prescription: e.target.value })}
          style={{ background: "#fafafa" }}
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Ghi chú (tùy chọn)</label>
        <textarea
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition resize-none"
          rows={2}
          placeholder="Thêm ghi chú nếu cần..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ background: "#fafafa" }}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
          disabled={loading || !form.patientId}
          style={{ background: loading || !form.patientId ? "#9ca3af" : "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: loading || !form.patientId ? "none" : "0 4px 14px rgba(109,40,217,0.4)" }}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M5 13l4 4L19 7" />
              </svg>
              Lưu hồ sơ
            </>
          )}
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
