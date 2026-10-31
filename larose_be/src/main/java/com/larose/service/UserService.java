package com.larose.service;

import com.larose.constant.RoleName;
import com.larose.dto.ChangePasswordRequest;
import com.larose.dto.CreateUserRequest;
import com.larose.dto.RoleDTO;
import com.larose.dto.SignupRequest;
import com.larose.dto.UpdateProfileRequest;
import com.larose.dto.UserDTO;
import com.larose.entity.Role;
import com.larose.entity.User;
import com.larose.entity.enums.OAuthProvider;
import com.larose.exception.NotFoundException;
import com.larose.maptruct.RoleMapper;
import com.larose.maptruct.UserMapper;
import com.larose.repository.RoleRepository;
import com.larose.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;
    private final UserMapper userMapper;

    @Value("${app.frontend.base-url}")
    private String baseUrl;

    /**
     * Đăng ký tài khoản và gửi email xác thực.
     *
     * @param allowCustomRoles true khi người gọi là ADMIN; ngược lại role trong request bị bỏ qua và luôn là USER
     */
    public User registerNewUser(SignupRequest req, boolean allowCustomRoles) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }

        String token = UUID.randomUUID().toString();
        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .phone(req.getPhone())
                .emailVerificationToken(token)
                .emailVerificationSentAt(LocalDateTime.now())
                .emailVerified(false)
                .isActive(true)
                .oauthProvider(OAuthProvider.none)
                .roles(resolveRoles(allowCustomRoles ? req.getRoles() : null))
                .build();

        User savedUser = userRepository.save(user);
        sendVerificationEmail(savedUser, token);
        return savedUser;
    }

    /** ADMIN tạo tài khoản trực tiếp (không cần xác thực email). */
    public UserDTO createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .isActive(true)
                .emailVerified(true)
                .emailVerifiedAt(LocalDateTime.now())
                .oauthProvider(OAuthProvider.none)
                .roles(resolveRoles(request.getRoles()))
                .build();
        return userMapper.toUserDTO(userRepository.save(user));
    }

    private Set<Role> resolveRoles(Set<String> roleNames) {
        if (CollectionUtils.isEmpty(roleNames)) {
            Role userRole = roleRepository.findByName(RoleName.USER.name())
                    .orElseThrow(() -> new IllegalStateException("Chưa cấu hình role USER"));
            return new HashSet<>(Set.of(userRole));
        }
        List<Role> roles = roleRepository.findAllByNameIn(roleNames);
        if (roles.size() != roleNames.size()) {
            throw new IllegalArgumentException("Một hoặc nhiều role không tồn tại");
        }
        return new HashSet<>(roles);
    }

    public boolean verifyEmailToken(String token) {
        return userRepository.findByEmailVerificationToken(token)
                .map(user -> {
                    user.setEmailVerified(true);
                    user.setEmailVerifiedAt(LocalDateTime.now());
                    user.setEmailVerificationToken(null);
                    userRepository.save(user);
                    return true;
                })
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    @Transactional(readOnly = true)
    public User findByEmailAndActive(String email) {
        return userRepository.findByEmailAndIsActiveTrue(email).orElse(null);
    }

    /** Người dùng đang hoạt động theo email; không có thì 404. */
    @Transactional(readOnly = true)
    public User getActiveUser(String email) {
        return userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng: " + email));
    }

    public void initiatePasswordReset(String email) {
        User user = getActiveUser(email);
        String resetToken = generateSecureToken();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenSentAt(LocalDateTime.now());
        userRepository.save(user);
        sendPasswordResetEmail(user, resetToken);
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token không hợp lệ hoặc đã hết hạn"));
        // Token có hiệu lực 1 giờ
        if (user.getPasswordResetTokenSentAt() == null
                || user.getPasswordResetTokenSentAt().isBefore(LocalDateTime.now().minusHours(1))) {
            throw new IllegalArgumentException("Token không hợp lệ hoặc đã hết hạn");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenSentAt(null);
        userRepository.save(user);
    }

    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại hoặc tài khoản đã bị vô hiệu hóa"));
        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new IllegalArgumentException("Email đã được xác thực");
        }
        String verificationToken = generateSecureToken();
        user.setEmailVerificationToken(verificationToken);
        user.setEmailVerificationSentAt(LocalDateTime.now());
        userRepository.save(user);
        sendVerificationEmail(user, verificationToken);
    }

    public void updateLastLogin(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    public Set<RoleDTO> mapRolesToDTO(Set<Role> roles) {
        if (CollectionUtils.isEmpty(roles)) {
            return Set.of();
        }
        return roles.stream().map(roleMapper::toDto).collect(Collectors.toSet());
    }

    @Transactional(readOnly = true)
    public UserDTO getUserProfileByEmail(String email) {
        return userMapper.toUserDTO(getActiveUser(email));
    }

    public UserDTO updateUserProfile(String email, UpdateProfileRequest request) {
        User user = getActiveUser(email);
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        return userMapper.toUserDTO(userRepository.save(user));
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getActiveUser(email);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không chính xác");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private void sendVerificationEmail(User user, String token) {
        String link = baseUrl + "/api/auth/verify?token=" + token;
        String subject = "Xác nhận đăng ký tài khoản Larose";
        String body = buildVerificationEmailBody(user.getFullName(), link);
        emailService.sendHtmlEmail(user.getEmail(), subject, body);
    }

    private void sendPasswordResetEmail(User user, String token) {
        String link = baseUrl + "/reset-password?token=" + token;
        String subject = "Yêu cầu đặt lại mật khẩu - Khách sạn Larose";
        String body = buildPasswordResetEmailBody(user.getFullName(), link);
        emailService.sendHtmlEmail(user.getEmail(), subject, body);
    }

    private String buildVerificationEmailBody(String fullName, String verificationLink) {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Xác nhận đăng ký - Khách sạn Larose</title>
                <style>
                    body, table, td, a { -webkit-text-size-adjust: 100%%; -ms-text-size-adjust: 100%%; margin: 0; padding: 0; }
                    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
                    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%%; outline: none; text-decoration: none; }
                    a { color: #be185d; text-decoration: none; }
                    body { background: linear-gradient(135deg, #fdf2f8 0%%, #fce7f3 100%%); font-family: Arial, Helvetica, sans-serif; color: #333333; line-height: 1.6; }
                </style>
            </head>
            <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #fdf2f8 0%%, #fce7f3 100%%); font-family: Arial, Helvetica, sans-serif;">
                <center style="width: 100%%; background: linear-gradient(135deg, #fdf2f8 0%%, #fce7f3 100%%); padding: 20px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(244, 114, 182, 0.15); border: 1px solid #f9a8d4;">
            
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%" 
                               style="background: linear-gradient(135deg, #be185d 0%%, #ec4899 100%%);">
                            <tr>
                                <td style="padding: 30px 40px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 32px; color: #FFFFFF; line-height: 1.2; font-weight: 700; letter-spacing: 1px; text-shadow: 1px 1px 3px rgba(0,0,0,0.2);">
                                        Khách sạn Larose
                                    </h1>
                                    <p style="margin: 8px 0 0; font-size: 16px; color: #fdf2f8; font-style: italic;">
                                        Nơi vẻ đẹp và tiện nghi hội tụ
                                    </p>
                                </td>
                            </tr>
                        </table>
            
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%">
                            <tr>
                                <td style="padding: 40px; font-size: 16px; line-height: 1.6; color: #333333; text-align: left;">
                                    <p style="margin: 0 0 20px; font-size: 18px;">
                                        <strong style="color: #be185d;">Kính gửi %s,</strong>
                                    </p>
                                    <p style="margin: 0 0 20px;">
                                        Chào mừng bạn đến với Khách sạn Larose! Chúng tôi rất vinh hạnh được chào đón bạn trở thành thành viên của đại gia đình Larose.
                                    </p>
                                    <p style="margin: 0 0 30px;">
                                        Để hoàn tất đăng ký và bắt đầu tận hưởng những đặc quyền dành cho thành viên, vui lòng xác nhận địa chỉ email của bạn bằng cách nhấn vào nút bên dưới:
                                    </p>
            
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="%s" 
                                           style="background: linear-gradient(135deg, #be185d 0%%, #ec4899 100%%); border: none; color: #FFFFFF; padding: 14px 35px; display: inline-block; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(190, 24, 93, 0.3); transition: all 0.3s ease;">
                                           XÁC NHẬN TÀI KHOẢN
                                        </a>
                                    </div>
            
                                    <div style="background: linear-gradient(135deg, #fef3c7 0%%, #fde68a 100%%); padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #d97706;">
                                        <p style="margin: 0 0 10px; font-size: 16px; color: #be185d; font-weight: bold;">
                                            ĐẶC QUYỀN THÀNH VIÊN LAROSE:
                                        </p>
                                        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #555555;">
                                            <li>Giá ưu đãi đặc biệt cho thành viên</li>
                                            <li>Ưu tiên nhận phòng sớm và check-out muộn</li>
                                            <li>Tích lũy điểm thưởng cho mỗi lần lưu trú</li>
                                            <li>Nhận thông tin khuyến mãi đầu tiên</li>
                                            <li>Dịch vụ đặt phòng 24/7</li>
                                        </ul>
                                    </div>
            
                                    <p style="margin: 20px 0 10px; font-size: 14px; color: #666666; text-align: center;">
                                        Nếu nút trên không hoạt động, vui lòng sao chép và dán liên kết này vào trình duyệt:
                                    </p>
                                    <p style="margin: 0 0 30px; font-size: 12px; word-break: break-all; text-align: center; padding: 10px; background-color: #fdf2f8; border-radius: 4px; border: 1px dashed #ec4899;">
                                        <a href="%s" style="color: #be185d; text-decoration: underline; font-family: monospace;">%s</a>
                                    </p>
            
                                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f9a8d4;">
                                        <p style="margin: 0 0 10px;">Trân trọng,</p>
                                        <p style="margin: 0; color: #be185d; font-weight: bold; font-size: 18px;">Đội ngũ Khách sạn Larose</p>
                                        <p style="margin: 5px 0 0; font-size: 14px; color: #666666;">
                                            Hotline: 0123 456 789 | Email: info@larosehotel.com
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        </table>
            
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%" 
                               style="background-color: #fdf2f8; border-top: 1px solid #f9a8d4;">
                            <tr>
                                <td style="padding: 20px 40px; font-size: 12px; line-height: 1.5; color: #be185d; text-align: center;">
                                    <p style="margin: 0;">
                                        <strong style="color: #be185d;">Lưu ý:</strong> Nếu bạn không đăng ký tài khoản tại Khách sạn Larose, vui lòng bỏ qua email này.
                                    </p>
                                    <p style="margin: 10px 0 0; font-size: 11px; color: #d97706;">
                                        Khách sạn Larose &copy; 2025. Tất cả các quyền được bảo lưu.
                                    </p>
                                    <p style="margin: 5px 0 0; font-size: 11px; color: #d97706;">
                                        123 Đường Hoa Hồng, Quận 1, TP.HCM, Việt Nam
                                    </p>
                                </td>
                            </tr>
                        </table>
            
                    </div>
                </center>
            </body>
            </html>
            """.formatted(fullName != null ? fullName : "Quý khách",
                verificationLink, verificationLink, verificationLink);
    }

    private String buildPasswordResetEmailBody(String fullName, String resetLink) {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Đặt lại mật khẩu - Khách sạn Larose</title>
                <style>
                    body, table, td, a { -webkit-text-size-adjust: 100%%; -ms-text-size-adjust: 100%%; margin: 0; padding: 0; }
                    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
                    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%%; outline: none; text-decoration: none; }
                    a { color: #be185d; text-decoration: none; }
                    body { background: linear-gradient(135deg, #fdf2f8 0%%, #fce7f3 100%%); font-family: Arial, Helvetica, sans-serif; color: #333333; line-height: 1.6; }
                </style>
            </head>
            <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #fdf2f8 0%%, #fce7f3 100%%); font-family: Arial, Helvetica, sans-serif;">
                <center style="width: 100%%; background: linear-gradient(135deg, #fdf2f8 0%%, #fce7f3 100%%); padding: 20px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(244, 114, 182, 0.15); border: 1px solid #f9a8d4;">
            
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%" 
                               style="background: linear-gradient(135deg, #be185d 0%%, #ec4899 100%%);">
                            <tr>
                                <td style="padding: 30px 40px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 32px; color: #FFFFFF; line-height: 1.2; font-weight: 700; letter-spacing: 1px; text-shadow: 1px 1px 3px rgba(0,0,0,0.2);">
                                        Khách sạn Larose
                                    </h1>
                                    <p style="margin: 8px 0 0; font-size: 16px; color: #fdf2f8; font-style: italic;">
                                        Đặt lại mật khẩu
                                    </p>
                                </td>
                            </tr>
                        </table>
            
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%%">
                            <tr>
                                <td style="padding: 40px; font-size: 16px; line-height: 1.6; color: #333333; text-align: left;">
                                    <p style="margin: 0 0 20px; font-size: 18px;">
                                        <strong style="color: #be185d;">Kính gửi %s,</strong>
                                    </p>
                                    <p style="margin: 0 0 20px;">
                                        Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại Khách sạn Larose.
                                    </p>
                                    <p style="margin: 0 0 30px;">
                                        Để thiết lập mật khẩu mới, vui lòng nhấn vào nút bên dưới:
                                    </p>
            
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="%s" 
                                           style="background: linear-gradient(135deg, #be185d 0%%, #ec4899 100%%); border: none; color: #FFFFFF; padding: 14px 35px; display: inline-block; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(190, 24, 93, 0.3); transition: all 0.3s ease;">
                                           ĐẶT LẠI MẬT KHẨU
                                        </a>
                                    </div>
            
                                    <div style="background: linear-gradient(135deg, #fef3c7 0%%, #fde68a 100%%); padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #d97706;">
                                        <p style="margin: 0 0 10px; font-size: 16px; color: #be185d; font-weight: bold;">
                                            LƯU Ý BẢO MẬT:
                                        </p>
                                        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #555555;">
                                            <li>Liên kết này sẽ hết hạn sau 1 giờ</li>
                                            <li>Không chia sẻ liên kết này với bất kỳ ai</li>
                                            <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                                        </ul>
                                    </div>
            
                                    <p style="margin: 20px 0 10px; font-size: 14px; color: #666666; text-align: center;">
                                        Nếu nút trên không hoạt động, vui lòng sao chép và dán liên kết này vào trình duyệt:
                                    </p>
                                    <p style="margin: 0 0 30px; font-size: 12px; word-break: break-all; text-align: center; padding: 10px; background-color: #fdf2f8; border-radius: 4px; border: 1px dashed #ec4899;">
                                        <a href="%s" style="color: #be185d; text-decoration: underline; font-family: monospace;">%s</a>
                                    </p>
            
                                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f9a8d4;">
                                        <p style="margin: 0 0 10px;">Trân trọng,</p>
                                        <p style="margin: 0; color: #be185d; font-weight: bold; font-size: 18px;">Đội ngũ Khách sạn Larose</p>
                                        <p style="margin: 5px 0 0; font-size: 14px; color: #666666;">
                                            Hotline: 0123 456 789 | Email: info@larosehotel.com
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                </center>
            </body>
            </html>
            """.formatted(fullName != null ? fullName : "Quý khách",
                resetLink, resetLink, resetLink);
    }

    private String generateSecureToken() {
        return UUID.randomUUID() + "-" + System.currentTimeMillis();
    }
}
