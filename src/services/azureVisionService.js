import axios from 'axios';

// Use our backend service for Azure API
export const analyzeImageWithAzure = async (imageInput) => {
  try {
    let base64Image;

    // Check if the input is already a base64 image (starts with data:image)
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

    console.log('Sending image to backend...');
    // Send to our backend endpoint
    const backendResponse = await axios.post('http://localhost:8081/api/vision/analyze', base64Image, {
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
      withCredentials: false // This can help with CORS issues
    });

    console.log('Backend Vision API response received:', backendResponse.data);
    
    // Validate the response structure
    const responseData = backendResponse.data;
    if (!responseData) {
      throw new Error('Empty response from Azure Vision API');
    }
    
    // Ensure colors object exists with proper structure
    if (!responseData.colors) {
      console.warn('No colors in Azure response, creating default colors');
      responseData.colors = {
        primary: '#2196F3',
        secondary: '#FF9800', 
        accent: '#4CAF50',
        background: '#FFFFFF',
        dominantColors: ['#2196F3', '#FF9800', '#4CAF50']
      };
    }
    
    // Ensure dominantColors array exists
    if (!responseData.colors.dominantColors || !Array.isArray(responseData.colors.dominantColors)) {
      console.warn('Missing or invalid dominantColors, creating from other colors');
      responseData.colors.dominantColors = [
        responseData.colors.primary || '#2196F3',
        responseData.colors.secondary || '#FF9800',
        responseData.colors.accent || '#4CAF50'
      ].filter(Boolean);
    }
    
    console.log('Processed Azure response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Backend Vision analysis failed:', error);
    
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data));
      console.error('Response status:', error.response.status);
      console.error('Response headers:', JSON.stringify(error.response.headers));
    } else if (error.request) {
      console.error('No response received from server. Request:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    // Return a meaningful fallback instead of throwing
    console.warn('Returning fallback response due to Azure API failure');
    return {
      sceneType: 'general',
      description: 'Image analysis unavailable',
      businessType: 'general business',
      objects: ['general'],
      colors: {
        primary: '#2196F3',
        secondary: '#FF9800',
        accent: '#4CAF50',
        background: '#FFFFFF',
        dominantColors: ['#2196F3', '#FF9800', '#4CAF50']
      },
      atmosphere: 'neutral',
      lighting: 'ambient'
    };
  }
};

// New function to analyze multiple images (logo and photo)
export const analyzeMultipleImagesWithAzure = async (images) => {
  try {
    const analysisPromises = [];
    const imageTypes = [];

    console.log('Starting multiple image analysis with:', {
      hasLogo: !!images.logo,
      hasPhoto: !!images.photo
    });

    // Process logo if provided
    if (images.logo) {
      console.log('Analyzing logo...');
      analysisPromises.push(analyzeImageWithAzure(images.logo));
      imageTypes.push('logo');
    }

    // Process photo if provided
    if (images.photo) {
      console.log('Analyzing photo...');
      analysisPromises.push(analyzeImageWithAzure(images.photo));
      imageTypes.push('photo');
    }

    // If no images provided, return null
    if (analysisPromises.length === 0) {
      console.log('No images to analyze');
      return null;
    }

    // Wait for all analyses to complete
    const results = await Promise.all(analysisPromises);
    console.log('All analysis results received:', results);
    
    // Combine results
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

    // Process results based on what was analyzed
    results.forEach((result, index) => {
      const imageType = imageTypes[index];
      
      console.log(`Processing ${imageType} analysis result:`, result);
      
      if (imageType === 'logo') {
        combinedAnalysis.logoAnalysis = result;
        combinedAnalysis.hasLogoAnalysis = true;
        // Logo analysis might give us brand colors and business type clues
        if (result.colors) {
          combinedAnalysis.combinedColors.logo = result.colors;
        }
        if (result.businessType) {
          combinedAnalysis.businessType = result.businessType;
        }
      } else if (imageType === 'photo') {
        combinedAnalysis.photoAnalysis = result;
        combinedAnalysis.hasPhotoAnalysis = true;
        // Photo analysis gives us scene context and additional colors
        if (result.colors) {
          combinedAnalysis.combinedColors.photo = result.colors;
        }
        if (result.sceneType) {
          combinedAnalysis.sceneType = result.sceneType;
        }
        if (result.objects) {
          combinedAnalysis.combinedObjects = result.objects;
        }
      }
    });

    // Create a unified color palette from both sources
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

    // Use business type from logo if available, otherwise from photo
    if (!combinedAnalysis.businessType && combinedAnalysis.photoAnalysis?.businessType) {
      combinedAnalysis.businessType = combinedAnalysis.photoAnalysis.businessType;
    }

    console.log('Final combined analysis result:', combinedAnalysis);
    return combinedAnalysis;

  } catch (error) {
    console.error('Multiple image analysis failed:', error);
    
    // Return a fallback result instead of throwing
    console.warn('Returning fallback combined analysis due to error');
    return {
      hasLogo: !!images.logo,
      hasPhoto: !!images.photo,
      logoAnalysis: images.logo ? {
        colors: { primary: '#2196F3', secondary: '#FF9800', accent: '#4CAF50', background: '#FFFFFF', dominantColors: ['#2196F3', '#FF9800', '#4CAF50'] },
        description: 'Logo analysis unavailable',
        businessType: 'general business'
      } : null,
      photoAnalysis: images.photo ? {
        colors: { primary: '#4CAF50', secondary: '#2196F3', accent: '#FF9800', background: '#FFFFFF', dominantColors: ['#4CAF50', '#2196F3', '#FF9800'] },
        description: 'Photo analysis unavailable',
        sceneType: 'general'
      } : null,
      hasLogoAnalysis: !!images.logo,
      hasPhotoAnalysis: !!images.photo,
      colors: createUnifiedColorPalette(
        images.logo ? { primary: '#2196F3', secondary: '#FF9800', accent: '#4CAF50', background: '#FFFFFF', dominantColors: ['#2196F3', '#FF9800', '#4CAF50'] } : null,
        images.photo ? { primary: '#4CAF50', secondary: '#2196F3', accent: '#FF9800', background: '#FFFFFF', dominantColors: ['#4CAF50', '#2196F3', '#FF9800'] } : null
      ),
      businessType: 'general business',
      sceneType: 'general'
    };
  }
};

