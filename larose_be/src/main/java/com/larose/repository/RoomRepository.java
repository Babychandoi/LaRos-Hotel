package com.larose.repository;

import com.larose.dto.projection.RoomsProjection;
import com.larose.dto.search.RoomSearchDto;
import com.larose.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

	@Query(value = """
		    SELECT 
		        r.id as room_id,
		        r.code as room_code,
		        r.title as room_title,
		        r.price as room_price,
		        r.status as room_status,
		        r.capacity as room_capacity,
		        r.amenities as room_amenities,
		        r.created_at as room_created_at,
		        r.deleted_at as room_deleted_at,
		        r.updated_at as room_updated_at,
		        r.description as room_description,
		    
		        t.id as type_id,
		        t.name as type_name,
		        t.short_description as type_short_description,
		        t.base_price as base_price
		    FROM rooms r
		    LEFT JOIN room_types t ON r.room_type_id = t.id
		    WHERE r.deleted_at IS NULL
		      AND (:#{#request.minPrice} IS NULL OR r.price >= :#{#request.minPrice})
		      AND (:#{#request.maxPrice} IS NULL OR r.price <= :#{#request.maxPrice})
		      AND (:#{#request.typeId} IS NULL OR t.id = :#{#request.typeId})
		      AND (:#{#request.capacity} IS NULL OR r.capacity = :#{#request.capacity})
		      AND (:#{#request.keyword} IS NULL OR 
		           LOWER(r.code) LIKE LOWER(CONCAT('%', :#{#request.keyword}, '%')) OR
		           LOWER(r.title) LIKE LOWER(CONCAT('%', :#{#request.keyword}, '%')) OR
		           LOWER(r.description) LIKE LOWER(CONCAT('%', :#{#request.keyword}, '%')))
		    ORDER BY r.created_at DESC
		    """, 
		    countQuery = """
		        SELECT COUNT(*)
		        FROM rooms r
		        LEFT JOIN room_types t ON r.room_type_id = t.id
		        WHERE r.deleted_at IS NULL
		          AND (:#{#request.minPrice} IS NULL OR r.price >= :#{#request.minPrice})
		          AND (:#{#request.maxPrice} IS NULL OR r.price <= :#{#request.maxPrice})
		          AND (:#{#request.typeId} IS NULL OR t.id = :#{#request.typeId})
		          AND (:#{#request.capacity} IS NULL OR r.capacity = :#{#request.capacity})
		          AND (:#{#request.keyword} IS NULL OR 
		               LOWER(r.code) LIKE LOWER(CONCAT('%', :#{#request.keyword}, '%')) OR
		               LOWER(r.title) LIKE LOWER(CONCAT('%', :#{#request.keyword}, '%')) OR
		               LOWER(r.description) LIKE LOWER(CONCAT('%', :#{#request.keyword}, '%')))
		        """,
		    nativeQuery = true)
		Page<RoomsProjection> getRooms(RoomSearchDto request, Pageable pageable);
    Optional<Room> findByCode(String code);

    @Query(value = """
            SELECT * FROM rooms ORDER BY rooms.id DESC LIMIT 1
            """, nativeQuery = true)
    Room getTop1();

    long countByDeletedAtIsNull();
}
