package com.civicspot.controller;

import com.civicspot.dto.CivicAnalyticsDto;
import com.civicspot.service.CivicAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class CivicAnalyticsController {

    private final CivicAnalyticsService analyticsService;

    public CivicAnalyticsController(CivicAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<CivicAnalyticsDto.OverviewAnalyticsResponse> getOverview() {
        return ResponseEntity.ok(analyticsService.getOverviewAnalytics());
    }
}
