import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from "react";
import PatientSidebar from "../../components/layout/PatientSidebar";
import { imageApi } from "../../services/api";
import { useApi } from "../../hooks/useApi";
const typeConfig = {
    xray: { label: "X-Quang", color: "#0ea5e9", bg: "bg-blue-50", border: "border-blue-100", emoji: "🔬" },
    photo: { label: "Ảnh chụp", color: "#14b8a6", bg: "bg-teal-50", border: "border-teal-100", emoji: "📷" },
    scan: { label: "Quét 3D", color: "#8b5cf6", bg: "bg-violet-50", border: "border-violet-100", emoji: "🖥️" },
};
export default function PatientImages() {
    const { data: images, loading, refetch } = useApi(() => imageApi.getMine());
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [uploadType, setUploadType] = useState("photo");
    const [description, setDescription] = useState("");
    const [showUploadPanel, setShowUploadPanel] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);
    const uploadFile = async (file, desc) => {
        setUploading(true);
        const fd = new FormData();
        fd.append("image", file);
        fd.append("type", uploadType);
        fd.append("description", desc || description);
        try {
            await imageApi.upload(fd);
            refetch();
            setShowUploadPanel(false);
            setDescription("");
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setUploading(false);
        }
    };
    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        await uploadFile(file);
        if (fileRef.current)
            fileRef.current.value = "";
    };
    const handleDrop = async (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/"))
            await uploadFile(file);
    };
    return (_jsxs("div", { className: "flex min-h-screen", style: { background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }, children: [_jsx(PatientSidebar, {}), _jsxs("div", { className: "flex-1 lg:ml-0 min-w-0", children: [_jsxs("div", { className: "glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-slate-800", children: "H\u00ECnh \u1EA3nh" }), _jsxs("p", { className: "text-xs text-slate-400 mt-0.5", children: [(images || []).length, " h\u00ECnh \u1EA3nh nha khoa"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [["photo", "xray", "scan"].map((type) => {
                                        const cfg = typeConfig[type];
                                        return (_jsxs("button", { onClick: () => { }, className: "px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-500 hover:border-slate-300 transition", children: [cfg.emoji, " ", cfg.label] }, type));
                                    }), _jsx("button", { onClick: () => setShowUploadPanel(!showUploadPanel), className: "btn-emerald", children: showUploadPanel ? (_jsxs(_Fragment, { children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M6 18L18 6M6 6l12 12" }) }), " \u0110\u00F3ng"] })) : (_jsxs(_Fragment, { children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2.5, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M12 4v16m8-8H4" }) }), " T\u1EA3i l\u00EAn"] })) })] })] }), _jsxs("div", { className: "space-y-5 p-6 lg:p-8", children: [showUploadPanel && (_jsxs("div", { className: "card p-6 animate-scale-in border border-slate-100", children: [_jsxs("h3", { className: "text-base font-bold text-slate-800 mb-5 flex items-center gap-2", children: [_jsx("span", { className: "w-8 h-8 rounded-xl flex items-center justify-center text-white", style: { background: "linear-gradient(135deg, #0ea5e9, #14b8a6)", boxShadow: "0 4px 12px rgba(14,165,233,0.3)" }, children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }), "T\u1EA3i l\u00EAn h\u00ECnh \u1EA3nh m\u1EDBi"] }), _jsx("div", { className: "flex gap-2 mb-4", children: ["photo", "xray", "scan"].map((type) => {
                                            const cfg = typeConfig[type];
                                            return (_jsxs("button", { onClick: () => setUploadType(type), className: "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border-2 hover:-translate-y-0.5", style: {
                                                    background: uploadType === type ? `${cfg.color}10` : "transparent",
                                                    borderColor: uploadType === type ? cfg.color : "#e2e8f0",
                                                    color: uploadType === type ? cfg.color : "#94a3b8",
                                                }, children: [_jsx("span", { className: "mr-1", children: cfg.emoji }), cfg.label] }, type));
                                        }) }), _jsx("input", { className: "input mb-4", placeholder: "M\u00F4 t\u1EA3 h\u00ECnh \u1EA3nh (v\u00ED d\u1EE5: X-quang h\u00E0m tr\u00EAn...)", value: description, onChange: (e) => setDescription(e.target.value) }), _jsx("div", { className: `border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${dragOver ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"}`, onClick: () => !uploading && fileRef.current?.click(), onDragOver: (e) => { e.preventDefault(); setDragOver(true); }, onDragLeave: () => setDragOver(false), onDrop: handleDrop, children: uploading ? (_jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full border-[3px] border-emerald-300 border-t-emerald-600 animate-spin mx-auto" }), _jsx("p", { className: "text-sm font-semibold text-emerald-600", children: "\u0110ang t\u1EA3i l\u00EAn..." })] })) : (_jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx("div", { className: "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto", style: { background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)", color: "#14b8a6" }, children: _jsx("svg", { className: "w-8 h-8", fill: "none", stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }), _jsxs("div", { children: [_jsx("p", { className: "font-bold text-slate-700 text-sm", children: "Nh\u1EA5p ho\u1EB7c k\u00E9o file v\u00E0o \u0111\u00E2y" }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "PNG, JPG, WEBP t\u1ED1i \u0111a 10MB" })] })] })) }), _jsx("input", { ref: fileRef, type: "file", accept: "image/*", className: "hidden", onChange: handleUpload })] })), loading && (_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4", children: Array.from({ length: 6 }).map((_, i) => (_jsx("div", { className: "aspect-square rounded-2xl skeleton" }, i))) })), !loading && (images || []).length === 0 && (_jsxs("div", { className: "card text-center py-20 animate-fade-in", children: [_jsx("div", { className: "w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5", children: _jsx("svg", { className: "w-10 h-10 text-emerald-500", fill: "none", stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }), _jsx("p", { className: "font-black text-slate-700 text-lg mb-2", children: "Ch\u01B0a c\u00F3 h\u00ECnh \u1EA3nh n\u00E0o" }), _jsx("p", { className: "text-sm text-slate-400 max-w-xs mx-auto mb-6", children: "T\u1EA3i l\u00EAn h\u00ECnh \u1EA3nh nha khoa \u0111\u1EA7u ti\u00EAn c\u1EE7a b\u1EA1n \u0111\u1EC3 theo d\u00F5i qu\u00E1 tr\u00ECnh \u0111i\u1EC1u tr\u1ECB" }), _jsxs("button", { onClick: () => setShowUploadPanel(true), className: "btn-emerald", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2.5, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M12 4v16m8-8H4" }) }), "T\u1EA3i l\u00EAn h\u00ECnh \u1EA3nh"] })] })), !loading && (images || []).length > 0 && (_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4", children: (images || []).map((img) => {
                                    const cfg = typeConfig[img.type] || typeConfig.photo;
                                    return (_jsxs("div", { className: "group relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in", style: { boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.06)" }, children: [_jsx("img", { src: img.url, alt: img.description || "Dental image", className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-110", onClick: () => setPreview(img) }), _jsxs("div", { className: "absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-between p-3", children: [_jsx("button", { onClick: (e) => { e.stopPropagation(); imageApi.delete(img.id); refetch(); }, className: "self-end w-8 h-8 rounded-xl bg-red-500/90 text-white flex items-center justify-center text-xs hover:bg-red-600 transition backdrop-blur-sm", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M6 18L18 6M6 6l12 12" }) }) }), _jsxs("div", { children: [_jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm", children: [_jsx("span", { children: cfg.emoji }), cfg.label] }), img.description && (_jsx("p", { className: "text-white/80 text-[10px] mt-1 leading-relaxed", children: img.description })), img.uploadedAt && (_jsx("p", { className: "text-white/50 text-[10px] mt-0.5", children: new Date(img.uploadedAt).toLocaleDateString("vi-VN") }))] })] })] }, img.id));
                                }) }))] }), preview && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in", style: { background: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)" }, onClick: () => setPreview(null), children: _jsxs("div", { className: "relative max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl animate-scale-in", onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: () => setPreview(null), className: "absolute top-4 right-4 z-10 w-10 h-10 rounded-xl bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition backdrop-blur-sm", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M6 18L18 6M6 6l12 12" }) }) }), _jsx("img", { src: preview.url, alt: preview.description || "Dental image", className: "w-full max-h-[65vh] object-contain bg-slate-900" }), _jsx("div", { className: "p-6 bg-white", children: _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-bold text-slate-800 flex items-center gap-2", children: [(() => {
                                                                const cfg = typeConfig[preview.type] || typeConfig.photo;
                                                                return (_jsx("span", { className: "w-8 h-8 rounded-lg flex items-center justify-center text-lg", style: { background: `${cfg.color}15`, color: cfg.color }, children: cfg.emoji }));
                                                            })(), (typeConfig[preview.type] || typeConfig.photo).label] }), preview.uploadedAt && (_jsx("p", { className: "text-sm text-slate-400 mt-1", children: new Date(preview.uploadedAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" }) })), preview.description && _jsx("p", { className: "text-sm text-slate-500 mt-1", children: preview.description })] }), _jsx("button", { onClick: () => setPreview(null), className: "px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition flex-shrink-0", children: "\u0110\u00F3ng" })] }) })] }) }))] })] }));
}
