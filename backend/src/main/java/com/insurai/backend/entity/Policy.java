
package com.insurai.backend.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "policies")
@Data
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "policy_id")
    private Long policyId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "plan_id")
    private Long planId;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "premium_paid")
    private Double premiumPaid; // We use Double for money here

    @Column(nullable = false)
    private String status; // 'ACTIVE', 'EXPIRED'

    // --- NEW MANDATORY FIELDS FOR LEGAL CONTRACT ---

    // Policy Holder Details (Date of Birth)
    @Column(name = "holder_dob")
    private LocalDate holderDob;

    // Policy Holder Address
    @Column(name = "address_line1")
    private String addressLine1;

    // Nominee Details
    @Column(name = "nominee_name")
    private String nomineeName;

    @Column(name = "nominee_relationship")
    private String nomineeRelationship;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = "ACTIVE";
        }
        if (startDate == null) {
            startDate = LocalDate.now();
        }
        // Auto-set end date to 1 year from now
        if (endDate == null) {
            endDate = LocalDate.now().plusYears(1);
        }
    }
}