package com.civicspot.dto;

import com.civicspot.model.Complaint;
import com.civicspot.model.ComplaintEvidence;

import java.time.Instant;
import java.util.List;

public class ComplaintDto {

    public record CreateComplaintRequest(
            String title,
            String category,
            String description,
            Double latitude,
            Double longitude,
            String address,
            String department,
            String priority,
            String imageBase64,
            String aiAssessment
    ) {}

    public record ComplaintEvidenceDto(
            Long id,
            String imageUrl,
            String aiAnalysis,
            Instant uploadedAt
    ) {
        public static ComplaintEvidenceDto fromEntity(ComplaintEvidence e) {
            return new ComplaintEvidenceDto(e.getId(), e.getImageUrl(), e.getAiAnalysis(), e.getUploadedAt());
        }
    }

    public record ComplaintResponse(
            Long id,
            String trackingNumber,
            Long userId,
            String userName,
            String title,
            String category,
            String description,
            Double latitude,
            Double longitude,
            String address,
            String department,
            String priority,
            String status,
            List<ComplaintEvidenceDto> evidence,
            String statusHistory,
            String resolutionNotes,
            Instant createdAt,
            Instant updatedAt
    ) {
        public static ComplaintResponse fromEntity(Complaint c) {
            List<ComplaintEvidenceDto> evidenceDtos = c.getEvidenceList() != null
                    ? c.getEvidenceList().stream().map(ComplaintEvidenceDto::fromEntity).toList()
                    : List.of();

            return new ComplaintResponse(
                    c.getId(),
                    c.getTrackingNumber(),
                    c.getUser() != null ? c.getUser().getId() : null,
                    c.getUser() != null ? c.getUser().getName() : "Citizen",
                    c.getTitle(),
                    c.getCategory(),
                    c.getDescription(),
                    c.getLatitude(),
                    c.getLongitude(),
                    c.getAddress(),
                    c.getDepartment(),
                    c.getPriority(),
                    c.getStatus(),
                    evidenceDtos,
                    c.getStatusHistory(),
                    c.getResolutionNotes(),
                    c.getCreatedAt(),
                    c.getUpdatedAt()
            );
        }
    }

    public record UpdateComplaintStatusRequest(
            String status,
            String resolutionNotes
    ) {}
}