// Helper function to create unified color palette from logo and photo
const createUnifiedColorPalette = (logoColors, photoColors) => {
  const unified = {
    primary: '#2196F3',
    secondary: '#FF9800',
    accent: '#4CAF50',
    background: '#FFFFFF'
  };

  console.log("🎨 Starting color unification with:", { logoColors, photoColors });

  // Collect all dominant colors from both sources
  const allDominantColors = [];
  
  // Add logo dominant colors
  if (logoColors && logoColors.dominantColors) {
    allDominantColors.push(...logoColors.dominantColors);
    console.log("📸 Logo dominant colors:", logoColors.dominantColors);
  }
  
  // Add photo dominant colors  
  if (photoColors && photoColors.dominantColors) {
    allDominantColors.push(...photoColors.dominantColors);
    console.log("🖼️ Photo dominant colors:", photoColors.dominantColors);
  }

  // Remove duplicates and prioritize non-white colors for variety
  const uniqueColors = [...new Set(allDominantColors)];
  const colorsByPreference = uniqueColors.sort((a, b) => {
    // Prioritize non-white colors for better visual variety
    const aIsWhite = a.toLowerCase() === '#ffffff';
    const bIsWhite = b.toLowerCase() === '#ffffff';
    if (aIsWhite && !bIsWhite) return 1;   // b comes first
    if (!aIsWhite && bIsWhite) return -1;  // a comes first
    return 0; // keep original order
  });

  console.log("🎨 All unique colors by preference:", colorsByPreference);

  // Use the best colors we found
  if (colorsByPreference.length >= 3) {
    unified.primary = colorsByPreference[0];    // Best non-white color or white if only option
    unified.secondary = colorsByPreference[1];  // Second best color  
    unified.accent = colorsByPreference[2];     // Third best color
    console.log("✅ Using merged dominant colors:", unified.primary, unified.secondary, unified.accent);
  } else if (colorsByPreference.length >= 2) {
    unified.primary = colorsByPreference[0];
    unified.secondary = colorsByPreference[1];
    // Keep default accent
    console.log("✅ Using 2 merged dominant colors + default accent");
  } else if (colorsByPreference.length >= 1) {
    unified.primary = colorsByPreference[0];
    // Keep defaults for secondary and accent
    console.log("✅ Using 1 merged dominant color + defaults");
  } else {
    console.log("⚠️ No dominant colors found, using defaults");
  }

  // Set background from logo or photo
  unified.background = logoColors?.background || photoColors?.background || unified.background;

  console.log("🎨 Final unified palette:", unified);
  return unified;
};

// Test function to check if the backend is accessible
export const testBackendConnection = async () => {
  try {
    console.log('Testing connection to backend server...');
    const response = await axios.get('http://localhost:8081/api/vision/test');
    console.log('Backend server is accessible:', response.data);
    return { success: true, message: response.data };
  } catch (error) {
    console.error('Failed to connect to backend server:', error);
    return { 
      success: false, 
      message: 'Could not connect to backend server. Please ensure the backend is running.'
    };
  }
}; 