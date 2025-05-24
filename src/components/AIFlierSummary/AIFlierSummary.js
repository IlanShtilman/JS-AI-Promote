import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Grid, Divider, Avatar, Chip, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import BusinessIcon from '@mui/icons-material/Business';
import PaletteIcon from '@mui/icons-material/Palette';
import { generateBackgroundParameters } from '../../services/simpleRulesEngine';
import { generateBackgrounds } from '../../services/backgroundGeneratorService';
import './AIFlierSummary.css';

const InfoRow = ({ label, value }) => (
  <Box className="flier-summary-info-row">
    <Typography variant="subtitle2" className="flier-summary-label">{label}</Typography>
    <Typography variant="body1" className="flier-summary-value">{value}</Typography>
  </Box>
);

// Component to display individual color analysis
const ColorAnalysisSection = ({ title, colors, icon, isRTL, source }) => {
  if (!colors) return null;

  return (
    <Box className="flier-summary-color-analysis-section">
      <Box className="flier-summary-color-analysis-header">
        {icon}
        <Typography variant="subtitle1" className="flier-summary-color-analysis-title">
          {title}
        </Typography>
        <Chip 
          label={source} 
          size="small" 
          variant="outlined" 
          className="flier-summary-analysis-source-chip"
        />
      </Box>
      <Box className="flier-summary-color-swatches">
        {colors.primary && (
          <Box className="flier-summary-color-item">
            <Box 
              className="flier-summary-color-swatch" 
              sx={{ backgroundColor: colors.primary, border: '1px solid #ddd' }}
            />
            <Typography variant="caption">{isRTL ? 'ראשי:' : 'Primary:'} {colors.primary}</Typography>
          </Box>
        )}
        {colors.secondary && (
          <Box className="flier-summary-color-item">
            <Box 
              className="flier-summary-color-swatch" 
              sx={{ backgroundColor: colors.secondary, border: '1px solid #ddd' }}
            />
            <Typography variant="caption">{isRTL ? 'משני:' : 'Secondary:'} {colors.secondary}</Typography>
          </Box>
        )}
        {colors.accent && (
          <Box className="flier-summary-color-item">
            <Box 
              className="flier-summary-color-swatch" 
              sx={{ backgroundColor: colors.accent, border: '1px solid #ddd' }}
            />
            <Typography variant="caption">{isRTL ? 'הדגשה:' : 'Accent:'} {colors.accent}</Typography>
          </Box>
        )}
        {colors.background && (
          <Box className="flier-summary-color-item">
            <Box 
              className="flier-summary-color-swatch" 
              sx={{ backgroundColor: colors.background, border: '1px solid #ddd' }}
            />
            <Typography variant="caption">{isRTL ? 'רקע:' : 'Background:'} {colors.background}</Typography>
          </Box>
        )}
        
        {/* Display dominant colors if available */}
        {colors.dominantColors && colors.dominantColors.length > 0 && (
          <>
            <Typography variant="caption" className="flier-summary-dominant-colors-title">
              {isRTL ? 'צבעים דומיננטיים:' : 'Dominant Colors:'}
            </Typography>
            {colors.dominantColors.slice(0, 3).map((color, index) => (
              <Box key={index} className="flier-summary-color-item">
                <Box 
                  className="flier-summary-color-swatch flier-summary-color-swatch-small" 
                  sx={{ backgroundColor: color, border: '1px solid #ddd' }}
                />
                <Typography variant="caption">{color}</Typography>
              </Box>
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

const AIFlierSummary = ({ info, onBack, onConfirm, language }) => {
  const isRTL = language === 'Hebrew';
  const [isGenerating, setIsGenerating] = useState(false);
  
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

  // Determine what analysis was performed
  const hasLogoAnalysis = info.hasLogoAnalysis || (info.logoAnalysis && Object.keys(info.logoAnalysis).length > 0);
  const hasPhotoAnalysis = info.hasPhotoAnalysis || (info.photoAnalysis && Object.keys(info.photoAnalysis).length > 0);
  const hasAnyAnalysis = hasLogoAnalysis || hasPhotoAnalysis;

  /**
   * NEW SIMPLIFIED PIPELINE: Handle confirm action with our new background generation
   */
  const handleConfirm = async () => {
    console.log("🎨 Starting new simplified flier generation pipeline...");
    setIsGenerating(true);
    
    try {
      // Step 1: Generate background parameters using our simple rules engine
      console.log("Step 1: Generating background parameters...");
      const backgroundParams = generateBackgroundParameters(info);
      console.log("Generated parameters:", backgroundParams);
      
      // Step 2: Generate 3 background options using AI
      console.log("Step 2: Generating AI backgrounds...");
      const backgroundOptions = await generateBackgrounds(backgroundParams);
      console.log("Generated background options:", backgroundOptions);
      
      // Step 3: Pass to onConfirm with the generated backgrounds
      const enhancedInfo = {
        ...info,
        backgroundOptions,
        backgroundParams,
        generationMethod: 'simplified-ai-pipeline'
      };
      
      console.log("✅ Successfully generated backgrounds, proceeding to flier creation...");
      onConfirm(enhancedInfo);
      
    } catch (error) {
      console.error("❌ Error in simplified pipeline:", error);
      
      // Fallback: continue with original info
      console.log("🛡️ Using fallback - proceeding without AI backgrounds");
      onConfirm({
        ...info,
        backgroundOptions: [],
        generationMethod: 'fallback',
        error: error.message
      });
    } finally {
      setIsGenerating(false);
    }
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

      {/* Enhanced Color Analysis Section */}
      <Divider className="flier-summary-divider" />
      
      <Box className="flier-summary-section">
        <Typography variant="h5" className="flier-summary-section-title" sx={{ mb: 3 }}>
          <PaletteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {isRTL ? 'ניתוח צבעים' : 'Color Analysis'}
        </Typography>
        
        {hasAnyAnalysis ? (
          <Grid container spacing={3}>
            {hasLogoAnalysis && (
              <Grid item xs={12} md={6}>
                <ColorAnalysisSection
                  title={isRTL ? 'צבעי הלוגו' : 'Logo Colors'}
                  colors={info.logoAnalysis?.colors}
                  icon={<BusinessIcon color="primary" />}
                  isRTL={isRTL}
                  source={isRTL ? 'ניתוח AI' : 'AI Analysis'}
                />
              </Grid>
            )}
            
            {hasPhotoAnalysis && (
              <Grid item xs={12} md={6}>
                <ColorAnalysisSection
                  title={isRTL ? 'צבעי התמונה' : 'Image Colors'}
                  colors={info.photoAnalysis?.colors}
                  icon={<ImageIcon color="secondary" />}
                  isRTL={isRTL}
                  source={isRTL ? 'ניתוח AI' : 'AI Analysis'}
                />
              </Grid>
            )}
            
            {/* Unified Color Palette */}
            {info.colors && (
              <Grid item xs={12}>
                <ColorAnalysisSection
                  title={isRTL ? 'לוח צבעים מאוחד' : 'Unified Color Palette'}
                  colors={info.colors}
                  icon={<PaletteIcon color="success" />}
                  isRTL={isRTL}
                  source={isRTL ? 'שילוב חכם' : 'Smart Blend'}
                />
              </Grid>
            )}
          </Grid>
        ) : (
          // Fallback when no Azure analysis was performed
          <Box className="flier-summary-no-analysis">
            <Box className="flier-summary-no-analysis-content">
              <PaletteIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" align="center">
                {isRTL ? 'לא בוצע ניתוח צבעים' : 'No Color Analysis Performed'}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                {isRTL 
                  ? 'השתמשנו בסכמת הצבעים שבחרת'
                  : 'Using your selected color scheme'}
              </Typography>
              
              {/* Show the default color scheme */}
              {info.colors && (
                <Box sx={{ mt: 3 }}>
                  <ColorAnalysisSection
                    title={isRTL ? 'סכמת הצבעים שנבחרה' : 'Selected Color Scheme'}
                    colors={info.colors}
                    icon={<PaletteIcon color="primary" />}
                    isRTL={isRTL}
                    source={isRTL ? 'ברירת מחדל' : 'Default'}
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
      
      <Divider className="flier-summary-bottom-divider" />
      
      <Box className="flier-summary-actions">
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={onBack}
          className="flier-summary-back-button"
          disabled={isGenerating}
          startIcon={!isRTL ? <ArrowBackIcon /> : null}
          endIcon={isRTL ? <ArrowBackIcon /> : null}
        >
          {isRTL ? 'חזור / ערוך' : 'Back / Edit'}
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleConfirm}
          className="flier-summary-confirm-button"
          disabled={isGenerating}
          startIcon={!isRTL && !isGenerating ? <CheckCircleIcon /> : null}
          endIcon={isRTL && !isGenerating ? <CheckCircleIcon /> : null}
        >
          {isGenerating ? (
            <>
              <CircularProgress size={20} sx={{ mr: isRTL ? 0 : 1, ml: isRTL ? 1 : 0 }} />
              {isRTL ? 'יוצר רקעים...' : 'Generating Backgrounds...'}
            </>
          ) : (
            isRTL ? 'אשר וצור' : 'Confirm & Generate'
          )}
        </Button>
      </Box>
    </Paper>
  );
};

export default AIFlierSummary; 