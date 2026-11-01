package com.civicspot.controller;

import com.civicspot.model.GovernmentScheme;
import com.civicspot.service.GovernmentSchemeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/civic-information")
public class GovernmentSchemeController {

    private final GovernmentSchemeService schemeService;

    public GovernmentSchemeController(GovernmentSchemeService schemeService) {
        this.schemeService = schemeService;
    }

    @GetMapping("/schemes")
    public ResponseEntity<List<GovernmentScheme>> getSchemes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(schemeService.searchSchemes(search, category));
    }

    @GetMapping("/search")
    public ResponseEntity<List<GovernmentScheme>> search(
            @RequestParam String query,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(schemeService.searchSchemes(query, category));
    }

    @GetMapping("/schemes/{id}")
    public ResponseEntity<GovernmentScheme> getById(@PathVariable Long id) {
        return ResponseEntity.ok(schemeService.getSchemeById(id));
    }
}
