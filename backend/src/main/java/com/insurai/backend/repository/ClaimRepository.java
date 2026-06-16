package com.insurai.backend.repository;

import com.insurai.backend.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    // To find claims for a specific policy
    List<Claim> findByPolicyId(Long policyId);

    List<Claim> findByPolicyIdIn(List<Long> policyIds);
}
