package com.shtilmanilan.ai_promote_backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.shtilmanilan.ai_promote_backend.model.BackgroundGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.BackgroundOption;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.*;

@Service
public class BackgroundGenerationService {

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generate 3 background options using AI
     * TODO: Implement database-first approach for better quality and text contrast
     */
    public List<BackgroundOption> generateBackgrounds(BackgroundGenerationRequest request) {
        System.out.println("🎨 Background Service: Starting AI generation...");
        
        // TODO: Phase 1 - Check curated database first
        // List<BackgroundOption> databaseResults = checkCuratedDatabase(request);
        // if (databaseResults.size() >= 3) {
        //     System.out.println("✅ Found professional backgrounds in database");
        //     return databaseResults.subList(0, 3);
        // }
        
        // TODO: Phase 2 - AI-powered matching from database
        // List<BackgroundOption> aiMatched = selectFromDatabaseWithAI(request);
        // if (aiMatched.size() >= 3) {
        //     System.out.println("✅ AI selected backgrounds from database");
        //     return aiMatched.subList(0, 3);
        // }
        
        // Phase 3 - Generate with AI (current implementation)
        try {
            // Create AI prompt based on request
            String prompt = createAIPrompt(request);
            
            // Try Gemini first (cheaper), fallback to OpenAI
            List<BackgroundOption> backgrounds = null;
            
            if (geminiApiKey != null && !geminiApiKey.isEmpty()) {
                backgrounds = generateWithGemini(prompt);
            } else if (openaiApiKey != null && !openaiApiKey.isEmpty()) {
                backgrounds = generateWithOpenAI(prompt);
            }
            
            if (backgrounds != null && backgrounds.size() >= 3) {
                System.out.println("✅ AI generation successful");
                return backgrounds.subList(0, 3);
            } else {
                throw new RuntimeException("AI generation failed or insufficient results");
            }
            
        } catch (Exception e) {
            System.err.println("❌ AI generation failed: " + e.getMessage());
            return generateFallbackBackgrounds(request);
        }
    }

