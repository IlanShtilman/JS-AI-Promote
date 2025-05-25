// Smart Text Positioning System
// Analyzes background and determines optimal text window placement

export const analyzeBackgroundComplexity = (backgroundCSS) => {
  // Simple heuristics to determine background complexity
  const complexity = {
    hasGradient: backgroundCSS.includes('gradient'),
    hasMultipleColors: (backgroundCSS.match(/#[0-9a-fA-F]{6}/g) || []).length > 2,
    hasPatterns: backgroundCSS.includes('radial') || backgroundCSS.includes('conic'),
    hasImages: backgroundCSS.includes('url(') || backgroundCSS.includes('image'),
    complexity: 'medium'
  };
  
  // Calculate complexity score
  let score = 0;
  if (complexity.hasGradient) score += 1;
  if (complexity.hasMultipleColors) score += 2;
  if (complexity.hasPatterns) score += 2;
  if (complexity.hasImages) score += 3;
  
  if (score <= 2) complexity.complexity = 'low';
  else if (score <= 5) complexity.complexity = 'medium';
  else complexity.complexity = 'high';
  
  return complexity;
};

export const getOptimalTextPositions = (backgroundComplexity, textElements) => {
  const positions = [];
  
  // Define safe zones based on complexity
  const safeZones = {
    low: ['center', 'center-right', 'top-right', 'bottom-center'],
    medium: ['center-right', 'top-right', 'bottom-center'],
    high: ['center-right', 'top-right'] // Stick to edges for complex backgrounds
  };
  
  const availableZones = safeZones[backgroundComplexity.complexity];
  
  textElements.forEach((element, index) => {
    const position = availableZones[index % availableZones.length];
    
    positions.push({
      ...element,
      position,
      style: getTextWindowStyle(backgroundComplexity, position),
      backgroundColor: getOptimalBackgroundColor(backgroundComplexity),
      animation: getOptimalAnimation(index)
    });
  });
  
  return positions;
};

const getTextWindowStyle = (complexity, position) => {
  switch (complexity.complexity) {
    case 'high':
      return 'glass'; // Glass morphism for complex backgrounds
    case 'medium':
      return 'rounded'; // Standard rounded for medium complexity
    case 'low':
      return 'minimal'; // Simple style for low complexity
    default:
      return 'rounded';
  }
};

const getOptimalBackgroundColor = (complexity) => {
  switch (complexity.complexity) {
    case 'high':
      return 'rgba(255,255,255,0.98)'; // Almost opaque for complex backgrounds
    case 'medium':
      return 'rgba(255,255,255,0.95)'; // Semi-transparent for medium
    case 'low':
      return 'rgba(255,255,255,0.90)'; // More transparent for simple backgrounds
    default:
      return 'rgba(255,255,255,0.95)';
  }
};

const getOptimalAnimation = (index) => {
  const animations = ['slide', 'fadeIn', 'pulse', 'floating'];
  return animations[index % animations.length];
};

// Preset configurations for different flyer types
export const getFlierTextLayout = (flierType, businessType) => {
  const layouts = {
    promotional: {
      title: { priority: 1, size: 'large', weight: 'bold' },
      subtitle: { priority: 2, size: 'medium', weight: 'normal' },
      cta: { priority: 3, size: 'medium', weight: 'bold' },
      details: { priority: 4, size: 'small', weight: 'normal' }
    },
    informational: {
      title: { priority: 1, size: 'large', weight: 'bold' },
      content: { priority: 2, size: 'medium', weight: 'normal' },
      contact: { priority: 3, size: 'small', weight: 'normal' }
    },
    event: {
      title: { priority: 1, size: 'large', weight: 'bold' },
      date: { priority: 2, size: 'medium', weight: 'bold' },
      location: { priority: 3, size: 'medium', weight: 'normal' },
      details: { priority: 4, size: 'small', weight: 'normal' }
    }
  };
  
  return layouts[flierType] || layouts.promotional;
};

// Dynamic text sizing based on content and screen size
export const calculateOptimalTextSize = (text, containerWidth, priority = 1) => {
  const baseSize = Math.max(containerWidth * 0.03, 14); // Minimum 14px
  const priorityMultiplier = {
    1: 1.5, // Title
    2: 1.2, // Subtitle
    3: 1.0, // Body
    4: 0.8  // Details
  };
  
  return Math.round(baseSize * (priorityMultiplier[priority] || 1));
};

// Smart text wrapping and line breaks
export const optimizeTextForDisplay = (text, maxWidth, fontSize) => {
  const wordsPerLine = Math.floor(maxWidth / (fontSize * 0.6)); // Rough estimate
  const words = text.split(' ');
  const lines = [];
  
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(' '));
  }
  
  return lines.join('\n');
}; 