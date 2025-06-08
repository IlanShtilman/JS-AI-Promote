// Background Parameters Generator
// Generates intelligent parameters for AI background generation based on user choices and Azure analysis

/**
 * Generate background generation parameters based on user choices and Azure colors
 * @param {Object} flierData - User choices and Azure analysis
 * @returns {Object} Parameters for AI background generation
 */
export function generateBackgroundParameters(flierData) {
  console.log("🎨 Background Parameters Generator: Processing flier data for background generation");
  
  const params = {
    // Core user choices
    businessType: flierData.businessType || 'general',
    targetAudience: flierData.targetAudience || 'general', 
    colorScheme: flierData.colorScheme || 'neutral',
    stylePreference: flierData.stylePreference || 'modern',
    
    // Azure analyzed colors (prioritized)
    azureColors: {
      logo: flierData.logoAnalysis?.colors || null,
      photo: flierData.photoAnalysis?.colors || null,
      unified: flierData.colors || null
    },
    
    // Generated parameters for AI
    moodKeywords: [],
    colorPalette: {},
    backgroundStyle: '',
    contrastRequirements: '',
    
    // Generation settings
    generateMultiple: 3, // Always generate 3 options
    includePatterns: true,
    ensureContrast: true
  };
  
  // Apply business type rules
  params.moodKeywords.push(...getBusinessMoodKeywords(params.businessType));
  
  // Apply audience rules  
  params.moodKeywords.push(...getAudienceMoodKeywords(params.targetAudience));
  
  // Apply color scheme rules
  const colorRules = getColorSchemeRules(params.colorScheme);
  params.moodKeywords.push(...colorRules.mood);
  params.backgroundStyle = colorRules.style;
  
  // Generate intelligent color palette (prioritize Azure colors)
  params.colorPalette = generateIntelligentPalette(flierData);
  
  // Set contrast requirements
  params.contrastRequirements = generateContrastRequirements(params.colorPalette);
  
  console.log("✅ Generated background parameters:", params);
  return params;
}

/**
 * Get mood keywords based on business type
 */
function getBusinessMoodKeywords(businessType) {
  const businessMoods = {
    cafe: ['cozy', 'warm', 'inviting', 'casual', 'artisanal'],
    restaurant: ['appetizing', 'elegant', 'savory', 'welcoming', 'sophisticated'],
    retail: ['trendy', 'vibrant', 'accessible', 'modern', 'appealing'],
    office: ['professional', 'clean', 'corporate', 'reliable', 'efficient'],
    healthcare: ['calming', 'trustworthy', 'clean', 'healing', 'gentle'],
    education: ['inspiring', 'bright', 'encouraging', 'youthful', 'engaging'],
    entertainment: ['exciting', 'dynamic', 'fun', 'energetic', 'bold'],
    beauty: ['elegant', 'luxurious', 'soft', 'radiant', 'sophisticated'],
    fitness: ['energetic', 'strong', 'motivating', 'dynamic', 'powerful'],
    general: ['balanced', 'versatile', 'appealing', 'professional', 'clean']
  };
  
  return businessMoods[businessType] || businessMoods.general;
}

/**
 * Get mood keywords based on target audience
 */
function getAudienceMoodKeywords(targetAudience) {
  const audienceMoods = {
    families: ['friendly', 'safe', 'welcoming', 'comfortable', 'inclusive'],
    young_adults: ['trendy', 'modern', 'energetic', 'social', 'vibrant'],
    professionals: ['sleek', 'sophisticated', 'efficient', 'premium', 'polished'],
    seniors: ['elegant', 'comfortable', 'trustworthy', 'classic', 'refined'],
    students: ['affordable', 'youthful', 'creative', 'accessible', 'inspiring'],
    children: ['playful', 'colorful', 'fun', 'safe', 'imaginative'],
    tourists: ['exciting', 'memorable', 'authentic', 'welcoming', 'distinctive'],
    locals: ['familiar', 'community', 'trusted', 'accessible', 'neighborly'],
    general: ['appealing', 'inclusive', 'accessible', 'balanced', 'welcoming']
  };
  
  return audienceMoods[targetAudience] || audienceMoods.general;
}

/**
 * Get color scheme rules
 */
function getColorSchemeRules(colorScheme) {
  const schemeRules = {
    warm: {
      mood: ['cozy', 'inviting', 'energetic'],
      style: 'warm gradients with earth tones'
    },
    cool: {
      mood: ['calm', 'professional', 'modern'],
      style: 'cool gradients with blue and teal tones'
    },
    neutral: {
      mood: ['balanced', 'sophisticated', 'timeless'],
      style: 'neutral gradients with gray and beige tones'
    },
    vibrant: {
      mood: ['bold', 'exciting', 'dynamic'],
      style: 'vibrant gradients with bright colors'
    }
  };
  
  return schemeRules[colorScheme] || schemeRules.neutral;
}

/**
 * Generate intelligent color palette prioritizing Azure colors
 */
function generateIntelligentPalette(flierData) {
  const palette = {
    primary: '#2196F3',
    secondary: '#FF9800', 
    accent: '#4CAF50',
    background: '#FFFFFF',
    textDark: '#333333',
    textLight: '#FFFFFF'
  };
  
  // Prioritize Azure unified colors if available
  if (flierData.colors) {
    palette.primary = flierData.colors.primary || palette.primary;
    palette.secondary = flierData.colors.secondary || palette.secondary;
    palette.accent = flierData.colors.accent || palette.accent;
    palette.background = flierData.colors.background || palette.background;
  }
  
  // Fallback to logo colors if unified colors not available
  else if (flierData.logoAnalysis?.colors) {
    const logoColors = flierData.logoAnalysis.colors;
    palette.primary = logoColors.primary || palette.primary;
    palette.secondary = logoColors.secondary || palette.secondary;
    palette.accent = logoColors.accent || palette.accent;
  }
  
  // Fallback to photo colors if logo colors not available
  else if (flierData.photoAnalysis?.colors) {
    const photoColors = flierData.photoAnalysis.colors;
    palette.primary = photoColors.primary || palette.primary;
    palette.secondary = photoColors.secondary || palette.secondary;
    palette.accent = photoColors.accent || palette.accent;
  }
  
  return palette;
}

/**
 * Generate contrast requirements for text readability
 */
function generateContrastRequirements(colorPalette) {
  // Calculate approximate brightness of background
  const bgColor = colorPalette.background || '#FFFFFF';
  const isLightBackground = isLightColor(bgColor);
  
  return {
    textColor: isLightBackground ? colorPalette.textDark : colorPalette.textLight,
    minContrastRatio: 4.5, // WCAG AA standard
    ensureReadability: true,
    backgroundType: isLightBackground ? 'light' : 'dark'
  };
}

/**
 * Simple light/dark color detection
 */
function isLightColor(color) {
  // Convert hex to RGB and calculate brightness
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
} 