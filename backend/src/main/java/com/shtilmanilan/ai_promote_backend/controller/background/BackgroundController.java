package com.shtilmanilan.ai_promote_backend.controller.background;

import com.shtilmanilan.ai_promote_backend.model.background.BackgroundGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.background.BackgroundOption;
import com.shtilmanilan.ai_promote_backend.service.background.BackgroundGenerationService;
import com.shtilmanilan.ai_promote_backend.service.background.ImagenBackgroundService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * Background Generation Controller
 * 
 * Handles both CSS-based and AI image-based background generation for flyers.
 * Provides endpoints for generating backgrounds using different AI services.
 * 
 * Services Available:
 * - CSS Generation: Fast, cheap gradients via Gemini/OpenAI ($0.002)
 * - Image Generation: Professional images via Imagen 3.0 ($0.12)
 * 
 * @author AI-Promote Team
 */
@RestController
@RequestMapping("/api/backgrounds")
@CrossOrigin(origins = "http://localhost:3000")
public class BackgroundController {

    @Autowired
    private BackgroundGenerationService backgroundGenerationService;

    @Autowired
    private ImagenBackgroundService imagenBackgroundService;

    @Value("${background.images.path:C:/Users/ishti/JS-AI-PROMOTE/generated-backgrounds}")
    private String backgroundImagesPath;

    /**
     * Generate 3 CSS-based background options (Fast & Cheap)
     * Uses Gemini/OpenAI to create CSS gradients and patterns
     * That used when Imagen is failed!
     */
    @PostMapping("/generate")
    public ResponseEntity<List<BackgroundOption>> generateBackgrounds(
            @RequestBody BackgroundGenerationRequest request) {
        
        try {
            System.out.println("🎨 Background Controller: Received CSS generation request for " + 
                             request.getBusinessType() + " targeting " + request.getTargetAudience());
            
            List<BackgroundOption> backgrounds = backgroundGenerationService.generateBackgrounds(request);
            
            System.out.println("✅ Generated " + backgrounds.size() + " CSS background options");
            return ResponseEntity.ok(backgrounds);
            
        } catch (Exception e) {
            System.err.println("❌ CSS background generation failed: " + e.getMessage());
            e.printStackTrace();
            
            // Return fallback backgrounds instead of error
            List<BackgroundOption> fallbackBackgrounds = backgroundGenerationService.generateFallbackBackgrounds(request);
            return ResponseEntity.ok(fallbackBackgrounds);
        }
    }

    /**
     * Generate 3 actual background images using Google Imagen 3.0 (Premium Quality)
     * Creates real PNG images with advanced AI analysis
     */
    @PostMapping("/generate-images")
    public ResponseEntity<List<BackgroundOption>> generateBackgroundImages(
            @RequestBody BackgroundGenerationRequest request) {
        
        try {
            System.out.println("🖼️ Background Controller: Received IMAGE generation request for " + 
                             request.getBusinessType() + " targeting " + request.getTargetAudience());
            
            List<BackgroundOption> backgrounds = imagenBackgroundService.generateBackgroundImages(request);
            
            System.out.println("✅ Generated " + backgrounds.size() + " background images");
            return ResponseEntity.ok(backgrounds);
            
        } catch (Exception e) {
            System.err.println("❌ Image background generation failed: " + e.getMessage());
            e.printStackTrace();
            
            // Return CSS fallback backgrounds when image generation fails
            List<BackgroundOption> fallbackBackgrounds = backgroundGenerationService.generateFallbackBackgrounds(request);
            return ResponseEntity.ok(fallbackBackgrounds);
        }
    }

    /**
     * Test endpoint for development
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testBackgroundGeneration() {
        
        Map<String, Object> testResponse = new HashMap<>();
        testResponse.put("message", "Background generation service is running");
        testResponse.put("endpoints", new String[]{
            "/api/backgrounds/generate - CSS-based backgrounds",
            "/api/backgrounds/generate-images - Imagen-based image backgrounds"
        });
        testResponse.put("timestamp", java.time.LocalDateTime.now().toString());
        
        // Cost estimates
        Map<String, String> costs = new HashMap<>();
        testResponse.put("estimated_costs", costs);
        
        return ResponseEntity.ok(testResponse);
    }

    /**
     * Serve generated background images as HTTP resources
     */
    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> getBackgroundImage(@PathVariable String filename) {
        try {
            Path imagePath = Paths.get(backgroundImagesPath).resolve(filename);
            Resource resource = new UrlResource(imagePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("❌ Error serving background image: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
} 