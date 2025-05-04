import React from 'react';
import { Box, Typography, Paper, Button, Grid, Divider, Avatar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import './AIFlierSummary.css';

const InfoRow = ({ label, value }) => (
  <Box className="flier-summary-info-row">
    <Typography variant="subtitle2" className="flier-summary-label">{label}</Typography>
    <Typography variant="body1" className="flier-summary-value">{value}</Typography>
  </Box>
);

const AIFlierSummary = ({ info, onBack, onConfirm, language }) => {
  const isRTL = language === 'Hebrew';
  
  // Debug the info object to check for logo and colors
  console.log("Summary info received:", info);
  
  // Map the values to display labels
  const getDisplayValue = (key, value) => {
    // For fields with specific mappings
    const displayMaps = {
      stylePreference: {
        'modern': 'Modern - מודרני',
        'classic': 'Classic - קלאסי',
        'minimalist': 'Minimalist - מינימליסטי',
        'bold': 'Bold - נועז'
      },
      colorScheme: {
        'warm': 'Warm - חם',
        'cool': 'Cool - קר',
        'neutral': 'Neutral - ניטרלי',
        'vibrant': 'Vibrant - תוסס',
        'black': 'Black - שחור',
        'white': 'White - לבן',
        'blue': 'Blue - כחול',
        'red': 'Red - אדום',
        'green': 'Green - ירוק',
        'yellow': 'Yellow - צהוב',
        'purple': 'Purple - סגול',
        'orange': 'Orange - כתום',
        'brown': 'Brown - חום',
        'gray': 'Gray - אפור'
      }
    };
    
    if (displayMaps[key] && displayMaps[key][value]) {
      return displayMaps[key][value];
    }
    
    return value;
  };

  // Helper function to translate color names to Hebrew
  const translateColorNameToHebrew = (colorName) => {
    const hebrewColorNames = {
      'foreground': 'קדמה',
      'background': 'רקע',
      'border': 'גבול',
      'text': 'טקסט',
      'link': 'קישור',
      'button': 'כפתור',
      'header': 'כותרת',
      'footer': 'כותרת תחתונה',
      'accent': 'הדגשה',
      'primary': 'ראשי',
      'secondary': 'משני',
      'highlight': 'מודגש'
    };
    
    return hebrewColorNames[colorName.toLowerCase()] || colorName;
  };

  return (
    <Paper elevation={4} className={`flier-summary-paper ${isRTL ? 'rtl-layout' : ''}`}>
      <Typography variant="h4" className="flier-summary-title">
        {isRTL ? 'סיכום פרטי הפלייר' : 'Review Your Flier Details'}
      </Typography>
      
      {/* Logo Section at the top */}
      <Box className="flier-summary-logo-container">
        {info.logo ? (
          <img 
            src={info.logo} 
            alt="Business Logo" 
            className="flier-summary-header-logo"
            onError={(e) => {
              console.error("Error loading logo:", e);
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        ) : info.uploadedImage ? (
          <div className="flier-summary-fallback-logo">
            <img 
              src={info.uploadedImage} 
              alt="Uploaded Image" 
              className="flier-summary-header-logo flier-summary-fallback-image"
            />
            {isRTL 
              ? <Typography variant="caption">משמש כתחליף ללוגו</Typography>
              : <Typography variant="caption">Using uploaded image in place of logo</Typography>
            }
          </div>
        ) : (
          <Typography variant="body2" color="text.secondary" className="flier-summary-no-logo">
            {isRTL ? 'לא נבחר לוגו' : 'No logo selected'}
          </Typography>
        )}
      </Box>
      
      <Divider className="flier-summary-divider" />
      
      <Grid container spacing={3} className="flier-summary-content">
        <Grid item xs={12} sm={6}>
          <Box className="flier-summary-section">
            <Typography variant="h6" className="flier-summary-section-title">
              {isRTL ? 'פרטי תוכן' : 'Content Details'}
            </Typography>
            {info.title && <InfoRow label={isRTL ? 'כותרת' : 'Title'} value={info.title} />}
            {info.promotionalText && <InfoRow label={isRTL ? 'טקסט פרסומי' : 'Promotional Text'} value={info.promotionalText} />}
            {info.targetAudience && <InfoRow label={isRTL ? 'קהל יעד' : 'Target Audience'} value={info.targetAudience} />}
            {info.businessType && <InfoRow label={isRTL ? 'סוג העסק' : 'Business Type'} value={info.businessType} />}
          </Box>
          
          <Box className="flier-summary-section">
            <Typography variant="h6" className="flier-summary-section-title">
              {isRTL ? 'פרטי עיצוב' : 'Design Details'}
            </Typography>
            {info.stylePreference && <InfoRow label={isRTL ? 'סגנון עיצוב' : 'Style Preference'} value={getDisplayValue('stylePreference', info.stylePreference)} />}
            {info.colorScheme && <InfoRow label={isRTL ? 'סכמת צבעים' : 'Color Scheme'} value={getDisplayValue('colorScheme', info.colorScheme)} />}
            
            {/* Color details section */}
            {info.colors && (
              <Box className="flier-summary-colors-section">
                <Typography variant="subtitle2" className="flier-summary-label">{isRTL ? 'צבעים מדויקים' : 'Color Details'}</Typography>
                <Box className="flier-summary-color-swatches">
                  {info.colors.primary && (
                    <Box className="flier-summary-color-item">
                      <Box 
                        className="flier-summary-color-swatch" 
                        sx={{ backgroundColor: info.colors.primary, border: '1px solid #ddd' }}
                      />
                      <Typography variant="caption">{isRTL ? 'ראשי:' : 'Primary:'} {info.colors.primary}</Typography>
                    </Box>
                  )}
                  {info.colors.secondary && (
                    <Box className="flier-summary-color-item">
                      <Box 
                        className="flier-summary-color-swatch" 
                        sx={{ backgroundColor: info.colors.secondary, border: '1px solid #ddd' }}
                      />
                      <Typography variant="caption">{isRTL ? 'משני:' : 'Secondary:'} {info.colors.secondary}</Typography>
                    </Box>
                  )}
                  {info.colors.accent && (
                    <Box className="flier-summary-color-item">
                      <Box 
                        className="flier-summary-color-swatch" 
                        sx={{ backgroundColor: info.colors.accent, border: '1px solid #ddd' }}
                      />
                      <Typography variant="caption">{isRTL ? 'הדגשה:' : 'Accent:'} {info.colors.accent}</Typography>
                    </Box>
                  )}
                  {info.colors.background && (
                    <Box className="flier-summary-color-item">
                      <Box 
                        className="flier-summary-color-swatch" 
                        sx={{ backgroundColor: info.colors.background, border: '1px solid #ddd' }}
                      />
                      <Typography variant="caption">{isRTL ? 'רקע:' : 'Background:'} {info.colors.background}</Typography>
                    </Box>
                  )}
                  
                  {/* Display semantic colors if available */}
                  {info.colors.semanticColors && Object.entries(info.colors.semanticColors).length > 0 && 
                    Object.entries(info.colors.semanticColors).map(([key, value]) => (
                      <Box key={key} className="flier-summary-color-item">
                        <Box 
                          className="flier-summary-color-swatch" 
                          sx={{ backgroundColor: value, border: '1px solid #ddd' }}
                        />
                        <Typography variant="caption">
                          {isRTL ? translateColorNameToHebrew(key) : key}: {value}
                        </Typography>
                      </Box>
                    ))
                  }
                </Box>
              </Box>
            )}
            
            {info.flierSize && <InfoRow label={isRTL ? 'גודל פלייר' : 'Flier Size'} value={info.flierSize} />}
            {info.orientation && <InfoRow label={isRTL ? 'כיוון הדף' : 'Orientation'} value={isRTL ? (info.orientation === 'portrait' ? 'לאורך' : 'לרוחב') : info.orientation} />}
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Box className="flier-summary-section">
            <Typography variant="h6" className="flier-summary-section-title">
              {isRTL ? 'תמונות' : 'Images'}
            </Typography>
            
            {info.uploadedImage && (
              <Box className="flier-summary-image-container">
                <Typography variant="subtitle2" className="flier-summary-label">{isRTL ? 'תמונה שהועלתה' : 'Uploaded Image'}</Typography>
                <div className="flier-summary-image-wrapper">
                  <img src={info.uploadedImage} alt="Uploaded Preview" className="flier-summary-uploaded-image" />
                </div>
              </Box>
            )}
          </Box>
          
          {/* Vision Analysis Section */}
          {info.sceneType || info.detectedObjects || info.description ? (
            <Box className="flier-summary-section flier-summary-vision-analysis">
              <Typography variant="h6" className="flier-summary-section-title">
                {isRTL ? 'ניתוח ראייה ממוחשבת' : 'Vision Analysis'}
              </Typography>
              
              {info.sceneType && <InfoRow label={isRTL ? 'סצנה' : 'Scene'} value={info.sceneType} />}
              {info.description && <InfoRow label={isRTL ? 'תיאור' : 'Description'} value={info.description} />}
              {info.detectedObjects && Array.isArray(info.detectedObjects) && (
                <InfoRow 
                  label={isRTL ? 'אובייקטים' : 'Objects'} 
                  value={info.detectedObjects.join(', ')} 
                />
              )}
            </Box>
          ) : null}
        </Grid>
      </Grid>
      
      <Divider className="flier-summary-bottom-divider" />
      
      <Box className="flier-summary-actions">
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={onBack}
          className="flier-summary-back-button"
          startIcon={!isRTL ? <ArrowBackIcon /> : null}
          endIcon={isRTL ? <ArrowBackIcon /> : null}
        >
          {isRTL ? 'חזור / ערוך' : 'Back / Edit'}
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onConfirm}
          className="flier-summary-confirm-button"
          startIcon={!isRTL ? <CheckCircleIcon /> : null}
          endIcon={isRTL ? <CheckCircleIcon /> : null}
        >
          {isRTL ? 'אשר וצור' : 'Confirm & Generate'}
        </Button>
      </Box>
    </Paper>
  );
};

export default AIFlierSummary; 