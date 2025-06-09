// Style Configuration Service
// Handles typography, colors, and layout configurations for fliers

/**
 * Get typography configuration based on font family
 * @param {string} fontFamily - The selected font family
 * @returns {Object} Typography configuration
 */
export function getTypographyConfig(fontFamily) {
  // ✅ DERIVE ADDITIONAL TYPOGRAPHY PROPERTIES from AI font choice
  if (fontFamily.includes('Georgia') || fontFamily.includes('Playfair')) {
    // Elegant serif fonts
    return {
      letterSpacing: '0.01em',
      lineHeight: 1.2,
      textAlign: 'center',
      titleWeight: 700,
      bodyWeight: 400
    };
  } else if (fontFamily.includes('Montserrat')) {
    // Bold modern fonts  
    return {
      letterSpacing: '-0.03em',
      lineHeight: 1.0,
      textAlign: 'right',
      titleWeight: 900,
      bodyWeight: 600
    };
  } else {
    // Clean professional fonts (Roboto, Arial)
    return {
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
      textAlign: 'right',
      titleWeight: 800,
      bodyWeight: 400
    };
  }
}

/**
 * Convert background options to style options
 * @param {Array} backgroundOptions - Background options from AI
 * @returns {Array} Complete style options
 */
export function convertToStyleOptions(backgroundOptions) {
  return backgroundOptions?.map((option, index) => {
    // ✅ COMPLETE STYLE PROPERTIES based on AI decisions
    const fontFamily = option.fontFamily || 'Roboto, sans-serif';
    const fontSize = option.fontSize || 4.0;
    const bodyFontSize = option.bodyFontSize || 1.7;
    
    // Get typography configuration
    const typography = getTypographyConfig(fontFamily);
    
    return {
      // ✅ BACKGROUND
      backgroundImage: option.backgroundImage || 'none',    
      backgroundColor: option.backgroundColor || '#ffffff',
      
      // ✅ AI-DECIDED COLORS (harmonized with background)
      textColor: option.textColor,                          
      accentColor: option.accentColor,
      
      // ✅ AI-DECIDED TYPOGRAPHY (complete set)
      fontFamily,
      fontSize,
      bodyFontSize,
      ...typography,
      
      // ✅ METADATA
      styleName: option.styleName || `Style ${index + 1}`,
      pattern: 'none',
      designRationale: option.description || `AI Generated Style ${index + 1}`,
      source: 'ai'
    };
  }) || [];
}

/**
 * Get fallback style configuration
 * @param {Object} infoObject - Flier information
 * @returns {Object} Fallback style configuration
 */
export function getFallbackStyleConfig(infoObject) {
  return {
    layout: "standard",
    success: false,
    backgroundOptions: [],
    aiStyleOptions: [{
      background: { type: 'solid', color: '#f0f8ff', gradient: null },
      textColor: '#333333',
      accentColor: '#1976d2',
      highlightColor: '#F1C40F',
      pattern: 'none',
      backgroundImage: 'none',
      designRationale: 'Default fallback style with clean look and high readability'
    }],
    layoutInfo: {
      orientation: infoObject.orientation || "portrait",
      imagePosition: "center",
      textAlignment: "center"
    },
    contentInfo: {
      title: infoObject.title || "",
      promotionalText: infoObject.promotionalText || "",
      businessType: infoObject.businessType || "",
      targetAudience: infoObject.targetAudience || ""
    },
    fallback: true
  };
} 