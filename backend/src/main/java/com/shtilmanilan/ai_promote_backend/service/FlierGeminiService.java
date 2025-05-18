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
import java.util.ArrayList;
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
        logger.info("Generating flyer styling advice using Gemini for: {}", flierInfo.title);

        try {
            // System and user prompts - updated to focus on multiple style options
            String systemPrompt = "You are an expert flyer design stylist. Given the flyer specifications, suggest 2-3 distinct style options. Each option should include: " +
                    "backgroundColor (hex), textColor (hex), accentColor (hex, optional), pattern ('dots', 'grid', 'none'), backgroundImage (URL or 'none', use user-uploaded image if requested), and designRationale (short string). " +
                    "Return only valid JSON: an array of style objects. Example: [ { backgroundColor: '#FFFFFF', textColor: '#000000', accentColor: '#FFA726', pattern: 'dots', backgroundImage: 'none', designRationale: 'A clean, modern look.' }, ... ]";
        String userPrompt = String.format(
                    "Based on these flyer details: %s, return 2-3 style options as described above. IMPORTANT: Return ONLY the JSON array with no additional text, comments, or explanations.",
                objectMapper.writeValueAsString(flierInfo)
        );

            // Gemini API endpoint (do not change)
        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

        // Build the request body for Gemini
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(
                Map.of("role", "user", "parts", List.of(Map.of("text", systemPrompt + "\n" + userPrompt)))
        ));
            requestBody.put("generationConfig", Map.of(
                "temperature", 0.3,
                "topP", 0.8,
                "topK", 40
            ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        logger.info("Sending request to Gemini API");
        Map<String, Object> response = restTemplate.postForObject(apiUrl, request, Map.class);
        logger.info("Received response from Gemini API");

            // Extract the generated text/content and clean it
        if (response != null && response.containsKey("candidates")) {
            List<?> candidates = (List<?>) response.get("candidates");
            if (!candidates.isEmpty()) {
                Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
                Map<?, ?> content = (Map<?, ?>) candidate.get("content");
                List<?> parts = (List<?>) content.get("parts");
                    
                if (!parts.isEmpty()) {
                    Map<?, ?> part = (Map<?, ?>) parts.get(0);
                    String text = (String) part.get("text");
                        
                        // Log the raw text for debugging
                        logger.debug("Gemini raw output: {}", text);
                        
                        // Extensive JSON extraction and cleaning
                        String jsonText = extractJsonFromText(text);
                        
                        // Validate it's an array
                        if (jsonText != null && !jsonText.trim().startsWith("[")) {
                            // If it's an object, wrap it as an array
                            if (jsonText.trim().startsWith("{")) {
                                jsonText = "[" + jsonText + "]";
                            } else {
                                // Failed to get valid JSON
                                logger.error("Failed to get valid JSON array from Gemini response");
                                return generateBasicStyleOptions(flierInfo);
                            }
                        }
                        
                        // Try to parse as JSON to validate
                        try {
                            objectMapper.readTree(jsonText);
                            return jsonText;
                        } catch (Exception e) {
                            logger.error("Failed to parse Gemini response as JSON: {}", e.getMessage());
                            return generateBasicStyleOptions(flierInfo);
                        }
                    }
                }
            }
            
            logger.error("Unexpected Gemini API response structure");
            return generateBasicStyleOptions(flierInfo);
            
        } catch (Exception e) {
            logger.error("Error generating flier config: {}", e.getMessage(), e);
            return generateBasicStyleOptions(flierInfo);
        }
    }
    
    /**
     * Helper method to extract JSON from text that might contain markdown or other formatting
     */
    private String extractJsonFromText(String text) {
        if (text == null) return null;
        
        // Check for JSON code block with triple backticks
        if (text.contains("```json")) {
            int startIndex = text.indexOf("```json") + 7;
            int endIndex = text.indexOf("```", startIndex);
            if (endIndex > startIndex) {
                return text.substring(startIndex, endIndex).trim();
            }
        }
        
        // Check for generic code block
        if (text.contains("```")) {
            int startIndex = text.indexOf("```") + 3;
            int endIndex = text.indexOf("```", startIndex);
            if (endIndex > startIndex) {
                return text.substring(startIndex, endIndex).trim();
            }
        }
        
        // Look for square brackets that might indicate a JSON array
        int openBracket = text.indexOf('[');
        int closeBracket = text.lastIndexOf(']');
        if (openBracket >= 0 && closeBracket > openBracket) {
            return text.substring(openBracket, closeBracket + 1).trim();
        }
        
        // Look for curly braces that might indicate a JSON object
        int openBrace = text.indexOf('{');
        int closeBrace = text.lastIndexOf('}');
        if (openBrace >= 0 && closeBrace > openBrace) {
            return text.substring(openBrace, closeBrace + 1).trim();
        }
        
        // If we get here, just return the original text and hope for the best
        return text.trim();
    }
    
    /**
     * Generate basic style options as fallback
     */
    public String generateBasicStyleOptions(FlierInfo flierInfo) {
        try {
            // Create three basic style options with different patterns
            List<Map<String, Object>> styles = new ArrayList<>();
            
            // Style 1: Grid
            Map<String, Object> gridStyle = new HashMap<>();
            gridStyle.put("backgroundColor", flierInfo.colorScheme != null && flierInfo.colorScheme.equals("warm") ? "#fff8f0" : "#ffffff");
            gridStyle.put("textColor", "#333333");
            gridStyle.put("accentColor", "#FFA726");
            gridStyle.put("pattern", "grid");
            gridStyle.put("backgroundImage", "none");
            gridStyle.put("designRationale", "Clean grid layout for organized presentation");
            styles.add(gridStyle);
            
            // Style 2: Dots
            Map<String, Object> dotsStyle = new HashMap<>();
            dotsStyle.put("backgroundColor", flierInfo.colorScheme != null && flierInfo.colorScheme.equals("warm") ? "#fff0e0" : "#f0f8ff");
            dotsStyle.put("textColor", "#222222");
            dotsStyle.put("accentColor", "#4CAF50");
            dotsStyle.put("pattern", "dots");
            dotsStyle.put("backgroundImage", "none");
            dotsStyle.put("designRationale", "Playful dots pattern for a fun, engaging look");
            styles.add(dotsStyle);
            
            // Style 3: Solid/None
            Map<String, Object> solidStyle = new HashMap<>();
            solidStyle.put("backgroundColor", flierInfo.colorScheme != null && flierInfo.colorScheme.equals("warm") ? "#ffebe0" : "#ffffff");
            solidStyle.put("textColor", "#000000");
            solidStyle.put("accentColor", "#2196F3");
            solidStyle.put("pattern", "none");
            solidStyle.put("backgroundImage", "none");
            solidStyle.put("designRationale", "Clean, minimalist design with solid background for maximum readability");
            styles.add(solidStyle);
            
            return objectMapper.writeValueAsString(styles);
        } catch (Exception e) {
            logger.error("Error generating basic style options: {}", e.getMessage());
            // Last resort fallback as a string
            return "[{\"backgroundColor\":\"#ffffff\",\"textColor\":\"#333333\",\"accentColor\":\"#FFA726\",\"pattern\":\"grid\",\"backgroundImage\":\"none\",\"designRationale\":\"Default fallback style\"}]";
        }
    }

    public String generateBasicFlierConfig(FlierInfo flierInfo) {
        try {
            Map<String, Object> config = new HashMap<>();
            
            // Basic layout structure
            config.put("layout", "standard");
            
            // Element positions
            Map<String, Object> positions = new HashMap<>();
            positions.put("image", Map.of("x", 50, "y", 40));
            config.put("elementPositions", positions);
            
            // Colors based on preferences
            Map<String, Object> colors = new HashMap<>();
            colors.put("background", flierInfo.colorScheme != null && flierInfo.colorScheme.equals("warm") ? "#fff8f0" : "#ffffff");
            colors.put("title", "#000000");
            colors.put("promotionalText", "#333333");
            config.put("colorApplications", colors);
            
            // Font selections
            Map<String, Object> fonts = new HashMap<>();
            fonts.put("title", "Heebo");
            fonts.put("promotionalText", "Assistant");
            config.put("fontSelections", fonts);
            
            // Rationale
            config.put("designRationale", "Basic layout generated as a fallback");
            
            return objectMapper.writeValueAsString(config);
        } catch (Exception e) {
            logger.error("Error generating basic flier config: {}", e.getMessage());
            return "{}";
        }
    }
} 