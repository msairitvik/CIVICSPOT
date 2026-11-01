package com.civicspot.repository;

import com.civicspot.model.SavedFacility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedFacilityRepository extends JpaRepository<SavedFacility, Long> {
    List<SavedFacility> findByUserIdOrderBySavedAtDesc(Long userId);
    Optional<SavedFacility> findByUserIdAndFacilityId(Long userId, Long facilityId);
    boolean existsByUserIdAndFacilityId(Long userId, Long facilityId);
    void deleteByUserIdAndFacilityId(Long userId, Long facilityId);
}
