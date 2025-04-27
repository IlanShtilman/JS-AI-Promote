package com.shtilmanilan.ai_promote_backend.controller;

import com.shtilmanilan.ai_promote_backend.model.FlierInfo;
import com.shtilmanilan.ai_promote_backend.service.FlierOpenAIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/flier")
@CrossOrigin(origins = "*")
public class FlierController {

    private static final Logger logger = LoggerFactory.getLogger(FlierController.class);
    private final FlierOpenAIService flierOpenAIService;

    @Autowired
    public FlierController(FlierOpenAIService flierOpenAIService) {
        this.flierOpenAIService = flierOpenAIService;
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generateFlier(@RequestBody FlierInfo flierInfo) {
        logger.info("Received request to generate flier for: {}", flierInfo.title);
        
        try {
            String configuration = flierOpenAIService.generateFlierConfiguration(flierInfo);
            return ResponseEntity.ok(configuration);
        } catch (Exception e) {
            logger.error("Error generating flier: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error generating flier: " + e.getMessage());
        }
    }
} 