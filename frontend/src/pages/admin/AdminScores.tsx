import { useState, useEffect } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { patientApi, scoreApi } from "../../services/api";

interface Patient {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  user?: string; // User ID from Patient.user field
}

interface DentalScore {
  _id: string;
  patient: { _id: string; name: string; email: string };
  patientName: string;
  overall: number;
  gumHealth: number;
  toothDecay: number;
  alignment: number;
  cleanliness: number;
  recommendations: string[];
  nextCheckupDate: string;
  lastAssessedBy: { name: string; specialization: string };
  lastAssessedAt: string;
  editHistory?: Array<{
    editedAt: string;
    editedBy: { name: string; specialization: string };
    doctorName: string;
    changes: Record<string, { oldValue: number | string; newValue: number | string }>;
    reason: string;
  }>;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", ring: "ring-emerald-400" };
  if (score >= 60) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", ring: "ring-amber-400" };
  return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", ring: "ring-red-400" };
};

export default function AdminScores() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [scores, setScores] = useState<Map<string, DentalScore>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [, setLoadingPatients] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await patientApi.getAll();
      const list: Patient[] = Array.isArray(res.data) ? res.data : [];
      setPatients(list);

      const scoreMap = new Map<string, DentalScore>();
      await Promise.allSettled(
        list.map(async (p) => {
          const id = p._id || p.id;
          if (!id) return;
          try {
            const sRes = await scoreApi.getByPatient(id);
            const s: DentalScore = sRes.data?.data;
            if (s?._id) scoreMap.set(id, s);
          } catch (_) {}
        })
      );
      setScores(scoreMap);
    } finally {
      setLoading(false);
      setLoadingPatients(false);
    }
  };

  const filtered = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = async (patient: Patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <AdminSidebar />
      <div className="flex-1 lg:ml-0 min-w-0">
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Quản lý điểm sức khỏe răng</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {scores.size} / {patients.length} bệnh nhân có điểm sức khỏe răng
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Làm mới
            </button>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-5">
          {/* Search */}
          <div className="card card-hover p-4 border border-slate-100 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0ea5e915, #0369a115)" }}>
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
                placeholder="Tìm kiếm bệnh nhân theo tên hoặc email..."
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

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Tổng bệnh nhân", value: patients.length, color: "#0ea5e9" },
              { label: "Đã đánh giá", value: scores.size, color: "#10b981" },
              { label: "Chưa đánh giá", value: patients.length - scores.size, color: "#f59e0b" },
              { label: "Điểm TB", value: scores.size > 0 ? Math.round([...scores.values()].reduce((s, x) => s + x.overall, 0) / scores.size) + "%" : "—", color: "#8b5cf6" },
            ].map((s) => (
              <div key={s.label} className="card p-4 text-center border border-slate-100 animate-scale-in">
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl skeleton" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="card text-center py-20 animate-fade-in">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "linear-gradient(135deg, #0ea5e915, #0369a115)" }}>
                <svg className="w-10 h-10 text-sky-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-black text-slate-700 text-lg mb-2">Không tìm thấy bệnh nhân</p>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                {search ? "Thử thay đổi từ khóa tìm kiếm" : "Danh sách bệnh nhân đang trống"}
              </p>
            </div>
          )}

          {/* Patient grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((patient, index) => {
                // userId: the User ID for DentalScore API calls
                // patient.user is a populated object { _id, name, email } from Patient.user field
                const userId = (patient.user as any)?._id || patient._id;
                const score = userId ? scores.get(userId) : null;
                const cfg = score ? getScoreColor(score.overall) : null;

                return (
                  <div
                    key={patient._id || index}
                    className="card card-hover border border-slate-100 animate-fade-in overflow-hidden"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-lg font-bold shadow-md flex-shrink-0">
                          {patient.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate">{patient.name}</p>
                          <p className="text-sm text-slate-400 truncate">{patient.email}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${score ? cfg!.bg + " " + cfg!.text : "bg-slate-100 text-slate-500"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${score ? cfg!.ring?.replace("ring", "bg") : "bg-slate-400"}`} />
                          {score ? "Đã đánh giá" : "Chưa đánh giá"}
                        </span>
                      </div>

                      {score ? (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {[
                            { label: "Tổng", value: score.overall },
                            { label: "Nướu", value: score.gumHealth },
                            { label: "Sạch", value: score.cleanliness },
                          ].map((item) => {
                            const c = getScoreColor(item.value);
                            return (
                              <div key={item.label} className={`text-center p-2 rounded-lg border ${c.bg} ${c.border}`}>
                                <p className="text-lg font-black" style={{ color: c.text.replace("text-", "") === "emerald-700" ? "#047857" : c.text.replace("text-", "") === "amber-700" ? "#b45309" : "#b91c1c" }}>{item.value}</p>
                                <p className="text-[10px] font-semibold text-slate-400">{item.label}</p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-lg p-3 mb-4 text-center">
                          <p className="text-xs text-slate-400">Chưa có điểm sức khỏe răng</p>
                        </div>
                      )}

                      <button
                        onClick={() => handleOpen(patient)}
                        className="w-full px-4 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95"
                        style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)", boxShadow: "0 4px 12px rgba(14,165,233,0.35)" }}
                      >
                        {score ? "Cập nhật điểm răng" : "Tạo điểm răng"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedPatient && (
        <ScoreModal
          patient={selectedPatient}
          open={showModal}
          onClose={() => { setShowModal(false); setSelectedPatient(null); }}
          onSaved={() => loadData()}
        />
      )}
    </div>
  );
}

interface ScoreModalProps {
  patient: Patient;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function ScoreModal({ patient, open, onClose, onSaved }: ScoreModalProps) {
  const [score, setScore] = useState<DentalScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [formData, setFormData] = useState({
    overall: 70, gumHealth: 70, toothDecay: 70,
    alignment: 70, cleanliness: 70,
    recommendations: "", nextCheckupDate: "", reason: "",
  });

  // userId: the User ID for DentalScore API calls
  const patientId = (patient.user as any)?._id || patient._id;

  const loadScore = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const res = await scoreApi.getByPatient(patientId);
      const s: DentalScore = res.data?.data;
      setScore(s);
      if (s) {
        setFormData({
          overall: s.overall ?? 70,
          gumHealth: s.gumHealth ?? 70,
          toothDecay: s.toothDecay ?? 70,
          alignment: s.alignment ?? 70,
          cleanliness: s.cleanliness ?? 70,
          recommendations: s.recommendations?.join(", ") || "",
          nextCheckupDate: s.nextCheckupDate || "",
          reason: "",
        });
      }
    } catch {
      // No score yet — that's ok, we'll create one
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) { loadScore(); setIsEditing(false); }
  }, [open]);

  const handleSave = async () => {
    if (!patientId) return;
    if (isEditing && !formData.reason.trim()) {
      alert("Vui lòng nhập lý do chỉnh sửa");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        overall: Number(formData.overall),
        gumHealth: Number(formData.gumHealth),
        toothDecay: Number(formData.toothDecay),
        alignment: Number(formData.alignment),
        cleanliness: Number(formData.cleanliness),
        recommendations: formData.recommendations
          .split(",").map((r) => r.trim()).filter(Boolean),
        nextCheckupDate: formData.nextCheckupDate || null,
        reason: formData.reason,
      };

      await scoreApi.editScore(patientId, payload);
      await loadScore();
      setIsEditing(false);
      setFormData((prev) => ({ ...prev, reason: "" }));
      onSaved();
    } catch (err: any) {
      alert(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Điểm sức khỏe răng</h2>
            <p className="text-sm text-slate-500 mt-1">{patient.name} · {patient.email}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
        </div>

        <div className="p-6">
          {loading && !score && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-sky-400 border-t-sky-600 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-slate-500 text-center">Đang tải...</p>
            </div>
          )}

          {score && (
            <>
              {/* Score cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Tổng thể", key: "overall", color: "#0ea5e9" },
                  { label: "Sức khỏe nướu", key: "gumHealth", color: "#10b981" },
                  { label: "Sâu răng", key: "toothDecay", color: "#ef4444" },
                  { label: "Răng đều", key: "alignment", color: "#8b5cf6" },
                  { label: "Vệ sinh", key: "cleanliness", color: "#f59e0b" },
                ].map(({ label, key, color }) => {
                  const val = (score as any)[key] ?? 70;
                  const c = getScoreColor(val);
                  return (
                    <div key={key} className={`p-4 rounded-lg border ${c.bg} ${c.border}`}>
                      <p className="text-xs text-slate-500 mb-1">{label}</p>
                      {isEditing ? (
                        <input
                          type="number" min={0} max={100}
                          value={(formData as any)[key]}
                          onChange={(e) => setFormData({ ...formData, [key]: Number(e.target.value) })}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-lg font-bold text-center"
                        />
                      ) : (
                        <p className="text-2xl font-black" style={{ color }}>{val}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Last assessed */}
              {score.lastAssessedAt && (
                <div className="bg-slate-50 p-3 rounded-lg mb-4 text-sm text-slate-600">
                  <span className="font-medium">Đánh giá lần cuối:</span>{" "}
                  {new Date(score.lastAssessedAt).toLocaleDateString("vi-VN")}
                  {score.lastAssessedBy?.name && <> bởi {score.lastAssessedBy.name}</>}
                </div>
              )}

              {/* Edit form */}
              {isEditing && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1">Ngày tái khám</label>
                    <input
                      type="date"
                      value={formData.nextCheckupDate}
                      onChange={(e) => setFormData({ ...formData, nextCheckupDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1">Khuyến nghị (phân cách bằng dấu phẩy)</label>
                    <textarea
                      value={formData.recommendations}
                      onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                      placeholder="Ví dụ: Chải răng 2 lần/ngày, Dùng chỉ nha khoa"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-20 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-800 mb-1">Lý do chỉnh sửa *</label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Tại sao bạn thay đổi điểm số?"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-20 resize-none"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Recommendations (read-only) */}
              {!isEditing && score.recommendations?.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                  <p className="font-medium text-slate-800 mb-2 text-sm">Khuyến nghị:</p>
                  <ul className="space-y-1">
                    {score.recommendations.map((r, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next checkup */}
              {!isEditing && score.nextCheckupDate && (
                <div className="bg-amber-50 p-3 rounded-lg mb-6 border border-amber-200 text-sm text-slate-800">
                  <span className="font-medium">Tái khám:</span> {score.nextCheckupDate}
                </div>
              )}

              {/* Edit history */}
              {score.editHistory && score.editHistory.length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                  >
                    {showHistory ? "Ẩn" : "Xem"} lịch sử chỉnh sửa ({score.editHistory.length})
                  </button>
                  {showHistory && (
                    <div className="mt-3 space-y-2 bg-slate-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                      {score.editHistory.map((h, i) => (
                        <div key={i} className="text-xs border-l-2 border-sky-300 pl-3">
                          <p className="font-semibold text-slate-700">{h.doctorName} — {new Date(h.editedAt).toLocaleDateString("vi-VN")}</p>
                          <p className="text-slate-400">{h.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {!isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(true)} className="flex-1 btn-primary">
                      Chỉnh sửa điểm
                    </button>
                    <button onClick={onClose} className="flex-1 btn-secondary">Đóng</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50"
                    >
                      {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); setFormData((p) => ({ ...p, reason: "" })); }}
                      className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition"
                    >
                      Hủy
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
