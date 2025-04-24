import axios from 'axios';

// Use the real Azure Vision API
export const analyzeImageWithAzure = async (imageUrl) => {
  try {
    // Use East Asia region endpoint
    const endpoint = "https://eastasia.api.cognitive.microsoft.com/vision/v3.1/analyze";
    const key = process.env.REACT_APP_AZURE_VISION_KEY || "CKsCc3zHgrzuu4PYEtsnVM3zH12maXVvnBqaMQCN9RwD59FY3TfGJQQJ99BDAC3pKaRXJ3w3AAAFACOGmcXY";
    
    console.log('Using endpoint:', endpoint);
    console.log('Using key:', key ? 'Key exists' : 'Key missing');

    // The parameters for Azure Vision API
    const params = {
      visualFeatures: 'Categories,Description,Color,Objects',
      details: 'Landmarks',
      language: 'en'
    };

    let response;

    if (imageUrl.startsWith('data:')) {
      // For base64 data URLs, convert to binary and send as octet-stream
      console.log('Processing base64 image data...');
      
      try {
        // Extract base64 data and convert to binary array
        const base64Data = imageUrl.split(',')[1];
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        console.log(`Converted base64 to binary: ${bytes.length} bytes`);
        
        // Send the binary data
        response = await axios.post(endpoint, bytes.buffer, {
          params,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': key
          }
        });
      } catch (err) {
        console.error('Error processing image data:', err);
        return mockAnalyzeImage(imageUrl);
      }
    } else {
      // For URLs, use the direct URL approach
      console.log('Sending URL to Vision API:', imageUrl);
      
      try {
        response = await axios.post(endpoint, { url: imageUrl }, {
          params,
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': key
          }
        });
      } catch (err) {
        console.error('Error sending URL to Vision API:', err);
        return mockAnalyzeImage(imageUrl);
      }
    }

    console.log('Vision API response received:', response.data);
    
    // Process the response
    const { categories, description, color, objects } = response.data;

    // Extract scene type from categories
    const sceneType = categories[0]?.name || 'unknown';
    
    // Extract objects
    const detectedObjects = objects.map(obj => obj.object);

    // Process colors
    const dominantColors = color.dominantColors;
    const semanticColors = {};
    
    // Map Azure's color analysis to our color scheme
    const colors = {
      primary: dominantColors[0] || '#2196F3',
      secondary: dominantColors[1] || '#21CBF3',
      accent: dominantColors[2] || '#FFA726',
      background: '#FFFFFF',
      semanticColors
    };

    // Determine atmosphere based on categories and colors
    const atmosphere = determineAtmosphere(categories, color);

    // Determine lighting conditions
    const lighting = determineLighting(color);

    // Get business type from categories
    const businessType = determineBusinessType(categories);

    return {
      sceneType,
      objects: detectedObjects,
      colors,
      atmosphere,
      lighting,
      description: description.captions[0]?.text || 'No description available',
      businessType
    };
  } catch (error) {
    console.error('Azure Vision analysis failed:', error);
    
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data));
      console.error('Response status:', error.response.status);
    }
    
    // Fallback to mock if anything fails
    console.log('Falling back to mock implementation...');
    return mockAnalyzeImage(imageUrl);
  }
};

// Mock implementation as a fallback
const mockAnalyzeImage = async (imageUrl) => {
  console.log('Using mock Azure Vision implementation');
  
  // Wait a moment to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate some random colors based on the image URL (repeatable hash)
  const hash = hashCode(imageUrl);
  const randomColorSeed = Math.abs(hash) % 360;
  
  // Create some mock data
  const mockResult = {
    sceneType: 'business',
    objects: ['chair', 'desk', 'computer', 'person'],
    colors: {
      primary: hslToHex(randomColorSeed, 70, 60),
      secondary: hslToHex((randomColorSeed + 30) % 360, 60, 70),
      accent: hslToHex((randomColorSeed + 180) % 360, 80, 50),
      background: '#FFFFFF',
      semanticColors: {}
    },
    atmosphere: 'professional and modern',
    lighting: 'bright natural',
    description: 'A modern business environment with professional layout',
    businessType: 'office'
  };

  console.log('Returning mock Azure Vision data:', mockResult);
  return mockResult;
};

// Helper function to generate a hash code from a string
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

// Helper function to convert HSL to Hex color
function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Functions for processing Azure Vision results
const determineAtmosphere = (categories, color) => {
  // Logic to determine atmosphere based on categories and colors
  const isWarm = color.dominantColors.some(c => 
    ['red', 'orange', 'yellow'].includes(c.toLowerCase())
  );
  
  const isProfessional = categories.some(cat => 
    ['building_office', 'building_corporate'].includes(cat.name)
  );

  if (isProfessional) return 'professional and modern';
  if (isWarm) return 'warm and inviting';
  return 'neutral and balanced';
};

const determineLighting = (color) => {
  const brightness = color.accentColor;
  if (brightness > 0.7) return 'bright natural';
  if (brightness > 0.4) return 'balanced artificial';
  return 'dim ambient';
};

const determineBusinessType = (categories) => {
  const businessTypes = {
    'building_restaurant': 'restaurant',
    'building_retail': 'retail',
    'building_office': 'office',
    'building_corporate': 'corporate',
    'building_hotel': 'hospitality',
    'building_medical': 'medical'
  };

  for (const category of categories) {
    if (businessTypes[category.name]) {
      return businessTypes[category.name];
    }
  }

  return 'general business';
}; 