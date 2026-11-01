package com.civicspot.service;

import com.civicspot.dto.GeocodingDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GeocodingService {

    private static final Logger log = LoggerFactory.getLogger(GeocodingService.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String nominatimUrl;

    // Cache to prevent duplicate queries and adhere to Nominatim rate policies
    private final Map<String, List<GeocodingDto.GeocodingResult>> searchCache = new ConcurrentHashMap<>();
    private final Map<String, GeocodingDto.GeocodingResult> reverseCache = new ConcurrentHashMap<>();

    public GeocodingService(
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper,
            @Value("${civicspot.external.nominatim-api-url:https://nominatim.openstreetmap.org}") String nominatimUrl) {
        this.webClient = webClientBuilder
                .defaultHeader("User-Agent", "CivicSpot-CivicIntelligencePlatform/1.0 (contact@civicspot.org)")
                .build();
        this.objectMapper = objectMapper;
        this.nominatimUrl = nominatimUrl;
    }

    public List<GeocodingDto.GeocodingResult> searchLocation(String query, Integer limit) {
        if (query == null || query.trim().isBlank()) {
            return List.of();
        }

        String cleanedQuery = cleanLocationQuery(query.trim());
        String cacheKey = cleanedQuery.toLowerCase() + "_" + (limit != null ? limit : 5);

        if (searchCache.containsKey(cacheKey)) {
            return searchCache.get(cacheKey);
        }

        List<GeocodingDto.GeocodingResult> results = new ArrayList<>();
        try {
            int lim = limit != null && limit > 0 ? limit : 5;
            String encodedQuery = URLEncoder.encode(cleanedQuery, StandardCharsets.UTF_8);

            // First search within India (countrycodes=in) with high priority
            String url = String.format("%s/search?q=%s&format=json&addressdetails=1&limit=%d&countrycodes=in",
                    nominatimUrl, encodedQuery, lim);

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(6))
                    .block();

            results = parseNominatimResponse(response);

            // If no results found with countrycode=in, try unrestricted search
            if (results.isEmpty()) {
                String fallbackUrl = String.format("%s/search?q=%s&format=json&addressdetails=1&limit=%d",
                        nominatimUrl, encodedQuery, lim);

                String fallbackResp = webClient.get()
                        .uri(fallbackUrl)
                        .retrieve()
                        .bodyToMono(String.class)
                        .timeout(Duration.ofSeconds(6))
                        .block();

                results = parseNominatimResponse(fallbackResp);
            }

            searchCache.put(cacheKey, results);
        } catch (Exception e) {
            log.warn("Nominatim geocoding failed for query '{}': {}", cleanedQuery, e.getMessage());

            // Known prominent references fallback if network times out
            if (cleanedQuery.toLowerCase().contains("denkada")) {
                results.add(new GeocodingDto.GeocodingResult(
                        "Denkada, Vizianagaram District, Andhra Pradesh, 535005, India",
                        "Denkada",
                        18.0833,
                        83.4500,
                        "village",
                        0.75,
                        List.of(18.05, 18.11, 83.42, 83.48),
                        "Andhra Pradesh",
                        "Vizianagaram",
                        "India"
                ));
            } else if (cleanedQuery.toLowerCase().contains("vizianagaram")) {
                results.add(new GeocodingDto.GeocodingResult(
                        "Vizianagaram, Vizianagaram Mandal, Andhra Pradesh, India",
                        "Vizianagaram",
                        18.1167,
                        83.4000,
                        "city",
                        0.85,
                        List.of(18.08, 18.15, 83.36, 83.44),
                        "Andhra Pradesh",
                        "Vizianagaram",
                        "India"
                ));
            }
        }

        return results;
    }

    public GeocodingDto.GeocodingResult reverseGeocode(Double lat, Double lon) {
        if (lat == null || lon == null) return null;

        String cacheKey = String.format(Locale.US, "%.4f,%.4f", lat, lon);
        if (reverseCache.containsKey(cacheKey)) {
            return reverseCache.get(cacheKey);
        }

        try {
            String url = String.format(Locale.US, "%s/reverse?lat=%.6f&lon=%.6f&format=json&addressdetails=1",
                    nominatimUrl, lat, lon);

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();

            JsonNode node = objectMapper.readTree(response);
            if (node != null && node.has("lat") && node.has("lon")) {
                String displayName = node.path("display_name").asText();
                JsonNode addr = node.path("address");
                String name = addr.has("village") ? addr.path("village").asText() :
                              addr.has("town") ? addr.path("town").asText() :
                              addr.has("city") ? addr.path("city").asText() :
                              addr.has("suburb") ? addr.path("suburb").asText() : "Current Location";

                String state = addr.path("state").asText("");
                String district = addr.path("county").asText(addr.path("state_district").asText(""));
                String country = addr.path("country").asText("");

                GeocodingDto.GeocodingResult res = new GeocodingDto.GeocodingResult(
                        displayName,
                        name,
                        node.path("lat").asDouble(),
                        node.path("lon").asDouble(),
                        node.path("type").asText("location"),
                        0.8,
                        List.of(),
                        state,
                        district,
                        country
                );
                reverseCache.put(cacheKey, res);
                return res;
            }
        } catch (Exception e) {
            log.warn("Reverse geocode failed for ({}, {}): {}", lat, lon, e.getMessage());
        }

        return new GeocodingDto.GeocodingResult(
                String.format(Locale.US, "Location (%.4f, %.4f)", lat, lon),
                "Selected Location",
                lat,
                lon,
                "coordinates",
                0.5,
                List.of(),
                "",
                "",
                ""
        );
    }

    private List<GeocodingDto.GeocodingResult> parseNominatimResponse(String rawJson) {
        List<GeocodingDto.GeocodingResult> list = new ArrayList<>();
        if (rawJson == null || rawJson.isBlank()) return list;

        try {
            JsonNode array = objectMapper.readTree(rawJson);
            if (array.isArray()) {
                for (JsonNode item : array) {
                    double lat = item.path("lat").asDouble();
                    double lon = item.path("lon").asDouble();
                    String displayName = item.path("display_name").asText();
                    String name = item.path("name").asText(displayName.split(",")[0]);
                    String type = item.path("type").asText("place");
                    double importance = item.path("importance").asDouble(0.5);

                    JsonNode addr = item.path("address");
                    String state = addr.path("state").asText("");
                    String district = addr.path("county").asText(addr.path("state_district").asText(""));
                    String country = addr.path("country").asText("");

                    List<Double> bbox = new ArrayList<>();
                    JsonNode bbNode = item.path("boundingbox");
                    if (bbNode.isArray()) {
                        for (JsonNode b : bbNode) {
                            bbox.add(b.asDouble());
                        }
                    }

                    list.add(new GeocodingDto.GeocodingResult(
                            displayName,
                            name,
                            lat,
                            lon,
                            type,
                            importance,
                            bbox,
                            state,
                            district,
                            country
                    ));
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Nominatim response: {}", e.getMessage());
        }

        return list;
    }

    /**
     * Strips leading facility phrases like "public toilets in Denkada" -> "Denkada"
     */
    public String cleanLocationQuery(String query) {
        String q = query.trim();
        String lower = q.toLowerCase();

        String[] prefixes = {
                "find public toilets in ", "find public toilet in ", "public toilets in ", "public toilet in ",
                "find toilets in ", "find toilet in ", "toilets in ", "toilet in ",
                "find drinking water in ", "drinking water in ", "water in ",
                "find dustbins in ", "dustbins in ", "waste disposal in ",
                "find hospitals in ", "hospitals in ", "hospital in ",
                "find pharmacies in ", "pharmacies in ", "pharmacy in ",
                "find parks in ", "parks in ", "park in ",
                "find facilities in ", "facilities in ", "amenities in ",
                "near ", "in ", "around "
        };

        for (String p : prefixes) {
            if (lower.startsWith(p)) {
                return q.substring(p.length()).trim();
            }
        }

        return q;
    }
}
