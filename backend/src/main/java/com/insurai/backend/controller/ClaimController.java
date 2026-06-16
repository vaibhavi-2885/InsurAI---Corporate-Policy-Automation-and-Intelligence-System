package com.insurai.backend.controller;

import com.insurai.backend.entity.Claim;
import com.insurai.backend.repository.ClaimRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@CrossOrigin(origins = "http://localhost:5173")
public class ClaimController {

    @Autowired
    private ClaimRepository claimRepository;

    // 1. FILE A CLAIM (User)
    @PostMapping("/file")
    public Claim fileClaim(@RequestBody Claim claim) {
        // Simple Auto-Approve Logic: If amount < $500, auto-approve!
        if (claim.getClaimAmount() < 500) {
            claim.setStatus("APPROVED");
        }
        return claimRepository.save(claim);
    }

    // 2. GET ALL CLAIMS (Admin)
    @GetMapping("/all")
    public List<Claim> getAllClaims() {
        return claimRepository.findAll();
    }

    // 3. APPROVE/REJECT CLAIM (Admin)
    @PutMapping("/{id}/status")
    public Claim updateStatus(@PathVariable Long id, @RequestBody String newStatus) {
        Claim claim = claimRepository.findById(id).orElseThrow();
        // The status comes in with quotes like "APPROVED", we remove quotes
        claim.setStatus(newStatus.replace("\"", ""));
        return claimRepository.save(claim);
    }
}