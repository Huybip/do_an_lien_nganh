import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import Modal from "../../components/ui/Modal";
import { patientApi, scoreApi } from "../../services/api";
const getScoreColor = (score) => {
    if (score >= 80)
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", ring: "ring-emerald-400" };
    if (score >= 60)
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", ring: "ring-amber-400" };
    return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", ring: "ring-red-400" };
};
export default function AdminScores() {
    const [patients, setPatients] = useState([]);
    const [scores, setScores] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loadingPatients, setLoadingPatients] = useState(true);
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        setLoading(true);
        try {
            const res = await patientApi.getAll();
            const list = Array.isArray(res.data) ? res.data : [];
            setPatients(list);
            const scoreMap = new Map();
            await Promise.allSettled(list.map(async (p) => {
                const id = p._id || p.id;
                if (!id)
                    return;
                try {
                    const sRes = await scoreApi.getByPatient(id);
                    const s = sRes.data?.data;
                    if (s?._id)
                        scoreMap.set(id, s);
                }
                catch (_) { }
            }));
            setScores(scoreMap);
        }
        finally {
            setLoading(false);
            setLoadingPatients(false);
        }
    };
    const filtered = patients.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase()));
    const handleOpen = async (patient) => {
        setSelectedPatient(patient);
        setShowModal(true);
    };
    return (_jsxs("div", { className: "flex min-h-screen", style: { background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }, children: [_jsx(AdminSidebar, {}), _jsxs("div", { className: "flex-1 lg:ml-0 min-w-0", children: [_jsxs("div", { className: "glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-slate-800", children: "Qu\u1EA3n l\u00FD \u0111i\u1EC3m s\u1EE9c kh\u1ECFe r\u0103ng" }), _jsxs("p", { className: "text-xs text-slate-400 mt-0.5", children: [scores.size, " / ", patients.length, " b\u1EC7nh nh\u00E2n c\u00F3 \u0111i\u1EC3m s\u1EE9c kh\u1ECFe r\u0103ng"] })] }), _jsx("div", { className: "flex items-center gap-3", children: _jsxs("button", { onClick: loadData, className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }), "L\u00E0m m\u1EDBi"] }) })] }), _jsxs("div", { className: "p-6 lg:p-8 space-y-5", children: [_jsx("div", { className: "card card-hover p-4 border border-slate-100 animate-fade-in", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl flex items-center justify-center", style: { background: "linear-gradient(135deg, #0ea5e915, #0369a115)" }, children: _jsx("svg", { className: "w-5 h-5 text-sky-600", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }), _jsx("input", { className: "flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none", placeholder: "T\u00ECm ki\u1EBFm b\u1EC7nh nh\u00E2n theo t\u00EAn ho\u1EB7c email...", value: search, onChange: (e) => setSearch(e.target.value) }), search && (_jsx("button", { onClick: () => setSearch(""), className: "w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex items-center justify-center transition", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M6 18L18 6M6 6l12 12" }) }) }))] }) }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
                                    { label: "Tổng bệnh nhân", value: patients.length, color: "#0ea5e9" },
                                    { label: "Đã đánh giá", value: scores.size, color: "#10b981" },
                                    { label: "Chưa đánh giá", value: patients.length - scores.size, color: "#f59e0b" },
                                    { label: "Điểm TB", value: scores.size > 0 ? Math.round([...scores.values()].reduce((s, x) => s + x.overall, 0) / scores.size) + "%" : "—", color: "#8b5cf6" },
                                ].map((s) => (_jsxs("div", { className: "card p-4 text-center border border-slate-100 animate-scale-in", children: [_jsx("p", { className: "text-2xl font-black", style: { color: s.color }, children: s.value }), _jsx("p", { className: "text-xs font-semibold text-slate-400 mt-1", children: s.label })] }, s.label))) }), loading && (_jsx("div", { className: "space-y-3", children: [...Array(3)].map((_, i) => (_jsx("div", { className: "h-20 rounded-2xl skeleton" }, i))) })), !loading && filtered.length === 0 && (_jsxs("div", { className: "card text-center py-20 animate-fade-in", children: [_jsx("div", { className: "w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5", style: { background: "linear-gradient(135deg, #0ea5e915, #0369a115)" }, children: _jsx("svg", { className: "w-10 h-10 text-sky-500", fill: "none", stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }) }), _jsx("p", { className: "font-black text-slate-700 text-lg mb-2", children: "Kh\u00F4ng t\u00ECm th\u1EA5y b\u1EC7nh nh\u00E2n" }), _jsx("p", { className: "text-sm text-slate-400 max-w-xs mx-auto", children: search ? "Thử thay đổi từ khóa tìm kiếm" : "Danh sách bệnh nhân đang trống" })] })), !loading && filtered.length > 0 && (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: filtered.map((patient, index) => {
                                    // userId: the User ID for DentalScore API calls
                                    // patient.user is a populated object { _id, name, email } from Patient.user field
                                    const userId = patient.user?._id || patient._id;
                                    const score = userId ? scores.get(userId) : null;
                                    const cfg = score ? getScoreColor(score.overall) : null;
                                    return (_jsx("div", { className: "card card-hover border border-slate-100 animate-fade-in overflow-hidden", style: { animationDelay: `${index * 50}ms` }, children: _jsxs("div", { className: "p-5", children: [_jsxs("div", { className: "flex items-start gap-4 mb-4", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-lg font-bold shadow-md flex-shrink-0", children: patient.name?.charAt(0)?.toUpperCase() || "?" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-bold text-slate-800 truncate", children: patient.name }), _jsx("p", { className: "text-sm text-slate-400 truncate", children: patient.email })] }), _jsxs("span", { className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${score ? cfg.bg + " " + cfg.text : "bg-slate-100 text-slate-500"}`, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${score ? cfg.ring?.replace("ring", "bg") : "bg-slate-400"}` }), score ? "Đã đánh giá" : "Chưa đánh giá"] })] }), score ? (_jsx("div", { className: "grid grid-cols-3 gap-2 mb-4", children: [
                                                        { label: "Tổng", value: score.overall },
                                                        { label: "Nướu", value: score.gumHealth },
                                                        { label: "Sạch", value: score.cleanliness },
                                                    ].map((item) => {
                                                        const c = getScoreColor(item.value);
                                                        return (_jsxs("div", { className: `text-center p-2 rounded-lg border ${c.bg} ${c.border}`, children: [_jsx("p", { className: "text-lg font-black", style: { color: c.text.replace("text-", "") === "emerald-700" ? "#047857" : c.text.replace("text-", "") === "amber-700" ? "#b45309" : "#b91c1c" }, children: item.value }), _jsx("p", { className: "text-[10px] font-semibold text-slate-400", children: item.label })] }, item.label));
                                                    }) })) : (_jsx("div", { className: "bg-slate-50 rounded-lg p-3 mb-4 text-center", children: _jsx("p", { className: "text-xs text-slate-400", children: "Ch\u01B0a c\u00F3 \u0111i\u1EC3m s\u1EE9c kh\u1ECFe r\u0103ng" }) })), _jsx("button", { onClick: () => handleOpen(patient), className: "w-full px-4 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95", style: { background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)", boxShadow: "0 4px 12px rgba(14,165,233,0.35)" }, children: score ? "Cập nhật điểm răng" : "Tạo điểm răng" })] }) }, patient._id || index));
                                }) }))] })] }), selectedPatient && (_jsx(ScoreModal, { patient: selectedPatient, open: showModal, onClose: () => { setShowModal(false); setSelectedPatient(null); }, onSaved: () => loadData() }))] }));
}
function ScoreModal({ patient, open, onClose, onSaved }) {
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [formData, setFormData] = useState({
        overall: 70, gumHealth: 70, toothDecay: 70,
        alignment: 70, cleanliness: 70,
        recommendations: "", nextCheckupDate: "", reason: "",
    });
    // userId: the User ID for DentalScore API calls
    const patientId = patient.user?._id || patient._id;
    const loadScore = async () => {
        if (!patientId)
            return;
        setLoading(true);
        try {
            const res = await scoreApi.getByPatient(patientId);
            const s = res.data?.data;
            setScore(s);
            if (s) {
                setFormData({
                    overall: s.overall ?? 70,
                    gumHealth: s.gumHealth ?? 70,
                    toothDecay: s.toothDecay ?? 70,
                    alignment: s.alignment ?? 70,
                    cleanliness: s.cleanliness ?? 70,
                    recommendations: s.recommendations?.join(", ") || "",
                    nextCheckupDate: s.nextCheckupDate || "",
                    reason: "",
                });
            }
        }
        catch {
            // No score yet — that's ok, we'll create one
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (open) {
            loadScore();
            setIsEditing(false);
        }
    }, [open]);
    const handleSave = async () => {
        if (!patientId)
            return;
        if (isEditing && !formData.reason.trim()) {
            alert("Vui lòng nhập lý do chỉnh sửa");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                overall: Number(formData.overall),
                gumHealth: Number(formData.gumHealth),
                toothDecay: Number(formData.toothDecay),
                alignment: Number(formData.alignment),
                cleanliness: Number(formData.cleanliness),
                recommendations: formData.recommendations
                    .split(",").map((r) => r.trim()).filter(Boolean),
                nextCheckupDate: formData.nextCheckupDate || null,
                reason: formData.reason,
            };
            await scoreApi.editScore(patientId, payload);
            await loadScore();
            setIsEditing(false);
            setFormData((prev) => ({ ...prev, reason: "" }));
            onSaved();
        }
        catch (err) {
            alert(err.response?.data?.message || "Cập nhật thất bại");
        }
        finally {
            setLoading(false);
        }
    };
    if (!open)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "sticky top-0 bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-slate-900", children: "\u0110i\u1EC3m s\u1EE9c kh\u1ECFe r\u0103ng" }), _jsxs("p", { className: "text-sm text-slate-500 mt-1", children: [patient.name, " \u00B7 ", patient.email] })] }), _jsx("button", { onClick: onClose, className: "text-slate-400 hover:text-slate-600 text-2xl", children: "\u2715" })] }), _jsxs("div", { className: "p-6", children: [loading && !score && (_jsxs("div", { className: "flex items-center justify-center py-12", children: [_jsx("div", { className: "w-8 h-8 border-2 border-sky-400 border-t-sky-600 rounded-full animate-spin mx-auto mb-2" }), _jsx("p", { className: "text-slate-500 text-center", children: "\u0110ang t\u1EA3i..." })] })), score && (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-6", children: [
                                        { label: "Tổng thể", key: "overall", color: "#0ea5e9" },
                                        { label: "Sức khỏe nướu", key: "gumHealth", color: "#10b981" },
                                        { label: "Sâu răng", key: "toothDecay", color: "#ef4444" },
                                        { label: "Răng đều", key: "alignment", color: "#8b5cf6" },
                                        { label: "Vệ sinh", key: "cleanliness", color: "#f59e0b" },
                                    ].map(({ label, key, color }) => {
                                        const val = score[key] ?? 70;
                                        const c = getScoreColor(val);
                                        return (_jsxs("div", { className: `p-4 rounded-lg border ${c.bg} ${c.border}`, children: [_jsx("p", { className: "text-xs text-slate-500 mb-1", children: label }), isEditing ? (_jsx("input", { type: "number", min: 0, max: 100, value: formData[key], onChange: (e) => setFormData({ ...formData, [key]: Number(e.target.value) }), className: "w-full px-2 py-1 border border-slate-300 rounded text-lg font-bold text-center" })) : (_jsx("p", { className: "text-2xl font-black", style: { color }, children: val }))] }, key));
                                    }) }), score.lastAssessedAt && (_jsxs("div", { className: "bg-slate-50 p-3 rounded-lg mb-4 text-sm text-slate-600", children: [_jsx("span", { className: "font-medium", children: "\u0110\u00E1nh gi\u00E1 l\u1EA7n cu\u1ED1i:" }), " ", new Date(score.lastAssessedAt).toLocaleDateString("vi-VN"), score.lastAssessedBy?.name && _jsxs(_Fragment, { children: [" b\u1EDFi ", score.lastAssessedBy.name] })] })), isEditing && (_jsxs("div", { className: "bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-800 mb-1", children: "Ng\u00E0y t\u00E1i kh\u00E1m" }), _jsx("input", { type: "date", value: formData.nextCheckupDate, onChange: (e) => setFormData({ ...formData, nextCheckupDate: e.target.value }), className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-800 mb-1", children: "Khuy\u1EBFn ngh\u1ECB (ph\u00E2n c\u00E1ch b\u1EB1ng d\u1EA5u ph\u1EA9y)" }), _jsx("textarea", { value: formData.recommendations, onChange: (e) => setFormData({ ...formData, recommendations: e.target.value }), placeholder: "V\u00ED d\u1EE5: Ch\u1EA3i r\u0103ng 2 l\u1EA7n/ng\u00E0y, D\u00F9ng ch\u1EC9 nha khoa", className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-20 resize-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-800 mb-1", children: "L\u00FD do ch\u1EC9nh s\u1EEDa *" }), _jsx("textarea", { value: formData.reason, onChange: (e) => setFormData({ ...formData, reason: e.target.value }), placeholder: "T\u1EA1i sao b\u1EA1n thay \u0111\u1ED5i \u0111i\u1EC3m s\u1ED1?", className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-20 resize-none", required: true })] })] })), !isEditing && score.recommendations?.length > 0 && (_jsxs("div", { className: "bg-green-50 p-4 rounded-lg border border-green-200 mb-6", children: [_jsx("p", { className: "font-medium text-slate-800 mb-2 text-sm", children: "Khuy\u1EBFn ngh\u1ECB:" }), _jsx("ul", { className: "space-y-1", children: score.recommendations.map((r, i) => (_jsxs("li", { className: "text-sm text-slate-600 flex items-start gap-2", children: [_jsx("span", { className: "text-green-600 mt-0.5", children: "\u2713" }), " ", r] }, i))) })] })), !isEditing && score.nextCheckupDate && (_jsxs("div", { className: "bg-amber-50 p-3 rounded-lg mb-6 border border-amber-200 text-sm text-slate-800", children: [_jsx("span", { className: "font-medium", children: "T\u00E1i kh\u00E1m:" }), " ", score.nextCheckupDate] })), score.editHistory && score.editHistory.length > 0 && (_jsxs("div", { className: "mb-6", children: [_jsxs("button", { onClick: () => setShowHistory(!showHistory), className: "text-sm text-sky-600 hover:text-sky-700 font-medium", children: [showHistory ? "Ẩn" : "Xem", " l\u1ECBch s\u1EED ch\u1EC9nh s\u1EEDa (", score.editHistory.length, ")"] }), showHistory && (_jsx("div", { className: "mt-3 space-y-2 bg-slate-50 p-3 rounded-lg max-h-40 overflow-y-auto", children: score.editHistory.map((h, i) => (_jsxs("div", { className: "text-xs border-l-2 border-sky-300 pl-3", children: [_jsxs("p", { className: "font-semibold text-slate-700", children: [h.doctorName, " \u2014 ", new Date(h.editedAt).toLocaleDateString("vi-VN")] }), _jsx("p", { className: "text-slate-400", children: h.reason })] }, i))) }))] })), _jsx("div", { className: "flex gap-3", children: !isEditing ? (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setIsEditing(true), className: "flex-1 btn-primary", children: "Ch\u1EC9nh s\u1EEDa \u0111i\u1EC3m" }), _jsx("button", { onClick: onClose, className: "flex-1 btn-secondary", children: "\u0110\u00F3ng" })] })) : (_jsxs(_Fragment, { children: [_jsx("button", { onClick: handleSave, disabled: loading, className: "flex-1 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50", children: loading ? "Đang lưu..." : "Lưu thay đổi" }), _jsx("button", { onClick: () => { setIsEditing(false); setFormData((p) => ({ ...p, reason: "" })); }, className: "flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition", children: "H\u1EE7y" })] })) })] }))] })] }) }));
}
