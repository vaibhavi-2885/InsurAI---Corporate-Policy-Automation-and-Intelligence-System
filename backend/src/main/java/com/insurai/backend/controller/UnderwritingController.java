package com.insurai.backend.controller;

import com.insurai.backend.entity.UnderwritingLog;
import com.insurai.backend.repository.UnderwritingLogRepository;
import com.insurai.backend.service.RiskAssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Map<String, Object>> evaluateUser(@RequestBody Map<String, Object> requestData) {
        try {
            int age = Integer.parseInt(String.valueOf(requestData.get("age")));
            String health = String.valueOf(requestData.get("healthHistory"));
            String occupation = String.valueOf(requestData.get("occupation"));
            Map<String, Object> result = riskService.assessRisk(age, health, occupation);

            UnderwritingLog log = new UnderwritingLog();
            log.setUserEmail(String.valueOf(requestData.getOrDefault("email", "")));
            log.setRiskScore((int) result.get("riskScore"));
            log.setDecision(result.get("decision").toString());
            log.setPremium((double) result.get("estimatedMonthlyPremium"));
            log.setRuleVersion(result.get("ruleVersion").toString());
            log.setManualReviewRequired((boolean) result.get("manualReviewRequired"));
            log.setDecisionReasons(String.join(" | ", (Iterable<String>) result.get("reasons")));

            UnderwritingLog saved = logRepository.save(log);
            result.put("evaluationReference", saved.getEvaluationReference());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }
    }
}
