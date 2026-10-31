import { Loader2 } from "lucide-react";

const VARIANTS = {
    primary: "adm-btn-primary",
    secondary: "adm-btn-secondary",
    danger: "adm-btn-danger",
    ghost: "adm-btn-ghost",
};

/** Nút chuẩn admin: cao cố định để thẳng hàng với input, có trạng thái đang xử lý. */
const Button = ({
    variant = "secondary",
    size = "md",
    icon,
    loading = false,
    disabled,
    type = "button",
    className = "",
    children,
    ...rest
}) => {
    const Icon = icon;
    return (
        <button
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={`${VARIANTS[variant] || VARIANTS.secondary} ${
                size === "sm" ? "adm-btn-sm h-8" : "h-10"
            } ${className}`}
            {...rest}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
                Icon && <Icon className="h-4 w-4" aria-hidden="true" />
            )}
            {children}
        </button>
    );
};

export default Button;
