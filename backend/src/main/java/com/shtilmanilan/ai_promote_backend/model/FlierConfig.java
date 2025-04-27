package com.shtilmanilan.ai_promote_backend.model;

public class FlierConfig {
    public Layout layout;
    public ColorPalette colorPalette;
    public Font font;
    public String mood;
    public Content content;
    public AdditionalDesign additionalDesign;

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
} 