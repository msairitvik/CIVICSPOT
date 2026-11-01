package com.civicspot.dto;

import com.civicspot.model.Facility;
import com.civicspot.model.FacilityCategory;
import com.civicspot.model.FacilityReview;

import java.time.Instant;
import java.util.List;

public class FacilityDto {

    public record FacilityResponse(
            Long id,
            String name,
            FacilityCategory category,
            Double latitude,
            Double longitude,
            String address,
            String area,
            boolean isAccessible,
            boolean hasRamp,
            boolean isFree,
            String fee,
            String openingHours,
            String operationalStatus,
            Double cleanlinessRating,
            Integer totalReviews,
            String osmId,
            boolean verified,
            String source,
            String additionalDetails,
            Double distanceKm,
            Instant createdAt
    ) {
        public static FacilityResponse fromEntity(Facility f, Double distanceKm) {
            return new FacilityResponse(
                    f.getId(),
                    f.getName(),
                    f.getCategory(),
                    f.getLatitude(),
                    f.getLongitude(),
                    f.getAddress(),
                    f.getArea(),
                    f.isAccessible(),
                    f.isHasRamp(),
                    f.isFree(),
                    f.getFee(),
                    f.getOpeningHours(),
                    f.getOperationalStatus(),
                    f.getCleanlinessRating(),
                    f.getTotalReviews(),
                    f.getOsmId(),
                    f.isVerified(),
                    f.getSource(),
                    f.getAdditionalDetails(),
                    distanceKm,
                    f.getCreatedAt()
            );
        }
    }

    public record NearbySearchRequest(
            Double latitude,
            Double longitude,
            Double radiusKm,
            FacilityCategory category,
            Boolean accessibleOnly
    ) {}

    public record CreateFacilityRequest(
            String name,
            FacilityCategory category,
            Double latitude,
            Double longitude,
            String address,
            String area,
            Boolean isAccessible,
            Boolean hasRamp,
            Boolean isFree,
            String fee,
            String openingHours,
            String operationalStatus
    ) {}

    public record CreateReviewRequest(
            Integer rating,
            String cleanlinessLevel,
            String comment,
            String evidencePhotoUrl
    ) {}

    public record ReviewResponse(
            Long id,
            Long facilityId,
            String facilityName,
            Long userId,
            String userName,
            int rating,
            String cleanlinessLevel,
            String comment,
            String evidencePhotoUrl,
            Instant createdAt
    ) {
        public static ReviewResponse fromEntity(FacilityReview r) {
            return new ReviewResponse(
                    r.getId(),
                    r.getFacility().getId(),
                    r.getFacility().getName(),
                    r.getUser() != null ? r.getUser().getId() : null,
                    r.getUser() != null ? r.getUser().getName() : "Anonymous Citizen",
                    r.getRating(),
                    r.getCleanlinessLevel(),
                    r.getComment(),
                    r.getEvidencePhotoUrl(),
                    r.getCreatedAt()
            );
        }
    }

    public record FacilityRecommendation(
            FacilityResponse facility,
            double recommendationScore,
            String recommendationReason,
            List<String> keyStrengths,
            String statusNotice
    ) {}
}
