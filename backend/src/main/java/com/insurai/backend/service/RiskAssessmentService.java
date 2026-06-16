package com.insurai.backend.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class RiskAssessmentService {

    /**
     * Real-world logic: Higher score = Higher Risk.
     * Decisions: AUTO_APPROVED (<40), PENDING_REVIEW (40-70), REJECTED (>70).
     */
    public Map<String, Object> assessRisk(int age, String healthHistory, String occupation) {
        int riskScore = 0;
        String decision;

        // 1. Age Factor: Risk increases with age for life/health insurance
        if (age > 55) riskScore += 35;
        else if (age > 35) riskScore += 15;

        // 2. Health Factor: Checking for keywords indicating high-risk conditions
        String healthLower = healthHistory.toLowerCase();
        if (healthLower.contains("chronic") || healthLower.contains("heart") || healthLower.contains("diabetes")) {
            riskScore += 45;
        }

        // 3. Occupation Factor: Assessing job-related danger
        String jobLower = occupation.toLowerCase();
        if (jobLower.contains("construction") || jobLower.contains("mining") || jobLower.contains("pilot")) {
            riskScore += 25;
        }

        // 4. Decision Engine: Determining the policy status
        if (riskScore < 40) {
            decision = "AUTO_APPROVED";
        } else if (riskScore <= 70) {
            decision = "PENDING_AGENT_REVIEW";
        } else {
            decision = "REJECTED_HIGH_RISK";
        }

        Map<String, Object> response = new HashMap<>();
        response.put("riskScore", riskScore);
        response.put("decision", decision);
        response.put("estimatedMonthlyPremium", calculatePremium(riskScore)); // Real-world dynamic pricing

        return response;
    }

    private double calculatePremium(int score) {
        double basePremium = 500.0; // Base amount in ₹
        return basePremium + (score * 7.5); // Premium increases as risk score goes up
    }
}