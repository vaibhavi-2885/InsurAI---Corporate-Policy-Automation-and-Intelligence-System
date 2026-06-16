package com.insurai.backend.repository;

import com.insurai.backend.entity.InsurancePlan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InsurancePlanRepository extends JpaRepository<InsurancePlan, Long> {
    // This gives us methods like findAll() automatically
}