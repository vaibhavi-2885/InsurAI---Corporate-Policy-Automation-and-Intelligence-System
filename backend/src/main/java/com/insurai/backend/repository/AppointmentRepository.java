package com.insurai.backend.repository;

import com.insurai.backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    // Find all appointments for a specific customer
    List<Appointment> findByCustomerId(Long customerId);

    // NEW: Find all appointments for a specific agent
    List<Appointment> findByAgentId(Long agentId);
}