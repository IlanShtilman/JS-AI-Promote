package com.shtilmanilan.ai_promote_backend.service.gemini;

import com.shtilmanilan.ai_promote_backend.model.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationResponse;

public interface GeminiService {
    TextGenerationResponse generateText(TextGenerationRequest request);
} 