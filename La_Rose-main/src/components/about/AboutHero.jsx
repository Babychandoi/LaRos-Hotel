import { STATS } from "./aboutData";
import DynamicIcon from "../common/DynamicIcon";

const AboutHero = () => (
    <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-rose-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-24 -z-10 h-72 w-72 rounded-full bg-amber-200/50 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
            <div className="animate-fade-in">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-600 sm:text-sm">Về chúng tôi</p>
                <h1 className="mt-4 font-playfair text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                    Về <span className="text-rose-600">La Rosé</span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                    Khách sạn La Rosé – biểu tượng của sự sang trọng và tinh tế, nơi văn hóa Pháp hòa quyện cùng sự ấm áp
                    Việt Nam.
                </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                {STATS.map(({ number, label, icon }) => (
                    <div key={label} className="rounded-2xl border border-rose-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
                        <DynamicIcon icon={icon} className="mx-auto h-6 w-6 text-rose-500" />
                        <p className="mt-3 font-playfair text-2xl font-bold text-slate-900 lining-nums">{number}</p>
                        <p className="mt-1 text-sm text-slate-600">{label}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default AboutHero;
