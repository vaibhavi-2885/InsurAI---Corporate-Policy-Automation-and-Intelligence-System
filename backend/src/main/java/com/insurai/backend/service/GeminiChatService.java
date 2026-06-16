package com.insurai.backend.service;

import com.insurai.backend.dto.ChatRequest;
import com.insurai.backend.dto.ChatResponse;
import com.insurai.backend.dto.ChatRequest.Message;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;

@Service
public class GeminiChatService {

    @Value("${gemini.api.key}")
    private String apiKey;

    // Use the official Gemini API URL for text generation
    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    // --- 1. Core Method to Interact with Gemini via REST ---
    public String getResponseFromGemini(List<Message> history) {

        if (apiKey == null || apiKey.isEmpty()) {
            Message latestMessage = history.get(history.size() - 1);
            return "Local InsurAI copilot is active. I can still help with policy comparisons, "
                    + "renewal guidance, claims preparation, and underwriting summaries for: "
                    + latestMessage.getContent();
        }

        // 1. Prepare the request payload structure
        // The API expects "contents" where each element is a map/object with "role" and "parts"

        List<Map<String, Object>> contents = new ArrayList<>();

        for (Message msg : history) {
            // Map the role: Frontend uses 'user'/'assistant', API accepts 'user'/'model'
            String role = msg.getRole().equals("user") ? "user" : "model";

            // Each part is a map with the text content
            Map<String, String> partMap = new HashMap<>();
            partMap.put("text", msg.getContent());

            // Each content is a map with the role and a list of parts
            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("role", role);
            contentMap.put("parts", List.of(partMap));

            contents.add(contentMap);
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", contents);

        // 2. Set up headers and entity
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // 3. Execute the API Call using RestTemplate
        try {
            RestTemplate restTemplate = new RestTemplate();

            // The API response is complex, we use a simple Map to parse it
            Map<String, Object> apiResponse = restTemplate.postForObject(
                    GEMINI_API_URL + apiKey,
                    entity,
                    Map.class
            );

            // 4. Parse the complex JSON response manually
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) apiResponse.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, String>> parts = (List<Map<String, String>>) content.get("parts");

                if (parts != null && !parts.isEmpty()) {
                    // Extract the final text response
                    return parts.get(0).get("text");
                }
            }

            return "The AI model returned an empty or unparsable response.";

        } catch (Exception e) {
            System.err.println("Gemini HTTP API Error: " + e.getMessage());
            // Ensure this error is helpful for the user
            return "Internal AI Error: Failed to connect to the external chat service. Please try again later. Error: " + e.getMessage();
        }
    }
}
