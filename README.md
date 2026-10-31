# La Rosé Hotel

Hệ thống đặt phòng khách sạn: website cho khách và trang quản trị.

| Thành phần | Công nghệ | Thư mục |
|---|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 | [La_Rose-main](La_Rose-main) |
| Backend | Spring Boot 3.5, Java 17, JWT, JPA | [larose_be](larose_be) |
| Database | MySQL 8 (dữ liệu mẫu: [data.sql](data.sql)) | [docker/mysql](docker/mysql) |

## Chạy bằng Docker (khuyến nghị)

```bash
# File .env đã điền sẵn (mật khẩu DB, JWT, mail, VNPay, Cloudinary, Gemini) nên clone về là chạy được
docker compose up --build
```

| Dịch vụ | Địa chỉ |
|---|---|
| Website khách | http://localhost:5173 |
| Trang quản trị | http://localhost:5173/admin |
| Backend API | http://localhost:8080 |
| MySQL | localhost:3307 (user `root`) |

MySQL tự nạp `data.sql` và `docker/mysql/02-services.sql` ở lần chạy đầu tiên. Muốn nạp lại dữ liệu từ đầu: `docker compose down -v`.

## Chạy trực tiếp (không Docker)

```bash
# Backend (cần JDK 17 và MySQL có database la_rose đã nạp data.sql + docker/mysql/02-services.sql)
cd larose_be && ./mvnw spring-boot:run

# Frontend
cd La_Rose-main && npm install && npm run dev
```

## Cấu hình

Backend đọc cấu hình từ [application.properties](larose_be/src/main/resources/application.properties); mọi giá trị có thể ghi đè bằng biến môi trường (ví dụ `DB_PASSWORD`, `JWT_SECRET`, `VNPAY_HASH_SECRET`; danh sách đầy đủ trong [.env.example](.env.example)). Frontend dùng `VITE_API_URL` (địa chỉ backend mà trình duyệt gọi). Trợ lý ảo (chatbot) gọi Gemini từ backend, cần đặt `GEMINI_API_KEY`; không đặt thì chatbot báo chưa được cấu hình.

Repo này là bài tập/demo nên file `.env` được commit sẵn cùng các khóa thử nghiệm. Nếu triển khai thật, hãy đổi toàn bộ bí mật và đưa `.env` vào `.gitignore`.
