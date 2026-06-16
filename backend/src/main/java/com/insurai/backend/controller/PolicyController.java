package com.insurai.backend.controller;
import com.insurai.backend.entity.Policy;
import com.insurai.backend.entity.User;
import com.insurai.backend.repository.PolicyRepository;
import com.insurai.backend.repository.UserRepository;
import com.insurai.backend.service.PdfService;
import com.insurai.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.ByteArrayInputStream; // Added missing import
import java.time.LocalDate; // <-- FIX: Added missing import for LocalDate
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/policies")
@CrossOrigin(origins = "http://localhost:5173")
public class PolicyController {

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PdfService pdfService;

    // 1. BUY A POLICY (Creation of New Policy)
    @PostMapping("/buy")
    public Policy buyPolicy(@RequestBody Policy policy) {
        Policy savedPolicy = policyRepository.save(policy);

        // Send Receipt Email
        new Thread(() -> {
            User user = userRepository.findById(savedPolicy.getUserId()).orElse(null);
            if (user != null) {
                String subject = "New Policy Purchase - InsurAI Policy #" + savedPolicy.getPolicyId();
                String body = "Dear " + user.getFullName() + ",\n\n" +
                        "We have received your payment of ₹" + savedPolicy.getPremiumPaid() + ".\n" +
                        "Your policy is now ACTIVE.\n\n" +
                        "Policy ID: " + savedPolicy.getPolicyId() + "\n" +
                        "Nominee: " + savedPolicy.getNomineeName() + "\n" +
                        "Thank you for choosing InsurAI.\n\n";
                emailService.sendEmail(user.getEmail(), subject, body);
            }
        }).start();

        return savedPolicy;
    }

    // 2. RENEW AN EXISTING POLICY (New Feature)
    @PutMapping("/renew/{policyId}")
    public ResponseEntity<Policy> renewPolicy(@PathVariable Long policyId) {
        Optional<Policy> policyOpt = policyRepository.findById(policyId);

        if (policyOpt.isPresent()) {
            Policy policy = policyOpt.get();

            // 1. Update End Date (Extend by one year)
            LocalDate newEndDate = policy.getEndDate().plusYears(1);
            policy.setEndDate(newEndDate);

            // 2. Ensure status is Active
            policy.setStatus("ACTIVE");

            Policy renewedPolicy = policyRepository.save(policy);

            // Send Renewal Confirmation Email
            new Thread(() -> {
                User user = userRepository.findById(renewedPolicy.getUserId()).orElse(null);
                if (user != null) {
                    String subject = "Policy Renewal Confirmed - ID #" + renewedPolicy.getPolicyId();
                    String body = "Dear " + user.getFullName() + ",\n\n" +
                            "Your policy has been successfully renewed. Your new expiration date is " + newEndDate + ".\n\n";
                    emailService.sendEmail(user.getEmail(), subject, body);
                }
            }).start();

            return ResponseEntity.ok(renewedPolicy);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    // 3. GET MY POLICIES
    @GetMapping("/user/{userId}")
    public List<Policy> getUserPolicies(@PathVariable Long userId) {
        return policyRepository.findByUserId(userId);
    }

    // 4. DOWNLOAD PDF
    @GetMapping(value = "/{id}/download", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<InputStreamResource> downloadPolicy(@PathVariable Long id) {
        ByteArrayInputStream bis = pdfService.createPolicyPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=policy-" + id + ".pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    // 5. GET ALL POLICIES (Admin)
    @GetMapping("/all")
    public List<Policy> getAllPolicies() {
        return policyRepository.findAll();
    }
}