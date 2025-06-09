package com.shtilmanilan.ai_promote_backend.controller.azure;

import com.shtilmanilan.ai_promote_backend.model.azure.AzureVisionResponse;
import com.shtilmanilan.ai_promote_backend.service.azure.AzureVisionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import com.shtilmanilan.ai_promote_backend.service.RateLimiter;
import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/vision")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class AzureVisionController {

    private static final Logger logger = LoggerFactory.getLogger(AzureVisionController.class);
    private final AzureVisionService azureVisionService;
    private final RateLimiter rateLimiter = new RateLimiter();

    public AzureVisionController(AzureVisionService azureVisionService) {
        this.azureVisionService = azureVisionService;
    }

    @PostMapping(value = "/analyze", consumes = {MediaType.TEXT_PLAIN_VALUE, MediaType.APPLICATION_JSON_VALUE})
    public AzureVisionResponse analyzeImage(@RequestBody String base64Image, HttpServletRequest httpRequest) {
        String userKey = httpRequest.getRemoteAddr();
        if (!rateLimiter.isAllowed(userKey)) {
            AzureVisionResponse errorResponse = new AzureVisionResponse();
            errorResponse.setError("Please wait 2 minutes before trying again.");
            return errorResponse;
        }
        logger.info("Received image analysis request");
        try {
            // Log the first 100 characters of the base64 image to verify it's being received correctly
            logger.info("Received base64 image (first 100 chars): {}", 
                base64Image.length() > 100 ? base64Image.substring(0, 100) + "..." : base64Image);
            
            AzureVisionResponse response = azureVisionService.analyzeImage(base64Image);
            logger.info("Successfully processed image analysis");
            return response;
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