import session from "../../utils/SessionManager";

// Vai trò được vào trang quản trị và nhãn hiển thị tương ứng.
const ADMIN_ROLE_LABELS = {
    ADMIN: "Quản trị viên",
    SUPERADMIN: "Quản trị cấp cao",
};

/** Danh sách tên vai trò (viết hoa) của user; API trả `roles: [{ id, name }]`. */
const getRoleNames = (user) =>
    (Array.isArray(user?.roles) ? user.roles : [])
        .map((role) => String(role?.name ?? role ?? "").toUpperCase())
        .filter(Boolean);

const findAdminRole = (user) => getRoleNames(user).find((name) => name in ADMIN_ROLE_LABELS);

export const hasAdminRole = (user) => Boolean(findAdminRole(user));

/**
 * Người dùng quản trị đang đăng nhập, hoặc null nếu chưa đăng nhập,
 * token đã hết hạn (session.getToken() tự xoá phiên) hay không đủ quyền.
 */
export const getAdminSession = () => {
    if (!session.getToken()) return null;
    const user = session.getUser();
    return hasAdminRole(user) ? user : null;
};

export const getRoleLabel = (user) => ADMIN_ROLE_LABELS[findAdminRole(user)] ?? "Quản trị viên";

/** Chữ cái đầu của từ đầu và từ cuối trong họ tên (vd. "Giang Đỗ" → "GĐ"). */
export const getInitials = (user) => {
    const words = String(user?.fullName || user?.email || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (words.length === 0) return "QT";
    const last = words.length > 1 ? words[words.length - 1][0] : "";
    return (words[0][0] + last).toUpperCase();
};
