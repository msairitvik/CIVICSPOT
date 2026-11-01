package com.civicspot.controller;

import com.civicspot.dto.ReportDto;
import com.civicspot.model.User;
import com.civicspot.service.CitizenReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class CitizenReportController {

    private final CitizenReportService reportService;

    public CitizenReportController(CitizenReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<ReportDto.ReportResponse> createReport(
            @RequestBody ReportDto.CreateReportRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reportService.createReport(user, request));
    }

    @GetMapping
    public ResponseEntity<List<ReportDto.ReportResponse>> getAllReports(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(reportService.getAllReports(status));
    }

    @GetMapping("/user")
    public ResponseEntity<List<ReportDto.ReportResponse>> getUserReports(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(reportService.getUserReports(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportDto.ReportResponse> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ReportDto.ReportResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody ReportDto.UpdateReportStatusRequest request) {
        return ResponseEntity.ok(reportService.updateReportStatus(id, request));
    }
}
