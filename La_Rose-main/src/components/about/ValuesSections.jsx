import { Check, Trophy } from "lucide-react";
import SectionHeading from "../common/SectionHeading";
import { AWARDS, FEATURES, SUSTAINABILITY, SUSTAINABILITY_STATS } from "./aboutData";
import DynamicIcon from "../common/DynamicIcon";

const CONTAINER = "mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8";
const CARD = "rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg";
const ICON_BOX = "flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600";

export const StatRow = ({ stats, className = "" }) => (
    <div className={`grid grid-cols-2 gap-6 rounded-2xl border border-rose-100 bg-white/80 p-6 shadow-sm sm:grid-cols-4 ${className}`}>
        {stats.map(({ number, label }) => (
            <div key={label} className="text-center">
                <p className="font-playfair text-3xl font-bold text-rose-600 lining-nums">{number}</p>
                <p className="mt-1 text-sm text-slate-600">{label}</p>
            </div>
        ))}
    </div>
);

export const FeaturesSection = () => (
    <section className={CONTAINER}>
        <SectionHeading
            eyebrow="Điểm khác biệt"
            title="Điều làm nên La Rosé"
            description="Khám phá những yếu tố đặc biệt tạo nên trải nghiệm đáng nhớ tại khách sạn 5 sao của chúng tôi."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {FEATURES.map(({ icon, title, description, details, stat }) => (
                <article key={title} className={`${CARD} flex flex-col`}>
                    <span className={ICON_BOX}>
                        <DynamicIcon icon={icon} className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 font-playfair text-xl font-semibold text-slate-900">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                        {details.map((detail) => (
                            <li key={detail} className="flex items-start gap-2">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                                {detail}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-auto pt-5">
                        <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{stat}</span>
                    </p>
                </article>
            ))}
        </div>
    </section>
);

export const SustainabilitySection = () => (
    <section className="bg-white">
        <div className={CONTAINER}>
            <SectionHeading
                eyebrow="Bền vững"
                title="Cam kết phát triển bền vững"
                description="La Rosé không chỉ là khách sạn sang trọng mà còn là đại sứ của du lịch bền vững."
            />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
                {SUSTAINABILITY.map(({ icon, title, items }) => (
                    <article key={title} className={CARD}>
                        <span className={ICON_BOX}>
                            <DynamicIcon icon={icon} className="h-6 w-6" />
                        </span>
                        <h3 className="mt-5 font-playfair text-xl font-semibold text-slate-900">{title}</h3>
                        <ul className="mt-4 space-y-2 text-sm text-slate-600">
                            {items.map((item) => (
                                <li key={item} className="flex items-start gap-2">
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </article>
                ))}
            </div>
            <StatRow stats={SUSTAINABILITY_STATS} className="mt-10" />
        </div>
    </section>
);

export const AwardsSection = () => (
    <section className="bg-white">
        <div className={CONTAINER}>
            <SectionHeading
                eyebrow="Ghi nhận"
                title="Giải thưởng & công nhận"
                description="Những danh hiệu và giải thưởng quốc tế ghi nhận chất lượng dịch vụ xuất sắc."
            />
            <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
                {AWARDS.map(({ name, year, category }) => (
                    <article key={name} className={`${CARD} flex items-start gap-4`}>
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <Trophy className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <div>
                            <h3 className="font-semibold text-slate-900">{name}</h3>
                            <p className="mt-1 text-sm font-medium text-rose-600">{year}</p>
                            <p className="mt-1 text-sm text-slate-600">{category}</p>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    </section>
);
