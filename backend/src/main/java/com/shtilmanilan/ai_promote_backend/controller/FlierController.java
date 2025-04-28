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
        
        try {
            String configuration = flierGeminiService.generateFlierConfig(flierInfo);
            JsonNode json = objectMapper.readTree(configuration);
            return ResponseEntity.ok(json);
        } catch (Exception e) {
            logger.error("Error generating flier: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }
} 