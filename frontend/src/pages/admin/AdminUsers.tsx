import { useState } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import { userApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import type { User } from "../../types";

export default function AdminUsers() {
  const {
    data: users,
    loading,
    refetch,
  } = useApi<User[]>(() => userApi.getAll());
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = (users || []).filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa người dùng này?")) return;
    setDeleting(id);
    try {
      await userApi.delete(id);
      refetch();
    } finally {
      setDeleting(null);
    }
  };

  const roleColors: Record<string, { bg: string; text: string; border: string }> = {
    admin: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    doctor: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
    patient: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  };

  const roleBadgeColors: Record<string, string> = {
    admin: "bg-gradient-to-r from-red-400 to-rose-500",
    doctor: "bg-gradient-to-r from-sky-400 to-blue-500",
    patient: "bg-gradient-to-r from-emerald-400 to-teal-500",
  };

  const columns = [
    {
      key: "name",
      header: "NGƯỜI DÙNG",
      render: (u: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
            {u.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{u.name}</p>
            <p className="text-xs text-slate-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "VAI TRÒ",
      render: (u: User) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleColors[u.role]?.bg} ${roleColors[u.role]?.text} ${roleColors[u.role]?.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${roleBadgeColors[u.role]}`}></span>
          {u.role === "admin" ? "Quản trị" : u.role === "doctor" ? "Bác sĩ" : "Bệnh nhân"}
        </span>
      ),
    },
    {
      key: "phone",
      header: "ĐIỆN THOẠI",
      render: (u: User) => (
        <span className="text-slate-600">{u.phone || "—"}</span>
      ),
    },
    {
      key: "actions",
      header: "THAO TÁC",
      render: (u: User) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelected(u);
              setShowModal(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-medium text-xs transition-all border border-sky-200"
          >
            Sửa
          </button>
          <button
            onClick={() => handleDelete(u._id)}
            disabled={deleting === u._id}
            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium text-xs transition-all border border-red-200 disabled:opacity-50"
          >
            {deleting === u._id ? "..." : "Xóa"}
          </button>
        </div>
      ),
    },
  ];

  const stats = [
    { label: "Tổng người dùng", value: users?.length || 0, color: "sky" },
    { label: "Bệnh nhân", value: users?.filter((u) => u.role === "patient").length || 0, color: "emerald" },
    { label: "Bác sĩ", value: users?.filter((u) => u.role === "doctor").length || 0, color: "blue" },
    { label: "Quản trị", value: users?.filter((u) => u.role === "admin").length || 0, color: "red" },
  ];

  return (
    <div className="flex h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <AdminSidebar />
      <div className="flex-1 lg:ml-0 min-w-0 overflow-y-auto">
        {/* Glass Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Quản lý Người dùng</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {users?.length || 0} người dùng trong hệ thống
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
              Thêm người dùng
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8 animate-fade-in">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table Card */}
          <div className="card p-0 overflow-hidden animate-scale-in" style={{ animationDelay: "200ms" }}>
            <div className="p-5 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Danh sách người dùng</h2>
                  <p className="text-sm text-slate-400">{filtered.length} người dùng được tìm thấy</p>
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Tìm kiếm người dùng..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table columns={columns} data={filtered} loading={loading} />
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={selected ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
      >
        <UserForm
          user={selected}
          onClose={() => {
            setShowModal(false);
            refetch();
          }}
        />
      </Modal>
    </div>
  );
}

function UserForm({
  user,
  onClose,
}: {
  user: User | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "patient",
    phone: user?.phone || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user) await userApi.update(user._id, form);
      else await userApi.create(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

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
            placeholder="Nhập họ và tên"
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">Vai trò</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <select
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all appearance-none"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as any })}
          >
            <option value="patient">Bệnh nhân</option>
            <option value="doctor">Bác sĩ</option>
            <option value="admin">Quản trị</option>
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
