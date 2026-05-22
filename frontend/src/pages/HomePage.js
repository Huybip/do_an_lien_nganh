import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { serviceApi } from "../services/api";
// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconTooth = ({ className = "" }) => (_jsx("svg", { className: className, viewBox: "0 0 24 24", fill: "currentColor", children: _jsx("path", { d: "M12 2C9.5 2 7.5 3.5 7 6C6 6 5 7 5 8.5C5 10 6 11 7 12C7 12.5 6.5 13 6 13.5C5.5 14 5 14.5 5 15C5 16.5 6 18 7 19C8 20 9 21 10.5 21.5C10.5 21.5 11 22 11 22C11 22 11.5 21.5 11.5 21.5C13 21 14 20 15 19C16 18 17 16.5 17 15C17 14.5 16.5 14 16 13.5C15.5 13 15 12.5 15 12C16 11 17 10 17 8.5C17 7 16 6 15 6C14.5 3.5 12.5 2 12 2Z" }) }));
const IconCalendar = ({ className = "" }) => (_jsxs("svg", { className: className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 1.8, children: [_jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2", ry: "2" }), _jsx("line", { x1: "16", y1: "2", x2: "16", y2: "6" }), _jsx("line", { x1: "8", y1: "2", x2: "8", y2: "6" }), _jsx("line", { x1: "3", y1: "10", x2: "21", y2: "10" }), _jsx("path", { d: "M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01", strokeLinecap: "round" })] }));
const IconPhone = ({ className = "" }) => (_jsx("svg", { className: className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 1.8, children: _jsx("path", { d: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .84h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" }) }));
const IconCheck = ({ className = "" }) => (_jsx("svg", { className: className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2.5, children: _jsx("polyline", { points: "20 6 9 17 4 12" }) }));
const IconArrow = ({ className = "" }) => (_jsx("svg", { className: className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, children: _jsx("path", { d: "M5 12h14M12 5l7 7-7 7", strokeLinecap: "round", strokeLinejoin: "round" }) }));
const IconStar = ({ className = "" }) => (_jsx("svg", { className: className, fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }) }));
const IconChat = ({ className = "" }) => (_jsx("svg", { className: className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 1.8, children: _jsx("path", { d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" }) }));
const IconShield = ({ className = "" }) => (_jsx("svg", { className: className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 1.8, children: _jsx("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }) }));
const IconClock = ({ className = "" }) => (_jsxs("svg", { className: className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 1.8, children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("polyline", { points: "12 6 12 12 16 14" })] }));
const IconAward = ({ className = "" }) => (_jsxs("svg", { className: className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 1.8, children: [_jsx("circle", { cx: "12", cy: "8", r: "6" }), _jsx("path", { d: "M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" })] }));
const IconUsers = ({ className = "" }) => (_jsx("svg", { className: className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 1.8, children: _jsx("path", { d: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 110 8 4 4 0 010-8z" }) }));
const IconLocation = ({ className = "" }) => (_jsxs("svg", { className: className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 1.8, children: [_jsx("path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" }), _jsx("circle", { cx: "12", cy: "10", r: "3" })] }));
const IconMail = ({ className = "" }) => (_jsxs("svg", { className: className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 1.8, children: [_jsx("path", { d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" }), _jsx("polyline", { points: "22,6 12,13 2,6" })] }));
const IconChevronDown = ({ className = "" }) => (_jsx("svg", { className: className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, children: _jsx("polyline", { points: "6 9 12 15 18 9" }) }));
const IconMenu = ({ className = "", style }) => (_jsxs("svg", { className: className, style: style, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, children: [_jsx("line", { x1: "3", y1: "12", x2: "21", y2: "12" }), _jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }), _jsx("line", { x1: "3", y1: "18", x2: "21", y2: "18" })] }));
const IconClose = ({ className = "", style }) => (_jsxs("svg", { className: className, style: style, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, children: [_jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), _jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })] }));
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
        icon: _jsx(IconTooth, { className: "w-7 h-7" }),
        color: "bg-blue-500",
        image: CLINIC_IMG,
        items: ["Khám tổng quát", "Chụp X-quang Panorama", "Tư vấn điều trị", "Lập kế hoạch răng miệng"],
        price: "Miễn phí",
    },
    {
        title: "Trám & Phục hình",
        icon: _jsx(IconAward, { className: "w-7 h-7" }),
        color: "bg-teal-500",
        image: DENTAL_CHAIR,
        items: ["Trám răng composite", "Trám amalgam", "Inlay/Onlay sứ", "Gắn đá sapphire"],
        price: "Từ 300.000đ",
    },
    {
        title: "Cấy ghép Implant",
        icon: _jsx(IconShield, { className: "w-7 h-7" }),
        color: "bg-amber-500",
        image: IMPLANT_IMG,
        items: ["Implant Straumann (Thụy Sĩ)", "Implant Osstem (Hàn Quốc)", "Implant Dentium (Hàn Quốc)", "Nâng xương ghép десна"],
        price: "Từ 15.000.000đ",
    },
    {
        title: "Niềng răng",
        icon: _jsx(IconAward, { className: "w-7 h-7" }),
        color: "bg-purple-500",
        image: BRACES_IMG,
        items: ["Niềng mắc cài kim loại", "Niềng mắc cài sứ", "Niềng trong suốt Invisalign", "Niềng rãnh (Damon)"],
        price: "Từ 25.000.000đ",
    },
    {
        title: "Tẩy trắng & Thẩm mỹ",
        icon: _jsx(IconStar, { className: "w-7 h-7" }),
        color: "bg-pink-500",
        image: WHITENING_IMG,
        items: ["Tẩy trắng tại phòng khám", "Máng tẩy tại nhà", "Veneer sứ cao cấp", "Đánh bóng răng"],
        price: "Từ 2.000.000đ",
    },
    {
        title: "Nha khoa trẻ em",
        icon: _jsx(IconUsers, { className: "w-7 h-7" }),
        color: "bg-green-500",
        image: KID_DENTAL,
        items: ["Khám và điều trị cho trẻ", "Trám răng sữa", "Bôi fluoride", "Niêm phong rãnh"],
        price: "Từ 150.000đ",
    },
];
const FEATURES = [
    {
        icon: _jsx(IconShield, { className: "w-8 h-8 text-emerald-500" }),
        title: "Vô trùng tuyệt đối",
        desc: "Quy trình vô trùng theo tiêu chuẩn Bộ Y tế, mỗi dụng cụ được khử trùng riêng biệt.",
    },
    {
        icon: _jsx(IconAward, { className: "w-8 h-8 text-blue-500" }),
        title: "Bác sĩ chuyên môn cao",
        desc: "Đội ngũ bác sĩ được đào tạo tại ĐH Y Dược TP.HCM, tu nghiệp tại Nhật Bản, Hàn Quốc.",
    },
    {
        icon: _jsx(IconChat, { className: "w-8 h-8 text-purple-500" }),
        title: "AI chẩn đoán thông minh",
        desc: "Hệ thống AI phân tích X-quang, hỗ trợ bác sĩ phát hiện sớm các bệnh lý răng miệng.",
    },
    {
        icon: _jsx(IconClock, { className: "w-8 h-8 text-amber-500" }),
        title: "Hẹn lịch linh hoạt",
        desc: "Đặt lịch online 24/7, nhắc lịch tự động qua SMS/Zalo, không cần chờ đợi lâu.",
    },
    {
        icon: _jsx(IconUsers, { className: "w-8 h-8 text-teal-500" }),
        title: "10.000+ bệnh nhân tin tưởng",
        desc: "Hơn 10 nghìn bệnh nhân đã điều trị thành công, đạt tỷ lệ hài lòng 98%.",
    },
    {
        icon: _jsx(IconPhone, { className: "w-8 h-8 text-red-500" }),
        title: "Hỗ trợ 24/7",
        desc: "Tổng đài và Zalo hỗ trợ tư vấn mọi lúc, kể cả cuối tuần và ngày lễ.",
    },
];
const STATS = [
    { value: "10.000+", label: "Bệnh nhân", icon: _jsx(IconUsers, { className: "w-5 h-5" }) },
    { value: "15+", label: "Năm kinh nghiệm", icon: _jsx(IconAward, { className: "w-5 h-5" }) },
    { value: "50+", label: "Bác sĩ & Kỹ thuật viên", icon: _jsx(IconShield, { className: "w-5 h-5" }) },
    { value: "98%", label: "Tỷ lệ hài lòng", icon: _jsx(IconStar, { className: "w-5 h-5" }) },
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
        content: "Tôi niềng răng tại VinaMec được 18 tháng, kết quả vượt mong đợi. Bác sĩ Lan tư vấn rất tận tình, nhân viên thân thiện. App đặt lịch tiện lợi, luôn nhắc nhở trước lịch hẹn. Đặc biệt không phải chờ đợi lâu như những phòng khám khác.",
        rating: 5,
        avatar: TESTIMONIAL_AVATARS[0],
    },
    {
        name: "Anh Hoàng Sơn",
        role: "Kỹ sư phần mềm, 32 tuổi",
        content: "Răng khôn ngầm của tôi được nhổ hoàn toàn không đau, chỉ hơi êm buốt 1-2 ngày. Trước đây rất sợ nha khoa nhưng giờ hoàn toàn yên tâm. Cơ sở vật chất hiện đại, sạch sẽ, bác sĩ giải thích rõ ràng về tình trạng răng trước khi điều trị.",
        rating: 5,
        avatar: TESTIMONIAL_AVATARS[1],
    },
    {
        name: "Cô Hương Giang",
        role: "Giáo viên tiểu học, 42 tuổi",
        content: "Con gái tôi từ sợ đi khám răng giờ lại mong đến ngày khám. Bác sĩ Hà rất giỏi, biết cách trò chuyện với trẻ, con bé về nhà còn kể lại. Răng sữa của con được chăm sóc tốt, không cần nhổ sớm. Cả nhà đều khám và chăm sóc răng tại VinaMec.",
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
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
        } }, { threshold: 0.1 });
        if (ref.current)
            obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    return { ref, visible };
}
function FadeIn({ children, delay = 0, className = "" }) {
    const { ref, visible } = useScrollAnimation();
    return (_jsx("div", { ref: ref, className: className, style: {
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(32px)",
            transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        }, children: children }));
}
// ─── Main Component ────────────────────────────────────────────────────────────
export default function HomePage() {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        serviceApi.getAll().then(() => { }).catch(() => { });
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    const scrollTo = (id) => {
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
    return (_jsxs("div", { className: "min-h-screen bg-white overflow-x-hidden font-sans", children: [_jsxs("header", { className: `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/98 backdrop-blur-md shadow-md border-b border-slate-100" : "bg-transparent"}`, children: [_jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex items-center justify-between h-20", children: [_jsxs("div", { className: "flex items-center gap-3 cursor-pointer", onClick: () => scrollTo("home"), children: [_jsx("div", { className: "w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25", children: _jsx("span", { className: "text-white text-xl font-bold", children: "VM" }) }), _jsxs("div", { children: [_jsxs("span", { className: "text-xl font-bold leading-tight", style: { color: scrolled ? "#0f172a" : "white" }, children: ["Vina", _jsx("span", { className: "text-emerald-500", children: "Mec" })] }), _jsx("p", { className: "text-[10px] text-slate-400 leading-tight", children: "Dental Clinic" })] })] }), _jsx("nav", { className: "hidden lg:flex items-center gap-8", children: NAV_LINKS.map(l => (_jsx("button", { onClick: () => scrollTo(l.id), className: "text-sm font-medium transition-colors", style: { color: scrolled ? "#64748b" : "rgba(255,255,255,0.8)" }, onMouseEnter: e => (e.currentTarget.style.color = "#10b981"), onMouseLeave: e => (e.currentTarget.style.color = scrolled ? "#64748b" : "rgba(255,255,255,0.8)"), children: l.label }, l.id))) }), _jsxs("div", { className: "hidden lg:flex items-center gap-3", children: [_jsx("button", { onClick: () => navigate("/login"), className: "text-sm font-medium px-4 py-2 rounded-full border transition-all", style: { color: scrolled ? "#64748b" : "white", borderColor: scrolled ? "#e2e8f0" : "rgba(255,255,255,0.4)", background: "transparent" }, children: "\u0110\u0103ng nh\u1EADp" }), _jsxs("button", { onClick: () => navigate("/login"), className: "flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95", style: { background: "linear-gradient(135deg, #10b981, #0d9488)" }, children: [_jsx(IconCalendar, { className: "w-4 h-4" }), "\u0110\u1EB7t l\u1ECBch kh\u00E1m"] })] }), _jsx("button", { className: "lg:hidden p-2", onClick: () => setMobileMenuOpen(!mobileMenuOpen), children: mobileMenuOpen
                                        ? _jsx(IconClose, { className: "w-6 h-6", style: { color: scrolled ? "#1e293b" : "white" } })
                                        : _jsx(IconMenu, { className: "w-6 h-6", style: { color: scrolled ? "#1e293b" : "white" } }) })] }) }), mobileMenuOpen && (_jsx("div", { className: "lg:hidden bg-white border-t border-slate-100 shadow-lg", children: _jsxs("div", { className: "px-4 py-4 space-y-1", children: [NAV_LINKS.map(l => (_jsx("button", { onClick: () => scrollTo(l.id), className: "block w-full text-left px-4 py-3 rounded-xl text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-600 transition", children: l.label }, l.id))), _jsxs("div", { className: "pt-3 border-t border-slate-100 space-y-2", children: [_jsx("button", { onClick: () => navigate("/login"), className: "w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition", children: "\u0110\u0103ng nh\u1EADp" }), _jsx("button", { onClick: () => navigate("/login"), className: "w-full px-4 py-3 rounded-xl text-white font-semibold text-center shadow-md", style: { background: "linear-gradient(135deg, #10b981, #0d9488)" }, children: "\u0110\u1EB7t l\u1ECBch kh\u00E1m" })] })] }) }))] }), _jsxs("section", { id: "home", className: "relative min-h-screen flex items-center", children: [_jsxs("div", { className: "absolute inset-0", children: [_jsx("img", { src: HERO_IMG, alt: "Nha khoa VinaMec", className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0", style: { background: "linear-gradient(135deg, rgba(6,78,59,0.92) 0%, rgba(6,78,59,0.7) 50%, rgba(6,78,59,0.85) 100%)" } })] }), _jsx("div", { className: "relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32", children: _jsxs("div", { className: "max-w-3xl", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8", style: { background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)" }, children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }), _jsx("span", { className: "text-emerald-300 text-sm font-medium", children: "H\u1EC7 th\u1ED1ng nha khoa h\u00E0ng \u0111\u1EA7u Vi\u1EC7t Nam" })] }), _jsxs("h1", { className: "font-bold text-white leading-tight mb-6", style: { fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }, children: ["N\u1EE5 c\u01B0\u1EDDi c\u1EE7a b\u1EA1n,", _jsx("br", {}), _jsx("span", { style: { color: "#6ee7b7" }, children: "S\u1EE9 m\u1EC7nh c\u1EE7a ch\u00FAng t\u00F4i" })] }), _jsx("p", { className: "text-slate-300 text-lg leading-relaxed mb-10 max-w-xl", children: "VinaMec Dental Clinic \u2014 N\u01A1i c\u00F4ng ngh\u1EC7 ti\u00EAn ti\u1EBFn g\u1EB7p g\u1EE1 \u0111\u1ED9i ng\u0169 b\u00E1c s\u0129 gi\u00E0u kinh nghi\u1EC7m, mang \u0111\u1EBFn tr\u1EA3i nghi\u1EC7m nha khoa an to\u00E0n, tho\u1EA3i m\u00E1i v\u00E0 k\u1EBFt qu\u1EA3 v\u01B0\u1EE3t mong \u0111\u1EE3i." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 mb-14", children: [_jsxs("button", { onClick: () => navigate("/login"), className: "flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-white font-semibold text-base shadow-2xl transition-all hover:shadow-emerald-500/40 hover:scale-105 active:scale-95", style: { background: "linear-gradient(135deg, #10b981, #0d9488)" }, children: [_jsx(IconCalendar, { className: "w-5 h-5" }), "\u0110\u1EB7t l\u1ECBch kh\u00E1m ngay"] }), _jsxs("button", { onClick: () => scrollTo("services"), className: "flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all hover:scale-105 active:scale-95", style: { background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.3)", color: "white" }, children: ["Kh\u00E1m ph\u00E1 d\u1ECBch v\u1EE5", _jsx(IconArrow, { className: "w-4 h-4" })] })] }), _jsx("div", { className: "flex flex-wrap gap-6", children: [
                                        { icon: _jsx(IconShield, { className: "w-4 h-4" }), text: "Vô trùng tuyệt đối" },
                                        { icon: _jsx(IconAward, { className: "w-4 h-4" }), text: "Bác sĩ chuyên môn" },
                                        { icon: _jsx(IconStar, { className: "w-4 h-4" }), text: "10.000+ đánh giá 5★" },
                                    ].map(item => (_jsxs("div", { className: "flex items-center gap-2 text-slate-300 text-sm", children: [_jsx("span", { style: { color: "#10b981" }, children: item.icon }), item.text] }, item.text))) })] }) }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm border-t border-white/10", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5", children: _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-6", children: STATS.map(s => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm", style: { background: "rgba(16,185,129,0.25)" }, children: s.icon }), _jsxs("div", { children: [_jsx("p", { className: "text-white font-bold text-lg leading-tight", children: s.value }), _jsx("p", { className: "text-slate-400 text-xs", children: s.label })] })] }, s.label))) }) }) })] }), _jsx("section", { id: "services", className: "py-24 bg-slate-50", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx(FadeIn, { children: _jsxs("div", { className: "text-center mb-16", children: [_jsx("span", { className: "text-emerald-600 text-sm font-bold uppercase tracking-widest", children: "D\u1ECBch v\u1EE5 c\u1EE7a ch\u00FAng t\u00F4i" }), _jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4", children: "Gi\u1EA3i ph\u00E1p nha khoa to\u00E0n di\u1EC7n" }), _jsx("p", { className: "text-slate-500 max-w-2xl mx-auto leading-relaxed", children: "T\u1EEB kh\u00E1m r\u0103ng \u0111\u1ECBnh k\u1EF3 \u0111\u1EBFn c\u00E1c ph\u1EABu thu\u1EADt ph\u1EE9c t\u1EA1p, VinaMec cung c\u1EA5p \u0111\u1EA7y \u0111\u1EE7 c\u00E1c d\u1ECBch v\u1EE5 nha khoa v\u1EDBi ch\u1EA5t l\u01B0\u1EE3ng cao nh\u1EA5t v\u00E0 chi ph\u00ED h\u1EE3p l\u00FD nh\u1EA5t." })] }) }), _jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: SERVICE_CATEGORIES.map((svc, idx) => (_jsx(FadeIn, { delay: idx * 80, children: _jsxs("div", { className: "group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer", onClick: () => navigate("/login"), children: [_jsxs("div", { className: "relative h-48 overflow-hidden", children: [_jsx("img", { src: svc.image, alt: svc.title, className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" }), _jsx("div", { className: `absolute top-3 left-3 w-10 h-10 rounded-xl ${svc.color} flex items-center justify-center text-white shadow-lg`, children: svc.icon }), _jsx("div", { className: "absolute bottom-3 left-3", children: _jsx("h3", { className: "text-white font-bold text-lg", children: svc.title }) })] }), _jsxs("div", { className: "p-5", children: [_jsx("ul", { className: "space-y-2 mb-4", children: svc.items.map(item => (_jsxs("li", { className: "flex items-center gap-2 text-slate-600 text-sm", children: [_jsx("span", { className: "text-emerald-500", children: _jsx(IconCheck, { className: "w-4 h-4" }) }), item] }, item))) }), _jsxs("div", { className: "flex items-center justify-between pt-3 border-t border-slate-100", children: [_jsx("span", { className: "text-emerald-600 font-bold text-sm", children: svc.price }), _jsxs("button", { className: "text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition", children: ["\u0110\u1EB7t l\u1ECBch ", _jsx(IconArrow, { className: "w-3.5 h-3.5" })] })] })] })] }) }, svc.title))) }), _jsx(FadeIn, { children: _jsx("div", { className: "text-center mt-12", children: _jsxs("button", { onClick: () => navigate("/login"), className: "inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95", style: { background: "linear-gradient(135deg, #10b981, #0d9488)" }, children: ["Xem t\u1EA5t c\u1EA3 d\u1ECBch v\u1EE5", _jsx(IconArrow, { className: "w-4 h-4" })] }) }) })] }) }), _jsx("section", { id: "about", className: "py-24 bg-white", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "grid lg:grid-cols-2 gap-16 items-center", children: [_jsx(FadeIn, { children: _jsxs("div", { className: "relative", children: [_jsx("img", { src: CLINIC_IMG, alt: "Ph\u00F2ng kh\u00E1m VinaMec", className: "rounded-2xl shadow-2xl w-full" }), _jsx("div", { className: "absolute -bottom-8 -right-8 w-56 h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-white hidden lg:block", children: _jsx("img", { src: TEAM_IMG, alt: "\u0110\u1ED9i ng\u0169 VinaMec", className: "w-full h-full object-cover" }) }), _jsx("div", { className: "absolute -top-4 -right-4 bg-emerald-500 text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-xl hidden lg:block", children: "15+ n\u0103m kinh nghi\u1EC7m" })] }) }), _jsx(FadeIn, { delay: 150, children: _jsxs("div", { children: [_jsx("span", { className: "text-emerald-600 text-sm font-bold uppercase tracking-widest", children: "T\u1EA1i sao ch\u1ECDn VinaMec" }), _jsxs("h2", { className: "text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-6 leading-tight", children: ["Nha khoa th\u00F4ng minh \u2014", _jsx("br", {}), _jsx("span", { className: "text-emerald-600", children: "Con ng\u01B0\u1EDDi t\u1EADn t\u00E2m" })] }), _jsx("p", { className: "text-slate-500 leading-relaxed mb-8", children: "Ch\u00FAng t\u00F4i k\u1EBFt h\u1EE3p c\u00F4ng ngh\u1EC7 AI ti\u00EAn ti\u1EBFn nh\u1EA5t v\u1EDBi s\u1EF1 ch\u0103m s\u00F3c c\u00E1 nh\u00E2n h\u00F3a t\u1EEB \u0111\u1ED9i ng\u0169 b\u00E1c s\u0129 gi\u00E0u kinh nghi\u1EC7m. M\u1ED7i b\u1EC7nh nh\u00E2n \u0111\u1EC1u nh\u1EADn \u0111\u01B0\u1EE3c k\u1EBF ho\u1EA1ch \u0111i\u1EC1u tr\u1ECB ri\u00EAng bi\u1EC7t, ph\u00F9 h\u1EE3p v\u1EDBi t\u00ECnh tr\u1EA1ng r\u0103ng mi\u1EC7ng v\u00E0 mong mu\u1ED1n c\u1EE7a m\u00ECnh." }), _jsx("div", { className: "grid sm:grid-cols-2 gap-4 mb-8", children: FEATURES.map(f => (_jsxs("div", { className: "flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition", children: [f.icon, _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-slate-800 text-sm", children: f.title }), _jsx("p", { className: "text-slate-400 text-xs leading-relaxed mt-0.5", children: f.desc })] })] }, f.title))) }), _jsxs("button", { onClick: () => navigate("/login"), className: "inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-sm shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95", style: { background: "linear-gradient(135deg, #10b981, #0d9488)" }, children: ["T\u00ECm hi\u1EC3u th\u00EAm", _jsx(IconArrow, { className: "w-4 h-4" })] })] }) })] }) }) }), _jsx("div", { className: "py-14", style: { background: "linear-gradient(135deg, #10b981, #0d9488)" }, children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-8", children: STATS.map(s => (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 mb-3 text-white", children: s.icon }), _jsx("p", { className: "text-white font-bold text-3xl mb-1", children: s.value }), _jsx("p", { className: "text-emerald-100 text-sm font-medium", children: s.label })] }, s.label))) }) }) }), _jsx("section", { id: "doctors", className: "py-24 bg-slate-50", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx(FadeIn, { children: _jsxs("div", { className: "text-center mb-16", children: [_jsx("span", { className: "text-emerald-600 text-sm font-bold uppercase tracking-widest", children: "\u0110\u1ED9i ng\u0169 chuy\u00EAn gia" }), _jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4", children: "B\u00E1c s\u0129 gi\u00E0u kinh nghi\u1EC7m, t\u1EADn t\u00E2m" }), _jsx("p", { className: "text-slate-500 max-w-2xl mx-auto leading-relaxed", children: "\u0110\u1ED9i ng\u0169 b\u00E1c s\u0129 \u0111\u01B0\u1EE3c \u0111\u00E0o t\u1EA1o chuy\u00EAn s\u00E2u t\u1EA1i c\u00E1c tr\u01B0\u1EDDng \u0111\u1EA1i h\u1ECDc y khoa h\u00E0ng \u0111\u1EA7u, th\u01B0\u1EDDng xuy\u00EAn c\u1EADp nh\u1EADt ki\u1EBFn th\u1EE9c v\u00E0 k\u1EF9 thu\u1EADt m\u1EDBi nh\u1EA5t trong v\u00E0 ngo\u00E0i n\u01B0\u1EDBc." })] }) }), _jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-6", children: DOCTORS.map((doc, idx) => (_jsx(FadeIn, { delay: idx * 100, children: _jsxs("div", { className: "bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group", children: [_jsxs("div", { className: "relative h-56 overflow-hidden", children: [_jsx("img", { src: doc.photo, alt: doc.name, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" }), _jsxs("div", { className: "absolute bottom-3 left-3 right-3", children: [_jsx("h4", { className: "text-white font-bold text-base", children: doc.name }), _jsx("p", { className: "text-emerald-300 text-xs font-medium", children: doc.specialty })] })] }), _jsxs("div", { className: "p-4", children: [_jsx("p", { className: "text-slate-500 text-xs mb-3", children: doc.degree }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full", children: [_jsx(IconClock, { className: "w-3.5 h-3.5" }), " ", doc.exp, " kinh nghi\u1EC7m"] }), _jsx("button", { onClick: () => navigate("/login"), className: "text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition", children: "\u0110\u1EB7t l\u1ECBch \u2192" })] })] })] }) }, doc.name))) })] }) }), _jsx("section", { className: "py-24 bg-white", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx(FadeIn, { children: _jsxs("div", { className: "text-center mb-16", children: [_jsx("span", { className: "text-emerald-600 text-sm font-bold uppercase tracking-widest", children: "C\u1EA3m nh\u1EADn kh\u00E1ch h\u00E0ng" }), _jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4", children: "H\u1ECD n\u00F3i g\u00EC v\u1EC1 VinaMec" })] }) }), _jsx("div", { className: "grid md:grid-cols-3 gap-6", children: TESTIMONIALS.map((t, idx) => (_jsx(FadeIn, { delay: idx * 120, children: _jsxs("div", { className: "bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all", children: [_jsx("div", { className: "flex gap-1 mb-4", children: Array.from({ length: t.rating }).map((_, i) => (_jsx(IconStar, { className: "w-4 h-4 text-amber-400" }, i))) }), _jsxs("p", { className: "text-slate-600 text-sm leading-relaxed mb-6 italic", children: ["\"", t.content, "\""] }), _jsxs("div", { className: "flex items-center gap-3 pt-4 border-t border-slate-100", children: [_jsx("img", { src: t.avatar, alt: t.name, className: "w-11 h-11 rounded-full object-cover shadow-sm" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-800 text-sm", children: t.name }), _jsx("p", { className: "text-slate-400 text-xs", children: t.role })] })] })] }) }, t.name))) })] }) }), _jsx("section", { id: "pricing", className: "py-24 bg-slate-50", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx(FadeIn, { children: _jsxs("div", { className: "text-center mb-16", children: [_jsx("span", { className: "text-emerald-600 text-sm font-bold uppercase tracking-widest", children: "B\u1EA3ng gi\u00E1 d\u1ECBch v\u1EE5" }), _jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4", children: "Chi ph\u00ED minh b\u1EA1ch, r\u00F5 r\u00E0ng" }), _jsx("p", { className: "text-slate-500 max-w-2xl mx-auto leading-relaxed", children: "Kh\u00F4ng ph\u00ED \u1EA9n, kh\u00F4ng chi ph\u00ED ph\u00E1t sinh ngo\u00E0i d\u1EF1 ki\u1EBFn. Ch\u00FAng t\u00F4i cam k\u1EBFt b\u00E1o gi\u00E1 ch\u00EDnh x\u00E1c tr\u01B0\u1EDBc khi \u0111i\u1EC1u tr\u1ECB." })] }) }), _jsx("div", { className: "grid md:grid-cols-3 gap-6 max-w-5xl mx-auto", children: PRICING_PLANS.map((plan, idx) => (_jsx(FadeIn, { delay: idx * 100, children: _jsxs("div", { className: `relative rounded-2xl p-6 ${plan.popular ? "bg-white shadow-2xl border-2" : "bg-white border"} ${plan.accent} transition-all`, children: [plan.badge && (_jsx("div", { className: "absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg", style: { background: "linear-gradient(135deg, #f59e0b, #d97706)" }, children: plan.badge })), _jsxs("div", { className: "mb-5", children: [_jsx("h3", { className: "font-bold text-slate-900 text-lg mb-1", children: plan.name }), _jsx("p", { className: "text-slate-500 text-xs leading-relaxed", children: plan.desc })] }), _jsxs("div", { className: "mb-5 pb-5 border-b border-slate-100", children: [_jsx("span", { className: "text-3xl font-bold text-slate-900", children: plan.price }), _jsx("span", { className: "text-slate-400 text-sm ml-1", children: plan.sub })] }), _jsx("ul", { className: "space-y-3 mb-6", children: plan.features.map(f => (_jsxs("li", { className: "flex items-start gap-2.5 text-sm text-slate-600", children: [_jsx("span", { className: "text-emerald-500 mt-0.5", children: _jsx(IconCheck, { className: "w-4 h-4" }) }), f] }, f))) }), _jsx("button", { onClick: () => navigate("/login"), className: `w-full py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md active:scale-95 ${plan.ctaStyle === "solid"
                                                ? "text-white shadow-md hover:shadow-lg"
                                                : "border-2 text-emerald-600 hover:bg-emerald-50"}`, style: plan.ctaStyle === "solid" ? { background: "linear-gradient(135deg, #10b981, #0d9488)" } : {}, children: plan.cta })] }) }, plan.name))) }), _jsx(FadeIn, { children: _jsx("p", { className: "text-center text-slate-400 text-xs mt-6", children: "* Gi\u00E1 tham kh\u1EA3o. Chi ph\u00ED th\u1EF1c t\u1EBF c\u00F3 th\u1EC3 thay \u0111\u1ED5i t\u00F9y t\u00ECnh tr\u1EA1ng. Vui l\u00F2ng li\u00EAn h\u1EC7 \u0111\u1EC3 \u0111\u01B0\u1EE3c b\u00E1o gi\u00E1 ch\u00EDnh x\u00E1c." }) })] }) }), _jsxs("section", { className: "relative py-24 overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0", children: [_jsx("img", { src: CTA_IMG, alt: "Dental AI", className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-slate-900/95 via-emerald-900/90 to-slate-900/95" })] }), _jsx("div", { className: "relative z-10 max-w-4xl mx-auto px-4 text-center", children: _jsxs(FadeIn, { children: [_jsx("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6", style: { background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)" }, children: _jsx("span", { className: "text-emerald-300 text-sm font-medium", children: "\uD83E\uDD16 Tr\u00ED tu\u1EC7 nh\u00E2n t\u1EA1o" }) }), _jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-white mb-4", children: "Tr\u1EE3 l\u00FD Nha khoa AI 24/7" }), _jsx("p", { className: "text-slate-300 text-lg leading-relaxed mb-10 max-w-2xl mx-auto", children: "B\u1EA1n c\u00F3 th\u1EAFc m\u1EAFc v\u1EC1 r\u0103ng mi\u1EC7ng? Tr\u00F2 chuy\u1EC7n ngay v\u1EDBi AI c\u1EE7a VinaMec \u0111\u1EC3 \u0111\u01B0\u1EE3c t\u01B0 v\u1EA5n nhanh ch\u00F3ng, ch\u00EDnh x\u00E1c \u2014 ho\u00E0n to\u00E0n mi\u1EC5n ph\u00ED, m\u1ECDi l\u00FAc m\u1ECDi n\u01A1i." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsxs("button", { onClick: () => navigate("/login"), className: "inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-white font-bold text-base shadow-2xl transition-all hover:shadow-emerald-500/30 hover:scale-105 active:scale-95", style: { background: "linear-gradient(135deg, #10b981, #0d9488)" }, children: [_jsx(IconChat, { className: "w-5 h-5" }), "Chat v\u1EDBi AI ngay"] }), _jsx("button", { onClick: () => navigate("/login"), className: "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all hover:scale-105 active:scale-95", style: { background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.3)", color: "white" }, children: "\u0110\u0103ng nh\u1EADp Portal" })] })] }) })] }), _jsx("section", { id: "faq", className: "py-24 bg-white", children: _jsxs("div", { className: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx(FadeIn, { children: _jsxs("div", { className: "text-center mb-16", children: [_jsx("span", { className: "text-emerald-600 text-sm font-bold uppercase tracking-widest", children: "C\u00E2u h\u1ECFi th\u01B0\u1EDDng g\u1EB7p" }), _jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4", children: "Gi\u1EA3i \u0111\u00E1p th\u1EAFc m\u1EAFc" })] }) }), _jsx("div", { className: "space-y-3", children: FAQ_ITEMS.map((item, idx) => (_jsx(FadeIn, { delay: idx * 60, children: _jsxs("div", { className: `rounded-2xl border transition-all overflow-hidden ${openFaq === idx ? "border-emerald-300 bg-emerald-50/50 shadow-sm" : "border-slate-200 bg-white hover:border-emerald-200"}`, children: [_jsxs("button", { className: "w-full px-6 py-4 flex items-center justify-between text-left", onClick: () => setOpenFaq(openFaq === idx ? null : idx), children: [_jsx("span", { className: `font-semibold text-sm pr-4 leading-relaxed ${openFaq === idx ? "text-emerald-700" : "text-slate-800"}`, children: item.q }), _jsx("span", { className: `flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${openFaq === idx ? "bg-emerald-500 text-white rotate-180" : "bg-slate-100 text-slate-400"}`, children: _jsx(IconChevronDown, { className: "w-4 h-4" }) })] }), _jsx("div", { className: `px-6 overflow-hidden transition-all duration-300 ${openFaq === idx ? "max-h-96 pb-5" : "max-h-0"}`, children: _jsx("p", { className: "text-slate-600 text-sm leading-relaxed", children: item.a }) })] }) }, idx))) })] }) }), _jsx("section", { className: "py-24", style: { background: "linear-gradient(135deg, #0f172a, #064e3b)" }, children: _jsx("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: _jsxs(FadeIn, { children: [_jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-white mb-4", children: "N\u1EE5 c\u01B0\u1EDDi c\u1EE7a b\u1EA1n x\u1EE9ng \u0111\u00E1ng \u0111\u01B0\u1EE3c ch\u0103m s\u00F3c t\u1ED1t nh\u1EA5t" }), _jsx("p", { className: "text-slate-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed", children: "\u0110\u1EB7t l\u1ECBch kh\u00E1m ngay h\u00F4m nay v\u00E0 tr\u1EA3i nghi\u1EC7m d\u1ECBch v\u1EE5 nha khoa hi\u1EC7n \u0111\u1EA1i t\u1EA1i VinaMec. \u0110\u1ED9i ng\u0169 b\u00E1c s\u0129 v\u00E0 nh\u00E2n vi\u00EAn lu\u00F4n s\u1EB5n s\u00E0ng ch\u00E0o \u0111\u00F3n b\u1EA1n." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center mb-8", children: [_jsxs("button", { onClick: () => navigate("/login"), className: "inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-full text-white font-bold text-base shadow-2xl transition-all hover:shadow-emerald-500/30 hover:scale-105 active:scale-95", style: { background: "linear-gradient(135deg, #10b981, #0d9488)" }, children: [_jsx(IconCalendar, { className: "w-5 h-5" }), "\u0110\u1EB7t l\u1ECBch kh\u00E1m"] }), _jsxs("a", { href: "tel:0912345678", className: "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-all hover:scale-105 active:scale-95", style: { background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.2)", color: "white" }, children: [_jsx(IconPhone, { className: "w-5 h-5" }), "0912 345 678"] })] }), _jsxs("div", { className: "flex flex-wrap justify-center gap-6 text-slate-500 text-sm", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(IconLocation, { className: "w-4 h-4" }), " 123 Nguy\u1EC5n Hu\u1EC7, Q.1, TP.HCM"] }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(IconClock, { className: "w-4 h-4" }), " Th\u1EE9 2 - Th\u1EE9 7: 8:00 - 18:00"] }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(IconMail, { className: "w-4 h-4" }), " contact@vinamec.vn"] })] })] }) }) }), _jsx("footer", { style: { background: "#020617" }, children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14", children: [_jsxs("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2.5 mb-5", children: [_jsx("div", { className: "w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20", children: _jsx("span", { className: "text-white text-lg font-bold", children: "VM" }) }), _jsxs("div", { children: [_jsxs("p", { className: "text-lg font-bold text-white leading-tight", children: ["Vina", _jsx("span", { className: "text-emerald-400", children: "Mec" })] }), _jsx("p", { className: "text-[10px] text-slate-500 leading-tight", children: "Dental Clinic" })] })] }), _jsx("p", { className: "text-slate-400 text-sm leading-relaxed mb-5", children: "H\u1EC7 th\u1ED1ng nha khoa VinaMec \u2014 N\u01A1i c\u00F4ng ngh\u1EC7 hi\u1EC7n \u0111\u1EA1i g\u1EB7p g\u1EE1 s\u1EF1 ch\u0103m s\u00F3c t\u1EADn t\u00E2m, mang \u0111\u1EBFn n\u1EE5 c\u01B0\u1EDDi ho\u00E0n h\u1EA3o cho m\u1ECDi kh\u00E1ch h\u00E0ng." }), _jsx("div", { className: "flex gap-3", children: ["#", "#", "#"].map((_, i) => (_jsx("a", { href: "#", className: "w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition text-sm font-bold", children: i === 0 ? "f" : i === 1 ? "Z" : "▶" }, i))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-white font-semibold text-sm mb-4", children: "Li\u00EAn k\u1EBFt nhanh" }), _jsx("ul", { className: "space-y-2.5", children: ["Trang chủ", "Dịch vụ", "Bác sĩ", "Bảng giá", "Hỏi đáp", "Liên hệ"].map(item => (_jsx("li", { children: _jsx("button", { onClick: () => scrollTo(item.toLowerCase().replace(" ", "-")), className: "text-slate-400 text-sm hover:text-emerald-400 transition", children: item }) }, item))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-white font-semibold text-sm mb-4", children: "D\u1ECBch v\u1EE5" }), _jsx("ul", { className: "space-y-2.5", children: ["Khám răng định kỳ", "Trám răng thẩm mỹ", "Niềng răng", "Cấy ghép Implant",
                                                "Tẩy trắng răng", "Nha khoa trẻ em"].map(item => (_jsx("li", { children: _jsx("button", { onClick: () => navigate("/login"), className: "text-slate-400 text-sm hover:text-emerald-400 transition", children: item }) }, item))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-white font-semibold text-sm mb-4", children: "Li\u00EAn h\u1EC7" }), _jsx("ul", { className: "space-y-3", children: [
                                                { icon: _jsx(IconLocation, { className: "w-4 h-4" }), text: "123 Nguyễn Huệ, Q.1, TP.HCM" },
                                                { icon: _jsx(IconPhone, { className: "w-4 h-4" }), text: "0912 345 678" },
                                                { icon: _jsx(IconMail, { className: "w-4 h-4" }), text: "contact@vinamec.vn" },
                                                { icon: _jsx(IconClock, { className: "w-4 h-4" }), text: "Thứ 2 - Thứ 7: 8:00 - 18:00" },
                                            ].map(item => (_jsxs("li", { className: "flex items-start gap-2.5 text-slate-400 text-sm", children: [_jsx("span", { className: "text-emerald-500 mt-0.5", children: item.icon }), item.text] }, item.text))) })] })] }), _jsxs("div", { className: "border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4", children: [_jsx("p", { className: "text-slate-600 text-xs", children: "\u00A9 2024 VinaMec Dental Clinic. M\u1ECDi quy\u1EC1n \u0111\u01B0\u1EE3c b\u1EA3o l\u01B0u." }), _jsxs("div", { className: "flex gap-5", children: [_jsx("button", { className: "text-slate-600 text-xs hover:text-emerald-400 transition", children: "Ch\u00EDnh s\u00E1ch b\u1EA3o m\u1EADt" }), _jsx("button", { className: "text-slate-600 text-xs hover:text-emerald-400 transition", children: "\u0110i\u1EC1u kho\u1EA3n s\u1EED d\u1EE5ng" })] })] })] }) })] }));
}
