import AIInfoCollectionConfig from './AIInfoCollectionConfig';

/**
 * Assembles summary information from form data and extra data
 * @param {Object} formData - Form data from AIInfoCollection component
 * @param {Object} extraData - Extra data passed from parent component
 * @returns {Object} Complete summary information object
 */
export function assembleSummaryInfo(formData, extraData = {}) {
  // Debug what's coming in from App.js
  console.log("assembleSummaryInfo received:", { formData, extraData });

  // Extract values with safer fallbacks using configuration defaults
  const { logo = null, title = '', selectedText = {} } = extraData || {};
  
  return {
    // Basic Information
    logo,
    title: title || '',
    promotionalText: selectedText?.text || '',
    
    // Business Configuration
    targetAudience: formData.targetAudience || AIInfoCollectionConfig.defaultFormData.targetAudience,
    businessType: formData.businessType || AIInfoCollectionConfig.defaultFormData.businessType,
    
    // Design Configuration
    stylePreference: formData.stylePreference || AIInfoCollectionConfig.defaultFormData.stylePreference,
    colorScheme: formData.colorScheme || AIInfoCollectionConfig.defaultFormData.colorScheme,
    
    // Image Configuration
    imagePreference: formData.imagePreference || AIInfoCollectionConfig.defaultFormData.imagePreference,
    uploadedImage: formData.uploadedImage || null,
    uploadType: formData.uploadType || AIInfoCollectionConfig.defaultFormData.uploadType,
    
    // Layout Configuration
    flierSize: formData.flierSize || AIInfoCollectionConfig.defaultFormData.flierSize,
    orientation: formData.orientation || AIInfoCollectionConfig.defaultFormData.orientation,
    
    // Analysis Results
    sceneType: formData.sceneType || '',
    description: formData.description || '',
    detectedObjects: formData.detectedObjects || [],
    colors: formData.colors || generateDefaultColors(formData.colorScheme || AIInfoCollectionConfig.defaultFormData.colorScheme),
    
    // Azure Analysis Results
    logoAnalysis: formData.logoAnalysis || null,
    photoAnalysis: formData.photoAnalysis || null,
    hasLogoAnalysis: formData.hasLogoAnalysis || false,
    hasPhotoAnalysis: formData.hasPhotoAnalysis || false,
    
    // Metadata
    createdAt: new Date().toISOString(),
    version: '1.0'
  };
}

/**
 * Generates default colors based on the selected color scheme
 * @param {string} colorScheme - The selected color scheme
 * @returns {Object} Color configuration object
 */
export function generateDefaultColors(colorScheme) {
  const colorMappings = AIInfoCollectionConfig.colorMappings;
  
  // Return mapped colors or fallback to warm colors
  return colorMappings[colorScheme] || colorMappings.warm;
}

/**
 * Validates form data against configuration rules
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result with errors
 */
export function validateFormData(formData) {
  const errors = {};
  const config = AIInfoCollectionConfig.validation;
  
  // Check required fields
  config.required.forEach(field => {
    if (!formData[field] || !formData[field].toString().trim()) {
      errors[field] = true;
    }
  });
  
  // Check conditional required fields
  Object.entries(config.conditionalRequired).forEach(([key, rule]) => {
    if (rule.condition(formData) && !formData[rule.field]) {
      errors[key] = true;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Gets text content for UI based on language
 * @param {string} language - Selected language
 * @returns {Object} Text content object
 */
export function getUIText(language = 'hebrew') {
  const langKey = language.toLowerCase() === 'english' ? 'english' : 'hebrew';
  return AIInfoCollectionConfig.text[langKey] || AIInfoCollectionConfig.text.hebrew;
} 