package com.shtilmanilan.ai_promote_backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.shtilmanilan.ai_promote_backend.service.ImageEnhancementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/image")
@CrossOrigin(origins = "*")
public class ImageEnhancementController {
    private static final Logger logger = LoggerFactory.getLogger(ImageEnhancementController.class);
    private final ImageEnhancementService imageEnhancementService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public ImageEnhancementController(ImageEnhancementService imageEnhancementService) {
        this.imageEnhancementService = imageEnhancementService;
    }

    @PostMapping("/enhance")
    public ResponseEntity<JsonNode> enhanceImage(@RequestBody JsonNode request) {
        try {
            if (!request.has("imageUrl")) {
                throw new IllegalArgumentException("imageUrl is required");
            }

            String imageUrl = request.get("imageUrl").asText();
            String enhancedImageUrl = imageEnhancementService.enhanceImage(imageUrl); // Call the service method that handles prompt internally

            ObjectNode response = objectMapper.createObjectNode();
            response.put("enhancedImageUrl", enhancedImageUrl);
            response.put("status", "success");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request: {}", e.getMessage());
            ObjectNode errorResponse = objectMapper.createObjectNode();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.status(400).body(errorResponse); // Return 400 for bad request
        } catch (Exception e) {
            logger.error("Error processing image enhancement request: {}", e.getMessage(), e);
            ObjectNode errorResponse = objectMapper.createObjectNode();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}