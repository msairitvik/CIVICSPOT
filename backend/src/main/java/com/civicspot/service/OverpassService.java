package com.civicspot.service;

import com.civicspot.model.Facility;
import com.civicspot.model.FacilityCategory;
import com.civicspot.repository.FacilityRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;

@Service
public class OverpassService {

    private static final Logger log = LoggerFactory.getLogger(OverpassService.class);

    private final FacilityRepository facilityRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    // List of reliable Overpass mirror endpoints for zero-downtime queries
    private final List<String> overpassMirrors;

    public OverpassService(
            FacilityRepository facilityRepository,
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper,
            @Value("${civicspot.external.overpass-api-url:https://overpass-api.de/api/interpreter}") String primaryOverpassUrl) {
        this.facilityRepository = facilityRepository;
        this.webClient = webClientBuilder
                .defaultHeader("User-Agent", "CivicSpot-Platform/1.0 (contact@civicspot.org)")
                .build();
        this.objectMapper = objectMapper;

        this.overpassMirrors = List.of(
                primaryOverpassUrl,
                "https://lz4.overpass-api.de/api/interpreter",
                "https://overpass.kumi.systems/api/interpreter"
        );
    }

    @Transactional
    public List<Facility> fetchLiveOsmFacilities(Double lat, Double lon, Double radiusKm, FacilityCategory category) {
        if (lat == null || lon == null) return List.of();
        double radiusMeters = (radiusKm != null && radiusKm > 0 ? radiusKm : 10.0) * 1000.0;

        String query = buildOverpassQuery(lat, lon, (int) radiusMeters, category);
        String responseJson = executeOverpassQuery(query);

        if (responseJson == null || responseJson.isBlank()) {
            return List.of();
        }

        List<Facility> parsedFacilities = parseOverpassResponse(responseJson, category);
        List<Facility> savedList = new ArrayList<>();

        for (Facility f : parsedFacilities) {
            // Check if OSM facility already exists in repository to prevent duplicate rows
            Optional<Facility> existing = Optional.empty();
            if (f.getOsmId() != null) {
                existing = facilityRepository.findAll().stream()
                        .filter(item -> f.getOsmId().equals(item.getOsmId()))
                        .findFirst();
            }

            if (existing.isPresent()) {
                Facility ef = existing.get();
                ef.setName(f.getName());
                ef.setLatitude(f.getLatitude());
                ef.setLongitude(f.getLongitude());
                ef.setAddress(f.getAddress());
                ef.setAccessible(f.isAccessible());
                ef.setHasRamp(f.isHasRamp());
                savedList.add(facilityRepository.save(ef));
            } else {
                savedList.add(facilityRepository.save(f));
            }
        }

        log.info("Live Overpass query returned {} facilities near ({}, {}) within {} km",
                savedList.size(), lat, lon, radiusKm);

        return savedList;
    }

    private String executeOverpassQuery(String qlQuery) {
        for (String mirrorUrl : overpassMirrors) {
            try {
                return webClient.post()
                        .uri(mirrorUrl)
                        .bodyValue("data=" + qlQuery)
                        .header("Content-Type", "application/x-www-form-urlencoded")
                        .retrieve()
                        .bodyToMono(String.class)
                        .timeout(Duration.ofSeconds(3))
                        .block();
            } catch (Exception e) {
                log.warn("Overpass mirror {} failed ({}), trying next mirror...", mirrorUrl, e.getMessage());
            }
        }
        log.error("All Overpass mirrors failed or timed out.");
        return null;
    }

