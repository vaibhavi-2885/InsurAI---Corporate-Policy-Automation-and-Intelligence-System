package com.insurai.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "insurance_plans")
@Data
public class InsurancePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_id")
    private Long planId;

    @Column(nullable = false)
    private String planName;

    @Column(nullable = false)
    private String category; // HEALTH, LIFE, VEHICLE, TRAVEL, INVESTMENT

    @Column(nullable = false)
    private BigDecimal basePremium;

    @Column(nullable = false)
    private BigDecimal coverageAmount;

    @Column(columnDefinition = "TEXT")
    private String description;

    // --- NEW FIELDS FOR INDUSTRIAL UPDATE ---

    @Column(columnDefinition = "TEXT")
    private String features;

    @Column(columnDefinition = "TEXT")
    private String eligibility;

    @Column(name = "documents_required", columnDefinition = "TEXT")
    private String documentsRequired;

    @Column(name = "claim_process", columnDefinition = "TEXT")
    private String claimProcess;
}