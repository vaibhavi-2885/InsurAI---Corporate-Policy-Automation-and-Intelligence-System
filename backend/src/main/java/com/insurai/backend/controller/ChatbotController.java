package com.insurai.backend.controller;

import com.insurai.backend.dto.ChatRequest;
import com.insurai.backend.dto.ChatResponse;
import com.insurai.backend.service.GeminiChatService; // 👈 Import the new service
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatbotController {

    @Autowired
    private GeminiChatService chatService; // 👈 Autowire the new service

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> handleChat(@RequestBody ChatRequest request) {

        if (request.getHistory() == null || request.getHistory().isEmpty()) {
            return ResponseEntity.badRequest().body(new ChatResponse("Please provide a message."));
        }

        // 🚨 PASS THE FULL HISTORY TO THE GEMINI SERVICE
        String responseText = chatService.getResponseFromGemini(request.getHistory());

        return ResponseEntity.ok(new ChatResponse(responseText));
    }
}