import { useState } from "react";
import PatientSidebar from "../../components/layout/PatientSidebar";
import Modal from "../../components/ui/Modal";
import { recordApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import type { MedicalRecord } from "../../types";

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  completed:  { label: "Hoàn tất", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  pending:    { label: "Đang điều trị", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-200" },
  followup:   { label: "Tái khám", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" },
};

const typeIconConfig: Record<string, { icon: string; color: string; bg: string }> = {
  examination:  { icon: "🩺", color: "#0ea5e9", bg: "bg-blue-50" },
  treatment:    { icon: "💊", color: "#14b8a6", bg: "bg-teal-50" },
  surgery:      { icon: "🏥", color: "#f43f5e", bg: "bg-rose-50" },
  checkup:      { icon: "✅", color: "#10b981", bg: "bg-emerald-50" },
};

export default function PatientRecords() {
  const { data: records, loading } = useApi<MedicalRecord[]>(() => recordApi.getMine());
  const [selected, setSelected] = useState<MedicalRecord | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filteredRecords = (records || []).filter(r => filter === "all" || (r.status || "completed") === filter);

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <PatientSidebar />
      <div className="flex-1 lg:ml-0 min-w-0">
        {/* Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Hồ sơ bệnh án</h1>
            <p className="text-xs text-slate-400 mt-0.5">{(records || []).length} hồ sơ bệnh án</p>
          </div>
          {/* Status filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {[{ id: "all", label: "Tất cả" }, ...Object.entries(statusConfig).map(([k, v]) => ({ id: k, label: v.label }))].map((f) => {
              const isActive = filter === f.id;
              return (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${isActive ? "text-white shadow-sm" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                  style={isActive ? { background: "linear-gradient(135deg, #0ea5e9, #14b8a6)" } : {}}>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 p-6 lg:p-8">
          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl skeleton" />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filteredRecords.length === 0 && (
            <div className="card text-center py-20 animate-fade-in">
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <p className="font-black text-slate-700 text-lg mb-2">Chưa có hồ sơ bệnh án</p>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                Hồ sơ bệnh án sẽ được tạo sau khi bạn hoàn thành lịch khám với bác sĩ
              </p>
            </div>
          )}

          {/* Records */}
          {!loading && filteredRecords.length > 0 && (
            <div className="space-y-3">
              {filteredRecords.map((r, idx) => {
                const cfg = statusConfig[r.status as keyof typeof statusConfig] || statusConfig.completed;
                const iconCfg = typeIconConfig[r.type as keyof typeof typeIconConfig] || typeIconConfig.examination;
                return (
                  <div key={r.id}
                    onClick={() => setSelected(r)}
                    className="card card-hover cursor-pointer border border-slate-100 animate-fade-in group"
                    style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className="flex items-start gap-4 p-5">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                        style={{ background: `${iconCfg.color}12`, boxShadow: `0 4px 12px ${iconCfg.color}25` }}>
                        {iconCfg.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <p className="font-bold text-slate-800 text-base">{r.diagnosis}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                Dr. {r.doctorName}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>
                                {r.date}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                            {r.prescription && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                                Có đơn thuốc
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                          {r.treatment}
                        </p>
                      </div>

                      {/* Arrow */}
                      <svg className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <Modal open={!!selected} onClose={() => setSelected(null)} title="Chi tiết hồ sơ y tế" size="lg">
          {selected && (
            <div className="space-y-5">
              {/* Header card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)", border: "1px solid #a7f3d0" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", boxShadow: "0 4px 12px rgba(14,165,233,0.25)" }}>
                  🏥
                </div>
                <div>
                  <p className="font-black text-slate-800 text-base">{selected.diagnosis}</p>
                  <p className="text-sm text-teal-600 font-semibold mt-0.5">Dr. {selected.doctorName} · {selected.date}</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Chẩn đoán", value: selected.diagnosis },
                  { label: "Điều trị", value: selected.treatment },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
                    <p className="text-sm font-semibold text-slate-700 bg-slate-50 rounded-xl p-4 leading-relaxed">{value}</p>
                  </div>
                ))}

                {selected.prescription && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Đơn thuốc</p>
                    <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                      <p className="text-sm font-mono text-teal-800 leading-relaxed whitespace-pre-wrap">{selected.prescription}</p>
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

              <button onClick={() => setSelected(null)}
                className="w-full px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition">
                Đóng
              </button>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
