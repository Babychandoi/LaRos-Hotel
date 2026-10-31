import {
    Award,
    BedDouble,
    CalendarDays,
    Gem,
    HandHeart,
    Leaf,
    Mail,
    Palette,
    PhoneCall,
    Recycle,
    ShieldCheck,
    Smile,
    Sparkles,
    Star,
    Users,
    Wine,
} from "lucide-react";
import { CONTACT } from "../siteConfig";

export const STATS = [
    { number: "5+", label: "Năm kinh nghiệm", icon: CalendarDays },
    { number: "98%", label: "Khách hài lòng", icon: Star },
    { number: "50+", label: "Phòng cao cấp", icon: BedDouble },
    { number: "25+", label: "Giải thưởng", icon: Award },
    { number: "100+", label: "Nhân viên", icon: Users },
    { number: "10K+", label: "Khách phục vụ", icon: Smile },
];

export const FEATURES = [
    {
        icon: Palette,
        title: "Thiết kế tinh tế",
        description: "Phong cách thiết kế Pháp sang trọng kết hợp với nét đẹp hiện đại, tạo không gian nghỉ dưỡng độc đáo.",
        details: ["Kiến trúc Pháp cổ điển", "Nội thất cao cấp", "Không gian mở thoáng đãng", "Ánh sáng tự nhiên tối ưu"],
        stat: "100+ thiết kế độc bản",
    },
    {
        icon: Sparkles,
        title: "Dịch vụ cá nhân hóa",
        description: "Đội ngũ nhân viên chuyên nghiệp luôn sẵn sàng mang đến trải nghiệm được thiết kế riêng.",
        details: ["Butler 24/7", "Tư vấn du lịch", "Dịch vụ đặc biệt theo yêu cầu", "Hỗ trợ đa ngôn ngữ"],
        stat: "50+ dịch vụ đặc biệt",
    },
    {
        icon: Wine,
        title: "Ẩm thực đẳng cấp",
        description: "Nhà hàng với các món ăn từ ẩm thực Pháp và Việt Nam, nguyên liệu tươi ngon nhất.",
        details: ["Đầu bếp Michelin", "Rượu vang cao cấp", "Nguyên liệu hữu cơ", "Menu theo mùa"],
        stat: "200+ món ăn đặc sắc",
    },
    {
        icon: Gem,
        title: "Tiện nghi cao cấp",
        description: "Hệ thống phòng nghỉ được trang bị đầy đủ tiện nghi 5 sao với công nghệ hiện đại nhất.",
        details: ["Hệ thống smart room", "Bể bơi vô cực", "Spa đẳng cấp quốc tế", "Phòng tập đạt chuẩn"],
        stat: "99% khách hài lòng",
    },
];

export const SUSTAINABILITY = [
    {
        icon: Leaf,
        title: "Bảo vệ môi trường",
        items: ["Sử dụng năng lượng mặt trời", "Hệ thống xử lý nước thải", "Giảm thiểu rác thải nhựa"],
    },
    {
        icon: HandHeart,
        title: "Hỗ trợ cộng đồng",
        items: ["Tuyển dụng lao động địa phương", "Hỗ trợ giáo dục trẻ em", "Bảo tồn văn hóa bản địa"],
    },
    {
        icon: Recycle,
        title: "Phát triển bền vững",
        items: ["Nguyên liệu địa phương", "Công trình xanh", "Giảm carbon footprint"],
    },
];

export const SUSTAINABILITY_STATS = [
    { number: "80%", label: "Năng lượng tái tạo" },
    { number: "90%", label: "Nguyên liệu địa phương" },
    { number: "50%", label: "Giảm rác thải nhựa" },
    { number: "100%", label: "Nhân viên được đào tạo" },
];

export const MILESTONES = [
    {
        year: "2018",
        event: "Thành lập La Rosé",
        description: "Khởi đầu với tầm nhìn tạo ra không gian nghỉ dưỡng đẳng cấp.",
        achievement: "Top 10 khách sạn mới tốt nhất Việt Nam",
    },
    {
        year: "2019",
        event: "Đạt chứng nhận 5 sao",
        description: "Được công nhận là khách sạn 5 sao theo tiêu chuẩn quốc tế.",
        achievement: "Chứng nhận 5 sao từ Tổng cục Du lịch",
    },
    {
        year: "2020",
        event: "Mở rộng 50 phòng suite",
        description: "Mở rộng quy mô với 50 phòng suite cao cấp mới.",
        achievement: "Doanh thu tăng 150%",
    },
    {
        year: "2022",
        event: "Nhận giải Khách sạn xuất sắc",
        description: "Vinh dự nhận giải thưởng Khách sạn xuất sắc nhất Việt Nam.",
        achievement: "World Luxury Hotel Awards",
    },
    {
        year: "2023",
        event: "10.000+ khách hàng hài lòng",
        description: "Đón hơn 10.000 khách với tỷ lệ hài lòng 98%.",
        achievement: "Điểm đánh giá 4.9/5 trên Booking.com",
    },
    {
        year: "2024",
        event: "Mở rộng chi nhánh mới",
        description: "Khai trương chi nhánh thứ 2 tại Đà Nẵng.",
        achievement: "Dự kiến đón 15.000 khách/năm",
    },
];

