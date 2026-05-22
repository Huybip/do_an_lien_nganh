import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
const faqData = [
    {
        id: 1,
        question: "Làm cách nào để tạo một lịch hẹn mới?",
        answer: "Bạn có thể tạo lịch hẹn bằng cách vào mục 'Lịch hẹn' và nhấp nút 'Thêm lịch hẹn'. Sau đó điền các thông tin bắt buộc như bệnh nhân, bác sĩ, ngày giờ và dịch vụ.",
        icon: "📅",
    },
    {
        id: 2,
        question: "Cách thay đổi trạng thái lịch hẹn?",
        answer: "Trong mục 'Lịch hẹn', bạn có thể nhấp vào trạng thái của lịch hẹn (Chờ, Xác nhận, Hoàn tất, Hủy) để thay đổi. Hệ thống sẽ tự động gửi thông báo đến bệnh nhân.",
        icon: "🔄",
    },
    {
        id: 3,
        question: "Làm sao để xuất báo cáo?",
        answer: "Vào mục 'Báo cáo', chọn kỳ báo cáo (Tháng/Năm) rồi nhấp 'Xuất CSV', 'Xuất TXT' hoặc 'In' để tải báo cáo.",
        icon: "📊",
    },
    {
        id: 4,
        question: "Làm cách nào quản lý người dùng?",
        answer: "Trong mục 'Người dùng', bạn có thể xem danh sách tất cả người dùng, thêm mới, chỉnh sửa thông tin hoặc xóa tài khoản.",
        icon: "👥",
    },
    {
        id: 5,
        question: "Cách cập nhật thông tin bác sĩ?",
        answer: "Vào mục 'Bác sĩ', chọn bác sĩ cần cập nhật, nhấp 'Chỉnh sửa' và thay đổi các thông tin cần thiết.",
        icon: "👨‍⚕️",
    },
    {
        id: 6,
        question: "Làm sao thêm dịch vụ mới?",
        answer: "Trong mục 'Dịch vụ', nhấp nút 'Thêm dịch vụ' và nhập tên dịch vụ, mô tả, giá cả. Dịch vụ sẽ được kích hoạt ngay.",
        icon: "🏥",
    },
    {
        id: 7,
        question: "Chế độ bảo trì là gì?",
        answer: "Chế độ bảo trì cho phép bạn tạm thời ẩn website khỏi người dùng khi cần cập nhật hoặc bảo trì hệ thống. Bạn có thể bật nó trong mục 'Cài đặt' > 'Bảo mật'.",
        icon: "🔧",
    },
    {
        id: 8,
        question: "Làm cách nào đặt lại mật khẩu?",
        answer: "Liên hệ với quản trị viên hệ thống hoặc sử dụng chức năng 'Quên mật khẩu' trên trang đăng nhập.",
        icon: "🔑",
    },
];
export default function AdminHelp() {
    const [expandedId, setExpandedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedback, setFeedback] = useState("");
    const filteredFAQ = faqData.filter((item) => item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase()));
    const handleSubmitFeedback = (e) => {
        e.preventDefault();
        alert("Cảm ơn bạn đã gửi phản hồi!");
        setFeedback("");
        setShowFeedbackForm(false);
    };
    const quickLinks = [
        {
            title: "Hướng dẫn sử dụng",
            desc: "Tài liệu chi tiết cho quản trị viên",
            icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" }) })),
            color: "sky",
            gradient: "from-sky-400 to-blue-500",
        },
        {
            title: "Video hướng dẫn",
            desc: "Hướng dẫn bằng hình ảnh trực quan",
            icon: (_jsxs("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })] })),
            color: "violet",
            gradient: "from-violet-400 to-purple-500",
        },
        {
            title: "API Documentation",
            desc: "Tài liệu kỹ thuật cho developers",
            icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" }) })),
            color: "emerald",
            gradient: "from-emerald-400 to-teal-500",
        },
        {
            title: "Chính sách & Điều khoản",
            desc: "Quy định và điều khoản sử dụng",
            icon: (_jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) })),
            color: "amber",
            gradient: "from-amber-400 to-orange-500",
        },
    ];
    return (_jsxs("div", { className: "flex h-screen", style: { background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }, children: [_jsx(AdminSidebar, {}), _jsxs("div", { className: "flex-1 lg:ml-0 min-w-0 overflow-y-auto", children: [_jsx("div", { className: "glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50", children: _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-slate-800", children: "Tr\u1EE3 gi\u00FAp & H\u1ED7 tr\u1EE3" }), _jsx("p", { className: "text-sm text-slate-400 mt-0.5", children: "T\u00ECm hi\u1EC3u c\u00E1ch s\u1EED d\u1EE5ng h\u1EC7 th\u1ED1ng qu\u1EA3n l\u00FD ph\u00F2ng kh\u00E1m" })] }) }), _jsxs("div", { className: "p-6 lg:p-8 animate-fade-in", children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: quickLinks.map((link, index) => (_jsxs("button", { className: "card card-hover p-5 text-left animate-scale-in", style: { animationDelay: `${index * 100}ms` }, children: [_jsx("div", { className: `w-12 h-12 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center text-white mb-4 shadow-lg`, children: link.icon }), _jsx("h3", { className: "font-bold text-slate-800 mb-1", children: link.title }), _jsx("p", { className: "text-xs text-slate-500", children: link.desc })] }, link.title))) }), _jsx("div", { className: "card card-hover p-5 mb-8 animate-scale-in", style: { animationDelay: "200ms" }, children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-4", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx("svg", { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), _jsx("input", { type: "text", placeholder: "T\u00ECm ki\u1EBFm c\u00E2u h\u1ECFi th\u01B0\u1EDDng g\u1EB7p...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all" })] }), _jsx("div", { className: "flex gap-2", children: _jsxs("span", { className: "px-4 py-2 bg-sky-50 text-sky-700 rounded-xl text-sm font-medium border border-sky-200", children: [filteredFAQ.length, " c\u00E2u h\u1ECFi"] }) })] }) }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8", children: filteredFAQ.map((item, index) => (_jsxs("div", { className: `card p-0 overflow-hidden animate-scale-in transition-all ${expandedId === item.id ? "ring-2 ring-sky-300" : ""}`, style: { animationDelay: `${(index + 3) * 100}ms` }, children: [_jsxs("button", { onClick: () => setExpandedId(expandedId === item.id ? null : item.id), className: "w-full flex items-start gap-4 p-5 hover:bg-slate-50 transition-all text-left", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-lg shrink-0 shadow-md", children: item.icon }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "font-semibold text-slate-800 mb-1 line-clamp-2", children: item.question }), _jsxs("span", { className: `inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-transform ${expandedId === item.id ? "rotate-180" : ""}`, children: [_jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) }), expandedId === item.id ? "Thu gọn" : "Xem chi tiết"] })] })] }), expandedId === item.id && (_jsx("div", { className: "px-5 pb-5 pt-0", children: _jsx("div", { className: "ml-14 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl", children: _jsx("p", { className: "text-sm text-slate-700 leading-relaxed", children: item.answer }) }) }))] }, item.id))) }), filteredFAQ.length === 0 && (_jsxs("div", { className: "card p-12 text-center animate-scale-in", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-8 h-8 text-slate-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsx("h3", { className: "text-lg font-semibold text-slate-700 mb-2", children: "Kh\u00F4ng t\u00ECm th\u1EA5y c\u00E2u h\u1ECFi" }), _jsx("p", { className: "text-slate-500 text-sm", children: "Th\u1EED t\u00ECm ki\u1EBFm v\u1EDBi t\u1EEB kh\u00F3a kh\u00E1c ho\u1EB7c li\u00EAn h\u1EC7 h\u1ED7 tr\u1EE3 tr\u1EF1c ti\u1EBFp" })] })), _jsxs("div", { className: "mb-8 animate-scale-in", style: { animationDelay: "500ms" }, children: [_jsx("h2", { className: "text-lg font-semibold text-slate-800 mb-4", children: "Li\u00EAn h\u1EC7 h\u1ED7 tr\u1EE3" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { className: "card card-hover p-5 text-center", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center mx-auto mb-3 shadow-lg", children: _jsx("svg", { className: "w-6 h-6 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }) }), _jsx("h4", { className: "font-semibold text-slate-800 mb-1", children: "Email" }), _jsx("p", { className: "text-sm text-sky-600", children: "support@vinamec.com" })] }), _jsxs("div", { className: "card card-hover p-5 text-center", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-lg", children: _jsx("svg", { className: "w-6 h-6 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" }) }) }), _jsx("h4", { className: "font-semibold text-slate-800 mb-1", children: "Hotline" }), _jsx("p", { className: "text-sm text-emerald-600", children: "0243 123 456 789" })] }), _jsxs("div", { className: "card card-hover p-5 text-center", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg", children: _jsx("svg", { className: "w-6 h-6 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsx("h4", { className: "font-semibold text-slate-800 mb-1", children: "Gi\u1EDD l\u00E0m vi\u1EC7c" }), _jsx("p", { className: "text-sm text-amber-600", children: "08:00 - 18:00, T2-T7" })] })] })] }), _jsxs("div", { className: "card p-6 animate-scale-in", style: { animationDelay: "600ms" }, children: [_jsxs("div", { className: "flex items-center gap-4 mb-6", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white shadow-lg", children: _jsx("svg", { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-bold text-slate-800", children: "G\u1EEDi ph\u1EA3n h\u1ED3i" }), _jsx("p", { className: "text-sm text-slate-500", children: "Chia s\u1EBB \u00FD ki\u1EBFn c\u1EE7a b\u1EA1n v\u1EDBi ch\u00FAng t\u00F4i" })] })] }), showFeedbackForm ? (_jsxs("form", { onSubmit: handleSubmitFeedback, className: "space-y-4", children: [_jsx("textarea", { placeholder: "Nh\u1EADp ph\u1EA3n h\u1ED3i c\u1EE7a b\u1EA1n...", rows: 5, value: feedback, onChange: (e) => setFeedback(e.target.value), className: "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all resize-none", required: true }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { type: "submit", className: "px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all", children: "G\u1EEDi ph\u1EA3n h\u1ED3i" }), _jsx("button", { type: "button", onClick: () => setShowFeedbackForm(false), className: "px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all", children: "H\u1EE7y" })] })] })) : (_jsx("button", { onClick: () => setShowFeedbackForm(true), className: "w-full p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-sky-300 hover:bg-sky-50/50 transition-all group", children: _jsxs("div", { className: "flex items-center justify-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-600 transition-all", children: _jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }) }), _jsx("span", { className: "font-medium text-slate-500 group-hover:text-sky-600 transition-all", children: "Nh\u1EA5n \u0111\u1EC3 g\u1EEDi ph\u1EA3n h\u1ED3i" })] }) }))] })] })] })] }));
}
