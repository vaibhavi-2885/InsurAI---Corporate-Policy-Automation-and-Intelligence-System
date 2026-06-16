package com.insurai.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "grievances")
@Data
public class Grievance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    // Type of complaint/feedback (e.g., "COMPLAINT", "FEEDBACK", "SERVICE_ISSUE")
    @Column(name = "type", nullable = false)
    private String type;

    // Detailed description of the grievance
    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    // Severity level (e.g., Low, Medium, High)
    @Column(name = "priority")
    private String priority;

    // Status: NEW, IN_REVIEW, RESOLVED
    @Column(nullable = false)
    private String status = "NEW";

    @Column(name = "submission_date")
    private LocalDateTime submissionDate;

    @PrePersist
    protected void onCreate() {
        submissionDate = LocalDateTime.now();
    }
}