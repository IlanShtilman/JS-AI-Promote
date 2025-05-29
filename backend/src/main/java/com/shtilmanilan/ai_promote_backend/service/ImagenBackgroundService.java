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
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import javax.imageio.ImageIO;
import java.awt.Color;

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
        
        // Get user's actual content for relevant backgrounds
        String title = request.getTitle();
        String promotionalText = request.getPromotionalText();
        
        // Get more specific details if available
        Map<String, String> palette = request.getColorPalette();
        String primaryColor = palette != null ? palette.get("primary") : "";
        String secondaryColor = palette != null ? palette.get("secondary") : "";
        
        List<String> prompts = new ArrayList<>();
        
        // Enhanced business-specific context
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
        
        // Optional: Subtle food motif phrase
        String foodElementHint = getBusinessVisualElements(businessType);
        String foodElementPhrase = String.format(
            "Incorporate gentle, abstract motifs inspired by %s, blended smoothly into the background with low opacity, so they do not distract from the flyer's main content. ",
            foodElementHint
        );

        // PROMPT 1: Professional gradient geometric
        prompts.add(String.format(
            "Abstract geometric background pattern for %s targeting %s, " +
            "%s color scheme with %s tones, smooth gradients and geometric shapes inspired by %s aesthetic, " +
            "STRICT REQUIREMENT: ABSOLUTELY NO TEXT, NO WORDS, NO LETTERS, NO LOGOS, NO SYMBOLS, " +
            "NO LOREM IPSUM, NO PLACEHOLDER TEXT, NO READABLE CONTENT OF ANY KIND, " +
            "NO RESTAURANT NAMES, NO BUSINESS NAMES, NO PROMOTIONAL TEXT, NO TYPOGRAPHY, " +
            "ONLY pure abstract visual patterns, shapes, gradients, and colors, 1024x1024 resolution",
            specificBusinessContext, targetAudience, colorScheme, primaryColor, 
            contentContext.isEmpty() ? "modern business" : contentContext
        ));

        // PROMPT 2: Dynamic diagonal/linear
        prompts.add(String.format(
            "Dynamic diagonal stripe pattern for %s business targeting %s audience, " +
            "%s and %s color palette, bold diagonal lines and angular geometric elements, " +
            "modern linear design with %s energy, sharp angles and directional flow for %s theme, " +
            "contemporary stripe pattern with varying thickness and spacing, gradient transitions between stripes, " +
            "CRITICAL: NO TEXT ELEMENTS, NO WORDS, NO LETTERS, NO SIGNS, NO LOREM TEXT, " +
            "NO PLACEHOLDER CONTENT, NO BUSINESS NAMES, NO PROMOTIONAL MESSAGES, " +
            "NO READABLE SYMBOLS, NO TYPOGRAPHY, NO LOGOS, NO RESTAURANT BRANDING, " +
            "pure diagonal linear geometric pattern only, 1024x1024 resolution",
            specificBusinessContext, targetAudience, primaryColor, secondaryColor,
            contentContext.toLowerCase().contains("sale") ? "exciting dynamic" : "professional modern",
            contentContext.isEmpty() ? "business" : contentContext
        ));

        // PROMPT 3: Minimalist geometric with depth (with subtle food motif)
        prompts.add(String.format(
            "Sophisticated minimalist geometric background for %s flyer targeting %s. " +
            "Utilize a %s color palette, with %s as the dominant color and %s for accents. " +
            "Emphasize clean lines, subtle shadow play to create a sense of depth, and strategic use of negative space. " +
            "Inspired by modern architectural elements and %s design principles. " +
            foodElementPhrase +
            "CRITICAL CONSTRAINT: NO TEXT, NO WORDS, NO LETTERING, NO LOGOS, NO SYMBOLS, NO BRAND NAMES. " +
            "Pure abstract geometric forms, light, and shadow, 1024x1024 resolution",
            specificBusinessContext, targetAudience, colorScheme, primaryColor, secondaryColor,
            contentContext.isEmpty() ? "contemporary" : contentContext
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
            String[] styleAnalysis = analyzeGeneratedBackgroundForTextColors(imageBytes, request, imageNumber);
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
     * Analyze the actual generated background image for optimal text colors
     * This replaces guessing based on input colors with real image analysis
     */
    private String[] analyzeGeneratedBackgroundForTextColors(byte[] imageBytes, BackgroundGenerationRequest request, int backgroundNumber) {
        try {
            System.out.println("🔍 Analyzing actual generated background " + backgroundNumber + " for optimal text colors...");
            
            // 1. Analyze the ACTUAL generated background image
            String actualBackgroundBrightness = analyzeImageBrightness(imageBytes);
            String dominantBackgroundColor = extractDominantColor(imageBytes);
            
            System.out.println("📊 Background " + backgroundNumber + " analysis: brightness=" + actualBackgroundBrightness + 
                             ", dominant=" + dominantBackgroundColor);
            
            // 2. Choose text colors based on ACTUAL background with more flexibility
            String textColor;
            String accentColor;
            
            switch (actualBackgroundBrightness) {
                case "very-light":
                    textColor = "#1A1A1A"; // Very dark text on very light background
                    accentColor = chooseDarkAccent(dominantBackgroundColor, request);
                    System.out.println("☀️ Very light background detected → Using very dark text");
                    break;
                case "light":
                    textColor = "#2C2C2C"; // Dark text on light background
                    accentColor = chooseDarkAccent(dominantBackgroundColor, request);
                    System.out.println("💡 Light background detected → Using dark text");
                    break;
                case "medium":
                    // For medium backgrounds, choose based on dominant color
                    if (isDominantColorWarm(dominantBackgroundColor)) {
                        textColor = "#1A1A1A"; // Dark text for warm medium backgrounds
                        accentColor = chooseDarkAccent(dominantBackgroundColor, request);
                        System.out.println("🔶 Medium warm background detected → Using dark text");
                    } else {
                        textColor = "#F5F5F5"; // Light text for cool medium backgrounds
                        accentColor = chooseLightAccent(dominantBackgroundColor, request);
                        System.out.println("🔷 Medium cool background detected → Using light text");
                    }
                    break;
                case "dark":
                    textColor = "#F5F5F5"; // Light text on dark background
                    accentColor = chooseLightAccent(dominantBackgroundColor, request);
                    System.out.println("🌙 Dark background detected → Using light text");
                    break;
                case "very-dark":
                    textColor = "#FFFFFF"; // Pure white text on very dark background
                    accentColor = chooseLightAccent(dominantBackgroundColor, request);
                    System.out.println("🌚 Very dark background detected → Using white text");
                    break;
                default:
                    textColor = "#2C2C2C"; // Safe default
                    accentColor = chooseDarkAccent(dominantBackgroundColor, request);
                    System.out.println("❓ Unknown brightness → Using safe dark text");
            }
            
            // 3. Keep existing typography logic for variety
            String fontFamily = getFontFamilyForSlot(backgroundNumber);
            float fontSize = getFontSizeForSlot(backgroundNumber);
            float bodyFontSize = getBodyFontSizeForSlot(backgroundNumber);
            
            System.out.println("✅ Background " + backgroundNumber + " final colors: text=" + textColor + 
                             ", accent=" + accentColor + ", font=" + fontFamily.split(",")[0]);
            
            return new String[]{textColor, accentColor, fontFamily, String.valueOf(fontSize), String.valueOf(bodyFontSize)};
            
        } catch (Exception e) {
            System.err.println("❌ Error analyzing generated background: " + e.getMessage());
            // Fallback to safe defaults
            return new String[]{"#1A1A1A", "#2196F3", "Roboto, sans-serif", "4.0", "1.7"};
        }
    }

    /**
     * Analyze the brightness of the generated background image with more nuanced results
     */
    private String analyzeImageBrightness(byte[] imageBytes) {
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));
            
            int width = image.getWidth();
            int height = image.getHeight();
            
            // Sample pixels from different areas of the image
            long totalBrightness = 0;
            int sampleCount = 0;
            
            // Sample every 50th pixel to get a good representation without being too slow
            for (int y = 0; y < height; y += 50) {
                for (int x = 0; x < width; x += 50) {
                    int rgb = image.getRGB(x, y);
                    Color color = new Color(rgb);
                    
                    // Calculate luminance using standard formula
                    double luminance = (0.299 * color.getRed() + 0.587 * color.getGreen() + 0.114 * color.getBlue()) / 255.0;
                    totalBrightness += (luminance * 100); // Convert to 0-100 scale
                    sampleCount++;
                }
            }
            
            double averageBrightness = (double) totalBrightness / sampleCount;
            
            System.out.println("🔍 Image brightness analysis: " + String.format("%.1f", averageBrightness) + "% brightness");
            
            // More nuanced brightness categories
            if (averageBrightness > 75.0) {
                return "very-light";
            } else if (averageBrightness > 55.0) {
                return "light";
            } else if (averageBrightness > 35.0) {
                return "medium";
            } else if (averageBrightness > 15.0) {
                return "dark";
            } else {
                return "very-dark";
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error analyzing image brightness: " + e.getMessage());
            return "light"; // Default to light (safer for dark text)
        }
    }

    /**
     * Extract the dominant color from the generated background image
     */
    private String extractDominantColor(byte[] imageBytes) {
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));
            
            // Count color frequencies (simplified approach)
            java.util.Map<Integer, Integer> colorCounts = new java.util.HashMap<>();
            
            int width = image.getWidth();
            int height = image.getHeight();
            
            // Sample every 100th pixel for performance
            for (int y = 0; y < height; y += 100) {
                for (int x = 0; x < width; x += 100) {
                    int rgb = image.getRGB(x, y);
                    
                    // Group similar colors by reducing precision
                    int groupedRgb = groupSimilarColors(rgb);
                    colorCounts.put(groupedRgb, colorCounts.getOrDefault(groupedRgb, 0) + 1);
                }
            }
            
            // Find most frequent color
            int dominantRgb = colorCounts.entrySet().stream()
                .max(java.util.Map.Entry.comparingByValue())
                .map(java.util.Map.Entry::getKey)
                .orElse(0xFFFFFF); // Default to white
            
            Color dominantColor = new Color(dominantRgb);
            String hexColor = String.format("#%02X%02X%02X", 
                dominantColor.getRed(), dominantColor.getGreen(), dominantColor.getBlue());
            
            System.out.println("🎨 Dominant color extracted: " + hexColor);
            return hexColor;
            
        } catch (Exception e) {
            System.err.println("❌ Error extracting dominant color: " + e.getMessage());
            return "#CCCCCC"; // Default to neutral gray
        }
    }

    /**
     * Group similar colors together by reducing color precision
     */
    private int groupSimilarColors(int rgb) {
        Color color = new Color(rgb);
        
        // Reduce precision by grouping into 32-step increments (256/8 = 32)
        int r = (color.getRed() / 32) * 32;
        int g = (color.getGreen() / 32) * 32;
        int b = (color.getBlue() / 32) * 32;
        
        return new Color(r, g, b).getRGB();
    }

    /**
     * Determine if a dominant color is warm (reds, oranges, yellows) or cool (blues, greens, purples)
     */
    private boolean isDominantColorWarm(String hexColor) {
        try {
            // Remove # if present
            String cleanHex = hexColor.replace("#", "");
            
            // Parse RGB values
            int r = Integer.parseInt(cleanHex.substring(0, 2), 16);
            int g = Integer.parseInt(cleanHex.substring(2, 4), 16);
            int b = Integer.parseInt(cleanHex.substring(4, 6), 16);
            
            // Warm colors have higher red values and lower blue values
            // Also consider orange (high red + medium green) and yellow (high red + high green)
            boolean isWarm = (r > b + 30) || (r > 120 && g > 100 && b < 80);
            
            System.out.println("🎨 Color warmth analysis: " + hexColor + " → " + (isWarm ? "warm" : "cool"));
            return isWarm;
            
        } catch (Exception e) {
            System.err.println("❌ Error analyzing color warmth: " + e.getMessage());
            return false; // Default to cool (safer)
        }
    }

    /**
     * Choose a dark accent color that works well with light backgrounds
     */
    private String chooseDarkAccent(String dominantColor, BackgroundGenerationRequest request) {
        // Try to use business context for accent color
        String businessType = request.getBusinessType();
        
        if (businessType != null) {
            String business = businessType.toLowerCase();
            if (business.contains("food") || business.contains("restaurant") || business.contains("burger") || business.contains("pizza")) {
                return "#B8860B"; // Dark golden rod for food
            } else if (business.contains("tech") || business.contains("software")) {
                return "#1565C0"; // Dark blue for tech
            } else if (business.contains("health") || business.contains("medical")) {
                return "#2E7D32"; // Dark green for health
            } else if (business.contains("finance") || business.contains("bank")) {
                return "#1B5E20"; // Dark forest green for finance
            }
        }
        
        // Choose accent that contrasts with dominant color
        if (isDominantColorWarm(dominantColor)) {
            return "#1565C0"; // Cool blue for warm backgrounds
        } else {
            return "#D84315"; // Warm orange-red for cool backgrounds
        }
    }

    /**
     * Choose a light accent color that works well with dark backgrounds
     */
    private String chooseLightAccent(String dominantColor, BackgroundGenerationRequest request) {
        // Try to use business context for accent color
        String businessType = request.getBusinessType();
        
        if (businessType != null) {
            String business = businessType.toLowerCase();
            if (business.contains("food") || business.contains("restaurant") || business.contains("burger") || business.contains("pizza")) {
                return "#FFD54F"; // Light golden yellow for food
            } else if (business.contains("tech") || business.contains("software")) {
                return "#81C784"; // Light green for tech
            } else if (business.contains("health") || business.contains("medical")) {
                return "#81C784"; // Light green for health
            } else if (business.contains("finance") || business.contains("bank")) {
                return "#A5D6A7"; // Light mint green for finance
            }
        }
        
        // Choose light accent that contrasts with dominant color
        if (isDominantColorWarm(dominantColor)) {
            return "#81C784"; // Cool light green for warm backgrounds
        } else {
            return "#FFB74D"; // Warm light orange for cool backgrounds
        }
    }

    /**
     * Get font family for predetermined style slots
     */
    private String getFontFamilyForSlot(int backgroundNumber) {
        if (backgroundNumber == 1) {
            return "Roboto, sans-serif"; // Professional Clean
        } else if (backgroundNumber == 2) {
            return "Georgia, serif"; // Elegant Sophisticated
        } else {
            return "Montserrat, sans-serif"; // Bold Modern
        }
    }

    /**
     * Get font size for predetermined style slots
     */
    private float getFontSizeForSlot(int backgroundNumber) {
        if (backgroundNumber == 1) {
            return 4.0f; // Professional Clean
        } else if (backgroundNumber == 2) {
            return 3.8f; // Elegant Sophisticated
        } else {
            return 4.5f; // Bold Modern
        }
    }

    /**
     * Get body font size for predetermined style slots
     */
    private float getBodyFontSizeForSlot(int backgroundNumber) {
        if (backgroundNumber == 1) {
            return 1.7f; // Professional Clean
        } else if (backgroundNumber == 2) {
            return 1.6f; // Elegant Sophisticated
        } else {
            return 1.9f; // Bold Modern
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