package com.shtilmanilan.ai_promote_backend.controller.ai;

import com.shtilmanilan.ai_promote_backend.model.ai.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.ai.TextGenerationResponse;
import com.shtilmanilan.ai_promote_backend.service.claude.ClaudeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1/claude")
@CrossOrigin(origins = "http://localhost:3000")
public class ClaudeController {

    private static final Logger logger = LoggerFactory.getLogger(ClaudeController.class);
    private final ClaudeService claudeService;

    @Autowired
    public ClaudeController(ClaudeService claudeService) {
        this.claudeService = claudeService;
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        logger.info("Test endpoint called");
        return ResponseEntity.ok("API is working!");
    }

    @PostMapping(value = "/generate", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TextGenerationResponse> generateText(@RequestBody TextGenerationRequest request) {
        try {
            logger.info("Received request: {}", request);
            TextGenerationResponse response = claudeService.generateText(request);
            logger.info("Generated response: {}", response.getGeneratedText());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error in generateText endpoint: {}", e.getMessage(), e);
            throw e;
        }
    }
} 