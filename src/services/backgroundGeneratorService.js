// AI Background Generator Service
// Handles background generation with cost optimization and database preparation

import axios from 'axios';

/**
 * Generate 3 background options using AI
 * @param {Object} backgroundParams - Parameters from simple rules engine
 * @returns {Array} Array of 3 background options
 */
export async function generateBackgrounds(backgroundParams) {
  console.log("🎨 AI Background Generator: Starting generation...");
  
  try {
    // First, check if we should use database (future feature)
    const cachedBackgrounds = await checkDatabaseCache(backgroundParams);
    if (cachedBackgrounds && cachedBackgrounds.length >= 3) {
      console.log("✅ Found cached backgrounds, skipping AI generation");
      return cachedBackgrounds.slice(0, 3);
    }
    
    // Generate new backgrounds using AI
    const generatedBackgrounds = await callAIBackgroundGenerator(backgroundParams);
    
    // Save to database for future use (future feature)
    await saveToDatabaseCache(generatedBackgrounds, backgroundParams);
    
    return generatedBackgrounds;
    
  } catch (error) {
    console.error("❌ Background generation failed:", error);
    
    // Fallback to safe defaults
    return generateFallbackBackgrounds(backgroundParams);
  }
}

/**
 * Call backend AI service to generate backgrounds
 */
async function callAIBackgroundGenerator(params) {
  try {
    console.log("🚀 Calling backend AI service...");
    
    const response = await axios.post('http://localhost:8081/api/backgrounds/generate', {
      businessType: params.businessType,
      targetAudience: params.targetAudience,
      colorScheme: params.colorScheme,
      stylePreference: params.stylePreference,
      azureColors: params.azureColors,
      colorPalette: params.colorPalette,
      moodKeywords: params.moodKeywords,
      backgroundStyle: params.backgroundStyle,
      contrastRequirements: params.contrastRequirements
    });
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      console.log("✅ AI generation successful, received", response.data.length, "backgrounds");
      return response.data;
    } else {
      throw new Error("Invalid response from AI service");
    }
    
  } catch (error) {
    console.error("❌ AI service call failed:", error);
    throw error;
  }
}

/**
 * Check database cache for existing backgrounds (future implementation)
 */
async function checkDatabaseCache(params) {
  // Future: Implement database search
  // For now, return null to always generate new backgrounds
  console.log("🔍 Database cache check (future feature)");
  
  try {
    // This would search the database based on:
    // - business_type, target_audience, color_scheme
    // - Similar color palettes (within tolerance)
    // - Style preferences
    
    const searchCriteria = {
      businessType: params.businessType,
      targetAudience: params.targetAudience,
      colorScheme: params.colorScheme,
      stylePreference: params.stylePreference,
      primaryColorRange: getColorSimilarityRange(params.colorPalette.primary),
      // Add more search criteria as needed
    };
    
    console.log("Would search database with criteria:", searchCriteria);
    
    // For now, return null (no cache hit)
    return null;
    
  } catch (error) {
    console.warn("Database cache check failed:", error);
    return null;
  }
}

/**
 * Save generated backgrounds to database cache (future implementation)
 */
async function saveToDatabaseCache(backgrounds, params) {
  // Future: Save to database for reuse
  console.log("💾 Saving to database cache (future feature)");
  
  try {
    const backgroundRecords = backgrounds.map(bg => ({
      // Background data
      name: bg.name,
      background_css: bg.backgroundCSS,
      background_image_url: bg.backgroundImage || null,
      
      // Color information
      primary_color: params.colorPalette.primary,
      secondary_color: params.colorPalette.secondary,
      accent_color: params.colorPalette.accent,
      text_color_light: bg.textColor,
      text_color_dark: bg.textColorDark || '#333333',
      
      // Metadata for searching
      business_type: params.businessType,
      target_audience: params.targetAudience,
      color_scheme: params.colorScheme,
      style_preference: params.stylePreference,
      style_tags: params.searchTags,
      
      // AI generation info
      mood_keywords: params.moodKeywords,
      contrast_ratio: calculateContrastRatio(bg.backgroundCSS, bg.textColor),
      
      // Timestamps
      created_at: new Date().toISOString(),
      usage_count: 0
    }));
    
    console.log("Would save to database:", backgroundRecords);
    
    // Future: POST to backend database service
    // await axios.post('http://localhost:8081/api/backgrounds/cache', backgroundRecords);
    
  } catch (error) {
    console.warn("Failed to save to database cache:", error);
    // Don't throw - this is not critical
  }
}

