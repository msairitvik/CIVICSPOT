package com.civicspot.controller;

import com.civicspot.model.*;
import com.civicspot.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final FacilityRepository facilityRepository;
    private final FacilityReportRepository reportRepository;
    private final ComplaintRepository complaintRepository;
    private final AgentExecutionLogRepository logRepository;

    public AdminController(
            UserRepository userRepository,
            FacilityRepository facilityRepository,
            FacilityReportRepository reportRepository,
            ComplaintRepository complaintRepository,
            AgentExecutionLogRepository logRepository) {
        this.userRepository = userRepository;
        this.facilityRepository = facilityRepository;
        this.reportRepository = reportRepository;
        this.complaintRepository = complaintRepository;
        this.logRepository = logRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminSummary() {
        Map<String, Object> map = new HashMap<>();
        map.put("totalCitizens", userRepository.count());
        map.put("totalFacilities", facilityRepository.count());
        map.put("totalReports", reportRepository.count());
        map.put("pendingReports", reportRepository.countByStatus("SUBMITTED"));
        map.put("totalComplaints", complaintRepository.count());
        map.put("activeComplaints", complaintRepository.countByStatus("IN_PROGRESS") + complaintRepository.countByStatus("SUBMITTED"));
        map.put("resolvedComplaints", complaintRepository.countByStatus("RESOLVED"));
        return ResponseEntity.ok(map);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/facilities")
    public ResponseEntity<List<Facility>> getAllFacilities() {
        return ResponseEntity.ok(facilityRepository.findAll());
    }

    @GetMapping("/reports")
    public ResponseEntity<List<FacilityReport>> getAdminReports() {
        return ResponseEntity.ok(reportRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<Complaint>> getAdminComplaints() {
        return ResponseEntity.ok(complaintRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/logs")
    public ResponseEntity<List<AgentExecutionLog>> getAgentExecutionLogs() {
        return ResponseEntity.ok(logRepository.findAllByOrderByTimestampDesc());
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;

        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("javaVersion", System.getProperty("java.version"));
        health.put("activeThreads", Thread.activeCount());
        health.put("usedMemoryMB", usedMemory / (1024 * 1024));
        health.put("totalMemoryMB", totalMemory / (1024 * 1024));
        health.put("geminiStatus", "OPERATIONAL");
        health.put("routingService", "OSRM & Geodesic Fallback Active");
        return ResponseEntity.ok(health);
    }
}
