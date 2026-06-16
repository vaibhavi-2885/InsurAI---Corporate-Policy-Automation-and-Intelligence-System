package com.insurai.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class QuoteRequest {
    private Long planId;
    private Integer age;
    private String smokerStatus; // "YES" or "NO"
    private Integer termYears; // e.g., 10, 20, 30 years
}