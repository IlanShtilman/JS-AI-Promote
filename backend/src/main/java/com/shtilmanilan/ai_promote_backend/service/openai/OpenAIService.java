package com.shtilmanilan.ai_promote_backend.service.openai;

import com.shtilmanilan.ai_promote_backend.model.ai.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.ai.TextGenerationResponse;

public interface OpenAIService {
    TextGenerationResponse generateText(TextGenerationRequest request);
} 