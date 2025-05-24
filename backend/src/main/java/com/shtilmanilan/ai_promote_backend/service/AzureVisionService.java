package com.shtilmanilan.ai_promote_backend.service;

import com.shtilmanilan.ai_promote_backend.model.AzureVisionResponse;
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

            // Build URL with parameters - remove any quotes from the endpoint
            String cleanEndpoint = endpoint.replace("\"", "");
            String url = UriComponentsBuilder.fromHttpUrl(cleanEndpoint)
                .path("/vision/v3.1/analyze")
                .queryParam("visualFeatures", "Categories,Description,Color,Objects")
                .queryParam("details", "Landmarks")
                .queryParam("language", "en")
                .toUriString();

            logger.info("Making request to URL: {}", url);

            // Make the API call
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

    private AzureVisionResponse processResponse(Map<String, Object> response) {
        AzureVisionResponse result = new AzureVisionResponse();
        
        // Process categories
        if (response.containsKey("categories") && ((java.util.List<?>) response.get("categories")).size() > 0) {
            Map<String, Object> firstCategory = (Map<String, Object>) ((java.util.List<?>) response.get("categories")).get(0);
            result.setSceneType((String) firstCategory.get("name"));
        }

        // Process objects
        if (response.containsKey("objects")) {
            java.util.List<Map<String, Object>> objects = (java.util.List<Map<String, Object>>) response.get("objects");
            result.setObjects(objects.stream()
                .map(obj -> (String) obj.get("object"))
                .toArray(String[]::new));
        }

        // Process colors - Enhanced to capture all color information
        if (response.containsKey("color")) {
            Map<String, Object> colorData = (Map<String, Object>) response.get("color");
            AzureVisionResponse.Colors colors = new AzureVisionResponse.Colors();
            
            // Get foreground and background colors
            String foregroundColor = (String) colorData.get("dominantColorForeground");
            String backgroundColor = (String) colorData.get("dominantColorBackground");
            
            // Get dominant colors array - this is what the frontend expects!
            java.util.List<String> dominantColorNames = (java.util.List<String>) colorData.get("dominantColors");
            
            // Convert color names to hex values for the dominantColors list
            java.util.List<String> dominantColorsHex = new java.util.ArrayList<>();
            if (dominantColorNames != null) {
                for (String colorName : dominantColorNames) {
                    dominantColorsHex.add(getHexForColorName(colorName));
                }
            }
            colors.setDominantColors(dominantColorsHex);
            
            // Set primary and secondary based on Azure's analysis
            colors.setPrimary(getHexForColorName(foregroundColor));
            colors.setSecondary(getHexForColorName(backgroundColor));
            
            // Determine accent color - pick a complementary color from dominant colors or calculate one
            String accentColor = determineAccentColor(foregroundColor, backgroundColor, dominantColorNames);
            colors.setAccent(accentColor);
            
            // Determine appropriate background color
            String finalBackgroundColor = determineBackgroundColor(foregroundColor, backgroundColor);
            colors.setBackground(finalBackgroundColor);
            
            logger.info("Processed colors - Primary: {}, Secondary: {}, Accent: {}, Background: {}, Dominant: {}", 
                colors.getPrimary(), colors.getSecondary(), colors.getAccent(), colors.getBackground(), dominantColorsHex);
            
            result.setColors(colors);
        }

        // Process description
        if (response.containsKey("description")) {
            Map<String, Object> description = (Map<String, Object>) response.get("description");
            java.util.List<Map<String, Object>> captions = (java.util.List<Map<String, Object>>) description.get("captions");
            if (captions != null && !captions.isEmpty()) {
                result.setDescription((String) captions.get(0).get("text"));
            }
        }

        // Try to determine business type from the scene analysis
        result.setBusinessType(determineBusinessType(result.getSceneType(), result.getObjects()));
        
        // Set default values
        result.setAtmosphere("neutral and balanced");
        result.setLighting("dim ambient");

        logger.info("Final processed response: SceneType={}, BusinessType={}, Description={}", 
            result.getSceneType(), result.getBusinessType(), result.getDescription());

        return result;
    }

    // Helper method to determine business type from scene and objects
    private String determineBusinessType(String sceneType, String[] objects) {
        if (sceneType != null) {
            String scene = sceneType.toLowerCase();
            if (scene.contains("food") || scene.contains("restaurant") || scene.contains("kitchen")) {
                return "restaurant";
            } else if (scene.contains("store") || scene.contains("shop") || scene.contains("retail")) {
                return "retail";
            } else if (scene.contains("office") || scene.contains("business")) {
                return "office";
            } else if (scene.contains("coffee") || scene.contains("cafe")) {
                return "cafe";
            }
        }
        
        if (objects != null) {
            for (String obj : objects) {
                String object = obj.toLowerCase();
                if (object.contains("food") || object.contains("plate") || object.contains("cup")) {
                    return "cafe";
                } else if (object.contains("computer") || object.contains("desk")) {
                    return "office";
                }
            }
        }
        
        return "general business";
    }

    // Helper method to determine a good accent color based on primary and secondary colors
    private String determineAccentColor(String primary, String secondary, java.util.List<String> dominantColors) {
        // If we have at least 3 dominant colors, use the third one as accent
        if (dominantColors != null && dominantColors.size() >= 3) {
            return getHexForColorName(dominantColors.get(2));
        }
        
        // If primary is a warm color, use a cool accent and vice versa
        if (isWarmColor(primary)) {
            return "#2196F3"; // Cool blue
        } else {
            return "#FF9800"; // Warm orange
        }
    }
    
    // Helper method to determine a good background color
    private String determineBackgroundColor(String primary, String secondary) {
        // Default to white for most cases
        if (isLightColor(primary) && isLightColor(secondary)) {
            return "#F5F5F5"; // Very light gray for better contrast
        } else {
            return "#FFFFFF"; // White
        }
    }
    
    // Helper method to check if a color is considered "warm"
    private boolean isWarmColor(String colorName) {
        String color = colorName.toLowerCase();
        return color.contains("red") || color.contains("orange") || color.contains("yellow") || 
               color.contains("brown") || color.contains("pink");
    }
    
    // Helper method to check if a color is considered "light"
    private boolean isLightColor(String colorName) {
        String color = colorName.toLowerCase();
        return color.contains("white") || color.contains("light") || color.contains("pale") || 
               color.contains("beige") || color.contains("cream");
    }
    
    // Helper method to convert common color names to hex values
    private String getHexForColorName(String colorName) {
        if (colorName == null) return "#FFA726";
        
        switch (colorName.toLowerCase()) {
            case "red": return "#F44336";
            case "pink": return "#E91E63";
            case "purple": return "#9C27B0";
            case "deep purple": return "#673AB7";
            case "indigo": return "#3F51B5";
            case "blue": return "#2196F3";
            case "light blue": return "#03A9F4";
            case "cyan": return "#00BCD4";
            case "teal": return "#009688";
            case "green": return "#4CAF50";
            case "light green": return "#8BC34A";
            case "lime": return "#CDDC39";
            case "yellow": return "#FFEB3B";
            case "amber": return "#FFC107";
            case "orange": return "#FF9800";
            case "deep orange": return "#FF5722";
            case "brown": return "#795548";
            case "grey": case "gray": return "#9E9E9E";
            case "blue grey": case "blue gray": return "#607D8B";
            case "black": return "#212121";
            case "white": return "#FFFFFF";
            default: return "#FFA726"; // Default orange accent
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