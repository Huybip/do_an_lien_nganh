import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  iconActive: React.ReactNode;
}

const DashboardIcon = ({ active }: { active: boolean }) => active ? (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
  </svg>
) : (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => active ? (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-8.33 9.67A5 5 0 0112 5a5 5 0 018.33 16.67C17.6 22.95 15.04 24 12 24c-3.04 0-5.6-1.05-7.67-2.33z"/>
  </svg>
) : (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CalendarIcon = ({ active }: { active: boolean }) => active ? (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
  </svg>
) : (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const RecordsIcon = ({ active }: { active: boolean }) => active ? (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
    <path d="M8 13h8m-8 4h5"/>
  </svg>
) : (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ImagesIcon = ({ active }: { active: boolean }) => active ? (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"/>
  </svg>
) : (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path strokeLinecap="round" d="M21 15l-5-5L5 21" />
  </svg>
);

const DentalIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke={active ? "none" : "currentColor"} strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8 2 5 5 5 9c0 2.5 1 4.5 3 6.5L12 22l4-6.5C18 13.5 19 11.5 19 9c0-4-3-7-7-7z" />
  </svg>
);

const ChatIcon = ({ active }: { active: boolean }) => active ? (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2zm-2 12H6l-2 2V4h16v10z"/>
  </svg>
) : (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const VideoIcon = ({ active }: { active: boolean }) => active ? (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
  </svg>
) : (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const PaymentIcon = ({ active }: { active: boolean }) => active ? (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 14H4V6h16v12zM6 10h2v2H6v-2zm0 4h8v2H6v-2zm10 0h2v2h-2v-2z"/>
  </svg>
) : (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
  </svg>
);

export default function PatientSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/patient") return location.pathname === "/patient";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const menuItems: MenuItem[] = [
    { label: "Tổng quan", path: "/patient", icon: <DashboardIcon active={false} />, iconActive: <DashboardIcon active /> },
    { label: "Hồ sơ", path: "/patient/profile", icon: <ProfileIcon active={false} />, iconActive: <ProfileIcon active /> },
    { label: "Lịch hẹn", path: "/patient/appointments", icon: <CalendarIcon active={false} />, iconActive: <CalendarIcon active /> },
    { label: "Hồ sơ bệnh án", path: "/patient/records", icon: <RecordsIcon active={false} />, iconActive: <RecordsIcon active /> },
    { label: "Hình ảnh", path: "/patient/images", icon: <ImagesIcon active={false} />, iconActive: <ImagesIcon active /> },
    { label: "Sức khỏe răng", path: "/patient/dental-score", icon: <DentalIcon active={false} />, iconActive: <DentalIcon active /> },
    { label: "Thanh toán", path: "/patient/payments", icon: <PaymentIcon active={false} />, iconActive: <PaymentIcon active /> },
    { label: "Tin nhắn", path: "/patient/chat", icon: <ChatIcon active={false} />, iconActive: <ChatIcon active /> },
    { label: "Video Call", path: "/video-call", icon: <VideoIcon active={false} />, iconActive: <VideoIcon active /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const NavItem = ({ item }: { item: MenuItem }) => {
    const active = isActive(item.path);
    return (
      <button
        onClick={() => { navigate(item.path); setMobileOpen(false); }}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group font-medium
          ${!isOpen && "justify-center"}
          ${active
            ? "bg-white/15 text-white font-semibold"
            : "text-emerald-100/70 hover:bg-white/10 hover:text-white"
          }
        `}
      >
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-emerald-300 to-teal-400" />
        )}
        <span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200">
          {active ? item.iconActive : item.icon}
        </span>
        {isOpen && (
          <span className="text-sm font-semibold">{item.label}</span>
        )}
        {!isOpen && (
          <div className="absolute left-full ml-2 px-3 py-2 rounded-xl text-sm font-semibold text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-50 shadow-lg"
            style={{ background: "rgba(15,118,110,0.95)", backdropFilter: "blur(8px)" }}>
            {item.label}
          </div>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <div className={`flex flex-col h-full ${isOpen ? "px-3" : "px-2"} transition-all duration-300`}>
      {/* Logo */}
      <div className="relative z-10 py-5 px-1">
        <div className={`flex items-center gap-3 ${!isOpen && "justify-center"}`}>
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-300 to-teal-400 flex items-center justify-center shadow-lg"
              style={{ boxShadow: "0 4px 16px rgba(20,184,166,0.45)" }}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8 2 5 5 5 9c0 2.5 1 4.5 3 6.5L12 22l4-6.5C18 13.5 19 11.5 19 9c0-4-3-7-7-7z"/>
              </svg>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[7px] text-white font-black shadow ring-2 ring-emerald-400">
              <svg className="w-2.5 h-2.5" fill="white" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
            </span>
          </div>
          {isOpen && (
            <div className="animate-fade-in">
              <span className="font-bold text-lg text-white leading-none block">VinaMec</span>
              <span className="text-[10px] text-emerald-300/60 font-medium mt-0.5 block">Dental Clinic</span>
            </div>
          )}
        </div>
        {/* Toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-20"
          style={{ background: "linear-gradient(135deg, #5eead4, #14b8a6)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
          title={isOpen ? "Thu gọn" : "Mở rộng"}
        >
          <svg className={`w-3.5 h-3.5 text-white transition-transform duration-300 ${!isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Decorative glow */}
      <div className="absolute top-0 left-0 right-0 h-40 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, #5eead4, transparent)" }} />
        <div className="absolute -top-8 right-0 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, #38bdf8, transparent)" }} />
      </div>

      {/* Label */}
      <div className="px-3 pt-1 pb-2">
        {isOpen && <span className="text-[10px] font-bold text-emerald-300/50 uppercase tracking-widest">Menu</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto pb-3 space-y-0.5">
        {menuItems.map((item) => <NavItem key={item.path} item={item} />)}
      </nav>

      {/* Divider */}
      <div className="mx-1 border-t border-white/10 mb-3" />

      {/* Footer */}
      <div className="pb-4 space-y-0.5">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-red-300 hover:bg-white/10 hover:text-red-200 ${!isOpen && "justify-center"}`}
        >
          <span className="w-7 h-7 flex items-center justify-center flex-shrink-0"><LogoutIcon /></span>
          {isOpen && <span className="text-sm font-semibold">Đăng xuất</span>}
        </button>
        {isOpen && (
          <div className="px-3 pt-2 text-center">
            <p className="text-[10px] text-emerald-300/30 font-medium">VinaMec Dental Clinic</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="w-full h-full bg-gradient-to-b from-emerald-800 to-emerald-950 shadow-2xl flex flex-col">
          {sidebarContent}
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-30 w-10 h-10 rounded-xl flex items-center justify-center shadow-md lg:hidden bg-emerald-600 text-white"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col h-screen sticky top-0 w-64 transform transition-all duration-300 ease-in-out"
        style={{ background: "linear-gradient(180deg, #134e4a 0%, #0f766e 40%, #0c4a6e 100%)", boxShadow: "4px 0 24px rgba(0,0,0,0.15)" }}>
        {sidebarContent}
      </aside>
    </>
  );
}
