package com.shtilmanilan.ai_promote_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shtilmanilan.ai_promote_backend.model.BackgroundGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.BackgroundOption;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class ImagenBackgroundService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${google.cloud.project:}")
    private String googleCloudProject;

    @Value("${google.cloud.location:us-central1}")
    private String googleCloudLocation;

    @Value("${background.images.path:C:/Users/ishti/JS-AI-PROMOTE/generated-backgrounds}")
    private String backgroundImagesPath;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generate 3 background images using Google Imagen 3.0
     * Always generates fresh images for optimal results
     * Images are saved to local filesystem for immediate use
     */
    public List<BackgroundOption> generateBackgroundImages(BackgroundGenerationRequest request) {
        System.out.println("🎨 Imagen Service: Starting fresh background image generation...");
        
        try {
            // Ensure output directory exists
            createOutputDirectory();
            
            // Skip cache - always generate fresh backgrounds for better relevance
            System.out.println("🆕 Generating 3 fresh backgrounds optimized for: " + request.getBusinessType());
            
            // Generate all 3 backgrounds
            List<String> imagePrompts = createImagePrompts(request);
            List<CompletableFuture<BackgroundOption>> futures = new ArrayList<>();
            
            for (int i = 0; i < 3; i++) {
                final int index = i;
                final String prompt = imagePrompts.get(i % imagePrompts.size());
                
                CompletableFuture<BackgroundOption> future = CompletableFuture.supplyAsync(() -> {
                    try {
                        return generateSingleBackgroundImage(prompt, index + 1, request);
                    } catch (Exception e) {
                        System.err.println("❌ Failed to generate image " + (index + 1) + ": " + e.getMessage());
                        return createFallbackBackground(index + 1, request);
                    }
                });
                
                futures.add(future);
            }
            
            // Wait for all generations to complete
            List<BackgroundOption> allBackgrounds = new ArrayList<>();
            for (CompletableFuture<BackgroundOption> future : futures) {
                allBackgrounds.add(future.get());
            }
            
            System.out.println("✅ Generated " + allBackgrounds.size() + " fresh backgrounds optimized for " + request.getBusinessType());
            
            return allBackgrounds;
            
        } catch (Exception e) {
            System.err.println("❌ Image generation failed: " + e.getMessage());
            return generateFallbackBackgrounds(request);
        }
    }

    /**
     * Check for existing backgrounds that match the current request
     * Smart matching based on business type, color scheme, and recency
     */
    private List<BackgroundOption> checkExistingBackgrounds(BackgroundGenerationRequest request) {
        List<BackgroundOption> existingBackgrounds = new ArrayList<>();
        
        try {
            Path backgroundDir = Paths.get(backgroundImagesPath);
            if (!Files.exists(backgroundDir)) {
                return existingBackgrounds;
            }
            
            String businessType = request.getBusinessType();
            String colorScheme = request.getColorScheme();
            
            System.out.println("🔍 Checking cache for: " + businessType + " with " + colorScheme + " colors");
            
            // Get all PNG files in the directory
            Files.list(backgroundDir)
                .filter(path -> path.toString().toLowerCase().endsWith(".png"))
                .filter(path -> path.getFileName().toString().startsWith("background_"))
                .sorted((p1, p2) -> {
                    // Sort by modification time, newest first
                    try {
                        return Files.getLastModifiedTime(p2).compareTo(Files.getLastModifiedTime(p1));
                    } catch (IOException e) {
                        return 0;
                    }
                })
                .limit(20) // Check more recent files for better matching
                .forEach(path -> {
                    try {
                        String filename = path.getFileName().toString();
                        
                        // Smart matching logic
                        boolean isGoodMatch = isBackgroundSuitableForRequest(filename, request);
                        
                        if (isGoodMatch && existingBackgrounds.size() < 3) {
                            String imageUrl = "http://localhost:8081/api/backgrounds/images/" + filename;
                            
                            BackgroundOption background = new BackgroundOption();
                            background.setName("Cached " + capitalizeFirst(businessType) + " Background");
                            background.setBackgroundImage(imageUrl);
                            background.setTextColor("#333333");
                            background.setAccentColor(getAccentColorFromRequest(request));
                            background.setDescription("Previously generated " + businessType + " background");
                            background.setSource("cache");
                            
                            existingBackgrounds.add(background);
                            System.out.println("✅ Found suitable cached background: " + filename);
                        }
                        
                    } catch (Exception e) {
                        System.err.println("❌ Error processing cached background: " + e.getMessage());
                    }
                });
                
            System.out.println("📁 Found " + existingBackgrounds.size() + " suitable cached backgrounds for " + businessType);
            
        } catch (Exception e) {
            System.err.println("❌ Error checking existing backgrounds: " + e.getMessage());
        }
        
        return existingBackgrounds;
    }
    
    /**
     * Determine if a cached background is suitable for the current request
     */
    private boolean isBackgroundSuitableForRequest(String filename, BackgroundGenerationRequest request) {
        // For now, use simple time-based logic with business type awareness
        // In the future, we could store metadata files alongside images
        
        try {
            // Extract timestamp from filename (background_20250524_184501_1.png)
            String timestamp = filename.substring(11, 26); // Extract "20250524_184501"
            LocalDateTime fileTime = LocalDateTime.parse(timestamp, DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            LocalDateTime now = LocalDateTime.now();
            
            // Use backgrounds generated within the last 24 hours for same business type
            // Or within last 6 hours for any business type
            long hoursOld = java.time.Duration.between(fileTime, now).toHours();
            
            String businessType = request.getBusinessType();
            
            if (hoursOld <= 6) {
                // Very recent - probably good for any business type
                System.out.println("⚡ Using recent background (" + hoursOld + "h old): " + filename);
                return true;
            } else if (hoursOld <= 24 && isSimilarBusinessType(businessType, filename)) {
                // Somewhat recent and similar business type
                System.out.println("🎯 Using cached background for similar business (" + hoursOld + "h old): " + filename);
                return true;
            }
            
            return false;
            
        } catch (Exception e) {
            // If we can't parse the timestamp, be conservative
            return false;
        }
    }
    
    /**
     * Check if the business type is similar (could be enhanced with ML in the future)
     */
    private boolean isSimilarBusinessType(String currentBusinessType, String filename) {
        // Simple heuristic - in the future we could store metadata with each background
        // For now, assume recent backgrounds are generally suitable
        return true; // Conservative approach
    }
    
    /**
     * Capitalize first letter of a string
     */
    private String capitalizeFirst(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    /**
     * Generate a single background image using Imagen 3.0
     */
    private BackgroundOption generateSingleBackgroundImage(String prompt, int imageNumber, BackgroundGenerationRequest request) {
        try {
            System.out.println("🚀 Generating image " + imageNumber + " with Imagen 3.0...");
            
            // Call Gemini API with Imagen 3.0 model
            Map<String, Object> requestBody = createImagenRequest(prompt);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            String url = "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=" + geminiApiKey;
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            
            // Parse response and save image
            return parseImagenResponse(response, imageNumber, prompt, request);
            
        } catch (Exception e) {
            System.err.println("❌ Imagen generation failed for image " + imageNumber + ": " + e.getMessage());
            throw new RuntimeException("Image generation failed", e);
        }
    }

    /**
     * Create image generation prompts optimized for flyer backgrounds
     */
    private List<String> createImagePrompts(BackgroundGenerationRequest request) {
        String businessType = request.getBusinessType();
        String targetAudience = request.getTargetAudience();
        String colorScheme = request.getColorScheme();
        
        // ✅ GET USER'S ACTUAL CONTENT FOR RELEVANT BACKGROUNDS
        String title = request.getTitle();                    // "Crazy Sale", "Grand Opening"
        String promotionalText = request.getPromotionalText(); // "50% Off Everything!"
        
        // Get more specific details if available
        Map<String, String> palette = request.getColorPalette();
        String primaryColor = palette != null ? palette.get("primary") : "";
        String secondaryColor = palette != null ? palette.get("secondary") : "";
        
        List<String> prompts = new ArrayList<>();
        
        // ✅ ENHANCED BUSINESS-SPECIFIC CONTEXT
        String specificBusinessContext = getSpecificBusinessContext(businessType, title, promotionalText);
        String contentContext = "";
        if (title != null && !title.isEmpty()) {
            contentContext += title + " theme";
            if (promotionalText != null && !promotionalText.isEmpty()) {
                contentContext += ", " + promotionalText + " promotion";
            }
        } else if (promotionalText != null && !promotionalText.isEmpty()) {
            contentContext += promotionalText + " promotion theme";
        }
        
        // Professional gradient background - USING SPECIFIC BUSINESS CONTEXT
        prompts.add(String.format(
            "Abstract geometric background pattern for %s targeting %s, " +
            "%s color scheme with %s tones, smooth gradients and geometric shapes inspired by %s aesthetic, " +
            "STRICT REQUIREMENT: ABSOLUTELY NO TEXT, NO WORDS, NO LETTERS, NO LOGOS, NO SYMBOLS, " +
            "NO LOREM IPSUM, NO PLACEHOLDER TEXT, NO READABLE CONTENT OF ANY KIND, " +
            "NO RESTAURANT NAMES, NO BUSINESS NAMES, NO PROMOTIONAL TEXT, NO TYPOGRAPHY, " +
            "ONLY pure abstract visual patterns, shapes, gradients, and colors, 1024x1024 resolution",
            specificBusinessContext, targetAudience, colorScheme, primaryColor, specificBusinessContext
        ));
        
        // Abstract artistic background - BUSINESS-THEMED VISUALS
        prompts.add(String.format(
            "Abstract flowing artistic pattern inspired by %s atmosphere for %s audience, " +
            "%s and %s color palette, organic flowing shapes and curves with %s visual elements, " +
            "%s energy theme with subtle %s-inspired abstract motifs, " +
            "CRITICAL: NO TEXT ELEMENTS, NO WORDS, NO LETTERS, NO SIGNS, NO LOREM TEXT, " +
            "NO PLACEHOLDER CONTENT, NO BUSINESS NAMES, NO PROMOTIONAL MESSAGES, " +
            "NO READABLE SYMBOLS, NO TYPOGRAPHY, NO LOGOS, NO RESTAURANT BRANDING, " +
            "pure abstract visual art only, 1024x1024 resolution",
            specificBusinessContext, targetAudience, primaryColor, secondaryColor,
            getBusinessVisualElements(businessType),
            contentContext.toLowerCase().contains("sale") ? "exciting sale" : "professional business",
            businessType
        ));
        
        // Subtle textured background - INDUSTRY-THEMED TEXTURES
        prompts.add(String.format(
            "Minimalist texture pattern for %s %s design theme, " +
            "%s color scheme, simple geometric textures with subtle %s-inspired abstract elements, " +
            "clean visual design for %s business targeting %s, soft %s atmospheric feeling, " +
            "ESSENTIAL: NO VISIBLE TEXT, NO WORDS, NO LETTERS, NO LOREM ELEMENTS, " +
            "NO PLACEHOLDER TEXT, NO BUSINESS CONTENT, NO PROMOTIONAL TEXT, " +
            "NO READABLE ELEMENTS, just pure minimalist texture patterns, 1024x1024 resolution",
            specificBusinessContext, contentContext.isEmpty() ? "" : contentContext,
            colorScheme, businessType, businessType, targetAudience, businessType
        ));
        
        return prompts;
    }
    
    /**
     * Get specific business context for more relevant image generation
     */
    private String getSpecificBusinessContext(String businessType, String title, String promotionalText) {
        if (businessType == null) return "business";
        
        String business = businessType.toLowerCase();
        
        // ✅ SPECIFIC FOOD BUSINESS TYPES
        if (business.contains("hamburger") || business.contains("burger")) {
            return "hamburger restaurant with burger joint atmosphere";
        } else if (business.contains("pizza")) {
            return "pizzeria with Italian restaurant atmosphere";
        } else if (business.contains("cafe") || business.contains("coffee")) {
            return "coffee cafe with cozy coffeehouse atmosphere";
        } else if (business.contains("bakery") || business.contains("pastry")) {
            return "bakery with artisan pastry shop atmosphere";
        } else if (business.contains("sushi") || business.contains("japanese")) {
            return "sushi restaurant with Japanese dining atmosphere";
        } else if (business.contains("chinese") || business.contains("asian")) {
            return "Asian restaurant with oriental dining atmosphere";
        } else if (business.contains("mexican") || business.contains("taco")) {
            return "Mexican restaurant with vibrant cantina atmosphere";
        } else if (business.contains("indian") || business.contains("curry")) {
            return "Indian restaurant with spiced dining atmosphere";
        } else if (business.contains("steakhouse") || business.contains("grill")) {
            return "steakhouse with upscale grilling atmosphere";
        } else if (business.contains("seafood") || business.contains("fish")) {
            return "seafood restaurant with fresh ocean atmosphere";
        } else if (business.contains("ice cream") || business.contains("gelato")) {
            return "ice cream parlor with sweet dessert atmosphere";
        } else if (business.contains("bar") || business.contains("pub")) {
            return "bar with social drinking atmosphere";
        } else if (business.contains("fast food") || business.contains("quick")) {
            return "fast food restaurant with quick service atmosphere";
        } else if (business.contains("fine dining") || business.contains("upscale")) {
            return "fine dining restaurant with elegant upscale atmosphere";
        } 
        // ✅ OTHER BUSINESS TYPES
        else if (business.contains("tech") || business.contains("software") || business.contains("digital")) {
            return "tech company with modern digital atmosphere";
        } else if (business.contains("retail") || business.contains("store") || business.contains("shop")) {
            return "retail store with commercial shopping atmosphere";
        } else if (business.contains("gym") || business.contains("fitness")) {
            return "fitness center with energetic workout atmosphere";
        } else if (business.contains("salon") || business.contains("beauty")) {
            return "beauty salon with elegant grooming atmosphere";
        } else if (business.contains("hotel") || business.contains("accommodation")) {
            return "hotel with luxurious hospitality atmosphere";
        } else if (business.contains("medical") || business.contains("clinic")) {
            return "medical clinic with clean healthcare atmosphere";
        } else if (business.contains("auto") || business.contains("car")) {
            return "automotive service with mechanical atmosphere";
        } else if (business.contains("education") || business.contains("school")) {
            return "educational institution with learning atmosphere";
        } else {
            return businessType + " business with professional atmosphere";
        }
    }
    
    /**
     * Get visual elements associated with business types for abstract inspiration
     */
    private String getBusinessVisualElements(String businessType) {
        if (businessType == null) return "geometric";
        
        String business = businessType.toLowerCase();
        
        if (business.contains("hamburger") || business.contains("burger")) {
            return "circular and layered geometric elements";
        } else if (business.contains("pizza")) {
            return "circular and triangular geometric patterns";
        } else if (business.contains("cafe") || business.contains("coffee")) {
            return "circular and curved organic shapes";
        } else if (business.contains("bakery")) {
            return "rounded and flowing organic forms";
        } else if (business.contains("tech")) {
            return "angular and grid-based geometric patterns";
        } else if (business.contains("retail")) {
            return "rectangular and structured geometric elements";
        } else if (business.contains("fitness")) {
            return "dynamic angular and energetic shapes";
        } else {
            return "balanced geometric and organic elements";
        }
    }

    /**
     * Create Imagen API request body
     */
    private Map<String, Object> createImagenRequest(String prompt) {
        Map<String, Object> instance = new HashMap<>();
        instance.put("prompt", prompt);
        
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("sampleCount", 1);
        parameters.put("aspectRatio", "1:1");
        parameters.put("safetyFilterLevel", "block_some");
        parameters.put("personGeneration", "dont_allow"); // No people in backgrounds
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("instances", Arrays.asList(instance));
        requestBody.put("parameters", parameters);
        
        return requestBody;
    }

    /**
     * Parse Imagen response and save image to filesystem
     */
    private BackgroundOption parseImagenResponse(Map<String, Object> response, int imageNumber, String prompt, BackgroundGenerationRequest request) {
        try {
            List<Map<String, Object>> predictions = (List<Map<String, Object>>) response.get("predictions");
            
            if (predictions == null || predictions.isEmpty()) {
                throw new RuntimeException("No predictions in Imagen response");
            }
            
            Map<String, Object> prediction = predictions.get(0);
            String base64Image = (String) prediction.get("bytesBase64Encoded");
            
            if (base64Image == null || base64Image.isEmpty()) {
                throw new RuntimeException("No image data in Imagen response");
            }
            
            // Decode base64 image
            byte[] imageBytes = Base64.getDecoder().decode(base64Image);
            
            // Generate unique filename
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("background_%s_%d.png", timestamp, imageNumber);
            Path imagePath = Paths.get(backgroundImagesPath, filename);
            
            // Save image to filesystem
            Files.write(imagePath, imageBytes);
            // Use HTTP URL instead of file:// URL for browser compatibility
            String imageUrl = "http://localhost:8081/api/backgrounds/images/" + filename;
            
            System.out.println("✅ Saved background image: " + filename);
            
            // Create BackgroundOption with image URL and smart text colors
            BackgroundOption background = new BackgroundOption();
            background.setName("AI Generated Background " + imageNumber);
            background.setBackgroundImage(imageUrl);
            
            // Analyze image for optimal text colors
            String[] styleAnalysis = analyzeImageForTextColors(imageBytes, request, imageNumber);
            String aiTextColor = styleAnalysis[0];
            String aiAccentColor = styleAnalysis[1];
            String aiFontFamily = styleAnalysis[2];
            String aiFontSize = styleAnalysis[3];
            String aiBodyFontSize = styleAnalysis[4];
            
            background.setTextColor(aiTextColor);
            background.setAccentColor(aiAccentColor);
            
            // ✅ ADD AI-DECIDED TYPOGRAPHY TO RESPONSE
            background.setFontFamily(aiFontFamily);
            background.setFontSize(Float.parseFloat(aiFontSize));
            background.setBodyFontSize(Float.parseFloat(aiBodyFontSize));
            
            // Determine style name based on AI decisions
            String styleName = getStyleName(imageNumber, request.getBusinessType(), request.getTargetAudience());
            background.setStyleName(styleName);
            
            background.setDescription("Professional background generated with Imagen 3.0 | " + styleName + " style with " + aiFontFamily.split(",")[0] + " typography");
            background.setSource("imagen");
            
            System.out.println("✅ Generated background with text color: " + aiTextColor + 
                             ", accent: " + aiAccentColor);
            
            return background;
            
        } catch (Exception e) {
            System.err.println("❌ Failed to parse Imagen response: " + e.getMessage());
            throw new RuntimeException("Failed to process generated image", e);
        }
    }

    /**
     * Create output directory if it doesn't exist
     */
    private void createOutputDirectory() {
        try {
            Path outputPath = Paths.get(backgroundImagesPath);
            if (!Files.exists(outputPath)) {
                Files.createDirectories(outputPath);
                System.out.println("📁 Created output directory: " + backgroundImagesPath);
            }
        } catch (IOException e) {
            System.err.println("❌ Failed to create output directory: " + e.getMessage());
            throw new RuntimeException("Cannot create output directory", e);
        }
    }

    /**
     * Generate fallback backgrounds when Imagen fails
     */
    private List<BackgroundOption> generateFallbackBackgrounds(BackgroundGenerationRequest request) {
        System.out.println("🛡️ Generating fallback backgrounds (no images)");
        
        Map<String, String> palette = request.getColorPalette();
        String primary = palette != null ? palette.get("primary") : "#2196F3";
        String secondary = palette != null ? palette.get("secondary") : "#FF9800";
        String accent = palette != null ? palette.get("accent") : "#4CAF50";
        String textColor = "#333333";
        
        List<BackgroundOption> fallbacks = new ArrayList<>();
        
        fallbacks.add(new BackgroundOption(
            "Clean Gradient (Fallback)",
            String.format("linear-gradient(135deg, %s15, %s25)", primary, secondary),
            textColor,
            accent,
            "CSS gradient fallback when image generation fails"
        ));
        
        fallbacks.add(new BackgroundOption(
            "Solid Professional (Fallback)",
            "#FFFFFF",
            textColor,
            primary,
            "Clean white background fallback"
        ));
        
        fallbacks.add(new BackgroundOption(
            "Subtle Pattern (Fallback)",
            String.format("linear-gradient(45deg, %s05, %s10)", accent, primary),
            textColor,
            secondary,
            "Minimal pattern fallback"
        ));
        
        fallbacks.forEach(bg -> bg.setSource("fallback"));
        
        return fallbacks;
    }

    /**
     * Create single fallback background
     */
    private BackgroundOption createFallbackBackground(int imageNumber, BackgroundGenerationRequest request) {
        Map<String, String> palette = request.getColorPalette();
        String primary = palette != null ? palette.get("primary") : "#2196F3";
        String textColor = "#333333";
        
        BackgroundOption fallback = new BackgroundOption();
        fallback.setName("Fallback Background " + imageNumber);
        fallback.setBackgroundCSS(String.format("linear-gradient(135deg, %s20, %s40)", primary, primary));
        fallback.setTextColor(textColor);
        fallback.setAccentColor(primary);
        fallback.setDescription("Fallback when image generation fails");
        fallback.setSource("fallback");
        
        return fallback;
    }

    /**
     * Get accent color from request
     */
    private String getAccentColorFromRequest(BackgroundGenerationRequest request) {
        Map<String, String> palette = request.getColorPalette();
        return palette != null ? palette.get("accent") : "#4CAF50";
    }

    /**
     * Estimate cost for Imagen generation
     */
    public double estimateCost() {
        // Imagen 3.0 costs approximately $0.04 per image
        return 0.04 * 3; // Cost for 3 images
    }

    /**
     * Analyze image for optimal text colors based on brightness and contrast
     * Each background slot gets a predetermined style for variety
     */
    private String[] analyzeImageForTextColors(byte[] imageBytes, BackgroundGenerationRequest request, int backgroundNumber) {
        try {
            Map<String, String> palette = request.getColorPalette();
            String businessType = request.getBusinessType();
            String targetAudience = request.getTargetAudience();
            String title = request.getTitle();
            String promotionalText = request.getPromotionalText();
            
            String textColor;
            String accentColor;
            String fontFamily;
            float fontSize;
            float bodyFontSize;
            
            // ✅ PREDETERMINED STYLE SLOTS for variety (regardless of business context)
            if (backgroundNumber == 1) {
                // SLOT 1: Professional Clean Style
                fontFamily = "Roboto, sans-serif";
                fontSize = 4.0f;
                bodyFontSize = 1.7f;
                System.out.println("🎨 Background 1: Professional Clean Style");
                
            } else if (backgroundNumber == 2) {
                // SLOT 2: Elegant Sophisticated Style  
                fontFamily = "Georgia, serif";
                fontSize = 3.8f;
                bodyFontSize = 1.6f;
                System.out.println("🎨 Background 2: Elegant Sophisticated Style");
                
            } else {
                // SLOT 3: Bold Modern Style
                fontFamily = "Montserrat, sans-serif";
                fontSize = 4.5f;
                bodyFontSize = 1.9f;
                System.out.println("🎨 Background 3: Bold Modern Style");
            }
            
            // ✅ SMART COLOR ANALYSIS for contrast
            // PRIORITY 1: Use actual analyzed colors from uploaded images if available
            if (palette != null && palette.get("primary") != null && !palette.get("primary").equals("#2196F3")) {
                // We have real analyzed colors from uploaded images - use them!
                String primaryColor = palette.get("primary");
                String secondaryColor = palette.get("secondary");
                String extractedAccent = palette.get("accent");
                
                // ✅ IMPROVED CONTRAST ANALYSIS
                if (isBackgroundLight(primaryColor)) {
                    // Light background → Dark text for contrast
                    textColor = "#1A1A1A";
                } else {
                    // Dark background → Light text for contrast  
                    textColor = "#FFFFFF";
                }
                
                // Choose accent that contrasts with both background and text
                accentColor = chooseContrastingAccent(primaryColor, textColor, extractedAccent, secondaryColor);
                
                System.out.println("🎨 Background " + backgroundNumber + " - EXTRACTED COLORS: Primary=" + primaryColor + 
                                 ", Text=" + textColor + ", Accent=" + accentColor);
                
            } else {
                // ✅ BUSINESS-BASED COLORS with improved contrast
                if (businessType != null && businessType.toLowerCase().contains("food")) {
                    textColor = "#2C1810"; // Warm brown
                    accentColor = "#D4862D"; // Food orange
                } else if (targetAudience != null && targetAudience.toLowerCase().contains("young")) {
                    textColor = "#1A1A1A"; // High contrast
                    accentColor = "#FF6B35"; // Energetic orange
                } else if (targetAudience != null && targetAudience.toLowerCase().contains("professional")) {
                    textColor = "#2D2D2D"; // Professional gray
                    accentColor = "#1976d2"; // Professional blue
                } else {
                    // Default high-contrast colors
                    textColor = "#1A1A1A"; // Very dark for readability
                    accentColor = "#2196F3"; // Clear blue
                }
                
                System.out.println("🎨 Background " + backgroundNumber + " - BUSINESS COLORS: " + businessType + 
                                 " → Text=" + textColor + ", Accent=" + accentColor);
            }
            
            System.out.println("🔤 Background " + backgroundNumber + " TYPOGRAPHY: " + fontFamily + 
                             " (" + fontSize + "rem title, " + bodyFontSize + "rem body)");
            
            // Return all AI decisions as array
            return new String[]{textColor, accentColor, fontFamily, String.valueOf(fontSize), String.valueOf(bodyFontSize)};
            
        } catch (Exception e) {
            System.err.println("❌ Error in AI style analysis: " + e.getMessage());
            return new String[]{"#1A1A1A", "#2196F3", "Roboto, sans-serif", "4.0", "1.7"};
        }
    }
    
    /**
     * Improved background brightness detection
     */
    private boolean isBackgroundLight(String hexColor) {
        try {
            // Remove # if present
            String hex = hexColor.replace("#", "");
            
            // Convert to RGB
            int r = Integer.parseInt(hex.substring(0, 2), 16);
            int g = Integer.parseInt(hex.substring(2, 4), 16); 
            int b = Integer.parseInt(hex.substring(4, 6), 16);
            
            // Use proper luminance formula (WCAG guidelines)
            double luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
            boolean isLight = luminance > 0.5; // More conservative threshold
            
            System.out.println("🔍 Color " + hexColor + " luminance: " + String.format("%.2f", luminance) + 
                             " → " + (isLight ? "LIGHT" : "DARK"));
            return isLight;
            
        } catch (Exception e) {
            System.err.println("❌ Error analyzing color brightness: " + e.getMessage());
            return true; // Default to light (safer for dark text)
        }
    }
    
    /**
     * Choose accent color that contrasts well with both background and text
     */
    private String chooseContrastingAccent(String backgroundColor, String textColor, String extractedAccent, String secondaryColor) {
        // If we have extracted accent and it's different from background, use it
        if (extractedAccent != null && !extractedAccent.equals(backgroundColor) && !extractedAccent.equals(textColor)) {
            return extractedAccent;
        }
        
        // If we have secondary color and it contrasts, use it
        if (secondaryColor != null && !secondaryColor.equals(backgroundColor) && !secondaryColor.equals(textColor)) {
            return secondaryColor;
        }
        
        // Fallback to high-contrast accent based on background
        if (isBackgroundLight(backgroundColor)) {
            return "#1976d2"; // Blue for light backgrounds
        } else {
            return "#FF9800"; // Orange for dark backgrounds
        }
    }

    /**
     * Determine style name based on predetermined slots and business context
     */
    private String getStyleName(int backgroundNumber, String businessType, String targetAudience) {
        try {
            // Base style names for each slot
            String baseStyle = "";
            if (backgroundNumber == 1) {
                baseStyle = "Professional Clean";
            } else if (backgroundNumber == 2) {
                baseStyle = "Elegant Sophisticated";
            } else {
                baseStyle = "Bold Modern";
            }
            
            // Add business context for distinction
            String contextualStyle = baseStyle;
            if (businessType != null) {
                if (businessType.toLowerCase().contains("food") || businessType.toLowerCase().contains("restaurant")) {
                    contextualStyle = baseStyle + " Gourmet";
                } else if (businessType.toLowerCase().contains("tech")) {
                    contextualStyle = baseStyle + " Tech";
                } else if (businessType.toLowerCase().contains("retail")) {
                    contextualStyle = baseStyle + " Retail";
                }
            }
            
            return contextualStyle;
            
        } catch (Exception e) {
            return "Professional Style";
        }
    }
} 