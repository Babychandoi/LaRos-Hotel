package com.larose.maptruct;

import com.larose.dto.BookingServiceDTO;
import com.larose.entity.BookingService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BookingServiceMapper {
    
    @Mapping(target = "bookingId", source = "booking.id")
    @Mapping(target = "serviceId", source = "service.id")
    @Mapping(target = "serviceName", source = "service.name")
    @Mapping(target = "serviceDescription", source = "service.description")
    @Mapping(target = "serviceImageUrl", source = "service.imageUrl")
    BookingServiceDTO toDTO(BookingService bookingService);
}
