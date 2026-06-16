package com.insurai.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "claims")
@Data
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "claim_id")
    private Long claimId;

    @Column(name = "policy_id")
    private Long policyId;

    @Column(name = "incident_date")
    private LocalDate incidentDate;

    @Column(columnDefinition = "TEXT")
    private String reason; // e.g., "Car Accident"

    @Column(name = "claim_amount")
    private Double claimAmount;

    @Column(nullable = false)
    private String status; // 'PENDING', 'APPROVED', 'REJECTED'

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = "PENDING";
        }
    }
}