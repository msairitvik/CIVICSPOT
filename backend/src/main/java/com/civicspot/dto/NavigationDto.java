package com.civicspot.dto;

import java.util.List;

public class NavigationDto {

    public record Waypoint(
            Double latitude,
            Double longitude,
            String name
    ) {}

    public record RouteRequest(
            Double originLat,
            Double originLng,
            String originName,
            Double destinationLat,
            Double destinationLng,
            String destinationName,
            String travelMode, // driving, walking, cycling
            List<String> requiredFacilityCategories // e.g. ["PUBLIC_TOILET", "DRINKING_WATER", "DUSTBIN"]
    ) {}

    public record MultiStopRequest(
            Waypoint origin,
            Waypoint destination,
            List<Waypoint> stops,
            String travelMode
    ) {}

    public record RouteStep(
            String instruction,
            Double distanceMeters,
            Double durationSeconds
    ) {}

    public record RouteResponse(
            Double totalDistanceMeters,
            Double totalDurationSeconds,
            String polyline, // encoded or GeoJSON coordinate string
            List<List<Double>> coordinates, // [[lon, lat], ...]
            List<RouteStep> steps,
            List<FacilityDto.FacilityResponse> facilitiesAlongRoute,
            String travelMode,
            String summary
    ) {}
}
