import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Phone, Check, ArrowRight, Star, Shield, Clock, Award,
  Users, MapPin, Mail, ChevronDown, Menu, X, MessageCircle,
  Sparkles, ChevronRight, PhoneCall,
  Activity, HeartPulse, Stethoscope, Syringe, Zap,
  BookOpen, BadgeCheck, CreditCard,
} from "lucide-react";

// ─── Image Assets ─────────────────────────────────────────────────────────────
const HERO_IMG = "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1400&q=85&auto=format&fit=crop";
const CLINIC_IMG = "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80&auto=format&fit=crop";
const TEAM_IMG = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80&auto=format&fit=crop";
const DENTAL_EQUIP = "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80&auto=format&fit=crop";
const IMPLANT_IMG = "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&q=80&auto=format&fit=crop";
const WHITENING_IMG = "https://images.unsplash.com/photo-1609840114852-5f7e4e7e0d27?w=600&q=80&auto=format&fit=crop";
const BRACES_IMG = "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=600&q=80&auto=format&fit=crop";
const KID_DENTAL = "https://images.unsplash.com/photo-1514849302-984523450cf4?w=600&q=80&auto=format&fit=crop";
const DENTAL_SMILE = "https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?w=1000&q=80&auto=format&fit=crop";

const DOCTOR_PHOTOS = [
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80&auto=format&fit=crop&fp-x=0.5&fp-y=0.2&crop=focalpoint",
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80&auto=format&fit=crop&fp-x=0.5&fp-y=0.2&crop=focalpoint",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80&auto=format&fit=crop&fp-x=0.5&fp-y=0.2&crop=focalpoint",
  "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&q=80&auto=format&fit=crop&fp-x=0.5&fp-y=0.2&crop=focalpoint",
];

const TESTIMONIAL_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80&auto=format&fit=crop&crop=face",
];

// ─── Data ─────────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    title: "Khám & Chẩn đoán",
    icon: <Stethoscope size={22} strokeWidth={1.8} />,
    color: "#0284c7",
    bg: "#e0f2fe",
    image: CLINIC_IMG,
    items: ["Khám tổng quát", "Chụp X-quang Panorama", "Tư vấn điều trị", "Lập kế hoạch răng miệng"],
    price: "Miễn phí",
    desc: "Kiểm tra toàn diện tình trạng răng miệng bằng thiết bị hiện đại nhất.",
  },
  {
    title: "Trám & Phục hình",
    icon: <Award size={22} strokeWidth={1.8} />,
    color: "#0d9488",
    bg: "#ccfbf1",
    image: DENTAL_EQUIP,
    items: ["Trám răng composite 3M", "Trám amalgam", "Inlay / Onlay sứ", "Gắn đá sapphire"],
    price: "Từ 300.000đ",
    desc: "Phục hồi hình dạng răng tự nhiên với vật liệu cao cấp, bền đẹp lâu dài.",
  },
  {
    title: "Cấy ghép Implant",
    icon: <Syringe size={22} strokeWidth={1.8} />,
    color: "#d97706",
    bg: "#fef3c7",
    image: IMPLANT_IMG,
    items: ["Implant Straumann (Thụy Sĩ)", "Implant Osstem (Hàn Quốc)", "Implant Dentium", "Nâng xương ghép десна"],
    price: "Từ 15.000.000đ",
    desc: "Giải pháp thay thế răng mất vĩnh viễn, nhìn và chức năng như răng thật.",
  },
  {
    title: "Niềng răng",
    icon: <Sparkles size={22} strokeWidth={1.8} />,
    color: "#7c3aed",
    bg: "#ede9fe",
    image: BRACES_IMG,
    items: ["Mắc cài kim loại", "Mắc cài sứ", "Niềng trong suốt", "Niềng rãnh Damon"],
    price: "Từ 25.000.000đ",
    desc: "Niềng răng thẩm mỹ, công nghệ mới nhất từ các chuyên gia hàng đầu.",
  },
  {
    title: "Tẩy trắng & Thẩm mỹ",
    icon: <Zap size={22} strokeWidth={1.8} />,
    color: "#db2777",
    bg: "#fce7f3",
    image: WHITENING_IMG,
    items: ["Tẩy trắng tại phòng khám", "Máng tẩy tại nhà", "Veneer sứ cao cấp", "Đánh bóng răng"],
    price: "Từ 2.000.000đ",
    desc: "Nụ cười rạng rỡ với công nghệ tẩy trắng an toàn, hiệu quả tức thì.",
  },
  {
    title: "Nha khoa trẻ em",
    icon: <HeartPulse size={22} strokeWidth={1.8} />,
    color: "#16a34a",
    bg: "#dcfce7",
    image: KID_DENTAL,
    items: ["Khám và điều trị cho trẻ", "Trám răng sữa", "Bôi Fluoride", "Niêm phong rãnh"],
    price: "Từ 150.000đ",
    desc: "Chăm sóc răng miệng chuyên biệt cho trẻ em với không gian thân thiện, vui vẻ.",
  },
];

