import { useState } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Modal from "../../components/ui/Modal";
import { doctorApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import type { User } from "../../types";

export default function AdminDoctors() {
  const {
    data: doctors,
    loading,
    refetch,
  } = useApi<User[]>(() => doctorApi.getAll());
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = (doctors || []).filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase()),
  );

  const specialties = [
    { name: "Nha chu", color: "from-sky-400 to-blue-500", icon: "🦷" },
    { name: "Chỉnh nha", color: "from-violet-400 to-purple-500", icon: "✨" },
    { name: "Nội nha", color: "from-teal-400 to-emerald-500", icon: "🔧" },
    { name: "Nha phẫu thuật", color: "from-rose-400 to-red-500", icon: "🏥" },
    { name: "Nha kids", color: "from-amber-400 to-orange-500", icon: "👶" },
  ];

  const getSpecialtyInfo = (spec: string) => {
    return specialties.find((s) => s.name.toLowerCase().includes(spec?.toLowerCase() || "")) || specialties[0];
  };

  const stats = [
    { label: "Tổng bác sĩ", value: doctors?.length || 0, color: "sky" },
    { label: "Đang hoạt động", value: doctors?.length || 0, color: "emerald" },
    { label: "Chuyên khoa", value: 5, color: "violet" },
  ];

  return (
    <div className="flex h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <AdminSidebar />
      <div className="flex-1 lg:ml-0 min-w-0 overflow-y-auto">
        {/* Glass Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Quản lý Bác sĩ</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {doctors?.length || 0} bác sĩ trong hệ thống
              </p>
            </div>
            <button
              onClick={() => {
                setSelected(null);
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm bác sĩ
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8 animate-fade-in">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="card card-hover p-5 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br from-${stat.color}-400 to-${stat.color}-500 flex items-center justify-center text-white shadow-lg`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="card card-hover p-4 mb-6 animate-scale-in" style={{ animationDelay: "200ms" }}>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm bác sĩ theo tên hoặc chuyên khoa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
              />
            </div>
          </div>

          {/* Doctor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((doctor, index) => {
              const specialtyInfo = getSpecialtyInfo(doctor.specialization || "");
              return (
                <div
                  key={doctor._id}
                  className="card card-hover p-6 animate-scale-in group"
                  style={{ animationDelay: `${(index + 3) * 100}ms` }}
                >
                  {/* Avatar & Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {doctor.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      Hoạt động
                    </span>
                  </div>

                  {/* Info */}
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{doctor.name}</h3>
                  <p className="text-sm text-slate-500 mb-3">{doctor.email}</p>

                  {/* Specialty Badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${specialtyInfo.color} text-white text-xs font-semibold mb-4`}>
                    <span>{specialtyInfo.icon}</span>
                    {doctor.specialization || "Nha chu tổng quát"}
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 py-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-semibold text-slate-700">4.9</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-slate-700">156</span>
                    </div>
                    <div className="text-xs text-slate-400 ml-auto">{doctor.phone || "—"}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setSelected(doctor);
                        setShowModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-sky-50 text-sky-700 font-semibold rounded-xl hover:bg-sky-100 transition-all border border-sky-200 text-sm"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm("Xóa bác sĩ này?")) {
                          await doctorApi.delete(doctor._id);
                          refetch();
                        }
                      }}
                      className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-all border border-red-200 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && !loading && (
            <div className="card p-12 text-center animate-scale-in">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Không tìm thấy bác sĩ</h3>
              <p className="text-slate-500 text-sm">Thử tìm kiếm với từ khóa khác</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={selected ? "Chỉnh sửa bác sĩ" : "Thêm bác sĩ mới"}
      >
        <DoctorForm
          doctor={selected}
          onClose={() => {
            setShowModal(false);
            refetch();
          }}
        />
      </Modal>
    </div>
  );
}

function DoctorForm({
  doctor,
  onClose,
}: {
  doctor: User | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: doctor?.name || "",
    email: doctor?.email || "",
    phone: doctor?.phone || "",
    specialization: doctor?.specialization || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (doctor) await doctorApi.update(doctor._id, form);
      else await doctorApi.create({ ...form, role: "doctor" });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const specialties = [
    "Nha chu tổng quát",
    "Chỉnh nha",
    "Nội nha",
    "Nha phẫu thuật",
    "Nha phụ khoa",
    "Nha kids",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Họ và tên</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
            placeholder="Nhập họ và tên bác sĩ"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <input
            type="email"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
            placeholder="Nhập địa chỉ email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Số điện thoại</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
            placeholder="Nhập số điện thoại"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Chuyên khoa</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <select
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all appearance-none"
            value={form.specialization}
            onChange={(e) => setForm({ ...form, specialization: e.target.value })}
          >
            {specialties.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <div className="flex gap-3 pt-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </form>
  );
}
