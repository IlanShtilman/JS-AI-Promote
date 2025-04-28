package com.shtilmanilan.ai_promote_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shtilmanilan.ai_promote_backend.model.FlierInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FlierGeminiService {
    private static final Logger logger = LoggerFactory.getLogger(FlierGeminiService.class);

    @Value("${GEMINI_API_KEY}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateFlierConfig(FlierInfo flierInfo) throws Exception {
        logger.info("Generating flyer config using Gemini for: {}", flierInfo.title);

        // System and user prompts
        String systemPrompt = "You are an expert flyer designer. Analyze the provided specifications and return a structured flyer design. " +
                "Return only valid JSON following the specified schema. Focus on readability and visual hierarchy while maintaining brand colors.";
        String userPrompt = String.format(
                "Generate a promotional flyer design based on these specifications: %s. " +
                "Return a JSON object with the following structure: {layout: string, elementPositions: object, colorApplications: object, fontSelections: object, designRationale: string}",
                objectMapper.writeValueAsString(flierInfo)
        );

        // Gemini API endpoint (adjust if needed)
        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

        // Build the request body for Gemini
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(
                Map.of("role", "user", "parts", List.of(Map.of("text", systemPrompt + "\n" + userPrompt)))
        ));
        requestBody.put("generationConfig", Map.of("temperature", 0.3));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        logger.info("Sending request to Gemini API");
        Map<String, Object> response = restTemplate.postForObject(apiUrl, request, Map.class);
        logger.info("Received response from Gemini API");
        logger.info("Full Gemini API response: {}", response);

        // Extract the generated text/content
        if (response != null && response.containsKey("candidates")) {
            List<?> candidates = (List<?>) response.get("candidates");
            if (!candidates.isEmpty()) {
                Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
                Map<?, ?> content = (Map<?, ?>) candidate.get("content");
                List<?> parts = (List<?>) content.get("parts");
                if (!parts.isEmpty()) {
                    Map<?, ?> part = (Map<?, ?>) parts.get(0);
                    String text = (String) part.get("text");
                    // Remove markdown code block if present
                    if (text.startsWith("```json")) {
                        text = text.substring(7); // Remove "```json\n"
                    }
                    if (text.endsWith("```")) {
                        text = text.substring(0, text.length() - 3); // Remove ending "```"
                    }
                    text = text.trim();
                    logger.debug("Gemini raw output: {}", text);
                    return text;
                }
            }
        }
        throw new RuntimeException("No valid response from Gemini API");
    }
} 