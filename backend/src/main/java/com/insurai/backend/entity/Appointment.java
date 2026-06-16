package com.insurai.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@Data
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "agent_id")
    private Long agentId;

    @Column(name = "appointment_date")
    private LocalDate appointmentDate;

    @Column(name = "time_slot")
    private LocalTime timeSlot;

    @Column(nullable = false)
    private String status; // 'SCHEDULED', 'CANCELLED'

    @Column(name = "meeting_link")
    private String meetingLink;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = "SCHEDULED";
        }
        if (meetingLink == null) {
            meetingLink = "Advisor confirmation pending";
        }
    }
}
