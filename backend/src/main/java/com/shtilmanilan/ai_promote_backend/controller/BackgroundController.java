package com.shtilmanilan.ai_promote_backend.controller;

import com.shtilmanilan.ai_promote_backend.model.BackgroundGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.BackgroundOption;
import com.shtilmanilan.ai_promote_backend.service.BackgroundGenerationService;
import com.shtilmanilan.ai_promote_backend.service.ImagenBackgroundService;
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
     * Generate 3 CSS-based background options (Original AI method)
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
     * Generate 3 actual background images using Google Imagen 3.0
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
        costs.put("css_generation", "$0.002 for 3 backgrounds");
        costs.put("imagen_generation", "$" + imagenBackgroundService.estimateCost() + " for 3 images");
        testResponse.put("estimated_costs", costs);
        
        return ResponseEntity.ok(testResponse);
    }

    /**
     * Get generation statistics and costs
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getGenerationStats() {
        
        Map<String, Object> stats = new HashMap<>();
        
        // CSS Generation stats
        Map<String, Object> cssStats = new HashMap<>();
        cssStats.put("cost_per_generation", backgroundGenerationService.estimateCost("gemini-1.5-flash"));
        cssStats.put("speed", "Fast (~2-5 seconds)");
        cssStats.put("quality", "Good for simple backgrounds");
        cssStats.put("type", "CSS gradients and patterns");
        
        // Imagen Generation stats  
        Map<String, Object> imagenStats = new HashMap<>();
        imagenStats.put("cost_per_generation", imagenBackgroundService.estimateCost());
        imagenStats.put("speed", "Medium (~15-30 seconds)");
        imagenStats.put("quality", "Professional image backgrounds");
        imagenStats.put("type", "AI-generated images (PNG)");
        
        stats.put("css_generation", cssStats);
        stats.put("imagen_generation", imagenStats);
        stats.put("recommendation", "Use Imagen for high-quality flyers, CSS for quick prototypes");
        
        return ResponseEntity.ok(stats);
    }

    /**
     * Serve generated background images
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