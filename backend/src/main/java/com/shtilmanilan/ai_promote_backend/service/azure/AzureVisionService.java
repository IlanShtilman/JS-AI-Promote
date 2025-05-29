package com.shtilmanilan.ai_promote_backend.service.azure;

import com.shtilmanilan.ai_promote_backend.model.azure.AzureVisionResponse;
import com.shtilmanilan.ai_promote_backend.model.FlierConfig;
import com.shtilmanilan.ai_promote_backend.model.FlierInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import jakarta.annotation.PostConstruct;
import java.util.Base64;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@Service
public class AzureVisionService {

    private static final Logger logger = LoggerFactory.getLogger(AzureVisionService.class);

    @Value("${azure.vision.endpoint}")
    private String endpoint;

    @Value("${azure.vision.key}")
    private String key;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostConstruct
    public void init() {
        logger.info("AzureVisionService initialized");
        logger.info("Endpoint: {}", endpoint);
        logger.info("Key: {}", key != null ? "***" : "null");
    }

    @SuppressWarnings("unchecked")
    public AzureVisionResponse analyzeImage(String base64Image) {
        logger.info("Starting image analysis...");
        logger.info("Base64 image starts with: {}", base64Image.substring(0, Math.min(50, base64Image.length())));

        try {
            // Remove the data URL prefix if present
            String imageData = base64Image.contains(",") 
                ? base64Image.split(",")[1] 
                : base64Image;

            logger.info("Image data after processing: {}", imageData.substring(0, Math.min(50, imageData.length())));

            // Decode base64 to bytes
            byte[] imageBytes = Base64.getDecoder().decode(imageData);
            logger.info("Decoded image bytes length: {}", imageBytes.length);

            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.set("Ocp-Apim-Subscription-Key", key);

            // Prepare request body
            HttpEntity<byte[]> request = new HttpEntity<>(imageBytes, headers);

            // Build URL with parameters - replace deprecated fromHttpUrl with fromUriString
            String cleanEndpoint = endpoint.replace("\"", "");
            String url = UriComponentsBuilder.fromUriString(cleanEndpoint)
                .path("/vision/v3.1/analyze")
                .queryParam("visualFeatures", "Categories,Description,Color,Objects")
                .queryParam("details", "Landmarks")
                .queryParam("language", "en")
                .toUriString();

            logger.info("Making request to URL: {}", url);

            // Make the API call with proper type casting
            Map<String, Object> response = restTemplate.postForObject(
                url,
                request,
                Map.class
            );

            logger.info("Received response from Azure Vision API");
            logger.info("Raw Azure response: {}", response);
            
            // Process the response
            return processResponse(response);
        } catch (Exception e) {
            logger.error("Error in analyzeImage: {}", e.getMessage(), e);
            
            // Create a fallback response with default values
            logger.warn("Creating fallback response due to Azure API error");
            AzureVisionResponse fallback = new AzureVisionResponse();
            fallback.setSceneType("general");
            fallback.setDescription("Image analysis unavailable");
            fallback.setBusinessType("general business");
            fallback.setObjects(new String[]{"general"});
            
            // Create default colors
            AzureVisionResponse.Colors defaultColors = new AzureVisionResponse.Colors();
            defaultColors.setPrimary("#2196F3");
            defaultColors.setSecondary("#FF9800");
            defaultColors.setAccent("#4CAF50");
            defaultColors.setBackground("#FFFFFF");
            defaultColors.setDominantColors(java.util.Arrays.asList("#2196F3", "#FF9800", "#4CAF50"));
            fallback.setColors(defaultColors);
            
            return fallback;
        }
    }

    @SuppressWarnings("unchecked")
    private AzureVisionResponse processResponse(Map<String, Object> response) {
        AzureVisionResponse result = new AzureVisionResponse();
        
        // Process categories
        if (response.containsKey("categories")) {
            List<Map<String, Object>> categories = (List<Map<String, Object>>) response.get("categories");
            if (!categories.isEmpty()) {
                Map<String, Object> firstCategory = categories.get(0);
                result.setSceneType((String) firstCategory.get("name"));
            }
        }

        // Process objects
        if (response.containsKey("objects")) {
            List<Map<String, Object>> objects = (List<Map<String, Object>>) response.get("objects");
            result.setObjects(objects.stream()
                .map(obj -> (String) obj.get("object"))
                .toArray(String[]::new));
        }

        // SIMPLIFIED COLORS - Trust Azure Vision, simple fallbacks only
        if (response.containsKey("color")) {
            Map<String, Object> colorData = (Map<String, Object>) response.get("color");
            AzureVisionResponse.Colors colors = new AzureVisionResponse.Colors();
            
            logger.info("🎨 Processing Azure color data: {}", colorData);
            
            // Get Azure's color analysis
            String foregroundColor = (String) colorData.get("dominantColorForeground");
            String backgroundColor = (String) colorData.get("dominantColorBackground");
            List<String> dominantColorNames = (List<String>) colorData.get("dominantColors");
            String accentColor = (String) colorData.get("accentColor");
            
            // Convert color names to hex
            List<String> dominantColorsHex = new ArrayList<>();
            if (dominantColorNames != null) {
                for (String colorName : dominantColorNames) {
                    dominantColorsHex.add(getHexForColorName(colorName));
                }
            }
            
            // SIMPLE LOGIC: Use Azure's analysis directly
            colors.setPrimary(dominantColorsHex.isEmpty() ? getHexForColorName(foregroundColor) : dominantColorsHex.get(0));
            colors.setSecondary(dominantColorsHex.size() < 2 ? getHexForColorName(backgroundColor) : dominantColorsHex.get(1));
            colors.setAccent(accentColor != null && !accentColor.isEmpty() ? 
                (accentColor.startsWith("#") ? accentColor : "#" + accentColor) : 
                (dominantColorsHex.size() >= 3 ? dominantColorsHex.get(2) : "#666666"));
            colors.setBackground(getHexForColorName(backgroundColor));
            colors.setDominantColors(dominantColorsHex);
            
            logger.info("✅ Final colors - Primary: {}, Secondary: {}, Accent: {}, Background: {}", 
                colors.getPrimary(), colors.getSecondary(), colors.getAccent(), colors.getBackground());
            
            result.setColors(colors);
        }

        // Process description
        if (response.containsKey("description")) {
            Map<String, Object> description = (Map<String, Object>) response.get("description");
            List<Map<String, Object>> captions = (List<Map<String, Object>>) description.get("captions");
            if (captions != null && !captions.isEmpty()) {
                result.setDescription((String) captions.get(0).get("text"));
            }
        }

        // Simple business type detection
        result.setBusinessType(determineBusinessType(result.getSceneType(), result.getObjects()));
        
        // Set default values
        result.setAtmosphere("neutral");
        result.setLighting("natural");

        logger.info("✅ Processed response: SceneType={}, BusinessType={}, Description={}", 
            result.getSceneType(), result.getBusinessType(), result.getDescription());

        return result;
    }

