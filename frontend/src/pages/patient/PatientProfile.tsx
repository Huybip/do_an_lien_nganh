import { useState } from "react";
import PatientSidebar from "../../components/layout/PatientSidebar";
import { useAuth } from "../../context/AuthContext";
import { patientApi } from "../../services/api";

export default function PatientProfile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dob: user?.dob || "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user?._id) await patientApi.update(user._id, form);
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <PatientSidebar />
      <div className="flex-1 lg:ml-0 min-w-0">
        {/* Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Hồ sơ của tôi</h1>
            <p className="text-xs text-slate-400 mt-0.5">Quản lý thông tin cá nhân & sức khỏe</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-5 p-6 lg:p-8">

          {/* Success Banner */}
          {success && (
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-semibold text-emerald-700 animate-fade-in"
              style={{ background: "linear-gradient(135deg, #d1fae5, #ecfdf5)", border: "1px solid #a7f3d0" }}>
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              Cập nhật hồ sơ thành công!
            </div>
          )}

          {/* Avatar Card */}
          <div className="card p-6 border border-slate-100 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", boxShadow: "0 8px 24px rgba(14,165,233,0.35)" }}>
                  {user?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white font-bold shadow ring-2 ring-white">
                  <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                </span>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-black text-slate-800">{user?.name}</h2>
                <div className="flex items-center gap-2 mt-1.5 justify-center sm:justify-start flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)", boxShadow: "0 2px 8px rgba(20,184,166,0.3)" }}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    Bệnh nhân
                  </span>
                  <span className="text-sm text-slate-400">{user?.email}</span>
                </div>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="btn-primary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                {editing ? "Hủy" : "Chỉnh sửa"}
              </button>
            </div>
          </div>

          {/* Personal Info */}
          <div className="card p-6 border border-slate-100 animate-fade-in stagger-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #14b8a6)" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-800">Thông tin cá nhân</h3>
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Họ tên", key: "name" as const, type: "text" },
                    { label: "Email", key: "email" as const, type: "email" },
                    { label: "Số điện thoại", key: "phone" as const, type: "tel" },
                    { label: "Ngày sinh", key: "dob" as const, type: "date" },
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
                      <input
                        type={type}
                        className="input"
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-2 flex-wrap">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang lưu...</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Lưu thay đổi</>
                    )}
                  </button>
                  <button type="button" onClick={() => setEditing(false)}
                    className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition">
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Họ tên", value: user?.name, icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  ), color: "#0ea5e9", bg: "bg-blue-50" },
                  { label: "Email", value: user?.email, icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  ), color: "#14b8a6", bg: "bg-teal-50" },
                  { label: "Số điện thoại", value: user?.phone || "Chưa cập nhật", icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  ), color: "#8b5cf6", bg: "bg-violet-50" },
                  { label: "Ngày sinh", value: user?.dob || "Chưa cập nhật", icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>
                  ), color: "#f43f5e", bg: "bg-rose-50" },
                ].map(({ label, value, icon, color, bg }) => (
                  <div key={label} className={`flex items-center gap-3 p-4 rounded-xl ${bg} hover:opacity-80 transition`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, color }}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5 truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Health Summary */}
          <div className="card p-6 border border-slate-100 animate-fade-in stagger-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-800">Tóm tắt sức khỏe</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Nhóm máu", value: "O+", icon: "🩸", color: "#ef4444", bg: "bg-red-50" },
                { label: "Dị ứng", value: "Không", icon: "✅", color: "#22c55e", bg: "bg-green-50" },
                { label: "Lần khám cuối", value: "2024-02-15", icon: "📅", color: "#0ea5e9", bg: "bg-blue-50" },
              ].map(({ label, value, icon, color, bg }) => (
                <div key={label} className={`${bg} rounded-2xl p-4 text-center transition hover:-translate-y-1 hover:shadow-md cursor-default`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 text-xl">
                    {icon}
                  </div>
                  <p className="font-black text-base" style={{ color }}>{value}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
