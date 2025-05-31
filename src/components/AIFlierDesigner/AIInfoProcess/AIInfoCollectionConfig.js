export const AIInfoCollectionConfig = {
  // Business Types Configuration
  businessTypes: [
    // ✅ SPECIFIC FOOD BUSINESSES 
    { value: 'hamburger restaurant', label: 'Hamburger Restaurant - המבורגרייה' },
    { value: 'pizzeria', label: 'Pizzeria - פיצרייה' },
    { value: 'cafe', label: 'Cafe - בית קפה' },
    { value: 'coffee shop', label: 'Coffee Shop - בית קפה' },
    { value: 'bakery', label: 'Bakery - מאפייה' },
    { value: 'sushi restaurant', label: 'Sushi Restaurant - מסעדת סושי' },
    { value: 'chinese restaurant', label: 'Chinese Restaurant - מסעדה סינית' },
    { value: 'mexican restaurant', label: 'Mexican Restaurant - מסעדה מקסיקנית' },
    { value: 'indian restaurant', label: 'Indian Restaurant - מסעדה הודית' },
    { value: 'steakhouse', label: 'Steakhouse - סטייקייה' },
    { value: 'seafood restaurant', label: 'Seafood Restaurant - מסעדת פירות ים' },
    { value: 'ice cream parlor', label: 'Ice Cream Parlor - גלידריה' },
    { value: 'bar', label: 'Bar - בר' },
    { value: 'fast food', label: 'Fast Food - מזון מהיר' },
    { value: 'fine dining', label: 'Fine Dining - מסעדה יוקרתית' },
    { value: 'restaurant', label: 'Restaurant (General) - מסעדה כללית' },
    
    // ✅ OTHER BUSINESS TYPES
    { value: 'tech company', label: 'Tech Company - חברת הייטק' },
    { value: 'retail store', label: 'Retail Store - חנות קמעונאית' },
    { value: 'fitness center', label: 'Fitness Center - מכון כושר' },
    { value: 'beauty salon', label: 'Beauty Salon - מכון יופי' },
    { value: 'hotel', label: 'Hotel - מלון' },
    { value: 'medical clinic', label: 'Medical Clinic - מרפאה' },
    { value: 'auto service', label: 'Auto Service - שירותי רכב' },
    { value: 'education', label: 'Education - חינוך' },
    { value: 'office', label: 'Office - משרדים' },
    { value: 'entertainment', label: 'Entertainment - בידור' },
    { value: 'general', label: 'General Business - עסק כללי' }
  ],

  // Target Audiences Configuration
  targetAudiences: [
    { value: 'families', label: 'Families with Children - משפחות עם ילדים' },
    { value: 'young adults', label: 'Young Adults (18-35) - צעירים בוגרים' },
    { value: 'professionals', label: 'Business Professionals - אנשי מקצוע' },
    { value: 'seniors', label: 'Seniors (55+) - בוגרים' },
    { value: 'students', label: 'Students - סטודנטים' },
    { value: 'teenagers', label: 'Teenagers (13-17) - בני נוער' },
    { value: 'children', label: 'Children - ילדים' },
    { value: 'tourists', label: 'Tourists - תיירים' },
    { value: 'locals', label: 'Local Community - קהילה מקומית' },
    { value: 'office workers', label: 'Office Workers - עובדי משרדים' },
    { value: 'food lovers', label: 'Food Enthusiasts - אוהבי אוכל' },
    { value: 'health conscious', label: 'Health Conscious - מודעים לבריאות' },
    { value: 'luxury seekers', label: 'Luxury Seekers - מחפשי יוקרה' },
    { value: 'budget conscious', label: 'Budget Conscious - מודעים לתקציב' },
    { value: 'general', label: 'General Public - קהל רחב' }
  ],

  // Style Preferences Configuration
  stylePreferences: [
    { value: 'modern', label: 'Modern - מודרני' },
    { value: 'classic', label: 'Classic - קלאסי' },
    { value: 'minimalist', label: 'Minimalist - מינימליסטי' },
    { value: 'bold', label: 'Bold - נועז' }
  ],

  // Color Schemes Configuration
  colorSchemes: [
    { value: 'warm', label: 'Warm - חם' },
    { value: 'cool', label: 'Cool - קר' },
    { value: 'neutral', label: 'Neutral - ניטרלי' },
    { value: 'vibrant', label: 'Vibrant - תוסס' }
  ],

  // Color Mappings for Different Schemes
  colorMappings: {
    warm: {
      primary: '#FF5722',
      secondary: '#FF9800',
      accent: '#FFC107',
      background: '#FFFFFF'
    },
    cool: {
      primary: '#2196F3',
      secondary: '#03A9F4',
      accent: '#00BCD4',
      background: '#FFFFFF'
    },
    neutral: {
      primary: '#607D8B',
      secondary: '#9E9E9E',
      accent: '#795548',
      background: '#F5F5F5'
    },
    vibrant: {
      primary: '#E91E63',
      secondary: '#9C27B0',
      accent: '#673AB7',
      background: '#FFFFFF'
    }
  },

  // Flier Size Options
  flierSizes: [
    { value: 'A4', label: 'A4 (210×297mm)' },
    { value: 'A5', label: 'A5 (148×210mm)' },
    { value: 'Letter', label: 'Letter (8.5×11in)' },
    { value: 'Custom', label: 'Custom Size' }
  ],

  // Orientation Options
  orientations: [
    { value: 'portrait', label: 'Portrait - לאורך' },
    { value: 'landscape', label: 'Landscape - לרוחב' }
  ],

  // Default Form Data
  defaultFormData: {
    targetAudience: 'families',
    businessType: 'hamburger restaurant',
    stylePreference: 'modern',
    colorScheme: 'warm',
    imagePreference: 'system',
    uploadedImage: null,
    uploadType: 'regular',
    flierSize: 'A4',
    orientation: 'portrait'
  },

  // UI Text Content
  text: {
    hebrew: {
      title: 'מידע נוסף לעיצוב',
      targetAudience: 'קהל יעד',
      businessType: 'סוג העסק',
      designStyle: 'Design Style',
      colorScheme: 'Color Scheme',
      flierImageTitle: 'העלאת תמונה לפלייר',
      flierImageDescription: 'בחר אחת מהאפשרויות הבאות להוספת תמונה לפלייר שלך',
      regularUpload: 'העלאה רגילה',
      regularUploadDesc: 'בחר תמונה ממכשיר זה',
      enhancedUpload: 'העלאה משופרת',
      enhancedUploadDesc: 'צור תמונה עם בינה מלאכותית',
      flierSize: 'Flier Size',
      orientation: 'Orientation',
      continueButton: 'המשך לסיכום',
      analyzingImages: 'מנתח תמונות...',
      requiredField: 'שדה חובה',
      fillAllFields: 'אנא מלא את כל השדות הנדרשים לפני שתמשיך',
      enhancedUploadTitle: 'העלאה משופרת',
      enhancedUploadPlaceholder: 'יאאלה גל סומך עליך',
      enhancedUploadComingSoon: 'העלאה משופרת תופיע כאן',
      close: 'סגור',
      confirm: 'אישור',
      comingSoon: 'Coming soon!',
      backButton: 'חזור לבחירת מצב עיצוב'
    },
    english: {
      title: 'Additional Design Information',
      targetAudience: 'Target Audience',
      businessType: 'Business Type',
      designStyle: 'Design Style',
      colorScheme: 'Color Scheme',
      flierImageTitle: 'Upload Image for Flier',
      flierImageDescription: 'Choose one of the following options to add an image to your flier',
      regularUpload: 'Regular Upload',
      regularUploadDesc: 'Choose image from this device',
      enhancedUpload: 'Enhanced Upload',
      enhancedUploadDesc: 'Create image with AI',
      flierSize: 'Flier Size',
      orientation: 'Orientation',
      continueButton: 'Continue to Summary',
      analyzingImages: 'Analyzing images...',
      requiredField: 'Required field',
      fillAllFields: 'Please fill all required fields before continuing',
      enhancedUploadTitle: 'Enhanced Upload',
      enhancedUploadPlaceholder: 'Describe the image you want to create',
      enhancedUploadComingSoon: 'Enhanced upload will appear here',
      close: 'Close',
      confirm: 'Confirm',
      comingSoon: 'Coming soon!',
      backButton: 'Back to Design Mode'
    }
  },

  // Validation Rules
  validation: {
    required: ['targetAudience', 'businessType', 'colorScheme', 'flierSize', 'orientation'],
    conditionalRequired: {
      imageUpload: {
        condition: (formData) => formData.imagePreference === 'upload',
        field: 'uploadedImage'
      }
    }
  },

  // Upload Configuration
  upload: {
    acceptedFormats: 'image/*',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    previewMaxHeight: '150px'
  },

  // Analysis Configuration
  analysis: {
    enableImageAnalysis: true,
    analyzeLogoAndPhoto: true,
    fallbackToDefaults: true
  }
};

export default AIInfoCollectionConfig; 