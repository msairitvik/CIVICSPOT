package com.civicspot.service;

import com.civicspot.dto.FacilityDto;
import com.civicspot.model.*;
import com.civicspot.repository.FacilityRepository;
import com.civicspot.repository.FacilityReviewRepository;
import com.civicspot.repository.SavedFacilityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FacilityService {

    private static final Logger log = LoggerFactory.getLogger(FacilityService.class);

    private final FacilityRepository facilityRepository;
    private final SavedFacilityRepository savedFacilityRepository;
    private final FacilityReviewRepository facilityReviewRepository;
    private final OverpassService overpassService;
    private final FacilityRecommendationService facilityRecommendationService;

    public FacilityService(
            FacilityRepository facilityRepository,
            SavedFacilityRepository savedFacilityRepository,
            FacilityReviewRepository facilityReviewRepository,
            OverpassService overpassService,
            FacilityRecommendationService facilityRecommendationService) {
        this.facilityRepository = facilityRepository;
        this.savedFacilityRepository = savedFacilityRepository;
        this.facilityReviewRepository = facilityReviewRepository;
        this.overpassService = overpassService;
        this.facilityRecommendationService = facilityRecommendationService;
    }

    /**
     * Canonical Category Resolver
     * Maps user input, plurals, legacy codes and OSM tags to stable canonical enum values.
     */
    public static FacilityCategory resolveCanonicalCategory(Object categoryInput) {
        if (categoryInput == null) return null;
        if (categoryInput instanceof FacilityCategory fc) {
            return fc;
        }
        String str = categoryInput.toString().trim();
        if (str.isBlank()) return null;
        String norm = str.toUpperCase().replace("-", "_").replace(" ", "_");

        // Direct enum check
        for (FacilityCategory fc : FacilityCategory.values()) {
            if (fc.name().equalsIgnoreCase(norm)) {
                return fc;
            }
        }

        // Canonical mapping & plural/alias handling
        if (norm.equals("TOILET") || norm.equals("TOILETS") || norm.equals("RESTROOM") || norm.equals("RESTROOMS") || norm.equals("PUBLIC_TOILETS") || norm.equals("WASHROOM") || norm.equals("WASHROOMS") || norm.equals("LAVATORY")) {
            return FacilityCategory.PUBLIC_TOILET;
        }
        if (norm.equals("DUSTBIN") || norm.equals("DUSTBINS") || norm.equals("WASTE") || norm.equals("WASTE_BIN") || norm.equals("WASTE_BINS") || norm.equals("TRASH") || norm.equals("GARBAGE") || norm.equals("SOLID_WASTE") || norm.equals("WASTE_DISPOSAL") || norm.equals("RECYCLING")) {
            return FacilityCategory.DUSTBIN;
        }
        if (norm.equals("DRINKING_WATER") || norm.equals("WATER") || norm.equals("WATER_ATM") || norm.equals("RO_WATER") || norm.equals("PURIFIED_WATER") || norm.equals("DRINKING_POINTS") || norm.equals("WATER_POINT")) {
            return FacilityCategory.DRINKING_WATER;
        }
        if (norm.equals("HOSPITAL") || norm.equals("HOSPITALS") || norm.equals("CLINIC") || norm.equals("CLINICS") || norm.equals("HEALTHCARE") || norm.equals("EMERGENCY") || norm.equals("MEDICAL_CENTRE") || norm.equals("TRAUMA")) {
            return FacilityCategory.HOSPITAL;
        }
        if (norm.equals("PHARMACY") || norm.equals("PHARMACIES") || norm.equals("CHEMIST") || norm.equals("DRUGSTORE") || norm.equals("MEDICINE") || norm.equals("MEDICAL_SHOP")) {
            return FacilityCategory.PHARMACY;
        }
        if (norm.equals("POLICE") || norm.equals("POLICE_STATION") || norm.equals("POLICE_STATIONS") || norm.equals("COP") || norm.equals("THANA") || norm.equals("POLICE_POST")) {
            return FacilityCategory.POLICE_STATION;
        }
        if (norm.equals("PARK") || norm.equals("PARKS") || norm.equals("PUBLIC_PARK") || norm.equals("PUBLIC_PARKS") || norm.equals("GARDEN") || norm.equals("GARDENS")) {
            return FacilityCategory.PUBLIC_PARK;
        }
        if (norm.equals("BUS_STOP") || norm.equals("BUS_STOPS") || norm.equals("BUS") || norm.equals("BUS_STAND") || norm.equals("BUS_STATION") || norm.equals("RTC_COMPLEX")) {
            return FacilityCategory.BUS_STOP;
        }
        if (norm.equals("RAILWAY_STATION") || norm.equals("RAILWAY") || norm.equals("TRAIN_STATION") || norm.equals("STATION") || norm.equals("JUNCTION")) {
            return FacilityCategory.RAILWAY_STATION;
        }
        if (norm.equals("EV") || norm.equals("EV_CHARGING") || norm.equals("CHARGING_STATION") || norm.equals("ELECTRIC_VEHICLE")) {
            return FacilityCategory.EV_CHARGING;
        }
        if (norm.equals("ALL") || norm.equals("ANY")) {
            return null;
        }
        return null;
    }

    public List<FacilityDto.FacilityResponse> searchNearby(
            Double userLat, Double userLng, Double radiusKm,
            FacilityCategory category, Boolean accessibleOnly) {
        return searchNearby(userLat, userLng, radiusKm, category != null ? category.name() : null, accessibleOnly);
    }

    public List<FacilityDto.FacilityResponse> searchNearby(
            Double userLat, Double userLng, Double radiusKm,
            String categoryParam, Boolean accessibleOnly) {

        final FacilityCategory category = resolveCanonicalCategory(categoryParam);

        if (userLat == null || userLng == null) {
            userLat = 18.1067; // Vizianagaram default coordinate
            userLng = 83.3956;
        }
        if (radiusKm == null || radiusKm <= 0) {
            radiusKm = 10.0;
        }

        // Bounding box calculation (approx 1 deg lat ~= 111km)
        double latDelta = radiusKm / 111.0;
        double lngDelta = radiusKm / (111.0 * Math.cos(Math.toRadians(userLat)));

        double minLat = userLat - latDelta;
        double maxLat = userLat + latDelta;
        double minLng = userLng - lngDelta;
        double maxLng = userLng + lngDelta;

        List<Facility> facilities;
        if (category != null) {
            facilities = facilityRepository.findByCategoryWithinBoundingBox(category, minLat, maxLat, minLng, maxLng);
        } else {
            facilities = facilityRepository.findWithinBoundingBox(minLat, maxLat, minLng, maxLng);
        }

        // If local database has few or no records in this area (e.g. Denkada/rural areas), query live OpenStreetMap Overpass
        if (facilities.size() < 3) {
            try {
                log.info("Local facility count is low ({}) around ({}, {}), fetching live from OpenStreetMap Overpass API for category {}...",
                        facilities.size(), userLat, userLng, category);
                List<Facility> osmFacilities = overpassService.fetchLiveOsmFacilities(userLat, userLng, radiusKm, category);
                if (osmFacilities != null && !osmFacilities.isEmpty()) {
                    if (category != null) {
                        facilities = facilityRepository.findByCategoryWithinBoundingBox(category, minLat, maxLat, minLng, maxLng);
                    } else {
                        facilities = facilityRepository.findWithinBoundingBox(minLat, maxLat, minLng, maxLng);
                    }
                }
            } catch (Exception e) {
                log.warn("Non-fatal: Live Overpass fetch had an issue, proceeding with cached database facilities: {}", e.getMessage());
            }
        }

        final double fLat = userLat;
        final double fLng = userLng;
        final double maxDistance = radiusKm;

        // MANDATORY ROOT-CAUSE PRE-FILTER: Result set MUST strictly match the requested category!
        return facilities.stream()
                .filter(f -> category == null || f.getCategory() == category)
                .filter(f -> accessibleOnly == null || !accessibleOnly || f.isAccessible())
                .map(f -> {
                    double dist = calculateHaversineKm(fLat, fLng, f.getLatitude(), f.getLongitude());
                    return Map.entry(f, dist);
                })
                .filter(entry -> entry.getValue() <= maxDistance)
                .sorted(Comparator.comparingDouble(Map.Entry::getValue))
                .map(entry -> FacilityDto.FacilityResponse.fromEntity(entry.getKey(), Math.round(entry.getValue() * 10.0) / 10.0))
                .collect(Collectors.toList());
    }

    public List<FacilityDto.FacilityRecommendation> getRecommendations(
            Double userLat, Double userLng, Double radiusKm,
            FacilityCategory category, Boolean accessibleOnly, int topN) {
        return getRecommendations(userLat, userLng, radiusKm, category != null ? category.name() : null, accessibleOnly, topN);
    }

    public List<FacilityDto.FacilityRecommendation> getRecommendations(
            Double userLat, Double userLng, Double radiusKm,
            String categoryParam, Boolean accessibleOnly, int topN) {

        final FacilityCategory category = resolveCanonicalCategory(categoryParam);
        List<FacilityDto.FacilityResponse> nearby = searchNearby(userLat, userLng, radiusKm, categoryParam, accessibleOnly);
        return facilityRecommendationService.rankRecommendations(nearby, category, topN > 0 ? topN : 3);
    }

    public List<FacilityDto.FacilityResponse> searchByPlace(String query, FacilityCategory category) {
        return searchByPlace(query, category != null ? category.name() : null);
    }

    public List<FacilityDto.FacilityResponse> searchByPlace(String query, String categoryParam) {
        final FacilityCategory category = resolveCanonicalCategory(categoryParam);
        List<Facility> list;
        if (query == null || query.isBlank()) {
            list = category != null ? facilityRepository.findByCategory(category) : facilityRepository.findAll();
        } else {
            list = facilityRepository.findByNameContainingIgnoreCaseOrAddressContainingIgnoreCaseOrAreaContainingIgnoreCase(
                    query.trim(), query.trim(), query.trim());
            if (category != null) {
                list = list.stream().filter(f -> f.getCategory() == category).toList();
            }
        }
        return list.stream()
                .filter(f -> category == null || f.getCategory() == category)
                .map(f -> FacilityDto.FacilityResponse.fromEntity(f, null))
                .collect(Collectors.toList());
    }

    public FacilityDto.FacilityResponse getFacilityById(Long id, Double userLat, Double userLng) {
        Facility f = facilityRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Facility not found with ID: " + id));

        Double dist = null;
        if (userLat != null && userLng != null) {
            dist = Math.round(calculateHaversineKm(userLat, userLng, f.getLatitude(), f.getLongitude()) * 10.0) / 10.0;
        }
        return FacilityDto.FacilityResponse.fromEntity(f, dist);
    }

    @Transactional
    public FacilityDto.ReviewResponse addReview(Long facilityId, User user, FacilityDto.CreateReviewRequest req) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new NoSuchElementException("Facility not found with ID: " + facilityId));

        int rating = (req.rating() != null && req.rating() >= 1 && req.rating() <= 5) ? req.rating() : 5;
        String cleanliness = req.cleanlinessLevel() != null ? req.cleanlinessLevel() : "CLEAN";

        FacilityReview review = new FacilityReview(
                facility,
                user,
                rating,
                cleanliness,
                req.comment(),
                req.evidencePhotoUrl()
        );
        FacilityReview savedReview = facilityReviewRepository.save(review);

        // Update facility average cleanliness rating and review count
        List<FacilityReview> allReviews = facilityReviewRepository.findByFacilityIdOrderByCreatedAtDesc(facilityId);
        double avgRating = allReviews.stream().mapToInt(FacilityReview::getRating).average().orElse(rating);
        avgRating = Math.round(avgRating * 10.0) / 10.0;

        facility.setCleanlinessRating(avgRating);
        facility.setTotalReviews(allReviews.size());
        facilityRepository.save(facility);

        return FacilityDto.ReviewResponse.fromEntity(savedReview);
    }

    public List<FacilityDto.ReviewResponse> getFacilityReviews(Long facilityId) {
        return facilityReviewRepository.findByFacilityIdOrderByCreatedAtDesc(facilityId)
                .stream()
                .map(FacilityDto.ReviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public boolean toggleSaveFacility(User user, Long facilityId) {
        Facility f = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new NoSuchElementException("Facility not found with ID: " + facilityId));

        Optional<SavedFacility> existing = savedFacilityRepository.findByUserIdAndFacilityId(user.getId(), facilityId);
        if (existing.isPresent()) {
            savedFacilityRepository.delete(existing.get());
            return false; // Unsaved
        } else {
            savedFacilityRepository.save(new SavedFacility(user, f));
            return true; // Saved
        }
    }

    public List<FacilityDto.FacilityResponse> getSavedFacilities(User user) {
        return savedFacilityRepository.findByUserIdOrderBySavedAtDesc(user.getId())
                .stream()
                .map(sf -> FacilityDto.FacilityResponse.fromEntity(sf.getFacility(), null))
                .collect(Collectors.toList());
    }

    public boolean isFacilitySaved(User user, Long facilityId) {
        return savedFacilityRepository.existsByUserIdAndFacilityId(user.getId(), facilityId);
    }

    @Transactional
    public Facility createFacility(FacilityDto.CreateFacilityRequest req) {
        Facility f = new Facility();
        f.setName(req.name());
        f.setCategory(req.category());
        f.setLatitude(req.latitude());
        f.setLongitude(req.longitude());
        f.setAddress(req.address());
        f.setArea(req.area());
        if (req.isAccessible() != null) f.setAccessible(req.isAccessible());
        if (req.hasRamp() != null) f.setHasRamp(req.hasRamp());
        if (req.isFree() != null) f.setFree(req.isFree());
        if (req.fee() != null) f.setFee(req.fee());
        if (req.openingHours() != null) f.setOpeningHours(req.openingHours());
        if (req.operationalStatus() != null) f.setOperationalStatus(req.operationalStatus());
        f.setVerified(true);
        f.setSource("CITIZEN_VERIFIED");
        return facilityRepository.save(f);
    }

    public static double calculateHaversineKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
