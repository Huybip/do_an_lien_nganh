import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ToothIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-5 h-5"
  >
    <path d="M12 2C9 2 6 4.5 6 7.5c0 1.5.5 3 1 4.5L8 18c.5 2 1.5 4 4 4s3.5-2 4-4l1-6c.5-1.5 1-3 1-4.5C18 4.5 15 2 12 2z" />
  </svg>
);

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const adminNav: NavItem[] = [
  { label: "Tổng quan", path: "/admin", icon: "🏠" },
  { label: "Tiếp đón", path: "/admin/checkin", icon: "🛎️" },
  { label: "Lịch hẹn", path: "/admin/appointments", icon: "📅" },
  { label: "Bệnh án", path: "/admin/records", icon: "📋" },
  { label: "Bác sĩ", path: "/admin/doctors", icon: "👨‍⚕️" },
  { label: "Người dùng", path: "/admin/users", icon: "👥" },
  { label: "Dịch vụ", path: "/admin/services", icon: "🦷" },
  { label: "Ca trực", path: "/admin/shifts", icon: "⏰" },
  { label: "Thanh toán", path: "/admin/payments", icon: "💳" },
  { label: "Tính lương", path: "/admin/salary", icon: "💰" },
  { label: "Báo cáo", path: "/admin/reports", icon: "📊" },
  { label: "Cấu hình", path: "/admin/settings", icon: "⚙️" },
];

const doctorNav: NavItem[] = [
  { label: "Tổng quan", path: "/doctor", icon: "🏠" },
  { label: "Lịch hẹn", path: "/doctor/appointments", icon: "📅" },
  { label: "Bệnh nhân", path: "/doctor/patients", icon: "🧑‍🤝‍🧑" },
  { label: "Hồ sơ y tế", path: "/doctor/records", icon: "📋" },
  { label: "Hình ảnh", path: "/doctor/images", icon: "🖼️" },
  { label: "Tin nhắn", path: "/doctor/chat", icon: "💬" },
  { label: "Video Call", path: "/video-call", icon: "📹" },
  { label: "Ca trực", path: "/doctor/shifts", icon: "⏰" },
  { label: "Bảng lương", path: "/doctor/salary", icon: "💰" },
  { label: "Hồ sơ cá nhân", path: "/doctor/profile", icon: "👤" },
];

const patientNav: NavItem[] = [
  { label: "Tổng quan", path: "/patient", icon: "🏠" },
  { label: "Lịch hẹn", path: "/patient/appointments", icon: "📅" },
  { label: "Hồ sơ bệnh án", path: "/patient/records", icon: "📋" },
  { label: "Sức khỏe răng", path: "/patient/dental-score", icon: "⭐" },
  { label: "Hình ảnh", path: "/patient/images", icon: "🖼️" },
  { label: "Thanh toán", path: "/patient/payments", icon: "💳" },
  { label: "Tin nhắn", path: "/patient/chat", icon: "💬" },
  { label: "Video Call", path: "/video-call", icon: "📹" },
  { label: "Hồ sơ cá nhân", path: "/patient/profile", icon: "👤" },
];

interface Props {
  collapsed?: boolean;
  onCollapse?: () => void;
}

export default function Sidebar({ collapsed, onCollapse }: Props) {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const nav =
    role === "admin" ? adminNav : role === "doctor" ? doctorNav : patientNav;
  const roleLabel =
    role === "admin"
      ? "Quản trị viên"
      : role === "doctor"
        ? "Bác sĩ"
        : "Bệnh nhân";
  const roleColor =
    role === "admin"
      ? "badge-blue"
      : role === "doctor"
        ? "badge-violet"
        : "badge-green";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`flex flex-col h-screen bg-white border-r border-surface-100 shadow-card transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-surface-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-dental flex items-center justify-center text-white flex-shrink-0">
          <ToothIcon />
        </div>
        {!collapsed && (
          <div>
            <p className="font-display font-bold text-sm text-surface-900 leading-tight">
              VinaMec
            </p>
            <p className="text-[10px] text-surface-400 font-medium">
              Dental Care AI
            </p>
          </div>
        )}
        <button
          onClick={onCollapse}
          className="ml-auto text-surface-400 hover:text-surface-600 transition"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            {collapsed ? (
              <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
            ) : (
              <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
            )}
          </svg>
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-surface-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-dental flex items-center justify-center text-black-400 text-sm font-bold flex-shrink-0">
              {user?.name?.charAt(0) || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-surface-800 truncate">
                {user?.name || "User"}
              </p>
              <span className={`badge text-[10px] ${roleColor}`}>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {nav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={
              item.path === "/admin" ||
              item.path === "/doctor" ||
              item.path === "/patient"
            }
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""} ${collapsed ? "justify-center px-2" : ""}`
            }
          >
            <span className="text-base">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-surface-100">
        <button
          onClick={handleLogout}
          className={`w-full sidebar-link text-red-400 hover:bg-red-50 hover:text-red-600 ${collapsed ? "justify-center px-2" : ""}`}
        >
          <span className="text-base">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
