import { useState } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import DentalScoreModal from "../../components/DentalScoreModal";
import { patientApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import type { User } from "../../types";

export default function DoctorPatients() {
  const { data: patients, loading } = useApi<User[]>(() => patientApi.getAll());
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);

  const filtered = (patients || []).filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <DoctorSidebar />
      <div className="flex-1 lg:ml-0 min-w-0">
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Bệnh nhân</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {filtered.length} bệnh nhân
            </p>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card card-hover p-5 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{(patients || []).length}</p>
                  <p className="text-sm text-slate-400">Tổng bệnh nhân</p>
                </div>
              </div>
            </div>
            <div className="card card-hover p-5 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{filtered.length}</p>
                  <p className="text-sm text-slate-400">Đang hiển thị</p>
                </div>
              </div>
            </div>
            <div className="card card-hover p-5 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{search ? "..." : "—"}</p>
                  <p className="text-sm text-slate-400">Đang tìm kiếm</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card card-hover p-5 border border-slate-100">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                  placeholder="Tìm kiếm bệnh nhân theo tên hoặc email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-300 hover:bg-slate-400 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-slate-100 rounded-xl p-5 animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-200" />
                      <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded w-24 mb-2" />
                        <div className="h-3 bg-slate-200 rounded w-32" />
                      </div>
                    </div>
                    <div className="h-3 bg-slate-200 rounded w-20" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Không tìm thấy bệnh nhân</h3>
                <p className="text-sm text-slate-400">Thử tìm kiếm với từ khóa khác</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((patient, index) => (
                  <div
                    key={patient._id || index}
                    className="bg-white rounded-xl p-5 border border-slate-100 hover:border-violet-200 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                        {patient.name?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 truncate">
                          {patient.name || "Không có tên"}
                        </h3>
                        <p className="text-sm text-slate-400 truncate">
                          {patient.email || "Không có email"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {patient.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="truncate">{patient.phone}</span>
                        </div>
                      )}
                      {patient.dob && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{patient.dob}</span>
                        </div>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Hoạt động
                    </span>

                    <button
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowScoreModal(true);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      Xem chỉ số răng
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedPatient && (
          <DentalScoreModal
            patient={selectedPatient}
            isOpen={showScoreModal}
            onClose={() => {
              setShowScoreModal(false);
              setSelectedPatient(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
