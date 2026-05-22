import { useState } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  icon: string;
}

const faqData: FAQItem[] = [
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
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState("");

  const filteredFAQ = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Cảm ơn bạn đã gửi phản hồi!");
    setFeedback("");
    setShowFeedbackForm(false);
  };

  const quickLinks = [
    {
      title: "Hướng dẫn sử dụng",
      desc: "Tài liệu chi tiết cho quản trị viên",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: "sky",
      gradient: "from-sky-400 to-blue-500",
    },
    {
      title: "Video hướng dẫn",
      desc: "Hướng dẫn bằng hình ảnh trực quan",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "violet",
      gradient: "from-violet-400 to-purple-500",
    },
    {
      title: "API Documentation",
      desc: "Tài liệu kỹ thuật cho developers",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      color: "emerald",
      gradient: "from-emerald-400 to-teal-500",
    },
    {
      title: "Chính sách & Điều khoản",
      desc: "Quy định và điều khoản sử dụng",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "amber",
      gradient: "from-amber-400 to-orange-500",
    },
  ];

  return (
    <div className="flex h-screen" style={{ background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)" }}>
      <AdminSidebar />
      <div className="flex-1 lg:ml-0 min-w-0 overflow-y-auto">
        {/* Glass Header */}
        <div className="glass-header sticky top-0 z-10 px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Trợ giúp & Hỗ trợ</h1>
            <p className="text-sm text-slate-400 mt-0.5">Tìm hiểu cách sử dụng hệ thống quản lý phòng khám</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8 animate-fade-in">
          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickLinks.map((link, index) => (
              <button
                key={link.title}
                className="card card-hover p-5 text-left animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {link.icon}
                </div>
                <h3 className="font-bold text-slate-800 mb-1">{link.title}</h3>
                <p className="text-xs text-slate-500">{link.desc}</p>
              </button>
            ))}
          </div>

          {/* Search FAQ */}
          <div className="card card-hover p-5 mb-8 animate-scale-in" style={{ animationDelay: "200ms" }}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi thường gặp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <span className="px-4 py-2 bg-sky-50 text-sky-700 rounded-xl text-sm font-medium border border-sky-200">
                  {filteredFAQ.length} câu hỏi
                </span>
              </div>
            </div>
          </div>

          {/* FAQ Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            {filteredFAQ.map((item, index) => (
              <div
                key={item.id}
                className={`card p-0 overflow-hidden animate-scale-in transition-all ${
                  expandedId === item.id ? "ring-2 ring-sky-300" : ""
                }`}
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="w-full flex items-start gap-4 p-5 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-lg shrink-0 shadow-md">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2">
                      {item.question}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-transform ${
                        expandedId === item.id ? "rotate-180" : ""
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {expandedId === item.id ? "Thu gọn" : "Xem chi tiết"}
                    </span>
                  </div>
                </button>

                {expandedId === item.id && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="ml-14 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQ.length === 0 && (
            <div className="card p-12 text-center animate-scale-in">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Không tìm thấy câu hỏi</h3>
              <p className="text-slate-500 text-sm">Thử tìm kiếm với từ khóa khác hoặc liên hệ hỗ trợ trực tiếp</p>
            </div>
          )}

          {/* Contact Section */}
          <div className="mb-8 animate-scale-in" style={{ animationDelay: "500ms" }}>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Liên hệ hỗ trợ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card card-hover p-5 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-800 mb-1">Email</h4>
                <p className="text-sm text-sky-600">support@vinamec.com</p>
              </div>

              <div className="card card-hover p-5 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-800 mb-1">Hotline</h4>
                <p className="text-sm text-emerald-600">0243 123 456 789</p>
              </div>

              <div className="card card-hover p-5 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-800 mb-1">Giờ làm việc</h4>
                <p className="text-sm text-amber-600">08:00 - 18:00, T2-T7</p>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="card p-6 animate-scale-in" style={{ animationDelay: "600ms" }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Gửi phản hồi</h2>
                <p className="text-sm text-slate-500">Chia sẻ ý kiến của bạn với chúng tôi</p>
              </div>
            </div>

            {showFeedbackForm ? (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <textarea
                  placeholder="Nhập phản hồi của bạn..."
                  rows={5}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all resize-none"
                  required
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-sky-200 transition-all"
                  >
                    Gửi phản hồi
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFeedbackForm(false)}
                    className="px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="w-full p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-sky-300 hover:bg-sky-50/50 transition-all group"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-600 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-500 group-hover:text-sky-600 transition-all">
                    Nhấn để gửi phản hồi
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
