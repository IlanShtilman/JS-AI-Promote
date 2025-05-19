package com.shtilmanilan.ai_promote_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.shtilmanilan.ai_promote_backend.model.FlierInfo.Colors;

@Service
public class ColorMindService {
    private static final Logger logger = LoggerFactory.getLogger(ColorMindService.class);
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private static final String COLORMIND_API_URL = "https://colormind.io/api/";

    public ColorMindService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public Map<String, String> generateMarketingColorPalette(Colors azureColors) {
        try {
            // Use Azure's colors as base colors
            Map<String, String> colorMap = new HashMap<>();
            
            if (azureColors != null) {
                // Keep Azure's primary color as is
                colorMap.put("primary", azureColors.primary);
                
                // Use Azure's secondary color as base for accent
                colorMap.put("accent", azureColors.secondary);
                
                // Use Azure's background color as base
                colorMap.put("background", azureColors.background);
                
                // Generate complementary colors using Colormind
                List<List<Integer>> complementaryColors = generateComplementaryColors(
                    azureColors.primary,
                    azureColors.secondary
                );
                
                // Add complementary colors to enhance the palette
                colorMap.put("secondary", rgbToHex(complementaryColors.get(0)));
                colorMap.put("text", rgbToHex(complementaryColors.get(1)));
                colorMap.put("highlight", rgbToHex(complementaryColors.get(2)));
            } else {
                // Fallback to default palette if no Azure colors
                colorMap.put("primary", "#2C3E50");
                colorMap.put("secondary", "#E74C3C");
                colorMap.put("accent", "#3498DB");
                colorMap.put("background", "#ECF0F1");
                colorMap.put("text", "#2C3E50");
                colorMap.put("highlight", "#F1C40F");
            }
            
            return colorMap;
        } catch (Exception e) {
            logger.error("Error generating marketing color palette: {}", e.getMessage());
            // Return a default palette if anything fails
            Map<String, String> defaultPalette = new HashMap<>();
            defaultPalette.put("primary", "#2C3E50");
            defaultPalette.put("secondary", "#E74C3C");
            defaultPalette.put("accent", "#3498DB");
            defaultPalette.put("background", "#ECF0F1");
            defaultPalette.put("text", "#2C3E50");
            defaultPalette.put("highlight", "#F1C40F");
            return defaultPalette;
        }
    }

    private List<List<Integer>> generateComplementaryColors(String primaryColor, String secondaryColor) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "default");
            
            // Convert hex colors to RGB
            int[] primaryRGB = hexToRgb(primaryColor);
            int[] secondaryRGB = hexToRgb(secondaryColor);
            
            // Use both Azure colors as locked colors and let Colormind generate complementary ones
            requestBody.put("input", List.of(
                List.of(primaryRGB[0], primaryRGB[1], primaryRGB[2]),  // Lock primary color
                List.of(secondaryRGB[0], secondaryRGB[1], secondaryRGB[2]),  // Lock secondary color
                "N", "N", "N"  // Generate complementary colors
            ));

            String response = restTemplate.postForObject(
                COLORMIND_API_URL,
                requestBody,
                String.class
            );

            Map<String, Object> responseMap = objectMapper.readValue(response, Map.class);
            List<List<Integer>> result = (List<List<Integer>>) responseMap.get("result");
            
            // Return only the generated complementary colors
            return result.subList(2, 5);
        } catch (Exception e) {
            logger.error("Error generating complementary colors: {}", e.getMessage());
            // Return default complementary colors
            return List.of(
                List.of(231, 76, 60),   // red
                List.of(236, 240, 241), // light gray
                List.of(52, 152, 219)   // blue
            );
        }
    }

    private int[] hexToRgb(String hex) {
        hex = hex.replace("#", "");
        return new int[] {
            Integer.parseInt(hex.substring(0, 2), 16),
            Integer.parseInt(hex.substring(2, 4), 16),
            Integer.parseInt(hex.substring(4, 6), 16)
        };
    }

    private String rgbToHex(List<Integer> rgb) {
        return String.format("#%02x%02x%02x", rgb.get(0), rgb.get(1), rgb.get(2));
    }
}