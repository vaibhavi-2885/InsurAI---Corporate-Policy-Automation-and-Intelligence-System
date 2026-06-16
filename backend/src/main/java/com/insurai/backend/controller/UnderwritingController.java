package com.insurai.backend.controller;

import com.insurai.backend.entity.UnderwritingLog;
import com.insurai.backend.repository.UnderwritingLogRepository;
import com.insurai.backend.service.RiskAssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/underwriting")
@CrossOrigin(origins = "http://localhost:5173") // Connects to your React/Vite development server
public class UnderwritingController {

    @Autowired
    private RiskAssessmentService riskService;

    @Autowired
    private UnderwritingLogRepository logRepository; // Injected for real data persistence

    @PostMapping("/evaluate")
    public Map<String, Object> evaluateUser(@RequestBody Map<String, Object> requestData) {
        // 1. Extract data from request
        int age = Integer.parseInt(requestData.get("age").toString());
        String health = requestData.get("healthHistory").toString();
        String occupation = requestData.get("occupation").toString();

        // 2. Execute Real-World Risk Logic
        Map<String, Object> result = riskService.assessRisk(age, health, occupation);

        // 3. REAL-WORLD DATA PERSISTENCE: Saving to MySQL
        UnderwritingLog log = new UnderwritingLog();
        log.setUserEmail(requestData.getOrDefault("email", "").toString());
        log.setRiskScore((int) result.get("riskScore"));
        log.setDecision(result.get("decision").toString());
        log.setPremium((double) result.get("estimatedMonthlyPremium"));

        logRepository.save(log); // Persists the decision for auditability

        return result;
    }
}
