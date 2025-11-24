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

        // Tính tổng doanh thu dịch vụ
        BigDecimal totalServiceRevenue = BigDecimal.ZERO;
        for (Booking booking : completedBookings) {
            if (booking.getBookingServices() != null) {
                for (BookingService service : booking.getBookingServices()) {
                    BigDecimal serviceAmount = service.getPrice()
                            .multiply(new BigDecimal(service.getQuantity()));
                    totalServiceRevenue = totalServiceRevenue.add(serviceAmount);
                }
            }
        }

        // Tính tổng doanh thu phòng từ transactions thành công
        List<Transaction> successTransactions = transactionRepository.findAllByStatusAndCreatedAtBetween(
                Transaction.Status.success,
                startDate.atStartOfDay(),
                endDate.atTime(23, 59, 59)
        );

        BigDecimal totalRoomRevenue = successTransactions.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

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
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

        for (XWPFParagraph paragraph : document.getParagraphs()) {
            List<XWPFRun> runs = paragraph.getRuns();
            if (runs != null) {
                for (XWPFRun run : runs) {
                    String text = run.getText(0);
                    if (text != null) {
                        text = text.replace("{kithue}", data.kithue);
                        text = text.replace("{khoanchi}", currencyFormat.format(data.khoanchi));
                        text = text.replace("{vatkhoanchi}", currencyFormat.format(data.vatkhoanchi));
                        text = text.replace("{tongkhoanchi}", currencyFormat.format(data.tongkhoanchi));
                        text = text.replace("{doanhthudichvu}", currencyFormat.format(data.doanhthudichvu));
                        text = text.replace("{tongdoanhthudichvu}", currencyFormat.format(data.tongdoanhthudichvu));
                        text = text.replace("{vatdoanhthudichvu}", currencyFormat.format(data.vatdoanhthudichvu));
                        text = text.replace("{doanhthu}", currencyFormat.format(data.doanhthu));
                        text = text.replace("{vatdoanhthu}", currencyFormat.format(data.vatdoanhthu));
                        run.setText(text, 0);
                    }
                }
            }
        }
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
