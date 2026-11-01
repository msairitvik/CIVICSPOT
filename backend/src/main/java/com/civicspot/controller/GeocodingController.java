package com.civicspot.controller;

import com.civicspot.dto.GeocodingDto;
import com.civicspot.service.GeocodingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/geocoding")
public class GeocodingController {

    private final GeocodingService geocodingService;

    public GeocodingController(GeocodingService geocodingService) {
        this.geocodingService = geocodingService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<GeocodingDto.GeocodingResult>> search(
            @RequestParam String query,
            @RequestParam(required = false, defaultValue = "5") Integer limit) {
        return ResponseEntity.ok(geocodingService.searchLocation(query, limit));
    }

    @GetMapping("/reverse")
    public ResponseEntity<GeocodingDto.GeocodingResult> reverse(
            @RequestParam Double lat,
            @RequestParam Double lon) {
        return ResponseEntity.ok(geocodingService.reverseGeocode(lat, lon));
    }
}
