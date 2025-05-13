package com.shtilmanilan.ai_promote_backend.controller;

import com.shtilmanilan.ai_promote_backend.model.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationResponse;
import com.shtilmanilan.ai_promote_backend.service.LlamaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1/llama")
@CrossOrigin(origins = "http://localhost:3000")
public class LlamaController {

    private static final Logger logger = LoggerFactory.getLogger(LlamaController.class);
    private final LlamaService llamaService;

    @Autowired
    public LlamaController(LlamaService llamaService) {
        this.llamaService = llamaService;
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        logger.info("Llama test endpoint called");
        return ResponseEntity.ok("Llama API is working!");
    }

    @PostMapping(value = "/generate", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TextGenerationResponse> generateText(@RequestBody TextGenerationRequest request) {
        try {
            logger.info("Received request for Llama: {}", request);
            TextGenerationResponse response = llamaService.generateText(request);
            logger.info("Generated response from Llama");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error in Llama generateText endpoint: {}", e.getMessage());
            throw e;
        }
    }
} 