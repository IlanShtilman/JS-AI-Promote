import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

export const generateFlyerDesign = async (formData) => {
  try {
    console.log('Sending flyer data to backend:', formData);
    const response = await axios.post(`${API_BASE_URL}/flier/generate`, formData);
    console.log('Received flyer design from backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error generating flyer design:', error);
    throw error;
  }
}; 