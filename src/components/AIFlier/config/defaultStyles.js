// Default Style Options
// Provides variety when no AI backgrounds are available

export const DEFAULT_STYLE_OPTIONS = [
  {
    // Style 1: Professional Clean
    name: "Professional Clean",
    styleName: "Professional Clean",
    backgroundColor: '#ffffff',
    backgroundImage: 'none',
    backgroundCSS: '#ffffff',
    textColor: '#333333',
    accentColor: '#1976d2',
    fontFamily: 'Roboto, sans-serif',
    fontSize: 2.8,
    bodyFontSize: 1.3,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    textAlign: 'right',
    titleWeight: 800,
    bodyWeight: 400,
    pattern: 'none',
    description: 'Clean professional style with high readability',
    source: 'default'
  },
  {
    // Style 2: Elegant Sophisticated  
    name: "Elegant Sophisticated",
    styleName: "Elegant Sophisticated",
    backgroundColor: '#f8f9fa',
    backgroundImage: 'none',
    backgroundCSS: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    textColor: '#2c2c2c',
    accentColor: '#8b4513',
    fontFamily: 'Georgia, serif',
    fontSize: 2.6,
    bodyFontSize: 1.2,
    letterSpacing: '0.01em',
    lineHeight: 1.2,
    textAlign: 'center',
    titleWeight: 700,
    bodyWeight: 400,
    pattern: 'none',
    description: 'Elegant serif style with sophisticated appeal',
    source: 'default'
  },
  {
    // Style 3: Bold Modern
    name: "Bold Modern",
    styleName: "Bold Modern", 
    backgroundColor: '#1976d2',
    backgroundImage: 'none',
    backgroundCSS: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    textColor: '#ffffff',
    accentColor: '#ff6b35',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 3.0,
    bodyFontSize: 1.4,
    letterSpacing: '-0.03em',
    lineHeight: 1.0,
    textAlign: 'right',
    titleWeight: 900,
    bodyWeight: 600,
    pattern: 'none',
    description: 'Bold energetic style with high impact',
    source: 'default'
  },
  {
    // Style 4: Warm Natural
    name: "Warm Natural",
    styleName: "Warm Natural",
    backgroundColor: '#fef7e7',
    backgroundImage: 'none',
    backgroundCSS: 'linear-gradient(135deg, #fef7e7 0%, #f6e6a4 100%)',
    textColor: '#8b5a00',
    accentColor: '#d4af37',
    fontFamily: 'Georgia, serif',
    fontSize: 2.7,
    bodyFontSize: 1.25,
    letterSpacing: '0.01em',
    lineHeight: 1.3,
    textAlign: 'right',
    titleWeight: 700,
    bodyWeight: 400,
    pattern: 'none',
    description: 'Warm, organic feel perfect for food businesses',
    source: 'default'
  },
  {
    // Style 5: Tech Minimal
    name: "Tech Minimal",
    styleName: "Tech Minimal",
    backgroundColor: '#f5f5f5',
    backgroundImage: 'none',
    backgroundCSS: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
    textColor: '#1a1a1a',
    accentColor: '#00d4aa',
    fontFamily: 'Roboto, sans-serif',
    fontSize: 2.8,
    bodyFontSize: 1.3,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    textAlign: 'left',
    titleWeight: 600,
    bodyWeight: 300,
    pattern: 'none',
    description: 'Minimalist tech-inspired design',
    source: 'default'
  }
];

// Create language-aware versions of default styles
export const getLanguageAwareDefaultStyles = (languageCode = 'he') => {
  return DEFAULT_STYLE_OPTIONS.map(style => ({
    ...style,
    textAlign: languageCode === 'he' ? 'right' : 
                style.name === 'Elegant Sophisticated' ? 'center' : 'left'
  }));
};

// Get default styles for specific business types
export const getDefaultStylesForBusiness = (businessType) => {
  const businessStyleMap = {
    restaurant: [0, 3], // Professional Clean, Warm Natural
    cafe: [1, 3], // Elegant Sophisticated, Warm Natural  
    tech: [4, 0], // Tech Minimal, Professional Clean
    retail: [2, 0], // Bold Modern, Professional Clean
    corporate: [0, 1], // Professional Clean, Elegant Sophisticated
    creative: [2, 1], // Bold Modern, Elegant Sophisticated
    healthcare: [0, 4], // Professional Clean, Tech Minimal
    education: [1, 0], // Elegant Sophisticated, Professional Clean
    default: [0, 1, 2] // Professional Clean, Elegant, Bold Modern
  };
  
  const indices = businessStyleMap[businessType] || businessStyleMap.default;
  return indices.map(index => DEFAULT_STYLE_OPTIONS[index]);
};

// Get all default styles
export const getAllDefaultStyles = () => {
  return [...DEFAULT_STYLE_OPTIONS];
};

// Get random default styles (for variety)
export const getRandomDefaultStyles = (count = 3) => {
  const shuffled = [...DEFAULT_STYLE_OPTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const defaultStylesConfig = {
  DEFAULT_STYLE_OPTIONS,
  getDefaultStylesForBusiness,
  getAllDefaultStyles,
  getRandomDefaultStyles,
  getLanguageAwareDefaultStyles
};

export default defaultStylesConfig; 