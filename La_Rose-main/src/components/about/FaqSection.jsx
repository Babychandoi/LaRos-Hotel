import { useState } from "react";
import { ChevronDown } from "lucide-react";
import SectionHeading from "../common/SectionHeading";
import { FAQS } from "./aboutData";

const FaqSection = () => {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section className="bg-white">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <SectionHeading
                    eyebrow="Hỏi đáp"
                    title="Câu hỏi thường gặp"
                    description="Tìm hiểu thêm về dịch vụ và trải nghiệm tại La Rosé."
                />
                <div className="mx-auto mt-12 max-w-3xl space-y-3">
                    {FAQS.map(({ question, answer }, index) => {
                        const open = openIndex === index;
                        const panelId = `faq-panel-${index}`;
                        return (
                            <div key={question} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(open ? null : index)}
                                    aria-expanded={open}
                                    aria-controls={panelId}
                                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-slate-800 transition hover:bg-rose-50/50"
                                >
                                    {question}
                                    <ChevronDown
                                        className={`h-5 w-5 shrink-0 text-rose-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                                    />
                                </button>
                                <div
                                    id={panelId}
                                    className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                                >
                                    <p className="overflow-hidden px-5 text-slate-600">
                                        <span className="block pb-4 leading-relaxed">{answer}</span>
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FaqSection;
