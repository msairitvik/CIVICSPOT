package com.civicspot.repository;

import com.civicspot.model.SavedLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedLocationRepository extends JpaRepository<SavedLocation, Long> {
    List<SavedLocation> findByUserIdOrderByCreatedAtDesc(Long userId);
}
