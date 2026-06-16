package com.insurai.backend.repository;

import com.insurai.backend.entity.PolicyDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PolicyDocumentRepository extends JpaRepository<PolicyDocument, Long> {
    Optional<PolicyDocument> findByPolicyNumber(String policyNumber);

    java.util.List<PolicyDocument> findByUserEmail(String userEmail);
}
