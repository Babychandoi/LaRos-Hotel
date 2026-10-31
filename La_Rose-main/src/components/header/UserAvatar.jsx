const SIZES = {
    sm: "h-8 w-8 text-xs",
    md: "h-11 w-11 text-sm",
};

const getInitials = (fullName = "") => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const UserAvatar = ({ user, size = "sm" }) =>
    user?.avatar ? (
        <img
            src={user.avatar}
            alt=""
            className={`${SIZES[size]} shrink-0 rounded-full object-cover ring-2 ring-rose-100`}
        />
    ) : (
        <span
            className={`${SIZES[size]} inline-flex shrink-0 items-center justify-center rounded-full bg-rose-600 font-semibold text-white ring-2 ring-rose-100`}
            aria-hidden="true"
        >
            {getInitials(user?.fullName)}
        </span>
    );

export default UserAvatar;
