package com.shtilmanilan.ai_promote_backend.service;

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
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClientException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GPT4ServiceImpl implements GPT4Service {
    
    private static final Logger logger = LoggerFactory.getLogger(GPT4ServiceImpl.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();
    private final String apiKey;
    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    private static final String MODEL_NAME = "gpt-4.1-mini";
    private static final List<String> SUPPORTED_IMAGE_FORMATS = Arrays.asList("png", "jpeg", "jpg", "gif", "webp");
    
    @Autowired
    public GPT4ServiceImpl(@Qualifier("gpt4ApiKey") String gpt4ApiKey) {
        this.apiKey = gpt4ApiKey;
        logger.info("GPT-4 service initialized with API key: {}", apiKey != null ? "present" : "missing");
    }
    
    @Override
    public TextGenerationResponse generateText(TextGenerationRequest request) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                logger.error("GPT-4 API key not configured");
                throw new RuntimeException("GPT-4 API key not configured");
            }
            
            // Extract image URL from the prompt
            String imageUrl = extractImageUrl(request.getPrompt());
            validateImageFormat(imageUrl);
            String promptText = request.getPrompt().replace(imageUrl, "").trim();
            
            // Set up headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            
            // Build request body according to GPT-4 Vision API format
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", MODEL_NAME);
            requestBody.put("max_tokens", 4000);
            
            // Set temperature if provided, otherwise use a default
            double temperature = request.getTemperature() != null ? request.getTemperature() : 0.7;
            requestBody.put("temperature", temperature);
            
            // Create messages array with a single user message
            List<Map<String, Object>> messages = new ArrayList<>();
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            
            // Create content array with text and image
            List<Map<String, Object>> contents = new ArrayList<>();
            
            // Add text content
            Map<String, Object> textContent = new HashMap<>();
            textContent.put("type", "text");
            textContent.put("text", promptText.isEmpty() ? "What's in this image?" : promptText);
            contents.add(textContent);
            
            // Add image content
            Map<String, Object> imageContent = new HashMap<>();
            imageContent.put("type", "image_url");
            
            // Create image_url object with url and detail level
            Map<String, Object> imageUrlObj = new HashMap<>();
            imageUrlObj.put("url", imageUrl);
            imageUrlObj.put("detail", "high");
            
            imageContent.put("image_url", imageUrlObj);
            contents.add(imageContent);
            
            message.put("content", contents);
            messages.add(message);
            requestBody.put("messages", messages);
            
            // Log request details for debugging
            logger.debug("Sending request to GPT-4 Vision API with body: {}", objectMapper.writeValueAsString(requestBody));
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            try {
                // Make request to OpenAI API
                ResponseEntity<String> response = restTemplate.postForEntity(
                    OPENAI_API_URL,
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
                
            } catch (HttpClientErrorException e) {
                // Handle 4xx errors
                String errorBody = e.getResponseBodyAsString();
                logger.error("OpenAI API client error: {} - {}", e.getStatusCode(), errorBody);
                switch (e.getRawStatusCode()) {
                    case 401:
                        throw new RuntimeException("Invalid API key or unauthorized access");
                    case 429:
                        throw new RuntimeException("Rate limit exceeded or quota reached");
                    case 400:
                        throw new RuntimeException("Invalid request: " + errorBody);
                    default:
                        throw new RuntimeException("OpenAI API error: " + errorBody);
                }
            } catch (HttpServerErrorException e) {
                // Handle 5xx errors
                logger.error("OpenAI API server error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
                throw new RuntimeException("OpenAI service is currently unavailable");
            } catch (RestClientException e) {
                // Handle other REST client errors
                logger.error("REST client error while calling OpenAI API", e);
                throw new RuntimeException("Error communicating with OpenAI service");
            }
            
        } catch (Exception e) {
            logger.error("Error in GPT-4 Vision API call: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate text with GPT-4 Vision: " + e.getMessage());
        }
    }
    
    private String extractImageUrl(String prompt) {
        // Find the first URL in the prompt
        String[] words = prompt.split("\\s+");
        for (String word : words) {
            if (word.startsWith("http://") || word.startsWith("https://")) {
                return word;
            }
        }
        throw new RuntimeException("No image URL found in prompt");
    }

    private void validateImageFormat(String imageUrl) {
        String lowercaseUrl = imageUrl.toLowerCase();
        boolean isValidFormat = SUPPORTED_IMAGE_FORMATS.stream()
            .anyMatch(format -> lowercaseUrl.endsWith("." + format));
        
        if (!isValidFormat) {
            throw new RuntimeException(
                "Unsupported image format. Supported formats are: " + 
                String.join(", ", SUPPORTED_IMAGE_FORMATS)
            );
        }
    }
} 