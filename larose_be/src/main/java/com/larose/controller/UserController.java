package com.larose.controller;

import com.larose.dto.ChangePasswordRequest;
import com.larose.dto.MessageResponse;
import com.larose.dto.UpdateProfileRequest;
import com.larose.dto.UserDTO;
import com.larose.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

/**
 * API tài khoản của chính người dùng đang đăng nhập. Quản lý user khác nằm ở /api/admin/users.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(Principal principal) {
        return ResponseEntity.ok(userService.getUserProfileByEmail(principal.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(Principal principal, @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateUserProfile(principal.getName(), request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(Principal principal,
                                                          @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(principal.getName(), request);
        return ResponseEntity.ok(new MessageResponse("Đổi mật khẩu thành công"));
    }
}
