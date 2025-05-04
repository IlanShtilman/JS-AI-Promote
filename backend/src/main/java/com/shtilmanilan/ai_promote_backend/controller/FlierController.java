package com.shtilmanilan.ai_promote_backend.controller;

import com.shtilmanilan.ai_promote_backend.model.FlierInfo;
import com.shtilmanilan.ai_promote_backend.service.FlierGeminiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@RestController
@RequestMapping("/api/flier")
@CrossOrigin(origins = "*")
public class FlierController {

    private static final Logger logger = LoggerFactory.getLogger(FlierController.class);
    private final FlierGeminiService flierGeminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public FlierController(FlierGeminiService flierGeminiService) {
        this.flierGeminiService = flierGeminiService;
    }

    @PostMapping("/generate")
    public ResponseEntity<JsonNode> generateFlier(@RequestBody FlierInfo flierInfo) {
        logger.info("Received request to generate flier for: {}", flierInfo.title);
        logger.debug("Full flier request data: {}", flierInfo);
        
        try {
            String configuration;
            try {
                // Try Gemini first
                configuration = flierGeminiService.generateFlierConfig(flierInfo);
                logger.info("Successfully generated AI flier configuration");
            } catch (Exception e) {
                // Fall back to basic config if Gemini fails
                logger.warn("Gemini API failed, using fallback: {}", e.getMessage());
                configuration = flierGeminiService.generateBasicFlierConfig(flierInfo);
                logger.info("Used fallback configuration generator");
            }
            
            try {
                // Verify JSON is valid before returning
                JsonNode json = objectMapper.readTree(configuration);
                return ResponseEntity.ok(json);
            } catch (Exception e) {
                logger.error("Invalid JSON generated: {}", configuration);
                
                // If we can't parse the JSON, create a simple valid response
                ObjectNode errorNode = objectMapper.createObjectNode();
                errorNode.put("error", "Invalid JSON generated");
                errorNode.put("layout", "standard");
                return ResponseEntity.status(500).body(errorNode);
            }
        } catch (Exception e) {
            logger.error("Error generating flier: {}", e.getMessage(), e);
            
            // Create a simple error response
            ObjectNode errorNode = objectMapper.createObjectNode();
            errorNode.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorNode);
        }
    }
} 