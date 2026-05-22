import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import PatientSidebar from "../../components/layout/PatientSidebar";
import { paymentApi } from "../../services/api";
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
export default function PatientPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQR, setShowQR] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);
    useEffect(() => {
        loadPayments();
    }, []);
    const loadPayments = async () => {
        setLoading(true);
        try {
            const res = await paymentApi.getMine();
            const data = res.data?.data || res.data || [];
            setPayments(Array.isArray(data) ? data : []);
        }
        catch {
            setPayments([]);
        }
        finally {
            setLoading(false);
        }
    };
    const totalPaid = payments
        .filter((p) => p.status === "paid")
        .reduce((s, p) => s + p.amount, 0);
    const totalPending = payments
        .filter((p) => p.status === "pending")
        .reduce((s, p) => s + p.amount, 0);
    const handleShowQR = async (amount, invoiceNumber) => {
        setQrLoading(true);
        setShowQR(true);
        try {
            const res = await fetch("http://localhost:5000/api/payments/qr/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ amount, invoiceNumber }),
            });
            const data = await res.json();
            if (data.success)
                setQrData(data.data);
        }
        catch { }
        finally {
            setQrLoading(false);
        }
    };
    return (_jsxs("div", { className: "flex min-h-screen", style: { background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f5fffe 100%)" }, children: [_jsx(PatientSidebar, {}), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3", children: _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-slate-800", children: "Thanh to\u00E1n" }), _jsxs("p", { className: "text-xs text-slate-400 mt-0.5", children: [payments.length, " phi\u1EBFu thanh to\u00E1n"] })] }) }), _jsxs("div", { className: "p-6 lg:p-8 space-y-5", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "card p-4 text-center border border-slate-100", children: [_jsx("p", { className: "text-2xl font-black text-emerald-600", children: payments.length }), _jsx("p", { className: "text-xs font-semibold text-slate-400 mt-1", children: "T\u1ED5ng phi\u1EBFu" })] }), _jsxs("div", { className: "card p-4 text-center border border-slate-100", children: [_jsx("p", { className: "text-2xl font-black text-emerald-600", children: totalPaid.toLocaleString("vi-VN") }), _jsx("p", { className: "text-xs font-semibold text-slate-400 mt-1", children: "\u0110\u00E3 thanh to\u00E1n (\u0111)" })] }), _jsxs("div", { className: "card p-4 text-center border border-slate-100", children: [_jsx("p", { className: "text-2xl font-black text-amber-600", children: totalPending.toLocaleString("vi-VN") }), _jsx("p", { className: "text-xs font-semibold text-slate-400 mt-1", children: "Ch\u1EDD thanh to\u00E1n (\u0111)" })] })] }), payments.filter((p) => p.status === "pending").length > 0 && (_jsxs("div", { className: "space-y-3", children: [_jsxs("h3", { className: "text-base font-bold text-slate-800 flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-amber-500 animate-pulse" }), "Phi\u1EBFu ch\u1EDD thanh to\u00E1n"] }), payments
                                        .filter((p) => p.status === "pending")
                                        .map((p) => (_jsx("div", { className: "card border border-amber-200 bg-amber-50/30 overflow-hidden", children: _jsxs("div", { className: "p-5", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { children: [_jsx("span", { className: "font-mono text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-lg", children: p.invoiceNumber }), _jsx("p", { className: "text-sm text-slate-500 mt-1", children: new Date(p.createdAt).toLocaleDateString("vi-VN") })] }), _jsx("span", { className: "text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full", children: "Ch\u1EDD thanh to\u00E1n" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-400", children: "S\u1ED1 ti\u1EC1n c\u1EA7n thanh to\u00E1n" }), _jsxs("p", { className: "text-2xl font-black text-amber-700", children: [p.amount.toLocaleString("vi-VN"), " \u0111"] })] }), _jsx("button", { onClick: () => handleShowQR(p.amount, p.invoiceNumber), className: "px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5", style: { background: "linear-gradient(135deg, #059669, #10b981)", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }, children: "Thanh to\u00E1n QR" })] })] }) }, p._id)))] })), loading ? (_jsx("div", { className: "space-y-3", children: [...Array(3)].map((_, i) => _jsx("div", { className: "h-20 rounded-xl skeleton" }, i)) })) : payments.length === 0 ? (_jsxs("div", { className: "card text-center py-16", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4", style: { background: "linear-gradient(135deg, #05966915, #10b98115)" }, children: _jsx("svg", { className: "w-8 h-8 text-emerald-500", fill: "none", stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" }) }) }), _jsx("p", { className: "font-black text-slate-700 text-lg mb-2", children: "Ch\u01B0a c\u00F3 phi\u1EBFu thanh to\u00E1n" }), _jsx("p", { className: "text-sm text-slate-400", children: "C\u00E1c phi\u1EBFu thanh to\u00E1n s\u1EBD hi\u1EC3n th\u1ECB t\u1EA1i \u0111\u00E2y" })] })) : (_jsx("div", { className: "space-y-3", children: payments
                                    .filter((p) => p.status !== "pending")
                                    .map((p) => {
                                    const cfg = statusConfig[p.status] || statusConfig.paid;
                                    return (_jsx("div", { className: "card border border-slate-100 overflow-hidden", children: _jsxs("div", { className: "p-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 rounded-xl flex items-center justify-center", style: { background: `${methodColors[p.method]}15` }, children: _jsx("span", { style: { color: methodColors[p.method] }, className: "text-lg", children: "\uD83D\uDCB3" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-800", children: methodLabels[p.method] || p.method }), _jsx("p", { className: "text-xs text-slate-400 font-mono", children: p.invoiceNumber })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-black text-slate-800", children: [p.amount.toLocaleString("vi-VN"), " \u0111"] }), _jsx("span", { className: `inline-block text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`, children: cfg.label })] })] }) }, p._id));
                                }) }))] })] }), showQR && (_jsx("div", { className: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-sm w-full", children: [_jsxs("div", { className: "bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-bold text-slate-900", children: "Qu\u00E9t m\u00E3 QR \u0111\u1EC3 thanh to\u00E1n" }), _jsx("button", { onClick: () => { setShowQR(false); setQrData(null); }, className: "text-slate-400 hover:text-slate-600 text-xl", children: "\u2715" })] }), _jsx("div", { className: "p-6 space-y-4 text-center", children: qrLoading ? (_jsx("div", { className: "py-8 text-slate-500", children: "\u0110ang t\u1EA1o m\u00E3 QR..." })) : qrData ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "bg-white rounded-2xl p-4 inline-block shadow border border-slate-200", children: _jsx("img", { src: qrData.qrDataUrl, alt: "QR", className: "w-52 h-52" }) }), _jsxs("div", { className: "bg-emerald-50 rounded-xl p-4", children: [_jsx("p", { className: "text-xs text-emerald-600 font-bold uppercase", children: "S\u1ED1 ti\u1EC1n c\u1EA7n thanh to\u00E1n" }), _jsxs("p", { className: "text-3xl font-black text-emerald-700", children: [Number(qrData.amount).toLocaleString("vi-VN"), " \u0111"] })] }), _jsxs("div", { className: "bg-blue-50 rounded-xl p-4 text-left text-sm space-y-2", children: [_jsx("p", { className: "font-bold text-blue-700", children: "Th\u00F4ng tin t\u00E0i kho\u1EA3n:" }), _jsxs("p", { children: ["\uD83C\uDFE6 Ng\u00E2n h\u00E0ng: ", _jsx("strong", { children: "MB Bank (MBB)" })] }), _jsxs("p", { children: ["\uD83D\uDD22 STK: ", _jsx("strong", { children: "280605666888" })] }), _jsxs("p", { children: ["\uD83D\uDC64 T\u00EAn: ", _jsx("strong", { children: "Nguyen Thai Son" })] }), _jsxs("p", { children: ["\uD83D\uDCDD N\u1ED9i dung: ", _jsx("strong", { children: qrData.addInfo })] })] }), _jsx("div", { className: "bg-amber-50 rounded-xl p-3 text-xs text-amber-700", children: "Sau khi chuy\u1EC3n kho\u1EA3n th\u00E0nh c\u00F4ng, vui l\u00F2ng mang bi\u00EAn la\u1EA1i \u0111\u1EBFn qu\u1EA7y \u0111\u1EC3 x\u00E1c nh\u1EADn thanh to\u00E1n." })] })) : null })] }) }))] }));
}
