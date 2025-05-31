package com.shtilmanilan.ai_promote_backend.model.background;

import java.util.List;
import java.util.Map;

/**
 * Background Generation Request Model
 * 
 * Encapsulates all the information needed to generate appropriate backgrounds
 * for a business flyer. Used by both CSS and image generation services.
 * 
 * Features:
 * - Business context fields
 * - User's actual flyer content
 * - Azure Vision color analysis results
 * - Style preferences and requirements
 * 
 * @author AI-Promote Team
 */
public class BackgroundGenerationRequest {
    
    private String businessType;
    private String targetAudience;
    private String colorScheme;
    private String stylePreference;
    private Map<String, Object> azureColors;
    private Map<String, String> colorPalette;
    private List<String> moodKeywords;
    private String backgroundStyle;
    private Map<String, Object> contrastRequirements;
    
    // ✅ NEW FIELDS FOR USER'S ACTUAL CONTENT
    private String title;                    // "Crazy Sale", "Grand Opening"
    private String promotionalText;          // "50% Off Everything!"
    private String businessDescription;      // User's business description

    // Default constructor
    public BackgroundGenerationRequest() {
    }

    // Constructor with main parameters
    public BackgroundGenerationRequest(String businessType, String targetAudience, 
                                     String colorScheme, String stylePreference) {
        this.businessType = businessType;
        this.targetAudience = targetAudience;
        this.colorScheme = colorScheme;
        this.stylePreference = stylePreference;
    }

    // Getters and Setters
    public String getBusinessType() {
        return businessType;
    }

    public void setBusinessType(String businessType) {
        this.businessType = businessType;
    }

    public String getTargetAudience() {
        return targetAudience;
    }

    public void setTargetAudience(String targetAudience) {
        this.targetAudience = targetAudience;
    }

    public String getColorScheme() {
        return colorScheme;
    }

    public void setColorScheme(String colorScheme) {
        this.colorScheme = colorScheme;
    }

    public String getStylePreference() {
        return stylePreference;
    }

    public void setStylePreference(String stylePreference) {
        this.stylePreference = stylePreference;
    }

    public Map<String, Object> getAzureColors() {
        return azureColors;
    }

    public void setAzureColors(Map<String, Object> azureColors) {
        this.azureColors = azureColors;
    }

    public Map<String, String> getColorPalette() {
        return colorPalette;
    }

    public void setColorPalette(Map<String, String> colorPalette) {
        this.colorPalette = colorPalette;
    }

    public List<String> getMoodKeywords() {
        return moodKeywords;
    }

    public void setMoodKeywords(List<String> moodKeywords) {
        this.moodKeywords = moodKeywords;
    }

    public String getBackgroundStyle() {
        return backgroundStyle;
    }

    public void setBackgroundStyle(String backgroundStyle) {
        this.backgroundStyle = backgroundStyle;
    }

    public Map<String, Object> getContrastRequirements() {
        return contrastRequirements;
    }

    public void setContrastRequirements(Map<String, Object> contrastRequirements) {
        this.contrastRequirements = contrastRequirements;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPromotionalText() {
        return promotionalText;
    }

    public void setPromotionalText(String promotionalText) {
        this.promotionalText = promotionalText;
    }

    public String getBusinessDescription() {
        return businessDescription;
    }

    public void setBusinessDescription(String businessDescription) {
        this.businessDescription = businessDescription;
    }

    @Override
    public String toString() {
        return "BackgroundGenerationRequest{" +
                "businessType='" + businessType + '\'' +
                ", targetAudience='" + targetAudience + '\'' +
                ", colorScheme='" + colorScheme + '\'' +
                ", stylePreference='" + stylePreference + '\'' +
                ", azureColors=" + azureColors +
                ", colorPalette=" + colorPalette +
                ", moodKeywords=" + moodKeywords +
                ", backgroundStyle='" + backgroundStyle + '\'' +
                ", contrastRequirements=" + contrastRequirements +
                ", title='" + title + '\'' +
                ", promotionalText='" + promotionalText + '\'' +
                ", businessDescription='" + businessDescription + '\'' +
                '}';
    }
} 