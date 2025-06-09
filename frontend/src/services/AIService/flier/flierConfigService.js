// Flier Configuration Service
// Handles AI-powered flier style and configuration generation

/**
 * Get AI style advice for flier configuration
 * @param {Object} infoObject - Flier information and preferences
 * @returns {Promise<Object>} AI-generated style configuration
 */
export async function getAIStyleAdvice(infoObject) {
  try {
    console.log("Requesting AI style advice for flier:", infoObject);
    
    const response = await fetch('http://localhost:8081/api/flier/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(infoObject)
    });
    
    if (!response.ok) {
      console.error("AI style advice API error status:", response.status);
      const errorText = await response.text();
      console.error("AI style advice API error response:", errorText);
      return null;
    }
    
    const text = await response.text();
    try {
      // Try to parse the response as JSON
      const jsonResponse = JSON.parse(text);
      console.log("Successfully received AI style advice");
      return jsonResponse;
    } catch (e) {
      console.error("JSON parse error in AI style advice:", e);
      console.error("Invalid JSON response:", text);
      return null;
    }
  } catch (error) {
    console.error("Network or other error during AI style advice:", error);
    return null;
  }
}

/**
 * Generate complete flier configuration using AI
 * @param {Object} infoObject - Flier information and preferences
 * @returns {Promise<Object>} Complete flier configuration
 */
export async function generateFlierConfig(infoObject) {
  try {
    console.log("Generating flier configuration with new simplified pipeline");
    
    // Use our new simplified backend endpoint
    const response = await getAIStyleAdvice(infoObject);
    
    if (response && response.success) {
      console.log("Successfully received flier configuration from simplified pipeline");
      
      // Convert backgroundOptions to aiStyleOptions format - Use backend analyzed colors
      const aiStyleOptions = response.backgroundOptions?.map((option, index) => {
        
        // ✅ COMPLETE STYLE PROPERTIES based on AI decisions
        const fontFamily = option.fontFamily || 'Roboto, sans-serif';
        const fontSize = option.fontSize || 4.0;
        const bodyFontSize = option.bodyFontSize || 1.7;
        
        // ✅ DERIVE ADDITIONAL TYPOGRAPHY PROPERTIES from AI font choice
        let letterSpacing, lineHeight, textAlign, titleWeight, bodyWeight;
        
        if (fontFamily.includes('Georgia') || fontFamily.includes('Playfair')) {
          // Elegant serif fonts
          letterSpacing = '0.01em';
          lineHeight = 1.2;
          textAlign = 'center';
          titleWeight = 700;
          bodyWeight = 400;
        } else if (fontFamily.includes('Montserrat')) {
          // Bold modern fonts  
          letterSpacing = '-0.03em';
          lineHeight = 1.0;
          textAlign = 'right';
          titleWeight = 900;
          bodyWeight = 600;
        } else {
          // Clean professional fonts (Roboto, Arial)
          letterSpacing = '-0.02em';
          lineHeight = 1.1;
          textAlign = 'right';
          titleWeight = 800;
          bodyWeight = 400;
        }
        
        return {
          // ✅ BACKGROUND
          backgroundImage: option.backgroundImage || 'none',    
          backgroundColor: option.backgroundColor || '#ffffff',
          
          // ✅ AI-DECIDED COLORS (harmonized with background)
          textColor: option.textColor,                          
          accentColor: option.accentColor,
          
          // ✅ AI-DECIDED TYPOGRAPHY (complete set)
          fontFamily: fontFamily,
          fontSize: fontSize,
          bodyFontSize: bodyFontSize,
          letterSpacing: letterSpacing,
          lineHeight: lineHeight,
          textAlign: textAlign,
          titleWeight: titleWeight,
          bodyWeight: bodyWeight,
          
          // ✅ METADATA
          styleName: option.styleName || `Style ${index + 1}`,
          pattern: 'none',
          designRationale: option.description || `AI Generated Style ${index + 1}`,
          source: 'ai'
        };
      }) || [];
      
      return {
        ...response,
        aiStyleOptions
      };
    } else {
      throw new Error("Failed to get response from simplified pipeline");
    }
  } catch (error) {
    console.error("Error in simplified flier generation:", error);
    
    // Provide a basic fallback configuration
    console.log("Using basic fallback configuration");
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
} 