package com.larose.controller.room;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.larose.dto.request.RoomRequest;
import com.larose.dto.response.RoomResponse;
import com.larose.dto.response.RoomTypeResponse;
import com.larose.dto.search.RoomSearchDto;
import com.larose.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<Page<RoomResponse>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Long typeId,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        RoomSearchDto searchDto = new RoomSearchDto();
        searchDto.setKeyword(keyword);
        searchDto.setMinPrice(minPrice);
        searchDto.setMaxPrice(maxPrice);
        searchDto.setTypeId(typeId);
        searchDto.setCapacity(capacity);
        searchDto.setPageIndex(page);
        searchDto.setPageSize(size);
        return ResponseEntity.ok(roomService.getRooms(searchDto));
    }

    @GetMapping("/types")
    public ResponseEntity<List<RoomTypeResponse>> getAllRoomTypes() {
        return ResponseEntity.ok(roomService.getRoomType());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.findById(id));
    }

    /** Tạo phòng: multipart gồm "roomRequest" (JSON) và "images" (tuỳ chọn). */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomResponse> create(
            @RequestParam("roomRequest") String roomRequestJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws JsonProcessingException {
        RoomRequest roomRequest = objectMapper.readValue(roomRequestJson, RoomRequest.class);
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.create(roomRequest, images));
    }

    @PutMapping(value = "/{code}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomResponse> update(
            @PathVariable String code,
            @RequestParam("roomRequest") String roomRequestJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws JsonProcessingException {
        RoomRequest roomRequest = objectMapper.readValue(roomRequestJson, RoomRequest.class);
        roomRequest.setCode(code);
        return ResponseEntity.ok(roomService.update(roomRequest, images));
    }

    @DeleteMapping("/{code}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String code) {
        roomService.delete(code);
        return ResponseEntity.noContent().build();
    }
}
