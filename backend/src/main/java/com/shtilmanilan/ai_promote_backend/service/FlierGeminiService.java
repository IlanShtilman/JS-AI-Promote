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

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ColorMindService colorMindService;

    public FlierGeminiService(RestTemplate restTemplate, ObjectMapper objectMapper, ColorMindService colorMindService) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.colorMindService = colorMindService;
    }

    public String generateFlierConfig(FlierInfo flierInfo) throws Exception {
        logger.info("Generating flyer styling advice using Gemini for: {}", flierInfo.title);

        try {
            // System and user prompts - updated to focus on multiple style options
            // NOTE: The prompt still requests the old structure (backgroundColor, etc.)
            // The generated style options in this class will convert to the new structure.
            String systemPrompt = "You are an expert flyer design stylist. Given the flyer specifications, suggest 2-3 distinct style options. Each option should include: " +
                    "backgroundColor (hex), textColor (hex), accentColor (hex, optional), highlightColor (hex, optional), pattern ('dots', 'grid', 'none'), backgroundImage (URL or 'none', use user-uploaded image if requested), and designRationale (short string). " +
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
                        logger.debug("Extracted JSON text: {}", jsonText);
                        
                        // Validate and prepare JSON text for parsing
                        String processedJsonText = null;
                        if (jsonText != null && !jsonText.trim().isEmpty()) {
                            String trimmed = jsonText.trim();
                            if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                                // Already a valid JSON array
                                processedJsonText = trimmed;
                            } else if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
                                // A single JSON object, wrap it in an array
                                processedJsonText = "[" + trimmed + "]";
                            }
                        }
                        
                        if (processedJsonText == null) {
                            // Failed to get valid JSON array or object to process
                            logger.error("Failed to extract or process valid JSON array/object from Gemini response.");
                            logger.debug("Attempted to process: {}", jsonText);
                            // Use fallback styles with new structure
                            return objectMapper.writeValueAsString(generateBasicStyleOptions(flierInfo));
                        }
                        
                        // Use the processed JSON text for parsing
                        jsonText = processedJsonText;
                        
                        // Log the JSON text just before parsing
                        logger.debug("JSON text for parsing: {}", jsonText);

                        // Try to parse as JSON to validate and convert to new structure
                        try {
                            // We assume the Gemini API might still return the old structure based on the prompt.
                            // We'll convert it to the new structure here.
                            List<Map<String, Object>> oldStyles = objectMapper.readValue(jsonText, objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class));
                            return objectMapper.writeValueAsString(convertStylesToNewStructure(oldStyles));
                        } catch (Exception e) {
                            logger.error("Failed to parse Gemini response as JSON or convert styles, using fallback: {}", e.getMessage());
                            logger.debug("Input JSON text for parsing/conversion: {}", jsonText);
                            // Use fallback styles with new structure
                            return objectMapper.writeValueAsString(generateBasicStyleOptions(flierInfo));
                        }
                    }
                }
            }
            
            logger.error("Unexpected Gemini API response structure, using fallback.");
            // Use fallback styles with new structure
            return objectMapper.writeValueAsString(generateBasicStyleOptions(flierInfo));
            
        } catch (Exception e) {
            logger.error("Error generating flier config: {}", e.getMessage(), e);
            // Use fallback styles with new structure
            return objectMapper.writeValueAsString(generateBasicStyleOptions(flierInfo));
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
     * Generate basic style options with varied backgrounds using the enhanced color palette.
     * Returns a List of Maps (new structure).
     */
    private List<Map<String, Object>> generateBasicStyleOptions(FlierInfo flierInfo) {
        try {
            logger.debug("Starting generateBasicStyleOptions for flier: {}", flierInfo.title);
            // Get colors from Azure Vision
            FlierInfo.Colors azureColors = flierInfo.azureVision != null ? flierInfo.azureVision.colors : null;
            logger.debug("Azure Colors: {}", azureColors);

            // Generate enhanced color palette using Azure colors as base
            Map<String, String> colorPalette = colorMindService.generateMarketingColorPalette(azureColors);
            logger.debug("Generated Color Palette: {}", colorPalette);

            // Create three basic style options with different background types and patterns
            List<Map<String, Object>> styles = new ArrayList<>();
            
            // Style 1: Solid background with Pattern (Grid) and subtle highlight
            logger.debug("Creating Style 1");
            Map<String, Object> style1 = new HashMap<>();
            Map<String, Object> background1 = new HashMap<>();
            background1.put("type", "solid");
            background1.put("color", colorPalette.get("background"));
            background1.put("gradient", null);
             // Adding a subtle gradient overlay for a bit more depth, similar to some examples
             String gradientOverlay = String.format("linear-gradient(0deg, %s 0%%, transparent 100%%)", colorPalette.get("highlight") + "30"); // Highlight color with transparency
            background1.put("backgroundImage", gradientOverlay);
            style1.put("background", background1);
            style1.put("textColor", colorPalette.get("text"));
            style1.put("accentColor", colorPalette.get("accent"));
            style1.put("highlightColor", colorPalette.get("highlight"));
            style1.put("pattern", "grid");
            // style1.put("backgroundImage", "none"); // pattern and background.backgroundImage are used for CSS backgroundImage
            style1.put("designRationale", "Clean style with a solid background, grid pattern, and subtle highlight using the enhanced palette.");
            styles.add(style1);
            logger.debug("Style 1 created: {}", style1);

            // Style 2: Gradient background with a different angle and layered colors
            logger.debug("Creating Style 2");
            Map<String, Object> style2 = new HashMap<>();
            Map<String, Object> background2 = new HashMap<>();
            background2.put("type", "gradient");
            // Create a gradient using colors from the enhanced palette with more stops
            String gradientColors2 = String.format("linear-gradient(45deg, %s 0%%, %s 30%%, %s 70%%, %s 100%%)", 
                colorPalette.get("primary"), 
                colorPalette.get("secondary"), 
                colorPalette.get("accent"),
                 colorPalette.get("background"));
            background2.put("gradient", gradientColors2);
            background2.put("color", null); // No solid color for gradient
            style2.put("background", background2);
            style2.put("textColor", colorPalette.get("text"));
            style2.put("accentColor", colorPalette.get("highlight")); // Using highlight as accent
            style2.put("highlightColor", colorPalette.get("accent")); // Using accent as highlight
            style2.put("pattern", "none");
            style2.put("backgroundImage", "none");
            style2.put("designRationale", "Vibrant gradient background style with layered colors from the enhanced palette.");
            styles.add(style2);
             logger.debug("Style 2 created: {}", style2);

            // Style 3: Solid background with layered pattern and possibly an SVG element
            logger.debug("Creating Style 3");
            Map<String, Object> style3 = new HashMap<>();
            Map<String, Object> background3 = new HashMap<>();
            background3.put("type", "solid");
            background3.put("color", colorPalette.get("background"));
            background3.put("gradient", null);
            // Example of adding a simple SVG as a background image layer
            String svgBackground = String.format("url(\"data:image/svg+xml;utf8,<svg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'>\n<circle cx='50' cy='50' r='40' fill='%s' fill-opacity='0.1'/>\n<rect x='150' y='100' width='80' height='60' fill='%s' fill-opacity='0.1'/>\n</svg>\")", colorPalette.get("accent"), colorPalette.get("primary"), "0.08"); // Added fill-opacity for rect
            background3.put("backgroundImage", svgBackground);
            style3.put("background", background3);
            style3.put("textColor", colorPalette.get("text"));
            style3.put("accentColor", colorPalette.get("secondary"));
            style3.put("highlightColor", colorPalette.get("highlight"));
            style3.put("pattern", "dots"); // Combining dots pattern
            // style3.put("backgroundImage", "none"); // Handled within the background object
            style3.put("designRationale", "Creative style with a solid background, dot pattern, and subtle graphic elements using the enhanced palette.");
            styles.add(style3);
             logger.debug("Style 3 created: {}", style3);

            logger.debug("Finished generating basic style options.");
            return styles; // Return List of Maps (new structure)
        } catch (Exception e) {
            logger.error("Error generating basic style options: {}", e.getMessage(), e); // Log the exception for details
            // Return a default list of THREE styles if the API call fails (using new structure)
             List<Map<String, Object>> styles = new ArrayList<>();
             
             // Default Style 1 (Solid + Grid)
             Map<String, Object> defaultStyle1 = new HashMap<>();
             Map<String, Object> defaultBackground1 = new HashMap<>();
             defaultBackground1.put("type","solid");
             defaultBackground1.put("color","#ffffff");
             defaultBackground1.put("gradient",null);
             defaultStyle1.put("background", defaultBackground1);
             defaultStyle1.put("textColor","#333333");
             defaultStyle1.put("accentColor","#FFA726");
             defaultStyle1.put("highlightColor","#F1C40F");
             defaultStyle1.put("pattern","grid");
             defaultStyle1.put("backgroundImage","none");
             defaultStyle1.put("designRationale","Default fallback style 1 (Solid + Grid)");
             styles.add(defaultStyle1);

             // Default Style 2 (Gradient)
             Map<String, Object> defaultStyle2 = new HashMap<>();
             Map<String, Object> defaultBackground2 = new HashMap<>();
             defaultBackground2.put("type","gradient");
             defaultBackground2.put("gradient","linear-gradient(135deg, #ffffff 0%, #cccccc 100%)");
             defaultBackground2.put("color",null);
             defaultStyle2.put("background", defaultBackground2);
             defaultStyle2.put("textColor","#333333");
             defaultStyle2.put("accentColor","#FFA726");
             defaultStyle2.put("highlightColor","#F1C40F");
             defaultStyle2.put("pattern","none");
             defaultStyle2.put("backgroundImage","none");
             defaultStyle2.put("designRationale","Default fallback style 2 (Gradient)");
             styles.add(defaultStyle2);

              // Default Style 3 (Solid)
             Map<String, Object> defaultStyle3 = new HashMap<>();
             Map<String, Object> defaultBackground3 = new HashMap<>();
             defaultBackground3.put("type","solid");
             defaultBackground3.put("color","#ffffff");
             defaultBackground3.put("gradient",null);
             defaultStyle3.put("background", defaultBackground3);
             defaultStyle3.put("textColor","#333333");
             defaultStyle3.put("accentColor","#FFA726");
             defaultStyle3.put("highlightColor","#F1C40F");
             defaultStyle3.put("pattern","none");
             defaultStyle3.put("backgroundImage","none");
             defaultStyle3.put("designRationale","Default fallback style 3 (Solid)");
             styles.add(defaultStyle3);

             return styles;
        }
    }

    /**
     * Helper method to convert old style structure to new structure with 'background' object.
     * This method is primarily a fallback/conversion for potentially old-formatted output from the main Gemini call.
     */
    private List<Map<String, Object>> convertStylesToNewStructure(List<Map<String, Object>> oldStyles) {
        List<Map<String, Object>> newStyles = new ArrayList<>();
        if (oldStyles == null) return newStyles;

        for (Map<String, Object> oldStyle : oldStyles) {
            Map<String, Object> newStyle = new HashMap<>(oldStyle);
            
            // Create the new 'background' object based on old backgroundColor if it exists and new background object doesn't
            if(oldStyle.containsKey("backgroundColor") && !newStyle.containsKey("background")) {
                Map<String, Object> background = new HashMap<>();
                background.put("type", "solid");
                background.put("color", oldStyle.get("backgroundColor"));
                background.put("gradient", null);
                newStyle.put("background", background);
                newStyle.remove("backgroundColor"); // Remove old key
            } else if (!newStyle.containsKey("background")) { // Ensure background object exists even if old key is missing
                 Map<String, Object> background = new HashMap<>();
                 background.put("type", "solid");
                 background.put("color", "#ffffff"); // Default
                 background.put("gradient", null);
                 newStyle.put("background", background);
            }
            
            // Ensure highlightColor exists (might be missing in old structure) and other key colors are present
             if (!newStyle.containsKey("highlightColor")) {
                 newStyle.put("highlightColor", newStyle.get("accentColor") != null ? newStyle.get("accentColor") : "#F1C40F");
             }
             // Add other expected color keys if missing, using a default or deriving if possible
             if (!newStyle.containsKey("textColor")) newStyle.put("textColor", "#000000");
             if (!newStyle.containsKey("accentColor")) newStyle.put("accentColor", "#FFA726");

            newStyles.add(newStyle);
        }

        return newStyles;
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