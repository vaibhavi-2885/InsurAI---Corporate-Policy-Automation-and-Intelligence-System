package com.insurai.backend.repository;

import com.insurai.backend.entity.Grievance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GrievanceRepository extends JpaRepository<Grievance, Long> {

    // Custom method to fetch all grievances by status (for Admin queue)
    List<Grievance> findByStatus(String status);
}
