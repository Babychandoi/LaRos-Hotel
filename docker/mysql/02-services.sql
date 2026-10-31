-- =====================================================================
-- La Rosé - bổ sung schema cho MySQL 8 sau khi nạp data.sql (01-data.sql).
-- docker-entrypoint chạy file này 1 lần trên DB rỗng, trong database MYSQL_DATABASE (la_rose).
--  1. Bảng dịch vụ bổ sung: services, booking_services (+ dữ liệu mẫu).
--  2. Vá các cột/kiểu lệch giữa data.sql và entity JPA (spring.jpa.hibernate.ddl-auto=none).
-- =====================================================================
SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- 1. Dịch vụ bổ sung (entity Service, BookingService)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `services` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(12,2) NOT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('FOOD','BEVERAGE','SPA','TRANSPORT','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OTHER',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_services_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FK phải cùng kiểu với bookings.id (bigint unsigned) nếu không MySQL báo lỗi 3780.
-- Xoá dịch vụ đang được dùng bị chặn (RESTRICT); BE trả 409 và gợi ý chuyển sang tạm ngưng.
CREATE TABLE IF NOT EXISTS `booking_services` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `service_id` bigint unsigned NOT NULL,
  `quantity` int unsigned NOT NULL DEFAULT '1',
  `price_per_unit` decimal(12,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bs_booking` (`booking_id`),
  KEY `idx_bs_service` (`service_id`),
  CONSTRAINT `fk_bs_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bs_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `services` (`name`, `description`, `price`, `unit`, `is_active`, `category`) VALUES
('Ăn sáng buffet', 'Bữa sáng buffet phong phú với nhiều món Á - Âu', 150000.00, 'người/bữa', 1, 'FOOD'),
('Ăn sáng phòng', 'Bữa sáng phục vụ tại phòng', 200000.00, 'người/bữa', 1, 'FOOD'),
('Spa massage toàn thân', 'Dịch vụ massage toàn thân thư giãn 90 phút', 500000.00, 'người/lần', 1, 'SPA'),
('Spa chăm sóc da mặt', 'Chăm sóc da mặt chuyên sâu 60 phút', 400000.00, 'người/lần', 1, 'SPA'),
('Đưa đón sân bay', 'Dịch vụ đưa đón sân bay bằng xe riêng', 300000.00, 'lượt', 1, 'TRANSPORT'),
('Thuê xe máy', 'Thuê xe máy theo ngày', 150000.00, 'xe/ngày', 1, 'TRANSPORT'),
('Giặt ủi', 'Dịch vụ giặt ủi quần áo', 50000.00, 'kg', 1, 'OTHER'),
('Minibar', 'Nước uống và đồ ăn nhẹ trong minibar', 100000.00, 'phần', 1, 'BEVERAGE');

-- ---------------------------------------------------------------------
-- 2. Vá lệch schema data.sql <-> entity
-- ---------------------------------------------------------------------
-- Review.images / Review.videos (mảng URL dạng JSON text) chưa có trong data.sql
-- -> mọi truy vấn reviews lỗi "Unknown column".
ALTER TABLE `reviews`
  ADD COLUMN `images` text COLLATE utf8mb4_unicode_ci NULL AFTER `content`,
  ADD COLUMN `videos` text COLLATE utf8mb4_unicode_ci NULL AFTER `images`;

-- RoomStatus có thêm 'cleaning' mà enum trong data.sql chưa có.
ALTER TABLE `rooms`
  MODIFY COLUMN `status` enum('available','maintenance','offline','cleaning') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available';
