package com.shtilmanilan.ai_promote_backend.data_Transfer_Object;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EnhanceResponse {
    private String status;
    private String message;
    private Map<String, Object> output;
    private String id;
    
    @JsonProperty("tmp_url")
    private String tmpUrl;
    
    public EnhanceResponse(String status, String message) {
        this.status = status;
        this.message = message;
    }
    
    // Helper method to get the enhanced image URL in different formats
    public String getEnhancedImageUrl() {
        if (tmpUrl != null) {
            return tmpUrl;
        }
        
        if (output != null) {
            if (output.containsKey("tmp_url")) {
                return (String) output.get("tmp_url");
            }
            
            // Try to navigate nested maps
            if (output.containsKey("data") && output.get("data") instanceof Map) {
                Map<String, Object> data = (Map<String, Object>) output.get("data");
                if (data.containsKey("output") && data.get("output") instanceof Map) {
                    Map<String, Object> outputData = (Map<String, Object>) data.get("output");
                    if (outputData.containsKey("tmp_url")) {
                        return (String) outputData.get("tmp_url");
                    }
                }
            }
        }
        
        return null;
    }
} 