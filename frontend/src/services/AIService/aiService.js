import { convertToStyleOptions, getFallbackStyleConfig } from './flier/styleConfigService';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081';

// Unified function to handle AI service calls
const callAIService = async (endpoint, title, promotionalText, language) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/${endpoint}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: language === 'Hebrew'
          ? `כתוב טקסט פרסומי ושיווקי קצר בשתי שורות עבור: ${promotionalText || title}`
          : `Write a short promotional text in two lines for: ${promotionalText || title}`,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.generatedText;
  } catch (error) {
    console.error(`${endpoint} Error:`, error);
    throw error;
  }
};

// Helper function to handle service-specific errors
const handleServiceError = (error, serviceName, isHebrew) => {
  console.error(`${serviceName} Error:`, error);
  if (error.message.includes('429') || error.message.includes('rate limit')) {
    return isHebrew 
      ? `חריגה ממגבלת קריאות ${serviceName} - נסה שוב מאוחר יותר` 
      : `${serviceName} rate limit exceeded - try again later`;
  }
  return isHebrew 
    ? `שגיאה בקבלת תוצאות מ-${serviceName}` 
    : `Error getting results from ${serviceName}`;
};

export const generateWithOpenAI = (title, promotionalText, language) => 
  callAIService('openai', title, promotionalText, language);

export const generateWithClaude = (title, promotionalText, language) => 
  callAIService('claude', title, promotionalText, language);

export const generateWithGroq = (title, promotionalText, language) => 
  callAIService('groq', title, promotionalText, language);

export const generateWithGemini = (title, promotionalText, language) => 
  callAIService('gemini', title, promotionalText, language);

// Helper function to clean and validate text
const cleanAndValidateText = (text, isHebrew) => {
  // Don't process error messages
  if (text.includes('rate limit') || text.includes('שגיאה') || text.includes('Error')) {
    return text;
  }
  
  // Remove any prefixes like "Here's your text:" or similar
  text = text.replace(/^[^א-ת\w]*|^.*?:/g, '').trim();
  
  // Split into lines and filter out empty ones
  const lines = text.split('\n').filter(line => line.trim());
  
  // If we have less than 2 lines, add a default second line
  if (lines.length < 2) {
    lines.push(isHebrew ? 'בואו לגלות עוד!' : 'Come discover more!');
  }
  
  // Take only the first two lines
  return lines.slice(0, 2).join('\n');
};

export const generateAllTexts = async (title, promotionalText, language) => {
  const results = {};
  const isHebrew = language === 'Hebrew';
  const services = ['openai', 'claude', 'groq', 'gemini'];

  try {
    // Generate texts for all services
    await Promise.all(services.map(async (service) => {
      try {
        const result = await callAIService(service, title, promotionalText, language);
        results[service] = cleanAndValidateText(result, isHebrew);
      } catch (error) {
        results[service] = handleServiceError(error, service, isHebrew);
      }
    }));

    return results;
  } catch (error) {
    console.error('Error generating texts:', error);
    throw error;
  }
};

/**
 * Get AI style advice for flier configuration
 * That function is used to get the style advice from the AI when imagen is failed + generateConfig
 * @param {Object} infoObject - Flier information and preferences
 * @returns {Promise<Object>} AI-generated style configuration
 */
export async function getAIStyleAdvice(infoObject) {
  try {
    console.log("Requesting AI style advice for flier:", infoObject);
    
    const response = await fetch(`${BACKEND_URL}/api/flier/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(infoObject)
    });
    
    if (!response.ok) {
      console.error("AI style advice API error status:", response.status);
      const errorText = await response.text();
      console.error("AI style advice API error response:", errorText);
      return null;
    }
    
    const text = await response.text();
    try {
      // Try to parse the response as JSON
      const jsonResponse = JSON.parse(text);
      console.log("Successfully received AI style advice");
      return jsonResponse;
    } catch (e) {
      console.error("JSON parse error in AI style advice:", e);
      console.error("Invalid JSON response:", text);
      return null;
    }
  } catch (error) {
    console.error("Network or other error during AI style advice:", error);
    return null;
  }
}

/**
 * Generate complete flier configuration using AI
 * @param {Object} infoObject - Flier information and preferences
 * @returns {Promise<Object>} Complete flier configuration
 */
export async function generateFlierConfig(infoObject) {
  try {
    console.log("Generating flier configuration with new simplified pipeline");
    
    // Use our new simplified backend endpoint
    const response = await getAIStyleAdvice(infoObject);
    
    if (response && response.success) {
      console.log("Successfully received flier configuration from simplified pipeline");
      
      // Convert background options to style options using the style service
      const aiStyleOptions = convertToStyleOptions(response.backgroundOptions);
      
      return {
        ...response,
        aiStyleOptions
      };
    } else {
      throw new Error("Failed to get response from simplified pipeline");
    }
  } catch (error) {
    console.error("Error in simplified flier generation:", error);
    
    // Use the style service for fallback configuration
    return getFallbackStyleConfig(infoObject);
  }
} 