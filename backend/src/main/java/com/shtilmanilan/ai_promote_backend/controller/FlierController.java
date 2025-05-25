package com.shtilmanilan.ai_promote_backend.controller;

import com.shtilmanilan.ai_promote_backend.model.FlierInfo;
import com.shtilmanilan.ai_promote_backend.service.BackgroundGenerationService;
import com.shtilmanilan.ai_promote_backend.model.BackgroundGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.BackgroundOption;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/flier")
@CrossOrigin(origins = "*")
public class FlierController {

    private static final Logger logger = LoggerFactory.getLogger(FlierController.class);
    private final BackgroundGenerationService backgroundGenerationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public FlierController(BackgroundGenerationService backgroundGenerationService) {
        this.backgroundGenerationService = backgroundGenerationService;
    }

    /**
     * NEW SIMPLIFIED PIPELINE: Generate flier using our new background generation system
     */
    @PostMapping("/generate")
    public ResponseEntity<JsonNode> generateFlier(@RequestBody FlierInfo flierInfo) {
        logger.info("🎨 Received request to generate flier for: {}", flierInfo.title);
        logger.debug("Full flier request data: {}", flierInfo);
        
        try {
            // Convert FlierInfo to BackgroundGenerationRequest using our simple rules
            BackgroundGenerationRequest bgRequest = convertToBackgroundRequest(flierInfo);
            
            // Generate 3 background options using our AI service
            List<BackgroundOption> backgrounds = backgroundGenerationService.generateBackgrounds(bgRequest);
            
            // ✅ ADD AZURE VISION COLORS TO EACH BACKGROUND OPTION
            if (flierInfo.azureVision != null && flierInfo.azureVision.colors != null) {
                for (BackgroundOption bg : backgrounds) {
                    bg.setPrimaryColor(flierInfo.azureVision.colors.primary);
                    bg.setSecondaryColor(flierInfo.azureVision.colors.secondary);
                    bg.setBackgroundColor(flierInfo.azureVision.colors.background);
                    // Keep the AI-generated accent color, but could override if needed
                    // bg.setAccentColor(flierInfo.azureVision.colors.accent);
                }
                logger.info("✅ Added Azure Vision colors to background options: primary={}, secondary={}", 
                           flierInfo.azureVision.colors.primary, flierInfo.azureVision.colors.secondary);
            }
            
            // Create the response in the expected format
            ObjectNode response = objectMapper.createObjectNode();
            response.put("layout", "standard");
            response.put("success", true);
            
            // Add the generated backgrounds
            ArrayNode backgroundsArray = objectMapper.createArrayNode();
            for (BackgroundOption bg : backgrounds) {
                ObjectNode bgNode = objectMapper.createObjectNode();
                bgNode.put("name", bg.getName());
                bgNode.put("backgroundCSS", bg.getBackgroundCSS());
                bgNode.put("textColor", bg.getTextColor());
                bgNode.put("accentColor", bg.getAccentColor());
                bgNode.put("description", bg.getDescription());
                bgNode.put("source", bg.getSource());
                
                // ✅ ADD AZURE VISION COLORS TO RESPONSE
                if (bg.getPrimaryColor() != null) bgNode.put("primaryColor", bg.getPrimaryColor());
                if (bg.getSecondaryColor() != null) bgNode.put("secondaryColor", bg.getSecondaryColor());
                if (bg.getBackgroundColor() != null) bgNode.put("backgroundColor", bg.getBackgroundColor());
                
                // Add typography fields if available
                if (bg.getFontFamily() != null) bgNode.put("fontFamily", bg.getFontFamily());
                if (bg.getFontSize() != null) bgNode.put("fontSize", bg.getFontSize());
                if (bg.getBodyFontSize() != null) bgNode.put("bodyFontSize", bg.getBodyFontSize());
                if (bg.getStyleName() != null) bgNode.put("styleName", bg.getStyleName());
                
                backgroundsArray.add(bgNode);
            }
            response.set("backgroundOptions", backgroundsArray);
            
            // Add basic layout info
            ObjectNode layoutInfo = objectMapper.createObjectNode();
            layoutInfo.put("orientation", flierInfo.orientation);
            layoutInfo.put("imagePosition", "center");
            layoutInfo.put("textAlignment", "center");
            response.set("layoutInfo", layoutInfo);
            
            // Add content info
            ObjectNode contentInfo = objectMapper.createObjectNode();
            contentInfo.put("title", flierInfo.title);
            contentInfo.put("promotionalText", flierInfo.promotionalText);
            contentInfo.put("businessType", flierInfo.businessType);
            contentInfo.put("targetAudience", flierInfo.targetAudience);
            response.set("contentInfo", contentInfo);
            
            logger.info("✅ Successfully generated flier with {} background options", backgrounds.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error generating flier: {}", e.getMessage(), e);
            
            // Create a simple error response
            ObjectNode errorNode = objectMapper.createObjectNode();
            errorNode.put("error", e.getMessage());
            errorNode.put("layout", "standard");
            errorNode.put("success", false);
            return ResponseEntity.status(500).body(errorNode);
        }
    }

    /**
     * Convert FlierInfo to BackgroundGenerationRequest
     */
    private BackgroundGenerationRequest convertToBackgroundRequest(FlierInfo flierInfo) {
        BackgroundGenerationRequest request = new BackgroundGenerationRequest();
        
        // Basic info
        request.setBusinessType(flierInfo.businessType);
        request.setTargetAudience(flierInfo.targetAudience);
        request.setColorScheme(flierInfo.colorScheme);
        request.setStylePreference(flierInfo.stylePreference);
        
        // ✅ ADD USER'S ACTUAL CONTENT FOR RELEVANT BACKGROUNDS
        request.setTitle(flierInfo.title);                           // "Crazy Sale", "Grand Opening", etc.
        request.setPromotionalText(flierInfo.promotionalText);       // "50% Off Everything!", etc.
        // Note: FlierInfo doesn't have businessDescription, using businessType instead
        
        // Azure colors (if available)
        Map<String, Object> azureColors = new HashMap<>();
        if (flierInfo.azureVision != null && flierInfo.azureVision.colors != null) {
            Map<String, Object> logoColors = new HashMap<>();
            logoColors.put("primary", flierInfo.azureVision.colors.primary);
            logoColors.put("secondary", flierInfo.azureVision.colors.secondary);
            logoColors.put("accent", flierInfo.azureVision.colors.accent);
            logoColors.put("background", flierInfo.azureVision.colors.background);
            azureColors.put("unified", logoColors);
        }
        request.setAzureColors(azureColors);
        
        // Color palette
        Map<String, String> colorPalette = new HashMap<>();
        if (flierInfo.azureVision != null && flierInfo.azureVision.colors != null) {
            colorPalette.put("primary", flierInfo.azureVision.colors.primary);
            colorPalette.put("secondary", flierInfo.azureVision.colors.secondary);
            colorPalette.put("accent", flierInfo.azureVision.colors.accent);
            colorPalette.put("background", flierInfo.azureVision.colors.background);
            colorPalette.put("textDark", "#333333");
            colorPalette.put("textLight", "#FFFFFF");
        } else {
            // Default colors based on color scheme
            setDefaultColors(colorPalette, flierInfo.colorScheme);
        }
        request.setColorPalette(colorPalette);
        
        // Generate mood keywords based on business type and audience
        List<String> moodKeywords = generateMoodKeywords(flierInfo.businessType, flierInfo.targetAudience);
        request.setMoodKeywords(moodKeywords);
        
        // Set background style
        String backgroundStyle = generateBackgroundStyle(flierInfo.colorScheme, flierInfo.stylePreference);
        request.setBackgroundStyle(backgroundStyle);
        
        // Contrast requirements
        Map<String, Object> contrastReq = new HashMap<>();
        contrastReq.put("minContrastRatio", 4.5);
        contrastReq.put("ensureReadability", true);
        request.setContrastRequirements(contrastReq);
        
        return request;
    }
    
    private void setDefaultColors(Map<String, String> colorPalette, String colorScheme) {
        switch (colorScheme != null ? colorScheme : "neutral") {
            case "warm":
                colorPalette.put("primary", "#FF6B35");
                colorPalette.put("secondary", "#F7931E");
                colorPalette.put("accent", "#FFD23F");
                colorPalette.put("background", "#FFFFFF");
                break;
            case "cool":
                colorPalette.put("primary", "#4A90E2");
                colorPalette.put("secondary", "#00BCD4");
                colorPalette.put("accent", "#3F51B5");
                colorPalette.put("background", "#FFFFFF");
                break;
            case "vibrant":
                colorPalette.put("primary", "#E91E63");
                colorPalette.put("secondary", "#9C27B0");
                colorPalette.put("accent", "#FF5722");
                colorPalette.put("background", "#FFFFFF");
                break;
            default: // neutral
                colorPalette.put("primary", "#2196F3");
                colorPalette.put("secondary", "#FF9800");
                colorPalette.put("accent", "#4CAF50");
                colorPalette.put("background", "#FFFFFF");
                break;
        }
        colorPalette.put("textDark", "#333333");
        colorPalette.put("textLight", "#FFFFFF");
    }
    
    private List<String> generateMoodKeywords(String businessType, String targetAudience) {
        List<String> keywords = new java.util.ArrayList<>();
        
        // Business type keywords
        if (businessType != null) {
            switch (businessType) {
                case "restaurant": keywords.addAll(List.of("appetizing", "welcoming", "cozy")); break;
                case "retail": keywords.addAll(List.of("trendy", "modern", "appealing")); break;
                case "healthcare": keywords.addAll(List.of("calming", "trustworthy", "clean")); break;
                case "education": keywords.addAll(List.of("inspiring", "bright", "encouraging")); break;
                default: keywords.addAll(List.of("professional", "clean", "modern")); break;
            }
        }
        
        // Target audience keywords
        if (targetAudience != null) {
            switch (targetAudience) {
                case "families": keywords.addAll(List.of("friendly", "safe", "welcoming")); break;
                case "young_adults": keywords.addAll(List.of("trendy", "energetic", "vibrant")); break;
                case "professionals": keywords.addAll(List.of("sleek", "sophisticated", "efficient")); break;
                default: keywords.addAll(List.of("appealing", "inclusive", "accessible")); break;
            }
        }
        
        return keywords;
    }
    
    private String generateBackgroundStyle(String colorScheme, String stylePreference) {
        String scheme = colorScheme != null ? colorScheme : "neutral";
        String style = stylePreference != null ? stylePreference : "modern";
        
        return String.format("%s %s gradients and patterns", scheme, style);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Flier generation service is running! 🎨");
    }
} 