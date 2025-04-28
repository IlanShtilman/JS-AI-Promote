package com.shtilmanilan.ai_promote_backend.controller;

import com.shtilmanilan.ai_promote_backend.data_Transfer_Object.EnhanceRequest;
import com.shtilmanilan.ai_promote_backend.data_Transfer_Object.EnhanceResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ImageController {
    private static final Logger logger = LoggerFactory.getLogger(ImageController.class);

    @Value("${claid.api.key}")
    private String claidApiKey;

    private final RestTemplate restTemplate;
    
    @Autowired
    public ImageController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostMapping("/enhance")
    public ResponseEntity<?> enhanceImage(@RequestBody EnhanceRequest request) {
        try {
            if (request.getInput() == null || request.getInput().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new EnhanceResponse("error", "Missing input URL"));
            }

            logger.info("Processing enhancement request for input URL: {}", request.getInput());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(claidApiKey);

            HttpEntity<EnhanceRequest> entity = new HttpEntity<>(request, headers);
            
            // First, make the request and get the raw response as a Map
            ResponseEntity<Map> rawResponse = restTemplate.exchange(
                "https://api.claid.ai/v1-beta1/image/edit",
                HttpMethod.POST,
                entity,
                Map.class
            );
            
            logger.info("Received response from Claid API: {}", rawResponse.getBody());
            
            // Extract the important data from the raw response
            Map<String, Object> responseBody = rawResponse.getBody();
            
            // Create a frontend-friendly response
            Map<String, Object> frontendResponse = new HashMap<>();
            frontendResponse.put("success", true);
            
            // Extract the enhanced image URL
            String enhancedImageUrl = null;
            
            if (responseBody != null) {
                if (responseBody.containsKey("output") && responseBody.get("output") instanceof Map) {
                    Map<String, Object> output = (Map<String, Object>) responseBody.get("output");
                    if (output.containsKey("tmp_url")) {
                        enhancedImageUrl = (String) output.get("tmp_url");
                    }
                }
                
                // Try different path patterns based on API response structure
                if (enhancedImageUrl == null && responseBody.containsKey("data")) {
                    Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
                    if (data.containsKey("output") && data.get("output") instanceof Map) {
                        Map<String, Object> output = (Map<String, Object>) data.get("output");
                        if (output.containsKey("tmp_url")) {
                            enhancedImageUrl = (String) output.get("tmp_url");
                        }
                    }
                }
            }
            
            if (enhancedImageUrl != null) {
                frontendResponse.put("enhancedImageUrl", enhancedImageUrl);
                frontendResponse.put("rawResponse", responseBody);
                logger.info("Successfully extracted enhanced image URL: {}", enhancedImageUrl);
                return ResponseEntity.ok(frontendResponse);
            } else {
                logger.error("Failed to extract enhanced image URL from response");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "success", false,
                        "error", "Failed to extract enhanced image URL",
                        "rawResponse", responseBody
                    ));
            }
        } catch (Exception e) {
            logger.error("Error during image enhancement", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "error", "Failed to enhance the image: " + e.getMessage()
                ));
        }
    }
    
    /**
     * Test endpoint to verify that the API is working
     */
    @PostMapping("/test")
    public ResponseEntity<?> testApi() {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Backend API is working"
        ));
    }
} 