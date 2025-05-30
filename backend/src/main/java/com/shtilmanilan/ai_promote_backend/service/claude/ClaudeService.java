package com.shtilmanilan.ai_promote_backend.service.claude;

import com.shtilmanilan.ai_promote_backend.model.ai.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.ai.TextGenerationResponse;

public interface ClaudeService {
    TextGenerationResponse generateText(TextGenerationRequest request);
} 