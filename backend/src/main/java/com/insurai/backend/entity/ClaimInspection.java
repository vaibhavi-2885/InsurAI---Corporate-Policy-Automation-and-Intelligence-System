package com.insurai.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "claim_inspections")
@Data // Generates getters, setters, and constructors via Lombok
public class ClaimInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String claimNumber; // Unique ID for tracking (e.g., CLM-A1B2C3)

    private String userEmail; // Links the claim to a specific customer

    @Column(columnDefinition = "TEXT")
    private String description; // Detailed incident description provided by user

    private String aiAssessment; // AI Result: "AI_VERIFIED" or "FLAGGED_FOR_FRAUD"

    private double confidenceScore; // The AI's certainty percentage

    private double estimatedPayout; // The repair/loss cost calculated by logic

    private String imagePath; // Path or URL to the uploaded evidence photo

    private LocalDateTime createdAt = LocalDateTime.now(); // Timestamp for audit logs
}