    /**
     * Generate backgrounds using Gemini Pro (cost-effective)
     */
    private List<BackgroundOption> generateWithGemini(String prompt) {
        try {
            System.out.println("🚀 Using Gemini Pro for background generation...");
            
            // Gemini API call structure
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contents = new HashMap<>();
            Map<String, Object> parts = new HashMap<>();
            parts.put("text", prompt);
            contents.put("parts", Arrays.asList(parts));
            requestBody.put("contents", Arrays.asList(contents));
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            
            // Parse Gemini response
            return parseGeminiResponse(response);
            
        } catch (Exception e) {
            System.err.println("❌ Gemini generation failed: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Generate backgrounds using OpenAI GPT-4 (higher quality, more expensive)
     */
    private List<BackgroundOption> generateWithOpenAI(String prompt) {
        try {
            System.out.println("🚀 Using OpenAI GPT-4 for background generation...");
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-4");
            requestBody.put("messages", Arrays.asList(
                Map.of("role", "system", "content", "You are an expert graphic designer creating professional flyer backgrounds."),
                Map.of("role", "user", "content", prompt)
            ));
            requestBody.put("max_tokens", 1500);
            requestBody.put("temperature", 0.7);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);
            
            String url = "https://api.openai.com/v1/chat/completions";
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            
            // Parse OpenAI response
            return parseOpenAIResponse(response);
            
        } catch (Exception e) {
            System.err.println("❌ OpenAI generation failed: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Create AI prompt for background generation
     */
    private String createAIPrompt(BackgroundGenerationRequest request) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("Create 3 distinct CSS background variations for a ")
              .append(request.getBusinessType()).append(" business targeting ")
              .append(request.getTargetAudience()).append(".\n\n");
        
        prompt.append("Style: ").append(request.getBackgroundStyle()).append("\n");
        prompt.append("Color Scheme: ").append(request.getColorScheme()).append("\n");
        
        if (request.getMoodKeywords() != null && !request.getMoodKeywords().isEmpty()) {
            prompt.append("Mood: ").append(String.join(", ", request.getMoodKeywords())).append("\n");
        }
        
        if (request.getColorPalette() != null) {
            prompt.append("Color Palette: ").append(request.getColorPalette().toString()).append("\n");
        }
        
        prompt.append("\nRequirements:\n");
        prompt.append("1. CRITICAL: Ensure minimum 4.5:1 contrast ratio for text readability\n");
        prompt.append("2. Use lighter background colors (#F0F0F0 to #FFFFFF range) for dark text\n");
        prompt.append("3. Avoid dark or complex gradients that make text unreadable\n");
        prompt.append("4. Test textColor against backgroundCSS for visibility\n");
        prompt.append("5. Create subtle, professional gradients (no external images)\n");
        prompt.append("6. Include high-contrast text colors (#333333 or darker)\n\n");
        
        prompt.append("Return ONLY a valid JSON array with 3 options:\n");
        prompt.append("[\n");
        prompt.append("  {\n");
        prompt.append("    \"name\": \"Style Name\",\n");
        prompt.append("    \"backgroundCSS\": \"linear-gradient(...)\",\n");
        prompt.append("    \"textColor\": \"#hexcode\",\n");
        prompt.append("    \"accentColor\": \"#hexcode\",\n");
        prompt.append("    \"description\": \"Brief description\"\n");
        prompt.append("  }\n");
        prompt.append("]");
        
        return prompt.toString();
    }

    /**
     * Parse Gemini API response
     */
    private List<BackgroundOption> parseGeminiResponse(Map<String, Object> response) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                if (parts != null && !parts.isEmpty()) {
                    String text = (String) parts.get(0).get("text");
                    return parseBackgroundJSON(text);
                }
            }
            throw new RuntimeException("Invalid Gemini response structure");
        } catch (Exception e) {
            System.err.println("❌ Failed to parse Gemini response: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Parse OpenAI API response
     */
    private List<BackgroundOption> parseOpenAIResponse(Map<String, Object> response) {
        try {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                String content = (String) message.get("content");
                return parseBackgroundJSON(content);
            }
            throw new RuntimeException("Invalid OpenAI response structure");
        } catch (Exception e) {
            System.err.println("❌ Failed to parse OpenAI response: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Parse JSON response into BackgroundOption objects
     */
    private List<BackgroundOption> parseBackgroundJSON(String jsonText) {
        try {
            // Clean up the JSON text (remove markdown formatting if present)
            String cleanJson = jsonText.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();
            
            // Parse JSON array
            List<Map<String, Object>> jsonArray;
            try {
                jsonArray = objectMapper.readValue(cleanJson, new TypeReference<List<Map<String, Object>>>() {});
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to parse JSON: " + e.getMessage(), e);
            }
            
            List<BackgroundOption> backgrounds = new ArrayList<>();
            for (Map<String, Object> item : jsonArray) {
                BackgroundOption bg = new BackgroundOption();
                bg.setName((String) item.get("name"));
                bg.setBackgroundCSS((String) item.get("backgroundCSS"));
                bg.setTextColor((String) item.get("textColor"));
                bg.setAccentColor((String) item.get("accentColor"));
                bg.setDescription((String) item.get("description"));
                bg.setSource("ai");
                backgrounds.add(bg);
            }
            
            return backgrounds;
            
        } catch (Exception e) {
            System.err.println("❌ Failed to parse background JSON: " + e.getMessage());
            System.err.println("Raw JSON: " + jsonText);
            throw e;
        }
    }

    /**
     * Generate fallback backgrounds when AI fails
     */
    public List<BackgroundOption> generateFallbackBackgrounds(BackgroundGenerationRequest request) {
        System.out.println("🛡️ Generating fallback backgrounds");
        
        Map<String, String> palette = request.getColorPalette();
        String primary = palette != null ? palette.get("primary") : "#2196F3";
        String secondary = palette != null ? palette.get("secondary") : "#FF9800";
        String accent = palette != null ? palette.get("accent") : "#4CAF50";
        String textColor = palette != null ? palette.get("textDark") : "#333333";
        
        List<BackgroundOption> fallbacks = new ArrayList<>();
        
        fallbacks.add(new BackgroundOption(
            "Clean Gradient",
            String.format("linear-gradient(135deg, %s15, %s25)", primary, secondary),
            textColor,
            accent,
            "Clean gradient background with subtle colors"
        ));
        
        fallbacks.add(new BackgroundOption(
            "Solid Professional",
            "#FFFFFF",
            textColor,
            primary,
            "Clean white background for professional look"
        ));
        
        fallbacks.add(new BackgroundOption(
            "Subtle Pattern",
            String.format("linear-gradient(45deg, %s05, %s10)", accent, primary),
            textColor,
            secondary,
            "Minimal background with subtle pattern"
        ));
        
        fallbacks.forEach(bg -> bg.setSource("fallback"));
        
        return fallbacks;
    }

    /**
     * Estimate cost for background generation
     */
    public double estimateCost(String provider) {
        Map<String, Double> costs = new HashMap<>();
        costs.put("openai-gpt4", 0.03);
        costs.put("gemini-1.5-flash", 0.002);
        costs.put("claude", 0.015);
        
        double costPerGeneration = costs.getOrDefault(provider, 0.002);
        return costPerGeneration * 3; // Cost for 3 options
    }
} 