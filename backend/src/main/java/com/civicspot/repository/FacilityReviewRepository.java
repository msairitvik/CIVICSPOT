package com.civicspot.repository;

import com.civicspot.model.FacilityReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityReviewRepository extends JpaRepository<FacilityReview, Long> {

    List<FacilityReview> findByFacilityIdOrderByCreatedAtDesc(Long facilityId);

    List<FacilityReview> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByFacilityId(Long facilityId);
}
