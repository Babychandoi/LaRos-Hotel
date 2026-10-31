package com.larose.controller;

import com.larose.dto.BookingServiceDTO;
import com.larose.dto.ServiceDTO;
import com.larose.dto.request.AddServiceToBookingRequest;
import com.larose.service.AdditionalServiceService;
import lombok.RequiredArgsConstructor;
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

/**
 * Dịch vụ bổ sung: danh mục (công khai xem, ADMIN quản lý) và dịch vụ gắn vào booking (chủ booking hoặc ADMIN).
 */
@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class AdditionalServiceController {

    private final AdditionalServiceService additionalServiceService;

    @GetMapping("/active")
    public ResponseEntity<List<ServiceDTO>> getAllActiveServices() {
        return ResponseEntity.ok(additionalServiceService.getAllActiveServices());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ServiceDTO>> getAllServices() {
        return ResponseEntity.ok(additionalServiceService.getAllServices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceDTO> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(additionalServiceService.getServiceById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceDTO> createService(@RequestBody ServiceDTO serviceDTO) {
        return ResponseEntity.ok(additionalServiceService.createService(serviceDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceDTO> updateService(@PathVariable Long id, @RequestBody ServiceDTO serviceDTO) {
        return ResponseEntity.ok(additionalServiceService.updateService(id, serviceDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteService(@PathVariable Long id) {
        additionalServiceService.deleteService(id);
        return ResponseEntity.ok("Service deleted successfully");
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<BookingServiceDTO>> getServicesByBookingId(@PathVariable Long bookingId) {
        return ResponseEntity.ok(additionalServiceService.getServicesByBookingId(bookingId));
    }

    @PostMapping("/booking/{bookingId}")
    public ResponseEntity<BookingServiceDTO> addServiceToBooking(@PathVariable Long bookingId,
                                                                 @RequestBody AddServiceToBookingRequest request) {
        return ResponseEntity.ok(additionalServiceService.addServiceToBooking(bookingId, request));
    }

    @PutMapping("/booking-service/{bookingServiceId}")
    public ResponseEntity<BookingServiceDTO> updateBookingServiceQuantity(@PathVariable Long bookingServiceId,
                                                                          @RequestParam Integer quantity) {
        return ResponseEntity.ok(additionalServiceService.updateBookingServiceQuantity(bookingServiceId, quantity));
    }

    @DeleteMapping("/booking-service/{bookingServiceId}")
    public ResponseEntity<String> removeServiceFromBooking(@PathVariable Long bookingServiceId) {
        additionalServiceService.removeServiceFromBooking(bookingServiceId);
        return ResponseEntity.ok("Service removed successfully");
    }
}
