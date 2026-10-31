package com.larose.service;

import com.larose.dto.BookingServiceDTO;
import com.larose.dto.ServiceDTO;
import com.larose.dto.request.AddServiceToBookingRequest;
import com.larose.entity.Booking;
import com.larose.entity.BookingService;
import com.larose.entity.Service;
import com.larose.exception.NotFoundException;
import com.larose.repository.BookingRepository;
import com.larose.repository.BookingServiceRepository;
import com.larose.repository.ServiceRepository;
import com.larose.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdditionalServiceService {

    private final ServiceRepository serviceRepository;
    private final BookingServiceRepository bookingServiceRepository;
    private final BookingRepository bookingRepository;

    public List<ServiceDTO> getAllActiveServices() {
        return serviceRepository.findByIsActiveTrue().stream()
                .map(this::convertToServiceDTO)
                .collect(Collectors.toList());
    }

    public List<ServiceDTO> getAllServices() {
        return serviceRepository.findAll().stream()
                .map(this::convertToServiceDTO)
                .collect(Collectors.toList());
    }

    public ServiceDTO getServiceById(Long id) {
        return convertToServiceDTO(findService(id));
    }

    public List<BookingServiceDTO> getServicesByBookingId(Long bookingId) {
        SecurityUtils.checkOwnerOrAdmin(findBooking(bookingId).getUser());
        return bookingServiceRepository.findByBookingIdWithService(bookingId).stream()
                .map(this::convertToBookingServiceDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingServiceDTO addServiceToBooking(Long bookingId, AddServiceToBookingRequest request) {
        Booking booking = findBooking(bookingId);
        SecurityUtils.checkOwnerOrAdmin(booking.getUser());
        if (request.getServiceId() == null) {
            throw new IllegalArgumentException("Thiếu mã dịch vụ");
        }
        Service service = findService(request.getServiceId());
        if (!Boolean.TRUE.equals(service.getIsActive())) {
            throw new IllegalArgumentException("Dịch vụ đang tạm ngưng");
        }
        int quantity = request.getQuantity() != null ? request.getQuantity() : 1;
        if (quantity <= 0) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }

        // Create booking service
        BookingService bookingService = BookingService.builder()
                .booking(booking)
                .service(service)
                .quantity(quantity)
                .pricePerUnit(service.getPrice())
                .notes(request.getNotes())
                .build();

        // totalPrice được tính trong @PrePersist
        return convertToBookingServiceDTO(bookingServiceRepository.save(bookingService));
    }

    @Transactional
    public BookingServiceDTO updateBookingServiceQuantity(Long bookingServiceId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }
        BookingService bookingService = findBookingService(bookingServiceId);

        bookingService.setQuantity(quantity);
        bookingService.setTotalPrice(bookingService.getPricePerUnit().multiply(BigDecimal.valueOf(quantity)));

        return convertToBookingServiceDTO(bookingServiceRepository.save(bookingService));
    }

    @Transactional
    public void removeServiceFromBooking(Long bookingServiceId) {
        bookingServiceRepository.delete(findBookingService(bookingServiceId));
    }

    @Transactional
    public ServiceDTO createService(ServiceDTO serviceDTO) {
        if (serviceDTO.getName() == null || serviceDTO.getName().isBlank() || serviceDTO.getPrice() == null) {
            throw new IllegalArgumentException("Tên và giá dịch vụ là bắt buộc");
        }
        Service service = Service.builder()
                .name(serviceDTO.getName())
                .description(serviceDTO.getDescription())
                .price(serviceDTO.getPrice())
                .unit(serviceDTO.getUnit())
                .isActive(serviceDTO.getIsActive() != null ? serviceDTO.getIsActive() : true)
                .imageUrl(serviceDTO.getImageUrl())
                .category(parseCategory(serviceDTO.getCategory() != null ? serviceDTO.getCategory() : "OTHER"))
                .build();

        return convertToServiceDTO(serviceRepository.save(service));
    }

    @Transactional
    public ServiceDTO updateService(Long id, ServiceDTO serviceDTO) {
        Service service = findService(id);
        if (serviceDTO.getName() != null) {
            service.setName(serviceDTO.getName());
        }
        if (serviceDTO.getDescription() != null) {
            service.setDescription(serviceDTO.getDescription());
        }
        if (serviceDTO.getPrice() != null) {
            service.setPrice(serviceDTO.getPrice());
        }
        if (serviceDTO.getUnit() != null) {
            service.setUnit(serviceDTO.getUnit());
        }
        if (serviceDTO.getIsActive() != null) {
            service.setIsActive(serviceDTO.getIsActive());
        }
        if (serviceDTO.getImageUrl() != null) {
            service.setImageUrl(serviceDTO.getImageUrl());
        }
        if (serviceDTO.getCategory() != null) {
            service.setCategory(parseCategory(serviceDTO.getCategory()));
        }

        return convertToServiceDTO(serviceRepository.save(service));
    }

    @Transactional
    public void deleteService(Long id) {
        Service service = findService(id);
        if (bookingServiceRepository.existsByServiceId(id)) {
            throw new IllegalStateException("Dịch vụ đã được dùng trong booking, hãy chuyển sang tạm ngưng thay vì xoá");
        }
        serviceRepository.delete(service);
    }

    private Service findService(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dịch vụ với id: " + id));
    }

    private Booking findBooking(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với id: " + bookingId));
    }

    /** Dịch vụ trong booking: kèm kiểm tra người gọi là chủ booking hoặc ADMIN. */
    private BookingService findBookingService(Long bookingServiceId) {
        BookingService bookingService = bookingServiceRepository.findById(bookingServiceId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy dịch vụ đã đặt với id: " + bookingServiceId));
        SecurityUtils.checkOwnerOrAdmin(bookingService.getBooking().getUser());
        return bookingService;
    }

    private Service.ServiceCategory parseCategory(String category) {
        try {
            return Service.ServiceCategory.valueOf(category.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Loại dịch vụ không hợp lệ: " + category);
        }
    }

    private ServiceDTO convertToServiceDTO(Service service) {
        return ServiceDTO.builder()
                .id(service.getId())
                .name(service.getName())
                .description(service.getDescription())
                .price(service.getPrice())
                .unit(service.getUnit())
                .isActive(service.getIsActive())
                .imageUrl(service.getImageUrl())
                .category(service.getCategory().name())
                .createdAt(service.getCreatedAt())
                .updatedAt(service.getUpdatedAt())
                .build();
    }

    private BookingServiceDTO convertToBookingServiceDTO(BookingService bookingService) {
        BookingServiceDTO dto = BookingServiceDTO.builder()
                .id(bookingService.getId())
                .bookingId(bookingService.getBooking().getId())
                .serviceId(bookingService.getService().getId())
                .quantity(bookingService.getQuantity())
                .pricePerUnit(bookingService.getPricePerUnit())
                .totalPrice(bookingService.getTotalPrice())
                .notes(bookingService.getNotes())
                .createdAt(bookingService.getCreatedAt())
                .updatedAt(bookingService.getUpdatedAt())
                .build();

        // Add service details
        if (bookingService.getService() != null) {
            dto.setServiceName(bookingService.getService().getName());
            dto.setServiceDescription(bookingService.getService().getDescription());
            dto.setServiceImageUrl(bookingService.getService().getImageUrl());
        }

        return dto;
    }
}

