package com.civicspot.dto;

import com.civicspot.model.FacilityReport;
import java.time.Instant;

public class ReportDto {

    public record CreateReportRequest(
            Long facilityId,
            String facilityName,
            String issueCategory,
            Double latitude,
            Double longitude,
            String address,
            String description,
            String severity,
            String imageBase64,
            String aiAssessment
    ) {}

    public record ReportResponse(
            Long id,
            Long facilityId,
            String facilityName,
            Long userId,
            String userName,
            String issueCategory,
            Double latitude,
            Double longitude,
            String address,
            String description,
            String severity,
            String imageUrl,
            String aiAssessment,
            String status,
            String adminNotes,
            Instant createdAt,
            Instant updatedAt
    ) {
        public static ReportResponse fromEntity(FacilityReport r) {
            return new ReportResponse(
                    r.getId(),
                    r.getFacility() != null ? r.getFacility().getId() : null,
                    r.getFacilityName(),
                    r.getUser() != null ? r.getUser().getId() : null,
                    r.getUser() != null ? r.getUser().getName() : "Anonymous Citizen",
                    r.getIssueCategory(),
                    r.getLatitude(),
                    r.getLongitude(),
                    r.getAddress(),
                    r.getDescription(),
                    r.getSeverity(),
                    r.getImageUrl(),
                    r.getAiAssessment(),
                    r.getStatus(),
                    r.getAdminNotes(),
                    r.getCreatedAt(),
                    r.getUpdatedAt()
            );
        }
    }

    public record UpdateReportStatusRequest(
            String status,
            String adminNotes
    ) {}
}
