package com.insurai.backend.controller;

import com.insurai.backend.entity.InsurancePlan;
import com.insurai.backend.repository.InsurancePlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/plans")
@CrossOrigin(origins = "http://localhost:5173")
public class PlanController {

    @Autowired
    private InsurancePlanRepository planRepository;

    // READ: Get all plans
    @GetMapping
    public List<InsurancePlan> getAllPlans() {
        return planRepository.findAll();
    }

    // CREATE: Add a new plan
    @PostMapping
    public InsurancePlan createPlan(@RequestBody InsurancePlan plan) {
        // ID should be null for a new plan, Spring Data JPA handles the save
        return planRepository.save(plan);
    }

    // UPDATE: Modify an existing plan
    @PutMapping("/{id}")
    public ResponseEntity<InsurancePlan> updatePlan(@PathVariable Long id, @RequestBody InsurancePlan planDetails) {
        return planRepository.findById(id)
                .map(plan -> {
                    // Update all fields, including the rich text ones
                    plan.setPlanName(planDetails.getPlanName());
                    plan.setCategory(planDetails.getCategory());
                    plan.setBasePremium(planDetails.getBasePremium());
                    plan.setCoverageAmount(planDetails.getCoverageAmount());
                    plan.setDescription(planDetails.getDescription());
                    plan.setFeatures(planDetails.getFeatures());
                    plan.setEligibility(planDetails.getEligibility());
                    plan.setDocumentsRequired(planDetails.getDocumentsRequired());
                    plan.setClaimProcess(planDetails.getClaimProcess());

                    InsurancePlan updatedPlan = planRepository.save(plan);
                    return ResponseEntity.ok(updatedPlan);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE: Remove a plan
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        if (!planRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        planRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}