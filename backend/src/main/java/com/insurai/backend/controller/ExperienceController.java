package com.insurai.backend.controller;

import com.insurai.backend.service.ExperienceService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/experience")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class ExperienceController {

    private final ExperienceService experienceService;

    public ExperienceController(ExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    @GetMapping("/home")
    public Map<String, Object> getHomeExperience() {
        return experienceService.getHomeExperience();
    }

    @GetMapping("/customer")
    public Map<String, Object> getCustomerExperience() {
        return experienceService.getCustomerExperience(null);
    }

    @GetMapping("/customer/{userId}")
    public Map<String, Object> getCustomerExperience(@PathVariable Long userId) {
        return experienceService.getCustomerExperience(userId);
    }

    @GetMapping("/operations")
    public Map<String, Object> getOperationsExperience() {
        return experienceService.getOperationsExperience();
    }

    @GetMapping("/claims")
    public Map<String, Object> getClaimsExperience() {
        return experienceService.getClaimsExperience();
    }

    @GetMapping("/control-tower")
    public Map<String, Object> getControlTowerExperience() {
        return experienceService.getControlTowerExperience();
    }

    @PostMapping("/copilot")
    public Map<String, Object> askCopilot(@RequestBody Map<String, String> request) {
        return experienceService.askCopilot(request.get("persona"), request.get("question"));
    }

    @PostMapping("/callback")
    public Map<String, Object> requestCallback(@RequestBody Map<String, String> request) {
        return experienceService.requestCallback(request);
    }
}
