import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export default function DoctorSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/doctor") return location.pathname === "/doctor";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const menuItems: MenuItem[] = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
      ),
      label: "Tổng quan",
      path: "/doctor",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      ),
      label: "Bệnh nhân",
      path: "/doctor/patients",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      ),
      label: "Lịch hẹn",
      path: "/doctor/appointments",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
      label: "Ca trực",
      path: "/doctor/shifts",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      ),
      label: "Hồ sơ y tế",
      path: "/doctor/records",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      ),
      label: "Hình ảnh",
      path: "/doctor/images",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
      ),
      label: "Tin nhắn",
      path: "/doctor/chat",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
      ),
      label: "Video Call",
      path: "/video-call",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
        </svg>
      ),
      label: "Thanh toán",
      path: "/doctor/payments",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 12px rgba(124,58,237,0.35)" }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
              </svg>
            </div>
            {isOpen && (
              <div>
                <span className="font-bold text-white text-base block leading-tight">Doctor</span>
                <span className="text-[10px] text-violet-200/60 font-medium">Bác sĩ chuyên khoa</span>
              </div>
            )}
          </div>
          {isOpen && (
            <button onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-violet-200/60 hover:bg-white/10 hover:text-white transition text-lg font-light">
              ‹
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {isOpen && (
          <p className="text-[10px] font-bold text-violet-200/40 uppercase tracking-widest mb-3 px-2">Danh mục</p>
        )}
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive(item.path)
                  ? "bg-white/20 text-white"
                  : "text-violet-100/70 hover:bg-white/10 hover:text-white"
              }`}
              title={!isOpen ? item.label : undefined}
            >
              {isActive(item.path) && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
              )}
              <span className={`flex-shrink-0 ${isActive(item.path) ? "text-white" : "text-violet-200/60 group-hover:text-violet-200"}`}>
                {item.icon}
              </span>
              {isOpen && (
                <span className={`text-sm font-semibold ${isActive(item.path) ? "text-white" : ""}`}>{item.label}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* User + Footer */}
      <div className="border-t border-white/10 p-3 space-y-2">
        {isOpen && user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 mb-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
              {user.name?.charAt(0)?.toUpperCase() || "D"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-violet-200/50 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-300/80 hover:bg-red-500/20 hover:text-red-200 transition text-sm font-semibold ${!isOpen && "justify-center"}`}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          {isOpen && <span>Đăng xuất</span>}
        </button>
      </div>

      {!isOpen && (
        <div className="p-2 border-t border-white/10">
          <button onClick={() => setIsOpen(true)}
            className="w-full flex items-center justify-center py-2 text-violet-200/60 hover:bg-white/10 hover:text-white transition rounded-lg">
            <span className="text-lg">›</span>
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-xl bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-slate-700">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={`fixed top-0 left-0 z-50 h-full w-64 flex flex-col transition-transform duration-300 lg:hidden ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`} style={{ background: "linear-gradient(180deg, #4c1d95 0%, #6d28d9 100%)" }}>
        {NavContent()}
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:block sticky top-0 h-screen flex-shrink-0 transition-all duration-300 ${
        isOpen ? "w-60" : "w-20"
      }`} style={{ background: "linear-gradient(180deg, #4c1d95 0%, #6d28d9 100%)" }}>
        {NavContent()}
      </div>
    </>
  );
}
