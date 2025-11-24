package com.larose.service;

import com.larose.entity.Booking;
import com.larose.entity.BookingService;
import com.larose.entity.Transaction;
import com.larose.repository.BookingRepository;
import com.larose.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class VATReportService {
    private final BookingRepository bookingRepository;
    private final TransactionRepository transactionRepository;
    private static final BigDecimal VAT_RATE = new BigDecimal("0.10"); // 10%
    private static final BigDecimal EXPENSE_RATE = new BigDecimal("0.30"); // 30% doanh thu làm khoản chi

    public byte[] generateVATReport(LocalDate startDate, LocalDate endDate, BigDecimal khoanchi) throws Exception {
        // Tính toán dữ liệu
        VATData vatData = calculateVATData(startDate, endDate, khoanchi);

        // Load template từ resources (file gốc không bị thay đổi)
        ClassPathResource resource = new ClassPathResource("report/vat_report.docx");
        InputStream templateStream = resource.getInputStream();
        
        // Tạo document trong bộ nhớ từ template
        XWPFDocument document = new XWPFDocument(templateStream);

        // Thay thế các placeholder
        replacePlaceholders(document, vatData);

        // Chuyển document thành byte array để trả về
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        templateStream.close();

        // Trả về file đã điền dữ liệu (file gốc vẫn giữ nguyên)
        return outputStream.toByteArray();
    }

    private VATData calculateVATData(LocalDate startDate, LocalDate endDate, BigDecimal khoanchi) {
        VATData data = new VATData();

        // Format kỳ thuế
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        data.kithue = startDate.format(formatter) + " - " + endDate.format(formatter);

        // Lấy các booking đã hoàn trả (checked_out) trong khoảng thời gian
        List<Booking> completedBookings = bookingRepository.findByStatusAndCheckOutBetween(
                Booking.Status.checked_out,
                startDate,
                endDate
        );

        // Tính doanh thu từ booking đã trả phòng
        BigDecimal totalRoomRevenue = BigDecimal.ZERO;
        BigDecimal totalServiceRevenue = BigDecimal.ZERO;
        
        // Lưu danh sách booking ID đã trả phòng để loại trừ
        java.util.Set<Long> completedBookingIds = new java.util.HashSet<>();
        
        // 1. Doanh thu từ booking đã trả phòng (checked_out)
        for (Booking booking : completedBookings) {
            completedBookingIds.add(booking.getId());
            
            // Doanh thu phòng từ booking.priceTotal
            BigDecimal roomPrice = booking.getPriceTotal();
            if (roomPrice != null) {
                totalRoomRevenue = totalRoomRevenue.add(roomPrice);
            }
            
            // Doanh thu dịch vụ từ booking_services
            if (booking.getBookingServices() != null) {
                for (BookingService bookingService : booking.getBookingServices()) {
                    BigDecimal serviceAmount = bookingService.getTotalPrice();
                    if (serviceAmount != null) {
                        totalServiceRevenue = totalServiceRevenue.add(serviceAmount);
                    }
                }
            }
        }

        // 2. Doanh thu từ transactions (booking chưa trả nhưng đã thanh toán)
        // Loại trừ transactions của booking đã trả phòng
        List<Transaction> successTransactions = transactionRepository.findAllByStatusAndCreatedAtBetween(
                Transaction.Status.success,
                startDate.atStartOfDay(),
                endDate.atTime(23, 59, 59)
        );
        
        for (Transaction transaction : successTransactions) {
            Long bookingId = transaction.getBooking() != null ? transaction.getBooking().getId() : null;
            // Chỉ tính nếu booking chưa trả phòng
            if (bookingId != null && !completedBookingIds.contains(bookingId)) {
                BigDecimal amount = transaction.getAmount();
                if (amount != null) {
                    totalRoomRevenue = totalRoomRevenue.add(amount);
                }
            }
        }

        // Sử dụng khoản chi do người dùng nhập
        BigDecimal khoanchitieu = khoanchi != null ? khoanchi : BigDecimal.ZERO;

        // Gán giá trị
        data.khoanchi = khoanchitieu;
        data.vatkhoanchi = khoanchitieu.multiply(VAT_RATE);
        data.tongkhoanchi = khoanchitieu.add(data.vatkhoanchi);

        data.doanhthudichvu = totalServiceRevenue;
        data.vatdoanhthudichvu = totalServiceRevenue.multiply(VAT_RATE);
        data.tongdoanhthudichvu = totalServiceRevenue.add(data.vatdoanhthudichvu);

        data.doanhthu = totalRoomRevenue;
        data.vatdoanhthu = totalRoomRevenue.multiply(VAT_RATE);

        return data;
    }

    private void replacePlaceholders(XWPFDocument document, VATData data) {
        // Format số tiền không có ký hiệu tiền tệ, chỉ có dấu phân cách
        NumberFormat numberFormat = NumberFormat.getInstance(new Locale("vi", "VN"));
        numberFormat.setGroupingUsed(true);
        numberFormat.setMaximumFractionDigits(0);

        // Thay thế trong paragraphs
        for (XWPFParagraph paragraph : document.getParagraphs()) {
            replaceInParagraph(paragraph, data, numberFormat);
        }

        // Thay thế trong tables
        document.getTables().forEach(table -> {
            table.getRows().forEach(row -> {
                row.getTableCells().forEach(cell -> {
                    cell.getParagraphs().forEach(paragraph -> {
                        replaceInParagraph(paragraph, data, numberFormat);
                    });
                });
            });
        });
    }

    private void replaceInParagraph(XWPFParagraph paragraph, VATData data, NumberFormat numberFormat) {
        List<XWPFRun> runs = paragraph.getRuns();
        if (runs == null || runs.isEmpty()) {
            return;
        }

        // Ghép toàn bộ text của paragraph lại
        StringBuilder fullText = new StringBuilder();
        for (XWPFRun run : runs) {
            String text = run.getText(0);
            if (text != null) {
                fullText.append(text);
            }
        }

        String text = fullText.toString();
        
        // Kiểm tra xem có placeholder không
        if (!text.contains("{")) {
            return;
        }

        // Thay thế tất cả placeholders
        text = text.replace("{kithue}", data.kithue);
        text = text.replace("{khoanchi}", numberFormat.format(data.khoanchi));
        text = text.replace("{vatkhoanchi}", numberFormat.format(data.vatkhoanchi));
        text = text.replace("{tongkhoanchi}", numberFormat.format(data.tongkhoanchi));
        text = text.replace("{doanhthudichvu}", numberFormat.format(data.doanhthudichvu));
        text = text.replace("{tongdoanhthudichvu}", numberFormat.format(data.tongdoanhthudichvu));
        text = text.replace("{vatdoanhthudichvu}", numberFormat.format(data.vatdoanhthudichvu));
        text = text.replace("{doanhthu}", numberFormat.format(data.doanhthu));
        text = text.replace("{vatdoanhthu}", numberFormat.format(data.vatdoanhthu));

        // Xóa tất cả runs cũ trừ run đầu tiên
        for (int i = runs.size() - 1; i > 0; i--) {
            paragraph.removeRun(i);
        }

        // Ghi text đã thay thế vào run đầu tiên
        XWPFRun firstRun = runs.get(0);
        firstRun.setText(text, 0);
    }

    private static class VATData {
        String kithue;
        BigDecimal khoanchi;
        BigDecimal vatkhoanchi;
        BigDecimal tongkhoanchi;
        BigDecimal doanhthudichvu;
        BigDecimal tongdoanhthudichvu;
        BigDecimal vatdoanhthudichvu;
        BigDecimal doanhthu;
        BigDecimal vatdoanhthu;
    }
}
