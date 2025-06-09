package com.shtilmanilan.ai_promote_backend.controller.ai;

import com.shtilmanilan.ai_promote_backend.model.ai.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.ai.TextGenerationResponse;
import com.shtilmanilan.ai_promote_backend.service.groq.GroqService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.shtilmanilan.ai_promote_backend.service.RateLimiter;


@RestController
@RequestMapping("/api/v1/groq")
@CrossOrigin(origins = "http://localhost:3000")
public class GroqController {

    private static final Logger logger = LoggerFactory.getLogger(GroqController.class);
    private final GroqService groqService;
    private final RateLimiter rateLimiter = new RateLimiter();

    @Autowired
    public GroqController(GroqService groqService) {
        this.groqService = groqService;
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        logger.info("Test endpoint called");
        return ResponseEntity.ok("API is working!");
    }

    @PostMapping(value = "/generate", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TextGenerationResponse> generateText(
        @RequestBody TextGenerationRequest request,
        @RequestHeader(value = "X-Forwarded-For", required = false) String xForwardedFor,
        @RequestHeader(value = "X-Real-IP", required = false) String xRealIP
    ) {
        // Get client IP - handle proxy headers
        String userKey = xForwardedFor != null ? xForwardedFor.split(",")[0].trim() : 
                        xRealIP != null ? xRealIP : "unknown";

    if (!rateLimiter.isAllowed(userKey)) {
        TextGenerationResponse response = new TextGenerationResponse();
        response.setError("Please wait 2 minutes before trying again.");
        return ResponseEntity.status(429).body(response);
    }
        try {
            logger.info("Received request: {}", request);
            TextGenerationResponse response = groqService.generateText(request);
            logger.info("Generated response: {}", response.getGeneratedText());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error in generateText endpoint: {}", e.getMessage(), e);
            throw e;
        }
    }
} 