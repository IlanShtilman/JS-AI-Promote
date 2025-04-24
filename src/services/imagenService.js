import axios from 'axios';

// Get API key from environment variable
const IMAGEN_API_KEY = process.env.REACT_APP_IMAGEN_API_KEY || '';

// Debug log for API key
console.log('Imagen API key status:', IMAGEN_API_KEY ? 'Present' : 'Missing');

if (!IMAGEN_API_KEY) {
  console.error('Imagen API key is missing. Please check your .env file and make sure REACT_APP_IMAGEN_API_KEY is set.');
}

export const generateImage = async (prompt) => {
  try {
    if (!IMAGEN_API_KEY) {
      throw new Error('REACT_APP_IMAGEN_API_KEY is not configured');
    }

    console.log('Using Imagen API with prompt:', prompt); // Debug log

    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('style', 'realistic');
    formData.append('aspect_ratio', '1:1');

    const response = await axios.post(
      'https://api.vyro.ai/v2/image/generations',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${IMAGEN_API_KEY}`,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    // Log response headers for debugging
    console.log('Imagen API response headers:', response.headers);

    // Convert binary data to blob and create URL
    const blob = new Blob([response.data], { type: 'image/jpeg' });
    const imageUrl = URL.createObjectURL(blob);
    return imageUrl;
  } catch (error) {
    // Enhanced error logging
    console.error('Error generating image:', {
      error,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      headers: error?.response?.headers,
      data: error?.response?.data
    });

    if (error?.response?.status === 401) {
      throw new Error('Unauthorized: Invalid API key. Please check your REACT_APP_IMAGEN_API_KEY configuration.');
    }

    throw new Error(`Failed to generate image: ${error.message}`);
  }
}; 