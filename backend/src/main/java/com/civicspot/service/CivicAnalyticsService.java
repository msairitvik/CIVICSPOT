package com.civicspot.service;

import com.civicspot.dto.CivicAnalyticsDto;
import com.civicspot.model.Facility;
import com.civicspot.model.FacilityCategory;
import com.civicspot.repository.ComplaintRepository;
import com.civicspot.repository.FacilityReportRepository;
import com.civicspot.repository.FacilityRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CivicAnalyticsService {

    private final FacilityRepository facilityRepository;
    private final FacilityReportRepository reportRepository;
    private final ComplaintRepository complaintRepository;

    public CivicAnalyticsService(
            FacilityRepository facilityRepository,
            FacilityReportRepository reportRepository,
            ComplaintRepository complaintRepository) {
        this.facilityRepository = facilityRepository;
        this.reportRepository = reportRepository;
        this.complaintRepository = complaintRepository;
    }

    public CivicAnalyticsDto.OverviewAnalyticsResponse getOverviewAnalytics() {
        List<Facility> allFacilities = facilityRepository.findAll();
        long totalFacilities = allFacilities.size();
        long totalReports = reportRepository.count();
        long totalComplaints = complaintRepository.count();
        long resolvedComplaints = complaintRepository.countByStatus("RESOLVED");

        double avgCleanliness = allFacilities.stream()
                .filter(f -> f.getCleanlinessRating() != null)
                .mapToDouble(Facility::getCleanlinessRating)
                .average()
                .orElse(4.1);

        avgCleanliness = Math.round(avgCleanliness * 10.0) / 10.0;

        // Breakdown by category
        Map<FacilityCategory, Long> catCounts = allFacilities.stream()
                .collect(Collectors.groupingBy(Facility::getCategory, Collectors.counting()));

        List<CivicAnalyticsDto.CategoryCount> facilitiesByCategory = Arrays.stream(FacilityCategory.values())
                .filter(catCounts::containsKey)
                .map(cat -> new CivicAnalyticsDto.CategoryCount(cat.name(), catCounts.get(cat)))
                .collect(Collectors.toList());

        // Reports by status
        List<CivicAnalyticsDto.StatusCount> reportsByStatus = List.of(
                new CivicAnalyticsDto.StatusCount("SUBMITTED", reportRepository.countByStatus("SUBMITTED")),
                new CivicAnalyticsDto.StatusCount("UNDER_REVIEW", reportRepository.countByStatus("UNDER_REVIEW")),
                new CivicAnalyticsDto.StatusCount("IN_PROGRESS", reportRepository.countByStatus("IN_PROGRESS")),
                new CivicAnalyticsDto.StatusCount("RESOLVED", reportRepository.countByStatus("RESOLVED"))
        );

        // Complaints by status
        List<CivicAnalyticsDto.StatusCount> complaintsByStatus = List.of(
                new CivicAnalyticsDto.StatusCount("SUBMITTED", complaintRepository.countByStatus("SUBMITTED")),
                new CivicAnalyticsDto.StatusCount("UNDER_REVIEW", complaintRepository.countByStatus("UNDER_REVIEW")),
                new CivicAnalyticsDto.StatusCount("ACKNOWLEDGED", complaintRepository.countByStatus("ACKNOWLEDGED")),
                new CivicAnalyticsDto.StatusCount("IN_PROGRESS", complaintRepository.countByStatus("IN_PROGRESS")),
                new CivicAnalyticsDto.StatusCount("RESOLVED", complaintRepository.countByStatus("RESOLVED"))
        );

        // Reports by issue type
        List<CivicAnalyticsDto.CategoryCount> reportsByIssueType = List.of(
                new CivicAnalyticsDto.CategoryCount("DIRTY_TOILET", reportRepository.countByIssueCategory("DIRTY_TOILET")),
                new CivicAnalyticsDto.CategoryCount("OVERFLOWING_DUSTBIN", reportRepository.countByIssueCategory("OVERFLOWING_DUSTBIN")),
                new CivicAnalyticsDto.CategoryCount("BROKEN_INFRASTRUCTURE", reportRepository.countByIssueCategory("BROKEN_INFRASTRUCTURE")),
                new CivicAnalyticsDto.CategoryCount("NO_DRINKING_WATER", reportRepository.countByIssueCategory("NO_DRINKING_WATER")),
                new CivicAnalyticsDto.CategoryCount("ACCESSIBILITY_BARRIER", reportRepository.countByIssueCategory("ACCESSIBILITY_BARRIER")),
                new CivicAnalyticsDto.CategoryCount("OTHER", reportRepository.countByIssueCategory("OTHER"))
        );

        // Infrastructure Gaps
        List<CivicAnalyticsDto.InfrastructureGap> gaps = List.of(
                new CivicAnalyticsDto.InfrastructureGap(
                        "Charminar Heritage & Bazaar Corridor",
                        "Public Restroom with Ramp Accessibility",
                        8.8, 3.2, 8.5,
                        "High tourist footfall; nearest wheelchair accessible toilet is > 1.2 km away. Recommend modular smart e-toilet installation."
                ),
                new CivicAnalyticsDto.InfrastructureGap(
                        "Secunderabad Railway Terminal Perimeter",
                        "Continuous Potable Drinking Water Hub",
                        9.2, 4.0, 8.9,
                        "Substantial transit passenger volume; water ATM density insufficient during peak morning hours."
                ),
                new CivicAnalyticsDto.InfrastructureGap(
                        "Madhapur IT Express Commercial Corridor",
                        "Segregated Solid Waste Collection Points",
                        7.9, 4.5, 7.2,
                        "Rapid street vendor growth generating untreated dry/wet waste. 3 additional twin-bin stations recommended."
                ),
                new CivicAnalyticsDto.InfrastructureGap(
                        "Begumpet Metro - Greenlands Junction",
                        "Tactile Footpath & Accessible Pedestrian Ramp",
                        8.1, 2.8, 8.7,
                        "Significant accessibility obstruction between transit stop and hospital zone."
                )
        );

        return new CivicAnalyticsDto.OverviewAnalyticsResponse(
                totalFacilities,
                totalReports,
                totalComplaints,
                resolvedComplaints,
                avgCleanliness,
                facilitiesByCategory,
                reportsByStatus,
                complaintsByStatus,
                reportsByIssueType,
                gaps
        );
    }
}
