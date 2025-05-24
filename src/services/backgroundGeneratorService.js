// AI Background Generator Service
// Handles background generation with cost optimization and database preparation

import axios from 'axios';

/**
 * Generate 3 background options using AI (CSS-based)
 * @param {Object} backgroundParams - Parameters from simple rules engine
 * @returns {Array} Array of 3 CSS background options
 */
export async function generateBackgrounds(backgroundParams) {
  console.log("🎨 AI Background Generator: Starting CSS generation...");
  
  try {
    // First, check if we should use database (future feature)
    const cachedBackgrounds = await checkDatabaseCache(backgroundParams);
    if (cachedBackgrounds && cachedBackgrounds.length >= 3) {
      console.log("✅ Found cached backgrounds, skipping AI generation");
      return cachedBackgrounds.slice(0, 3);
    }
    
    // Generate new backgrounds using AI (CSS)
    const generatedBackgrounds = await callAIBackgroundGenerator(backgroundParams);
    
    // Save to database for future use (future feature)
    await saveToDatabaseCache(generatedBackgrounds, backgroundParams);
    
    return generatedBackgrounds;
    
  } catch (error) {
    console.error("❌ CSS background generation failed:", error);
    
    // Fallback to safe defaults
    return generateFallbackBackgrounds(backgroundParams);
  }
}

/**
 * Generate 3 actual background IMAGES using Google Imagen 3.0
 * @param {Object} backgroundParams - Parameters from simple rules engine
 * @returns {Array} Array of 3 image background options
 */
export async function generateBackgroundImages(backgroundParams) {
  console.log("🖼️ AI Background Generator: Starting IMAGE generation with Imagen 3.0...");
  
  try {
    // Generate new background images using Imagen
    const generatedImages = await callImagenBackgroundGenerator(backgroundParams);
    
    // Save to database for future use (future feature)
    await saveToDatabaseCache(generatedImages, backgroundParams);
    
    return generatedImages;
    
  } catch (error) {
    console.error("❌ Image background generation failed:", error);
    
    // Fallback to CSS backgrounds when image generation fails
    console.log("🛡️ Falling back to CSS backgrounds...");
    return generateBackgrounds(backgroundParams);
  }
}

/**
 * Call backend AI service to generate CSS backgrounds
 */
async function callAIBackgroundGenerator(params) {
  try {
    console.log("🚀 Calling backend AI service for CSS backgrounds...");
    
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
      console.log("✅ CSS generation successful, received", response.data.length, "backgrounds");
      return response.data;
    } else {
      throw new Error("Invalid response from CSS AI service");
    }
    
  } catch (error) {
    console.error("❌ CSS AI service call failed:", error);
    throw error;
  }
}

/**
 * Call backend Imagen service to generate background images
 */
async function callImagenBackgroundGenerator(params) {
  try {
    console.log("🚀 Calling backend Imagen service for background images...");
    
    const response = await axios.post('http://localhost:8081/api/backgrounds/generate-images', {
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
      console.log("✅ Imagen generation successful, received", response.data.length, "background images");
      return response.data;
    } else {
      throw new Error("Invalid response from Imagen service");
    }
    
  } catch (error) {
    console.error("❌ Imagen service call failed:", error);
    throw error;
  }
}

/**
 * Check database cache for existing backgrounds (future implementation)
 */
async function checkDatabaseCache(params) {
  // Future: Check database for similar backgrounds
  console.log("💾 Checking database cache (future feature)");
  
  try {
    // Future: Check if we have similar backgrounds in database
    const searchTags = [
      params.businessType,
      params.targetAudience,
      params.colorScheme,
      params.stylePreference,
      ...params.moodKeywords
    ];
    
    console.log("Would search database for:", searchTags);
    
    // Future: GET from backend database service
    // const response = await axios.get('http://localhost:8081/api/backgrounds/search', {
    //   params: { tags: searchTags.join(','), limit: 3 }
    // });
    // return response.data;
    
    return null; // No cache yet
    
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
      contrast_ratio: calculateContrastRatio(bg.backgroundCSS || '#FFFFFF', bg.textColor),
      
      // Timestamps
      created_at: new Date().toISOString(),
      usage_count: 0,
      source: bg.source || 'unknown'
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
      name: "Clean Gradient (Fallback)",
      backgroundCSS: `linear-gradient(135deg, ${palette.primary}15, ${palette.secondary}25)`,
      textColor: params.contrastRequirements.textColor,
      accentColor: palette.accent,
      description: "Clean gradient background with subtle colors",
      source: "fallback"
    },
    {
      name: "Solid with Pattern (Fallback)",
      backgroundCSS: `${palette.background}`,
      patternCSS: `radial-gradient(circle at 25% 25%, ${palette.accent}10 0%, transparent 50%)`,
      textColor: params.contrastRequirements.textColor,
      accentColor: palette.primary,
      description: "Solid background with subtle pattern overlay",
      source: "fallback"
    },
    {
      name: "Minimal (Fallback)",
      backgroundCSS: palette.background,
      textColor: params.contrastRequirements.textColor,
      accentColor: palette.accent,
      description: "Simple, minimal background focusing on content",
      source: "fallback"
    }
  ];
}

