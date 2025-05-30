package com.shtilmanilan.ai_promote_backend.model.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TextGenerationRequest {
    @JsonProperty("prompt")
    private String prompt;
    
    @JsonProperty("temperature")
    private Double temperature;
    
    // Getters and setters
    public String getPrompt() {
        return prompt;
    }
    
    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }
    
    public Double getTemperature() {
        return temperature;
    }
    
    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }
    
    @Override
    public String toString() {
        return "TextGenerationRequest{" +
                "prompt='" + prompt + '\'' +
                ", temperature=" + temperature +
                '}';
    }
} 