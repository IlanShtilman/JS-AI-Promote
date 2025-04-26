package com.shtilmanilan.ai_promote_backend.service;

import com.shtilmanilan.ai_promote_backend.model.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiServiceImpl implements GeminiService {
    
    private static final Logger logger = LoggerFactory.getLogger(GeminiServiceImpl.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final String apiKey;
    
    @Autowired
    public GeminiServiceImpl(@Qualifier("geminiApiKey") String geminiApiKey) {
        this.apiKey = geminiApiKey;
        logger.info("Gemini service initialized with API key: {}", apiKey != null ? "present" : "missing");
    }
    
    @Override
    public TextGenerationResponse generateText(TextGenerationRequest request) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                throw new IllegalStateException("Gemini API key is not configured");
            }
            
            try {
                // Use Google's Gemini API directly via REST
                String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
                
                // Set up headers
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                
                // Build request body
                Map<String, Object> requestBody = new HashMap<>();
                
                Map<String, Object> contents = new HashMap<>();
                Map<String, Object> part = new HashMap<>();
                part.put("text", request.getPrompt());
                List<Map<String, Object>> partsList = new ArrayList<>();
                partsList.add(part);
                contents.put("parts", partsList);
                
                List<Map<String, Object>> contentsList = new ArrayList<>();
                contentsList.add(contents);
                requestBody.put("contents", contentsList);
                
                Map<String, Object> generationConfig = new HashMap<>();
                generationConfig.put("temperature", request.getTemperature());
                generationConfig.put("maxOutputTokens", 150);
                requestBody.put("generationConfig", generationConfig);
                
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                
                // Make request
                ResponseEntity<Map> response = restTemplate.postForEntity(
                    apiUrl,
                    entity,
                    Map.class
                );
                
                // Parse response
                Map responseBody = response.getBody();
                if (responseBody != null) {
                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                    if (candidates != null && !candidates.isEmpty()) {
                        Map<String, Object> candidate = candidates.get(0);
                        Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                        List<Map<String, Object>> responseParts = (List<Map<String, Object>>) content.get("parts");
                        String generatedText = (String) responseParts.get(0).get("text");
                        
                        TextGenerationResponse textResponse = new TextGenerationResponse();
                        textResponse.setGeneratedText(generatedText.trim());
                        return textResponse;
                    }
                }
                
                throw new RuntimeException("Failed to parse Gemini response");
            } catch (Exception e) {
                logger.error("Gemini API error: {}", e.getMessage());
                
                // Return a user-friendly fallback response
                TextGenerationResponse fallbackResponse = new TextGenerationResponse();
                fallbackResponse.setGeneratedText("Sorry, we couldn't generate a response with Gemini at this time. Please try again later.");
                return fallbackResponse;
            }
        } catch (Exception e) {
            logger.error("Error in generateText: {}", e.getMessage());
            throw e;
        }
    }
} 