package com.larose.controller;

import com.larose.config.JwtTokenUtil;
import com.larose.dto.AuthDetailResponse;
import com.larose.dto.ForgotPasswordRequest;
import com.larose.dto.LoginRequest;
import com.larose.dto.MessageResponse;
import com.larose.dto.RefreshTokenRequest;
import com.larose.dto.ResendVerificationRequest;
import com.larose.dto.ResetPasswordRequest;
import com.larose.dto.SignupRequest;
import com.larose.dto.SignupResponse;
import com.larose.dto.UserInfoResponse;
import com.larose.entity.User;
import com.larose.exception.ApiException;
import com.larose.service.UserService;
import com.larose.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;

    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@Valid @RequestBody SignupRequest req) {
        // Chỉ ADMIN đang đăng nhập mới được gán role tuỳ ý; đăng ký công khai luôn là USER
        User user = userService.registerNewUser(req, SecurityUtils.isAdmin());
        log.info("User registered: {}", req.getEmail());
        return ResponseEntity.ok(new SignupResponse(
                "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản.",
                user.getId(), user.getEmail(), user.getFullName(), user.getPhone(), user.getCreatedAt()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDetailResponse> login(@Valid @RequestBody LoginRequest req) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        User user = userService.findByEmail(req.getEmail());
        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "EMAIL_NOT_VERIFIED",
                    "Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư để xác minh tài khoản.");
        }
        userService.updateLastLogin(user.getId());
        log.info("User logged in: {}", req.getEmail());
        return ResponseEntity.ok(buildAuthResponse(user, "Đăng nhập thành công"));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthDetailResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest req) {
        String refreshToken = req.getRefreshToken();
        if (!jwtTokenUtil.validateToken(refreshToken)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN",
                    "Refresh token không hợp lệ hoặc đã hết hạn");
        }
        User user = userService.findByEmail(jwtTokenUtil.getEmailFromToken(refreshToken));
        if (user == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Người dùng không tồn tại");
        }
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "ACCOUNT_INACTIVE", "Tài khoản đã bị vô hiệu hóa");
        }
        return ResponseEntity.ok(buildAuthResponse(user, "Làm mới token thành công"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        try {
            userService.initiatePasswordReset(req.getEmail());
        } catch (RuntimeException ex) {
            // Luôn trả về thành công để tránh lộ email nào tồn tại trong hệ thống
            log.warn("Forgot password for {} not processed: {}", req.getEmail(), ex.getMessage());
        }
        return ResponseEntity.ok(new MessageResponse(
                "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        userService.resetPassword(req.getToken(), req.getNewPassword());
        return ResponseEntity.ok(new MessageResponse(
                "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới."));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<MessageResponse> resendVerification(@Valid @RequestBody ResendVerificationRequest req) {
        userService.resendVerificationEmail(req.getEmail());
        return ResponseEntity.ok(new MessageResponse("Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn."));
    }

    /** JWT là stateless: client tự xoá token, endpoint chỉ để đồng bộ luồng FE. */
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout() {
        return ResponseEntity.ok(new MessageResponse("Đăng xuất thành công"));
    }

    @GetMapping("/verify")
    public ResponseEntity<MessageResponse> verify(@RequestParam("token") String token) {
        if (!userService.verifyEmailToken(token)) {
            throw new IllegalArgumentException("Token không hợp lệ hoặc đã hết hạn.");
        }
        return ResponseEntity.ok(new MessageResponse("Xác thực email thành công. Bạn có thể đăng nhập."));
    }

    private AuthDetailResponse buildAuthResponse(User user, String message) {
        UserInfoResponse userInfo = new UserInfoResponse(
                user.getId(), user.getEmail(), user.getFullName(), user.getPhone(),
                user.getIsActive(), user.getEmailVerified(), user.getLastLogin(), user.getCreatedAt(),
                userService.mapRolesToDTO(user.getRoles()));
        return new AuthDetailResponse(
                jwtTokenUtil.generateAccessToken(user),
                jwtTokenUtil.generateRefreshToken(user),
                "Bearer", user.getId(), userInfo, message);
    }
}
