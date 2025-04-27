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
            // Process the response
            return processResponse(response);
        } catch (Exception e) {
            logger.error("Error in analyzeImage: {}", e.getMessage(), e);
            throw e;
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

        // Process colors
        if (response.containsKey("color")) {
            Map<String, Object> colorData = (Map<String, Object>) response.get("color");
            AzureVisionResponse.Colors colors = new AzureVisionResponse.Colors();
            colors.setPrimary((String) colorData.get("dominantColorForeground"));
            colors.setSecondary((String) colorData.get("dominantColorBackground"));
            colors.setAccent("#FFA726"); // Default accent color
            colors.setBackground("#FFFFFF"); // Default background
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

        // Set default values
        result.setAtmosphere("neutral and balanced");
        result.setLighting("dim ambient");
        result.setBusinessType("general business");

        return result;
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