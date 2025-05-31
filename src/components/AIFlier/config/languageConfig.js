// Language Configuration for Multi-language Flier Support
// This file contains all language-specific configurations including layout, content, and typography

export const SUPPORTED_LANGUAGES = {
  he: { 
    code: 'he', 
    name: 'Hebrew', 
    flag: '🇮🇱',
    direction: 'rtl',
    align: 'right'
  },
  en: { 
    code: 'en', 
    name: 'English', 
    flag: '🇺🇸',
    direction: 'ltr',
    align: 'left'
  },
  ru: { 
    code: 'ru', 
    name: 'Russian', 
    flag: '🇷🇺',
    direction: 'ltr',
    align: 'left'
  },
  zh: { 
    code: 'zh', 
    name: 'Chinese', 
    flag: '🇨🇳',
    direction: 'ltr',
    align: 'left'
  }
};

// Language-specific UI templates (structural elements only)
export const LANGUAGE_CONTENT = {
  he: {
    qrInstructions: 'סרוק את הקוד\nמלא את הטופס\nקבל את ההנחה',
    appName: 'MyBenefitz',
    appDescription: 'באפליקציה השכונתית',
    appTagline: 'תומכת בעסקים הקטנים השכונתיים'
  },
  en: {
    qrInstructions: 'Scan the QR code\nFill in the form\nGet the discount',
    appName: 'MyBenefitz',
    appDescription: 'In the neighborhood app',
    appTagline: 'Supporting local small businesses'
  },
  ru: {
    qrInstructions: 'Отсканируйте QR код\nЗаполните форму\nПолучите скидку',
    appName: 'MyBenefitz',
    appDescription: 'В районном приложении',
    appTagline: 'Поддерживаем местный малый бизнес'
  },
  zh: {
    qrInstructions: '扫描二维码\n填写表格\n获得折扣',
    appName: 'MyBenefitz',
    appDescription: '在社区应用中',
    appTagline: '支持当地小企业'
  }
};

// Comprehensive layout configuration for flier elements
export const FLIER_LAYOUT_CONFIG = {
  he: {
    // Main grid configuration
    mainGrid: {
      gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' },
      gridTemplateRows: 'auto 1fr auto auto',
      direction: 'rtl'
    },
    
    // Logo positioning
    logo: {
      position: { top: 15, left: 30 },
      justifyContent: 'flex-start',
      maxHeight: 100,
      maxWidth: 200
    },
    
    // Phone image configuration (Hebrew: right side of grid, bigger and moved right and up)
    phone: {
      gridColumn: '2',
      gridRow: '1 / span 3',
      position: 'right',
      transform: 'translateX(40px) translateY(-35px) rotate(-12deg) scale(1.8)',
      width: '135%',
      maxWidth: '620px'
    },
    
    // Left content column (Hebrew: main content on right side of grid)
    contentColumn: {
      gridColumn: '1',
      gridRow: '1 / span 3',
      alignItems: 'flex-start',
      textAlign: 'right',
      padding: { pr: { xs: 2, md: 3 }, pl: { xs: 2, md: 1 } },
      innerBox: {
        alignItems: 'flex-end'
      }
    },
    
    // MyBenefitz section
    myBenefitz: {
      textAlign: 'right',
      width: '100%'
    },
    
    // QR Code positioning  
    qrCode: {
      gridColumn: '1',
      gridRow: '3',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      margin: { mt: 2, mb: 1, ml: 2 }
    },
    
    // Flier photo positioning (Hebrew: LEFT side, aligned with QR Code level)
    flierPhoto: {
      position: { left: 50, bottom: '8%' },
      maxWidth: 280,
      maxHeight: 280
    }
  },
  
  en: {
    // Main grid configuration (mirrored for LTR)
    mainGrid: {
      gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' },
      gridTemplateRows: 'auto 1fr auto auto',
      direction: 'ltr'
    },
    
    // Logo positioning (top right for English)
    logo: {
      position: { top: 15, right: 30 },
      justifyContent: 'flex-end',
      maxHeight: 100,
      maxWidth: 200
    },
    
    // Phone image configuration (RIGHT side for English, rotated LEFT, moved further left and up)
    phone: {
      gridColumn: '2',
      gridRow: '1 / span 3',
      position: 'right',
      transform: 'translateX(-25px) translateY(-20px) rotate(12deg) scale(1.7)',
      width: '130%',
      maxWidth: '600px'
    },
    
    // LEFT content column (English: main content on left side of grid)
    contentColumn: {
      gridColumn: '1',
      gridRow: '1 / span 3',
      alignItems: 'flex-start',
      textAlign: 'left',
      padding: { pr: { xs: 2, md: 3 }, pl: { xs: 2, md: 1 } },
      innerBox: {
        alignItems: 'flex-start'
      }
    },
    
    // MyBenefitz section
    myBenefitz: {
      textAlign: 'left',
      width: '100%'
    },
    
    // QR Code positioning (RIGHT side)
    qrCode: {
      gridColumn: '2',
      gridRow: '3',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      margin: { mt: 2, mb: 1, mr: 2 }
    },
    
    // Flier photo positioning (left side for English, moved further down)
    flierPhoto: {
      position: { left: 50, bottom: '5%' },
      maxWidth: 280,
      maxHeight: 280
    }
  },
  
  ru: {
    // Russian follows English layout (LTR)
    mainGrid: {
      gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' },
      gridTemplateRows: 'auto 1fr auto auto',
      direction: 'ltr'
    },
    
    logo: {
      position: { top: 15, right: 30 },
      justifyContent: 'flex-end',
      maxHeight: 100,
      maxWidth: 200
    },
    
    phone: {
      gridColumn: '2',
      gridRow: '1 / span 3',
      position: 'right',
      transform: 'translateX(15px) rotate(12deg) scale(1.7)',
      width: '130%',
      maxWidth: '600px'
    },
    
    contentColumn: {
      gridColumn: '1',
      gridRow: '1 / span 3',
      alignItems: 'flex-start',
      textAlign: 'left',
      padding: { pr: { xs: 2, md: 3 }, pl: { xs: 2, md: 1 } },
      innerBox: {
        alignItems: 'flex-start'
      }
    },
    
    myBenefitz: {
      textAlign: 'left',
      width: '100%'
    },
    
    qrCode: {
      gridColumn: '1',
      gridRow: '3',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      margin: { mt: 2, mb: 1, ml: 2 }
    },
    
    flierPhoto: {
      position: { left: 50, bottom: '15%' },
      maxWidth: 280,
      maxHeight: 280
    }
  },
  
  zh: {
    // Chinese follows English layout (LTR)
    mainGrid: {
      gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' },
      gridTemplateRows: 'auto 1fr auto auto',
      direction: 'ltr'
    },
    
    logo: {
      position: { top: 15, right: 30 },
      justifyContent: 'flex-end',
      maxHeight: 100,
      maxWidth: 200
    },
    
    phone: {
      gridColumn: '2',
      gridRow: '1 / span 3',
      position: 'right',
      transform: 'translateX(15px) rotate(12deg) scale(1.7)',
      width: '130%',
      maxWidth: '600px'
    },
    
    contentColumn: {
      gridColumn: '1',
      gridRow: '1 / span 3',
      alignItems: 'flex-start',
      textAlign: 'left',
      padding: { pr: { xs: 2, md: 3 }, pl: { xs: 2, md: 1 } },
      innerBox: {
        alignItems: 'flex-start'
      }
    },
    
    myBenefitz: {
      textAlign: 'left',
      width: '100%'
    },
    
    qrCode: {
      gridColumn: '1',
      gridRow: '3',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      margin: { mt: 2, mb: 1, ml: 2 }
    },
    
    flierPhoto: {
      position: { left: 50, bottom: '15%' },
      maxWidth: 280,
      maxHeight: 280
    }
  }
};

