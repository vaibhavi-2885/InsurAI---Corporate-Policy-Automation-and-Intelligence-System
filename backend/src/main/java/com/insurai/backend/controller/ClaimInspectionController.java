package com.insurai.backend.controller;

import com.insurai.backend.entity.ClaimInspection;
import com.insurai.backend.repository.ClaimInspectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/api/v1/claims")
@CrossOrigin(origins = "http://localhost:5173")
public class ClaimInspectionController {

    @Autowired
    private ClaimInspectionRepository inspectionRepository; // Integrated for persistence

    @PostMapping("/inspect")
    public Map<String, Object> inspectClaim(@RequestParam("file") MultipartFile file,
                                            @RequestParam("description") String description,
                                            @RequestParam(value = "email", required = false) String email) {

        // 1. Generate unique Claim Number
        String claimNum = "CLM-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        // 2. Advanced Logic: AI Assessment simulation
        boolean suspicious = description.toLowerCase().contains("fake") || description.toLowerCase().contains("fraud");
        double confidence = 85.0 + (Math.random() * 10); // Simulated confidence score
        double payout = suspicious ? 0.0 : 500.0 + (Math.random() * 9500);

        // 3. PERSISTENCE: Save to MySQL Database
        ClaimInspection inspection = new ClaimInspection();
        inspection.setClaimNumber(claimNum);
        inspection.setUserEmail(email);
        inspection.setDescription(description);
        inspection.setAiAssessment(suspicious ? "FLAGGED_FOR_FRAUD" : "AI_VERIFIED");
        inspection.setConfidenceScore(confidence);
        inspection.setEstimatedPayout(payout);
        inspection.setImagePath("uploads/" + file.getOriginalFilename()); // Path to evidence

        inspectionRepository.save(inspection);

        // 4. Detailed Response for Frontend
        Map<String, Object> response = new HashMap<>();
        response.put("claimNumber", claimNum);
        response.put("aiStatus", inspection.getAiAssessment());
        response.put("confidence", String.format("%.2f%%", confidence));
        response.put("estimatedPayout", payout);
        response.put("message", suspicious ? "Warning: AI flagged this claim for manual review." : "Claim verified by AI successfully.");

        return response;
    }
}