const FEATURES = [
  { icon: <Shield size={26} strokeWidth={1.8} />, title: "Vô trùng tuyệt đối", desc: "Tiêu chuẩn Bộ Y tế, mỗi dụng cụ khử trùng riêng biệt.", color: "#10b981", bg: "#d1fae5" },
  { icon: <Award size={26} strokeWidth={1.8} />, title: "Bác sĩ chuyên môn cao", desc: "Đào tạo tại ĐH Y Dược TP.HCM, tu nghiệp Nhật Bản.", color: "#0ea5e9", bg: "#dbeafe" },
  { icon: <Activity size={26} strokeWidth={1.8} />, title: "AI chẩn đoán thông minh", desc: "AI phân tích X-quang, phát hiện sớm bệnh lý răng miệng.", color: "#8b5cf6", bg: "#ede9fe" },
  { icon: <Clock size={26} strokeWidth={1.8} />, title: "Hẹn lịch linh hoạt", desc: "Đặt lịch online 24/7, nhắc lịch qua SMS/Zalo tự động.", color: "#f59e0b", bg: "#fef3c7" },
  { icon: <Users size={26} strokeWidth={1.8} />, title: "10.000+ bệnh nhân tin tưởng", desc: "Hơn 10 nghìn bệnh nhân điều trị thành công, 98% hài lòng.", color: "#14b8a6", bg: "#ccfbf1" },
  { icon: <Phone size={26} strokeWidth={1.8} />, title: "Hỗ trợ 24/7", desc: "Tổng đài và Zalo hỗ trợ mọi lúc, kể cả cuối tuần và lễ.", color: "#ef4444", bg: "#fee2e2" },
];

const STATS = [
  { value: "10.000+", label: "Bệnh nhân", icon: <Users size={20} strokeWidth={1.8} /> },
  { value: "15+", label: "Năm kinh nghiệm", icon: <Award size={20} strokeWidth={1.8} /> },
  { value: "50+", label: "Bác sĩ & KTV", icon: <Stethoscope size={20} strokeWidth={1.8} /> },
  { value: "98%", label: "Tỷ lệ hài lòng", icon: <Star size={20} strokeWidth={1.8} /> },
];

const DOCTORS = [
  { name: "BS. Nguyễn Văn Minh", specialty: "Chuyên gia Implant & Phẫu thuật", exp: "15 năm", degree: "ThS. Răng Hàm Mặt – ĐH Y Dược TP.HCM", photo: DOCTOR_PHOTOS[0], color: "#0284c7" },
  { name: "BS. Trần Thị Lan", specialty: "Chuyên gia Niềng răng & Chỉnh nha", exp: "12 năm", degree: "TS. Chỉnh nha – Tu nghiệp Nhật Bản", photo: DOCTOR_PHOTOS[1], color: "#7c3aed" },
  { name: "BS. Lê Hoàng Nam", specialty: "Chuyên gia Nha chu & Phục hình", exp: "10 năm", degree: "ThS. Nha chu – ĐH Y Hà Nội", photo: DOCTOR_PHOTOS[2], color: "#16a34a" },
  { name: "BS. Phạm Thu Hà", specialty: "Chuyên khoa Nha khoa trẻ em", exp: "8 năm", degree: "BS. Nha khoa trẻ em – ĐH RMIT", photo: DOCTOR_PHOTOS[3], color: "#db2777" },
];

const TESTIMONIALS = [
  { name: "Chị Ngọc Mai", role: "Nhân viên văn phòng, 28 tuổi", content: "Tôi niềng răng tại VinaMec được 18 tháng, kết quả vượt mong đợi. Bác sĩ Lan tư vấn rất tận tình, app đặt lịch tiện lợi, luôn nhắc trước lịch hẹn. Đặc biệt không phải chờ đợi lâu.", rating: 5, avatar: TESTIMONIAL_AVATARS[0] },
  { name: "Anh Hoàng Sơn", role: "Kỹ sư phần mềm, 32 tuổi", content: "Răng khôn ngầm được nhổ hoàn toàn không đau, chỉ hơi êm 1-2 ngày. Trước rất sợ nha khoa nhưng giờ hoàn toàn yên tâm. Cơ sở vật chất hiện đại, bác sĩ giải thích rõ ràng trước khi điều trị.", rating: 5, avatar: TESTIMONIAL_AVATARS[1] },
  { name: "Cô Hương Giang", role: "Giáo viên tiểu học, 42 tuổi", content: "Con gái từ sợ đi khám răng giờ lại mong đến ngày khám. Bác sĩ Hà rất giỏi, biết trò chuyện với trẻ. Răng sữa được chăm sóc tốt. Cả nhà đều khám và chăm sóc răng tại VinaMec.", rating: 5, avatar: TESTIMONIAL_AVATARS[2] },
];

