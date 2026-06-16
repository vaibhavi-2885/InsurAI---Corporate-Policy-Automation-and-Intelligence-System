package com.insurai.backend.repository;

import com.insurai.backend.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PolicyRepository extends JpaRepository<Policy, Long> {
    // This helps us find all policies belonging to a specific user
    List<Policy> findByUserId(Long userId);
}