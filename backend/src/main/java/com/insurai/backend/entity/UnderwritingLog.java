package com.insurai.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

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

    private LocalDateTime createdAt = LocalDateTime.now(); // Logs exact time of the decision
}