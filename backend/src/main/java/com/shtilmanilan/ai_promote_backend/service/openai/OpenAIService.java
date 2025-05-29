package com.shtilmanilan.ai_promote_backend.service.openai;

import com.shtilmanilan.ai_promote_backend.model.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationResponse;

public interface OpenAIService {
    TextGenerationResponse generateText(TextGenerationRequest request);
} 