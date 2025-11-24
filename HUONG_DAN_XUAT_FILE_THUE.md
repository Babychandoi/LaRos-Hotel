# Hướng Dẫn Sử Dụng Tính Năng Xuất File Thuế VAT

## Tổng Quan

Tính năng xuất file thuế VAT cho phép admin xuất báo cáo thuế GTGT dựa trên dữ liệu doanh thu trong khoảng thời gian được chọn.

## Cách Sử Dụng

### 1. Truy cập Admin Dashboard
- Đăng nhập với tài khoản admin
- Vào trang Admin Dashboard

### 2. Chọn Khoảng Thời Gian
- Sử dụng date picker để chọn ngày bắt đầu và ngày kết thúc
- Hoặc sử dụng các nút xem nhanh: 7 ngày, 30 ngày, 90 ngày, Tháng này, Năm nay, Q1-Q4

### 3. Xuất File Thuế
- Click nút **"Xuất File Thuế"** (màu xanh dương)
- Hệ thống sẽ tính toán và hiển thị modal với dữ liệu thuế

### 4. Nhập Khoản Chi Tiêu
- Trong modal, nhập **Khoản chi tiêu** (giá trị hàng hoá, dịch vụ mua vào)
- Hệ thống tự động tính:
  - Thuế GTGT đầu vào (10% khoản chi)
  - Tổng khoản chi (khoản chi + thuế)

### 5. Xem Dữ Liệu Thuế
Modal hiển thị các thông tin:

#### Kỳ Thuế
- Khoảng thời gian đã chọn

#### Khoản Chi (Đầu Vào)
- Giá trị hàng hoá/dịch vụ mua vào (do người dùng nhập)
- Thuế GTGT (10%)
- Tổng cộng

#### Doanh Thu Dịch Vụ
- Doanh thu dịch vụ (từ các booking đã checkout)
- Thuế GTGT (10%)
- Tổng doanh thu dịch vụ

#### Doanh Thu Phòng
- Doanh thu phòng (từ transactions thành công)
- Thuế GTGT (10%)

#### Tổng Kết
- Tổng doanh thu (Phòng + Dịch vụ)
- Tổng thuế GTGT phải nộp (Thuế đầu ra - Thuế đầu vào)

### 6. Xuất File DOCX
- Sau khi kiểm tra dữ liệu, click **"Xuất File DOCX"**
- File sẽ được tải về với tên: `BaoCaoThue_DD-MM-YYYY_den_DD-MM-YYYY.docx`

## Công Thức Tính

### Thuế GTGT
- **Thuế suất:** 10%
- **Thuế đầu vào:** Khoản chi × 10%
- **Thuế đầu ra (Dịch vụ):** Doanh thu dịch vụ × 10%
- **Thuế đầu ra (Phòng):** Doanh thu phòng × 10%
- **Thuế phải nộp:** (Thuế đầu ra dịch vụ + Thuế đầu ra phòng) - Thuế đầu vào

### Doanh Thu Dịch Vụ
- Tính từ các booking có status = `checked_out`
- Trong khoảng thời gian `check_out` từ startDate đến endDate
- Tổng tiền các dịch vụ (bookingServices) của các booking này

### Doanh Thu Phòng
- Tính từ các transaction có status = `success`
- Trong khoảng thời gian `created_at` từ startDate đến endDate

## Lưu Ý

1. **Khoản chi phải được nhập thủ công** - Đây là giá trị thực tế của hàng hoá, dịch vụ mua vào
2. **Dữ liệu doanh thu tự động** - Được tính từ database
3. **File template** - Đã có sẵn trong backend tại `larose_be/src/main/resources/report/vat_report.docx`
4. **Yêu cầu đăng nhập** - Cần token xác thực để xuất file

## Cấu Trúc File Template

### File Template
- **Vị trí:** `larose_be/src/main/resources/report/vat_report.docx`
- **Lưu ý:** File này là template gốc và **KHÔNG BỊ THAY ĐỔI** khi xuất báo cáo

### Placeholder trong Template
File template DOCX sử dụng các placeholder:
- `{kithue}` - Khoảng thời gian
- `{khoanchi}` - Giá trị hàng hoá, dịch vụ mua vào
- `{vatkhoanchi}` - 10% của khoanchi
- `{tongkhoanchi}` - Tổng khoanchi + vatkhoanchi
- `{doanhthudichvu}` - Tổng tiền dịch vụ
- `{tongdoanhthudichvu}` - Tổng doanh thu dịch vụ
- `{vatdoanhthudichvu}` - 10% của doanhthudichvu
- `{doanhthu}` - Tổng doanh thu phòng
- `{vatdoanhthu}` - 10% của doanhthu

### Cách Hoạt Động
1. Backend đọc file template từ resources (`vat_report.docx`)
2. Tạo document trong bộ nhớ (RAM) - không ghi vào file gốc
3. Thay thế các placeholder bằng dữ liệu thực
4. Trả về file đã điền dữ liệu cho người dùng tải về
5. **File template gốc vẫn giữ nguyên** để sử dụng cho lần sau

## API Endpoints

### GET `/api/vat-report/export`
**Parameters:**
- `startDate` (required): LocalDate - Ngày bắt đầu
- `endDate` (required): LocalDate - Ngày kết thúc
- `khoanchi` (required): BigDecimal - Khoản chi tiêu

**Response:**
- File DOCX (application/octet-stream)

### POST `/api/vat-report/export`
**Body:**
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "khoanchi": 50000000
}
```

**Response:**
- File DOCX (application/octet-stream)

## Dependencies

### Backend
- Apache POI 5.2.3 (xử lý file DOCX)
- Spring Boot
- JPA/Hibernate

### Frontend
- Axios (gọi API)
- React
- TailwindCSS

## Troubleshooting

### Lỗi "Vui lòng nhập khoản chi tiêu hợp lệ"
- Đảm bảo đã nhập giá trị khoản chi > 0

### Lỗi "Không thể tải file"
- Kiểm tra kết nối backend
- Kiểm tra token xác thực
- Kiểm tra file template có tồn tại trong backend

### File template không tìm thấy
- Đảm bảo file `vat_report.docx` có trong `larose_be/src/main/resources/report/`
- Build lại project backend

## Ví Dụ

**Input:**
- Khoảng thời gian: 01/01/2025 - 31/01/2025
- Khoản chi: 50,000,000 VNĐ
- Doanh thu phòng: 200,000,000 VNĐ
- Doanh thu dịch vụ: 30,000,000 VNĐ

**Output:**
- Thuế đầu vào: 5,000,000 VNĐ (10% × 50M)
- Thuế đầu ra phòng: 20,000,000 VNĐ (10% × 200M)
- Thuế đầu ra dịch vụ: 3,000,000 VNĐ (10% × 30M)
- **Thuế phải nộp: 18,000,000 VNĐ** (23M - 5M)
