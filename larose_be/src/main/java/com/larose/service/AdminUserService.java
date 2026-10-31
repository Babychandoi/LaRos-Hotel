package com.larose.service;

import com.larose.dto.AdminUpdateUserRequest;
import com.larose.dto.UserDTO;
import com.larose.dto.UserDetailDTO;
import com.larose.dto.UserStatsDTO;
import com.larose.entity.Role;
import com.larose.entity.User;
import com.larose.exception.NotFoundException;
import com.larose.maptruct.UserMapper;
import com.larose.repository.RoleRepository;
import com.larose.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public Page<UserDTO> getUsersWithFilters(String search, Boolean isActive, Boolean emailVerified, String role,
                                             Pageable pageable) {
        String keyword = StringUtils.hasText(search) ? search.trim().toLowerCase() : null;
        String roleName = StringUtils.hasText(role) ? role.trim().toUpperCase() : null;
        return userRepository.searchUsers(keyword, isActive, emailVerified, roleName, pageable)
                .map(userMapper::toUserDTO);
    }

    @Transactional(readOnly = true)
    public UserDetailDTO getUserById(Long id) {
        return toUserDetailDTO(findUser(id));
    }

    public UserDTO updateUser(Long id, AdminUpdateUserRequest request) {
        User user = findUser(id);

        if (request.getEmail() != null && !user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email đã tồn tại");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }
        if (request.getEmailVerified() != null) {
            user.setEmailVerified(request.getEmailVerified());
            user.setEmailVerifiedAt(request.getEmailVerified() ? LocalDateTime.now() : null);
        }
        return userMapper.toUserDTO(userRepository.save(user));
    }

    public void softDeleteUser(Long id) {
        User user = findUser(id);
        user.setDeletedAt(LocalDateTime.now());
        user.setIsActive(false);
        userRepository.save(user);
    }

    public UserDTO assignRoleToUser(Long userId, String roleName) {
        User user = findUser(userId);
        user.getRoles().add(findRole(roleName));
        return userMapper.toUserDTO(userRepository.save(user));
    }

    public UserDTO removeRoleFromUser(Long userId, String roleName) {
        User user = findUser(userId);
        user.getRoles().remove(findRole(roleName));
        return userMapper.toUserDTO(userRepository.save(user));
    }

    public UserDTO activateUser(Long id) {
        User user = findUser(id);
        user.setIsActive(true);
        user.setDeletedAt(null);
        return userMapper.toUserDTO(userRepository.save(user));
    }

    public UserDTO deactivateUser(Long id) {
        User user = findUser(id);
        user.setIsActive(false);
        return userMapper.toUserDTO(userRepository.save(user));
    }

    public UserDTO restoreUser(Long id) {
        return activateUser(id);
    }

    @Transactional(readOnly = true)
    public UserStatsDTO getUserStats() {
        UserStatsDTO stats = new UserStatsDTO();
        stats.setTotalUsers(userRepository.count());
        stats.setActiveUsers(userRepository.countByIsActiveTrue());
        stats.setInactiveUsers(userRepository.countByIsActiveFalse());
        stats.setVerifiedUsers(userRepository.countByEmailVerifiedTrue());
        stats.setUnverifiedUsers(userRepository.countByEmailVerifiedFalse());
        stats.setDeletedUsers(userRepository.countByDeletedAtIsNotNull());

        LocalDateTime today = LocalDate.now().atStartOfDay();
        stats.setTodayRegistrations(userRepository.countByCreatedAtAfter(today));
        stats.setWeekRegistrations(userRepository.countByCreatedAtAfter(today.minusDays(7)));
        stats.setMonthRegistrations(userRepository.countByCreatedAtAfter(today.minusDays(30)));
        return stats;
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng với id: " + id));
    }

    private Role findRole(String roleName) {
        return roleRepository.findByName(roleName)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy role: " + roleName));
    }

    private UserDetailDTO toUserDetailDTO(User user) {
        UserDetailDTO dto = new UserDetailDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setIsActive(user.getIsActive());
        dto.setEmailVerified(user.getEmailVerified());
        dto.setEmailVerifiedAt(user.getEmailVerifiedAt());
        dto.setOauthProvider(user.getOauthProvider() != null ? user.getOauthProvider().name() : null);
        dto.setOauthProviderId(user.getOauthProviderId());
        dto.setLastLogin(user.getLastLogin());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setDeletedAt(user.getDeletedAt());
        dto.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        return dto;
    }
}
