package com.shtilmanilan.ai_promote_backend.model;

public class BackgroundOption {
    
    private String name;
    private String backgroundCSS;
    private String backgroundImage;
    private String textColor;
    private String textColorDark;
    private String accentColor;
    private String description;
    private String source; // "ai", "fallback", "database"
    private Double contrastRatio;
    private String patternCSS; // For overlay patterns

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
                '}';
    }
} 