    private String buildOverpassQuery(double lat, double lon, int radiusMeters, FacilityCategory category) {
        StringBuilder sb = new StringBuilder();
        sb.append("[out:json][timeout:15];\n(\n");

        if (category == null || category == FacilityCategory.PUBLIC_TOILET) {
            sb.append(String.format("  node[\"amenity\"=\"toilets\"](around:%d,%.6f,%.6f);\n", radiusMeters, lat, lon));
            sb.append(String.format("  way[\"amenity\"=\"toilets\"](around:%d,%.6f,%.6f);\n", radiusMeters, lat, lon));
        }
        if (category == null || category == FacilityCategory.DRINKING_WATER) {
            sb.append(String.format("  node[\"amenity\"=\"drinking_water\"](around:%d,%.6f,%.6f);\n", radiusMeters, lat, lon));
            sb.append(String.format("  way[\"amenity\"=\"drinking_water\"](around:%d,%.6f,%.6f);\n", radiusMeters, lat, lon));
        }
        if (category == null || category == FacilityCategory.DUSTBIN) {
            sb.append(String.format("  node[\"amenity\"=\"waste_basket\"](around:%d,%.6f,%.6f);\n", radiusMeters, lat, lon));
            sb.append(String.format("  node[\"amenity\"=\"waste_disposal\"](around:%d,%.6f,%.6f);\n", radiusMeters, lat, lon));
        }
        if (category == null || category == FacilityCategory.HOSPITAL) {
            sb.append(String.format("  node[\"amenity\"=\"hospital\"](around:%d,%.6f,%.6f);\n", radiusMeters, lat, lon));
            sb.append(String.format("  way[\"amenity\"=\"hospital\"](around:%d,%.6f,%.6f);\n", radiusMeters, lat, lon));
            sb.append(String.format("  node[\"amenity\"=\"clinic\"](around:%d,%.6f,%.6f);\n", radiusMeters, lat, lon));
        }
        if (category == null || category == FacilityCategory.PHARMACY) {
            sb.append(String.format("  node[\"amenity\"=\"pharmacy\"](around:%d,%.6f,%.6f);\n", radiusMeters, lat, lon));
        }
        if (category == null || category == FacilityCategory.POLICE_STATION) {
            sb.append(String.format("  node[\"amenity\"=\"police\"](around:%d,%.6f,%.6f);\n", radiusMeters, lat, lon));
        }
        if (category == null || category == FacilityCategory.BUS_STOP) {
            sb.append(String.format("  node[\"highway\"=\"bus_stop\"](around:%d,%.6f,%.6f);\n", radiusMeters, lat, lon));
        }
        if (category == null || category == FacilityCategory.RAILWAY_STATION) {
            sb.append(String.format("  node[\"railway\"=\"station\"](around:%d,%.6f,%.6f);\n", radiusMeters, lat, lon));
        }
        if (category == null || category == FacilityCategory.PUBLIC_PARK) {
            sb.append(String.format("  node[\"leisure\"=\"park\"](around:%d,%.6f,%.6f);\n", radiusMeters, lat, lon));
            sb.append(String.format("  way[\"leisure\"=\"park\"](around:%d,%.6f,%.6f);\n", radiusMeters, lat, lon));
        }
        if (category == null || category == FacilityCategory.EV_CHARGING) {
            sb.append(String.format("  node[\"amenity\"=\"charging_station\"](around:%d,%.6f,%.6f);\n", radiusMeters, lat, lon));
        }

        sb.append(");\nout center 40;");
        return sb.toString();
    }

    private List<Facility> parseOverpassResponse(String json, FacilityCategory requestedCategory) {
        List<Facility> list = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode elements = root.path("elements");

            if (!elements.isArray()) return list;

            for (JsonNode el : elements) {
                String type = el.path("type").asText();
                long id = el.path("id").asLong();
                String osmId = "OSM-" + type.toUpperCase() + "-" + id;

                double lat;
                double lon;

                if ("way".equalsIgnoreCase(type)) {
                    lat = el.path("center").path("lat").asDouble();
                    lon = el.path("center").path("lon").asDouble();
                } else {
                    lat = el.path("lat").asDouble();
                    lon = el.path("lon").asDouble();
                }

                if (lat == 0.0 && lon == 0.0) continue;

                JsonNode tags = el.path("tags");
                FacilityCategory cat = mapTagsToCategory(tags, requestedCategory);

                String name = tags.has("name") ? tags.path("name").asText() :
                              tags.has("name:en") ? tags.path("name:en").asText() :
                              getDefaultNameForCategory(cat);

                // Build address from OSM tags
                String street = tags.path("addr:street").asText("");
                String suburb = tags.path("addr:suburb").asText(tags.path("addr:village").asText(""));
                String city = tags.path("addr:city").asText(tags.path("addr:district").asText(""));
                String address = buildAddress(street, suburb, city);

                // Accessibility tags
                String wheelchairTag = tags.path("wheelchair").asText("").toLowerCase();
                boolean isAccessible = "yes".equals(wheelchairTag) || "limited".equals(wheelchairTag);
                boolean hasRamp = tags.has("ramp") && !"no".equalsIgnoreCase(tags.path("ramp").asText());

                // Fee tag
                String feeTag = tags.path("fee").asText("no").toLowerCase();
                boolean isFree = "no".equals(feeTag) || feeTag.isBlank();
                String fee = isFree ? "Free" : "₹" + tags.path("charge").asText("Regulated fee");

                // Hours
                String hours = tags.path("opening_hours").asText("24/7");

                Facility facility = new Facility();
                facility.setName(name);
                facility.setCategory(cat);
                facility.setLatitude(lat);
                facility.setLongitude(lon);
                facility.setAddress(address);
                facility.setArea(suburb.isBlank() ? (city.isBlank() ? "Local Corridor" : city) : suburb);
                facility.setAccessible(isAccessible);
                facility.setHasRamp(hasRamp);
                facility.setFree(isFree);
                facility.setFee(fee);
                facility.setOpeningHours(hours);
                facility.setCleanlinessRating(4.0); // Baseline rating until citizen reviews submitted
                facility.setTotalReviews(0);
                facility.setOsmId(osmId);
                facility.setVerified(true);
                facility.setSource("OPENSTREETMAP");
                facility.setOperationalStatus("OPERATIONAL");

                list.add(facility);
            }
        } catch (Exception e) {
            log.error("Failed to parse Overpass response: {}", e.getMessage());
        }

