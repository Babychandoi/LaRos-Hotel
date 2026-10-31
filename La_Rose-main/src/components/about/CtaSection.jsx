import { Link } from "react-router-dom";
import { CalendarCheck, MessageCircle } from "lucide-react";
import { CONTACT } from "../siteConfig";
import { CTA_OPTIONS, TRUST_BADGES } from "./aboutData";
import DynamicIcon from "../common/DynamicIcon";

const OPTION_CARD =
    "block h-full rounded-2xl border border-white/15 bg-white/10 p-6 text-left transition hover:-translate-y-1 hover:bg-white/15";

const OptionContent = ({ icon, title, text }) => (
    <>
        <DynamicIcon icon={icon} className="h-7 w-7 text-amber-200" />
        <h3 className="mt-4 font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-white/80">{text}</p>
    </>
);

const CtaSection = () => (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-rose-700 via-rose-600 to-pink-600 text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 -z-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
            <h2 className="font-playfair text-3xl font-bold sm:text-4xl">Sẵn sàng trải nghiệm?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
                Khám phá sự khác biệt của dịch vụ đẳng cấp 5 sao và không gian sang trọng. Đặt phòng ngay hôm nay để nhận ưu đãi
                đặc biệt!
            </p>

            <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-3">
                {CTA_OPTIONS.map((option) =>
                    option.to ? (
                        <Link key={option.title} to={option.to} className={OPTION_CARD}>
                            <OptionContent {...option} />
                        </Link>
                    ) : (
                        <a
                            key={option.title}
                            href={option.href}
                            {...(option.href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
                            className={OPTION_CARD}
                        >
                            <OptionContent {...option} />
                        </a>
                    ),
                )}
            </div>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                    to="/rooms"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-rose-600 shadow-lg transition hover:bg-amber-50"
                >
                    <CalendarCheck className="h-5 w-5" />
                    Đặt phòng ngay
                </Link>
                <a
                    href={CONTACT.zalo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/80 px-8 py-3.5 font-semibold text-white transition hover:bg-white hover:text-rose-600"
                >
                    <MessageCircle className="h-5 w-5" />
                    Liên hệ tư vấn
                </a>
            </div>

            <ul className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-white/80">
                {TRUST_BADGES.map(({ icon, label }) => (
                    <li key={label} className="flex items-center gap-2">
                        <DynamicIcon icon={icon} className="h-4 w-4 text-amber-200" />
                        {label}
                    </li>
                ))}
            </ul>
        </div>
    </section>
);

export default CtaSection;
