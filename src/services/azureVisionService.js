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
      console.warn('No colors in Azure response, creating neutral default colors');
      responseData.colors = {
        primary: '#666666',
        secondary: '#999999', 
        accent: '#CCCCCC',
        background: '#FFFFFF',
        dominantColors: ['#666666', '#999999', '#CCCCCC']
      };
    }
    
    // Ensure dominantColors array exists
    if (!responseData.colors.dominantColors || !Array.isArray(responseData.colors.dominantColors)) {
      console.warn('Missing or invalid dominantColors, creating from other colors');
      responseData.colors.dominantColors = [
        responseData.colors.primary || '#666666',
        responseData.colors.secondary || '#999999',
        responseData.colors.accent || '#CCCCCC'
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
        primary: '#666666',
        secondary: '#999999',
        accent: '#CCCCCC',
        background: '#FFFFFF',
        dominantColors: ['#666666', '#999999', '#CCCCCC']
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
        colors: { primary: '#666666', secondary: '#999999', accent: '#CCCCCC', background: '#FFFFFF', dominantColors: ['#666666', '#999999', '#CCCCCC'] },
        description: 'Logo analysis unavailable',
        businessType: 'general business'
      } : null,
      photoAnalysis: images.photo ? {
        colors: { primary: '#666666', secondary: '#999999', accent: '#CCCCCC', background: '#FFFFFF', dominantColors: ['#666666', '#999999', '#CCCCCC'] },
        description: 'Photo analysis unavailable',
        sceneType: 'general'
      } : null,
      hasLogoAnalysis: !!images.logo,
      hasPhotoAnalysis: !!images.photo,
      colors: createUnifiedColorPalette(
        images.logo ? { primary: '#666666', secondary: '#999999', accent: '#CCCCCC', background: '#FFFFFF', dominantColors: ['#666666', '#999999', '#CCCCCC'] } : null,
        images.photo ? { primary: '#666666', secondary: '#999999', accent: '#CCCCCC', background: '#FFFFFF', dominantColors: ['#666666', '#999999', '#CCCCCC'] } : null
      ),
      businessType: 'general business',
      sceneType: 'general'
    };
  }
};

// Helper function to create unified color palette from logo and photo
// Enhanced to intelligently combine logo and photo colors
const createUnifiedColorPalette = (logoColors, photoColors) => {
  console.log("🎨 Creating unified palette from enhanced Azure data:", { logoColors, photoColors });

  // Start with defaults
  const unified = {
    primary: '#666666',
    secondary: '#999999', 
    accent: '#CCCCCC',
    background: '#FFFFFF'
  };

  // Smart combination logic
  if (logoColors && photoColors) {
    console.log("🎨 Both logo and photo available - creating smart combination");
    
    // Use logo for brand identity (primary)
    unified.primary = logoColors.primary || unified.primary;
    
    // Use photo for environmental context (secondary/accent)
    unified.secondary = photoColors.primary || logoColors.secondary || unified.secondary;
    unified.accent = photoColors.secondary || logoColors.accent || unified.accent;
    
    // Choose best background
    unified.background = logoColors.background || photoColors.background || unified.background;
    
    // Combine dominant colors from both sources
    const allDominantColors = [
      ...(logoColors.dominantColors || []),
      ...(photoColors.dominantColors || [])
    ];
    unified.dominantColors = [...new Set(allDominantColors)]; // Remove duplicates
    
    console.log("✨ Smart combination: Logo primary + Photo environmental colors");
  }
  // Prioritize logo colors if available (brand identity is most important)
  else if (logoColors) {
    console.log("📸 Using logo colors as primary source");
    unified.primary = logoColors.primary || unified.primary;
    unified.secondary = logoColors.secondary || unified.secondary;
    unified.accent = logoColors.accent || unified.accent;
    unified.background = logoColors.background || unified.background;
    unified.dominantColors = logoColors.dominantColors || [];
  }
  // If no logo, use photo colors
  else if (photoColors) {
    console.log("🖼️ Using photo colors as primary source");
    unified.primary = photoColors.primary || unified.primary;
    unified.secondary = photoColors.secondary || unified.secondary;
    unified.accent = photoColors.accent || unified.accent;
    unified.background = photoColors.background || unified.background;
    unified.dominantColors = photoColors.dominantColors || [];
  }

  console.log("🎨 Final unified palette (enhanced combination):", unified);
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