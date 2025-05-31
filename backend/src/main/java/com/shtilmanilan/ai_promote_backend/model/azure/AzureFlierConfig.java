package com.shtilmanilan.ai_promote_backend.model.azure;

/**
 * Azure-specific flier configuration model
 * Used for generating flier configurations based on Azure Vision analysis
 */
public class AzureFlierConfig {
    
    public Layout layout;
    public ColorPalette colorPalette;
    public Font font;
    public String mood;
    public Content content;
    public AdditionalDesign additionalDesign;

    // Default constructor
    public AzureFlierConfig() {}

    public static class Layout {
        public String orientation;
        public String imagePosition;
        public String imageSize;
        public String textPosition;
        public String textAlignment;
    }

    public static class ColorPalette {
        public String background;
        public String text;
        public String accentColor;
    }

    public static class Font {
        public String title;
        public String body;
        public String promotionalText;
    }

    public static class Content {
        public String title;
        public String promotionalText;
    }

    public static class AdditionalDesign {
        public String imageEffects;
        public String textEffect;
    }

    // Getters and setters
    public Layout getLayout() { return layout; }
    public void setLayout(Layout layout) { this.layout = layout; }

    public ColorPalette getColorPalette() { return colorPalette; }
    public void setColorPalette(ColorPalette colorPalette) { this.colorPalette = colorPalette; }

    public Font getFont() { return font; }
    public void setFont(Font font) { this.font = font; }

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public Content getContent() { return content; }
    public void setContent(Content content) { this.content = content; }

    public AdditionalDesign getAdditionalDesign() { return additionalDesign; }
    public void setAdditionalDesign(AdditionalDesign additionalDesign) { this.additionalDesign = additionalDesign; }
} 