    // Simplified business type detection
    private String determineBusinessType(String sceneType, String[] objects) {
        if (sceneType != null) {
            String scene = sceneType.toLowerCase();
            if (scene.contains("food") || scene.contains("restaurant")) {
                return "restaurant";
            } else if (scene.contains("store") || scene.contains("shop")) {
                return "retail";
            } else if (scene.contains("office")) {
                return "office";
            } else if (scene.contains("coffee") || scene.contains("cafe")) {
                return "cafe";
            }
        }
        
        if (objects != null) {
            for (String obj : objects) {
                String object = obj.toLowerCase();
                if (object.contains("food")) {
                    return "restaurant";
                } else if (object.contains("computer")) {
                    return "office";
                }
            }
        }
        
        return "general business";
    }
    
    /**
     * Debug method to test color name mappings
     */
    public void testColorMappings() {
        String[] testColors = {"Teal", "Navy", "Brown", "Beige", "Cream", "Orange", "Wood", "Tan"};
        logger.info("🧪 Testing color name mappings:");
        for (String color : testColors) {
            String hex = getHexForColorName(color);
            logger.info("🎨 '{}' -> '{}'", color, hex);
        }
    }

    // Clean color name to hex mapping
    private String getHexForColorName(String colorName) {
        if (colorName == null) return "#666666";
        
        String color = colorName.toLowerCase().trim();
        switch (color) {
            // Basic colors
            case "red": return "#DC143C";
            case "blue": return "#4169E1";
            case "green": return "#228B22";
            case "yellow": return "#FFD700";
            case "orange": return "#FFA500";
            case "purple": return "#800080";
            case "pink": return "#FFC0CB";
            case "brown": return "#8B4513";
            case "black": return "#000000";
            case "white": return "#FFFFFF";
            case "gray": case "grey": return "#808080";
            
            // Extended colors
            case "navy": case "navy blue": return "#000080";
            case "teal": return "#008080";
            case "lime": return "#32CD32";
            case "gold": return "#FFD700";
            case "silver": return "#C0C0C0";
            case "beige": return "#F5F5DC";
            case "cream": return "#FFFDD0";
            case "tan": return "#D2B48C";
            
            // Variations
            case "light blue": return "#87CEEB";
            case "dark blue": return "#00008B";
            case "light green": return "#90EE90";
            case "dark green": return "#006400";
            case "light gray": case "light grey": return "#D3D3D3";
            case "dark gray": case "dark grey": return "#A9A9A9";
            
            default: 
                logger.warn("Unknown color '{}', using default gray", colorName);
                return "#666666";
        }
    }

    public FlierConfig generateFlierConfig(FlierInfo info) {
        FlierConfig config = new FlierConfig();

        // Layout
        FlierConfig.Layout layout = new FlierConfig.Layout();
        layout.orientation = info.orientation;
        layout.imagePosition = "center";
        layout.imageSize = "large";
        layout.textPosition = "bottom";
        layout.textAlignment = "center";
        config.layout = layout;

        // Color Palette
        FlierConfig.ColorPalette palette = new FlierConfig.ColorPalette();
        palette.background = info.azureVision.colors != null ? info.azureVision.colors.background : "black";
        palette.text = "white";
        palette.accentColor = info.azureVision.colors != null ? info.azureVision.colors.accent : "yellow";
        config.colorPalette = palette;

        // Font
        FlierConfig.Font font = new FlierConfig.Font();
        font.title = "bold, sans-serif, large";
        font.body = "regular, sans-serif, medium";
        font.promotionalText = "bold, sans-serif, extra-large";
        config.font = font;

        // Mood
        config.mood = "energetic"; // You can map this from info.moodLevel

        // Content
        FlierConfig.Content content = new FlierConfig.Content();
        content.title = info.title;
        content.promotionalText = info.promotionalText;
        config.content = content;

        // Additional Design
        FlierConfig.AdditionalDesign add = new FlierConfig.AdditionalDesign();
        add.imageEffects = "light filter for warmth";
        add.textEffect = "highlight discount with a box around it";
        config.additionalDesign = add;

        return config;
    }
} 