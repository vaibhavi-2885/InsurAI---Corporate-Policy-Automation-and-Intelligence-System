package com.insurai.backend.controller;

import com.insurai.backend.dto.QuoteRequest;
import com.insurai.backend.service.QuotingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/quote")
@CrossOrigin(origins = "http://localhost:5173")
public class QuotingController {

    @Autowired
    private QuotingService quotingService;

    @PostMapping
    public ResponseEntity<BigDecimal> getQuote(@RequestBody QuoteRequest request) {
        try {
            BigDecimal premium = quotingService.calculatePremium(request);
            return ResponseEntity.ok(premium);
        } catch (RuntimeException e) {
            // Handle case where plan ID is not found
            return ResponseEntity.badRequest().body(null);
        }
    }
}