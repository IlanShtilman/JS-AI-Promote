package com.shtilmanilan.ai_promote_backend.service.openai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.RestTemplate;
import com.shtilmanilan.ai_promote_backend.service.gemini.GeminiService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenAIServiceImpl implements OpenAIService {
    
    private static final Logger logger = LoggerFactory.getLogger(OpenAIServiceImpl.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();
    private final String apiKey;
    private final GeminiService geminiService;
    
    @Autowired
    public OpenAIServiceImpl(String openaiApiKey, GeminiService geminiService) {
        this.apiKey = openaiApiKey;
        this.geminiService = geminiService;
        logger.info("OpenAI service initialized with API key: {}", apiKey != null ? "present" : "missing");
    }
    
    @Override
    public TextGenerationResponse generateText(TextGenerationRequest request) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                logger.info("OpenAI API key not configured, falling back to Gemini");
                return geminiService.generateText(request);
            }
            
            // Try to generate the text with OpenAI using direct HTTP
            try {
                // Set up headers
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(apiKey);
                
                // Build request body
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", "gpt-3.5-turbo");
                
                List<Map<String, String>> messages = new ArrayList<>();
                Map<String, String> message = new HashMap<>();
                message.put("role", "user");
                message.put("content", request.getPrompt());
                messages.add(message);
                requestBody.put("messages", messages);
                
                requestBody.put("temperature", request.getTemperature());
                requestBody.put("max_tokens", 2000);
                
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                
                // Make request
                ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/chat/completions", 
                    entity,
                    String.class
                );
                
                // Parse response
                JsonNode responseNode = objectMapper.readTree(response.getBody());
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
                logger.error("OpenAI API error: {}", e.getMessage());
                
                // Check for quota exceeded error
                String errorMessage = e.getMessage();
                if (errorMessage != null && errorMessage.contains("insufficient_quota")) {
                    logger.info("OpenAI quota exceeded, falling back to Gemini");
                    return geminiService.generateText(request);
                }
                
                // Return a user-friendly fallback response
                TextGenerationResponse fallbackResponse = new TextGenerationResponse();
                fallbackResponse.setGeneratedText("Sorry, we couldn't generate a response at this time. Please try again later.");
                return fallbackResponse;
            }
        } catch (Exception e) {
            logger.error("Error in generateText: {}", e.getMessage());
            throw e;
        }
    }
} 