package com.civicspot.controller;

import com.civicspot.dto.FacilityDto;
import com.civicspot.model.Facility;
import com.civicspot.model.FacilityCategory;
import com.civicspot.model.User;
import com.civicspot.service.FacilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/facilities")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @GetMapping
    public ResponseEntity<List<FacilityDto.FacilityResponse>> getAll(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(facilityService.searchByPlace(search, category));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<FacilityDto.FacilityResponse>> getNearby(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radius,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean accessible) {
        return ResponseEntity.ok(facilityService.searchNearby(lat, lng, radius, category, accessible));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<FacilityDto.FacilityRecommendation>> getRecommendations(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radius,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean accessible,
            @RequestParam(defaultValue = "3") int top) {
        return ResponseEntity.ok(facilityService.getRecommendations(lat, lng, radius, category, accessible, top));
    }

    @GetMapping("/search")
    public ResponseEntity<List<FacilityDto.FacilityResponse>> search(
            @RequestParam String query,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(facilityService.searchByPlace(query, category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacilityDto.FacilityResponse> getById(
            @PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        return ResponseEntity.ok(facilityService.getFacilityById(id, lat, lng));
    }

    @PostMapping
    public ResponseEntity<Facility> create(@RequestBody FacilityDto.CreateFacilityRequest req) {
        return ResponseEntity.ok(facilityService.createFacility(req));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<FacilityDto.ReviewResponse>> getReviews(@PathVariable Long id) {
        return ResponseEntity.ok(facilityService.getFacilityReviews(id));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<FacilityDto.ReviewResponse> addReview(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestBody FacilityDto.CreateReviewRequest req) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(facilityService.addReview(id, user, req));
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<Map<String, Boolean>> toggleSave(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        boolean saved = facilityService.toggleSaveFacility(user, id);
        return ResponseEntity.ok(Map.of("saved", saved));
    }

    @GetMapping("/saved")
    public ResponseEntity<List<FacilityDto.FacilityResponse>> getSaved(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(facilityService.getSavedFacilities(user));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(Arrays.stream(FacilityCategory.values()).map(Enum::name).toList());
    }
}