// Layout configuration for each language (keeping the existing simple version for backward compatibility)
export const LANGUAGE_LAYOUTS = {
  he: {
    direction: 'rtl',
    textAlign: 'right',
    gridColumns: '1.5fr 1fr',
    phonePosition: 'right',
    logoPosition: 'left',
    qrPosition: 'left'
  },
  en: {
    direction: 'ltr',
    textAlign: 'left',
    gridColumns: '1fr 1.5fr',
    phonePosition: 'left',
    logoPosition: 'right',
    qrPosition: 'right'
  },
  ru: {
    direction: 'ltr',
    textAlign: 'left',
    gridColumns: '1fr 1.5fr',
    phonePosition: 'left',
    logoPosition: 'right',
    qrPosition: 'right'
  },
  zh: {
    direction: 'ltr',
    textAlign: 'left',
    gridColumns: '1fr 1.5fr',
    phonePosition: 'left',
    logoPosition: 'right',
    qrPosition: 'right'
  }
};

// Language-specific typography preferences
export const LANGUAGE_TYPOGRAPHY = {
  he: {
    primaryFont: ['Segoe UI', 'Tahoma', 'Arial', 'sans-serif'],
    titleWeight: 700,
    bodyWeight: 400,
    lineHeight: 1.4,
    letterSpacing: 'normal'
  },
  en: {
    primaryFont: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
    titleWeight: 800,
    bodyWeight: 400,
    lineHeight: 1.3,
    letterSpacing: '-0.02em'
  },
  ru: {
    primaryFont: ['Roboto', 'DejaVu Sans', 'Arial', 'sans-serif'],
    titleWeight: 700,
    bodyWeight: 400,
    lineHeight: 1.3,
    letterSpacing: 'normal'
  },
  zh: {
    primaryFont: ['Noto Sans CJK SC', 'PingFang SC', 'SimHei', 'sans-serif'],
    titleWeight: 600,
    bodyWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.05em'
  }
};

// Helper functions
export const getLanguageConfig = (languageCode) => {
  const language = SUPPORTED_LANGUAGES[languageCode] || SUPPORTED_LANGUAGES.he;
  const content = LANGUAGE_CONTENT[languageCode] || LANGUAGE_CONTENT.he;
  const layout = LANGUAGE_LAYOUTS[languageCode] || LANGUAGE_LAYOUTS.he;
  const typography = LANGUAGE_TYPOGRAPHY[languageCode] || LANGUAGE_TYPOGRAPHY.he;
  const flierLayout = FLIER_LAYOUT_CONFIG[languageCode] || FLIER_LAYOUT_CONFIG.he;
  
  return {
    language,
    content,
    layout,
    typography,
    flierLayout
  };
};

export const detectLanguageFromText = (text) => {
  if (!text) return 'he'; // Default to Hebrew
  
  // Hebrew detection
  if (/[\u0590-\u05FF]/.test(text)) return 'he';
  
  // Chinese detection
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
  
  // Russian detection  
  if (/[\u0400-\u04FF]/.test(text)) return 'ru';
  
  // Default to English
  return 'en';
};

const languageConfigExports = {
  SUPPORTED_LANGUAGES,
  LANGUAGE_CONTENT,
  LANGUAGE_LAYOUTS,
  LANGUAGE_TYPOGRAPHY,
  FLIER_LAYOUT_CONFIG,
  getLanguageConfig,
  detectLanguageFromText
};

export default languageConfigExports; 