package com.insurai.backend.controller;
import com.insurai.backend.entity.PolicyAmendment;
import com.insurai.backend.repository.PolicyAmendmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/amendments")
@CrossOrigin(origins = "http://localhost:5173")
public class PolicyAmendmentController {

    @Autowired
    private PolicyAmendmentRepository amendmentRepository;

    // 1. CUSTOMER SUBMISSION (POST) - Logs the new request in PENDING status
    @PostMapping("/submit")
    public PolicyAmendment submitAmendment(@RequestBody PolicyAmendment amendment) {
        return amendmentRepository.save(amendment);
    }

    // 2. ADMIN VIEW (GET PENDING) - Fetches the queue for Admin review
    @GetMapping("/pending")
    public List<PolicyAmendment> getPendingAmendments() {
        return amendmentRepository.findByStatus("PENDING");
    }

    // 3. ADMIN ACTION (PUT STATUS) - Approves or Rejects a specific request
    @PutMapping("/{id}/status")
    public ResponseEntity<PolicyAmendment> updateAmendmentStatus(@PathVariable Long id, @RequestBody String newStatus) {
        Optional<PolicyAmendment> amendmentOpt = amendmentRepository.findById(id);

        if (amendmentOpt.isPresent()) {
            PolicyAmendment amendment = amendmentOpt.get();
            // Clean the status string from React (removes quotes)
            amendment.setStatus(newStatus.replace("\"", ""));

            // NOTE: In a real enterprise app, logic to update the master policy/user details 
            // in the 'policies' or 'users' table would be executed here if status is "APPROVED".

            return ResponseEntity.ok(amendmentRepository.save(amendment));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}