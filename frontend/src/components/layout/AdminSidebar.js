import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
export default function AdminSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");
    const menuItems = [
        {
            icon: (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) })),
            label: "Tổng quan",
            path: "/admin",
        },
        {
            icon: (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) })),
            label: "Lịch hẹn",
            path: "/admin/appointments",
        },
        {
            icon: (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) })),
            label: "Ca trực",
            path: "/admin/shifts",
        },
        {
            icon: (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" }) })),
            label: "Thanh toán",
            path: "/admin/payments",
        },
        {
            icon: (_jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })] })),
            label: "Điểm răng",
            path: "/admin/scores",
        },
        {
            icon: (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) })),
            label: "Báo cáo",
            path: "/admin/reports",
        },
        {
            icon: (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" }) })),
            label: "Người dùng",
            path: "/admin/users",
        },
        {
            icon: (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" }) })),
            label: "Bác sĩ",
            path: "/admin/doctors",
        },
        {
            icon: (_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" }) })),
            label: "Dịch vụ",
            path: "/admin/services",
        },
        {
            icon: (_jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })] })),
            label: "Cấu hình",
            path: "/admin/settings",
        },
    ];
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        navigate("/login");
    };
    const NavContent = () => (_jsxs(_Fragment, { children: [_jsx("div", { className: "p-5 border-b border-white/10", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg", style: { background: "linear-gradient(135deg, #0ea5e9, #0369a1)", boxShadow: "0 4px 12px rgba(14,165,233,0.35)" }, children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 2.5, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" }) }) }), isOpen && (_jsxs("div", { children: [_jsx("span", { className: "font-black text-white text-base block leading-tight", children: "VinaMec" }), _jsx("span", { className: "text-[10px] text-sky-200/60 font-medium", children: "H\u1EC7 th\u1ED1ng qu\u1EA3n l\u00FD" })] }))] }), isOpen && (_jsx("button", { onClick: () => setIsOpen(false), className: "w-7 h-7 rounded-lg flex items-center justify-center text-sky-200/60 hover:bg-white/10 hover:text-white transition text-lg font-light", children: "\u2039" }))] }) }), _jsxs("nav", { className: "flex-1 overflow-y-auto py-4 px-3", children: [isOpen && (_jsx("p", { className: "text-[10px] font-bold text-sky-200/40 uppercase tracking-widest mb-3 px-2", children: "Danh m\u1EE5c" })), _jsx("div", { className: "space-y-1", children: menuItems.map((item) => (_jsxs("button", { onClick: () => { navigate(item.path); setMobileOpen(false); }, className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive(item.path)
                                ? "bg-white/20 text-white"
                                : "text-sky-100/70 hover:bg-white/10 hover:text-white"}`, title: !isOpen ? item.label : undefined, children: [isActive(item.path) && (_jsx("span", { className: "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" })), _jsx("span", { className: `flex-shrink-0 ${isActive(item.path) ? "text-white" : "text-sky-200/60 group-hover:text-sky-200"}`, children: item.icon }), isOpen && (_jsx("span", { className: `text-sm font-semibold ${isActive(item.path) ? "text-white" : ""}`, children: item.label }))] }, item.path))) })] }), _jsxs("div", { className: "border-t border-white/10 p-3 space-y-2", children: [isOpen && user && (_jsxs("div", { className: "flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 mb-1", children: [_jsx("div", { className: "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow", style: { background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }, children: user.name?.charAt(0)?.toUpperCase() || "A" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs font-bold text-white truncate", children: user.name }), _jsx("p", { className: "text-[10px] text-sky-200/50 truncate", children: "Admin" })] })] })), _jsxs("button", { onClick: () => navigate("/admin/help"), className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sky-100/60 hover:bg-white/10 hover:text-white transition text-sm font-semibold ${!isOpen && "justify-center"}`, children: [_jsx("svg", { className: "w-5 h-5 flex-shrink-0", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), isOpen && _jsx("span", { children: "Tr\u1EE3 gi\u00FAp" })] }), _jsxs("button", { onClick: handleLogout, className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-300/80 hover:bg-red-500/20 hover:text-red-200 transition text-sm font-semibold ${!isOpen && "justify-center"}`, children: [_jsx("svg", { className: "w-5 h-5 flex-shrink-0", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) }), isOpen && _jsx("span", { children: "\u0110\u0103ng xu\u1EA5t" })] })] }), !isOpen && (_jsx("div", { className: "p-2 border-t border-white/10", children: _jsx("button", { onClick: () => setIsOpen(true), className: "w-full flex items-center justify-center py-2 text-sky-200/60 hover:bg-white/10 hover:text-white transition rounded-lg", children: _jsx("span", { className: "text-lg", children: "\u203A" }) }) }))] }));
    return (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setMobileOpen(true), className: "fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-xl bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-slate-700", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", d: "M4 6h16M4 12h16M4 18h16" }) }) }), mobileOpen && (_jsx("div", { className: "fixed inset-0 z-40 bg-black/50 lg:hidden", onClick: () => setMobileOpen(false) })), _jsx("div", { className: `fixed top-0 left-0 z-50 h-full w-64 flex flex-col transition-transform duration-300 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`, style: { background: "linear-gradient(180deg, #0c4a6e 0%, #0369a1 100%)" }, children: NavContent() }), _jsx("div", { className: `hidden lg:flex flex-col h-screen transition-all duration-300 ${isOpen ? "w-60" : "w-20"}`, style: { background: "linear-gradient(180deg, #0c4a6e 0%, #0369a1 100%)" }, children: NavContent() })] }));
}
