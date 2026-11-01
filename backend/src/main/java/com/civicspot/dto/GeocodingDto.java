package com.civicspot.dto;

import java.util.List;

public class GeocodingDto {

    public record GeocodingResult(
            String displayName,
            String name,
            Double latitude,
            Double longitude,
            String placeType,
            Double importance,
            List<Double> boundingBox,
            String state,
            String district,
            String country
    ) {}

    public record LocationSearchRequest(
            String query,
            Integer limit
    ) {}
}
