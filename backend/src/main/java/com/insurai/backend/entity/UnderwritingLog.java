package com.insurai.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "underwriting_audit")
@Data
public class UnderwritingLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;
    private int riskScore;
    private String decision;
    private double premium;
    @Column(nullable = false, updatable = false, unique = true)
    private String evaluationReference;
    @Column(nullable = false)
    private String ruleVersion;
    @Column(nullable = false)
    private boolean manualReviewRequired;
    @Column(length = 1200)
    private String decisionReasons;

    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    void prepareForInsert() {
        if (evaluationReference == null || evaluationReference.isBlank()) {
            evaluationReference = "UW-" + UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
