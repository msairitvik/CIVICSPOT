package com.civicspot.service;

import com.civicspot.model.GovernmentScheme;
import com.civicspot.repository.GovernmentSchemeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class GovernmentSchemeService {

    private final GovernmentSchemeRepository schemeRepository;

    public GovernmentSchemeService(GovernmentSchemeRepository schemeRepository) {
        this.schemeRepository = schemeRepository;
    }

    public List<GovernmentScheme> searchSchemes(String query, String category) {
        if (query != null && !query.isBlank()) {
            return schemeRepository.findBySchemeNameContainingIgnoreCaseOrMinistryContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                    query.trim(), query.trim(), query.trim());
        }
        if (category != null && !category.isBlank()) {
            return schemeRepository.findByCategory(category);
        }
        return schemeRepository.findAll();
    }

    public GovernmentScheme getSchemeById(Long id) {
        return schemeRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Government scheme not found with ID: " + id));
    }
}
