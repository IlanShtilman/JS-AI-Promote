package com.shtilmanilan.ai_promote_backend.service.background;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.shtilmanilan.ai_promote_backend.model.background.BackgroundGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.background.BackgroundOption;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.*;

/**
 * CSS Background Generation Service
 * 
 * Generates CSS-based backgrounds using AI text generation models.
 * Fast and cost-effective solution for creating gradient and pattern backgrounds.
 * 
 * Features:
 * - Gemini Pro integration (~$0.002 per generation)
 * - OpenAI GPT-4 fallback (~$0.03 per generation) 
 * - Smart fallback backgrounds when AI fails
 * - Business-specific styling
 * 
 * @author AI-Promote Team
 */
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
     * Tries Gemini first (cheaper), fallback to OpenAI, then hardcoded fallbacks
     */
    public List<BackgroundOption> generateBackgrounds(BackgroundGenerationRequest request) {
        System.out.println("🎨 Background Service: Starting AI generation...");
        
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
            @SuppressWarnings("unchecked")
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
            @SuppressWarnings("unchecked")
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
        
        prompt.append("Style: ").append(request.getStylePreference()).append("\n");
        prompt.append("Color Scheme: ").append(request.getColorScheme()).append("\n");
        
        if (request.getMoodKeywords() != null && !request.getMoodKeywords().isEmpty()) {
            prompt.append("Mood: ").append(String.join(", ", request.getMoodKeywords())).append("\n");
        }
        
        if (request.getColorPalette() != null) {
            prompt.append("Color Palette: ").append(request.getColorPalette().toString()).append("\n");
        }
        
        prompt.append("\n🎨 DESIGN FOCUS: Text readability is CRITICAL!\n");
        prompt.append("Create backgrounds that are visually stunning but optimized for text overlay.\n");
        
        prompt.append("\nRequirements:\n");
        prompt.append("1. CRITICAL: Create backgrounds optimized for text readability\n");
        prompt.append("2. Use BLURRED, ABSTRACT, or FLUID gradient backgrounds\n");
        prompt.append("3. Include semi-transparent text overlay areas (rgba(255,255,255,0.9) or rgba(0,0,0,0.7))\n");
        prompt.append("4. Avoid sharp contrasts or busy patterns in text areas\n");
        prompt.append("5. Create soft, flowing gradients with smooth color transitions\n");
        prompt.append("6. Ensure text areas have consistent, readable backgrounds\n");
        prompt.append("7. Use backdrop-blur or overlay techniques for text sections\n\n");
        
        prompt.append("Return ONLY a valid JSON array with 3 options:\n");
        prompt.append("[\n");
        prompt.append("  {\n");
        prompt.append("    \"name\": \"Style Name\",\n");
        prompt.append("    \"backgroundCSS\": \"Simple gradient with max 20% opacity\",\n");
        prompt.append("    \"textOverlay\": \"rgba(255,255,255,0.95) for maximum contrast\",\n");
        prompt.append("    \"textColor\": \"#333333 or #000000 for maximum readability\",\n");
        prompt.append("    \"accentColor\": \"#hexcode\",\n");
        prompt.append("    \"blurEffect\": \"backdrop-blur(5px) - minimal blur only\",\n");
        prompt.append("    \"description\": \"Text-optimized design with clear reading areas\"\n");
        prompt.append("  }\n");
        prompt.append("]");
        
        return prompt.toString();
    }

    /**
     * Parse Gemini API response
     */
    @SuppressWarnings("unchecked")
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
    @SuppressWarnings("unchecked")
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
                
                // Text readability fields
                bg.setTextOverlay((String) item.get("textOverlay"));
                bg.setBlurEffect((String) item.get("blurEffect"));
                
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
        
        List<BackgroundOption> fallbacks = new ArrayList<>();
        
        // Fallback 1: Ultra-minimal gradient - TEXT FIRST!
        BackgroundOption bg1 = new BackgroundOption(
            "Text-Optimized Minimal",
            String.format("linear-gradient(135deg, %s08, %s12)", primary, secondary),
            "#333333", // Dark text for maximum readability
            accent,
            "Ultra-minimal gradient optimized for text readability"
        );
        bg1.setTextOverlay("rgba(255,255,255,0.98)"); // Almost solid white for text
        bg1.setBlurEffect("none");
        bg1.setSource("fallback");
        fallbacks.add(bg1);
        
        // Fallback 2: Clean professional with corner accent
        BackgroundOption bg2 = new BackgroundOption(
            "Clean with Corner Accent",
            String.format("#FFFFFF, radial-gradient(circle at 85%% 15%%, %s15, transparent 40%%)", primary),
            "#333333", // Dark text
            primary,
            "Clean white background with subtle corner accent"
        );
        bg2.setTextOverlay("rgba(255,255,255,0.95)");
        bg2.setBlurEffect("none");
        bg2.setSource("fallback");
        fallbacks.add(bg2);
        
        // Fallback 3: Simple side pattern - keeps text area clear
        BackgroundOption bg3 = new BackgroundOption(
            "Side Pattern Clean",
            String.format("linear-gradient(90deg, %s10 0%%, transparent 30%%, transparent 100%%)", accent),
            "#333333", // Dark text
            secondary,
            "Simple side pattern with clear text area"
        );
        bg3.setTextOverlay("rgba(255,255,255,0.96)");
        bg3.setBlurEffect("none");
        bg3.setSource("fallback");
        fallbacks.add(bg3);
        
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