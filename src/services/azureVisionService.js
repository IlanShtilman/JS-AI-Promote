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
// Creates exactly 4 colors: ראשי (primary), משני (secondary), רקע (background), הדגשה (accent)
// Distributes 2 dominant colors from each source when possible
const createUnifiedColorPalette = (logoColors, photoColors) => {
  console.log("🎨 Creating unified palette - distributing dominant colors from both sources:", { logoColors, photoColors });

  // Extract dominant colors from each source
  const logoDominantColors = logoColors?.dominantColors || [];
  const photoDominantColors = photoColors?.dominantColors || [];
  
  console.log("🔴 Logo dominant colors:", logoDominantColors);
  console.log("📸 Photo dominant colors:", photoDominantColors);

  // Start with defaults
  const unified = {
    primary: '#666666',    // ראשי
    secondary: '#999999',  // משני  
    accent: '#CCCCCC',     // הדגשה
    background: '#FFFFFF'  // רקע
  };

  // Smart distribution logic for 4 colors
  if (logoColors && photoColors) {
    console.log("🎨 Both logo and photo available - distributing 2 colors from each");
    
    // Get 2 best colors from logo (brand identity priority)
    const logoColors2 = logoDominantColors.slice(0, 2);
    // Get 2 best colors from photo (environmental context)
    const photoColors2 = photoDominantColors.slice(0, 2);
    
    console.log("🔴 Taking 2 from logo:", logoColors2);
    console.log("📸 Taking 2 from photo:", photoColors2);
    
    // Distribute the 4 colors strategically:
    // ראשי (primary) - Most important logo color (brand identity)
    unified.primary = logoColors2[0] || logoColors.accent || logoColors.primary || unified.primary;
    
    // משני (secondary) - Most important photo color (environmental context)  
    unified.secondary = photoColors2[0] || photoColors.primary || unified.secondary;
    
    // הדגשה (accent) - Second logo color (brand accent)
    unified.accent = logoColors2[1] || logoColors.secondary || unified.accent;
    
    // רקע (background) - Second photo color or best background
    unified.background = photoColors2[1] || photoColors.background || logoColors.background || unified.background;
    
    // If we don't have enough colors from one side, give the other side more
    if (logoColors2.length < 2 && photoColors2.length >= 3) {
      console.log("🔄 Logo has <2 colors, giving photo more space");
      unified.accent = photoColors2[2] || unified.accent;
    } else if (photoColors2.length < 2 && logoColors2.length >= 3) {
      console.log("🔄 Photo has <2 colors, giving logo more space");
      unified.secondary = logoColors2[2] || unified.secondary;
    }
    
    // Create dominantColors array with proper distribution
    unified.dominantColors = [
      unified.primary,    // Logo color 1
      unified.secondary,  // Photo color 1  
      unified.accent,     // Logo color 2
      unified.background  // Photo color 2
    ].filter(Boolean);
    
    console.log("✨ Distributed colors - Logo: [primary, accent], Photo: [secondary, background]");
  }
  // Only logo available - use logo colors
  else if (logoColors) {
    console.log("🔴 Only logo available - using logo colors");
    unified.primary = logoDominantColors[0] || logoColors.primary || unified.primary;
    unified.secondary = logoDominantColors[1] || logoColors.secondary || unified.secondary;
    unified.accent = logoDominantColors[2] || logoColors.accent || unified.accent;
    unified.background = logoColors.background || unified.background;
    unified.dominantColors = logoDominantColors.slice(0, 4);
  }
  // Only photo available - use photo colors
  else if (photoColors) {
    console.log("📸 Only photo available - using photo colors");
    unified.primary = photoDominantColors[0] || photoColors.primary || unified.primary;
    unified.secondary = photoDominantColors[1] || photoColors.secondary || unified.secondary;
    unified.accent = photoDominantColors[2] || photoColors.accent || unified.accent;
    unified.background = photoColors.background || unified.background;
    unified.dominantColors = photoDominantColors.slice(0, 4);
  }

  // Remove duplicates from dominantColors
  unified.dominantColors = [...new Set(unified.dominantColors)].filter(Boolean);
  
  console.log("🎨 Final unified palette (4 colors distributed):");
  console.log("  ראשי (primary):", unified.primary);
  console.log("  משני (secondary):", unified.secondary);  
  console.log("  הדגשה (accent):", unified.accent);
  console.log("  רקע (background):", unified.background);
  console.log("  dominantColors:", unified.dominantColors);
  
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