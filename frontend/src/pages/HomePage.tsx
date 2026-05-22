import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { serviceApi } from "../services/api";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconTooth = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C9.5 2 7.5 3.5 7 6C6 6 5 7 5 8.5C5 10 6 11 7 12C7 12.5 6.5 13 6 13.5C5.5 14 5 14.5 5 15C5 16.5 6 18 7 19C8 20 9 21 10.5 21.5C10.5 21.5 11 22 11 22C11 22 11.5 21.5 11.5 21.5C13 21 14 20 15 19C16 18 17 16.5 17 15C17 14.5 16.5 14 16 13.5C15.5 13 15 12.5 15 12C16 11 17 10 17 8.5C17 7 16 6 15 6C14.5 3.5 12.5 2 12 2Z" />
  </svg>
);

const IconCalendar = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeLinecap="round" />
  </svg>
);

const IconPhone = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .84h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" />
  </svg>
);

const IconCheck = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconArrow = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconStar = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const IconChat = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
  </svg>
);

const IconShield = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconClock = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconAward = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const IconUsers = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 110 8 4 4 0 010-8z" />
  </svg>
);

const IconLocation = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconMail = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconChevronDown = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconMenu = ({ className = "", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const IconClose = ({ className = "", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Image URLs (real dental/clinic photos) ────────────────────────────────────
const HERO_IMG = "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80&auto=format&fit=crop";
const CLINIC_IMG = "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80&auto=format&fit=crop";
const TEAM_IMG = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80&auto=format&fit=crop";
const DENTAL_CHAIR = "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80&auto=format&fit=crop";
const IMPLANT_IMG = "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&q=80&auto=format&fit=crop";
const WHITENING_IMG = "https://images.unsplash.com/photo-1609840114852-5f7e4e7e0d27?w=600&q=80&auto=format&fit=crop";
const BRACES_IMG = "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=600&q=80&auto=format&fit=crop";
const KID_DENTAL = "https://images.unsplash.com/photo-1514849302-984523450cf4?w=600&q=80&auto=format&fit=crop";
const CTA_IMG = "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80&auto=format&fit=crop";

const DOCTOR_PHOTOS = [
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80&auto=format&fit=crop&fp-x=0.5&fp-y=0.3&crop=focalpoint",
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80&auto=format&fit=crop&fp-x=0.5&fp-y=0.3&crop=focalpoint",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80&auto=format&fit=crop&fp-x=0.5&fp-y=0.3&crop=focalpoint",
  "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&q=80&auto=format&fit=crop&fp-x=0.5&fp-y=0.3&crop=focalpoint",
];

const TESTIMONIAL_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80&auto=format&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80&auto=format&fit=crop&crop=face",
];

// ─── Data ─────────────────────────────────────────────────────────────────────
const SERVICE_CATEGORIES = [
  {
    title: "Khám & Chẩn đoán",
    icon: <IconTooth className="w-7 h-7" />,
    color: "bg-blue-500",
    image: CLINIC_IMG,
    items: ["Khám tổng quát", "Chụp X-quang Panorama", "Tư vấn điều trị", "Lập kế hoạch răng miệng"],
    price: "Miễn phí",
  },
  {
    title: "Trám & Phục hình",
    icon: <IconAward className="w-7 h-7" />,
    color: "bg-teal-500",
    image: DENTAL_CHAIR,
    items: ["Trám răng composite", "Trám amalgam", "Inlay/Onlay sứ", "Gắn đá sapphire"],
    price: "Từ 300.000đ",
  },
  {
    title: "Cấy ghép Implant",
    icon: <IconShield className="w-7 h-7" />,
    color: "bg-amber-500",
    image: IMPLANT_IMG,
    items: ["Implant Straumann (Thụy Sĩ)", "Implant Osstem (Hàn Quốc)", "Implant Dentium (Hàn Quốc)", "Nâng xương ghép десна"],
    price: "Từ 15.000.000đ",
  },
  {
    title: "Niềng răng",
    icon: <IconAward className="w-7 h-7" />,
    color: "bg-purple-500",
    image: BRACES_IMG,
    items: ["Niềng mắc cài kim loại", "Niềng mắc cài sứ", "Niềng trong suốt Invisalign", "Niềng rãnh (Damon)"],
    price: "Từ 25.000.000đ",
  },
  {
    title: "Tẩy trắng & Thẩm mỹ",
    icon: <IconStar className="w-7 h-7" />,
    color: "bg-pink-500",
    image: WHITENING_IMG,
    items: ["Tẩy trắng tại phòng khám", "Máng tẩy tại nhà", "Veneer sứ cao cấp", "Đánh bóng răng"],
    price: "Từ 2.000.000đ",
  },
  {
    title: "Nha khoa trẻ em",
    icon: <IconUsers className="w-7 h-7" />,
    color: "bg-green-500",
    image: KID_DENTAL,
    items: ["Khám và điều trị cho trẻ", "Trám răng sữa", "Bôi fluoride", "Niêm phong rãnh"],
    price: "Từ 150.000đ",
  },
];

const FEATURES = [
  {
    icon: <IconShield className="w-8 h-8 text-emerald-500" />,
    title: "Vô trùng tuyệt đối",
    desc: "Quy trình vô trùng theo tiêu chuẩn Bộ Y tế, mỗi dụng cụ được khử trùng riêng biệt.",
  },
  {
    icon: <IconAward className="w-8 h-8 text-blue-500" />,
    title: "Bác sĩ chuyên môn cao",
    desc: "Đội ngũ bác sĩ được đào tạo tại ĐH Y Dược TP.HCM, tu nghiệp tại Nhật Bản, Hàn Quốc.",
  },
  {
    icon: <IconChat className="w-8 h-8 text-purple-500" />,
    title: "AI chẩn đoán thông minh",
    desc: "Hệ thống AI phân tích X-quang, hỗ trợ bác sĩ phát hiện sớm các bệnh lý răng miệng.",
  },
  {
    icon: <IconClock className="w-8 h-8 text-amber-500" />,
    title: "Hẹn lịch linh hoạt",
    desc: "Đặt lịch online 24/7, nhắc lịch tự động qua SMS/Zalo, không cần chờ đợi lâu.",
  },
  {
    icon: <IconUsers className="w-8 h-8 text-teal-500" />,
    title: "10.000+ bệnh nhân tin tưởng",
    desc: "Hơn 10 nghìn bệnh nhân đã điều trị thành công, đạt tỷ lệ hài lòng 98%.",
  },
  {
    icon: <IconPhone className="w-8 h-8 text-red-500" />,
    title: "Hỗ trợ 24/7",
    desc: "Tổng đài và Zalo hỗ trợ tư vấn mọi lúc, kể cả cuối tuần và ngày lễ.",
  },
];

const STATS = [
  { value: "10.000+", label: "Bệnh nhân", icon: <IconUsers className="w-5 h-5" /> },
  { value: "15+", label: "Năm kinh nghiệm", icon: <IconAward className="w-5 h-5" /> },
  { value: "50+", label: "Bác sĩ & Kỹ thuật viên", icon: <IconShield className="w-5 h-5" /> },
  { value: "98%", label: "Tỷ lệ hài lòng", icon: <IconStar className="w-5 h-5" /> },
];

const DOCTORS = [
  {
    name: "BS. Nguyễn Văn Minh",
    specialty: "Chuyên gia Implant & Phẫu thuật",
    exp: "15 năm",
    degree: "ThS. Răng Hàm Mặt – ĐH Y Dược TP.HCM",
    photo: DOCTOR_PHOTOS[0],
  },
  {
    name: "BS. Trần Thị Lan",
    specialty: "Chuyên gia Niềng răng & Chỉnh nha",
    exp: "12 năm",
    degree: "TS. Chỉnh nha – Tu nghiệp Nhật Bản",
    photo: DOCTOR_PHOTOS[1],
  },
  {
    name: "BS. Lê Hoàng Nam",
    specialty: "Chuyên gia Nha chu & Phục hình",
    exp: "10 năm",
    degree: "ThS. Nha chu – ĐH Y Hà Nội",
    photo: DOCTOR_PHOTOS[2],
  },
  {
    name: "BS. Phạm Thu Hà",
    specialty: "Chuyên khoa Nha khoa trẻ em",
    exp: "8 năm",
    degree: "BS. Nha khoa trẻ em – ĐH RMIT",
    photo: DOCTOR_PHOTOS[3],
  },
];

const TESTIMONIALS = [
  {
    name: "Chị Ngọc Mai",
    role: "Nhân viên văn phòng, 28 tuổi",
    content:
      "Tôi niềng răng tại VinaMec được 18 tháng, kết quả vượt mong đợi. Bác sĩ Lan tư vấn rất tận tình, nhân viên thân thiện. App đặt lịch tiện lợi, luôn nhắc nhở trước lịch hẹn. Đặc biệt không phải chờ đợi lâu như những phòng khám khác.",
    rating: 5,
    avatar: TESTIMONIAL_AVATARS[0],
  },
  {
    name: "Anh Hoàng Sơn",
    role: "Kỹ sư phần mềm, 32 tuổi",
    content:
      "Răng khôn ngầm của tôi được nhổ hoàn toàn không đau, chỉ hơi êm buốt 1-2 ngày. Trước đây rất sợ nha khoa nhưng giờ hoàn toàn yên tâm. Cơ sở vật chất hiện đại, sạch sẽ, bác sĩ giải thích rõ ràng về tình trạng răng trước khi điều trị.",
    rating: 5,
    avatar: TESTIMONIAL_AVATARS[1],
  },
  {
    name: "Cô Hương Giang",
    role: "Giáo viên tiểu học, 42 tuổi",
    content:
      "Con gái tôi từ sợ đi khám răng giờ lại mong đến ngày khám. Bác sĩ Hà rất giỏi, biết cách trò chuyện với trẻ, con bé về nhà còn kể lại. Răng sữa của con được chăm sóc tốt, không cần nhổ sớm. Cả nhà đều khám và chăm sóc răng tại VinaMec.",
    rating: 5,
    avatar: TESTIMONIAL_AVATARS[2],
  },
];

const PRICING_PLANS = [
  {
    name: "Khám & Tư vấn",
    price: "Miễn phí",
    sub: "Lần đầu khám",
    desc: "Phù hợp cho người muốn kiểm tra tổng quát tình trạng răng miệng.",
    features: [
      "Khám lâm sàng toàn diện",
      "Kiểm tra bằng đèn nha khoa",
      "Tư vấn kế hoạch điều trị",
      "Lập hồ sơ răng miệng",
      "Chụp X-quang (nếu cần, phụ thu)",
    ],
    cta: "Đặt lịch khám",
    ctaStyle: "outline",
    badge: null,
    accent: "border-slate-200",
  },
  {
    name: "Vệ sinh răng miệng",
    price: "200.000đ",
    sub: "/ lần",
    desc: "Dịch vụ được lựa chọn nhiều nhất, giúp răng sạch sẽ và thơm tho.",
    features: [
      "Lấy cao răng siêu âm (U.S)",
      "Đánh bóng bề mặt răng",
      "Súc miệng khử khuẩn",
      "Tư vấn chăm sóc răng tại nhà",
      "Kiểm tra nướu tổng quát",
      "Bảo hành 3 tháng",
    ],
    cta: "Đặt lịch ngay",
    ctaStyle: "solid",
    badge: "Phổ biến nhất",
    accent: "border-emerald-400",
    popular: true,
  },
  {
    name: "Trám răng thẩm mỹ",
    price: "300.000đ",
    sub: "/ răng",
    desc: "Trám composite cao cấp 3M, phục hồi hình dạng răng tự nhiên.",
    features: [
      "Khử trùng vùng điều trị",
      "Trám composite 3M Hoàn chỉnh",
      "Đánh bóng hoàn thiện",
      "Kiểm tra khớp cắn",
      "Bảo hành 12 tháng",
      "Tái khám miễn phí",
    ],
    cta: "Đặt lịch ngay",
    ctaStyle: "outline",
    badge: null,
    accent: "border-slate-200",
  },
];

const FAQ_ITEMS = [
  {
    q: "Khi nào nên đi khám nha khoa?",
    a: "Bạn nên khám nha khoa định kỳ mỗi 6 tháng để phát hiện sớm các vấn đề. Ngoài ra, hãy đến ngay khi có: đau răng dữ dội, chảy máu nướu khi đánh răng, răng nhạy cảm với đồ nóng/lạnh, hôi miệng kéo dài, hoặc răng khôn gây đau/sưng. Đặc biệt trẻ em nên khám từ 6-12 tháng tuổi khi răng sữa đầu tiên mọc.",
  },
  {
    q: "Quy trình đặt lịch như thế nào?",
    a: "Bạn có thể đặt lịch qua 3 cách: (1) Website/app: chọn dịch vụ → bác sĩ → ngày giờ phù hợp → xác nhận. (2) Hotline: gọi 0912 345 678 (8:00-18:00, Thứ 2-7). (3) Zalo: nhắn tin page VinaMec Dental. Sau khi đặt, bạn sẽ nhận xác nhận qua SMS/Zalo kèm lịch hẹn chi tiết.",
  },
  {
    q: "Chi phí nha khoa có được bảo hiểm chi trả không?",
    a: "Một số dịch vụ được bảo hiểm y tế chi trả theo quy định của Bộ Y tế (khám bệnh, một số phẫu thuật). Ngoài ra, VinaMec còn hỗ trợ thanh toán qua bảo hiểm tư nhân và chương trình trả góp 0% lãi suất 6-12 tháng cho các dịch vụ có chi phí cao như implant, niềng răng.",
  },
  {
    q: "Niềng răng mất bao lâu và chi phí bao nhiêu?",
    a: "Thời gian niềng răng trung bình 18-36 tháng tùy tình trạng. Chi phí: Niềng mắc cài kim loại (25-40 triệu), niềng mắc cài sứ (40-60 triệu), niềng trong suốt Invisalign (60-80 triệu). Giá đã bao gồm toàn bộ dịch vụ từ đầu đến cuối, không phát sinh thêm chi phí. Đặt lịch tư vấn miễn phí để được báo giá chính xác.",
  },
  {
    q: "Implant là gì và chi phí bao nhiêu?",
    a: "Implant là trụ titanium được cắm vào xương hàm để thay thế chân răng đã mất, sau đó gắn mão sứ lên trên. Ưu điểm: nhìn/chức năng như răng thật, không mài răng bên cạnh, bảo tồn xương. Quy trình: cắm trụ (lành trong 2-6 tháng) → gắn abutment → gắn mão sứ. Chi phí: 15-35 triệu/răng tùy loại implant (Straumann, Osstem, Dentium).",
  },
  {
    q: "VinaMec có dịch vụ cấp cứu không?",
    a: "Có. VinaMec có đội ngũ cấp cứu nha khoa xử lý: chảy máu không cầm sau nhổ răng, sưng mặt/khớp hàm (nhiễm trùng có thể lan rộng), gãy răng do chấn thương, đau dữ dội không giảm. Gọi hotline 0912 345 678 hoặc đến trực tiếp phòng khám trong giờ hành chính (8:00-18:00, Thứ 2-7).",
  },
];

// ─── Hook ──────────────────────────────────────────────────────────────────────
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useScrollAnimation();
  return (
    <div ref={ref} className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
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
    serviceApi.getAll().then(() => {}).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
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
    <div className="min-h-screen bg-white overflow-x-hidden font-sans">

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/98 backdrop-blur-md shadow-md border-b border-slate-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo("home")}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <span className="text-white text-xl font-bold">VM</span>
              </div>
              <div>
                <span className="text-xl font-bold leading-tight" style={{ color: scrolled ? "#0f172a" : "white" }}>
                  Vina<span className="text-emerald-500">Mec</span>
                </span>
                <p className="text-[10px] text-slate-400 leading-tight">Dental Clinic</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map(l => (
                <button key={l.id} onClick={() => scrollTo(l.id)}
                  className="text-sm font-medium transition-colors" style={{ color: scrolled ? "#64748b" : "rgba(255,255,255,0.8)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#10b981")}
                  onMouseLeave={e => (e.currentTarget.style.color = scrolled ? "#64748b" : "rgba(255,255,255,0.8)")}>
                  {l.label}
                </button>
              ))}
            </nav>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <button onClick={() => navigate("/login")}
                className="text-sm font-medium px-4 py-2 rounded-full border transition-all"
                style={{ color: scrolled ? "#64748b" : "white", borderColor: scrolled ? "#e2e8f0" : "rgba(255,255,255,0.4)", background: "transparent" }}>
                Đăng nhập
              </button>
              <button onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #10b981, #0d9488)" }}>
                <IconCalendar className="w-4 h-4" />
                Đặt lịch khám
              </button>
            </div>

            {/* Mobile menu button */}
            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen
                ? <IconClose className="w-6 h-6" style={{ color: scrolled ? "#1e293b" : "white" }} />
                : <IconMenu className="w-6 h-6" style={{ color: scrolled ? "#1e293b" : "white" }} />
              }
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg">
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(l => (
                <button key={l.id} onClick={() => scrollTo(l.id)}
                  className="block w-full text-left px-4 py-3 rounded-xl text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-600 transition">
                  {l.label}
                </button>
              ))}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button onClick={() => navigate("/login")} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition">
                  Đăng nhập
                </button>
                <button onClick={() => navigate("/login")} className="w-full px-4 py-3 rounded-xl text-white font-semibold text-center shadow-md" style={{ background: "linear-gradient(135deg, #10b981, #0d9488)" }}>
                  Đặt lịch khám
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section id="home" className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Nha khoa VinaMec" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(6,78,59,0.92) 0%, rgba(6,78,59,0.7) 50%, rgba(6,78,59,0.85) 100%)" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)" }}>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-sm font-medium">Hệ thống nha khoa hàng đầu Việt Nam</span>
            </div>

            <h1 className="font-bold text-white leading-tight mb-6" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}>
              Nụ cười của bạn,<br />
              <span style={{ color: "#6ee7b7" }}>Sứ mệnh của chúng tôi</span>
            </h1>

            <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-xl">
              VinaMec Dental Clinic — Nơi công nghệ tiên tiến gặp gỡ đội ngũ bác sĩ giàu kinh nghiệm,
              mang đến trải nghiệm nha khoa an toàn, thoải mái và kết quả vượt mong đợi.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-14">
              <button onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-white font-semibold text-base shadow-2xl transition-all hover:shadow-emerald-500/40 hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #10b981, #0d9488)" }}>
                <IconCalendar className="w-5 h-5" />
                Đặt lịch khám ngay
              </button>
              <button onClick={() => scrollTo("services")}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all hover:scale-105 active:scale-95"
                style={{ background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.3)", color: "white" }}>
                Khám phá dịch vụ
                <IconArrow className="w-4 h-4" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6">
              {[
                { icon: <IconShield className="w-4 h-4" />, text: "Vô trùng tuyệt đối" },
                { icon: <IconAward className="w-4 h-4" />, text: "Bác sĩ chuyên môn" },
                { icon: <IconStar className="w-4 h-4" />, text: "10.000+ đánh giá 5★" },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-2 text-slate-300 text-sm">
                  <span style={{ color: "#10b981" }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS.map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ background: "rgba(16,185,129,0.25)" }}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg leading-tight">{s.value}</p>
                    <p className="text-slate-400 text-xs">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────────────── */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-emerald-600 text-sm font-bold uppercase tracking-widest">Dịch vụ của chúng tôi</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4">
                Giải pháp nha khoa toàn diện
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Từ khám răng định kỳ đến các phẫu thuật phức tạp, VinaMec cung cấp đầy đủ
                các dịch vụ nha khoa với chất lượng cao nhất và chi phí hợp lý nhất.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICE_CATEGORIES.map((svc, idx) => (
              <FadeIn key={svc.title} delay={idx * 80}>
                <div className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate("/login")}>
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img src={svc.image} alt={svc.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className={`absolute top-3 left-3 w-10 h-10 rounded-xl ${svc.color} flex items-center justify-center text-white shadow-lg`}>
                      {svc.icon}
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <h3 className="text-white font-bold text-lg">{svc.title}</h3>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-5">
                    <ul className="space-y-2 mb-4">
                      {svc.items.map(item => (
                        <li key={item} className="flex items-center gap-2 text-slate-600 text-sm">
                          <span className="text-emerald-500"><IconCheck className="w-4 h-4" /></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-emerald-600 font-bold text-sm">{svc.price}</span>
                      <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition">
                        Đặt lịch <IconArrow className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="text-center mt-12">
              <button onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #10b981, #0d9488)" }}>
                Xem tất cả dịch vụ
                <IconArrow className="w-4 h-4" />
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────────────── */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Images */}
            <FadeIn>
              <div className="relative">
                <img src={CLINIC_IMG} alt="Phòng khám VinaMec" className="rounded-2xl shadow-2xl w-full" />
                <div className="absolute -bottom-8 -right-8 w-56 h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-white hidden lg:block">
                  <img src={TEAM_IMG} alt="Đội ngũ VinaMec" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-4 -right-4 bg-emerald-500 text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-xl hidden lg:block">
                  15+ năm kinh nghiệm
                </div>
              </div>
            </FadeIn>

            {/* Right - Content */}
            <FadeIn delay={150}>
              <div>
                <span className="text-emerald-600 text-sm font-bold uppercase tracking-widest">Tại sao chọn VinaMec</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-6 leading-tight">
                  Nha khoa thông minh —<br />
                  <span className="text-emerald-600">Con người tận tâm</span>
                </h2>
                <p className="text-slate-500 leading-relaxed mb-8">
                  Chúng tôi kết hợp công nghệ AI tiên tiến nhất với sự chăm sóc cá nhân hóa từ
                  đội ngũ bác sĩ giàu kinh nghiệm. Mỗi bệnh nhân đều nhận được kế hoạch điều trị
                  riêng biệt, phù hợp với tình trạng răng miệng và mong muốn của mình.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {FEATURES.map(f => (
                    <div key={f.title} className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition">
                      {f.icon}
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{f.title}</h4>
                        <p className="text-slate-400 text-xs leading-relaxed mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-sm shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #10b981, #0d9488)" }}>
                  Tìm hiểu thêm
                  <IconArrow className="w-4 h-4" />
                </button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ─────────────────────────────────────────────── */}
      <div className="py-14" style={{ background: "linear-gradient(135deg, #10b981, #0d9488)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 mb-3 text-white">
                  {s.icon}
                </div>
                <p className="text-white font-bold text-3xl mb-1">{s.value}</p>
                <p className="text-emerald-100 text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DOCTORS ─────────────────────────────────────────────────── */}
      <section id="doctors" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-emerald-600 text-sm font-bold uppercase tracking-widest">Đội ngũ chuyên gia</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4">
                Bác sĩ giàu kinh nghiệm, tận tâm
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Đội ngũ bác sĩ được đào tạo chuyên sâu tại các trường đại học y khoa hàng đầu,
                thường xuyên cập nhật kiến thức và kỹ thuật mới nhất trong và ngoài nước.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DOCTORS.map((doc, idx) => (
              <FadeIn key={doc.name} delay={idx * 100}>
                <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-56 overflow-hidden">
                    <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="text-white font-bold text-base">{doc.name}</h4>
                      <p className="text-emerald-300 text-xs font-medium">{doc.specialty}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-slate-500 text-xs mb-3">{doc.degree}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                        <IconClock className="w-3.5 h-3.5" /> {doc.exp} kinh nghiệm
                      </span>
                      <button onClick={() => navigate("/login")}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition">
                        Đặt lịch →
                      </button>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-emerald-600 text-sm font-bold uppercase tracking-widest">Cảm nhận khách hàng</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4">
                Họ nói gì về VinaMec
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <FadeIn key={t.name} delay={idx * 120}>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <IconStar key={i} className="w-4 h-4 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{t.content}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover shadow-sm" />
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                      <p className="text-slate-400 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-emerald-600 text-sm font-bold uppercase tracking-widest">Bảng giá dịch vụ</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4">
                Chi phí minh bạch, rõ ràng
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Không phí ẩn, không chi phí phát sinh ngoài dự kiến. Chúng tôi cam kết báo giá
                chính xác trước khi điều trị.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan, idx) => (
              <FadeIn key={plan.name} delay={idx * 100}>
                <div className={`relative rounded-2xl p-6 ${plan.popular ? "bg-white shadow-2xl border-2" : "bg-white border"} ${plan.accent} transition-all`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{plan.name}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{plan.desc}</p>
                  </div>

                  <div className="mb-5 pb-5 border-b border-slate-100">
                    <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-400 text-sm ml-1">{plan.sub}</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <span className="text-emerald-500 mt-0.5"><IconCheck className="w-4 h-4" /></span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button onClick={() => navigate("/login")}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md active:scale-95 ${
                      plan.ctaStyle === "solid"
                        ? "text-white shadow-md hover:shadow-lg"
                        : "border-2 text-emerald-600 hover:bg-emerald-50"
                    }`}
                    style={plan.ctaStyle === "solid" ? { background: "linear-gradient(135deg, #10b981, #0d9488)" } : {}}>
                    {plan.cta}
                  </button>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <p className="text-center text-slate-400 text-xs mt-6">
              * Giá tham khảo. Chi phí thực tế có thể thay đổi tùy tình trạng. Vui lòng liên hệ để được báo giá chính xác.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── AI CHAT CTA ──────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src={CTA_IMG} alt="Dental AI" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-emerald-900/90 to-slate-900/95" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)" }}>
              <span className="text-emerald-300 text-sm font-medium">🤖 Trí tuệ nhân tạo</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Trợ lý Nha khoa AI 24/7
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
              Bạn có thắc mắc về răng miệng? Trò chuyện ngay với AI của VinaMec để được
              tư vấn nhanh chóng, chính xác — hoàn toàn miễn phí, mọi lúc mọi nơi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-white font-bold text-base shadow-2xl transition-all hover:shadow-emerald-500/30 hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #10b981, #0d9488)" }}>
                <IconChat className="w-5 h-5" />
                Chat với AI ngay
              </button>
              <button onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all hover:scale-105 active:scale-95"
                style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.3)", color: "white" }}>
                Đăng nhập Portal
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-emerald-600 text-sm font-bold uppercase tracking-widest">Câu hỏi thường gặp</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4">
                Giải đáp thắc mắc
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <FadeIn key={idx} delay={idx * 60}>
                <div className={`rounded-2xl border transition-all overflow-hidden ${openFaq === idx ? "border-emerald-300 bg-emerald-50/50 shadow-sm" : "border-slate-200 bg-white hover:border-emerald-200"}`}>
                  <button className="w-full px-6 py-4 flex items-center justify-between text-left"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                    <span className={`font-semibold text-sm pr-4 leading-relaxed ${openFaq === idx ? "text-emerald-700" : "text-slate-800"}`}>
                      {item.q}
                    </span>
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${openFaq === idx ? "bg-emerald-500 text-white rotate-180" : "bg-slate-100 text-slate-400"}`}>
                      <IconChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                  <div className={`px-6 overflow-hidden transition-all duration-300 ${openFaq === idx ? "max-h-96 pb-5" : "max-h-0"}`}>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / CONTACT ────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: "linear-gradient(135deg, #0f172a, #064e3b)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Nụ cười của bạn xứng đáng được chăm sóc tốt nhất
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Đặt lịch khám ngay hôm nay và trải nghiệm dịch vụ nha khoa hiện đại tại VinaMec.
              Đội ngũ bác sĩ và nhân viên luôn sẵn sàng chào đón bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-full text-white font-bold text-base shadow-2xl transition-all hover:shadow-emerald-500/30 hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #10b981, #0d9488)" }}>
                <IconCalendar className="w-5 h-5" />
                Đặt lịch khám
              </button>
              <a href="tel:0912345678"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all hover:scale-105 active:scale-95"
                style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.2)", color: "white" }}>
                <IconPhone className="w-5 h-5" />
                0912 345 678
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-slate-500 text-sm">
              <span className="flex items-center gap-2"><IconLocation className="w-4 h-4" /> 123 Nguyễn Huệ, Q.1, TP.HCM</span>
              <span className="flex items-center gap-2"><IconClock className="w-4 h-4" /> Thứ 2 - Thứ 7: 8:00 - 18:00</span>
              <span className="flex items-center gap-2"><IconMail className="w-4 h-4" /> contact@vinamec.vn</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer style={{ background: "#020617" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <span className="text-white text-lg font-bold">VM</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-tight">Vina<span className="text-emerald-400">Mec</span></p>
                  <p className="text-[10px] text-slate-500 leading-tight">Dental Clinic</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                Hệ thống nha khoa VinaMec — Nơi công nghệ hiện đại gặp gỡ sự chăm sóc tận tâm,
                mang đến nụ cười hoàn hảo cho mọi khách hàng.
              </p>
              <div className="flex gap-3">
                {["#", "#", "#"].map((_, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition text-sm font-bold">
                    {i === 0 ? "f" : i === 1 ? "Z" : "▶"}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Liên kết nhanh</h4>
              <ul className="space-y-2.5">
                {["Trang chủ", "Dịch vụ", "Bác sĩ", "Bảng giá", "Hỏi đáp", "Liên hệ"].map(item => (
                  <li key={item}>
                    <button onClick={() => scrollTo(item.toLowerCase().replace(" ", "-"))}
                      className="text-slate-400 text-sm hover:text-emerald-400 transition">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Dịch vụ</h4>
              <ul className="space-y-2.5">
                {["Khám răng định kỳ", "Trám răng thẩm mỹ", "Niềng răng", "Cấy ghép Implant",
                  "Tẩy trắng răng", "Nha khoa trẻ em"].map(item => (
                  <li key={item}>
                    <button onClick={() => navigate("/login")}
                      className="text-slate-400 text-sm hover:text-emerald-400 transition">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Liên hệ</h4>
              <ul className="space-y-3">
                {[
                  { icon: <IconLocation className="w-4 h-4" />, text: "123 Nguyễn Huệ, Q.1, TP.HCM" },
                  { icon: <IconPhone className="w-4 h-4" />, text: "0912 345 678" },
                  { icon: <IconMail className="w-4 h-4" />, text: "contact@vinamec.vn" },
                  { icon: <IconClock className="w-4 h-4" />, text: "Thứ 2 - Thứ 7: 8:00 - 18:00" },
                ].map(item => (
                  <li key={item.text} className="flex items-start gap-2.5 text-slate-400 text-sm">
                    <span className="text-emerald-500 mt-0.5">{item.icon}</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-xs">© 2024 VinaMec Dental Clinic. Mọi quyền được bảo lưu.</p>
            <div className="flex gap-5">
              <button className="text-slate-600 text-xs hover:text-emerald-400 transition">Chính sách bảo mật</button>
              <button className="text-slate-600 text-xs hover:text-emerald-400 transition">Điều khoản sử dụng</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
