package com.insurai.backend.controller;

import com.insurai.backend.entity.Appointment;
import com.insurai.backend.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; // 👈 Added missing import for ResponseEntity
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional; // 👈 Added missing import for Optional

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @PostMapping("/book")
    public Appointment bookAppointment(@RequestBody Appointment appointment) {
        // NOTE: A real meeting link should be generated here.
        // For testing, you might want to set a dummy link, e.g., appointment.setMeetingLink("https://meet.google.com/xyz");
        return appointmentRepository.save(appointment);
    }

    // Get appointments for a CUSTOMER
    @GetMapping("/user/{userId}")
    public List<Appointment> getUserAppointments(@PathVariable Long userId) {
        return appointmentRepository.findByCustomerId(userId);
    }

    // Get appointments for an AGENT
    @GetMapping("/agent/{agentId}")
    public List<Appointment> getAgentAppointments(@PathVariable Long agentId) {
        return appointmentRepository.findByAgentId(agentId);
    }

    // 🔥 NEW: Endpoint to cancel an existing appointment
    @PutMapping("/cancel/{appointmentId}")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long appointmentId) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);

        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();

            // 1. Check current status to prevent cancelling an already finalized appointment
            if ("COMPLETED".equals(appointment.getStatus()) || "CANCELLED".equals(appointment.getStatus())) {
                return ResponseEntity.badRequest().body("Appointment is already finalized (Completed or Cancelled).");
            }

            // 2. Update the status
            appointment.setStatus("CANCELLED");
            appointmentRepository.save(appointment);

            return ResponseEntity.ok("Appointment successfully cancelled.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}