const PRICING_PLANS = [
  { name: "Khám & Tư vấn", price: "Miễn phí", sub: "Lần đầu khám", desc: "Phù hợp cho người muốn kiểm tra tổng quát tình trạng răng miệng.", features: ["Khám lâm sàng toàn diện", "Kiểm tra bằng đèn nha khoa", "Tư vấn kế hoạch điều trị", "Lập hồ sơ răng miệng"], cta: "Đặt lịch khám", badge: null, popular: false, border: "#e2e8f0", btnBg: "transparent", btnColor: "#0d9488" },
  { name: "Vệ sinh răng miệng", price: "200.000đ", sub: "/ lần", desc: "Dịch vụ được lựa chọn nhiều nhất, giúp răng sạch sẽ và thơm tho.", features: ["Lấy cao răng siêu âm (U.S)", "Đánh bóng bề mặt răng", "Súc miệng khử khuẩn", "Tư vấn chăm sóc răng tại nhà", "Kiểm tra nướu tổng quát", "Bảo hành 3 tháng"], cta: "Đặt lịch ngay", badge: "Phổ biến nhất", popular: true, border: "#10b981", btnBg: "#10b981", btnColor: "#fff" },
  { name: "Trám răng thẩm mỹ", price: "300.000đ", sub: "/ răng", desc: "Trám composite cao cấp 3M, phục hồi hình dạng răng tự nhiên.", features: ["Khử trùng vùng điều trị", "Trám composite 3M Hoàn chỉnh", "Đánh bóng hoàn thiện", "Kiểm tra khớp cắn", "Bảo hành 12 tháng", "Tái khám miễn phí"], cta: "Đặt lịch ngay", badge: null, popular: false, border: "#e2e8f0", btnBg: "transparent", btnColor: "#0d9488" },
];

const FAQ_ITEMS = [
  { q: "Khi nào nên đi khám nha khoa?", a: "Bạn nên khám nha khoa định kỳ mỗi 6 tháng để phát hiện sớm các vấn đề. Ngoài ra, hãy đến ngay khi có: đau răng dữ dội, chảy máu nướu khi đánh răng, răng nhạy cảm với đồ nóng/lạnh, hôi miệng kéo dài, hoặc răng khôn gây đau. Đặc biệt trẻ em nên khám từ 6-12 tháng tuổi khi răng sữa đầu tiên mọc." },
  { q: "Quy trình đặt lịch như thế nào?", a: "Bạn có thể đặt lịch qua 3 cách: (1) Website/app: chọn dịch vụ → bác sĩ → ngày giờ phù hợp → xác nhận. (2) Hotline: gọi 0912 345 678 (8:00-18:00, Thứ 2-7). (3) Zalo: nhắn tin page VinaMec Dental. Sau khi đặt, bạn sẽ nhận xác nhận qua SMS/Zalo kèm lịch hẹn chi tiết." },
  { q: "Chi phí nha khoa có được bảo hiểm chi trả không?", a: "Một số dịch vụ được bảo hiểm y tế chi trả theo quy định của Bộ Y tế. Ngoài ra, VinaMec hỗ trợ thanh toán qua bảo hiểm tư nhân và chương trình trả góp 0% lãi suất 6-12 tháng cho các dịch vụ có chi phí cao như implant, niềng răng." },
  { q: "Niềng răng mất bao lâu và chi phí bao nhiêu?", a: "Thời gian niềng răng trung bình 18-36 tháng tùy tình trạng. Chi phí: Niềng mắc cài kim loại (25-40 triệu), niềng mắc cài sứ (40-60 triệu), niềng trong suốt (60-80 triệu). Giá đã bao gồm toàn bộ dịch vụ từ đầu đến cuối, không phát sinh thêm." },
  { q: "Implant là gì và chi phí bao nhiêu?", a: "Implant là trụ titanium được cắm vào xương hàm để thay thế chân răng đã mất. Ưu điểm: nhìn/chức năng như răng thật, không mài răng bên cạnh, bảo tồn xương. Quy trình: cắm trụ → lành trong 2-6 tháng → gắn abutment → gắn mão sứ. Chi phí: 15-35 triệu/răng tùy loại." },
  { q: "VinaMec có dịch vụ cấp cứu không?", a: "Có. VinaMec có đội ngũ cấp cứu nha khoa xử lý: chảy máu không cầm sau nhổ răng, sưng mặt/khớp hàm (nhiễm trùng), gãy răng do chấn thương, đau dữ dội không giảm. Gọi hotline 0912 345 678 hoặc đến trực tiếp phòng khám (8:00-18:00, Thứ 2-7)." },
];

