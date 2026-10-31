package com.larose.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.larose.dto.projection.RoomsProjection;
import com.larose.dto.request.RoomRequest;
import com.larose.dto.response.RoomImageResponse;
import com.larose.dto.response.RoomResponse;
import com.larose.dto.response.RoomTypeResponse;
import com.larose.dto.search.RoomSearchDto;
import com.larose.entity.Room;
import com.larose.entity.RoomImage;
import com.larose.entity.RoomType;
import com.larose.exception.NotFoundException;
import com.larose.maptruct.RoomMapper;
import com.larose.repository.RoomImageRepository;
import com.larose.repository.RoomRepository;
import com.larose.repository.RoomTypeRepository;
import com.larose.util.FileUploadUtil;
import lombok.AccessLevel;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomService {
    RoomRepository roomRepository;
    RoomImageRepository roomImageRepository;
    RoomTypeRepository roomTypeRepository;
    RoomMapper roomMapper;
    FileUploadUtil fileUploadUtil;
    ObjectMapper objectMapper;

    public Page<RoomResponse> getRooms(@NonNull RoomSearchDto request) {
        Pageable pageable = PageRequest.of(request.getPageIndex(), request.getPageSize());
        Page<RoomsProjection> roomPage = roomRepository.getRooms(request, pageable);

        List<Long> roomIds = roomPage.stream()
                .map(RoomsProjection::getRoomId)
                .toList();

        List<RoomImage> images = roomImageRepository.findAllByRoomIdIn(roomIds);

        Map<Long, List<RoomImageResponse>> imagesMap = images.stream()
                .map(img -> RoomImageResponse.builder()
                        .id(img.getId())
                        .url(img.getUrl())
                        .isPrimary(img.getIsPrimary())
                        .roomId(img.getRoom().getId())
                        .build())
                .collect(Collectors.groupingBy(RoomImageResponse::getRoomId));

        List<RoomResponse> responses = roomPage.stream()
                .map(r -> {
                    Map<String, Object> amenitiesMap = new HashMap<>();
                    String amenitiesJson = r.getRoomAmenities();
                    if (amenitiesJson != null && !amenitiesJson.trim().isEmpty()) {
                        try {
                            amenitiesMap = objectMapper.readValue(amenitiesJson, new TypeReference<Map<String, Object>>() {});
                        } catch (JsonProcessingException e) {
                            log.warn("Room {} có amenities JSON không hợp lệ: {}", r.getRoomId(), e.getMessage());
                        }
                    }
                    return RoomResponse.fromProjection(r, amenitiesMap, imagesMap.getOrDefault(r.getRoomId(), new ArrayList<>()));
                })
                .toList();

        return new PageImpl<>(responses, pageable, roomPage.getTotalElements());
    }

    public RoomResponse findById(Long id) {
        return roomMapper.toResponse(getRoomById(id));
    }

    public List<RoomTypeResponse> getRoomType() {
        List<RoomType> getAll = roomTypeRepository.findAll();
        return getAll.stream()
                .map(this::toRoomTypeResponse)
                .collect(Collectors.toList());
    }

    public Room getRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy phòng với id: " + id));
    }

    @Transactional
    public RoomResponse create(RoomRequest request, List<MultipartFile> images) {
        Room room = roomMapper.toEntity(request);

        Room genCode = roomRepository.getTop1();
        if (genCode == null) {
            room.setCode("RM1");
        } else {
            String code = genCode.getCode();
            room.setCode(code.substring(0, 2) + ((Integer.parseInt(code.substring(2))) + 1));
        }

        room.setRoomType(getRoomType(request.getRoomTypeId()));
        room = roomRepository.save(room);

        uploadImages(room, images);
        return roomMapper.toResponse(room);
    }

    @Transactional
    public RoomResponse update(RoomRequest request, List<MultipartFile> images) {
        Room room = getRoomByCode(request.getCode());
        roomMapper.update(room, request);
        room.setRoomType(getRoomType(request.getRoomTypeId()));

        if (!CollectionUtils.isEmpty(request.getDeleteImages())) {
            List<RoomImage> deleteList = roomImageRepository.findAllByIdIn(request.getDeleteImages());
            for (RoomImage deletes : deleteList) {
                room.getImages().remove(deletes);
                if (deletes.getIsPrimary() && room.getImages().size() > 0) {
                    room.getImages().get(0).setIsPrimary(true);
                }
            }
        }
        room = roomRepository.save(room);
        uploadImages(room, images);
        return roomMapper.toResponse(room);
    }

    /** Xoá mềm phòng (đặt deleted_at). */
    @Transactional
    public void delete(String code) {
        Room room = getRoomByCode(code);
        room.setDeletedAt(LocalDateTime.now());
        roomRepository.save(room);
    }

    private Room getRoomByCode(String code) {
        return roomRepository.findByCode(code)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy phòng với mã: " + code));
    }

    private RoomType getRoomType(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Thiếu loại phòng");
        }
        return roomTypeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy loại phòng với id: " + id));
    }

    private void uploadImages(Room room, List<MultipartFile> newImages) {
        if (CollectionUtils.isEmpty(newImages)) return;

        List<RoomImage> existingImages = roomImageRepository.findByRoomId(room.getId());
        boolean hasPrimary = existingImages.stream().anyMatch(RoomImage::getIsPrimary);

        List<RoomImage> imgs = new ArrayList<>();
        for (int i = 0; i < newImages.size(); i++) {
            MultipartFile file = newImages.get(i);
            if (file.isEmpty()) continue;

            String url = fileUploadUtil.uploadFile(file);
            RoomImage img = new RoomImage();
            img.setRoom(room);
            img.setUrl(url);
            img.setIsPrimary(!hasPrimary && i == 0);
            imgs.add(img);
        }
        roomImageRepository.saveAll(imgs);
    }

    private RoomTypeResponse toRoomTypeResponse(RoomType roomType) {
        RoomTypeResponse response = new RoomTypeResponse();
        response.setId(roomType.getId());
        response.setName(roomType.getName());
        response.setShortDescription(roomType.getShortDescription());
        response.setMaxGuests(roomType.getMaxGuests());
        response.setBasePrice(roomType.getBasePrice());
        return response;
    }
}