        return list;
    }

    private FacilityCategory mapTagsToCategory(JsonNode tags, FacilityCategory fallback) {
        String amenity = tags.path("amenity").asText();
        String leisure = tags.path("leisure").asText();
        String highway = tags.path("highway").asText();
        String railway = tags.path("railway").asText();

        if ("toilets".equalsIgnoreCase(amenity)) return FacilityCategory.PUBLIC_TOILET;
        if ("drinking_water".equalsIgnoreCase(amenity)) return FacilityCategory.DRINKING_WATER;
        if ("waste_basket".equalsIgnoreCase(amenity) || "waste_disposal".equalsIgnoreCase(amenity)) return FacilityCategory.DUSTBIN;
        if ("hospital".equalsIgnoreCase(amenity) || "clinic".equalsIgnoreCase(amenity)) return FacilityCategory.HOSPITAL;
        if ("pharmacy".equalsIgnoreCase(amenity)) return FacilityCategory.PHARMACY;
        if ("police".equalsIgnoreCase(amenity)) return FacilityCategory.POLICE_STATION;
        if ("bus_stop".equalsIgnoreCase(highway) || "bus_station".equalsIgnoreCase(amenity)) return FacilityCategory.BUS_STOP;
        if ("station".equalsIgnoreCase(railway)) return FacilityCategory.RAILWAY_STATION;
        if ("park".equalsIgnoreCase(leisure)) return FacilityCategory.PUBLIC_PARK;
        if ("charging_station".equalsIgnoreCase(amenity)) return FacilityCategory.EV_CHARGING;

        return fallback != null ? fallback : FacilityCategory.OTHER;
    }

    private String getDefaultNameForCategory(FacilityCategory cat) {
        if (cat == null) return "Public Civic Facility";
        return switch (cat) {
            case PUBLIC_TOILET -> "Public Restroom Complex";
            case DRINKING_WATER -> "Public RO Water Point";
            case DUSTBIN -> "Municipal Waste Disposal Point";
            case HOSPITAL -> "Community Healthcare Center";
            case PHARMACY -> "Medical Pharmacy Store";
            case POLICE_STATION -> "Police Station";
            case BUS_STOP -> "Public Bus Transit Stop";
            case RAILWAY_STATION -> "Railway Passenger Terminal";
            case PUBLIC_PARK -> "Municipal Urban Park";
            case EV_CHARGING -> "Public EV Charging Station";
            default -> "Public Municipal Amenity";
        };
    }

    private String buildAddress(String street, String suburb, String city) {
        List<String> parts = new ArrayList<>();
        if (!street.isBlank()) parts.add(street);
        if (!suburb.isBlank()) parts.add(suburb);
        if (!city.isBlank()) parts.add(city);
        return parts.isEmpty() ? "Municipal Roadway, Public Area" : String.join(", ", parts);
    }
}
