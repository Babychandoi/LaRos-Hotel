package com.larose.controller.admin;

import com.larose.dto.AdminUpdateUserRequest;
import com.larose.dto.AssignRoleRequest;
import com.larose.dto.BookingDTO;
import com.larose.dto.CreateUserRequest;
import com.larose.dto.ReviewDTO;
import com.larose.dto.UserDTO;
import com.larose.dto.UserDetailDTO;
import com.larose.dto.UserStatsDTO;
import com.larose.dto.response.TransactionResponse;
import com.larose.service.AdminUserService;
import com.larose.service.BookingService;
import com.larose.service.ReviewService;
import com.larose.service.TransactionService;
import com.larose.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final UserService userService;
    private final BookingService bookingService;
    private final TransactionService transactionService;
    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<Page<UserDTO>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean emailVerified,
            @RequestParam(required = false) String role) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDirection), sortBy));
        return ResponseEntity.ok(adminUserService.getUsersWithFilters(search, isActive, emailVerified, role, pageable));
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsDTO> getUserStats() {
        return ResponseEntity.ok(adminUserService.getUserStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDetailDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @Valid @RequestBody AdminUpdateUserRequest request) {
        return ResponseEntity.ok(adminUserService.updateUser(id, request));
    }

    /** Xoá mềm: đặt deleted_at và vô hiệu hoá tài khoản. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminUserService.softDeleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/roles")
    public ResponseEntity<UserDTO> assignRoleToUser(@PathVariable Long id, @Valid @RequestBody AssignRoleRequest request) {
        return ResponseEntity.ok(adminUserService.assignRoleToUser(id, request.getRoleName()));
    }

    @DeleteMapping("/{id}/roles/{roleName}")
    public ResponseEntity<UserDTO> removeRoleFromUser(@PathVariable Long id, @PathVariable String roleName) {
        return ResponseEntity.ok(adminUserService.removeRoleFromUser(id, roleName));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<UserDTO> activateUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.activateUser(id));
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<UserDTO> deactivateUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.deactivateUser(id));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<UserDTO> restoreUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.restoreUser(id));
    }

    @GetMapping("/{id}/bookings")
    public ResponseEntity<List<BookingDTO>> getUserBookings(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingsByUserId(id));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<TransactionResponse>> getUserTransactions(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getTransactionsByUserId(id));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<ReviewDTO>> getUserReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewsByUserId(id));
    }
}
