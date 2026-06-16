package com.insurai.backend.service;

import com.insurai.backend.dto.QuoteRequest;
import com.insurai.backend.entity.InsurancePlan;
import com.insurai.backend.repository.InsurancePlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class QuotingService {

    @Autowired
    private InsurancePlanRepository planRepository;

    // Core Logic to Calculate Personalized Premium
    public BigDecimal calculatePremium(QuoteRequest request) {
        // 1. Get the base plan data
        InsurancePlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("Plan not found."));

        BigDecimal basePremium = plan.getBasePremium();
        BigDecimal multiplier = BigDecimal.ONE;

        // --- BUSINESS RULES ENGINE ---

        // 2. Age Factor: Higher Age means Higher Risk/Premium
        if (request.getAge() > 45) {
            multiplier = multiplier.add(new BigDecimal("0.30")); // +30% for 45+
        } else if (request.getAge() > 30) {
            multiplier = multiplier.add(new BigDecimal("0.10")); // +10% for 30-45
        }

        // 3. Smoker Status Factor
        if ("YES".equalsIgnoreCase(request.getSmokerStatus())) {
            multiplier = multiplier.add(new BigDecimal("0.50")); // +50% for Smokers
        }

        // 4. Term Factor: Longer Term may slightly reduce annual rate (for Term/Life plans)
        if (plan.getCategory().equals("LIFE") || plan.getCategory().equals("INVESTMENT")) {
            if (request.getTermYears() > 20) {
                multiplier = multiplier.subtract(new BigDecimal("0.05")); // -5% discount for long term
            }
        }

        // 5. Calculate Final Premium and round to 2 decimals
        BigDecimal finalPremium = basePremium.multiply(multiplier);

        // Ensure minimum premium is applied (e.g., cannot be negative)
        if (finalPremium.compareTo(plan.getBasePremium().multiply(new BigDecimal("0.5"))) < 0) {
            finalPremium = plan.getBasePremium().multiply(new BigDecimal("0.5"));
        }

        return finalPremium.setScale(2, RoundingMode.HALF_UP);
    }
}