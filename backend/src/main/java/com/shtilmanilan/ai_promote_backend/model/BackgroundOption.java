package com.shtilmanilan.ai_promote_backend.model;

public class BackgroundOption {
    
    private String name;
    private String backgroundCSS;
    private String backgroundImage;
    private String textColor;
    private String textColorDark;
    private String accentColor;
    
    // ✅ AZURE VISION COLORS
    private String primaryColor;      // From Azure Vision analysis
    private String secondaryColor;    // From Azure Vision analysis
    private String backgroundColor;   // From Azure Vision analysis
    private String description;
    private String source; // "ai", "fallback", "database"
    private Double contrastRatio;
    private String patternCSS; // For overlay patterns
    
    // ✅ TEXT READABILITY FIELDS
    private String textOverlay;       // Semi-transparent overlay for text areas
    private String blurEffect;        // Backdrop blur effect for text readability
    
    // ✅ AI-DECIDED TYPOGRAPHY FIELDS
    private String fontFamily;        // "Roboto, sans-serif", "Georgia, serif", etc.
    private Float fontSize;           // Title font size in rem
    private Float bodyFontSize;       // Body text font size in rem  
    private String styleName;         // "Modern Minimal", "Elegant", "Bold", etc.

    // Default constructor
    public BackgroundOption() {
    }

    // Constructor for simple backgrounds
    public BackgroundOption(String name, String backgroundCSS, String textColor, 
                          String accentColor, String description) {
        this.name = name;
        this.backgroundCSS = backgroundCSS;
        this.textColor = textColor;
        this.accentColor = accentColor;
        this.description = description;
        this.source = "ai";
    }

    // Constructor for complete backgrounds
    public BackgroundOption(String name, String backgroundCSS, String backgroundImage,
                          String textColor, String textColorDark, String accentColor, 
                          String description, String source) {
        this.name = name;
        this.backgroundCSS = backgroundCSS;
        this.backgroundImage = backgroundImage;
        this.textColor = textColor;
        this.textColorDark = textColorDark;
        this.accentColor = accentColor;
        this.description = description;
        this.source = source;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBackgroundCSS() {
        return backgroundCSS;
    }

    public void setBackgroundCSS(String backgroundCSS) {
        this.backgroundCSS = backgroundCSS;
    }

    public String getBackgroundImage() {
        return backgroundImage;
    }

    public void setBackgroundImage(String backgroundImage) {
        this.backgroundImage = backgroundImage;
    }

    public String getTextColor() {
        return textColor;
    }

    public void setTextColor(String textColor) {
        this.textColor = textColor;
    }

    public String getTextColorDark() {
        return textColorDark;
    }

    public void setTextColorDark(String textColorDark) {
        this.textColorDark = textColorDark;
    }

    public String getAccentColor() {
        return accentColor;
    }

    public void setAccentColor(String accentColor) {
        this.accentColor = accentColor;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Double getContrastRatio() {
        return contrastRatio;
    }

    public void setContrastRatio(Double contrastRatio) {
        this.contrastRatio = contrastRatio;
    }

    public String getPatternCSS() {
        return patternCSS;
    }

    public void setPatternCSS(String patternCSS) {
        this.patternCSS = patternCSS;
    }

    public String getFontFamily() {
        return fontFamily;
    }

    public void setFontFamily(String fontFamily) {
        this.fontFamily = fontFamily;
    }

    public Float getFontSize() {
        return fontSize;
    }

    public void setFontSize(Float fontSize) {
        this.fontSize = fontSize;
    }

    public Float getBodyFontSize() {
        return bodyFontSize;
    }

    public void setBodyFontSize(Float bodyFontSize) {
        this.bodyFontSize = bodyFontSize;
    }

    public String getStyleName() {
        return styleName;
    }

    public void setStyleName(String styleName) {
        this.styleName = styleName;
    }

    public String getTextOverlay() {
        return textOverlay;
    }

    public void setTextOverlay(String textOverlay) {
        this.textOverlay = textOverlay;
    }

    public String getBlurEffect() {
        return blurEffect;
    }

    public void setBlurEffect(String blurEffect) {
        this.blurEffect = blurEffect;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public void setPrimaryColor(String primaryColor) {
        this.primaryColor = primaryColor;
    }

    public String getSecondaryColor() {
        return secondaryColor;
    }

    public void setSecondaryColor(String secondaryColor) {
        this.secondaryColor = secondaryColor;
    }

    public String getBackgroundColor() {
        return backgroundColor;
    }

    public void setBackgroundColor(String backgroundColor) {
        this.backgroundColor = backgroundColor;
    }

    @Override
    public String toString() {
        return "BackgroundOption{" +
                "name='" + name + '\'' +
                ", backgroundCSS='" + backgroundCSS + '\'' +
                ", backgroundImage='" + backgroundImage + '\'' +
                ", textColor='" + textColor + '\'' +
                ", textColorDark='" + textColorDark + '\'' +
                ", accentColor='" + accentColor + '\'' +
                ", description='" + description + '\'' +
                ", source='" + source + '\'' +
                ", contrastRatio=" + contrastRatio +
                ", patternCSS='" + patternCSS + '\'' +
                ", fontFamily='" + fontFamily + '\'' +
                ", fontSize=" + fontSize +
                ", bodyFontSize=" + bodyFontSize +
                ", styleName='" + styleName + '\'' +
                ", textOverlay='" + textOverlay + '\'' +
                ", blurEffect='" + blurEffect + '\'' +
                ", primaryColor='" + primaryColor + '\'' +
                ", secondaryColor='" + secondaryColor + '\'' +
                ", backgroundColor='" + backgroundColor + '\'' +
                '}';
    }
} 