/**
 * Generate fallback backgrounds when AI fails
 */
function generateFallbackBackgrounds(params) {
  console.log("🛡️ Generating fallback backgrounds");
  
  const palette = params.colorPalette;
  
  return [
    {
      name: "Clean Gradient",
      backgroundCSS: `linear-gradient(135deg, ${palette.primary}15, ${palette.secondary}25)`,
      textColor: params.contrastRequirements.textColor,
      accentColor: palette.accent,
      description: "Clean gradient background with subtle colors",
      source: "fallback"
    },
    {
      name: "Solid with Pattern",
      backgroundCSS: `${palette.background}`,
      patternCSS: `radial-gradient(circle at 25% 25%, ${palette.accent}10 0%, transparent 50%)`,
      textColor: params.contrastRequirements.textColor,
      accentColor: palette.primary,
      description: "Solid background with subtle pattern overlay",
      source: "fallback"
    },
    {
      name: "Minimal",
      backgroundCSS: palette.background,
      textColor: params.contrastRequirements.textColor,
      accentColor: palette.accent,
      description: "Simple, minimal background focusing on content",
      source: "fallback"
    }
  ];
}

/**
 * Helper functions for color analysis
 */
function getColorSimilarityRange(hexColor) {
  // Convert hex to HSL and create range for similar color matching
  const hsl = hexToHsl(hexColor);
  
  return {
    center: hexColor,
    hue_range: [hsl.h - 30, hsl.h + 30], // ±30 degrees
    saturation_range: [Math.max(0, hsl.s - 0.2), Math.min(1, hsl.s + 0.2)], // ±20%
    lightness_range: [Math.max(0, hsl.l - 0.2), Math.min(1, hsl.l + 0.2)] // ±20%
  };
}

function hexToHsl(hex) {
  // Convert hex to RGB first
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return { h: h * 360, s, l };
}

function calculateContrastRatio(backgroundCSS, textColor) {
  // Simplified contrast calculation
  // In a real implementation, you'd extract the actual background color
  // and calculate WCAG contrast ratio
  return 4.5; // Assume good contrast for now
}

/**
 * Cost estimation function
 */
export function estimateGenerationCost(provider = 'gemini') {
  const costs = {
    'openai-gpt4': 0.03,      // $0.03 per generation
    'openai-dalle': 0.06,     // $0.06 per image  
    'gemini-pro': 0.002,      // $0.002 per generation
    'claude': 0.015           // $0.015 per generation
  };
  
  return {
    costPerGeneration: costs[provider] || costs['gemini-pro'],
    costFor3Options: (costs[provider] || costs['gemini-pro']) * 3,
    provider,
    currency: 'USD'
  };
}

/**
 * Test the background generation service
 */
export async function testBackgroundGeneration() {
  const testParams = {
    businessType: 'restaurant',
    targetAudience: 'families',
    colorScheme: 'warm',
    stylePreference: 'modern',
    colorPalette: {
      primary: '#FF6B35',
      secondary: '#F7931E', 
      accent: '#FFD23F',
      background: '#FFFFFF',
      textDark: '#333333',
      textLight: '#FFFFFF'
    },
    moodKeywords: ['appetizing', 'welcoming', 'warm'],
    backgroundStyle: 'warm gradients with earth tones',
    contrastRequirements: {
      textColor: '#333333',
      minContrastRatio: 4.5,
      ensureReadability: true,
      backgroundType: 'light'
    }
  };
  
  console.log("🧪 Testing background generation...");
  const results = await generateBackgrounds(testParams);
  console.log("✅ Test completed, generated", results.length, "backgrounds");
  return results;
} 