import { useState } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";

interface Settings {
  clinicName: string;
  clinicEmail: string;
  clinicPhone: string;
  clinicAddress: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  appointmentDuration: number;
  notificationEmail: string;
  maintenanceMode: boolean;
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: "sky" | "emerald" | "red";
}

function Toggle({ checked, onChange, color = "sky" }: ToggleProps) {
  const colors = {
    sky: "bg-sky-500",
    emerald: "bg-emerald-500",
    red: "bg-red-500",
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
        checked ? colors[color] : "bg-slate-200"
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    clinicName: "VinaMec Dental Care",
    clinicEmail: "contact@vinamec.com",
    clinicPhone: "0243 123 456 789",
    clinicAddress: "123 Phố Hàng Ngang, Hà Nội",
    workingHoursStart: "08:00",
    workingHoursEnd: "18:00",
    appointmentDuration: 30,
    notificationEmail: "admin@vinamec.com",
    maintenanceMode: false,
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("general");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setSettings({
      ...settings,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "appointmentDuration"
            ? parseInt(value)
            : value,
    });
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    {
      id: "general",
      title: "Thông tin chung",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "sky",
    },
    {
      id: "notifications",
      title: "Thông báo",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      color: "amber",
    },
    {
      id: "security",
      title: "Bảo mật",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: "emerald",
    },
    {
      id: "backup",
      title: "Sao lưu",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
      color: "violet",
    },
  ];

  return (
    <div className="flex h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <AdminSidebar />
      <div className="flex-1 lg:ml-0 min-w-0 overflow-y-auto">
        {/* Glass Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Cài đặt hệ thống</h1>
            <p className="text-sm text-slate-400 mt-0.5">Quản lý cấu hình phòng khám</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8 animate-fade-in">
          {/* Success Message */}
          {saved && (
            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl animate-scale-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-emerald-700 font-medium">Cài đặt đã được lưu thành công!</p>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 shrink-0">
              <div className="card p-4 sticky top-24">
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        activeSection === section.id
                          ? `bg-gradient-to-r from-${section.color}-500 to-${section.color}-600 text-white shadow-lg`
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {section.icon}
                      <span className="font-medium">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Settings */}
                {activeSection === "general" && (
                  <div className="card card-hover p-6 animate-fade-in">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-lg">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Thông tin phòng khám</h2>
                        <p className="text-sm text-slate-500">Cập nhật thông tin cơ bản của phòng khám</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Tên phòng khám</label>
                        <input
                          type="text"
                          name="clinicName"
                          value={settings.clinicName}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                          <input
                            type="email"
                            name="clinicEmail"
                            value={settings.clinicEmail}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Số điện thoại</label>
                          <input
                            type="tel"
                            name="clinicPhone"
                            value={settings.clinicPhone}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Địa chỉ</label>
                        <input
                          type="text"
                          name="clinicAddress"
                          value={settings.clinicAddress}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
                        />
                      </div>

                      <div className="border-t border-slate-100 pt-5">
                        <h3 className="font-semibold text-slate-700 mb-4">Giờ hoạt động</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Giờ mở cửa</label>
                            <input
                              type="time"
                              name="workingHoursStart"
                              value={settings.workingHoursStart}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Giờ đóng cửa</label>
                            <input
                              type="time"
                              name="workingHoursEnd"
                              value={settings.workingHoursEnd}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Thời lượng lịch hẹn mặc định</label>
                        <select
                          name="appointmentDuration"
                          value={settings.appointmentDuration}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
                        >
                          <option value={15}>15 phút</option>
                          <option value={30}>30 phút</option>
                          <option value={45}>45 phút</option>
                          <option value={60}>60 phút</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {activeSection === "notifications" && (
                  <div className="card card-hover p-6 animate-fade-in">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Cài đặt thông báo</h2>
                        <p className="text-sm text-slate-500">Quản lý email và thông báo hệ thống</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email thông báo</label>
                        <input
                          type="email"
                          name="notificationEmail"
                          value={settings.notificationEmail}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
                        />
                      </div>

                      <div className="space-y-4">
                        {[
                          { id: "emailNotify", label: "Thông báo qua email", desc: "Nhận thông báo khi có lịch hẹn mới" },
                          { id: "smsNotify", label: "Thông báo SMS", desc: "Gửi SMS nhắc nhở cho bệnh nhân" },
                          { id: "dailyReport", label: "Báo cáo hàng ngày", desc: "Nhận email báo cáo mỗi ngày" },
                        ].map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div>
                              <p className="font-medium text-slate-700">{item.label}</p>
                              <p className="text-xs text-slate-500">{item.desc}</p>
                            </div>
                            <Toggle checked={true} onChange={() => {}} color="sky" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeSection === "security" && (
                  <div className="card card-hover p-6 animate-fade-in">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Bảo mật</h2>
                        <p className="text-sm text-slate-500">Cài đặt bảo mật và chế độ bảo trì</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">Chế độ bảo trì</p>
                            <p className="text-xs text-slate-500">
                              {settings.maintenanceMode ? "Đang bật - Hệ thống đang được bảo trì" : "Tắt - Hệ thống hoạt động bình thường"}
                            </p>
                          </div>
                        </div>
                        <Toggle
                          checked={settings.maintenanceMode}
                          onChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                          color="red"
                        />
                      </div>

                      <div className="space-y-4">
                        {[
                          { label: "Xác thực hai yếu tố (2FA)", desc: "Bảo vệ tài khoản với lớp bảo mật bổ sung", enabled: true },
                          { label: "Ghi nhật ký hoạt động", desc: "Theo dõi mọi thao tác của quản trị viên", enabled: true },
                          { label: "Mã hóa dữ liệu", desc: "Mã hóa thông tin nhạy cảm", enabled: true },
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div>
                              <p className="font-medium text-slate-700">{item.label}</p>
                              <p className="text-xs text-slate-500">{item.desc}</p>
                            </div>
                            <Toggle checked={item.enabled} onChange={() => {}} color="emerald" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Backup Settings */}
                {activeSection === "backup" && (
                  <div className="card card-hover p-6 animate-fade-in">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white shadow-lg">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Sao lưu & Phục hồi</h2>
                        <p className="text-sm text-slate-500">Quản lý sao lưu dữ liệu</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-slate-700">Sao lưu tự động</p>
                              <p className="text-xs text-slate-500">Lần sao lưu cuối: 2 giờ trước</p>
                            </div>
                          </div>
                          <Toggle checked={true} onChange={() => {}} color="sky" />
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full w-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full"></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-100 hover:border-sky-200 transition-all text-left">
                          <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 mb-3">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </div>
                          <p className="font-semibold text-slate-700">Tải xuống</p>
                          <p className="text-xs text-slate-500">Sao lưu dữ liệu ngay</p>
                        </button>
                        <button className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 hover:border-emerald-200 transition-all text-left">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                          </div>
                          <p className="font-semibold text-slate-700">Khôi phục</p>
                          <p className="text-xs text-slate-500">Phục hồi từ file backup</p>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Lưu cài đặt
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Khôi phục mặc định
                  </button>
                </div>
              </form>

              {/* Tips */}
              <div className="mt-8 p-5 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-100 animate-fade-in" style={{ animationDelay: "200ms" }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sky-900 mb-1">Lưu ý</h4>
                    <ul className="text-sm text-sky-800 space-y-1">
                      <li>Thay đổi cài đặt sẽ có hiệu lực ngay tức thì</li>
                      <li>Chế độ bảo trì sẽ ẩn trang web khỏi người dùng thông thường</li>
                      <li>Email thông báo sẽ nhận các thông báo quan trọng từ hệ thống</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
