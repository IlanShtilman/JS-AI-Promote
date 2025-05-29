package com.shtilmanilan.ai_promote_backend.service.groq;

import com.shtilmanilan.ai_promote_backend.model.ai.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.ai.TextGenerationResponse;

public interface GroqService {
    TextGenerationResponse generateText(TextGenerationRequest request);
} 