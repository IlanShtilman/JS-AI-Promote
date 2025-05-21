package com.shtilmanilan.ai_promote_backend.service;

import com.shtilmanilan.ai_promote_backend.model.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationResponse;

public interface GPT4Service {
    TextGenerationResponse generateText(TextGenerationRequest request);
} 