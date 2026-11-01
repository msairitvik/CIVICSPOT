package com.civicspot.repository;

import com.civicspot.model.FacilityReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityReportRepository extends JpaRepository<FacilityReport, Long> {
    List<FacilityReport> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<FacilityReport> findByFacilityIdOrderByCreatedAtDesc(Long facilityId);
    List<FacilityReport> findByStatusOrderByCreatedAtDesc(String status);
    List<FacilityReport> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
    long countByIssueCategory(String issueCategory);
}
