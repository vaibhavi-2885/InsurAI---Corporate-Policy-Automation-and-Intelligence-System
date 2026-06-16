package com.insurai.backend.repository;
import com.insurai.backend.entity.PolicyAmendment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PolicyAmendmentRepository extends JpaRepository<PolicyAmendment, Long> {

    // Custom method to fetch all amendment requests that are currently PENDING
    List<PolicyAmendment> findByStatus(String status);

    List<PolicyAmendment> findByPolicyIdIn(List<Long> policyIds);
}
