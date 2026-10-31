package com.larose.controller;

import com.larose.dto.DailyRevenueDto;
import com.larose.dto.OccupancyRateDto;
import com.larose.dto.WeeklyRevenueDto;
import com.larose.service.StatisticalService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/statistical")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class StatisticalController {
    private final StatisticalService statisticalService;

    @GetMapping("/rooms/total")
    public ResponseEntity<Long> countAllRooms() {
        return ResponseEntity.ok(statisticalService.countAllRooms());
    }

    @GetMapping("/rooms/booked")
    public ResponseEntity<Long> countRoomsHasBeenBooked(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate minDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate maxDate
    ) {
        return ResponseEntity.ok(statisticalService.countRoomsHasBeenBooked(minDate, maxDate));
    }

    @GetMapping("/revenue")
    public ResponseEntity<BigDecimal> sumTotalPrice(
            @RequestParam(required = false) Integer days,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(statisticalService.sumTotalPrice(days, startDate, endDate));
    }

    @GetMapping("/revenue/daily")
    public ResponseEntity<List<DailyRevenueDto>> getDailyRevenue(
            @RequestParam(required = false) Integer days,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(statisticalService.getDailyRevenue(days, startDate, endDate));
    }

    @GetMapping("/revenue/weekly")
    public ResponseEntity<List<WeeklyRevenueDto>> getWeeklyRevenue(@RequestParam(required = false) Integer weeks) {
        return ResponseEntity.ok(statisticalService.getWeeklyRevenue(weeks));
    }

    @GetMapping("/occupancy-rate")
    public ResponseEntity<OccupancyRateDto> getOccupancyRate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate minDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate maxDate) {
        return ResponseEntity.ok(statisticalService.getOccupancyRate(minDate, maxDate));
    }
}