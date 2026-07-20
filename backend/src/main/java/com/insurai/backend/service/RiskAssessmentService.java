package com.insurai.backend.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class RiskAssessmentService {

    private static final String RULE_VERSION = "UW-2026.1";

    public Map<String, Object> assessRisk(int age, String healthHistory, String occupation) {
        validate(age, healthHistory, occupation);
        String health = healthHistory.toLowerCase(Locale.ROOT);
        String job = occupation.toLowerCase(Locale.ROOT);
        List<String> reasons = new ArrayList<>();
        int riskScore = 0;

        if (age >= 56) {
            riskScore += 30;
            reasons.add("Age band requires enhanced underwriting review");
        } else if (age >= 36) {
            riskScore += 12;
            reasons.add("Age band affects the base risk band");
        }
        if (containsAny(health, "chronic", "heart", "diabetes", "cancer", "stroke")) {
            riskScore += 35;
            reasons.add("Declared health condition needs a clinician or underwriter review");
        }
        if (containsAny(job, "construction", "mining", "pilot", "offshore", "firefighter")) {
            riskScore += 25;
            reasons.add("Occupation is in the enhanced-risk work category");
        }

        boolean manualReviewRequired = riskScore >= 40;
        String decision = manualReviewRequired ? "PENDING_AGENT_REVIEW" : "AUTO_APPROVED";
        if (reasons.isEmpty()) {
            reasons.add("Application is within the straight-through processing risk appetite");
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("riskScore", riskScore);
        response.put("decision", decision);
        response.put("estimatedMonthlyPremium", calculatePremium(riskScore));
        response.put("manualReviewRequired", manualReviewRequired);
        response.put("ruleVersion", RULE_VERSION);
        response.put("reasons", reasons);
        response.put("decisionConfidence", manualReviewRequired ? "REQUIRES_HUMAN_REVIEW" : "HIGH");
        return response;
    }

    private double calculatePremium(int score) {
        return BigDecimal.valueOf(500)
                .add(BigDecimal.valueOf(score).multiply(BigDecimal.valueOf(7.5)))
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private boolean containsAny(String value, String... terms) {
        for (String term : terms) {
            if (value.contains(term)) {
                return true;
            }
        }
        return false;
    }

    private void validate(int age, String healthHistory, String occupation) {
        if (age < 18 || age > 100) {
            throw new IllegalArgumentException("Age must be between 18 and 100.");
        }
        if (healthHistory == null || healthHistory.isBlank() || occupation == null || occupation.isBlank()) {
            throw new IllegalArgumentException("Health history and occupation are required for underwriting.");
        }
    }
}
