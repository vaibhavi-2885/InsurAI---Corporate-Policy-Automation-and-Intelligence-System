package com.insurai.backend.controller;

import com.insurai.backend.entity.PolicyDocument;
import com.insurai.backend.repository.PolicyDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
@CrossOrigin(origins = "http://localhost:5173") // Connects to your React Vite server
public class PolicyDocumentController {

    @Autowired
    private PolicyDocumentRepository documentRepository; // Real-world data persistence

    @PostMapping("/generate-policy")
    public Map<String, Object> generateDigitalPolicy(@RequestBody Map<String, Object> policyData) {
        // 1. Extract data (Linking to a specific user)
        String email = policyData.getOrDefault("email", "").toString();

        // 2. Real-world logic: Generate a unique Policy ID and Digital Fingerprint
        String policyNum = "POL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String hash = UUID.randomUUID().toString() + "-" + System.currentTimeMillis();

        // 3. PERSISTENCE: Save the metadata to MySQL
        PolicyDocument doc = new PolicyDocument();
        doc.setPolicyNumber(policyNum);
        doc.setUserEmail(email);
        doc.setDigitalSignatureHash(hash);
        doc.setStatus("GENERATED_&_VERIFIED");
        doc.setDownloadPath("/docs/" + policyNum + ".pdf");

        documentRepository.save(doc); // Saving to the 'policy_documents' table

        // 4. Return response to Frontend
        Map<String, Object> response = new HashMap<>();
        response.put("policyNumber", policyNum);
        response.put("status", "SUCCESS");
        response.put("digitalHash", hash);
        response.put("downloadUrl", doc.getDownloadPath());

        return response;
    }

    // 🔥 NEW: Fetch all policies for the User Dashboard/Vault
    @GetMapping("/my-policies")
    public List<PolicyDocument> getUserPolicies() {
        return documentRepository.findAll();
    }
}
