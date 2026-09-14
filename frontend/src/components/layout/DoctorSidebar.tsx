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
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      ),
      label: "Lịch hẹn",
      path: "/doctor/appointments",
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
      label: "Ca trực",
      path: "/doctor/shifts",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      ),
      label: "Bảng lương",
      path: "/doctor/salary",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: "Hồ sơ cá nhân",
      path: "/doctor/profile",
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
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 4px 14px rgba(124,58,237,0.4)" }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
              </svg>
            </div>
            {isOpen && (
              <div className="min-w-0">
                <span className="font-bold text-white text-base block leading-tight truncate">VinaMec</span>
                <span className="text-[10px] text-violet-200/70 font-medium tracking-wide truncate block">Bác sĩ chuyên khoa</span>
              </div>
            )}
          </div>
          {isOpen && (
            <button onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-violet-200/60 hover:bg-white/10 hover:text-white transition text-lg font-light flex-shrink-0">
              ‹
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 overflow-y-auto py-2.5 px-3 space-y-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.15) transparent" }}>
        {isOpen && (
          <p className="text-[10px] font-bold text-violet-200/40 uppercase tracking-widest mb-2 px-2">Danh mục chuyên môn</p>
        )}
        <div className="space-y-0.5">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-violet-500/30 to-indigo-500/20 text-white font-semibold shadow-sm border border-violet-400/30"
                  : "text-violet-100/70 hover:bg-white/10 hover:text-white"
              }`}
              title={!isOpen ? item.label : undefined}
            >
              {isActive(item.path) && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-violet-300 to-indigo-400 rounded-r-full shadow-sm" />
              )}
              <span className={`flex-shrink-0 ${isActive(item.path) ? "text-violet-200" : "text-violet-300/60 group-hover:text-violet-200"}`}>
                {item.icon}
              </span>
              {isOpen && (
                <span className={`text-sm truncate ${isActive(item.path) ? "text-white font-semibold" : "font-medium"}`}>{item.label}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* User + Footer */}
      <div className="border-t border-white/10 p-2.5 space-y-1 flex-shrink-0 mt-auto bg-black/15">
        {isOpen && user && (
          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-white/5 mb-1 border border-white/5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}>
              {user.name?.charAt(0)?.toUpperCase() || "D"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-violet-200/60 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-300/80 hover:bg-red-500/20 hover:text-red-200 transition text-xs font-semibold ${!isOpen && "justify-center"}`}>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          {isOpen && <span>Đăng xuất</span>}
        </button>
      </div>

      {!isOpen && (
        <div className="p-2 border-t border-white/10 flex-shrink-0">
          <button onClick={() => setIsOpen(true)}
            className="w-full flex items-center justify-center py-1.5 text-violet-200/60 hover:bg-white/10 hover:text-white transition rounded-lg">
            <span className="text-base">›</span>
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
      }`} style={{ background: "linear-gradient(180deg, #1e1b4b 0%, #2e1065 45%, #4c1d95 100%)" }}>
        {NavContent()}
      </div>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex lg:flex-col sticky top-0 h-screen max-h-screen flex-shrink-0 select-none overflow-hidden transition-all duration-300 ${
        isOpen ? "w-60" : "w-20"
      }`} style={{ background: "linear-gradient(180deg, #1e1b4b 0%, #2e1065 45%, #4c1d95 100%)", boxShadow: "4px 0 24px rgba(30,27,75,0.25)" }}>
        {NavContent()}
      </aside>
    </>
  );
}
