package com.civicspot.service;

import com.civicspot.dto.ReportDto;
import com.civicspot.model.Facility;
import com.civicspot.model.FacilityReport;
import com.civicspot.model.User;
import com.civicspot.repository.FacilityReportRepository;
import com.civicspot.repository.FacilityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class CitizenReportService {

    private final FacilityReportRepository reportRepository;
    private final FacilityRepository facilityRepository;
    private final GeminiAiService geminiAiService;

    public CitizenReportService(
            FacilityReportRepository reportRepository,
            FacilityRepository facilityRepository,
            GeminiAiService geminiAiService) {
        this.reportRepository = reportRepository;
        this.facilityRepository = facilityRepository;
        this.geminiAiService = geminiAiService;
    }

    @Transactional
    public ReportDto.ReportResponse createReport(User user, ReportDto.CreateReportRequest req) {
        FacilityReport report = new FacilityReport();
        report.setUser(user);
        report.setIssueCategory(req.issueCategory() != null ? req.issueCategory() : "OTHER");
        report.setDescription(req.description());
        report.setLatitude(req.latitude());
        report.setLongitude(req.longitude());
        report.setAddress(req.address());
        report.setSeverity(req.severity() != null ? req.severity() : "MEDIUM");
        report.setImageUrl(req.imageBase64());
        report.setStatus("SUBMITTED");

        if (req.facilityId() != null) {
            facilityRepository.findById(req.facilityId()).ifPresent(f -> {
                report.setFacility(f);
                report.setFacilityName(f.getName());
            });
        } else if (req.facilityName() != null) {
            report.setFacilityName(req.facilityName());
        }

        // Run AI assessment if image or description present
        if (req.aiAssessment() != null && !req.aiAssessment().isBlank()) {
            report.setAiAssessment(req.aiAssessment());
        } else if (req.imageBase64() != null || req.description() != null) {
            var aiResponse = geminiAiService.generateContent(
                    "You are CIVIC AI automated inspection engine. Evaluate the reported civic issue severity and risk concisely.",
                    req.description() != null ? req.description() : "Analyze civic issue",
                    false,
                    req.imageBase64(),
                    "image/jpeg"
            );
            report.setAiAssessment(aiResponse.text());
        }

        FacilityReport savedReport = reportRepository.save(report);
        return ReportDto.ReportResponse.fromEntity(savedReport);
    }

    public List<ReportDto.ReportResponse> getUserReports(User user) {
        return reportRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(ReportDto.ReportResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ReportDto.ReportResponse> getAllReports(String status) {
        List<FacilityReport> list = (status != null && !status.isBlank())
                ? reportRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase())
                : reportRepository.findAllByOrderByCreatedAtDesc();

        return list.stream()
                .map(ReportDto.ReportResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ReportDto.ReportResponse getReportById(Long id) {
        FacilityReport r = reportRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Report not found with ID: " + id));
        return ReportDto.ReportResponse.fromEntity(r);
    }

    @Transactional
    public ReportDto.ReportResponse updateReportStatus(Long id, ReportDto.UpdateReportStatusRequest req) {
        FacilityReport r = reportRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Report not found with ID: " + id));

        if (req.status() != null && !req.status().isBlank()) {
            r.setStatus(req.status().toUpperCase());
        }
        if (req.adminNotes() != null) {
            r.setAdminNotes(req.adminNotes());
        }

        r = reportRepository.save(r);
        return ReportDto.ReportResponse.fromEntity(r);
    }
}
