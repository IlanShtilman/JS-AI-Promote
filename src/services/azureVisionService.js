import axios from 'axios';

// Use our backend service instead of direct Azure API
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
        'Content-Type': 'text/plain'
      }
    });

    console.log('Backend Vision API response received:', backendResponse.data);
    return backendResponse.data;
  } catch (error) {
    console.error('Backend Vision analysis failed:', error);
    
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data));
      console.error('Response status:', error.response.status);
    }
    
    // Fallback to mock if anything fails
    console.log('Falling back to mock implementation...');
    return mockAnalyzeImage(imageInput);
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