/** Tiêu đề section thống nhất: dòng nhấn nhỏ (rose) + tiêu đề Playfair + vạch vàng + mô tả. */
const SectionHeading = ({ eyebrow, title, description, align = "center", as = "h2", className = "" }) => {
    const Tag = as;
    const centered = align === "center";
    return (
        <div className={`max-w-2xl ${centered ? "mx-auto text-center" : ""} ${className}`}>
            {eyebrow && (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">{eyebrow}</p>
            )}
            <Tag className="mt-2 text-balance font-playfair text-3xl font-bold tracking-tight text-slate-900 lining-nums sm:text-4xl">
                {title}
            </Tag>
            <span
                className={`mt-4 block h-0.5 w-12 rounded-full bg-amber-400 ${centered ? "mx-auto" : ""}`}
                aria-hidden="true"
            />
            {description && <p className="mt-4 text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">{description}</p>}
        </div>
    );
};

export default SectionHeading;
