import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import { serviceApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
export default function AdminServices() {
    const { data: services, loading, refetch, } = useApi(() => serviceApi.getAll());
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const filtered = (services || []).filter((s) => s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.category?.toLowerCase().includes(search.toLowerCase()));
    const categoryColors = {
        Preventive: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", gradient: "from-sky-400 to-blue-500" },
        Restorative: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", gradient: "from-teal-400 to-emerald-500" },
        Cosmetic: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", gradient: "from-violet-400 to-purple-500" },
        Emergency: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", gradient: "from-red-400 to-rose-500" },
        General: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", gradient: "from-slate-400 to-gray-500" },
    };
    const getCategoryInfo = (category) => {
        return categoryColors[category] || categoryColors.General;
    };
    const categoryStats = [
        { name: "Phòng ngừa", key: "Preventive", icon: "🛡️", color: "sky" },
        { name: "Phục hồi", key: "Restorative", icon: "🔧", color: "teal" },
        { name: "Thẩm mỹ", key: "Cosmetic", icon: "✨", color: "violet" },
        { name: "Cấp cứu", key: "Emergency", icon: "🚨", color: "red" },
    ];
    const columns = [
        {
            key: "name",
            header: "DỊCH VỤ",
            render: (s) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-xl bg-gradient-to-br ${getCategoryInfo(s.category || "General").gradient} flex items-center justify-center text-white shadow-md`, children: _jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" }) }) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-800", children: s.name }), _jsxs("p", { className: "text-xs text-slate-400", children: [s.description?.substring(0, 40) || "Mô tả dịch vụ", "..."] })] })] })),
        },
        {
            key: "category",
            header: "DANH MỤC",
            render: (s) => {
                const catInfo = getCategoryInfo(s.category || "General");
                return (_jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${catInfo.bg} ${catInfo.text} ${catInfo.border}`, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full bg-gradient-to-r ${catInfo.gradient}` }), s.category || "General"] }));
            },
        },
        {
            key: "duration",
            header: "THỜI GIAN",
            render: (s) => (_jsxs("span", { className: "inline-flex items-center gap-1.5 text-slate-600 font-medium", children: [_jsx("svg", { className: "w-4 h-4 text-slate-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }), s.duration || 30, " ph\u00FAt"] })),
        },
        {
            key: "price",
            header: "GIÁ",
            render: (s) => (_jsxs("span", { className: "font-mono font-bold text-slate-800", children: [Number(s.price || 0).toLocaleString("vi-VN"), " \u20AB"] })),
        },
        {
            key: "active",
            header: "TRẠNG THÁI",
            render: (s) => (_jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.active !== false
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"}`, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${s.active !== false ? "bg-emerald-500" : "bg-red-500"}` }), s.active !== false ? "Hoạt động" : "Tạm dừng"] })),
        },
        {
            key: "actions",
            header: "THAO TÁC",
            render: (s) => (_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => {
                            setSelected(s);
                            setShowModal(true);
                        }, className: "px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-medium text-xs transition-all border border-sky-200", children: "S\u1EEDa" }), _jsx("button", { onClick: async () => {
                            if (confirm("Xóa dịch vụ này?")) {
                                await serviceApi.delete(s._id);
                                refetch();
                            }
                        }, className: "px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium text-xs transition-all border border-red-200", children: "X\u00F3a" })] })),
        },
    ];
    return (_jsxs("div", { className: "flex h-screen", style: { background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }, children: [_jsx(AdminSidebar, {}), _jsxs("div", { className: "flex-1 lg:ml-0 min-w-0 overflow-y-auto", children: [_jsx("div", { className: "glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50", children: _jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-slate-800", children: "Qu\u1EA3n l\u00FD D\u1ECBch v\u1EE5" }), _jsxs("p", { className: "text-sm text-slate-400 mt-0.5", children: [services?.length || 0, " d\u1ECBch v\u1EE5 trong h\u1EC7 th\u1ED1ng"] })] }), _jsxs("button", { onClick: () => {
                                        setSelected(null);
                                        setShowModal(true);
                                    }, className: "inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }), "Th\u00EAm d\u1ECBch v\u1EE5"] })] }) }), _jsxs("div", { className: "p-6 lg:p-8 animate-fade-in", children: [_jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: categoryStats.map((cat, index) => {
                                    const count = (services || []).filter((s) => s.category === cat.key).length;
                                    return (_jsxs("div", { className: "card card-hover p-5 animate-scale-in cursor-pointer hover:border-sky-200", style: { animationDelay: `${index * 100}ms` }, onClick: () => setSearch(cat.key), children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("div", { className: `w-10 h-10 rounded-xl bg-gradient-to-br from-${cat.color}-400 to-${cat.color}-500 flex items-center justify-center text-lg shadow-md`, children: cat.icon }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-slate-800", children: count }), _jsx("p", { className: "text-xs text-slate-500", children: cat.name })] })] }), _jsx("div", { className: "h-1.5 bg-slate-100 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full bg-gradient-to-r from-${cat.color}-400 to-${cat.color}-500 rounded-full transition-all`, style: { width: `${services?.length ? (count / services.length) * 100 : 0}%` } }) })] }, cat.key));
                                }) }), _jsxs("div", { className: "card p-0 overflow-hidden animate-scale-in", style: { animationDelay: "300ms" }, children: [_jsx("div", { className: "p-5 border-b border-slate-100", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-slate-800", children: "Danh s\u00E1ch d\u1ECBch v\u1EE5" }), _jsxs("p", { className: "text-sm text-slate-400", children: [filtered.length, " d\u1ECBch v\u1EE5 \u0111\u01B0\u1EE3c t\u00ECm th\u1EA5y"] })] }), _jsxs("div", { className: "relative", children: [_jsx("svg", { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), _jsx("input", { type: "text", placeholder: "T\u00ECm ki\u1EBFm d\u1ECBch v\u1EE5...", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full sm:w-72 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all" })] })] }) }), _jsx("div", { className: "overflow-x-auto", children: _jsx(Table, { columns: columns, data: filtered, loading: loading }) })] })] })] }), _jsx(Modal, { open: showModal, onClose: () => setShowModal(false), title: selected ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới", children: _jsx(ServiceForm, { service: selected, onClose: () => {
                        setShowModal(false);
                        refetch();
                    } }) })] }));
}
function ServiceForm({ service, onClose, }) {
    const [form, setForm] = useState({
        name: service?.name || "",
        description: service?.description || "",
        duration: service?.duration || 30,
        price: service?.price || 0,
        category: service?.category || "Preventive",
        active: service?.active !== false,
    });
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (service)
                await serviceApi.update(service._id, form);
            else
                await serviceApi.create(form);
            onClose();
        }
        finally {
            setLoading(false);
        }
    };
    const categories = [
        { value: "Preventive", label: "Phòng ngừa", color: "sky" },
        { value: "Restorative", label: "Phục hồi", color: "teal" },
        { value: "Cosmetic", label: "Thẩm mỹ", color: "violet" },
        { value: "Emergency", label: "Cấp cứu", color: "red" },
        { value: "General", label: "Tổng quát", color: "slate" },
    ];
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-slate-700 mb-2", children: "T\u00EAn d\u1ECBch v\u1EE5" }), _jsxs("div", { className: "relative", children: [_jsx("svg", { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" }) }), _jsx("input", { className: "w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all", placeholder: "Nh\u1EADp t\u00EAn d\u1ECBch v\u1EE5", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-slate-700 mb-2", children: "M\u00F4 t\u1EA3" }), _jsx("textarea", { className: "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all resize-none", placeholder: "Nh\u1EADp m\u00F4 t\u1EA3 d\u1ECBch v\u1EE5", rows: 3, value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-slate-700 mb-2", children: "Th\u1EDDi gian (ph\u00FAt)" }), _jsxs("div", { className: "relative", children: [_jsx("svg", { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("input", { type: "number", className: "w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all", value: form.duration, onChange: (e) => setForm({ ...form, duration: Number(e.target.value) }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-slate-700 mb-2", children: "Gi\u00E1 (VND)" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium", children: "\u20AB" }), _jsx("input", { type: "number", className: "w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all", value: form.price, onChange: (e) => setForm({ ...form, price: Number(e.target.value) }) })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-slate-700 mb-2", children: "Danh m\u1EE5c" }), _jsxs("div", { className: "relative", children: [_jsx("svg", { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" }) }), _jsx("select", { className: "w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all appearance-none", value: form.category, onChange: (e) => setForm({ ...form, category: e.target.value }), children: categories.map((cat) => (_jsx("option", { value: cat.value, children: cat.label }, cat.value))) }), _jsx("svg", { className: "absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] })] }), _jsxs("label", { className: "flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-xl ${form.active ? "bg-gradient-to-br from-emerald-400 to-teal-500" : "bg-gradient-to-br from-slate-400 to-gray-500"} flex items-center justify-center text-white`, children: _jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: form.active ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12" }) }) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-700", children: "Tr\u1EA1ng th\u00E1i d\u1ECBch v\u1EE5" }), _jsx("p", { className: "text-xs text-slate-500", children: form.active ? "Dịch vụ đang hoạt động" : "Dịch vụ tạm dừng" })] })] }), _jsx("input", { type: "checkbox", checked: form.active, onChange: (e) => setForm({ ...form, active: e.target.checked }), className: "sr-only" }), _jsx("div", { className: `w-12 h-7 rounded-full p-1 transition-all ${form.active ? "bg-emerald-500" : "bg-slate-300"}`, children: _jsx("div", { className: `w-5 h-5 rounded-full bg-white shadow-md transform transition-all ${form.active ? "translate-x-5" : "translate-x-0"}` }) })] }), _jsxs("div", { className: "flex gap-3 pt-3", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all", children: "H\u1EE7y" }), _jsx("button", { type: "submit", disabled: loading, className: "flex-1 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all disabled:opacity-50", children: loading ? "Đang lưu..." : "Lưu" })] })] }));
}