export const AWARDS = [
    { name: "World Luxury Hotel Awards", year: "2023", category: "Khách sạn sang trọng" },
    { name: "Tripadvisor Travelers' Choice", year: "2022–2023", category: "Top 1% khách sạn toàn cầu" },
    { name: "Forbes Travel Guide", year: "2023", category: "5 sao Recommended" },
    { name: "Vietnam Tourism Awards", year: "2022", category: "Khách sạn xuất sắc nhất" },
];

export const TEAM = [
    {
        role: "Tổng Giám đốc",
        name: "Nguyễn Văn A",
        experience: "15 năm trong ngành khách sạn",
        quote: "Sự hài lòng của khách hàng là thước đo thành công của chúng tôi.",
    },
    {
        role: "Bếp trưởng",
        name: "Trần Thị B",
        experience: "Cựu đầu bếp tại Pháp",
        quote: "Mỗi món ăn là một tác phẩm nghệ thuật.",
    },
    {
        role: "Giám sát Dịch vụ",
        name: "Phạm Văn C",
        experience: "10 năm quản lý dịch vụ",
        quote: "Sự hoàn hảo nằm ở từng chi tiết nhỏ.",
    },
    {
        role: "Trưởng phòng Marketing",
        name: "Lê Thị D",
        experience: "Chuyên gia thương hiệu luxury",
        quote: "Xây dựng trải nghiệm khách hàng đáng nhớ.",
    },
];

export const TEAM_STATS = [
    { number: "100+", label: "Nhân viên" },
    { number: "15+", label: "Năm kinh nghiệm TB" },
    { number: "98%", label: "Đào tạo chuyên môn" },
    { number: "24/7", label: "Hỗ trợ khách hàng" },
];

export const FAQS = [
    {
        question: "La Rosé có những loại phòng nào?",
        answer: "Chúng tôi có 5 loại phòng: Deluxe, Executive Suite, Presidential Suite, Rosé Villa và Royal Penthouse. Mỗi phòng đều được thiết kế độc đáo với view thành phố hoặc vườn.",
    },
    {
        question: "Có dịch vụ đưa đón sân bay không?",
        answer: "Có, chúng tôi cung cấp dịch vụ đưa đón sân bay miễn phí bằng xe Mercedes cho khách đặt phòng suite trở lên. Các loại phòng khác có dịch vụ với phí ưu đãi.",
    },
    {
        question: "Nhà hàng phục vụ những loại ẩm thực nào?",
        answer: "Nhà hàng chính phục vụ ẩm thực Pháp – Việt fusion, cùng với nhà hàng Ý, quầy bar rooftop và dịch vụ room service 24/7.",
    },
    {
        question: "Có dịch vụ spa và wellness không?",
        answer: "Có, La Rosé Spa cung cấp các liệu pháp trị liệu từ thiên nhiên, phòng xông hơi, bể sục và các lớp yoga hằng ngày với HLV chuyên nghiệp.",
    },
];

export const CTA_OPTIONS = [
    { icon: BedDouble, title: "Đặt phòng", text: "Trải nghiệm dịch vụ 5 sao ngay hôm nay", to: "/rooms" },
    { icon: PhoneCall, title: "Tư vấn", text: "Được tư vấn miễn phí 24/7", href: CONTACT.zalo },
    { icon: Mail, title: "Nhận báo giá", text: "Báo giá chi tiết trong 30 phút", href: `mailto:${CONTACT.email}` },
];

export const TRUST_BADGES = [
    { icon: ShieldCheck, label: "Thanh toán an toàn" },
    { icon: Star, label: "Đánh giá 4.9/5" },
    { icon: Award, label: "Giải thưởng uy tín" },
    { icon: Gem, label: "Cam kết chất lượng" },
];
