package com.shtilmanilan.ai_promote_backend.controller;

import com.shtilmanilan.ai_promote_backend.model.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationResponse;
import com.shtilmanilan.ai_promote_backend.service.OpenAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1/openai")
@CrossOrigin(origins = "http://localhost:3000")
public class OpenAIController {

    private static final Logger logger = LoggerFactory.getLogger(OpenAIController.class);
    private final OpenAIService openAIService;

    @Autowired
    public OpenAIController(OpenAIService openAIService) {
        this.openAIService = openAIService;
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
            TextGenerationResponse response = openAIService.generateText(request);
            logger.info("Generated response: {}", response.getGeneratedText());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error in generateText endpoint: {}", e.getMessage(), e);
            throw e;
        }
    }
} 