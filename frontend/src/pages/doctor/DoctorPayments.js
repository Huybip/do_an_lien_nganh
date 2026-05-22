import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import DoctorSidebar from "../../components/layout/DoctorSidebar";
import { paymentApi, patientApi } from "../../services/api";
const methodLabels = {
    cash: "Tiền mặt",
    bank_transfer: "Chuyển khoản",
    momo: "MoMo",
    vnpay: "VNPay",
    zalo_pay: "ZaloPay",
    insurance: "Bảo hiểm",
    other: "Khác",
};
const methodColors = {
    cash: "#10b981",
    bank_transfer: "#0ea5e9",
    momo: "#ec4899",
    vnpay: "#6366f1",
    zalo_pay: "#06b6d4",
    insurance: "#f59e0b",
    other: "#8b5cf6",
};
const statusConfig = {
    pending: { label: "Chờ thanh toán", bg: "bg-amber-50", text: "text-amber-700" },
    paid: { label: "Đã thanh toán", bg: "bg-emerald-50", text: "text-emerald-700" },
    failed: { label: "Thất bại", bg: "bg-red-50", text: "text-red-700" },
    refunded: { label: "Đã hoàn tiền", bg: "bg-blue-50", text: "text-blue-700" },
    cancelled: { label: "Đã hủy", bg: "bg-slate-100", text: "text-slate-600" },
};
export default function DoctorPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    useEffect(() => {
        loadPayments();
    }, []);
    const loadPayments = async () => {
        setLoading(true);
        try {
            const res = await paymentApi.getAll();
            const data = res.data?.data?.data || res.data?.data || [];
            setPayments(Array.isArray(data) ? data : []);
        }
        catch {
            setPayments([]);
        }
        finally {
            setLoading(false);
        }
    };
    const filtered = payments.filter((p) => {
        const matchSearch = !search ||
            p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
            p.invoiceNumber?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "all" || p.status === filterStatus;
        return matchSearch && matchStatus;
    });
    const totalRevenue = filtered
        .filter((p) => p.status === "paid")
        .reduce((s, p) => s + p.amount, 0);
    const handleShowQR = (p) => {
        setSelectedPayment(p);
        setShowQRModal(true);
    };
    return (_jsxs("div", { className: "flex min-h-screen", style: { background: "linear-gradient(145deg, #f5f3ff 0%, #ede9fe 40%, #f0f9ff 100%)" }, children: [_jsx(DoctorSidebar, {}), _jsxs("div", { className: "flex-1 lg:ml-0 min-w-0", children: [_jsxs("div", { className: "glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-slate-800", children: "Thanh to\u00E1n" }), _jsxs("p", { className: "text-xs text-slate-400 mt-0.5", children: [payments.length, " phi\u1EBFu thanh to\u00E1n"] })] }), _jsxs("button", { onClick: () => setShowQRModal(true), className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg", style: { background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 14px rgba(124,58,237,0.4)" }, children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" }) }), "QR MBBank"] })] }), _jsxs("div", { className: "p-6 lg:p-8 space-y-5", children: [_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
                                    { label: "Tổng phiếu", value: payments.length, color: "#7c3aed" },
                                    { label: "Đã thanh toán", value: payments.filter((p) => p.status === "paid").length, color: "#10b981" },
                                    { label: "Chờ thanh toán", value: payments.filter((p) => p.status === "pending").length, color: "#f59e0b" },
                                    { label: "Doanh thu", value: totalRevenue.toLocaleString("vi-VN") + " đ", color: "#0ea5e9" },
                                ].map((s) => (_jsxs("div", { className: "card p-4 text-center border border-slate-100", children: [_jsx("p", { className: "text-2xl font-black", style: { color: s.color }, children: s.value }), _jsx("p", { className: "text-xs font-semibold text-slate-400 mt-1", children: s.label })] }, s.label))) }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 items-start sm:items-center", children: [_jsxs("div", { className: "card card-hover p-3 flex-1 border border-slate-100 flex items-center gap-3", children: [_jsx("svg", { className: "w-5 h-5 text-slate-400", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), _jsx("input", { className: "flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none", placeholder: "T\u00ECm theo t\u00EAn ho\u1EB7c m\u00E3 h\u00F3a \u0111\u01A1n...", value: search, onChange: (e) => setSearch(e.target.value) }), search && (_jsx("button", { onClick: () => setSearch(""), className: "w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 flex items-center justify-center", children: _jsx("svg", { className: "w-3 h-3", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M6 18L18 6M6 6l12 12" }) }) }))] }), _jsx("div", { className: "flex items-center gap-2 flex-wrap", children: ["all", "paid", "pending"].map((s) => (_jsx("button", { onClick: () => setFilterStatus(s), className: `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === s ? "text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`, style: filterStatus === s ? { background: "linear-gradient(135deg, #7c3aed, #6d28d9)" } : {}, children: s === "all" ? "Tất cả" : statusConfig[s]?.label || s }, s))) })] }), !loading && filtered.length === 0 && (_jsxs("div", { className: "card text-center py-16", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", style: { background: "linear-gradient(135deg, #7c3aed15, #6d28d915)" }, children: _jsx("svg", { className: "w-8 h-8 text-violet-500", fill: "none", stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" }) }) }), _jsx("p", { className: "font-black text-slate-700 text-lg mb-2", children: "Ch\u01B0a c\u00F3 phi\u1EBFu thanh to\u00E1n" }), _jsx("p", { className: "text-sm text-slate-400", children: "Danh s\u00E1ch thanh to\u00E1n s\u1EBD hi\u1EC3n th\u1ECB t\u1EA1i \u0111\u00E2y" })] })), !loading && filtered.length > 0 && (_jsx("div", { className: "card overflow-hidden border border-slate-100", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsx("tr", { className: "bg-slate-50 border-b border-slate-100", children: ["Mã hóa đơn", "Bệnh nhân", "Số tiền", "Phương thức", "Trạng thái", "Ngày thanh toán", "Thao tác"].map((h) => (_jsx("th", { className: "px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider", children: h }, h))) }) }), _jsx("tbody", { children: filtered.map((p, i) => {
                                                    const cfg = statusConfig[p.status] || statusConfig.pending;
                                                    return (_jsxs("tr", { className: "border-b border-slate-50 hover:bg-slate-50 transition", children: [_jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: "font-mono text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-lg", children: p.invoiceNumber }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("p", { className: "font-semibold text-slate-800", children: p.patientName }) }), _jsxs("td", { className: "px-4 py-3 font-bold text-slate-800", children: [p.amount.toLocaleString("vi-VN"), " \u0111"] }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", style: { background: `${methodColors[p.method]}15`, color: methodColors[p.method] }, children: methodLabels[p.method] || p.method }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`, children: cfg.label }) }), _jsx("td", { className: "px-4 py-3 text-slate-500 text-xs", children: p.paidAt ? new Date(p.paidAt).toLocaleDateString("vi-VN") : "—" }), _jsx("td", { className: "px-4 py-3", children: _jsx("button", { onClick: () => handleShowQR(p), className: "px-3 py-1.5 rounded-lg text-violet-700 hover:bg-violet-50 font-medium text-xs transition border border-violet-200 bg-violet-50", children: "QR" }) })] }, p._id || i));
                                                }) })] }) }) })), loading && (_jsx("div", { className: "space-y-3", children: [...Array(3)].map((_, i) => (_jsx("div", { className: "h-14 rounded-xl skeleton" }, i))) }))] })] }), selectedPayment && (_jsx(QRModal, { payment: selectedPayment, open: showQRModal, onClose: () => { setShowQRModal(false); setSelectedPayment(null); } })), !selectedPayment && (_jsx(QRCreateModal, { open: showQRModal, onClose: () => setShowQRModal(false), onSuccess: loadPayments }))] }));
}
function QRModal({ payment, open, onClose }) {
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (open && payment.status === "pending") {
            generateQR();
        }
    }, [open]);
    const generateQR = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/payments/qr/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    amount: payment.amount,
                    invoiceNumber: payment.invoiceNumber,
                    patientName: payment.patientName,
                }),
            });
            const data = await res.json();
            if (data.success)
                setQrData(data.data);
        }
        catch { }
        finally {
            setLoading(false);
        }
    };
    if (!open)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-md w-full", children: [_jsxs("div", { className: "bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-bold text-slate-900", children: "QR Thanh to\u00E1n" }), _jsx("button", { onClick: onClose, className: "text-slate-400 hover:text-slate-600 text-xl", children: "\u2715" })] }), _jsx("div", { className: "p-6 space-y-4 text-center", children: loading ? (_jsx("div", { className: "py-8", children: "\u0110ang t\u1EA1o m\u00E3 QR..." })) : qrData ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "bg-white rounded-2xl p-4 inline-block shadow border border-slate-200", children: _jsx("img", { src: qrData.qrDataUrl, alt: "QR", className: "w-52 h-52" }) }), _jsxs("div", { className: "bg-violet-50 rounded-xl p-4", children: [_jsx("p", { className: "text-xs text-violet-600 font-semibold uppercase", children: "S\u1ED1 ti\u1EC1n" }), _jsxs("p", { className: "text-2xl font-black text-violet-700", children: [Number(qrData.amount).toLocaleString("vi-VN"), " \u0111"] })] }), _jsx("div", { className: "text-left bg-slate-50 rounded-xl p-3", children: [
                                    { label: "Ngân hàng", value: "MB Bank (MBB)" },
                                    { label: "STK", value: "280605666888" },
                                    { label: "Tên", value: "Nguyen Thai Son" },
                                ].map((item) => (_jsxs("div", { className: "flex justify-between py-1.5 border-b border-slate-100 last:border-0", children: [_jsx("span", { className: "text-xs text-slate-400", children: item.label }), _jsx("span", { className: "text-sm font-semibold text-slate-700", children: item.value })] }, item.label))) })] })) : (_jsxs("div", { className: "py-8 text-slate-500", children: [_jsxs("p", { children: ["M\u00E3 QR ch\u1EC9 hi\u1EC3n th\u1ECB cho phi\u1EBFu ", _jsx("strong", { children: "ch\u1EDD thanh to\u00E1n" }), "."] }), _jsxs("p", { className: "text-sm mt-2", children: ["Tr\u1EA1ng th\u00E1i hi\u1EC7n t\u1EA1i: ", _jsx("strong", { children: statusConfig[payment.status]?.label })] })] })) })] }) }));
}
function QRCreateModal({ open, onClose, onSuccess }) {
    const [amount, setAmount] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [patientName, setPatientName] = useState("");
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleGenerate = async () => {
        if (!amount)
            return;
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/payments/qr/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    amount: Number(amount),
                    invoiceNumber: invoiceNumber || undefined,
                    patientName: patientName || undefined,
                }),
            });
            const data = await res.json();
            if (data.success)
                setQrData(data.data);
        }
        catch { }
        finally {
            setLoading(false);
        }
    };
    if (!open)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-bold text-slate-900", children: "T\u1EA1o QR Thanh to\u00E1n MBBank" }), _jsx("button", { onClick: onClose, className: "text-slate-400 hover:text-slate-600 text-xl", children: "\u2715" })] }), _jsx("div", { className: "p-6 space-y-4", children: qrData ? (_jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "bg-white rounded-2xl p-4 inline-block shadow border border-slate-200", children: _jsx("img", { src: qrData.qrDataUrl, alt: "QR", className: "w-52 h-52" }) }), _jsxs("div", { className: "bg-emerald-50 rounded-xl p-4", children: [_jsx("p", { className: "text-xs text-emerald-600 font-bold uppercase", children: "S\u1ED1 ti\u1EC1n" }), _jsxs("p", { className: "text-3xl font-black text-emerald-700", children: [Number(qrData.amount).toLocaleString("vi-VN"), " \u0111"] })] }), _jsxs("div", { className: "bg-blue-50 rounded-xl p-4 text-left text-sm space-y-2", children: [_jsx("p", { className: "font-bold text-blue-700", children: "Th\u00F4ng tin t\u00E0i kho\u1EA3n:" }), _jsxs("p", { children: ["\uD83C\uDFE6 Ng\u00E2n h\u00E0ng: ", _jsx("strong", { children: "MB Bank (MBB)" })] }), _jsxs("p", { children: ["\uD83D\uDD22 STK: ", _jsx("strong", { children: "280605666888" })] }), _jsxs("p", { children: ["\uD83D\uDC64 T\u00EAn: ", _jsx("strong", { children: "Nguyen Thai Son" })] })] }), _jsx("button", { onClick: () => { setQrData(null); onSuccess(); }, className: "w-full py-2 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition", children: "T\u1EA1o QR kh\u00E1c" })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-4 text-white text-center", children: [_jsx("p", { className: "font-bold", children: "STK: 280605666888" }), _jsx("p", { className: "text-violet-100 text-sm", children: "Nguyen Thai Son - MBBank" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-slate-700 mb-1", children: "T\u00EAn b\u1EC7nh nh\u00E2n" }), _jsx("input", { className: "w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400", placeholder: "Nh\u1EADp t\u00EAn b\u1EC7nh nh\u00E2n", value: patientName, onChange: (e) => setPatientName(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-slate-700 mb-1", children: "M\u00E3 h\u00F3a \u0111\u01A1n" }), _jsx("input", { className: "w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400", placeholder: "VD: INV-202505-0001", value: invoiceNumber, onChange: (e) => setInvoiceNumber(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-slate-700 mb-1", children: "S\u1ED1 ti\u1EC1n (VN\u0110) *" }), _jsx("input", { type: "number", className: "w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400 font-semibold", placeholder: "0", value: amount, onChange: (e) => setAmount(e.target.value) })] }), _jsx("button", { onClick: handleGenerate, disabled: loading || !amount, className: "w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50", style: { background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }, children: loading ? "Đang tạo..." : "Tạo mã QR" })] })) })] }) }));
}
