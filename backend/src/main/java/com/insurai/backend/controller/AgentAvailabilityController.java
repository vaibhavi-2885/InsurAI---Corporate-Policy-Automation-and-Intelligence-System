package com.insurai.backend.controller;

import com.insurai.backend.entity.AgentAvailability;
import com.insurai.backend.repository.AgentAvailabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus; // 👈 Added for HttpStatus
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin(origins = "http://localhost:5173")
public class AgentAvailabilityController {

    @Autowired
    private AgentAvailabilityRepository availabilityRepository;

    // GET all availability for a specific agent
    @GetMapping("/agent/{agentId}")
    public List<AgentAvailability> getAvailabilityByAgent(@PathVariable Long agentId) {
        return availabilityRepository.findByAgentId(agentId);
    }

    // ----------------------------------------------------------------------
    // 🔥 NEW/CORRECTED ENDPOINTS TO SUPPORT FRONTEND AgentAvailability.jsx
    // ----------------------------------------------------------------------

    // 1. Create a NEW Availability Slot (Used by frontend when slot.id is null)
    @PostMapping
    public ResponseEntity<?> createAvailability(@RequestBody AgentAvailability newSlot) {
        // Validation: Check if day already exists (prevents database constraint violation)
        Optional<AgentAvailability> existingSlot = availabilityRepository.findByAgentIdAndDayOfWeek(
                newSlot.getAgentId(), newSlot.getDayOfWeek()
        );
        if (existingSlot.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Availability slot for " + newSlot.getDayOfWeek() + " already exists. Use PUT to update.");
        }

        // Simple time validation (optional, but good practice)
        if (newSlot.getIsAvailable() && newSlot.getStartTime().isAfter(newSlot.getEndTime())) {
            return ResponseEntity.badRequest().body("Start time must be before End time when setting availability.");
        }

        // Create new slot
        return ResponseEntity.status(HttpStatus.CREATED).body(availabilityRepository.save(newSlot));
    }


    // 2. Update an Existing Availability Slot (Used by frontend when slot.id is present)
    @PutMapping("/{id}")
    public ResponseEntity<AgentAvailability> updateAvailability(@PathVariable Long id, @RequestBody AgentAvailability updatedSlot) {
        Optional<AgentAvailability> existingSlotOpt = availabilityRepository.findById(id);

        if (existingSlotOpt.isPresent()) {
            AgentAvailability slot = existingSlotOpt.get();

            // Time validation
            if (updatedSlot.getIsAvailable() && updatedSlot.getStartTime().isAfter(updatedSlot.getEndTime())) {
                return ResponseEntity.badRequest().body(null); // Return empty body on bad request
            }

            // Update fields
            slot.setStartTime(updatedSlot.getStartTime());
            slot.setEndTime(updatedSlot.getEndTime());
            slot.setIsAvailable(updatedSlot.getIsAvailable());

            return ResponseEntity.ok(availabilityRepository.save(slot));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ----------------------------------------------------------------------

    // DELETE a slot (Remains the same)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAvailability(@PathVariable Long id) {
        availabilityRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}