// Bộ class Tailwind dùng chung cho các trang khách: cùng chiều cao, bo góc và màu nhấn rose.

const btnBase =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 disabled:cursor-not-allowed disabled:opacity-50";
const btnSm = `${btnBase} h-8 px-3 text-xs`;
const fieldBase =
    "block w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

export const ui = {
    page: "mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8",
    pageTitle: "font-playfair text-3xl font-bold text-slate-900 sm:text-4xl",
    pageSubtitle: "mt-2 text-slate-600",
    card: "rounded-2xl border border-rose-100 bg-white shadow-sm",
    label: "mb-1.5 block text-sm font-medium text-slate-700",
    input: `${fieldBase} h-11`,
    textarea: `${fieldBase} resize-none py-2.5`,
    btnPrimary: `${btnBase} h-11 bg-rose-600 px-5 text-sm text-white hover:bg-rose-700`,
    btnSecondary: `${btnBase} h-11 border border-slate-300 bg-white px-5 text-sm text-slate-700 hover:bg-slate-50`,
    // Nút nhỏ: ghép `ui.btnSm` với màu riêng, hoặc dùng các biến thể có sẵn.
    btnSm,
    btnSmPrimary: `${btnSm} bg-rose-600 text-white hover:bg-rose-700`,
    btnSmSecondary: `${btnSm} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`,
    btnSmDanger: `${btnSm} border border-red-200 bg-white text-red-600 hover:bg-red-50`,
    // Kèm kích thước khi dùng, ví dụ `${ui.spinner} h-4 w-4`.
    spinner: "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
};
