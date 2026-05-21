import { useState } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import { appointmentApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import type { Appointment } from "../../types";

export default function AdminAppointments() {
  const {
    data: appointments,
    loading,
    refetch,
  } = useApi<Appointment[]>(() => appointmentApi.getAll());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = (appointments || []).filter((apt) => {
    const matchSearch =
      apt.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      apt.doctorName?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || apt.status === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa lịch hẹn này?")) return;
    setDeleting(id);
    try {
      await appointmentApi.delete(id);
      refetch();
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await appointmentApi.update(id, { status: newStatus });
      refetch();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const columns = [
    {
      key: "date",
      header: "DATE",
      render: (apt: Appointment) => (
        <span className="font-medium text-gray-900">{apt.date}</span>
      ),
    },
    {
      key: "patientName",
      header: "PATIENT",
      render: (apt: Appointment) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mint-400 to-dental-500 flex items-center justify-center text-white text-xs font-bold">
            {apt.patient?.name?.charAt(0) || apt.patientName?.charAt(0) || "P"}
          </div>
          <div>
            <p className="font-medium text-gray-900">{apt.patient?.name || apt.patientName}</p>
            <p className="text-xs text-gray-500">{apt.patient?.email || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "doctorName",
      header: "DOCTOR",
      render: (apt: Appointment) => (
        <span className="text-gray-700">Dr. {apt.doctorName}</span>
      ),
    },
    {
      key: "time",
      header: "TIME",
      render: (apt: Appointment) => (
        <span className="text-gray-700 font-medium">{apt.time}</span>
      ),
    },
    {
      key: "service",
      header: "SERVICE",
      render: (apt: Appointment) => (
        <span className="text-gray-700">
          {typeof apt.service === "string" ? apt.service : apt.service?.name}
        </span>
      ),
    },
    {
      key: "status",
      header: "STATUS",
      render: (apt: Appointment) => (
        <select
          value={apt.status}
          onChange={(e) => handleStatusChange(apt.id, e.target.value)}
          className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${
            statusColors[apt.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          <option value="pending">Chờ</option>
          <option value="confirmed">Xác nhận</option>
          <option value="completed">Hoàn tất</option>
          <option value="cancelled">Hủy</option>
        </select>
      ),
    },
    {
      key: "actions",
      header: "ACTIONS",
      render: (apt: Appointment) => (
        <div className="flex gap-3">
          <button
            onClick={() => {
              setSelected(apt);
              setShowModal(true);
            }}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View
          </button>
          <button
            onClick={() => handleDelete(apt.id)}
            disabled={deleting === apt.id}
            className="text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50"
          >
            {deleting === apt.id ? "..." : "Delete"}
          </button>
        </div>
      ),
    },
  ];

  const stats = [
    {
      label: "Tổng lịch hẹn",
      value: appointments?.length || 0,
      color: "blue",
    },
    {
      label: "Đang chờ",
      value: appointments?.filter((a) => a.status === "pending").length || 0,
      color: "amber",
    },
    {
      label: "Xác nhận",
      value: appointments?.filter((a) => a.status === "confirmed").length || 0,
      color: "green",
    },
    {
      label: "Hủy",
      value: appointments?.filter((a) => a.status === "cancelled").length || 0,
      color: "red",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý Lịch hẹn
              </h1>
              <p className="text-gray-600 text-sm">
                {new Date().toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`bg-${stat.color}-50 rounded-lg p-6 border border-${stat.color}-200`}
              >
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color}-600`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="label">Tìm kiếm</label>
                  <input
                    className="input w-full"
                    placeholder="Tìm bệnh nhân hoặc bác sĩ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Trạng thái</label>
                  <select
                    className="input"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="pending">Chờ</option>
                    <option value="confirmed">Xác nhận</option>
                    <option value="completed">Hoàn tất</option>
                    <option value="cancelled">Hủy</option>
                  </select>
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
        title="Chi tiết lịch hẹn"
      >
        {selected && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Bệnh nhân</p>
              <p className="font-medium text-gray-900">
                {selected.patientName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bác sĩ</p>
              <p className="font-medium text-gray-900">
                Dr. {selected.doctorName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ngày & Giờ</p>
              <p className="font-medium text-gray-900">
                {selected.date} lúc {selected.time}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dịch vụ</p>
              <p className="font-medium text-gray-900">
                {typeof selected.service === "string"
                  ? selected.service
                  : selected.service?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Trạng thái</p>
              <p
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  statusColors[selected.status]
                }`}
              >
                {selected.status === "pending"
                  ? "Chờ"
                  : selected.status === "confirmed"
                    ? "Xác nhận"
                    : selected.status === "completed"
                      ? "Hoàn tất"
                      : "Hủy"}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
