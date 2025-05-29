package com.shtilmanilan.ai_promote_backend.service.claude;

import com.shtilmanilan.ai_promote_backend.model.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationResponse;

public interface ClaudeService {
    TextGenerationResponse generateText(TextGenerationRequest request);
} 