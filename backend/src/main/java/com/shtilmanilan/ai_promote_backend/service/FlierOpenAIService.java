package com.shtilmanilan.ai_promote_backend.service;

import com.shtilmanilan.ai_promote_backend.model.FlierInfo;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.regex.Pattern;

@Service
public class FlierOpenAIService {
    
    private static final Logger logger = LoggerFactory.getLogger(FlierOpenAIService.class);
    private final OpenAIService openAIService;
    
    @Autowired
    public FlierOpenAIService(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }
    
    public String generateFlierConfiguration(FlierInfo flierInfo) {
        logger.info("Generating flier configuration for: {}", flierInfo.title);
        
        String prompt = buildPrompt(flierInfo);
        logger.debug("Sending prompt to OpenAI: {}", prompt);
        
        TextGenerationRequest request = new TextGenerationRequest();
        request.setPrompt(prompt);
        request.setTemperature(0.7);
        
        TextGenerationResponse response = openAIService.generateText(request);
        String responseText = response.getGeneratedText();
        logger.debug("Received response from OpenAI: {}", responseText);
        
        // Clean response to ensure it's valid JSON
        responseText = cleanJsonResponse(responseText);
        
        return responseText;
    }
    
    /**
     * Cleans the response from AI models to ensure it's valid JSON.
     * Removes markdown formatting, comments, and other non-JSON content.
     */
    private String cleanJsonResponse(String response) {
        // Remove markdown code blocks
        if (response.startsWith("```json") || response.startsWith("```")) {
            response = response.replaceFirst("```json\\s*", "")
                              .replaceFirst("```\\s*", "");
            
            // Remove closing code block if present
            if (response.endsWith("```")) {
                response = response.substring(0, response.lastIndexOf("```")).trim();
            }
        }
        
        // Remove JavaScript-style comments (both single-line and multi-line)
        // Single-line comments (//...)
        response = Pattern.compile("//.*?$", Pattern.MULTILINE).matcher(response).replaceAll("");
        
        // Multi-line comments (/* ... */)
        response = Pattern.compile("/\\*.*?\\*/", Pattern.DOTALL).matcher(response).replaceAll("");
        
        // Try to extract just the JSON part if response contains explanations
        if (!response.trim().startsWith("{")) {
            int jsonStart = response.indexOf('{');
            if (jsonStart >= 0) {
                response = response.substring(jsonStart);
            }
        }
        
        // Check if response ends properly
        if (!response.trim().endsWith("}")) {
            int jsonEnd = response.lastIndexOf('}');
            if (jsonEnd >= 0) {
                response = response.substring(0, jsonEnd + 1);
            }
        }
        
        // Remove any trailing commas before closing brackets or braces (common JSON error)
        response = response.replaceAll(",\\s*}", "}");
        response = response.replaceAll(",\\s*]", "]");
        
        logger.debug("Cleaned JSON response: {}", response);
        return response;
    }
    
    private String buildPrompt(FlierInfo flierInfo) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("Create a JSON configuration for a promotional flier with the following details:\n\n");
        prompt.append("Title: ").append(flierInfo.title).append("\n");
        prompt.append("Promotional Text: ").append(flierInfo.promotionalText).append("\n");
        
        if (flierInfo.targetAudience != null && !flierInfo.targetAudience.isEmpty()) {
            prompt.append("Target Audience: ").append(flierInfo.targetAudience).append("\n");
        }
        
        if (flierInfo.businessType != null && !flierInfo.businessType.isEmpty()) {
            prompt.append("Business Type: ").append(flierInfo.businessType).append("\n");
        }
        
        if (flierInfo.stylePreference != null && !flierInfo.stylePreference.isEmpty()) {
            prompt.append("Style Preference: ").append(flierInfo.stylePreference).append("\n");
        }
        
        if (flierInfo.colorScheme != null && !flierInfo.colorScheme.isEmpty()) {
            prompt.append("Color Scheme: ").append(flierInfo.colorScheme).append("\n");
        }
        
        // Handle moodLevel as an integer
        prompt.append("Mood Level (1-10): ").append(flierInfo.moodLevel).append("\n");
        
        if (flierInfo.flierSize != null && !flierInfo.flierSize.isEmpty()) {
            prompt.append("Flier Size: ").append(flierInfo.flierSize).append("\n");
        }
        
        if (flierInfo.orientation != null && !flierInfo.orientation.isEmpty()) {
            prompt.append("Orientation: ").append(flierInfo.orientation).append("\n");
        }
        
        // Add image analysis data if available
        if (flierInfo.azureVision != null) {
            prompt.append("\nImage Analysis:\n");
            if (flierInfo.azureVision.sceneType != null) {
                prompt.append("Scene Type: ").append(flierInfo.azureVision.sceneType).append("\n");
            }
            if (flierInfo.azureVision.description != null) {
                prompt.append("Description: ").append(flierInfo.azureVision.description).append("\n");
            }
            if (flierInfo.azureVision.objects != null && flierInfo.azureVision.objects.length > 0) {
                prompt.append("Objects: ");
                for (int i = 0; i < flierInfo.azureVision.objects.length; i++) {
                    prompt.append(flierInfo.azureVision.objects[i]);
                    if (i < flierInfo.azureVision.objects.length - 1) {
                        prompt.append(", ");
                    }
                }
                prompt.append("\n");
            }
            if (flierInfo.azureVision.colors != null) {
                prompt.append("Colors:\n");
                if (flierInfo.azureVision.colors.primary != null) {
                    prompt.append("  Primary: ").append(flierInfo.azureVision.colors.primary).append("\n");
                }
                if (flierInfo.azureVision.colors.secondary != null) {
                    prompt.append("  Secondary: ").append(flierInfo.azureVision.colors.secondary).append("\n");
                }
                if (flierInfo.azureVision.colors.accent != null) {
                    prompt.append("  Accent: ").append(flierInfo.azureVision.colors.accent).append("\n");
                }
                if (flierInfo.azureVision.colors.background != null) {
                    prompt.append("  Background: ").append(flierInfo.azureVision.colors.background).append("\n");
                }
            }
        }
        
        prompt.append("\nPlease output a valid JSON object with the following structure:\n");
        prompt.append("{\n");
        prompt.append("  \"layout\": {\n");
        prompt.append("    \"elements\": [/* Array of elements with their positions, sizes, and content */]\n");
        prompt.append("  },\n");
        prompt.append("  \"colors\": {\n");
        prompt.append("    \"background\": \"#color\",\n");
        prompt.append("    \"primary\": \"#color\",\n");
        prompt.append("    \"secondary\": \"#color\",\n");
        prompt.append("    \"accent\": \"#color\",\n");
        prompt.append("    \"text\": \"#color\"\n");
        prompt.append("  },\n");
        prompt.append("  \"typography\": {\n");
        prompt.append("    \"titleFont\": \"font name\",\n");
        prompt.append("    \"bodyFont\": \"font name\",\n");
        prompt.append("    \"titleSize\": size in pixels,\n");
        prompt.append("    \"bodySize\": size in pixels\n");
        prompt.append("  },\n");
        prompt.append("  \"style\": {\n");
        prompt.append("    \"borderRadius\": value in pixels,\n");
        prompt.append("    \"spacing\": value in pixels,\n");
        prompt.append("    \"shadowIntensity\": value from 0-1\n");
        prompt.append("  }\n");
        prompt.append("}\n");
        
        return prompt.toString();
    }
} 