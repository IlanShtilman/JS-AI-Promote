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
    return backendResponse.data;
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
    
    // Instead of falling back to mock, throw the error
    throw new Error('Failed to analyze image with Azure Vision API. Check server logs for details.');
  }
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