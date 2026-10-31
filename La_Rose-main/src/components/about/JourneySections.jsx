import SectionHeading from "../common/SectionHeading";
import { MILESTONES, TEAM, TEAM_STATS } from "./aboutData";
import { StatRow } from "./ValuesSections";

const CONTAINER = "mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8";

const initials = (name) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(-2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

export const MilestonesSection = () => (
    <section className={CONTAINER}>
        <SectionHeading
            eyebrow="Hành trình"
            title="Hành trình phát triển"
            description="Cùng nhìn lại chặng đường đầy tự hào với những cột mốc quan trọng."
        />
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MILESTONES.map(({ year, event, description, achievement }) => (
                <li key={year} className="relative flex flex-col rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="font-playfair text-3xl font-bold text-rose-600 lining-nums">{year}</span>
                        <span className="h-px flex-1 bg-gradient-to-r from-rose-200 to-transparent" aria-hidden="true" />
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-900">{event}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
                    <p className="mt-auto pt-4">
                        <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            {achievement}
                        </span>
                    </p>
                </li>
            ))}
        </ol>
    </section>
);

export const TeamSection = () => (
    <section className={CONTAINER}>
        <SectionHeading
            eyebrow="Con người"
            title="Đội ngũ lãnh đạo"
            description="Đội ngũ quản lý giàu kinh nghiệm với tầm nhìn chiến lược và đam mê phục vụ."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {TEAM.map(({ role, name, experience, quote }) => (
                <article key={name} className="flex flex-col items-center rounded-2xl border border-rose-100 bg-white p-6 text-center shadow-sm">
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 font-playfair text-2xl font-bold text-white shadow-md">
                        {initials(name)}
                    </span>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-rose-600">{role}</p>
                    <h3 className="mt-1 font-playfair text-xl font-semibold text-slate-900">{name}</h3>
                    <p className="mt-3 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{experience}</p>
                    <p className="mt-4 border-t border-slate-100 pt-4 text-sm italic text-slate-500">“{quote}”</p>
                </article>
            ))}
        </div>
        <StatRow stats={TEAM_STATS} className="mx-auto mt-10 max-w-4xl" />
    </section>
);
