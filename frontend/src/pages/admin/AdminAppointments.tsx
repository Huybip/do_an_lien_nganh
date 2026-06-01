import { useState, useEffect } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import AppointmentCalendar from "../../components/ui/AppointmentCalendar";
import { appointmentApi, paymentApi, serviceApi, doctorApi, patientApi, shiftApi, dayOffApi, unwrap } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import type { Appointment, Service, User } from "../../types";

interface CompleteResult {
  appointment: Appointment;
  payment: any;
  message: string;
}

interface Patient {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
}

export default function AdminAppointments() {
  const { data: appointments, loading, refetch } = useApi<Appointment[]>(() =>
    appointmentApi.getAll()
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [daysOff, setDaysOff] = useState<any[]>([]);

  useEffect(() => {
    dayOffApi.getAll().then(res => {
      const list = unwrap<any[]>(res?.data ?? res) || [];
      setDaysOff(list);
    }).catch(err => console.error("Failed to load daysOff:", err));
  }, []);

  // Complete + QR modal state
  const [completeResult, setCompleteResult] = useState<CompleteResult | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const todayDate = new Date().toISOString().split("T")[0];

  const filtered = (appointments || []).filter((apt) => {
    const matchSearch =
      !search ||
      apt.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      apt.doctorName?.toLowerCase().includes(search.toLowerCase());
    
    let matchFilter = false;
    if (filter === "all") {
      matchFilter = true;
    } else if (filter === "today") {
      matchFilter = apt.date === todayDate;
    } else {
      matchFilter = apt.status === filter;
    }
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

  const handleCheckIn = async (id: string) => {
    try {
      await appointmentApi.update(id, { status: "checked-in" });
      alert("Đã tiếp đón bệnh nhân thành công!");
      refetch();
    } catch (error) {
      alert("Tiếp đón bệnh nhân thất bại.");
    }
  };

  const handleComplete = async (apt: Appointment) => {
    if (!confirm(`Hoàn thành khám cho bệnh nhân "${apt.patientName}" và tự động tạo hóa đơn tiền mặt?`)) return;
    setCompletingId(apt.id);
    try {
      const res = await appointmentApi.complete(apt.id, {});
      const result = res.data?.data || res.data;
      setCompleteResult(result);
      alert(`Hoàn thành khám cho bệnh nhân "${apt.patientName}" thành công!`);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể hoàn thành lịch hẹn.");
    } finally {
      setCompletingId(null);
    }
  };

  const handlePayAppointment = async (apt: Appointment) => {
    try {
      const res = await paymentApi.getAll();
      const paymentsList = unwrap<any[]>(res?.data ?? res) || [];
      const matchingPayment = paymentsList.find(p => p.appointment?._id === apt.id || p.appointment?.id === apt.id || p.appointment === apt.id);
      if (matchingPayment) {
        setCompleteResult({
          appointment: apt,
          payment: matchingPayment,
          message: "Thực hiện thanh toán lịch khám"
        });
      } else {
        alert("Không tìm thấy phiếu thanh toán của lịch hẹn này.");
      }
    } catch (err) {
      alert("Lỗi khi tìm kiếm phiếu thanh toán.");
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "checked-in": "bg-violet-50 text-violet-700 border-violet-200",
    examining: "bg-indigo-50 text-indigo-700 border-indigo-200",
    completed: "bg-sky-50 text-sky-700 border-sky-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    "no-show": "bg-slate-100 text-slate-600 border-slate-200",
  };

  const statusLabels: Record<string, string> = {
    pending: "Chờ",
    confirmed: "Đã duyệt",
    "checked-in": "Chờ khám",
    examining: "Đang khám",
    completed: "Hoàn tất",
    cancelled: "Hủy",
    "no-show": "Vắng",
  };

  const statusBadgeColors: Record<string, string> = {
    pending: "from-amber-400 to-orange-400",
    confirmed: "from-emerald-400 to-teal-400",
    "checked-in": "from-violet-400 to-purple-500",
    examining: "from-indigo-400 to-violet-500",
    completed: "from-sky-400 to-blue-500",
    cancelled: "from-red-400 to-rose-500",
    "no-show": "from-slate-400 to-gray-500",
  };

  const columns = [
    {
      key: "date",
      header: "NGÀY",
      render: (apt: Appointment) => (
        <span className="font-semibold text-slate-800">{apt.date}</span>
      ),
    },
    {
      key: "patientName",
      header: "BỆNH NHÂN",
      render: (apt: Appointment) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
            {apt.patientName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-slate-700 font-medium">{apt.patientName}</p>
            <p className="text-xs text-slate-400">{apt.patient?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "doctorName",
      header: "BÁC SĨ",
      render: (apt: Appointment) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
            BS
          </div>
          <span className="text-slate-700">Dr. {apt.doctorName}</span>
        </div>
      ),
    },
    {
      key: "time",
      header: "GIỜ KHÁM",
      render: (apt: Appointment) => (
        <span className="text-slate-600 font-semibold bg-slate-50 px-3 py-1 rounded-lg">
          {apt.time}
        </span>
      ),
    },
    {
      key: "service",
      header: "DỊCH VỤ / PHÍ KHÁM",
      render: (apt: Appointment) => (
        <div>
          <p className="text-slate-600 max-w-[200px] truncate" title={apt.serviceName}>
            {apt.serviceName || "Khám nha khoa"}
          </p>
          {(apt.fee || 0) > 0 ? (
            <p className="text-xs text-emerald-600 font-semibold">
              {(apt.fee || 0).toLocaleString("vi-VN")} đ
            </p>
          ) : (
            <p className="text-xs text-slate-400">Chưa có phí</p>
          )}
        </div>
      ),
    },
    {
      key: "isPaid",
      header: "THANH TOÁN",
      render: (apt: Appointment) => (
        apt.isPaid ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đã thanh toán
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Chưa thanh toán
          </span>
        )
      ),
    },
    {
      key: "status",
      header: "TRẠNG THÁI",
      render: (apt: Appointment) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusColors[apt.status] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            apt.status === "pending" ? "bg-amber-500 animate-pulse" :
            apt.status === "confirmed" ? "bg-emerald-500" :
            apt.status === "checked-in" ? "bg-violet-500" :
            apt.status === "examining" ? "bg-indigo-500 animate-pulse" :
            apt.status === "completed" ? "bg-sky-500" : "bg-red-500"
          }`} />
          {statusLabels[apt.status] || apt.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "THAO TÁC",
      render: (apt: Appointment) => (
        <div className="flex gap-1.5 flex-wrap">
          {apt.status === "confirmed" && (
            <button
              onClick={() => handleCheckIn(apt.id)}
              className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold text-xs transition-all border border-sky-200"
            >
              Check-in (Tiếp đón)
            </button>
          )}
          {apt.status === "checked-in" && (
            <button
              onClick={() => handleComplete(apt)}
              disabled={completingId === apt.id}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-200 font-semibold text-xs transition-all disabled:opacity-50"
            >
              {completingId === apt.id ? "..." : "Hoàn thành"}
            </button>
          )}
          {apt.status === "completed" && !apt.isPaid && (
            <button
              onClick={() => handlePayAppointment(apt)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg font-semibold text-xs transition-all"
            >
              💰 Thanh toán
            </button>
          )}
          <button
            onClick={() => { setSelected(apt); setShowModal(true); }}
            className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-medium text-xs transition-all border border-sky-200"
          >
            Chi tiết
          </button>
          <button
            onClick={() => handleDelete(apt.id)}
            disabled={deleting === apt.id}
            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium text-xs transition-all border border-red-200 disabled:opacity-50"
          >
            {deleting === apt.id ? "..." : "Xóa"}
          </button>
        </div>
      ),
    },
  ];

  const stats = [
    {
      label: "Tổng lịch hẹn",
      value: appointments?.length || 0,
      color: "sky",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Đang chờ",
      value: appointments?.filter((a) => a.status === "pending").length || 0,
      color: "amber",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Xác nhận",
      value: appointments?.filter((a) => a.status === "confirmed" || a.status === "checked-in").length || 0,
      color: "emerald",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Hủy",
      value: appointments?.filter((a) => a.status === "cancelled").length || 0,
      color: "red",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const filterPills = [
    { key: "all", label: "Tất cả", count: appointments?.length || 0 },
    { key: "today", label: "Khám hôm nay", count: appointments?.filter((a) => a.date === todayDate).length || 0 },
    { key: "pending", label: "Chờ duyệt", count: appointments?.filter((a) => a.status === "pending").length || 0 },
    { key: "confirmed", label: "Đã duyệt", count: appointments?.filter((a) => a.status === "confirmed").length || 0 },
    { key: "checked-in", label: "Chờ khám", count: appointments?.filter((a) => a.status === "checked-in").length || 0 },
    { key: "completed", label: "Hoàn tất", count: appointments?.filter((a) => a.status === "completed").length || 0 },
    { key: "cancelled", label: "Hủy", count: appointments?.filter((a) => a.status === "cancelled").length || 0 },
  ];

  return (
    <div className="flex h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <AdminSidebar />
      <div className="flex-1 lg:ml-0 min-w-0 overflow-y-auto">
        {/* Glass Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Quản lý Lịch hẹn</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBookingModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M12 4v16m8-8H4" />
                </svg>
                Đặt lịch mới
              </button>
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "table" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Bảng
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "calendar" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Lịch
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8 animate-fade-in">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="card card-hover p-5 animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br from-${stat.color}-400 to-${stat.color}-500 flex items-center justify-center text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Pills & Search */}
          <div className="card card-hover p-5 mb-6 animate-scale-in" style={{ animationDelay: "200ms" }}>
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {filterPills.map((pill) => (
                  <button
                    key={pill.key}
                    onClick={() => setFilter(pill.key)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      filter === pill.key
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {pill.label}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${filter === pill.key ? "bg-white/20" : "bg-slate-200"}`}>
                      {pill.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex-1">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Tìm bệnh nhân hoặc bác sĩ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="card p-0 overflow-hidden animate-scale-in" style={{ animationDelay: "300ms" }}>
            {viewMode === "table" ? (
              <div className="overflow-x-auto">
                <Table columns={columns} data={filtered} loading={loading} />
              </div>
            ) : (
              <div className="p-4 bg-white/70">
                <AppointmentCalendar
                  appointments={filtered}
                  onSelectAppointment={(apt) => {
                    setSelected(apt);
                    setShowModal(true);
                  }}
                  loading={loading}
                  daysOff={daysOff.filter((d: any) => !d.doctor)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Chi tiết lịch hẹn">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-lg font-bold shadow-md">
                {selected.patientName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{selected.patientName}</p>
                <p className="text-sm text-slate-500">Bệnh nhân</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Bác sĩ</p>
                <p className="font-semibold text-slate-700">Dr. {selected.doctorName}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Ngày</p>
                <p className="font-semibold text-slate-700">{selected.date}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Giờ</p>
                <p className="font-semibold text-slate-700">{selected.time}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Phí khám</p>
                <p className="font-semibold text-emerald-700">
                  {(selected.fee || 0) > 0 ? `${(selected.fee || 0).toLocaleString("vi-VN")} đ` : "Chưa có"}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl col-span-2">
                <p className="text-xs text-slate-400 mb-1">Dịch vụ</p>
                <p className="font-semibold text-slate-700">
                  {selected.serviceName || "—"}
                </p>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
              <p className="text-xs text-slate-400 mb-2">Trạng thái</p>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${statusBadgeColors[selected.status] || "from-slate-400 to-gray-500"}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                {statusLabels[selected.status] || selected.status}
              </span>
            </div>
            {selected.isPaid && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-sm font-semibold text-emerald-700">Đã thanh toán</p>
              </div>
            )}
            {selected.doctorNotes && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs text-amber-600 font-bold mb-1">Ghi chú bác sĩ</p>
                <p className="text-sm text-slate-700">{selected.doctorNotes}</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
              >
                Đóng
              </button>
              {selected.status === "confirmed" && (
                <button
                  onClick={() => {
                    handleCheckIn(selected.id);
                    setShowModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Tiếp đón
                </button>
              )}
              {selected.status === "completed" && !selected.isPaid && (
                <button
                  onClick={() => {
                    handlePayAppointment(selected);
                    setShowModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Thanh toán
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Admin Booking Modal */}
      <Modal open={showBookingModal} onClose={() => setShowBookingModal(false)} title="Đặt lịch khám hộ bệnh nhân" size="xl">
        <AdminBookingForm onClose={() => { setShowBookingModal(false); refetch(); }} />
      </Modal>

      {/* Cash Checkout Result Modal */}
      {completeResult?.payment && (
        <CashCheckoutModal
          payment={completeResult.payment}
          appointment={completeResult.appointment}
          onClose={() => { setCompleteResult(null); }}
          onSuccess={() => { setCompleteResult(null); refetch(); }}
        />
      )}
    </div>
  );
}

// ── Admin Booking Form ────────────────────────────────────────────────────────
function AdminBookingForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    shiftType: "",
    notes: "",
  });
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([]);
  const [daysOff, setDaysOff] = useState<any[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Monthly Calendar Navigation & Filter states
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 4, 1)); // May 2026 as show in image, but can navigate
  const [filterMorning, setFilterMorning] = useState(true);
  const [filterAfternoon, setFilterAfternoon] = useState(true);
  const [filterEvening, setFilterEvening] = useState(true);

  useEffect(() => {
    const fetchListsAndShifts = async () => {
      setLoadingLists(true);
      setShiftsLoading(true);
      try {
        const [pRes, dRes, sRes, shRes, doRes] = await Promise.all([
          patientApi.getAll(),
          doctorApi.getAll(),
          serviceApi.getAll(),
          shiftApi.getUpcoming(),
          dayOffApi.getAll(),
        ]);
        setPatients(pRes.data || []);
        setDoctors(dRes.data || []);
        setServices(sRes.data || []);
        setUpcomingShifts(shRes.data || []);
        setDaysOff(unwrap<any[]>(doRes?.data ?? doRes) || []);
      } catch (err) {
        console.error("Failed to load clinical details:", err);
      } finally {
        setLoadingLists(false);
        setShiftsLoading(false);
      }
    };
    fetchListsAndShifts();
  }, []);

  const handleServiceToggle = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectShift = (s: any) => {
    const docId = s.doctorId || s.doctor?._id || s.doctor;
    setForm((prev) => ({
      ...prev,
      doctorId: docId,
      date: s.date,
      shiftType: s.shiftType,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId) { setError("Vui lòng chọn bệnh nhân."); return; }
    if (!form.doctorId) { setError("Vui lòng chọn bác sĩ từ lịch trực."); return; }
    if (!form.date) { setError("Vui lòng chọn ngày khám từ lịch trực."); return; }
    if (!form.shiftType) { setError("Vui lòng chọn ca khám từ lịch trực."); return; }
    if (selectedServiceIds.length === 0) { setError("Vui lòng chọn ít nhất một dịch vụ điều trị."); return; }

    setSubmitting(true);
    setError("");
    try {
      await appointmentApi.create({
        ...form,
        serviceIds: selectedServiceIds,
      });
      alert("Đặt lịch khám thành công!");
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Đặt lịch thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Month navigation
  const prevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  // Generate 42 calendar grid cells (Sunday starts)
  const calendarCells = (() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0-6
    const calendarStart = new Date(firstDay);
    calendarStart.setDate(firstDay.getDate() - startDayOfWeek);

    const cells = [];
    for (let i = 0; i < 42; i++) {
      cells.push(new Date(calendarStart));
      calendarStart.setDate(calendarStart.getDate() + 1);
    }
    return cells;
  })();

  const selectedDoctor = doctors.find((d) => d._id === form.doctorId);

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-h-[80vh] overflow-y-auto pr-1">
      {/* LEFT COLUMN: BOOKING FORM */}
      <form onSubmit={handleSubmit} className="w-full lg:w-[38%] space-y-4 pr-1 border-r border-slate-100 flex flex-col justify-between">
        <div className="space-y-4">
          <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
            Thông tin đặt lịch
          </h4>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-semibold">
              {error}
            </div>
          )}

          {/* Patient Selection */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Bệnh nhân *</label>
            <select
              className="input"
              value={form.patientId}
              onChange={(e) => setForm({ ...form, patientId: e.target.value })}
              required
              disabled={loadingLists}
            >
              <option value="">Tìm tên, SĐT...</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>{p.name} - {p.phone || "—"}</option>
              ))}
            </select>
          </div>

          {/* Date & Shift */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Ngày khám *</label>
              <input
                type="text"
                className="input bg-slate-50 text-slate-600 font-mono font-bold cursor-not-allowed"
                value={form.date || "nn/mm/yyyy"}
                readOnly
                placeholder="nn/mm/yyyy"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Ca khám *</label>
              <input
                type="text"
                className="input bg-slate-50 text-slate-600 font-semibold cursor-not-allowed"
                value={
                  form.shiftType === "morning"
                    ? "Ca sáng"
                    : form.shiftType === "afternoon"
                    ? "Ca chiều"
                    : form.shiftType === "evening"
                    ? "Ca tối"
                    : "— Chọn ca —"
                }
                readOnly
                placeholder="— Chọn ca —"
              />
            </div>
          </div>

          {/* Chosen Doctor Card / Select on calendar alert */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Bác sĩ *</label>
            {selectedDoctor ? (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow">
                  {selectedDoctor.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-emerald-800">Dr. {selectedDoctor.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">{selectedDoctor.specialization || "Nha khoa tổng quát"}</p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-amber-700 text-xs font-semibold flex items-center gap-2">
                <span>👉</span>
                <span>Chọn ca trực trên lịch bên phải</span>
              </div>
            )}
          </div>

          {/* Multiple Services Choice dropdown/grid */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Dịch vụ *</label>
            <div className="grid grid-cols-1 gap-1.5 bg-slate-50 p-3 rounded-xl border max-h-[140px] overflow-y-auto">
              {services.map((s) => {
                const isChecked = selectedServiceIds.includes(s._id);
                return (
                  <label key={s._id} className={`flex items-center gap-2 p-1.5 rounded-lg border cursor-pointer text-xs font-bold transition select-none ${isChecked ? "bg-emerald-50/50 border-emerald-300 text-emerald-800" : "bg-white border-slate-100 text-slate-700"}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleServiceToggle(s._id)}
                      className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                    />
                    <span className="flex-1 truncate">{s.name}</span>
                    <span className="text-emerald-600 shrink-0">{Number(s.price).toLocaleString("vi-VN")} đ</span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-1.5 text-right font-bold">
              Tổng cộng: <span className="text-emerald-600 font-extrabold text-sm">{services.filter(s => selectedServiceIds.includes(s._id)).reduce((sum, s) => sum + s.price, 0).toLocaleString("vi-VN")} đ</span>
            </p>
          </div>

          {/* Symptoms Textarea */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Triệu chứng / Ghi chú</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Mô tả triệu chứng..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4 border-t border-slate-50">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-sm hover:shadow-lg disabled:opacity-50"
          >
            {submitting ? "Đang đặt..." : "Xác nhận đặt lịch"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition"
          >
            Hủy
          </button>
        </div>
      </form>

      {/* RIGHT COLUMN: MONTHLY SHIFTS CALENDAR */}
      <div className="w-full lg:w-[62%] flex flex-col justify-between space-y-4">
        {/* Month picker and shift chips header */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
          {/* Month Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition"
            >
              ‹
            </button>
            <span className="font-bold text-slate-800 text-sm px-2">
              Tháng {calendarDate.getMonth() + 1} {calendarDate.getFullYear()}
            </span>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition"
            >
              ›
            </button>
          </div>

          {/* Shift filter pills */}
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setFilterMorning(!filterMorning)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                filterMorning ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-slate-50 text-slate-400 border-slate-100"
              }`}
            >
              🌅 Ca Sáng
            </button>
            <button
              type="button"
              onClick={() => setFilterAfternoon(!filterAfternoon)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                filterAfternoon ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-400 border-slate-100"
              }`}
            >
              🌤️ Ca Chiều
            </button>
            <button
              type="button"
              onClick={() => setFilterEvening(!filterEvening)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                filterEvening ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-slate-50 text-slate-400 border-slate-100"
              }`}
            >
              🌙 Ca Tối
            </button>
          </div>
        </div>

        {/* Monthly Calendar Grid */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-inner flex-1">
          {/* Weekdays header */}
          <div className="grid grid-cols-7 bg-slate-50 text-center py-2 border-b border-slate-200">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((w) => (
              <span key={w} className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                {w}
              </span>
            ))}
          </div>

          {/* Days grid */}
          {shiftsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-slate-100">
              {calendarCells.map((d, index) => {
                const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                const dayShifts = upcomingShifts.filter((s: any) => s.date === dayStr);
                const visibleShifts = dayShifts.filter((s: any) => {
                  if (s.shiftType === "morning") return filterMorning;
                  if (s.shiftType === "afternoon") return filterAfternoon;
                  if (s.shiftType === "evening") return filterEvening;
                  return true;
                });

                const isCurrentMonth = d.getMonth() === calendarDate.getMonth();
                const clinicDayOff = (daysOff || []).find((dOff: any) => dOff.date === dayStr && !dOff.doctor);

                return (
                  <div
                    key={index}
                    className={`min-h-[72px] p-1.5 flex flex-col justify-between ${
                      isCurrentMonth ? (clinicDayOff ? "bg-rose-50/50" : "bg-white") : "bg-slate-50/50"
                    }`}
                  >
                    {/* Day number */}
                    <div className="text-right">
                      <span className={`text-[10px] font-mono font-extrabold ${isCurrentMonth ? "text-slate-700" : "text-slate-300"}`}>
                        {d.getDate()}
                      </span>
                    </div>

                    {/* Shifts list / Holiday banner */}
                    <div className="space-y-1 mt-1">
                      {clinicDayOff ? (
                        <div className="px-1 py-1 rounded text-[7.5px] font-black text-rose-700 bg-rose-100/50 border border-rose-200/30 text-center truncate select-none" title={`Lịch nghỉ phòng khám: ${clinicDayOff.description}`}>
                          🎉 Nghỉ: {clinicDayOff.description}
                        </div>
                      ) : (
                        visibleShifts.map((s: any) => {
                          const doctorShort = s.doctorName ? s.doctorName.trim().split(" ").pop() : "BS";
                          const doctorDayOff = (daysOff || []).find((dOff: any) => dOff.date === dayStr && dOff.doctor && (dOff.doctor === s.doctorId || dOff.doctor._id === s.doctorId || dOff.doctor === s.doctor?._id || dOff.doctor?._id === s.doctor?._id));
                          const isDoctorOff = !!doctorDayOff;
                          const isFull = s.remaining <= 0 || s.isFull;
                          const isSelected =
                            form.doctorId === (s.doctorId || s.doctor?._id || s.doctor) &&
                            form.date === s.date &&
                            form.shiftType === s.shiftType;

                          // Color config depending on shiftType or if doctor is off
                          let colorClass = "";
                          if (isDoctorOff) {
                            colorClass = "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed line-through opacity-70";
                          } else if (isFull) {
                            colorClass = "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through";
                          } else if (isSelected) {
                            colorClass = "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300 shadow";
                          } else {
                            if (s.shiftType === "morning") {
                              colorClass = "bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100 hover:border-sky-200";
                            } else if (s.shiftType === "afternoon") {
                              colorClass = "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 hover:border-amber-200";
                            } else {
                              colorClass = "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100 hover:border-purple-200";
                            }
                          }

                          return (
                            <div
                              key={s.id || s._id}
                              onClick={() => !isFull && !isDoctorOff && handleSelectShift(s)}
                              className={`px-1 py-0.5 rounded text-[8px] font-black border flex items-center justify-between cursor-pointer select-none transition ${colorClass}`}
                              title={isDoctorOff ? `Dr. ${s.doctorName} nghỉ phép: ${doctorDayOff.description}` : `Dr. ${s.doctorName} | Ca ${s.shiftType === "morning" ? "Sáng" : s.shiftType === "afternoon" ? "Chiều" : "Tối"} | Còn ${s.remaining}/${s.maxPatients} chỗ`}
                            >
                              <span className="truncate">{doctorShort}</span>
                              <span className="font-semibold text-[7px] shrink-0 ml-0.5">
                                {isDoctorOff ? "OFF" : `${s.booked}/${s.maxPatients}`}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10px]">
          <div className="flex gap-3">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              Có thể đặt
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Đang chọn
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              Đã đầy
            </span>
          </div>
          <span className="text-slate-400 font-semibold text-right">
            Nhấp vào ca trực để điền form đặt lịch nhanh chóng
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Cash Checkout Modal ──────────────────────────────────────────────────────
function CashCheckoutModal({
  payment,
  appointment,
  onClose,
  onSuccess
}: {
  payment: any;
  appointment: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [cashReceived, setCashReceived] = useState("");
  const [loading, setLoading] = useState(false);

  const amount = payment.amount || 0;
  const received = Number(cashReceived);
  const change = cashReceived && !isNaN(received) ? Math.max(0, received - amount) : null;
  const isEnough = cashReceived && !isNaN(received) && received >= amount;

  const handleConfirmCash = async () => {
    if (!isEnough) return;
    setLoading(true);
    try {
      await paymentApi.update(payment._id || payment.id, {
        status: "paid",
        notes: `[Thanh toan tien mat] Nhan: ${received.toLocaleString("vi-VN")} đ | Tra lai: ${change?.toLocaleString("vi-VN")} đ`,
      });
      alert(`Thanh toán tiền mặt thành công!\nSố tiền nhận: ${received.toLocaleString("vi-VN")} đ\nTiền thừa trả khách: ${change?.toLocaleString("vi-VN")} đ`);
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || "Thao tác thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    
    // Dynamic mapping of all services inside payment.services
    const serviceItems = payment.services && payment.services.length > 0
      ? payment.services
      : [{ name: appointment.serviceName || "Khám nha khoa", price: amount }];

    const winContent = `
      <html><head><title>Phiếu Thu Tiền Mặt</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 40px; color: #334155; }
        .invoice-card { max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        h2 { color: #0f172a; margin-bottom: 5px; font-weight: 800; }
        .subtitle { color: #64748b; font-size: 14px; margin-bottom: 20px; }
        .divider { border-top: 2px dashed #cbd5e1; margin: 20px 0; }
        .item-row { display: flex; justify-content: space-between; font-size: 14px; margin: 10px 0; }
        .total-row { display: flex; justify-content: space-between; font-weight: 800; font-size: 18px; color: #16a34a; margin-top: 15px; }
        .footer-text { margin-top: 30px; font-size: 12px; color: #94a3b8; }
      </style></head>
      <body>
        <div class="invoice-card">
          <h2>PHÒNG KHÁM NHA KHOA VINAMEC</h2>
          <div class="subtitle">Phiếu Thu Tiền Mặt (Bản In)</div>
          <p style="text-align: left; font-size: 13px;">
            <strong>Mã hóa đơn:</strong> ${payment.invoiceNumber}<br/>
            <strong>Khách hàng:</strong> ${appointment.patientName}<br/>
            <strong>Ngày lập:</strong> ${new Date().toLocaleDateString("vi-VN")}
          </p>
          <div class="divider"></div>
          <p style="text-align: left; font-size: 13px; font-weight: bold; margin-bottom: 10px; color: #475569;">Chi tiết dịch vụ:</p>
          ${serviceItems.map((s: any, idx: number) => `
            <div class="item-row" style="font-size: 13px;">
              <span>${idx + 1}. ${s.name}</span>
              <span>${s.price.toLocaleString("vi-VN")} đ</span>
            </div>
          `).join("")}
          <div class="divider"></div>
          <div class="total-row">
            <span>TỔNG TIỀN:</span>
            <span>${amount.toLocaleString("vi-VN")} đ</span>
          </div>
          ${isEnough ? `
            <div class="divider"></div>
            <div class="item-row" style="color: #64748b;">
              <span>Khách đưa:</span>
              <span>${received.toLocaleString("vi-VN")} đ</span>
            </div>
            <div class="item-row" style="color: #64748b;">
              <span>Trả lại:</span>
              <span>${change?.toLocaleString("vi-VN")} đ</span>
            </div>
          ` : ""}
          <p class="footer-text">Cảm ơn quý khách đã tin tưởng dịch vụ của VinaMec!</p>
        </div>
        <script>window.print();<\/script>
      </body></html>
    `;
    win.document.write(winContent);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">Thanh Toán Tiền Mặt</h2>
              <p className="text-emerald-100 text-xs">Mã hóa đơn: {payment.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-100 hover:text-white text-2xl font-light">✕</button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <p className="font-bold text-emerald-800 text-sm">Đã Hoàn Thành Khám Bệnh!</p>
            <p className="text-xs text-emerald-600 mt-1">Hồ sơ bệnh án và hóa đơn đã được ghi nhận.</p>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-center text-white shadow-md">
            <p className="text-xs text-emerald-100 font-bold uppercase tracking-wider">Số tiền cần thu</p>
            <p className="text-3xl font-black mt-1">
              {amount.toLocaleString("vi-VN")}
              <span className="text-lg font-bold ml-1">VNĐ</span>
            </p>
          </div>

          {/* Checkout calculator */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Số tiền khách đưa (VNĐ)</label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="Ví dụ: 200000"
                className="w-full px-4 py-3 border-2 border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl text-lg font-bold text-slate-800 transition"
              />
            </div>

            {isEnough && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center animate-fade-in">
                <span className="text-sm font-semibold text-slate-500">Tiền thừa trả khách</span>
                <span className="text-xl font-black text-emerald-600">{change?.toLocaleString("vi-VN")} đ</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={handlePrintReceipt} className="py-3 rounded-xl font-semibold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition">
              In phiếu thu
            </button>
            <button onClick={onClose} className="py-3 rounded-xl font-semibold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
              Thanh toán sau
            </button>
          </div>

          <button
            onClick={handleConfirmCash}
            disabled={loading || !isEnough}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: isEnough ? "linear-gradient(135deg, #10b981, #059669)" : "#cbd5e1", boxShadow: isEnough ? "0 4px 14px rgba(16,185,129,0.4)" : "none" }}
          >
            {loading ? "Đang xử lý..." : "Xác nhận đã nhận tiền mặt"}
          </button>
        </div>
      </div>
    </div>
  );
}
