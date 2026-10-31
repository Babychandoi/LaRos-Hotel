package com.larose.util;

import com.larose.entity.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Tiện ích đọc người dùng hiện tại từ SecurityContext và kiểm tra quyền sở hữu tài nguyên.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    /** Email của người dùng đã đăng nhập, hoặc null nếu là khách. */
    public static String currentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return null;
        }
        return auth.getName();
    }

    public static boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    /** Chỉ chủ sở hữu hoặc ADMIN mới được thao tác; ngược lại ném AccessDeniedException (403). */
    public static void checkOwnerOrAdmin(User owner) {
        if (isAdmin()) {
            return;
        }
        String email = currentEmail();
        if (owner == null || email == null || !email.equalsIgnoreCase(owner.getEmail())) {
            throw new AccessDeniedException("Không có quyền truy cập tài nguyên của người dùng khác");
        }
    }
}
