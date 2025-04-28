// Common translations for business types and target audiences
const translations = {
  businessTypes: {
    'מסעדה': 'Restaurant',
    'חנות בגדים': 'Clothing Store',
    'משרד עורכי דין': 'Law Firm',
    'חנות נעליים': 'Shoe Store',
    'סלון יופי': 'Beauty Salon',
    'מכון כושר': 'Gym',
    'חנות אלקטרוניקה': 'Electronics Store',
    'חנות ספרים': 'Bookstore',
    'בית קפה': 'Cafe',
    'חנות מתנות': 'Gift Shop',
    'מרפאה': 'Clinic',
    'משרד אדריכלים': 'Architecture Firm',
    'חנות רהיטים': 'Furniture Store',
    'סוכנות נסיעות': 'Travel Agency',
    'חנות ספורט': 'Sports Store',
    'מכון לימודים': 'Educational Institute',
    'סוכנות ביטוח': 'Insurance Agency',
    'חנות כלי בית': 'Home Goods Store',
    'מכון טיפוח': 'Wellness Center',
    'חנות צעצועים': 'Toy Store'
  },
  targetAudiences: {
    'משפחות': 'Families',
    'צעירים': 'Young Adults',
    'אנשי עסקים': 'Business Professionals',
    'סטודנטים': 'Students',
    'ילדים': 'Children',
    'מבוגרים': 'Adults',
    'נשים': 'Women',
    'גברים': 'Men',
    'משפחות צעירות': 'Young Families',
    'פנסיונרים': 'Retirees',
    'משפחות עם ילדים': 'Families with Children',
    'אנשי מקצוע': 'Professionals',
    'מתבגרים': 'Teenagers',
    'אנשי קריירה': 'Career Professionals',
    'משפחות גדולות': 'Large Families'
  }
};

export function translateToEnglish(text, category) {
  if (!text) return '';
  
  // If it's a known category, use the translation map
  if (category && translations[category]) {
    const translated = translations[category][text];
    if (!translated) {
      console.warn(`No translation found for ${text} in category ${category}`);
    }
    return translated || text;
  }
  
  return text;
}

export function translateFormData(formData, language) {
  if (language !== 'Hebrew') return formData;
  
  const translatedData = {
    ...formData,
    targetAudience: translateToEnglish(formData.targetAudience, 'targetAudiences'),
    businessType: translateToEnglish(formData.businessType, 'businessTypes')
  };

  // Log translations for debugging
  console.log('Original data:', formData);
  console.log('Translated data:', translatedData);
  
  return translatedData;
} 