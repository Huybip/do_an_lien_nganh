import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import AppointmentCalendar from "../../components/ui/AppointmentCalendar";
import { appointmentApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
const statusColor = {
    pending: "badge-amber",
    confirmed: "badge-blue",
    completed: "badge-green",
    cancelled: "badge-red",
};
const approvalColor = {
    pending: "badge-amber",
    approved: "badge-green",
    rejected: "badge-red",
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
    const handleReject = async (id) => {
        try {
            if (!rejectReason.trim()) {
                toast.error("Please provide a reason for rejection");
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
            header: "Patient",
            render: (a) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-gradient-to-br from-mint-400 to-dental-500 flex items-center justify-center text-white text-xs font-bold", children: a.patient?.name?.charAt(0) || a.patientName?.charAt(0) || "P" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: a.patient?.name || a.patientName }), _jsx("p", { className: "text-xs text-surface-400", children: a.patient?.email || "—" })] })] })),
        },
        {
            key: "service",
            header: "Service",
            render: (a) => (_jsx("span", { children: typeof a.service === "string"
                    ? a.service
                    : a.service?.name || "General Consultation" })),
        },
        { key: "date", header: "Date" },
        { key: "time", header: "Time" },
        {
            key: "approvalStatus",
            header: "Approval",
            render: (a) => (_jsx("span", { className: `badge ${approvalColor[a.approvalStatus || "pending"]}`, children: a.approvalStatus || "pending" })),
        },
        {
            key: "status",
            header: "Status",
            render: (a) => (_jsx("span", { className: `badge ${statusColor[a.status]}`, children: a.status })),
        },
        {
            key: "actions",
            header: "Actions",
            render: (a) => (_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => {
                            setSelected(a);
                            setShowModal(true);
                        }, className: "text-xs text-dental-600 font-medium hover:underline", children: "View" }), a.approvalStatus === "pending" && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => handleApprove(a.id), className: "text-xs text-emerald-600 font-medium hover:underline", disabled: actionLoading, children: "Approve" }), _jsx("button", { onClick: () => {
                                    setSelected(a);
                                    setShowRejectModal(true);
                                }, className: "text-xs text-red-600 font-medium hover:underline", disabled: actionLoading, children: "Reject" })] })), a.status === "confirmed" &&
                        a.approvalStatus === "approved" && (_jsx("button", { onClick: () => updateStatus(a.id, "completed"), className: "text-xs text-mint-600 font-medium hover:underline", disabled: actionLoading, children: "Complete" }))] })),
        },
    ];
    return (_jsxs("div", { className: "flex", children: [_jsx(DoctorSidebar, {}), _jsxs("div", { className: "flex-1 ml-64", children: [_jsx("div", { className: "sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm", children: _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "L\u1ECBch h\u1EB9n" }), _jsxs("p", { className: "text-sm text-gray-500 mt-1", children: [viewType === "calendar"
                                            ? (appointments || []).length
                                            : filtered.length, " ", "l\u1ECBch h\u1EB9n"] })] }) }), _jsxs("div", { className: "space-y-4 p-8", children: [_jsxs("div", { className: "flex gap-2 bg-surface-100 p-1 rounded-lg", children: [_jsx("button", { onClick: () => setViewType("calendar"), className: `px-3 py-1.5 rounded text-sm font-medium transition ${viewType === "calendar"
                                            ? "bg-white text-dental-600 shadow-sm"
                                            : "text-surface-600 hover:text-surface-900"}`, children: "L\u1ECBch" }), _jsx("button", { onClick: () => setViewType("table"), className: `px-3 py-1.5 rounded text-sm font-medium transition ${viewType === "table"
                                            ? "bg-white text-dental-600 shadow-sm"
                                            : "text-surface-600 hover:text-surface-900"}`, children: "Danh s\u00E1ch" })] }), viewType === "table" && (_jsx("div", { className: "flex gap-2", children: ["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (_jsx("button", { onClick: () => setFilter(s), className: `text-xs px-3 py-1.5 rounded-full font-semibold transition ${filter === s ? "bg-dental-600 text-white" : "bg-surface-100 text-surface-600 hover:bg-surface-200"}`, children: s.charAt(0).toUpperCase() + s.slice(1) }, s))) }))] }), viewType === "calendar" ? (_jsx(AppointmentCalendar, { appointments: appointments || [], onSelectAppointment: (apt) => {
                            setSelected(apt);
                            setShowModal(true);
                        }, loading: loading })) : (_jsx("div", { className: "card", children: _jsx(Table, { columns: columns, data: filtered, loading: loading }) })), _jsx(Modal, { open: showModal, onClose: () => setShowModal(false), title: "Appointment Details", children: selected && (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "space-y-3", children: [
                                        ["Patient", selected.patientName],
                                        ["Doctor", selected.doctorName],
                                        [
                                            "Service",
                                            typeof selected.service === "string"
                                                ? selected.service
                                                : selected.service?.name || "General Consultation",
                                        ],
                                        ["Date", selected.date],
                                        ["Time", selected.time],
                                        [
                                            "Approval Status",
                                            selected.approvalStatus || "pending",
                                        ],
                                        ["Status", selected.status],
                                        ["Patient Notes", selected.notes || "—"],
                                        ["Doctor Notes", selected.doctorNotes || "—"],
                                        ...(selected.rejectionReason
                                            ? [["Rejection Reason", selected.rejectionReason]]
                                            : []),
                                    ].map(([k, v]) => (_jsxs("div", { className: "flex gap-3", children: [_jsx("span", { className: "label w-32 flex-shrink-0", children: k }), _jsx("span", { className: "text-sm text-surface-800", children: v })] }, k))) }), _jsxs("div", { className: "flex gap-2 pt-4 flex-wrap", children: [selected.approvalStatus === "pending" && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => handleApprove(selected.id), className: "btn-primary flex-1 min-w-fit", disabled: actionLoading, children: actionLoading ? "Processing..." : "Approve" }), _jsx("button", { onClick: () => setShowRejectModal(true), className: "btn-danger flex-1 min-w-fit", disabled: actionLoading, children: "Reject" })] })), selected.status === "confirmed" &&
                                            selected.approvalStatus === "approved" && (_jsx("button", { onClick: () => {
                                                updateStatus(selected.id, "completed");
                                                setShowModal(false);
                                            }, className: "btn-success flex-1", disabled: actionLoading, children: "Mark Complete" })), _jsx("button", { onClick: () => setShowModal(false), className: "btn-secondary flex-1", children: "Close" })] })] })) }), _jsx(Modal, { open: showRejectModal, onClose: () => {
                            setShowRejectModal(false);
                            setRejectReason("");
                        }, title: "Reject Appointment", children: _jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-surface-600", children: "Please provide a reason for rejecting this appointment. The patient will be notified." }), _jsx("textarea", { value: rejectReason, onChange: (e) => setRejectReason(e.target.value), placeholder: "Enter reason for rejection...", className: "w-full p-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-dental-600", rows: 4 }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleReject(selected?.id || ""), className: "btn-danger flex-1", disabled: actionLoading || !rejectReason.trim(), children: actionLoading ? "Processing..." : "Reject Appointment" }), _jsx("button", { onClick: () => {
                                                setShowRejectModal(false);
                                                setRejectReason("");
                                            }, className: "btn-secondary flex-1", disabled: actionLoading, children: "Cancel" })] })] }) })] })] }));
}
