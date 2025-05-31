package com.shtilmanilan.ai_promote_backend.model.azure;

/**
 * Azure-specific flier information model
 * Contains data needed for generating flier configurations based on Azure Vision analysis
 */
public class AzureFlierInfo {
    
    public String title;
    public String promotionalText;
    public String orientation;
    public AzureVisionResponse azureVision;

    // Default constructor
    public AzureFlierInfo() {}

    // Constructor with parameters
    public AzureFlierInfo(String title, String promotionalText, String orientation, AzureVisionResponse azureVision) {
        this.title = title;
        this.promotionalText = promotionalText;
        this.orientation = orientation;
        this.azureVision = azureVision;
    }

    // Getters and setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPromotionalText() { return promotionalText; }
    public void setPromotionalText(String promotionalText) { this.promotionalText = promotionalText; }

    public String getOrientation() { return orientation; }
    public void setOrientation(String orientation) { this.orientation = orientation; }

    public AzureVisionResponse getAzureVision() { return azureVision; }
    public void setAzureVision(AzureVisionResponse azureVision) { this.azureVision = azureVision; }

    @Override
    public String toString() {
        return "AzureFlierInfo{" +
                "title='" + title + '\'' +
                ", promotionalText='" + promotionalText + '\'' +
                ", orientation='" + orientation + '\'' +
                ", azureVision=" + azureVision +
                '}';
    }
} 