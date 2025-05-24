package com.shtilmanilan.ai_promote_backend.controller;

import com.shtilmanilan.ai_promote_backend.model.BackgroundGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.BackgroundOption;
import com.shtilmanilan.ai_promote_backend.service.BackgroundGenerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;import java.util.List;import java.util.Map;import java.util.HashMap;

@RestController
@RequestMapping("/api/backgrounds")
@CrossOrigin(origins = "http://localhost:3000")
public class BackgroundController {

    @Autowired
    private BackgroundGenerationService backgroundGenerationService;

    /**
     * Generate 3 AI-powered background options
     */
    @PostMapping("/generate")
    public ResponseEntity<List<BackgroundOption>> generateBackgrounds(
            @RequestBody BackgroundGenerationRequest request) {
        
        try {
            System.out.println("🎨 Background Controller: Received generation request for " + 
                             request.getBusinessType() + " targeting " + request.getTargetAudience());
            
            List<BackgroundOption> backgrounds = backgroundGenerationService.generateBackgrounds(request);
            
            System.out.println("✅ Generated " + backgrounds.size() + " background options");
            return ResponseEntity.ok(backgrounds);
            
        } catch (Exception e) {
            System.err.println("❌ Background generation failed: " + e.getMessage());
            e.printStackTrace();
            
            // Return fallback backgrounds instead of error
            List<BackgroundOption> fallbackBackgrounds = backgroundGenerationService.generateFallbackBackgrounds(request);
            return ResponseEntity.ok(fallbackBackgrounds);
        }
    }

    /**
     * Test endpoint for development
     */
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Background generation service is running! 🎨");
    }

    /**
     * Get cost estimation for background generation
     */
    @GetMapping("/cost")
    public ResponseEntity<Object> getCostEstimation(@RequestParam(defaultValue = "gemini-pro") String provider) {
        try {
            double costPer3Options = backgroundGenerationService.estimateCost(provider);
            
                        Map<String, Object> costResponse = new HashMap<>();            costResponse.put("provider", provider);            costResponse.put("costFor3Options", costPer3Options);            costResponse.put("currency", "USD");            costResponse.put("description", "Cost for generating 3 background options");                        return ResponseEntity.ok(costResponse);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error calculating cost: " + e.getMessage());
        }
    }
} 