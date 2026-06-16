package com.insurai.backend.repository;

import com.insurai.backend.entity.AgentAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AgentAvailabilityRepository extends JpaRepository<AgentAvailability, Long> {

    // Find all slots for a specific agent
    List<AgentAvailability> findByAgentId(Long agentId);

    // Find a specific slot by agent and day (to prevent duplicates)
    Optional<AgentAvailability> findByAgentIdAndDayOfWeek(Long agentId, String dayOfWeek);
}