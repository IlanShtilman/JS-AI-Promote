package com.shtilmanilan.ai_promote_backend.model.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TextGenerationResponse {
    @JsonProperty("generatedText")
    private String generatedText;
    
    @JsonProperty("error")
    private String error;
    
    // Getters and setters
    public String getGeneratedText() {
        return generatedText;
    }
    
    public void setGeneratedText(String generatedText) {
        this.generatedText = generatedText;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
} 