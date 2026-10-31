import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { CONTACT, NAV_LINKS } from "./siteConfig";
import DynamicIcon from "./common/DynamicIcon";

const SERVICES = [
    { to: "/rooms", label: "Đặt phòng trực tuyến" },
    { to: "/about", label: "Dịch vụ spa" },
    { to: "/about", label: "Nhà hàng cao cấp" },
    { to: "/about", label: "Hội nghị & sự kiện" },
];

const SOCIALS = [
    { label: "Facebook", icon: Facebook },
    { label: "Instagram", icon: Instagram },
    { label: "Twitter", icon: Twitter },
];

const HEADING = "mb-4 text-sm font-semibold uppercase tracking-wider text-white";
const LINK = "transition-colors hover:text-rose-300";

const Footer = () => (
    <footer className="bg-slate-900 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
                <div className="col-span-2 lg:col-span-1">
                    <Link to="/" className="flex items-center gap-3">
                        <span className="h-10 w-10 overflow-hidden rounded-xl">
                            <img src="/logo.jpg" alt="" className="h-full w-full scale-125 object-cover" />
                        </span>
                        <span className="font-playfair text-xl font-bold text-white">La Rosé</span>
                    </Link>
                    <p className="mt-4 max-w-xs text-sm leading-relaxed">
                        Khách sạn sang trọng với phong cách nữ tính tinh tế, mang đến trải nghiệm nghỉ dưỡng đẳng cấp.
                    </p>
                    <div className="mt-5 flex gap-3">
                        {SOCIALS.map(({ label, icon }) => (
                            <a
                                key={label}
                                href="#"
                                aria-label={label}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-colors hover:bg-rose-600 hover:text-white"
                            >
                                <DynamicIcon icon={icon} className="h-4 w-4" />
                            </a>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className={HEADING}>Khám phá</h3>
                    <ul className="space-y-2.5 text-sm">
                        {NAV_LINKS.map(({ to, label }) => (
                            <li key={to}>
                                <Link to={to} className={LINK}>
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className={HEADING}>Dịch vụ</h3>
                    <ul className="space-y-2.5 text-sm">
                        {SERVICES.map(({ to, label }) => (
                            <li key={label}>
                                <Link to={to} className={LINK}>
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="col-span-2 lg:col-span-1">
                    <h3 className={HEADING}>Liên hệ</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                            {CONTACT.address}
                        </li>
                        <li>
                            <a href={CONTACT.phoneHref} className={`flex items-center gap-3 ${LINK}`}>
                                <Phone className="h-4 w-4 shrink-0 text-rose-400" />
                                {CONTACT.phone}
                            </a>
                        </li>
                        <li>
                            <a href={`mailto:${CONTACT.email}`} className={`flex items-center gap-3 ${LINK}`}>
                                <Mail className="h-4 w-4 shrink-0 text-rose-400" />
                                {CONTACT.email}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-slate-800 pt-6 text-sm sm:flex-row">
                <p>&copy; {new Date().getFullYear()} La Rosé Hotel. Tất cả quyền được bảo lưu.</p>
                <p>Nhận phòng 14:00 · Trả phòng 12:00</p>
            </div>
        </div>
    </footer>
);

export default Footer;
