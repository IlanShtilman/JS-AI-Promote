package com.shtilmanilan.ai_promote_backend.controller.azure;

import com.shtilmanilan.ai_promote_backend.model.azure.AzureVisionResponse;
import com.shtilmanilan.ai_promote_backend.service.azure.AzureVisionService;
import com.shtilmanilan.ai_promote_backend.service.TokenBucketRateLimiter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vision")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class AzureVisionController {

    private static final Logger logger = LoggerFactory.getLogger(AzureVisionController.class);
    private final AzureVisionService azureVisionService;
    
    // Allow 5 requests initially, then 1 request every 10 seconds (6 per minute max)
    private final TokenBucketRateLimiter rateLimiter = new TokenBucketRateLimiter(5, 10000);

    public AzureVisionController(AzureVisionService azureVisionService) {
        this.azureVisionService = azureVisionService;
    }

    @PostMapping(value = "/analyze", consumes = {MediaType.TEXT_PLAIN_VALUE, MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<AzureVisionResponse> analyzeImage(
            @RequestBody String base64Image,
            @RequestHeader(value = "X-Forwarded-For", required = false) String xForwardedFor,
            @RequestHeader(value = "X-Real-IP", required = false) String xRealIP) {
        
        logger.info("Received image analysis request");
        
        // Get client IP for rate limiting
        String userKey = xForwardedFor != null ? xForwardedFor.split(",")[0].trim() : 
                        xRealIP != null ? xRealIP : "unknown";
        
        if (!rateLimiter.isAllowed(userKey)) {
            logger.warn("Rate limit exceeded for user: {}", userKey);
            AzureVisionResponse errorResponse = new AzureVisionResponse();
            errorResponse.setError("Too many requests. Please wait a moment before trying again.");
            return ResponseEntity.status(429).body(errorResponse);
        }
        
        try {
            // Log the first 100 characters of the base64 image to verify it's being received correctly
            logger.info("Received base64 image (first 100 chars): {}", 
                base64Image.length() > 100 ? base64Image.substring(0, 100) + "..." : base64Image);
            
            AzureVisionResponse response = azureVisionService.analyzeImage(base64Image);
            logger.info("Successfully processed image analysis");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing image analysis", e);
            throw e;
        }
    }

    @GetMapping("/test")
    public String testEndpoint() {
        logger.info("Test endpoint called");
        return "Azure Vision API is working!";
    }

    @GetMapping("/test-colors")
    public String testColorMappings() {
        logger.info("Testing color mappings...");
        azureVisionService.testColorMappings();
        return "Color mapping test completed - check logs!";
    }
}