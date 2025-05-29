package com.shtilmanilan.ai_promote_backend.service.groq;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationResponse;
import com.shtilmanilan.ai_promote_backend.service.gemini.GeminiService;
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
public class GroqServiceImpl implements GroqService {
    
    private static final Logger logger = LoggerFactory.getLogger(GroqServiceImpl.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();
    private final String apiKey;
    private final GeminiService geminiService;
    
    @Autowired
    public GroqServiceImpl(@Qualifier("groqApiKey") String groqApiKey, GeminiService geminiService) {
        this.apiKey = groqApiKey;
        this.geminiService = geminiService;
        logger.info("Groq service initialized with API key: {}", apiKey != null ? "present" : "missing");
    }
    
    @Override
    public TextGenerationResponse generateText(TextGenerationRequest request) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                logger.info("Groq API key not configured, falling back to Gemini");
                return geminiService.generateText(request);
            }
            
            try {
                // Set up headers
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setAccept(List.of(MediaType.APPLICATION_JSON));
                headers.setBearerAuth(apiKey);
                
                // Build request body
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", "llama3-70b-8192");
                requestBody.put("max_tokens", 150);
                requestBody.put("temperature", request.getTemperature());
                
                List<Map<String, String>> messages = new ArrayList<>();
                
                // Add system message
                Map<String, String> systemMessage = new HashMap<>();
                systemMessage.put("role", "system");
                systemMessage.put("content", "You are a bilingual assistant that can write in both English and Hebrew. When the input is in Hebrew, respond in Hebrew. When the input is in English, respond in English. Write promotional text exactly as requested, without any prefixes or additions. The text should be in two lines with a line break between them.");
                messages.add(systemMessage);
                
                // Add user message
                Map<String, String> userMessage = new HashMap<>();
                userMessage.put("role", "user");
                userMessage.put("content", request.getPrompt());
                messages.add(userMessage);
                
                requestBody.put("messages", messages);
                
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                
                // Make request
                ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.groq.com/openai/v1/chat/completions", 
                    entity,
                    String.class
                );
                
                // Check response status
                if (!response.getStatusCode().is2xxSuccessful()) {
                    logger.error("Groq API returned non-2xx status: {}", response.getStatusCode());
                    logger.error("Response body: {}", response.getBody());
                    throw new RuntimeException("Groq API call failed with status: " + response.getStatusCode());
                }
                
                // Parse response
                JsonNode responseNode;
                try {
                    responseNode = objectMapper.readTree(response.getBody());
                } catch (JsonProcessingException e) {
                    logger.error("Error parsing Groq API response: {}", e.getMessage());
                    logger.error("Response body: {}", response.getBody());
                    throw new RuntimeException("Error parsing Groq API response", e);
                }
                
                String generatedText = responseNode
                    .path("choices")
                    .path(0)
                    .path("message")
                    .path("content")
                    .asText()
                    .trim();
                
                // Remove any prefixes using Java regex
                generatedText = generatedText.replaceAll("^[^\\p{L}\\w]*|^.*?:", "").trim();
                
                TextGenerationResponse textResponse = new TextGenerationResponse();
                textResponse.setGeneratedText(generatedText);
                return textResponse;
            } catch (Exception e) {
                logger.error("Groq API error: {}", e.getMessage());
                
                // Check for rate limit error
                String errorMessage = e.getMessage();
                if (errorMessage != null && (errorMessage.contains("429") || errorMessage.contains("rate limit") || errorMessage.contains("rate_limit"))) {
                    logger.info("Groq rate limit exceeded, falling back to Gemini");
                    return geminiService.generateText(request);
                }
                
                // For other errors, still try fallback
                logger.info("Groq error, falling back to Gemini");
                return geminiService.generateText(request);
            }
        } catch (Exception e) {
            logger.error("Error in generateText: {}", e.getMessage());
            throw e;
        }
    }
} 