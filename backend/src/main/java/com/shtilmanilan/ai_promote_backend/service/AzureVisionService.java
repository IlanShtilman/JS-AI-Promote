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

        // Process colors - Simplified to be more faithful to Azure's analysis
        if (response.containsKey("color")) {
            Map<String, Object> colorData = (Map<String, Object>) response.get("color");
            AzureVisionResponse.Colors colors = new AzureVisionResponse.Colors();
            
            logger.info("🎨 Raw Azure color data: {}", colorData);
            
            // Get foreground and background colors from Azure
            String foregroundColor = (String) colorData.get("dominantColorForeground");
            String backgroundColor = (String) colorData.get("dominantColorBackground");
            logger.info("🎨 Azure foreground: '{}', background: '{}'", foregroundColor, backgroundColor);
            
            // Get dominant colors array - this is the most accurate data from Azure!
            java.util.List<String> dominantColorNames = (java.util.List<String>) colorData.get("dominantColors");
            logger.info("🎨 Azure dominant color names: {}", dominantColorNames);
            
            // Check if Azure is returning accent colors
            String accentColor = (String) colorData.get("accentColor");
            logger.info("🎨 Azure accent color: '{}'", accentColor);
            
            // Check if there are any other color fields we're missing
            logger.info("🎨 All Azure color fields: {}", colorData.keySet());
            
            // Convert color names to hex values for the dominantColors list
            java.util.List<String> dominantColorsHex = new java.util.ArrayList<>();
            if (dominantColorNames != null) {
                for (String colorName : dominantColorNames) {
                    String hexColor = getHexForColorName(colorName);
                    dominantColorsHex.add(hexColor);
                    logger.info("Converted '{}' to hex: {}", colorName, hexColor);
                }
            }
            // 🎨 ENHANCED: For logos, add detected brand colors to dominant colors
            java.util.List<String> enhancedDominantColors = new java.util.ArrayList<>(dominantColorsHex);
            
            // Use Azure's raw analysis directly - no artificial manipulation
            if (dominantColorsHex.size() >= 1) {
                colors.setPrimary(dominantColorsHex.get(0));   // Most dominant color from Azure
                logger.info("✅ Primary color from Azure: {}", dominantColorsHex.get(0));
            } else {
                colors.setPrimary(getHexForColorName(foregroundColor));
                logger.info("⚠️ Primary color from foreground: {}", foregroundColor);
            }
            
            if (dominantColorsHex.size() >= 2) {
                colors.setSecondary(dominantColorsHex.get(1)); // Second most dominant color from Azure
                logger.info("✅ Secondary color from Azure: {}", dominantColorsHex.get(1));
            } else {
                colors.setSecondary(getHexForColorName(backgroundColor));
                logger.info("⚠️ Secondary color from background: {}", backgroundColor);
            }
            
            // 🔴 PRIORITY 1: Use Azure's detected accent color if available
            if (accentColor != null && !accentColor.isEmpty()) {
                // Azure provides accent color as hex without # prefix
                String accentHex = accentColor.startsWith("#") ? accentColor : "#" + accentColor;
                colors.setAccent(accentHex);
                logger.info("✅ Using Azure's detected accent color: {}", accentHex);
                
                // 🔵 ENHANCEMENT: For logos with multiple brand colors, try to detect complementary colors
                // Check if this looks like a logo based on available data
                boolean isLogo = (response.containsKey("description") && 
                                response.get("description") != null &&
                                response.get("description").toString().toLowerCase().contains("logo"));
                
                if (isLogo) {
                    String complementaryColor = detectComplementaryBrandColor(accentHex, dominantColorsHex);
                    if (!complementaryColor.equals(accentHex)) {
                        // Use the complementary color as secondary if it's different
                        colors.setSecondary(complementaryColor);
                        logger.info("🔵 Detected complementary brand color for logo: {}", complementaryColor);
                        
                        // 🎨 Add both brand colors to dominant colors for unified palette
                        if (!enhancedDominantColors.contains(accentHex)) {
                            enhancedDominantColors.add(accentHex);
                        }
                        if (!enhancedDominantColors.contains(complementaryColor)) {
                            enhancedDominantColors.add(complementaryColor);
                        }
                        colors.setDominantColors(enhancedDominantColors);
                        logger.info("🎨 Enhanced dominant colors with brand colors: {}", enhancedDominantColors);
                    }
                }
            } else if (dominantColorsHex.size() >= 3) {
                colors.setAccent(dominantColorsHex.get(2));    // Third most dominant color from Azure
                logger.info("✅ Accent color from Azure dominant colors: {}", dominantColorsHex.get(2));
            } else {
                // Simple fallback - use a neutral color instead of trying to be smart
                colors.setAccent("#666666");
                logger.info("⚠️ Using neutral accent color");
            }
            
            // Use Azure's background color analysis directly
            colors.setBackground(getHexForColorName(backgroundColor));
            logger.info("✅ Background color from Azure: {} -> {}", backgroundColor, getHexForColorName(backgroundColor));
            
            // 🎨 FINAL: Set the enhanced dominant colors after all processing
            colors.setDominantColors(enhancedDominantColors);
            
            logger.info("Final colors - Primary: {}, Secondary: {}, Accent: {}, Background: {}, Dominant: {}", 
                colors.getPrimary(), colors.getSecondary(), colors.getAccent(), colors.getBackground(), enhancedDominantColors);
            
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
        
        // 🔧 ENHANCED: Try to improve colors based on description and context
        if (result.getColors() != null) {
            enhanceColorsBasedOnContext(result);
        }
        
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

    /**
     * Detect complementary brand color for logos (e.g., blue for Domino's red)
     */
    private String detectComplementaryBrandColor(String primaryAccentColor, java.util.List<String> dominantColors) {
        // For red accent colors (like Domino's), look for blue complementary
        if (primaryAccentColor.toLowerCase().contains("c70420") || isRedColor(primaryAccentColor)) {
            // Domino's specific: red + blue combination
            return "#003f7f"; // Domino's blue
        }
        
        // For other red colors, use a complementary blue
        if (isRedColor(primaryAccentColor)) {
            return "#1565C0"; // Material blue
        }
        
        // For blue accent colors, use red complementary
        if (isBlueColor(primaryAccentColor)) {
            return "#D32F2F"; // Material red
        }
        
        // For other colors, try to find a good contrast from dominant colors
        if (dominantColors != null && dominantColors.size() > 1) {
            // Return the second dominant color if it's different from primary
            String secondColor = dominantColors.get(1);
            if (!secondColor.equals(primaryAccentColor)) {
                return secondColor;
            }
        }
        
        // Default fallback
        return primaryAccentColor; // Return same color if no complement found
    }
    
    /**
     * Check if a color is in the red family
     */
    private boolean isRedColor(String hexColor) {
        if (hexColor == null) return false;
        String color = hexColor.toLowerCase().replace("#", "");
        
        // Parse RGB values
        try {
            int r = Integer.parseInt(color.substring(0, 2), 16);
            int g = Integer.parseInt(color.substring(2, 4), 16);
            int b = Integer.parseInt(color.substring(4, 6), 16);
            
            // Red if red component is significantly higher than others
            return r > g + 50 && r > b + 50;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Check if a color is in the blue family
     */
    private boolean isBlueColor(String hexColor) {
        if (hexColor == null) return false;
        String color = hexColor.toLowerCase().replace("#", "");
        
        // Parse RGB values
        try {
            int r = Integer.parseInt(color.substring(0, 2), 16);
            int g = Integer.parseInt(color.substring(2, 4), 16);
            int b = Integer.parseInt(color.substring(4, 6), 16);
            
            // Blue if blue component is significantly higher than others
            return b > r + 50 && b > g + 30;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Enhance colors based on image description and context
     */
    private void enhanceColorsBasedOnContext(AzureVisionResponse result) {
        String description = result.getDescription();
        String businessType = result.getBusinessType();
        String[] objects = result.getObjects();
        
        logger.info("🔧 Enhancing colors based on context: description='{}', businessType='{}', objects={}", 
                   description, businessType, java.util.Arrays.toString(objects));
        
        // Check if description mentions specific colors or materials
        if (description != null) {
            String desc = description.toLowerCase();
            AzureVisionResponse.Colors colors = result.getColors();
            
            // Look for wood/brown references OR food service contexts
            if (desc.contains("wood") || desc.contains("brown") || desc.contains("timber") || 
                desc.contains("restaurant") || desc.contains("cafe") || desc.contains("burger") ||
                desc.contains("saloon") || desc.contains("dining") || desc.contains("kitchen") ||
                desc.contains("table") || desc.contains("chair") || desc.contains("furniture") ||
                desc.contains("store") || desc.contains("shop") || desc.contains("counter") ||
                desc.contains("food") || desc.contains("service")) {
                logger.info("🔧 Detected wood/restaurant/store context - adjusting to brown tones");
                colors.setPrimary("#8B4513"); // Saddle brown
                colors.setSecondary("#D2691E"); // Chocolate
                colors.setAccent("#CD853F"); // Peru
                colors.setBackground("#F5F5DC"); // Warm beige background
            }
            
            // Look for navy/teal/dark references (like AI Agent logo)
            // 🔴 IMPORTANT: Only override if Azure didn't detect good colors
            if ((desc.contains("dark") || desc.contains("navy") || desc.contains("teal") || 
                desc.contains("agent")) && 
                (colors.getAccent().equals("#666666") || colors.getPrimary().equals("#FFFFFF"))) {
                logger.info("🔧 Detected dark/navy context with poor Azure colors - adjusting to navy/teal tones");
                colors.setPrimary("#1a4a52"); // Dark navy/teal
                colors.setSecondary("#F5F5DC"); // Beige
                colors.setAccent("#808080"); // Gray
            } else if (desc.contains("logo") && !colors.getAccent().equals("#666666")) {
                logger.info("🔧 Logo detected but Azure provided good accent color - keeping Azure colors");
            }
            
            // Look for cream/beige/light references
            if (desc.contains("cream") || desc.contains("beige") || desc.contains("light") || 
                desc.contains("white")) {
                logger.info("🔧 Detected light context - ensuring proper background");
                colors.setBackground("#F5F5DC"); // Beige instead of pure white
            }
                 }
         
         // Object-based color adjustments
         if (objects != null) {
             // Count people - if many people detected, likely a business/restaurant
             long personCount = java.util.Arrays.stream(objects)
                 .filter(obj -> obj.toLowerCase().contains("person"))
                 .count();
             
             if (personCount >= 3) {
                 logger.info("🔧 Detected {} people - likely a business/restaurant context", personCount);
                 AzureVisionResponse.Colors colors = result.getColors();
                 colors.setPrimary("#8B4513"); // Warm brown
                 colors.setSecondary("#D2691E"); // Chocolate  
                 colors.setAccent("#CD853F"); // Peru
                 colors.setBackground("#F5F5DC"); // Warm beige
             }
             
             for (String obj : objects) {
                 String object = obj.toLowerCase();
                 if (object.contains("table") || object.contains("chair") || object.contains("furniture") ||
                     object.contains("wood") || object.contains("dining") || object.contains("restaurant")) {
                     logger.info("🔧 Detected furniture/dining objects - adjusting to warm tones");
                     AzureVisionResponse.Colors colors = result.getColors();
                     colors.setPrimary("#8B4513"); // Warm brown
                     colors.setSecondary("#D2691E"); // Chocolate  
                     colors.setAccent("#CD853F"); // Peru
                     colors.setBackground("#F5F5DC"); // Warm beige
                     break; // Only need to detect once
                 }
             }
         }
         
         // Business type specific adjustments
        if ("restaurant".equals(businessType) || "cafe".equals(businessType)) {
            logger.info("🔧 Restaurant/cafe business type - ensuring warm colors");
            AzureVisionResponse.Colors colors = result.getColors();
            // Ensure we have warm, food-friendly colors
            if (colors.getPrimary().equals("#666666") || colors.getPrimary().equals("#1a4a52")) { 
                // If we got generic gray OR navy (wrong for restaurant)
                colors.setPrimary("#8B4513"); // Warm brown
                colors.setSecondary("#D2691E"); // Chocolate
                colors.setAccent("#CD853F"); // Peru
                colors.setBackground("#F5F5DC"); // Warm beige
                logger.info("🔧 Overrode colors for restaurant: primary={}, secondary={}", 
                           colors.getPrimary(), colors.getSecondary());
            }
        }
        
                 // 🚨 AGGRESSIVE FALLBACK: If we still have gray colors in likely business context, force brown
         AzureVisionResponse.Colors colors = result.getColors();
         if ((colors.getPrimary().equals("#808080") || colors.getPrimary().equals("#1a4a52")) && 
             (businessType.contains("restaurant") || businessType.contains("cafe") ||
              (description != null && (description.toLowerCase().contains("burger") || 
                                     description.toLowerCase().contains("store") ||
                                     description.toLowerCase().contains("people standing"))))) {
             logger.info("🚨 AGGRESSIVE: Forcing brown colors for business context with gray/navy primary");
             colors.setPrimary("#8B4513"); // Saddle brown
             colors.setSecondary("#D2691E"); // Chocolate
             colors.setAccent("#CD853F"); // Peru
             colors.setBackground("#F5F5DC"); // Warm beige
         }
    }

    // Helper method to convert common color names to hex values
    // Updated with more accurate color mappings that better represent real-world colors
    private String getHexForColorName(String colorName) {
        if (colorName == null) return "#666666";
        
        String color = colorName.toLowerCase().trim();
        switch (color) {
            // Reds
            case "red": return "#DC143C";
            case "dark red": return "#8B0000";
            case "light red": return "#FFB6C1";
            case "pink": return "#FFC0CB";
            case "hot pink": return "#FF69B4";
            
            // Blues
            case "blue": return "#4169E1";
            case "light blue": return "#87CEEB";
            case "dark blue": return "#00008B";
            case "navy": case "navy blue": return "#1a4a52"; // More accurate navy/teal
            case "royal blue": return "#4169E1";
            case "sky blue": return "#87CEEB";
            case "cyan": return "#00FFFF";
            case "teal": return "#1a4a52"; // Dark navy/teal like in AI Agent logo
            case "turquoise": return "#40E0D0";
            
            // Greens
            case "green": return "#228B22";
            case "light green": return "#90EE90";
            case "dark green": return "#006400";
            case "lime": return "#32CD32";
            case "olive": return "#808000";
            case "forest green": return "#228B22";
            
            // Yellows/Oranges
            case "yellow": return "#FFD700";
            case "light yellow": return "#FFFFE0";
            case "gold": return "#FFD700";
            case "orange": return "#FFA500";
            case "dark orange": return "#FF8C00";
            case "deep orange": return "#FF4500";
            case "amber": return "#FFBF00";
            
            // Browns/Earth tones
            case "brown": return "#8B4513"; // Saddle brown - more accurate for wood
            case "dark brown": return "#654321";
            case "light brown": return "#D2B48C";
            case "tan": return "#D2B48C";
            case "beige": return "#F5F5DC"; // Accurate beige/cream
            case "cream": return "#FFFDD0"; // Accurate cream
            case "khaki": return "#F0E68C";
            case "sienna": return "#A0522D";
            case "chocolate": return "#D2691E";
            case "peru": return "#CD853F";
            case "sandy brown": return "#F4A460";
            case "wood": return "#8B4513"; // Wood tone
            case "wooden": return "#8B4513"; // Wooden
            case "timber": return "#8B4513"; // Timber
            
            // Purples
            case "purple": return "#800080";
            case "violet": return "#8A2BE2";
            case "indigo": return "#4B0082";
            case "magenta": return "#FF00FF";
            case "lavender": return "#E6E6FA";
            
            // Grays/Neutrals
            case "black": return "#000000";
            case "white": return "#FFFFFF";
            case "gray": case "grey": return "#808080";
            case "light gray": case "light grey": return "#D3D3D3";
            case "dark gray": case "dark grey": return "#A9A9A9";
            case "silver": return "#C0C0C0";
            case "blue gray": case "blue grey": return "#6A7B8A";
            case "slate gray": case "slate grey": return "#708090";
            
            // Default fallback - neutral gray instead of orange
            default: 
                logger.warn("Unknown color name: '{}', using default gray", colorName);
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