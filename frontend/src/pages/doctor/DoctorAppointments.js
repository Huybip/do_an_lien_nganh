import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import AppointmentCalendar from "../../components/ui/AppointmentCalendar";
import { appointmentApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
const statusColor = {
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-violet-50 text-violet-700",
    completed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700",
};
const approvalColor = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
};
export default function DoctorAppointments() {
    const { data: appointments, loading, refetch, } = useApi(() => appointmentApi.getAll());
    const { toast } = useToast();
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [filter, setFilter] = useState("all");
    const [actionLoading, setActionLoading] = useState(false);
    const [viewType, setViewType] = useState("calendar");
    // Complete + QR modal state
    const [completingId, setCompletingId] = useState(null);
    const [confirmingId, setConfirmingId] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [completeResult, setCompleteResult] = useState(null);
    const today = new Date().toISOString().split("T")[0];
    const todayCount = (appointments || []).filter((a) => a.date === today && a.status !== "cancelled").length;
    const filtered = (appointments || []).filter((a) => filter === "all" || a.status === filter);
    const updateStatus = async (id, status) => {
        try {
            setActionLoading(true);
            await appointmentApi.update(id, { status });
            toast.success("Appointment updated successfully");
            refetch();
        }
        catch (error) {
            toast.error("Failed to update appointment");
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleApprove = async (id) => {
        try {
            setActionLoading(true);
            await appointmentApi.approve(id);
            toast.success("Appointment approved successfully");
            refetch();
            setShowModal(false);
            setSelected(null);
        }
        catch (error) {
            toast.error("Failed to approve appointment");
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleComplete = async (apt) => {
        try {
            setCompletingId(apt.id);
            const res = await appointmentApi.complete(apt.id, {});
            const result = res.data?.data;
            setCompleteResult(result);
            setShowQRModal(true);
            setShowModal(false);
            refetch();
        }
        catch (err) {
            toast.error(err.response?.data?.message || "Khong the hoan thanh lich hen.");
        }
        finally {
            setCompletingId(null);
        }
    };
    const handleConfirmPayment = async (paymentId) => {
        setConfirmingId(paymentId);
        try {
            const { paymentApi: pApi } = await import("../../services/api");
            await pApi.confirmQR(paymentId);
            toast.success("Da xac nhan thanh toan thanh cong!");
            setShowQRModal(false);
            setCompleteResult(null);
            refetch();
        }
        catch (err) {
            toast.error(err.response?.data?.message || "Xac nhan that bai.");
        }
        finally {
            setConfirmingId(null);
        }
    };
    const handleReject = async (id) => {
        try {
            if (!rejectReason.trim()) {
                toast.error("Vui long nhap ly do tu choi.");
                return;
            }
            setActionLoading(true);
            await appointmentApi.reject(id, { reason: rejectReason });
            toast.success("Appointment rejected successfully");
            refetch();
            setShowModal(false);
            setShowRejectModal(false);
            setRejectReason("");
            setSelected(null);
        }
        catch (error) {
            toast.error("Failed to reject appointment");
        }
        finally {
            setActionLoading(false);
        }
    };
    const columns = [
        {
            key: "patientName",
            header: "Bệnh nhân",
            render: (a) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md", children: a.patientName?.charAt(0) }), _jsx("span", { className: "font-medium text-slate-700", children: a.patientName })] })),
        },
        {
            key: "service",
            header: "Dịch vụ",
            render: (a) => (_jsx("span", { className: "text-slate-600", children: typeof a.service === "string"
                    ? a.service
                    : a.service?.name || "Khám tổng quát" })),
        },
        { key: "date", header: "Ngày", render: (a) => (_jsx("span", { className: "text-slate-600", children: a.date })) },
        {
            key: "shiftType",
            header: "Ca khám",
            render: (a) => {
                const type = a.shiftType || "morning";
                const SHIFT_MAP = {
                    morning: { label: "Sáng", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", icon: "🌅" },
                    afternoon: { label: "Chiều", bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500", icon: "🌤️" },
                    evening: { label: "Tối", bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500", icon: "🌙" },
                };
                const cfg = SHIFT_MAP[type] || SHIFT_MAP.morning;
                return (_jsxs("span", { className: `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${cfg.dot}` }), cfg.icon, " ", cfg.label] }));
            },
        },
        { key: "time", header: "Giờ", render: (a) => (_jsx("span", { className: "text-slate-600", children: a.time })) },
        {
            key: "approvalStatus",
            header: "Phê duyệt",
            render: (a) => (_jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${approvalColor[a.approvalStatus || "pending"]}`, children: [a.approvalStatus === "approved" && (_jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) })), a.approvalStatus === "rejected" && (_jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) })), (a.approvalStatus || "pending") === "pending" ? "Đang chờ" : a.approvalStatus === "approved" ? "Đã duyệt" : "Đã từ chối"] })),
        },
        {
            key: "status",
            header: "Trạng thái",
            render: (a) => (_jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColor[a.status]}`, children: [a.status === "pending" && "⏳", a.status === "confirmed" && "✓", a.status === "completed" && "✅", a.status === "cancelled" && "✕", a.status === "pending" ? "Chờ xác nhận" : a.status === "confirmed" ? "Đã xác nhận" : a.status === "completed" ? "Hoàn thành" : "Đã hủy"] })),
        },
        {
            key: "actions",
            header: "Hành động",
            render: (a) => (_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => {
                            setSelected(a);
                            setShowModal(true);
                        }, className: "px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors", children: "Chi ti\u1EBFt" }), a.approvalStatus === "pending" && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => handleApprove(a.id), className: "px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors", disabled: actionLoading, children: "Duy\u1EC7t" }), _jsx("button", { onClick: () => {
                                    setSelected(a);
                                    setShowRejectModal(true);
                                }, className: "px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors", disabled: actionLoading, children: "T\u1EEB ch\u1ED1i" })] })), a.status === "confirmed" &&
                        a.approvalStatus === "approved" && (_jsx("button", { onClick: () => handleComplete(a), className: "px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors", disabled: completingId === a.id, children: completingId === a.id ? "..." : "Hoan thanh" }))] })),
        },
    ];
    const filters = [
        { key: "all", label: "Tất cả" },
        { key: "pending", label: "Chờ xác nhận" },
        { key: "confirmed", label: "Đã xác nhận" },
        { key: "completed", label: "Hoàn thành" },
        { key: "cancelled", label: "Đã hủy" },
    ];
    return (_jsxs("div", { className: "flex min-h-screen", style: { background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }, children: [_jsx(DoctorSidebar, {}), _jsxs("div", { className: "flex-1 lg:ml-0 min-w-0", children: [_jsx("div", { className: "glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-slate-800", children: "L\u1ECBch h\u1EB9n" }), _jsx("p", { className: "text-sm text-slate-400 mt-0.5", children: "Qu\u1EA3n l\u00FD l\u1ECBch h\u1EB9n kh\u00E1m b\u1EC7nh" })] }) }), _jsxs("div", { className: "p-6 lg:p-8 space-y-6 animate-fade-in", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx("div", { className: "card card-hover p-5 border border-slate-100", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg", children: _jsx("svg", { className: "w-5 h-5 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-slate-800", children: todayCount }), _jsx("p", { className: "text-sm text-slate-400", children: "L\u1ECBch h\u1EB9n h\u00F4m nay" })] })] }) }), _jsx("div", { className: "card card-hover p-5 border border-slate-100", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg", children: _jsx("svg", { className: "w-5 h-5 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-slate-800", children: (appointments || []).filter((a) => a.status === "pending").length }), _jsx("p", { className: "text-sm text-slate-400", children: "Ch\u1EDD x\u00E1c nh\u1EADn" })] })] }) }), _jsx("div", { className: "card card-hover p-5 border border-slate-100", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg", children: _jsx("svg", { className: "w-5 h-5 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-slate-800", children: (appointments || []).filter((a) => a.status === "completed").length }), _jsx("p", { className: "text-sm text-slate-400", children: "Ho\u00E0n th\u00E0nh" })] })] }) })] }), _jsxs("div", { className: "card card-hover p-5 border border-slate-100", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-4 mb-5", children: [_jsxs("div", { className: "flex gap-2 bg-slate-100 p-1 rounded-xl", children: [_jsx("button", { onClick: () => setViewType("calendar"), className: `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${viewType === "calendar"
                                                            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md"
                                                            : "text-slate-600 hover:text-slate-900"}`, children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }), "L\u1ECBch"] }) }), _jsx("button", { onClick: () => setViewType("table"), className: `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${viewType === "table"
                                                            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md"
                                                            : "text-slate-600 hover:text-slate-900"}`, children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 10h16M4 14h16M4 18h16" }) }), "Danh s\u00E1ch"] }) })] }), viewType === "table" && (_jsx("div", { className: "flex flex-wrap gap-2", children: filters.map((f) => (_jsxs("button", { onClick: () => setFilter(f.key), className: `px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${filter === f.key
                                                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`, children: [f.label, f.key !== "all" && (_jsx("span", { className: `ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${filter === f.key ? "bg-white/20" : "bg-slate-200"}`, children: (appointments || []).filter((a) => a.status === f.key).length })), f.key === "all" && (_jsx("span", { className: `ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${filter === f.key ? "bg-white/20" : "bg-slate-200"}`, children: (appointments || []).length }))] }, f.key))) }))] }), viewType === "calendar" ? (_jsx("div", { className: "rounded-xl overflow-hidden", children: _jsx(AppointmentCalendar, { appointments: appointments || [], onSelectAppointment: (apt) => {
                                                setSelected(apt);
                                                setShowModal(true);
                                            }, loading: loading }) })) : (_jsx("div", { className: "rounded-xl overflow-hidden", children: _jsx(Table, { columns: columns, data: filtered, loading: loading }) }))] })] }), _jsx(Modal, { open: showModal, onClose: () => setShowModal(false), title: "Chi ti\u1EBFt l\u1ECBch h\u1EB9n", children: selected && (_jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center gap-4 mb-4", children: [_jsx("div", { className: "w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg", children: selected.patientName?.charAt(0) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-slate-800", children: selected.patientName }), _jsx("p", { className: "text-sm text-slate-500", children: "B\u1EC7nh nh\u00E2n" })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColor[selected.status]}`, children: [selected.status === "pending" && "⏳", selected.status === "confirmed" && "✓", selected.status === "completed" && "✅", selected.status === "cancelled" && "✕", selected.status === "pending" ? "Chờ xác nhận" : selected.status === "confirmed" ? "Đã xác nhận" : selected.status === "completed" ? "Hoàn thành" : "Đã hủy"] }), _jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${approvalColor[selected.approvalStatus || "pending"]}`, children: [selected.approvalStatus === "approved" && "✓", selected.approvalStatus === "rejected" && "✕", (selected.approvalStatus || "pending") === "pending" ? "Đang chờ duyệt" : selected.approvalStatus === "approved" ? "Đã duyệt" : "Đã từ chối"] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-slate-50 rounded-xl p-4", children: [_jsx("p", { className: "text-xs text-slate-400 font-medium mb-1", children: "Ng\u00E0y" }), _jsx("p", { className: "text-sm font-semibold text-slate-700", children: selected.date })] }), _jsxs("div", { className: "bg-slate-50 rounded-xl p-4", children: [_jsx("p", { className: "text-xs text-slate-400 font-medium mb-1", children: "Ca kh\u00E1m" }), _jsx("p", { className: "text-sm font-semibold text-slate-700", children: selected.time })] }), _jsxs("div", { className: "bg-slate-50 rounded-xl p-4", children: [_jsx("p", { className: "text-xs text-slate-400 font-medium mb-1", children: "B\u00E1c s\u0129" }), _jsx("p", { className: "text-sm font-semibold text-slate-700", children: selected.doctorName || "—" })] }), _jsxs("div", { className: "bg-slate-50 rounded-xl p-4", children: [_jsx("p", { className: "text-xs text-slate-400 font-medium mb-1", children: "D\u1ECBch v\u1EE5" }), _jsx("p", { className: "text-sm font-semibold text-slate-700", children: typeof selected.service === "string"
                                                        ? selected.service
                                                        : selected.service?.name || "Khám tổng quát" })] })] }), selected.notes && (_jsxs("div", { className: "bg-amber-50 rounded-xl p-4", children: [_jsx("p", { className: "text-xs text-amber-600 font-medium mb-1", children: "Ghi ch\u00FA b\u1EC7nh nh\u00E2n" }), _jsx("p", { className: "text-sm text-slate-700", children: selected.notes })] })), selected.doctorNotes && (_jsxs("div", { className: "bg-violet-50 rounded-xl p-4", children: [_jsx("p", { className: "text-xs text-violet-600 font-medium mb-1", children: "Ghi ch\u00FA b\u00E1c s\u0129" }), _jsx("p", { className: "text-sm text-slate-700", children: selected.doctorNotes })] })), selected.rejectionReason && (_jsxs("div", { className: "bg-red-50 rounded-xl p-4", children: [_jsx("p", { className: "text-xs text-red-600 font-medium mb-1", children: "L\u00FD do t\u1EEB ch\u1ED1i" }), _jsx("p", { className: "text-sm text-slate-700", children: selected.rejectionReason })] })), _jsxs("div", { className: "flex gap-3 pt-2 flex-wrap", children: [selected.approvalStatus === "pending" && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => handleApprove(selected.id), className: "flex-1 min-w-fit px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95", style: { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }, disabled: actionLoading, children: actionLoading ? "Đang xử lý..." : "✓ Duyệt lịch hẹn" }), _jsx("button", { onClick: () => setShowRejectModal(true), className: "flex-1 min-w-fit px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95", style: { background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }, disabled: actionLoading, children: "\u2715 T\u1EEB ch\u1ED1i" })] })), selected.status === "confirmed" &&
                                            selected.approvalStatus === "approved" && (_jsx("button", { onClick: () => handleComplete(selected), className: "flex-1 min-w-fit px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95", style: { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }, disabled: completingId === selected.id, children: completingId === selected.id ? "Dang xu ly..." : "+ Hoan thanh + Tao QR" }))] })] })) }), _jsx(Modal, { open: showRejectModal, onClose: () => {
                            setShowRejectModal(false);
                            setRejectReason("");
                        }, title: "T\u1EEB ch\u1ED1i l\u1ECBch h\u1EB9n", children: _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "bg-red-50 rounded-xl p-4 flex items-start gap-3", children: [_jsx("svg", { className: "w-5 h-5 text-red-500 mt-0.5 flex-shrink-0", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }), _jsx("p", { className: "text-sm text-slate-700", children: "Vui l\u00F2ng cung c\u1EA5p l\u00FD do t\u1EEB ch\u1ED1i l\u1ECBch h\u1EB9n n\u00E0y. B\u1EC7nh nh\u00E2n s\u1EBD \u0111\u01B0\u1EE3c th\u00F4ng b\u00E1o." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-slate-700 mb-2", children: "L\u00FD do t\u1EEB ch\u1ED1i" }), _jsx("textarea", { value: rejectReason, onChange: (e) => setRejectReason(e.target.value), placeholder: "Nh\u1EADp l\u00FD do t\u1EEB ch\u1ED1i...", className: "w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none", rows: 4 })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => handleReject(selected?.id || ""), className: "flex-1 px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95", style: { background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }, disabled: actionLoading || !rejectReason.trim(), children: actionLoading ? "Đang xử lý..." : "Xác nhận từ chối" }), _jsx("button", { onClick: () => {
                                                setShowRejectModal(false);
                                                setRejectReason("");
                                            }, className: "flex-1 px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all duration-200 active:scale-95", disabled: actionLoading, children: "H\u1EE7y" })] })] }) }), completeResult?.qrData && (_jsx(QRPaymentResultModal, { qrData: completeResult.qrData, appointment: completeResult.appointment, paymentId: completeResult.qrData.paymentId, onConfirm: handleConfirmPayment, confirmingId: confirmingId, onClose: () => { setShowQRModal(false); setCompleteResult(null); } }))] })] }));
}
// ── QR Payment Result Modal ──────────────────────────────────────────────────
function QRPaymentResultModal({ qrData, appointment, paymentId, onConfirm, confirmingId, onClose, }) {
    const handlePrintQR = () => {
        if (!qrData.qrDataUrl)
            return;
        const win = window.open("", "_blank");
        if (!win)
            return;
        win.document.write(`
      <html><head><title>In QR Thanh Toan</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
        h2 { color: #0c4a6e; } p { font-size: 14px; color: #555; }
        img { border: 4px solid #0ea5e9; border-radius: 12px; }
        .info { margin-top: 16px; font-weight: bold; color: #059669; }
      </style></head>
      <body>
        <h2>Phong Kham Nha Khoa VinaMec</h2>
        <p>Ma hoa don: ${qrData.invoiceNumber}</p>
        <p>Benh nhan: ${appointment.patientName}</p>
        <img src="${qrData.qrDataUrl}" width="300" />
        <p class="info">So tien: ${Number(qrData.amount).toLocaleString("vi-VN")} VND</p>
        <p>STK: ${qrData.accountNo} - ${qrData.accountName}</p>
        <p>Noi dung: ${qrData.addInfo}</p>
        <script>window.print();<\/script>
      </body></html>
    `);
        win.document.close();
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center", children: _jsx("svg", { className: "w-5 h-5 text-white", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-bold text-white", children: "Hoan thanh & Tao QR" }), _jsx("p", { className: "text-emerald-100 text-xs", children: "Phieu thu da duoc tao" })] })] }), _jsx("button", { onClick: onClose, className: "text-emerald-100 hover:text-white text-2xl font-light", children: "\u2715" })] }), _jsxs("div", { className: "p-6 space-y-5", children: [_jsxs("div", { className: "bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center", children: [_jsx("p", { className: "font-bold text-emerald-800", children: "Da hoan thanh kham!" }), _jsxs("p", { className: "text-xs text-emerald-600 mt-1", children: ["Phieu thu ", _jsx("strong", { children: qrData.invoiceNumber }), " da duoc tao tu dong."] })] }), _jsxs("div", { className: "bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 text-center border border-sky-200", children: [_jsx("p", { className: "text-xs text-sky-600 font-bold uppercase tracking-wider", children: "So tien can thanh toan" }), _jsxs("p", { className: "text-3xl font-black text-sky-700 mt-1", children: [Number(qrData.amount).toLocaleString("vi-VN"), _jsx("span", { className: "text-lg", children: " \u0111" })] })] }), _jsxs("div", { className: "bg-white rounded-xl p-4 text-center border border-slate-200 shadow-sm", children: [_jsx("img", { src: qrData.qrDataUrl, alt: "QR", className: "w-56 h-56 mx-auto rounded-xl" }), _jsx("p", { className: "text-xs text-slate-400 mt-2", children: "Quet ma QR bang ung dung ngan hang" })] }), _jsxs("div", { className: "bg-white rounded-xl border border-slate-200 overflow-hidden", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2", children: _jsx("p", { className: "text-white text-xs font-bold uppercase tracking-wider", children: "Thong tin tai khoan" }) }), _jsx("div", { className: "divide-y divide-slate-100", children: [
                                        { label: "Ngan hang", value: "MB Bank (MBB)" },
                                        { label: "So tai khoan", value: qrData.accountNo },
                                        { label: "Ten tai khoan", value: qrData.accountName },
                                        { label: "Noi dung CK", value: qrData.addInfo },
                                    ].map((item) => (_jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsx("span", { className: "text-xs font-semibold text-slate-400", children: item.label }), _jsx("span", { className: "text-sm font-bold text-slate-700", children: item.value })] }, item.label))) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx("button", { onClick: handlePrintQR, className: "py-3 rounded-xl font-semibold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition", children: "In QR" }), _jsx("button", { onClick: onClose, className: "py-3 rounded-xl font-semibold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition", children: "Dong" })] }), _jsx("button", { onClick: () => onConfirm(paymentId), disabled: confirmingId === paymentId, className: "w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-50", style: { background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }, children: confirmingId === paymentId ? "Dang xu ly..." : "Da nhan duoc tien — Xac nhan thanh toan" }), _jsx("p", { className: "text-center text-xs text-slate-400 -mt-2", children: "Sau khi benh nhan chuyen khoan xong, bam nut tren de xac nhan." })] })] }) }));
}
