import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081';
console.log('🔧 Azure Vision Service - Backend URL:', BACKEND_URL);

/**
 * Analyze a single image using Azure Vision API via our backend
 * @param {string} imageInput - Base64 image data or image URL
 * @returns {Object} Analysis result with scene, colors, objects, and business type
 */
export const analyzeImageWithAzure = async (imageInput) => {
  try {
    let base64Image;

    // Handle different image input formats
    if (imageInput.startsWith('data:image')) {
      base64Image = imageInput;
    } else {
      // Convert image URL to base64
      const response = await fetch(imageInput);
      const blob = await response.blob();
      const reader = new FileReader();
      
      base64Image = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    console.log('🔍 Sending image to simplified backend Azure Vision API...');
    console.log('🌐 Using backend URL:', `${BACKEND_URL}/api/vision/analyze`);
    
    // Call our simplified backend endpoint
    const backendResponse = await axios.post(`${BACKEND_URL}/api/vision/analyze`, base64Image, {
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
      withCredentials: false
    });

    console.log('✅ Azure Vision analysis received:', backendResponse.data);
    
    // Validate response structure
    const responseData = backendResponse.data;
    if (!responseData) {
      throw new Error('Empty response from Azure Vision API');
    }
    
    // Ensure colors exist (backend now provides clean, photo-based colors)
    if (!responseData.colors) {
      console.warn('No colors in response, using neutral defaults');
      responseData.colors = createDefaultColors();
    }
    
    // Ensure dominantColors array exists
    if (!responseData.colors.dominantColors || !Array.isArray(responseData.colors.dominantColors)) {
      console.warn('Missing dominantColors, creating from other colors');
      responseData.colors.dominantColors = [
        responseData.colors.primary,
        responseData.colors.secondary,
        responseData.colors.accent,
        responseData.colors.background
      ].filter(Boolean);
    }
    
    console.log('🎨 Processed colors from photo analysis:', responseData.colors);
    return responseData;
    
  } catch (error) {
    console.error('❌ Azure Vision analysis failed:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    // Return clean fallback response
    console.warn('🛡️ Using fallback response');
    return createFallbackResponse();
  }
};

/**
 * Analyze multiple images (logo and photo) and combine results intelligently
 * @param {Object} images - Object with logo and/or photo properties
 * @returns {Object} Combined analysis with unified color palette
 */
export const analyzeMultipleImagesWithAzure = async (images) => {
  try {
    const analysisPromises = [];
    const imageTypes = [];

    console.log('🔍 Starting multi-image analysis:', {
      hasLogo: !!images.logo,
      hasPhoto: !!images.photo
    });

    // Queue analysis for available images
    if (images.logo) {
      console.log('📄 Queuing logo analysis...');
      analysisPromises.push(analyzeImageWithAzure(images.logo));
      imageTypes.push('logo');
    }

    if (images.photo) {
      console.log('📸 Queuing photo analysis...');
      analysisPromises.push(analyzeImageWithAzure(images.photo));
      imageTypes.push('photo');
    }

    if (analysisPromises.length === 0) {
      console.log('ℹ️ No images to analyze');
      return null;
    }

    // Execute all analyses in parallel
    const results = await Promise.all(analysisPromises);
    console.log('✅ All analyses completed:', results.length, 'results');
    
    // Create combined analysis structure
    const combinedAnalysis = {
      hasLogo: !!images.logo,
      hasPhoto: !!images.photo,
      logoAnalysis: null,
      photoAnalysis: null,
      hasLogoAnalysis: false,
      hasPhotoAnalysis: false,
      combinedColors: {},
      combinedObjects: [],
      combinedDescription: '',
      businessType: '',
      sceneType: ''
    };

    // Process each result
    results.forEach((result, index) => {
      const imageType = imageTypes[index];
      
      console.log(`🔄 Processing ${imageType} result:`, result);
      
      if (imageType === 'logo') {
        combinedAnalysis.logoAnalysis = result;
        combinedAnalysis.hasLogoAnalysis = true;
        combinedAnalysis.combinedColors.logo = result.colors;
        if (result.businessType) {
          combinedAnalysis.businessType = result.businessType;
        }
      } else if (imageType === 'photo') {
        combinedAnalysis.photoAnalysis = result;
        combinedAnalysis.hasPhotoAnalysis = true;
        combinedAnalysis.combinedColors.photo = result.colors;
        if (result.sceneType) {
          combinedAnalysis.sceneType = result.sceneType;
        }
        if (result.objects) {
          combinedAnalysis.combinedObjects = result.objects;
        }
      }
    });

    // Create unified color palette from both sources
    if (combinedAnalysis.combinedColors.logo || combinedAnalysis.combinedColors.photo) {
      combinedAnalysis.colors = createUnifiedColorPalette(
        combinedAnalysis.combinedColors.logo,
        combinedAnalysis.combinedColors.photo
      );
    }

    // Create combined description
    const descriptions = [];
    if (combinedAnalysis.logoAnalysis?.description) {
      descriptions.push(`Logo: ${combinedAnalysis.logoAnalysis.description}`);
    }
    if (combinedAnalysis.photoAnalysis?.description) {
      descriptions.push(`Scene: ${combinedAnalysis.photoAnalysis.description}`);
    }
    combinedAnalysis.combinedDescription = descriptions.join('. ');

    // Use business type from logo first, then photo
    if (!combinedAnalysis.businessType && combinedAnalysis.photoAnalysis?.businessType) {
      combinedAnalysis.businessType = combinedAnalysis.photoAnalysis.businessType;
    }

    console.log('🎨 Final combined analysis:', combinedAnalysis);
    return combinedAnalysis;

  } catch (error) {
    console.error('❌ Multi-image analysis failed:', error);
    
    // Return fallback with proper structure
    return createFallbackMultiAnalysis(images);
  }
};

/**
 * Create unified color palette from logo and photo analysis
 * Intelligently distributes colors from both sources
 */
const createUnifiedColorPalette = (logoColors, photoColors) => {
  console.log("🎨 Creating unified palette from:", { logoColors, photoColors });

  // Extract dominant colors
  const logoDominant = logoColors?.dominantColors || [];
  const photoDominant = photoColors?.dominantColors || [];
  
  console.log("🔴 Logo colors:", logoDominant);
  console.log("📸 Photo colors:", photoDominant);

  // Start with defaults
  const unified = {
    primary: '#666666',
    secondary: '#999999',
    accent: '#CCCCCC',
    background: '#FFFFFF'
  };

  if (logoColors && photoColors) {
    // Both available - strategic distribution
    console.log("🎨 Both sources available - smart distribution");
    
    // Logo gets priority for brand identity (primary, accent)
    unified.primary = logoDominant[0] || logoColors.primary || unified.primary;
    unified.accent = logoDominant[1] || logoColors.accent || unified.accent;
    
    // Photo provides environmental context (secondary, background)
    unified.secondary = photoDominant[0] || photoColors.primary || unified.secondary;
    unified.background = photoColors.background || photoDominant[1] || unified.background;
    
    // Create dominantColors array
    unified.dominantColors = [
      unified.primary,
      unified.secondary,
      unified.accent,
      unified.background
    ].filter(Boolean);
    
  } else if (logoColors) {
    // Logo only - use logo colors
    console.log("🔴 Logo only - using logo colors");
    unified.primary = logoDominant[0] || logoColors.primary || unified.primary;
    unified.secondary = logoDominant[1] || logoColors.secondary || unified.secondary;
    unified.accent = logoDominant[2] || logoColors.accent || unified.accent;
    unified.background = logoColors.background || unified.background;
    unified.dominantColors = logoDominant.slice(0, 4);
    
  } else if (photoColors) {
    // Photo only - use photo colors
    console.log("📸 Photo only - using photo colors");
    unified.primary = photoDominant[0] || photoColors.primary || unified.primary;
    unified.secondary = photoDominant[1] || photoColors.secondary || unified.secondary;
    unified.accent = photoDominant[2] || photoColors.accent || unified.accent;
    unified.background = photoColors.background || unified.background;
    unified.dominantColors = photoDominant.slice(0, 4);
  }

  // Remove duplicates and ensure we have colors
  unified.dominantColors = [...new Set(unified.dominantColors)].filter(Boolean);
  
  console.log("✨ Final unified palette:", unified);
  return unified;
};

/**
 * Create default colors for fallback scenarios
 */
const createDefaultColors = () => ({
  primary: '#666666',
  secondary: '#999999',
  accent: '#CCCCCC',
  background: '#FFFFFF',
  dominantColors: ['#666666', '#999999', '#CCCCCC']
});

/**
 * Create fallback response for single image analysis
 */
const createFallbackResponse = () => ({
  sceneType: 'general',
  description: 'Image analysis unavailable',
  businessType: 'general business',
  objects: ['general'],
  colors: createDefaultColors(),
  atmosphere: 'neutral',
  lighting: 'ambient'
});

/**
 * Create fallback response for multi-image analysis
 */
const createFallbackMultiAnalysis = (images) => ({
  hasLogo: !!images.logo,
  hasPhoto: !!images.photo,
  logoAnalysis: images.logo ? { ...createFallbackResponse(), businessType: 'general business' } : null,
  photoAnalysis: images.photo ? { ...createFallbackResponse(), sceneType: 'general' } : null,
  hasLogoAnalysis: !!images.logo,
  hasPhotoAnalysis: !!images.photo,
  colors: createDefaultColors(),
  businessType: 'general business',
  sceneType: 'general',
  combinedColors: {},
  combinedObjects: [],
  combinedDescription: 'Analysis unavailable'
});

/**
 * Test the backend connection
 * @returns {Promise<boolean>} True if connection is successful
 */
export const testBackendConnection = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/vision/test`);
    console.log('✅ Backend connection test successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
    return false;
  }
}; 