package com.shtilmanilan.ai_promote_backend.service.gemini;

import com.shtilmanilan.ai_promote_backend.model.ai.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.ai.TextGenerationResponse;

public interface GeminiService {
    TextGenerationResponse generateText(TextGenerationRequest request);
} 