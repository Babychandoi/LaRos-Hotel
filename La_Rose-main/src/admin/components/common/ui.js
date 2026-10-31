// Tiện ích class dùng chung cho form/bảng admin.

/** Class cho input/select/textarea, đổi viền đỏ khi có lỗi. */
export const fieldClass = (error, base = "adm-input") =>
    `${base} ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`;

/** Ô lọc trong toolbar: cao bằng ô tìm kiếm/nút; mobile chia đều hàng, desktop tự co. */
export const toolbarSelectClass =
    "adm-select h-10 min-w-0 flex-1 basis-full py-0 sm:w-auto sm:flex-none sm:basis-auto";

/** Nút hành động cuối toolbar (Làm mới): mobile giãn hết hàng, desktop dạt phải. */
export const toolbarActionClass = "flex-1 basis-28 sm:ml-auto sm:flex-none sm:basis-auto";

/** Cột "Thao tác" ghim bên phải khi bảng cuộn ngang (tr cần class "group"). */
export const stickyHeadClass =
    "sticky right-0 bg-slate-50 shadow-[inset_1px_0_0_var(--color-slate-200)]";
export const stickyCellClass =
    "sticky right-0 bg-white shadow-[inset_1px_0_0_var(--color-slate-100)] transition-colors group-hover:bg-slate-50";
