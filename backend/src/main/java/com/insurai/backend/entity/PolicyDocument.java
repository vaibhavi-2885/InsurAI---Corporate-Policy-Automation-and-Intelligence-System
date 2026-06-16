package com.insurai.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "policy_documents")
@Data
public class PolicyDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String policyNumber; // e.g., POL-821886

    private String userEmail;

    @Column(length = 500)
    private String digitalSignatureHash; // The "Fingerprint" of the document

    private String status; // GENERATED, VERIFIED, SIGNED

    private String downloadPath;

    private LocalDateTime createdAt = LocalDateTime.now();
}