// ─── Animations ────────────────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.7s cubic-bezier(.4,0,.2,1) ${delay}ms, transform 0.7s cubic-bezier(.4,0,.2,1) ${delay}ms`,
      }}>
      {children}
    </div>
  );
}

function RevealScale({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.88)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(.34,1.56,.64,1) ${delay}ms`,
      }}>
      {children}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenuOpen(false);
  };

  const NAV_LINKS = [
    { id: "services", label: "Dịch vụ" },
    { id: "about", label: "Giới thiệu" },
    { id: "doctors", label: "Bác sĩ" },
    { id: "pricing", label: "Bảng giá" },
    { id: "faq", label: "Hỏi đáp" },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/96 backdrop-blur-xl shadow-[0_1px_24px_rgba(0,0,0,0.08)] border-b border-slate-100/70"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between transition-all duration-400"
            style={{ height: scrolled ? "68px" : "80px" }}>
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => scrollTo("home")}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105"
                style={{ background: "linear-gradient(135deg, #0d9488, #0284c7)", boxShadow: "0 4px 16px rgba(13,148,136,0.35)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C9.5 2 7.5 3.5 7 6C6 6 5 7 5 8.5C5 10 6 11 7 12C7 12.5 6.5 13 6 13.5C5.5 14 5 14.5 5 15C5 16.5 6 18 7 19C8 20 9 21 10.5 21.5C10.5 21.5 11 22 11 22C11 22 11.5 21.5 11.5 21.5C13 21 14 20 15 19C16 18 17 16.5 17 15C17 14.5 16.5 14 16 13.5C15.5 13 15 12.5 15 12C16 11 17 10 17 8.5C17 7 16 6 15 6C14.5 3.5 12.5 2 12 2Z" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-black leading-tight block" style={{ color: scrolled ? "#0f172a" : "white" }}>
                  Vina<span style={{ color: "#0d9488" }}>Mec</span>
                </span>
                <span className="text-[10px] tracking-widest font-semibold uppercase" style={{ color: scrolled ? "#94a3b8" : "rgba(255,255,255,0.55)" }}>Dental Clinic</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(l => (
                <button key={l.id} onClick={() => scrollTo(l.id)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{ color: scrolled ? "#64748b" : "rgba(255,255,255,0.82)" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#0d9488"; e.currentTarget.style.background = scrolled ? "#f0fdfa" : "rgba(255,255,255,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = scrolled ? "#64748b" : "rgba(255,255,255,0.82)"; e.currentTarget.style.background = "transparent"; }}>
                  {l.label}
                </button>
              ))}
            </nav>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <button onClick={() => navigate("/login")}
                className="px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-200"
                style={{ color: scrolled ? "#0d9488" : "white", borderColor: scrolled ? "#0d9488" : "rgba(255,255,255,0.35)", background: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.background = scrolled ? "#0d9488" : "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = scrolled ? "#0d9488" : "white"; }}>
                Đăng nhập
              </button>
              <button onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-bold shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: "linear-gradient(135deg, #0d9488, #0284c7)", boxShadow: "0 4px 16px rgba(13,148,136,0.35)" }}>
                <Calendar size={15} />
                Đặt lịch khám
              </button>
            </div>

            {/* Mobile menu */}
            <button className="lg:hidden p-2 rounded-xl transition-all duration-200" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: scrolled ? "#1e293b" : "white", background: scrolled ? "#f1f5f9" : "rgba(255,255,255,0.1)" }}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl">
            <div className="max-w-7xl mx-auto px-5 py-4 space-y-1">
              {NAV_LINKS.map(l => (
                <button key={l.id} onClick={() => scrollTo(l.id)}
                  className="block w-full text-left px-4 py-3 rounded-xl text-slate-700 font-semibold text-sm hover:bg-emerald-50 hover:text-emerald-700 transition">
                  {l.label}
                </button>
              ))}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-emerald-500 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition">
                  Đăng nhập
                </button>
                <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
                  className="w-full px-4 py-3 rounded-xl text-white font-bold text-sm text-center shadow-md"
                  style={{ background: "linear-gradient(135deg, #0d9488, #0284c7)" }}>
                  Đặt lịch khám
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="VinaMec Dental Clinic" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(6,78,59,0.94) 0%, rgba(2,132,199,0.80) 45%, rgba(6,78,59,0.90) 100%)" }} />
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-10" style={{ background: "#5eead4", filter: "blur(80px)" }} />
          <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full opacity-10" style={{ background: "#7dd3fc", filter: "blur(80px)" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-32 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 border"
              style={{ background: "rgba(16,185,129,0.15)", borderColor: "rgba(16,185,129,0.35)" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: "#6ee7b7", animation: "pulse 2s infinite" }} />
              <span className="text-emerald-300 text-sm font-semibold">Hệ thống nha khoa hàng đầu Việt Nam</span>
            </div>

            {/* Headline */}
            <h1 className="font-black text-white leading-[1.08] mb-6"
              style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)", fontFamily: "'Playfair Display', serif" }}>
              Nụ cười của bạn,{" "}
              <span style={{ color: "#6ee7b7" }}>sứ mệnh của chúng tôi</span>
            </h1>

            <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-xl">
              VinaMec Dental Clinic — Nơi công nghệ tiên tiến gặp gỡ đội ngũ bác sĩ giàu kinh nghiệm,
              mang đến trải nghiệm nha khoa an toàn, thoải mái và kết quả vượt mong đợi.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-14">
              <button onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-2.5 px-9 py-4 rounded-full text-white font-bold text-base shadow-2xl transition-all duration-300 hover:shadow-teal-500/30 hover:-translate-y-1 active:translate-y-0"
                style={{ background: "linear-gradient(135deg, #0d9488, #0284c7)", boxShadow: "0 8px 32px rgba(13,148,136,0.45)" }}>
                <Calendar size={18} />
                Đặt lịch khám ngay
              </button>
              <button onClick={() => scrollTo("services")}
                className="flex items-center justify-center gap-2 px-9 py-4 rounded-full font-semibold text-base text-white transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
                style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}>
                Khám phá dịch vụ
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6">
              {[
                { icon: <Shield size={17} strokeWidth={2} />, text: "Vô trùng tuyệt đối", color: "#6ee7b7" },
                { icon: <Award size={17} strokeWidth={2} />, text: "Bác sĩ chuyên môn", color: "#93c5fd" },
                { icon: <Star size={17} strokeWidth={2} />, text: "10.000+ đánh giá 5★", color: "#fcd34d" },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-2.5 text-slate-300 text-sm font-medium">
                  <span style={{ color: item.color }}>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0" style={{ background: "rgba(0,0,0,0.32)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(16,185,129,0.18)" }}>
                    <span style={{ color: "#6ee7b7" }}>{s.icon}</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg leading-tight">{s.value}</p>
                    <p className="text-slate-400 text-xs font-medium">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────────────── */}
      <section id="services" className="py-24" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #f0fdf4 100%)" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                style={{ background: "linear-gradient(135deg, #d1fae5, #ccfbf1)", color: "#065f46" }}>
                <BookOpen size={13} strokeWidth={2.5} />
                Dịch vụ của chúng tôi
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Giải pháp nha khoa toàn diện
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">
                Từ khám răng định kỳ đến các phẫu thuật phức tạp, VinaMec cung cấp đầy đủ
                các dịch vụ nha khoa với chất lượng cao nhất.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((svc, idx) => (
              <Reveal key={svc.title} delay={idx * 80}>
                <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2"
                  onClick={() => navigate("/login")}>
                  <div className="relative h-48 overflow-hidden">
                    <img src={svc.image} alt={svc.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 w-11 h-11 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm"
                      style={{ background: `${svc.color}ee`, backdropFilter: "blur(8px)" }}>
                      <span style={{ color: "white" }}>{svc.icon}</span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg leading-tight">{svc.title}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{svc.desc}</p>
                    <ul className="space-y-2 mb-5">
                      {svc.items.map(item => (
                        <li key={item} className="flex items-center gap-2.5 text-slate-600 text-sm">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: svc.bg }}>
                            <Check size={11} strokeWidth={2.5} style={{ color: svc.color }} />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="font-bold text-base" style={{ color: svc.color }}>{svc.price}</span>
                      <button className="flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 group-hover:gap-2.5"
                        style={{ color: svc.color }}>
                        Đặt lịch <ChevronRight size={15} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="text-center mt-12">
              <button onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full text-white font-bold text-sm shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0"
                style={{ background: "linear-gradient(135deg, #0d9488, #0284c7)", boxShadow: "0 8px 28px rgba(13,148,136,0.35)" }}>
                Xem tất cả dịch vụ
                <ArrowRight size={16} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────────────────────────── */}
      <section id="about" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Images */}
            <Reveal className="relative">
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                  <img src={CLINIC_IMG} alt="Phòng khám VinaMec" className="w-full aspect-[4/3] object-cover" />
                </div>
                <div className="absolute -bottom-8 -right-4 lg:-right-8 w-56 h-36 rounded-2xl overflow-hidden shadow-2xl border-4 border-white hidden md:block"
                  style={{ bottom: "-32px" }}>
                  <img src={TEAM_IMG} alt="Đội ngũ VinaMec" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-4 -right-4 px-5 py-2.5 rounded-full text-white font-bold text-sm shadow-xl hidden md:flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #0d9488, #0284c7)", boxShadow: "0 8px 24px rgba(13,148,136,0.4)" }}>
                  <Award size={16} strokeWidth={2} />
                  15+ năm kinh nghiệm
                </div>
              </div>
            </Reveal>

            {/* Content */}
            <Reveal delay={150}>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ background: "#d1fae5", color: "#065f46" }}>
                  <BadgeCheck size={14} strokeWidth={2.5} />
                  Tại sao chọn VinaMec
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-5 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Nha khoa thông minh —{" "}
                  <span style={{ color: "#0d9488" }}>Con người tận tâm</span>
                </h2>
                <p className="text-slate-500 leading-relaxed mb-10 text-base">
                  Chúng tôi kết hợp công nghệ AI tiên tiến nhất với sự chăm sóc cá nhân hóa từ
                  đội ngũ bác sĩ giàu kinh nghiệm. Mỗi bệnh nhân đều nhận được kế hoạch điều trị
                  riêng biệt, phù hợp với tình trạng răng miệng và mong muốn của mình.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {FEATURES.map((f) => (
                    <div key={f.title}
                      className="flex gap-3.5 p-4 rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-default"
                      style={{ background: "#fafafa" }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: f.bg, color: f.color }}>
                        {f.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm mb-1">{f.title}</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => navigate("/login")}
                    className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, #0d9488, #0284c7)", boxShadow: "0 6px 20px rgba(13,148,136,0.3)" }}>
                    <Calendar size={16} />
                    Đặt lịch tư vấn
                  </button>
                  <button onClick={() => scrollTo("doctors")}
                    className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-0.5"
                    style={{ background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0" }}>
                    <Users size={16} />
                    Gặp đội ngũ bác sĩ
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d9488 0%, #0284c7 50%, #0f766e 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s, i) => (
              <RevealScale key={s.label} delay={i * 100}>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-1"
                    style={{ color: "white" }}>
                    {s.icon}
                  </div>
                  <p className="text-white font-black text-3xl">{s.value}</p>
                  <p className="text-emerald-100 text-sm font-semibold">{s.label}</p>
                </div>
              </RevealScale>
            ))}
          </div>
        </div>
      </div>

      {/* ── DOCTORS ─────────────────────────────────────────────────────────── */}
      <section id="doctors" className="py-24" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #ecfdf5 50%, #f0fdf4 100%)" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                style={{ background: "#ede9fe", color: "#5b21b6" }}>
                <Stethoscope size={13} strokeWidth={2.5} />
                Đội ngũ chuyên gia
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Bác sĩ giàu kinh nghiệm, tận tâm
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">
                Đội ngũ bác sĩ được đào tạo chuyên sâu tại các trường đại học y khoa hàng đầu,
                thường xuyên cập nhật kiến thức và kỹ thuwật mới nhất.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DOCTORS.map((doc, idx) => (
              <Reveal key={doc.name} delay={idx * 100}>
                <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer"
                  onClick={() => navigate("/login")}>
                  <div className="relative h-56 overflow-hidden">
                    <img src={doc.photo} alt={doc.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="text-white font-bold text-base leading-tight">{doc.name}</h4>
                      <p className="text-emerald-300 text-xs font-medium mt-0.5">{doc.specialty}</p>
                    </div>
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ background: doc.color }} />
                  </div>
                  <div className="p-4">
                    <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">{doc.degree}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                        style={{ background: `${doc.color}15`, color: doc.color }}>
                        <Clock size={12} strokeWidth={2} /> {doc.exp}
                      </span>
                      <button className="text-xs font-bold transition-colors hover:underline"
                        style={{ color: doc.color }}>
                        Đặt lịch <ChevronRight size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI CHAT CTA ─────────────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src={DENTAL_SMILE} alt="Dental AI" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(2,132,199,0.94) 0%, rgba(13,148,136,0.90) 100%)" }} />
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-48 h-48 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-10 right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 border"
              style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.25)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg>
              <span className="text-white text-sm font-semibold">Trí tuệ nhân tạo</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-5 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Trợ lý Nha khoa AI 24/7
            </h2>
            <p className="text-slate-200 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
              Bạn có thắc mắc về răng miệng? Trò chuyện ngay với AI của VinaMec để được
              tư vấn nhanh chóng, chính xác — hoàn toàn miễn phí, mọi lúc mọi nơi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-2.5 px-10 py-4 rounded-full text-white font-bold text-base shadow-2xl transition-all duration-300 hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.25)" }}>
                <MessageCircle size={20} />
                Chat với AI ngay
              </button>
              <button onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-2 px-10 py-4 rounded-full font-bold text-base transition-all duration-300 hover:-translate-y-1"
                style={{ background: "white", color: "#0d9488", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                <Calendar size={20} />
                Đặt lịch khám
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                style={{ background: "#fef3c7", color: "#92400e" }}>
                <Star size={13} strokeWidth={2.5} />
                Cảm nhận khách hàng
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Họ nói gì về VinaMec
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">Hơn 10.000+ bệnh nhân đã tin tưởng lựa chọn VinaMec Dental Clinic</p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <Reveal key={t.name} delay={idx * 120}>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-1 relative overflow-hidden">
                  <div className="absolute top-4 right-5 text-6xl font-serif leading-none opacity-[0.04] select-none">"</div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={15} strokeWidth={0} className="text-amber-400" fill="#facc15" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{t.content}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover shadow-sm border-2 border-slate-100" />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                      <p className="text-slate-400 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #ecfdf5 100%)" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                style={{ background: "#d1fae5", color: "#065f46" }}>
                <CreditCard size={13} strokeWidth={2.5} />
                Bảng giá dịch vụ
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Chi phí minh bạch, rõ ràng
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">
                Không phí ẩn, không chi phí phát sinh ngoài dự kiến. Chúng tôi cam kết báo giá
                chính xác trước khi điều trị.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan, idx) => (
              <Reveal key={plan.name} delay={idx * 100}>
                <div className={`relative rounded-2xl p-7 transition-all duration-400 hover:-translate-y-1 ${plan.popular ? "bg-white shadow-2xl" : "bg-white border border-slate-100 shadow-sm hover:shadow-lg"}`}
                  style={plan.popular ? { border: "2px solid #10b981" } : {}}>
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg whitespace-nowrap flex items-center gap-1.5"
                      style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 12px rgba(245,158,11,0.4)" }}>
                      <Star size={11} strokeWidth={0} fill="white" />
                      {plan.badge}
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{plan.name}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{plan.desc}</p>
                  </div>

                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-slate-400 text-sm ml-1 font-medium">{plan.sub}</span>
                  </div>

                  <ul className="space-y-3 mb-7">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-3 text-sm text-slate-600">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: "#d1fae5" }}>
                          <Check size={11} strokeWidth={2.5} style={{ color: "#10b981" }} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button onClick={() => navigate("/login")}
                    className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.98]"
                    style={{
                      background: plan.btnBg === "transparent" ? "transparent" : plan.btnBg,
                      color: plan.btnColor,
                      border: plan.popular ? "none" : "2px solid #e2e8f0",
                    }}>
                    {plan.cta}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="text-center text-slate-400 text-xs mt-8">
              * Giá tham khảo. Chi phí thực tế có thể thay đổi tùy tình trạng. Vui lòng liên hệ để được báo giá chính xác.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                style={{ background: "#dbeafe", color: "#1e40af" }}>
                <MessageCircle size={13} strokeWidth={2.5} />
                Câu hỏi thường gặp
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Giải đáp thắc mắc
              </h2>
            </div>
          </Reveal>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <Reveal key={idx} delay={idx * 60}>
                <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  openFaq === idx
                    ? "border-emerald-300 bg-emerald-50/60 shadow-sm"
                    : "border-slate-200 bg-white hover:border-emerald-200"
                }`}>
                  <button className="w-full px-6 py-4 flex items-center justify-between text-left gap-4"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                    <span className={`font-bold text-sm leading-relaxed ${openFaq === idx ? "text-emerald-700" : "text-slate-800"}`}>
                      {item.q}
                    </span>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${openFaq === idx ? "bg-emerald-500 text-white rotate-180" : "bg-slate-100 text-slate-400"}`}>
                      <ChevronDown size={16} strokeWidth={2.5} />
                    </span>
                  </button>
                  <div className={`px-6 overflow-hidden transition-all duration-400 ${openFaq === idx ? "max-h-96 pb-5" : "max-h-0"}`}>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / CONTACT ───────────────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #020617 0%, #0f172a 40%, #064e3b 100%)" }}>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-sky-500/5 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-bold uppercase tracking-widest"
              style={{ background: "rgba(16,185,129,0.12)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.25)" }}>
              <PhoneCall size={14} strokeWidth={2} />
              Sẵn sàng phục vụ
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Nụ cười của bạn xứng đáng<br />
              <span style={{ color: "#6ee7b7" }}>được chăm sóc tốt nhất</span>
            </h2>
            <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              Đặt lịch khám ngay hôm nay và trải nghiệm dịch vụ nha khoa hiện đại tại VinaMec.
              Đội ngũ bác sĩ và nhân viên luôn sẵn sàng chào đón bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-2.5 px-12 py-4.5 rounded-full text-white font-bold text-base shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-500/30"
                style={{ background: "linear-gradient(135deg, #0d9488, #0284c7)", boxShadow: "0 8px 32px rgba(13,148,136,0.45)" }}>
                <Calendar size={18} />
                Đặt lịch khám
              </button>
              <a href="tel:0912345678"
                className="flex items-center justify-center gap-2.5 px-10 py-4.5 rounded-full font-bold text-base transition-all duration-300 hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white", backdropFilter: "blur(8px)" }}>
                <Phone size={18} />
                0912 345 678
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-slate-500 text-sm font-medium">
              <span className="flex items-center gap-2"><MapPin size={15} /> 123 Nguyễn Huệ, Q.1, TP.HCM</span>
              <span className="flex items-center gap-2"><Clock size={15} /> Thứ 2 - Thứ 7: 8:00 - 18:00</span>
              <span className="flex items-center gap-2"><Mail size={15} /> contact@vinamec.vn</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ background: "#030712" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg, #0d9488, #0284c7)", boxShadow: "0 4px 16px rgba(13,148,136,0.3)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C9.5 2 7.5 3.5 7 6C6 6 5 7 5 8.5C5 10 6 11 7 12C7 12.5 6.5 13 6 13.5C5.5 14 5 14.5 5 15C5 16.5 6 18 7 19C8 20 9 21 10.5 21.5C10.5 21.5 11 22 11 22C11 22 11.5 21.5 11.5 21.5C13 21 14 20 15 19C16 18 17 16.5 17 15C17 14.5 16.5 14 16 13.5C15.5 13 15 12.5 15 12C16 11 17 10 17 8.5C17 7 16 6 15 6C14.5 3.5 12.5 2 12 2Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-black text-white leading-tight">Vina<span style={{ color: "#0d9488" }}>Mec</span></p>
                  <p className="text-[10px] text-slate-600 tracking-widest font-semibold uppercase">Dental Clinic</p>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                Hệ thống nha khoa VinaMec — Nơi công nghệ hiện đại gặp gỡ sự chăm sóc tận tâm,
                mang đến nụ cười hoàn hảo cho mọi khách hàng.
              </p>
              <div className="flex gap-2.5">
                {[
                  { icon: "f", color: "#1877f2" },
                  { icon: "Z", color: "#0068ff" },
                  { icon: "▶", color: "#ff0000" },
                ].map((s, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-black border transition-all duration-200 hover:scale-110"
                    style={{ borderColor: "#1f2937", background: "#111827" }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold text-sm mb-5 pb-3 border-b border-slate-800">Liên kết nhanh</h4>
              <ul className="space-y-3">
                {["Trang chủ", "Dịch vụ", "Bác sĩ", "Bảng giá", "Hỏi đáp", "Liên hệ"].map(item => (
                  <li key={item}>
                    <button onClick={() => scrollTo(item.toLowerCase().replace(" ", "-"))}
                      className="text-slate-500 text-sm hover:text-emerald-400 transition-colors duration-200">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-bold text-sm mb-5 pb-3 border-b border-slate-800">Dịch vụ</h4>
              <ul className="space-y-3">
                {["Khám răng định kỳ", "Trám răng thẩm mỹ", "Niềng răng", "Cấy ghép Implant", "Tẩy trắng răng", "Nha khoa trẻ em"].map(item => (
                  <li key={item}>
                    <button onClick={() => navigate("/login")}
                      className="text-slate-500 text-sm hover:text-emerald-400 transition-colors duration-200">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold text-sm mb-5 pb-3 border-b border-slate-800">Liên hệ</h4>
              <ul className="space-y-4">
                {[
                  { icon: <MapPin size={16} strokeWidth={1.8} />, text: "123 Nguyễn Huệ, Q.1, TP.HCM" },
                  { icon: <Phone size={16} strokeWidth={1.8} />, text: "0912 345 678" },
                  { icon: <Mail size={16} strokeWidth={1.8} />, text: "contact@vinamec.vn" },
                  { icon: <Clock size={16} strokeWidth={1.8} />, text: "Thứ 2 - Thứ 7: 8:00 - 18:00" },
                ].map(item => (
                  <li key={item.text} className="flex items-start gap-3 text-slate-500 text-sm">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: "#0d9488" }}>{item.icon}</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-700 text-xs">© 2024 VinaMec Dental Clinic. Mọi quyền được bảo lưu.</p>
            <div className="flex gap-6">
              <button className="text-slate-700 text-xs hover:text-emerald-400 transition-colors duration-200">Chính sách bảo mật</button>
              <button className="text-slate-700 text-xs hover:text-emerald-400 transition-colors duration-200">Điều khoản sử dụng</button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
