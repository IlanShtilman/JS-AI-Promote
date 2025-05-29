// ManualFlierDesignerConfig.js
// Central configuration file for ManualFlierDesigner component
// Modify values here to customize the flier designer behavior

export const FLIER_DESIGNER_CONFIG = {
  // Font Options
  FONT_OPTIONS: [
    { value: 'Heebo', label: 'Heebo' },
    { value: 'Assistant', label: 'Assistant' },
    { value: 'Rubik', label: 'Rubik' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Roboto', label: 'Roboto' },
  ],

  // Default Values
  DEFAULTS: {
    title: '',
    text: '',
    backgroundColor: '#ffffff',
    titleColor: '#000000',
    textColor: '#000000',
    qrLink: '',
    borderRadius: 0,
    titleFont: 'Heebo',
    textFont: 'Heebo',
    titleSize: 40,
    textSize: 18,
    imagePosition: { x: 50, y: 50 },
    isBackgroundImage: false,
  },

  // Size Limits and Ranges
  LIMITS: {
    titleSize: {
      min: 20,
      max: 80,
      step: 1,
    },
    textSize: {
      min: 12,
      max: 40,
      step: 1,
    },
    borderRadius: {
      min: 0,
      max: 50,
      step: 1,
    },
    imagePosition: {
      min: 0,
      max: 100,
    },
  },

  // Canvas Settings
  CANVAS: {
    width: 600,
    height: 800,
    padding: 40,
  },

  // Image Settings
  IMAGE: {
    maxWidth: 300,
    maxHeight: 300,
    dragThreshold: 5, // minimum pixels to move before starting drag
    roundingFactor: 10, // round movement to nearest X pixels
    previewWidth: '100%',
    previewHeight: 250,
  },

  // Logo Settings
  LOGO: {
    width: 100,
    height: 100,
    position: {
      top: 20,
      right: 20, // or left for RTL
    },
  },

  // Phone Preview Settings
  PHONE_PREVIEW: {
    imagePath: '/assets/Phone-APP.png',
    position: {
      right: -180, // or left for RTL
      top: '50%',
    },
    rotation: {
      ltr: '15deg',
      rtl: '-15deg',
    },
    width: 600,
  },

  // QR Code Settings
  QR_CODE: {
    size: 120,
    position: {
      left: 40, // or right for RTL
      bottom: 80,
    },
    background: 'white',
    padding: 10,
    borderRadius: 8,
  },

  // Footer Settings
  FOOTER: {
    position: {
      bottom: 20,
      left: 0,
      right: 0,
    },
    brandName: 'myBenefitz',
    fontSize: '1em',
    fontFamily: 'Arial, sans-serif',
    brandColor: '#0b6bf2',
  },

  // Control Panel Settings
  CONTROLS: {
    imageControlsWidth: 350,
    flierControlsWidth: 300,
    stickyTop: 80,
    marginTop: 20,
    textareaHeight: 100,
  },

  // Icon Settings
  ICONS: {
    defaultSize: 24, // Default icon size in pixels
    buttonIconSize: 20, // Size for icons in buttons
    sizes: {
      small: 16,
      medium: 24,
      large: 32,
    },
    style: 'default', // Can be 'default', 'rounded', 'outline'
    color: 'currentColor', // Default icon color
  },

  // File Settings
  DOWNLOAD: {
    filename: 'mybenefitz-flier.png',
    format: 'image/png',
    scale: 2, // for high-resolution output
  },

  // Supported File Types
  SUPPORTED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ],

  // Text Content (can be extended for more languages)
  TEXT_CONTENT: {
    Hebrew: {
      imageSettings: 'הגדרות תמונה',
      noImageUploaded: 'טרם נבחרה תמונה',
      uploadImage: 'העלה תמונה',
      backgroundImage: 'תמונת רקע',
      title: 'כותרת',
      text: 'טקסט',
      borderRadius: 'עיגול פינות',
      qrLink: 'קישור ל-QR',
      backgroundColor: 'צבע רקע',
      titleColor: 'צבע כותרת',
      textColor: 'צבע טקסט',
      downloadFlier: 'הורד פלייר',
      selectFont: 'בחר פונט',
      fontSize: 'גודל פונט',
      enterTitle: 'הכנס כותרת',
      enterPromotionalText: 'הכנס טקסט פרסומי',
      enterLinkForQR: 'הכנס קישור ליצירת QR',
      yourTitleHere: 'הכנס כותרת',
      enterPromotionalTextHere: 'הכנס טקסט פרסומי',
      backToModeSelection: 'חזור לבחירת מצב',
      qrPrimary: 'סרקו את הקוד לקבלת ההטבה',
      qrSecondary1: 'פתחו את המצלמה בנייד',
      qrSecondary2: 'כוונו לקוד וקבלו את ההטבה',
      footerText: 'באפליקציה השכונתית {brandName} תומכת בעסקים הקטנים השכונתיים',
    },
    English: {
      imageSettings: 'Image Settings',
      noImageUploaded: 'No image uploaded',
      uploadImage: 'Upload Image',
      backgroundImage: 'Background Image',
      title: 'Title',
      text: 'Text',
      borderRadius: 'Border Radius',
      qrLink: 'QR Link',
      backgroundColor: 'Background Color',
      titleColor: 'Title Color',
      textColor: 'Text Color',
      downloadFlier: 'Download Flier',
      selectFont: 'Select font',
      fontSize: 'Font size',
      enterTitle: 'Enter title',
      enterPromotionalText: 'Enter promotional text',
      enterLinkForQR: 'Enter link for QR code',
      yourTitleHere: 'Your Title Here',
      enterPromotionalTextHere: 'Enter your promotional text here',
      backToModeSelection: 'Back to Mode Selection',
      qrPrimary: 'Scan the code to get the benefit',
      qrSecondary1: 'Open your phone camera',
      qrSecondary2: 'Point at the code and get your benefit',
      footerText: '{brandName} The neighborhood app supporting local small businesses',
    },
  },

  // Animation Settings
  ANIMATIONS: {
    transition: 'all 0.3s ease',
    hoverScale: 1.05,
    dragSmoothness: 10,
  },

  // Z-Index Layers
  Z_INDEX: {
    header: 100,
    controls: 25,
    sidebar: 20,
    preview: 10,
    phonePreview: 5,
  },
};

// Helper function to get text content based on language
export const getTextContent = (language, key) => {
  return FLIER_DESIGNER_CONFIG.TEXT_CONTENT[language]?.[key] || 
         FLIER_DESIGNER_CONFIG.TEXT_CONTENT.English[key] || 
         key;
};

// Helper function to replace placeholders in text
export const formatText = (text, replacements = {}) => {
  let formattedText = text;
  Object.keys(replacements).forEach(key => {
    formattedText = formattedText.replace(`{${key}}`, replacements[key]);
  });
  return formattedText;
}; 