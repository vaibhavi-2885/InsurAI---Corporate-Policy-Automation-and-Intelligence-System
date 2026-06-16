package com.insurai.backend.dto;

import java.util.List;

// This class maps the entire JSON body: { "history": [...] }
public class ChatRequest {
    private List<Message> history;

    // Getters and Setters
    public List<Message> getHistory() { return history; }
    public void setHistory(List<Message> history) { this.history = history; }

    // Nested class to represent each message in the history
    public static class Message {
        private String role; // "user" or "assistant"
        private String content;

        // Getters and Setters
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}