package com.insurai.backend.controller;

import com.insurai.backend.entity.Grievance;
import com.insurai.backend.repository.GrievanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; // <-- FIX: Added missing import
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grievances")
@CrossOrigin(origins = "http://localhost:5173")
public class GrievanceController {

    @Autowired
    private GrievanceRepository grievanceRepository;

    // 1. CUSTOMER SUBMISSION (POST)
    @PostMapping("/submit")
    public Grievance submitGrievance(@RequestBody Grievance grievance) {
        // Automatically set status to NEW upon submission
        grievance.setStatus("NEW");
        return grievanceRepository.save(grievance);
    }

    // 2. ADMIN VIEW (GET ALL)
    @GetMapping("/all")
    public List<Grievance> getAllGrievances() {
        return grievanceRepository.findAll();
    }

    // 3. ADMIN ACTION (PUT STATUS - e.g., Mark as RESOLVED)
    @PutMapping("/{id}/status")
    public ResponseEntity<Grievance> updateGrievanceStatus(@PathVariable Long id, @RequestBody String newStatus) {
        return grievanceRepository.findById(id)
                .map(grievance -> {
                    // Update the status using the clean string from React
                    grievance.setStatus(newStatus.replace("\"", ""));
                    return ResponseEntity.ok(grievanceRepository.save(grievance));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}