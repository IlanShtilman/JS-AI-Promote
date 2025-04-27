package com.shtilmanilan.ai_promote_backend.model;

public class FlierInfo {
    public String logo;
    public String title;
    public String promotionalText;
    public String targetAudience;
    public String businessType;
    public String stylePreference;
    public String colorScheme;
    public int moodLevel;
    public String imagePreference;
    public String uploadedImage;
    public String uploadType;
    public String flierSize;
    public String orientation;
    public AzureVision azureVision;

    public static class AzureVision {
        public String sceneType;
        public String description;
        public String[] objects;
        public Colors colors;
    }
    public static class Colors {
        public String primary;
        public String secondary;
        public String accent;
        public String background;
    }
} 