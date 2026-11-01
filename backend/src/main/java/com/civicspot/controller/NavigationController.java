package com.civicspot.controller;

import com.civicspot.dto.NavigationDto;
import com.civicspot.service.NavigationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/navigation")
public class NavigationController {

    private final NavigationService navigationService;

    public NavigationController(NavigationService navigationService) {
        this.navigationService = navigationService;
    }

    @PostMapping("/route")
    public ResponseEntity<NavigationDto.RouteResponse> getRoute(@RequestBody NavigationDto.RouteRequest request) {
        return ResponseEntity.ok(navigationService.calculateRoute(request));
    }
}
