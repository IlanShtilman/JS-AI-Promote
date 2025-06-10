// Background Generator Service
// Handles background generation via backend API calls

import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081';

/**
 * Generate 3 background options using AI (CSS-based)
 * @param {Object} backgroundParams - Parameters from background parameters generator
 * @returns {Array} Array of 3 CSS background options
 */
export async function generateBackgrounds(backgroundParams) {
  console.log("🎨 Background Generator: Starting CSS generation...");
  
  try {
    // Generate new backgrounds using AI (CSS)
    const generatedBackgrounds = await callAIBackgroundGenerator(backgroundParams);
    return generatedBackgrounds;
    
  } catch (error) {
    console.error("❌ CSS background generation failed:", error);
    
    // Fallback to safe defaults
    return generateFallbackBackgrounds(backgroundParams);
  }
}

/**
 * Generate 3 actual background IMAGES using Google Imagen 3.0
 * @param {Object} backgroundParams - Parameters from background parameters generator
 * @returns {Array} Array of 3 image background options
 */
export async function generateBackgroundImages(backgroundParams) {
  console.log("🖼️ Background Generator: Starting IMAGE generation with Imagen 3.0...");
  
  try {
    // Generate new background images using Imagen
    const generatedImages = await callImagenBackgroundGenerator(backgroundParams);
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
    
    const response = await axios.post(`${BACKEND_URL}/api/backgrounds/generate`, {
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
    
    const response = await axios.post(`${BACKEND_URL}/api/backgrounds/generate-images`, {
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