package com.shtilmanilan.ai_promote_backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ClaudeServiceImpl implements ClaudeService {
    
    private static final Logger logger = LoggerFactory.getLogger(ClaudeServiceImpl.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();
    private final String apiKey;
    
    @Autowired
    public ClaudeServiceImpl(@Qualifier("claudeApiKey") String claudeApiKey) {
        this.apiKey = claudeApiKey;
        logger.info("Claude service initialized with API key: {}", apiKey != null ? "present" : "missing");
    }
    
    @Override
    public TextGenerationResponse generateText(TextGenerationRequest request) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                logger.error("Claude API key not configured");
                throw new RuntimeException("Claude API key not configured");
            }
            
            // Set up headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");
            
            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "claude-3-opus-20240229");
            requestBody.put("max_tokens", 150);
            requestBody.put("temperature", request.getTemperature());
            
            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", request.getPrompt());
            messages.add(message);
            requestBody.put("messages", messages);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Make request
            ResponseEntity<String> response = restTemplate.postForEntity(
                "https://api.anthropic.com/v1/messages", 
                entity,
                String.class
            );
            
            // Parse response
            JsonNode responseNode;
            try {
                responseNode = objectMapper.readTree(response.getBody());
            } catch (JsonProcessingException e) {
                logger.error("Error parsing Claude API response: {}", e.getMessage());
                throw new RuntimeException("Error parsing Claude API response", e);
            }
            
            String generatedText = responseNode
                .path("content")
                .path(0)
                .path("text")
                .asText()
                .trim();
            
            TextGenerationResponse textResponse = new TextGenerationResponse();
            textResponse.setGeneratedText(generatedText);
            return textResponse;
        } catch (Exception e) {
            logger.error("Error in generateText: {}", e.getMessage());
            throw e;
        }
    }
} 