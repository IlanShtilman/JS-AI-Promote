export function assembleSummaryInfo(formData, extraData = {}) {
  // Debug what's coming in from App.js
  console.log("assembleSummaryInfo received extraData:", extraData);

  // Extract values with safer fallbacks
  const { logo = null, title = '', selectedText = {} } = extraData || {};
  
  return {
    logo, // Keep the logo reference even if it's null for debugging
    title: title || '',
    promotionalText: selectedText?.text || '',
    targetAudience: formData.targetAudience,
    businessType: formData.businessType,
    stylePreference: formData.stylePreference,
    colorScheme: formData.colorScheme,
    imagePreference: formData.imagePreference,
    uploadedImage: formData.uploadedImage || null,
    uploadType: formData.uploadType,
    flierSize: formData.flierSize,
    orientation: formData.orientation,
    sceneType: formData.sceneType,
    description: formData.description,
    detectedObjects: formData.detectedObjects,
    colors: formData.colors,
    // Add the missing Azure analysis fields
    logoAnalysis: formData.logoAnalysis || null,
    photoAnalysis: formData.photoAnalysis || null,
    hasLogoAnalysis: formData.hasLogoAnalysis || false,
    hasPhotoAnalysis: formData.hasPhotoAnalysis || false
  };
} 