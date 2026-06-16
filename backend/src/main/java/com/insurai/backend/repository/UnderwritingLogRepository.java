package com.insurai.backend.repository;

import com.insurai.backend.entity.UnderwritingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UnderwritingLogRepository extends JpaRepository<UnderwritingLog, Long> {
    // JpaRepository automatically provides the .save() method.
    // No extra code is needed here!
}