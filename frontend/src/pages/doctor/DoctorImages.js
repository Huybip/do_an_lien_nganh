import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import { imageApi, patientApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
const typeConfig = {
    xray: { icon: "🦴", color: "#7c3aed", bg: "bg-violet-50", label: "X-quang" },
    photo: { icon: "📷", color: "#a855f7", bg: "bg-purple-50", label: "Hình ảnh" },
    scan: { icon: "🔬", color: "#c084fc", bg: "bg-fuchsia-50", label: "Quét 3D" },
};
export default function DoctorImages() {
    const { data: images, loading, refetch } = useApi(() => imageApi.getAll());
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const fileRef = useRef(null);
    const [filter, setFilter] = useState("all");
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const { toast } = useToast();
    const filtered = (images || []).filter((i) => filter === "all" || i.type === filter);
    useEffect(() => {
        if (showUploadForm) {
            const fetchPatients = async () => {
                setLoadingPatients(true);
                try {
                    const res = await patientApi.getAll();
                    setPatients(res.data.data || []);
                }
                catch (err) {
                    console.error("Failed to load patients:", err);
                    toast.error("Failed to load patients");
                }
                finally {
                    setLoadingPatients(false);
                }
            };
            fetchPatients();
        }
    }, [showUploadForm]);
    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        if (!selectedPatient) {
            toast.error("Vui lòng chọn bệnh nhân");
            return;
        }
        setUploading(true);
        const fd = new FormData();
        fd.append("image", file);
        fd.append("type", "photo");
        fd.append("patientId", selectedPatient);
        try {
            await imageApi.upload(fd);
            toast.success("Tải lên thành công!");
            refetch();
            setShowUploadForm(false);
            setSelectedPatient("");
            if (fileRef.current)
                fileRef.current.value = "";
        }
        catch (err) {
            toast.error(err.response?.data?.message || "Tải lên thất bại");
        }
        finally {
            setUploading(false);
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            if (!selectedPatient) {
                toast.error("Vui lòng chọn bệnh nhân trước");
                return;
            }
            setUploading(true);
            const fd = new FormData();
            fd.append("image", file);
            fd.append("type", "photo");
            fd.append("patientId", selectedPatient);
            imageApi.upload(fd)
                .then(() => {
                toast.success("Tải lên thành công!");
                refetch();
                setShowUploadForm(false);
                setSelectedPatient("");
            })
                .catch((err) => {
                toast.error(err.response?.data?.message || "Tải lên thất bại");
            })
                .finally(() => {
                setUploading(false);
            });
        }
    };
    const openPreview = (img) => {
        setPreview(img);
        setShowPreview(true);
    };
    return (_jsxs("div", { className: "flex min-h-screen", style: { background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }, children: [_jsx(DoctorSidebar, {}), _jsxs("div", { className: "flex-1 lg:ml-0 min-w-0", children: [_jsxs("div", { className: "glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-slate-800", children: "H\u00ECnh \u1EA3nh nha khoa" }), _jsxs("p", { className: "text-xs text-slate-400 mt-0.5", children: [filtered.length, " h\u00ECnh \u1EA3nh"] })] }), _jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [_jsx("div", { className: "flex items-center gap-1.5 bg-white rounded-xl p-1 border border-slate-100 shadow-sm", children: [
                                            { id: "all", label: "Tất cả" },
                                            { id: "xray", label: "🦴 X-quang" },
                                            { id: "photo", label: "📷 Hình ảnh" },
                                            { id: "scan", label: "🔬 Quét 3D" },
                                        ].map((f) => {
                                            const isActive = filter === f.id;
                                            return (_jsx("button", { onClick: () => setFilter(f.id), className: `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${isActive
                                                    ? "text-white shadow-sm"
                                                    : "text-slate-500 hover:bg-slate-50"}`, style: isActive ? { background: "linear-gradient(135deg, #7c3aed, #6d28d9)" } : {}, children: f.label }, f.id));
                                        }) }), _jsxs("button", { onClick: () => setShowUploadForm(true), disabled: uploading, className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0", style: { background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 14px rgba(109, 40, 217, 0.4)" }, children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" }) }), uploading ? "Đang tải..." : "Tải lên"] })] })] }), _jsxs("div", { className: "space-y-4 p-6 lg:p-8", children: [_jsx("input", { ref: fileRef, type: "file", accept: "image/*", className: "hidden", onChange: handleUpload }), showUploadForm && (_jsx("div", { className: "card card-hover p-6 border border-slate-100 animate-scale-in", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", style: { background: "linear-gradient(135deg, #7c3aed15, #6d28d915)" }, children: _jsx("svg", { className: "w-6 h-6 text-violet-600", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" }) }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-bold text-slate-800 mb-1", children: "T\u1EA3i l\u00EAn h\u00ECnh \u1EA3nh m\u1EDBi" }), _jsx("p", { className: "text-sm text-slate-400 mb-4", children: "Ch\u1ECDn b\u1EC7nh nh\u00E2n v\u00E0 k\u00E9o th\u1EA3 ho\u1EB7c ch\u1ECDn file \u0111\u1EC3 t\u1EA3i l\u00EAn" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block", children: "Ch\u1ECDn b\u1EC7nh nh\u00E2n" }), _jsxs("select", { className: "w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition", value: selectedPatient, onChange: (e) => setSelectedPatient(e.target.value), disabled: loadingPatients, style: { background: "#fafafa" }, children: [_jsx("option", { value: "", children: "Ch\u1ECDn b\u1EC7nh nh\u00E2n..." }), patients.map((p) => (_jsxs("option", { value: p.id || p._id, children: [p.name, " - ", p.email] }, p.id || p._id)))] })] }), _jsx("div", { onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, className: `relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${isDragging
                                                                ? "border-violet-400 bg-violet-50"
                                                                : selectedPatient
                                                                    ? "border-slate-200 hover:border-violet-300 hover:bg-slate-50 cursor-pointer"
                                                                    : "border-slate-200 bg-slate-50"}`, onClick: () => selectedPatient && fileRef.current?.click(), children: uploading ? (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center", style: { background: "linear-gradient(135deg, #7c3aed15, #6d28d915)" }, children: _jsx("div", { className: "w-8 h-8 border-3 border-violet-300 border-t-violet-600 rounded-full animate-spin" }) }), _jsx("p", { className: "text-sm font-semibold text-violet-600", children: "\u0110ang t\u1EA3i l\u00EAn..." })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center", style: { background: "linear-gradient(135deg, #7c3aed15, #6d28d915)" }, children: _jsx("svg", { className: "w-8 h-8 text-violet-600", fill: "none", stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-slate-700", children: isDragging ? "Thả file vào đây" : "Kéo thả hình ảnh hoặc click để chọn" }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "H\u1ED7 tr\u1EE3: JPG, PNG, GIF, WebP (t\u1ED1i \u0111a 10MB)" })] })] })) }), _jsx("div", { className: "flex gap-3", children: _jsx("button", { onClick: () => {
                                                                    setShowUploadForm(false);
                                                                    setSelectedPatient("");
                                                                    if (fileRef.current)
                                                                        fileRef.current.value = "";
                                                                }, className: "px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition", children: "H\u1EE7y" }) })] })] })] }) })), loading && (_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4", children: Array.from({ length: 8 }).map((_, i) => (_jsx("div", { className: "skeleton aspect-square rounded-2xl" }, i))) })), !loading && filtered.length === 0 && (_jsxs("div", { className: "card text-center py-20 animate-fade-in", children: [_jsx("div", { className: "w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5", style: { background: "linear-gradient(135deg, #7c3aed15, #6d28d915)" }, children: _jsx("svg", { className: "w-10 h-10 text-violet-500", fill: "none", stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }), _jsx("p", { className: "font-black text-slate-700 text-lg mb-2", children: "Kh\u00F4ng c\u00F3 h\u00ECnh \u1EA3nh" }), _jsx("p", { className: "text-sm text-slate-400 max-w-xs mx-auto", children: filter !== "all" ? "Thử chọn bộ lọc khác" : "Tải lên hình ảnh nha khoa để xem ở đây" })] })), !loading && filtered.length > 0 && (_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4", children: filtered.map((img, idx) => {
                                    const cfg = typeConfig[img.type] || typeConfig.photo;
                                    return (_jsxs("div", { onClick: () => openPreview(img), className: "group relative aspect-square bg-white rounded-2xl overflow-hidden cursor-pointer border border-slate-100 hover:shadow-xl transition-all duration-300 animate-fade-in hover:-translate-y-1", style: { animationDelay: `${idx * 30}ms` }, children: [_jsx("img", { src: img.url, alt: img.description || "Dental image", className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110", onError: (e) => {
                                                    e.target.style.display = "none";
                                                } }), _jsx("div", { className: "absolute top-3 left-3", children: _jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md", style: { background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}30` }, children: [cfg.icon, " ", cfg.label] }) }), _jsxs("div", { className: "absolute inset-0 bg-gradient-to-t from-violet-900/80 via-violet-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4", children: [_jsx("p", { className: "text-white text-sm font-bold truncate", children: img.patientName }), _jsx("p", { className: "text-white/70 text-xs mt-1", children: img.uploadedAt ? new Date(img.uploadedAt).toLocaleDateString("vi-VN") : "" }), _jsx("div", { className: "flex items-center gap-2 mt-3", children: _jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-white/90 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg", children: [_jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" }) }), "Xem chi ti\u1EBFt"] }) })] })] }, img.id));
                                }) }))] })] }), showPreview && preview && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in", style: { background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }, onClick: () => setShowPreview(false), children: _jsxs("div", { className: "relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-scale-in", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4", style: { background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)" }, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md", style: { background: "rgba(255,255,255,0.2)" }, children: _jsx("svg", { className: "w-5 h-5 text-white", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }), _jsxs("div", { children: [_jsx("p", { className: "font-bold text-white", children: preview.patientName }), _jsxs("p", { className: "text-xs text-white/70", children: [typeConfig[preview.type]?.label || "Hình ảnh", " \u00B7 ", preview.uploadedAt ? new Date(preview.uploadedAt).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" }) : ""] })] })] }), _jsx("button", { onClick: () => setShowPreview(false), className: "w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition backdrop-blur-md", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsx("img", { src: preview.url, alt: preview.description ?? "Dental image", className: "w-full max-h-[70vh] object-contain", style: { background: "#0f0a1a" } }), _jsxs("div", { className: "p-6 border-t border-slate-100", children: [preview.description && (_jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider mb-1", children: "M\u00F4 t\u1EA3" }), _jsx("p", { className: "text-sm text-slate-600 leading-relaxed", children: preview.description })] })), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsxs("span", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold", style: { background: `${typeConfig[preview.type]?.color}15`, color: typeConfig[preview.type]?.color }, children: [typeConfig[preview.type]?.icon, " ", typeConfig[preview.type]?.label] }) }), _jsxs("a", { href: preview.url, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:-translate-y-0.5", style: { background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 14px rgba(109,40,217,0.4)" }, children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" }) }), "T\u1EA3i xu\u1ED1ng"] })] })] })] }) }))] }));
}
