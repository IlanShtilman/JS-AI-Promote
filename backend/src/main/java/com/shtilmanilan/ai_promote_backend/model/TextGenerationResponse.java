package com.shtilmanilan.ai_promote_backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TextGenerationResponse {
    @JsonProperty("generatedText")
    private String generatedText;
    
    // Getters and setters
    public String getGeneratedText() {
        return generatedText;
    }
    
    public void setGeneratedText(String generatedText) {
        this.generatedText = generatedText;
    }
} 