/**
 * Calculate contrast ratio between background and text colors
 */
function calculateContrastRatio(backgroundColor, textColor) {
  // Simple contrast ratio calculation
  try {
    // Extract RGB values (simplified)
    const bgLuminance = getLuminance(backgroundColor);
    const textLuminance = getLuminance(textColor);
    
    const lighter = Math.max(bgLuminance, textLuminance);
    const darker = Math.min(bgLuminance, textLuminance);
    
    return (lighter + 0.05) / (darker + 0.05);
  } catch (error) {
    return 4.5; // Default to passing contrast ratio
  }
}

/**
 * Calculate luminance for contrast ratio
 */
function getLuminance(color) {
  // Simplified luminance calculation
  // Remove # if present
  color = color.replace('#', '');
  
  // Default to mid-gray if parsing fails
  if (color.length !== 6) return 0.5;
  
  const r = parseInt(color.substr(0, 2), 16) / 255;
  const g = parseInt(color.substr(2, 2), 16) / 255;
  const b = parseInt(color.substr(4, 2), 16) / 255;
  
  // Simplified sRGB to linear RGB conversion
  const sRGBToLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  
  const rLinear = sRGBToLinear(r);
  const gLinear = sRGBToLinear(g);
  const bLinear = sRGBToLinear(b);
  
  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Cost estimation function
 */
export function estimateGenerationCost(provider = 'gemini', type = 'css') {
  const costs = {
    // CSS Generation costs
    'openai-gpt4': 0.03,      // $0.03 per generation
    'gemini-pro': 0.002,      // $0.002 per generation
    'claude': 0.015,          // $0.015 per generation
    
    // Image Generation costs
    'imagen-3.0': 0.04,       // $0.04 per image
    'openai-dalle': 0.06,     // $0.06 per image
    'midjourney': 0.08        // $0.08 per image (estimated)
  };
  
  if (type === 'image') {
    return {
      costPerGeneration: costs['imagen-3.0'],
      costFor3Options: costs['imagen-3.0'] * 3,
      provider: 'imagen-3.0',
      currency: 'USD',
      type: 'image'
    };
  } else {
    return {
      costPerGeneration: costs[provider] || costs['gemini-pro'],
      costFor3Options: (costs[provider] || costs['gemini-pro']) * 3,
      provider,
      currency: 'USD',
      type: 'css'
    };
  }
}

/**
 * Test the background generation service (both CSS and images)
 */
export async function testBackgroundGeneration(useImages = false) {
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
  
  if (useImages) {
    console.log("🧪 Testing Imagen background generation...");
    const results = await generateBackgroundImages(testParams);
    console.log("✅ Imagen test completed, generated", results.length, "background images");
    return results;
  } else {
    console.log("🧪 Testing CSS background generation...");
    const results = await generateBackgrounds(testParams);
    console.log("✅ CSS test completed, generated", results.length, "backgrounds");
    return results;
  }
} 