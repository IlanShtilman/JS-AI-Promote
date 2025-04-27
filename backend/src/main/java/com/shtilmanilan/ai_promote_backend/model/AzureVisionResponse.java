package com.shtilmanilan.ai_promote_backend.model;

import lombok.Data;

@Data
public class AzureVisionResponse {
    private String sceneType;
    private String[] objects;
    private Colors colors;
    private String atmosphere;
    private String lighting;
    private String description;
    private String businessType;

    @Data
    public static class Colors {
        private String primary;
        private String secondary;
        private String accent;
        private String background;
        private Object semanticColors;
    }
} 