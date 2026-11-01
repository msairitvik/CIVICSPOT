package com.civicspot.dto;

import java.util.List;
import java.util.Map;

public class CivicAnalyticsDto {

    public record CategoryCount(
            String category,
            Long count
    ) {}

    public record StatusCount(
            String status,
            Long count
    ) {}

    public record InfrastructureGap(
            String area,
            String missingFacilityType,
            Double populationDensityScore,
            Double currentCoverageScore,
            Double urgencyScore,
            String recommendation
    ) {}

    public record OverviewAnalyticsResponse(
            Long totalFacilities,
            Long totalReports,
            Long totalComplaints,
            Long resolvedComplaints,
            Double averageCleanlinessScore,
            List<CategoryCount> facilitiesByCategory,
            List<StatusCount> reportsByStatus,
            List<StatusCount> complaintsByStatus,
            List<CategoryCount> reportsByIssueType,
            List<InfrastructureGap> infrastructureGaps
    ) {}
}
