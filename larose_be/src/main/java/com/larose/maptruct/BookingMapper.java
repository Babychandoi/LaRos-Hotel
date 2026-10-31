package com.larose.maptruct;

import com.larose.dto.BookingDTO;
import com.larose.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {BookingServiceMapper.class})
public interface BookingMapper {

    /** Chỉ lấy dữ liệu khách nhập; id, mã, trạng thái, quan hệ do service gán. */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "bookingCode", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "cancelReason", ignore = true)
    @Mapping(target = "cancelledAt", ignore = true)
    @Mapping(target = "policyApplied", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "roomType", ignore = true)
    @Mapping(target = "events", ignore = true)
    @Mapping(target = "bookingServices", ignore = true)
    Booking toBooking(BookingDTO bookingDTO);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "userFullName", source = "user.fullName")
    @Mapping(target = "roomId", source = "room.id")
    @Mapping(target = "roomCode", source = "room.code")
    @Mapping(target = "roomTitle", source = "room.title")
    @Mapping(target = "roomTypeId", source = "roomType.id")
    @Mapping(target = "roomTypeName", source = "roomType.name")
    BookingDTO toBookingDTO(Booking booking);
}
