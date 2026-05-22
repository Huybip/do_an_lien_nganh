import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import { appointmentApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
export default function AdminAppointments() {
    const { data: appointments, loading, refetch, } = useApi(() => appointmentApi.getAll());
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const filtered = (appointments || []).filter((apt) => {
        const matchSearch = apt.patientName?.toLowerCase().includes(search.toLowerCase()) ||
            apt.doctorName?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || apt.status === filter;
        return matchSearch && matchFilter;
    });
    const handleDelete = async (id) => {
        if (!confirm("Xóa lịch hẹn này?"))
            return;
        setDeleting(id);
        try {
            await appointmentApi.delete(id);
            refetch();
        }
        finally {
            setDeleting(null);
        }
    };
    const handleStatusChange = async (id, newStatus) => {
        try {
            await appointmentApi.update(id, { status: newStatus });
            refetch();
        }
        catch (err) {
            console.error("Failed to update status:", err);
        }
    };
    const statusColors = {
        pending: "bg-amber-100 text-amber-700",
        confirmed: "bg-green-100 text-green-700",
        completed: "bg-blue-100 text-blue-700",
        cancelled: "bg-red-100 text-red-700",
    };
    const columns = [
        {
            key: "date",
            header: "DATE",
            render: (apt) => (_jsx("span", { className: "font-medium text-gray-900", children: apt.date })),
        },
        {
            key: "patientName",
            header: "PATIENT",
            render: (apt) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-gradient-to-br from-mint-400 to-dental-500 flex items-center justify-center text-white text-xs font-bold", children: apt.patient?.name?.charAt(0) || apt.patientName?.charAt(0) || "P" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: apt.patient?.name || apt.patientName }), _jsx("p", { className: "text-xs text-gray-500", children: apt.patient?.email || "—" })] })] })),
        },
        {
            key: "doctorName",
            header: "DOCTOR",
            render: (apt) => (_jsxs("span", { className: "text-gray-700", children: ["Dr. ", apt.doctorName] })),
        },
        {
            key: "time",
            header: "TIME",
            render: (apt) => (_jsx("span", { className: "text-gray-700 font-medium", children: apt.time })),
        },
        {
            key: "service",
            header: "SERVICE",
            render: (apt) => (_jsx("span", { className: "text-gray-700", children: typeof apt.service === "string" ? apt.service : apt.service?.name })),
        },
        {
            key: "status",
            header: "STATUS",
            render: (apt) => (_jsxs("select", { value: apt.status, onChange: (e) => handleStatusChange(apt.id, e.target.value), className: `px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${statusColors[apt.status] || "bg-gray-100 text-gray-700"}`, children: [_jsx("option", { value: "pending", children: "Ch\u1EDD" }), _jsx("option", { value: "confirmed", children: "X\u00E1c nh\u1EADn" }), _jsx("option", { value: "completed", children: "Ho\u00E0n t\u1EA5t" }), _jsx("option", { value: "cancelled", children: "H\u1EE7y" })] })),
        },
        {
            key: "actions",
            header: "ACTIONS",
            render: (apt) => (_jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => {
                            setSelected(apt);
                            setShowModal(true);
                        }, className: "text-blue-600 hover:text-blue-800 font-medium text-sm", children: "View" }), _jsx("button", { onClick: () => handleDelete(apt.id), disabled: deleting === apt.id, className: "text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50", children: deleting === apt.id ? "..." : "Delete" })] })),
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
    return (_jsxs("div", { className: "flex h-screen bg-gray-50", children: [_jsx(AdminSidebar, {}), _jsxs("div", { className: "flex-1 ml-64 overflow-y-auto", children: [_jsx("div", { className: "bg-white border-b border-gray-200 p-6 sticky top-0 z-10", children: _jsx("div", { className: "flex justify-between items-center", children: _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Qu\u1EA3n l\u00FD L\u1ECBch h\u1EB9n" }), _jsx("p", { className: "text-gray-600 text-sm", children: new Date().toLocaleDateString("vi-VN") })] }) }) }), _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: stats.map((stat) => (_jsxs("div", { className: `bg-${stat.color}-50 rounded-lg p-6 border border-${stat.color}-200`, children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: stat.label }), _jsx("p", { className: `text-3xl font-bold text-${stat.color}-600`, children: stat.value })] }, stat.label))) }), _jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "p-6 border-b border-gray-200", children: _jsxs("div", { className: "flex gap-4 items-end", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "label", children: "T\u00ECm ki\u1EBFm" }), _jsx("input", { className: "input w-full", placeholder: "T\u00ECm b\u1EC7nh nh\u00E2n ho\u1EB7c b\u00E1c s\u0129...", value: search, onChange: (e) => setSearch(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Tr\u1EA1ng th\u00E1i" }), _jsxs("select", { className: "input", value: filter, onChange: (e) => setFilter(e.target.value), children: [_jsx("option", { value: "all", children: "T\u1EA5t c\u1EA3" }), _jsx("option", { value: "pending", children: "Ch\u1EDD" }), _jsx("option", { value: "confirmed", children: "X\u00E1c nh\u1EADn" }), _jsx("option", { value: "completed", children: "Ho\u00E0n t\u1EA5t" }), _jsx("option", { value: "cancelled", children: "H\u1EE7y" })] })] })] }) }), _jsx("div", { className: "overflow-x-auto", children: _jsx(Table, { columns: columns, data: filtered, loading: loading }) })] })] })] }), _jsx(Modal, { open: showModal, onClose: () => setShowModal(false), title: "Chi ti\u1EBFt l\u1ECBch h\u1EB9n", children: selected && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "B\u1EC7nh nh\u00E2n" }), _jsx("p", { className: "font-medium text-gray-900", children: selected.patientName })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "B\u00E1c s\u0129" }), _jsxs("p", { className: "font-medium text-gray-900", children: ["Dr. ", selected.doctorName] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Ng\u00E0y & Gi\u1EDD" }), _jsxs("p", { className: "font-medium text-gray-900", children: [selected.date, " l\u00FAc ", selected.time] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "D\u1ECBch v\u1EE5" }), _jsx("p", { className: "font-medium text-gray-900", children: typeof selected.service === "string"
                                        ? selected.service
                                        : selected.service?.name })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Tr\u1EA1ng th\u00E1i" }), _jsx("p", { className: `inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[selected.status]}`, children: selected.status === "pending"
                                        ? "Chờ"
                                        : selected.status === "confirmed"
                                            ? "Xác nhận"
                                            : selected.status === "completed"
                                                ? "Hoàn tất"
                                                : "Hủy" })] })] })) })] }));
}
