package com.larose.maptruct;

import com.larose.dto.request.RoomRequest;
import com.larose.dto.response.RoomImageResponse;
import com.larose.dto.response.RoomResponse;
import com.larose.entity.Room;
import com.larose.entity.RoomImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RoomMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roomType", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Room toEntity(RoomRequest request);

    @Mapping(target = "type", source = "roomType")
    RoomResponse toResponse(Room room);

    @Mapping(target = "roomId", source = "room.id")
    RoomImageResponse toImageResponse(RoomImage image);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roomType", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "deletedAt", ignore = true)
    void update(@MappingTarget Room room, RoomRequest request);
}
