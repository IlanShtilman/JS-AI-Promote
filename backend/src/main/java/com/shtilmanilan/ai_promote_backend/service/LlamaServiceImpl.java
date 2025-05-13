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
public class LlamaServiceImpl implements LlamaService {
    
    private static final Logger logger = LoggerFactory.getLogger(LlamaServiceImpl.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();
    private final String apiKey;
    
    @Autowired
    public LlamaServiceImpl(@Qualifier("openRouterApiKey") String openRouterApiKey) {
        this.apiKey = openRouterApiKey;
        logger.info("Llama service initialized with OpenRouter API key: {}", apiKey != null ? "present" : "missing");
    }
    
    @Override
    public TextGenerationResponse generateText(TextGenerationRequest request) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                logger.error("OpenRouter API key not configured");
                throw new RuntimeException("OpenRouter API key not configured");
            }
            
            // Set up headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("HTTP-Referer", "http://localhost:3000"); // Required by OpenRouter
            headers.set("X-Title", "AI Promote Backend"); // Optional but recommended
            
            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "meta-llama/llama-4-maverick"); // OpenRouter model ID
            requestBody.put("max_tokens", 2000);
            requestBody.put("temperature", request.getTemperature());
            
            List<Map<String, String>> messages = new ArrayList<>();
            
            // Add system message
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", "You are an expert AI image enhancement specialist. Your task is to analyze image URLs and provide specific enhancement instructions in JSON format. " +
                "You should infer the image type and content from the URL and provide appropriate enhancement settings. " +
                "Consider common enhancement needs for different types of images (photos, art, products, etc.). " +
                "Always return valid JSON that strictly follows the requested format, with no additional text or explanation. " +
                "Focus on natural-looking enhancements that preserve the original style while improving image quality. ");
            messages.add(systemMessage);
            
            // Add user message
            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", request.getPrompt());
            messages.add(userMessage);
            
            requestBody.put("messages", messages);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Make request to OpenRouter API
            ResponseEntity<String> response = restTemplate.postForEntity(
                "https://openrouter.ai/api/v1/chat/completions", 
                entity,
                String.class
            );
            
            // Check response status
            if (!response.getStatusCode().is2xxSuccessful()) {
                logger.error("OpenRouter API returned non-2xx status: {}", response.getStatusCode());
                logger.error("Response body: {}", response.getBody());
                throw new RuntimeException("OpenRouter API call failed with status: " + response.getStatusCode());
            }
            
            // Parse response
            JsonNode responseNode;
            try {
                responseNode = objectMapper.readTree(response.getBody());
            } catch (JsonProcessingException e) {
                logger.error("Error parsing OpenRouter API response: {}", e.getMessage());
                logger.error("Response body: {}", response.getBody());
                throw new RuntimeException("Error parsing OpenRouter API response", e);
            }
            
            String generatedText = responseNode
                .path("choices")
                .path(0)
                .path("message")
                .path("content")
                .asText()
                .trim();
            
            TextGenerationResponse textResponse = new TextGenerationResponse();
            textResponse.setGeneratedText(generatedText);
            return textResponse;
            
        } catch (Exception e) {
            logger.error("Error in generateText: {}", e.getMessage());
            throw new RuntimeException("Failed to generate text with Llama: " + e.getMessage(), e);
        }
    }
} 