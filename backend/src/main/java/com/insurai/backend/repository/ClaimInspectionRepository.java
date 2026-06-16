package com.insurai.backend.repository;

import com.insurai.backend.entity.ClaimInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClaimInspectionRepository extends JpaRepository<ClaimInspection, Long> {

    // Find all claims filed by a specific user
    List<ClaimInspection> findByUserEmail(String userEmail);

    // Find claims that the AI flagged as suspicious
    List<ClaimInspection> findByAiAssessment(String aiAssessment);
}