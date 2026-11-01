package com.civicspot.repository;

import com.civicspot.model.ComplaintEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintEvidenceRepository extends JpaRepository<ComplaintEvidence, Long> {
    List<ComplaintEvidence> findByComplaintId(Long complaintId);
}
