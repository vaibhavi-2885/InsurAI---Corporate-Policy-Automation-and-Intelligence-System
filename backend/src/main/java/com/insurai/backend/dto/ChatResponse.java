package com.insurai.backend.dto;

// This class maps the response body: { "response": "..." }
public class ChatResponse {
    private String response;

    // Constructor, Getters and Setters
    public ChatResponse(String response) {
        this.response = response;
    }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
}
