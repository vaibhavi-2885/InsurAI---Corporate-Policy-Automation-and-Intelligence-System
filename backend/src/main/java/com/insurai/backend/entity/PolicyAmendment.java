package com.insurai.backend.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "policy_amendments")
@Data
public class PolicyAmendment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "policy_id")
    private Long policyId;

    // Type of change requested (e.g., "ADDRESS", "NOMINEE", "PHONE")
    @Column(name = "change_type", nullable = false)
    private String changeType;

    // The old value or context
    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    // The new value requested by the customer
    @Column(name = "new_value", columnDefinition = "TEXT", nullable = false)
    private String newValue;

    // Status: PENDING, APPROVED, REJECTED
    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "request_date")
    private LocalDateTime requestDate;

    @PrePersist
    protected void onCreate() {
        requestDate = LocalDateTime.now();
    }
}