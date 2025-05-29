package com.shtilmanilan.ai_promote_backend.service.groq;

import com.shtilmanilan.ai_promote_backend.model.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationResponse;

public interface GroqService {
    TextGenerationResponse generateText(TextGenerationRequest request);
} 