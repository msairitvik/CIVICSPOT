package com.civicspot.service;

import com.civicspot.dto.FacilityDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class FacilityRecommendationService {

    public List<FacilityDto.FacilityRecommendation> rankRecommendations(
            List<FacilityDto.FacilityResponse> facilities, int topN) {
        return rankRecommendations(facilities, null, topN);
    }

    public List<FacilityDto.FacilityRecommendation> rankRecommendations(
            List<FacilityDto.FacilityResponse> facilities, com.civicspot.model.FacilityCategory requiredCategory, int topN) {

        if (facilities == null || facilities.isEmpty()) {
            return List.of();
        }

        // STRICT MANDATORY CATEGORY FILTER: Scoring and ranking must NEVER introduce an excluded category
        return facilities.stream()
                .filter(f -> requiredCategory == null || f.category() == requiredCategory)
                .map(this::scoreFacility)
                .sorted(Comparator.comparingDouble(FacilityDto.FacilityRecommendation::recommendationScore).reversed())
                .limit(Math.max(1, topN))
                .toList();
    }

    private FacilityDto.FacilityRecommendation scoreFacility(FacilityDto.FacilityResponse f) {
        double score = 50.0; // Baseline
        List<String> strengths = new ArrayList<>();
        String statusNotice;

        // 1. Proximity score (Max 35 points)
        if (f.distanceKm() != null) {
            if (f.distanceKm() <= 0.5) {
                score += 35.0;
                strengths.add("Immediate walking distance (" + f.distanceKm() + " km)");
            } else if (f.distanceKm() <= 1.5) {
                score += 28.0;
                strengths.add("Short walk (" + f.distanceKm() + " km)");
            } else if (f.distanceKm() <= 3.0) {
                score += 20.0;
                strengths.add("Quick transit/drive (" + f.distanceKm() + " km)");
            } else if (f.distanceKm() <= 8.0) {
                score += 10.0;
                strengths.add("Within district radius (" + f.distanceKm() + " km)");
            } else {
                score += 5.0;
            }
        }

        // 2. Cleanliness & Reviews (Max 25 points)
        if (f.cleanlinessRating() != null && f.totalReviews() != null && f.totalReviews() > 0) {
            double cleanScore = (f.cleanlinessRating() / 5.0) * 20.0;
            score += cleanScore;
            if (f.cleanlinessRating() >= 4.0) {
                strengths.add("Citizen certified clean (" + String.format("%.1f", f.cleanlinessRating()) + "★)");
            }
            if (f.totalReviews() >= 5) {
                score += 5.0;
                strengths.add("Verified by " + f.totalReviews() + " citizen reviews");
            }
            statusNotice = "Rated " + String.format("%.1f", f.cleanlinessRating()) + "/5 based on " + f.totalReviews() + " citizen review(s)";
        } else {
            statusNotice = "Awaiting first citizen cleanliness review";
        }

        // 3. Accessibility (Max 15 points)
        if (f.isAccessible()) {
            score += 10.0;
            strengths.add("Wheelchair accessible entrance");
        }
        if (f.hasRamp()) {
            score += 5.0;
            strengths.add("Dedicated ramp access");
        }

        // 4. Free vs Paid (Max 10 points)
        if (f.isFree()) {
            score += 10.0;
            strengths.add("Free public access");
        } else if (f.fee() != null && !f.fee().isBlank()) {
            strengths.add("Nominal fee: " + f.fee());
        }

        // 5. Verification status (Max 10 points)
        if (f.verified()) {
            score += 10.0;
            strengths.add("Ground-verified coordinates");
        }

        // Operational sanity
        if ("CLOSED".equalsIgnoreCase(f.operationalStatus())) {
            score -= 40.0;
            statusNotice = "Caution: Reported temporarily closed";
        } else if ("MAINTENANCE".equalsIgnoreCase(f.operationalStatus())) {
            score -= 20.0;
            statusNotice = "Notice: Under municipal maintenance";
        }

        // Cap score 0-100
        double finalScore = Math.round(Math.min(100.0, Math.max(10.0, score)) * 10.0) / 10.0;

        // Compose honest reason
        StringBuilder reason = new StringBuilder();
        if (f.distanceKm() != null) {
            reason.append(f.distanceKm() <= 1.0 ? "Extremely close (" : "Located ");
            reason.append(f.distanceKm()).append(" km away");
        } else {
            reason.append("Located in ").append(f.area() != null ? f.area() : "nearby area");
        }

        if (f.isAccessible()) {
            reason.append(" with wheelchair ramp access");
        }
        if (f.cleanlinessRating() != null && f.cleanlinessRating() >= 4.0) {
            reason.append(" and excellent citizen cleanliness rating (").append(String.format("%.1f", f.cleanlinessRating())).append("★)");
        } else if (f.isFree()) {
            reason.append(" with free public access");
        }
        reason.append(".");

        return new FacilityDto.FacilityRecommendation(
                f,
                finalScore,
                reason.toString(),
                strengths,
                statusNotice
        );
    }
}
