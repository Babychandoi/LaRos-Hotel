package com.larose.repository;

import com.larose.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndIsActiveTrue(String email);

    Optional<User> findByEmailVerificationToken(String token);

    Optional<User> findByPasswordResetToken(String token);

    boolean existsByEmail(String email);

    long countByIsActiveTrue();

    long countByIsActiveFalse();

    long countByEmailVerifiedTrue();

    long countByEmailVerifiedFalse();

    long countByDeletedAtIsNotNull();

    long countByCreatedAtAfter(LocalDateTime date);

    /** Tìm user cho trang quản trị; tham số null = không lọc. {@code search} phải là chữ thường. */
    @Query("""
            SELECT u FROM User u
            WHERE (:search IS NULL OR LOWER(u.email) LIKE CONCAT('%', :search, '%')
                   OR LOWER(u.fullName) LIKE CONCAT('%', :search, '%')
                   OR u.phone LIKE CONCAT('%', :search, '%'))
              AND (:isActive IS NULL OR u.isActive = :isActive)
              AND (:emailVerified IS NULL OR u.emailVerified = :emailVerified)
              AND (:role IS NULL OR EXISTS (SELECT 1 FROM u.roles r WHERE r.name = :role))
            """)
    Page<User> searchUsers(@Param("search") String search,
                           @Param("isActive") Boolean isActive,
                           @Param("emailVerified") Boolean emailVerified,
                           @Param("role") String role,
                           Pageable pageable);
}
