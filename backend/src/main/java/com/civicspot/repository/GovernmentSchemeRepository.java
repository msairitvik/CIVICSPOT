package com.civicspot.repository;

import com.civicspot.model.GovernmentScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GovernmentSchemeRepository extends JpaRepository<GovernmentScheme, Long> {
    List<GovernmentScheme> findByCategory(String category);
    List<GovernmentScheme> findBySchemeNameContainingIgnoreCaseOrMinistryContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String name, String ministry, String description);
}
