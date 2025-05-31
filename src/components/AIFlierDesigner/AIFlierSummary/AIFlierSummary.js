import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Grid, Divider, Chip, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import BusinessIcon from '@mui/icons-material/Business';
import PaletteIcon from '@mui/icons-material/Palette';
import { generateBackgroundParameters, generateBackgrounds, generateBackgroundImages } from '../../../services/background';
import { getDisplayValue } from './displayMappings';
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

  // Determine what analysis was performed
  const hasLogoAnalysis = info.hasLogoAnalysis || (info.logoAnalysis && Object.keys(info.logoAnalysis).length > 0);
  const hasPhotoAnalysis = info.hasPhotoAnalysis || (info.photoAnalysis && Object.keys(info.photoAnalysis).length > 0);
  const hasAnyAnalysis = hasLogoAnalysis || hasPhotoAnalysis;

  /**
   * ENHANCED PIPELINE: Database-first with Imagen fallback
   */
  const handleConfirm = async () => {
    console.log("🎨 Starting enhanced flier generation pipeline (Database-first + Imagen)...");
    setIsGenerating(true);
    
    // Declare backgroundParams outside try block for fallback access
    let backgroundParams;
    
    try {
      // Step 1: Generate background parameters using our simple rules engine
      console.log("Step 1: Generating background parameters...");
      backgroundParams = generateBackgroundParameters(info);
      console.log("Generated parameters:", backgroundParams);
      
      // Step 2: Check database for existing suitable backgrounds
      console.log("Step 2: Checking database for existing backgrounds...");
      let backgroundOptions = await checkDatabaseForBackgrounds(backgroundParams);
      
      if (backgroundOptions && backgroundOptions.length >= 3) {
        console.log("✅ Found suitable backgrounds in database:", backgroundOptions.length);
      } else {
        console.log("🖼️ No suitable backgrounds found, generating with Imagen 3.0...");
        
        // Step 3: Generate with Imagen 3.0 as fallback
        backgroundOptions = await generateBackgroundImages(backgroundParams);
        
        // Step 4: Save new backgrounds to database for future use
        console.log("💾 Saving generated backgrounds to database...");
        await saveBakcgroundsToDatabase(backgroundOptions, backgroundParams);
        
        console.log("✅ Generated and saved new backgrounds with Imagen 3.0");
      }
      
      // Step 5: Pass to onConfirm with the background options
      const enhancedInfo = {
        ...info,
        backgroundOptions,
        backgroundParams,
        generationMethod: backgroundOptions[0]?.source === 'database' ? 'database-cached' : 'imagen-generated'
      };
      
      console.log("✅ Successfully prepared backgrounds, proceeding to flier creation...");
      onConfirm(enhancedInfo);
      
    } catch (error) {
      console.error("❌ Error in enhanced pipeline:", error);
      
      // Ultimate fallback: Use CSS generation
      console.log("🛡️ Using CSS generation as ultimate fallback...");
      try {
        // Use backgroundParams if available, otherwise regenerate
        const fallbackParams = backgroundParams || generateBackgroundParameters(info);
        const cssBackgrounds = await generateBackgrounds(fallbackParams);
        onConfirm({
          ...info,
          backgroundOptions: cssBackgrounds,
          backgroundParams: fallbackParams,
          generationMethod: 'css-fallback',
          error: error.message
        });
      } catch (cssError) {
        console.error("❌ Even CSS fallback failed:", cssError);
        // Continue without backgrounds
        onConfirm({
          ...info,
          backgroundOptions: [],
          generationMethod: 'no-backgrounds',
          error: `Background generation failed: ${error.message}`
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Check database for existing backgrounds matching the criteria
   */
  const checkDatabaseForBackgrounds = async (params) => {
    try {
      console.log("🔍 Searching database for matching backgrounds...");
      
      // Future: This will be a real database call
      // For now, simulate database check
      const searchCriteria = {
        businessType: params.businessType,
        targetAudience: params.targetAudience,
        colorScheme: params.colorScheme,
        stylePreference: params.stylePreference,
        moodKeywords: params.moodKeywords
      };
      
      console.log("Database search criteria:", searchCriteria);
      
      // Simulate database response (replace with real database call)
      // const response = await axios.get('http://localhost:8081/api/backgrounds/search', {
      //   params: { 
      //     businessType: params.businessType,
      //     targetAudience: params.targetAudience,
      //     colorScheme: params.colorScheme,
      //     limit: 3
      //   }
      // });
      // return response.data;
      
      // For now, return null to trigger Imagen generation
      console.log("💾 Database not implemented yet, proceeding to Imagen generation");
      return null;
      
    } catch (error) {
      console.warn("⚠️ Database check failed:", error.message);
      return null; // Proceed to generation
    }
  };

  /**
   * Save generated backgrounds to database for future reuse
   */
  const saveBakcgroundsToDatabase = async (backgrounds, params) => {
    try {
      console.log("💾 Saving backgrounds to database...");
      
      const backgroundRecords = backgrounds.map(bg => ({
        // Background data
        name: bg.name,
        background_image_url: bg.backgroundImage || null,
        background_css: bg.backgroundCSS || null,
        
        // Color information
        text_color: bg.textColor,
        accent_color: bg.accentColor,
        
        // Search metadata
        business_type: params.businessType,
        target_audience: params.targetAudience,
        color_scheme: params.colorScheme,
        style_preference: params.stylePreference,
        mood_keywords: JSON.stringify(params.moodKeywords),
        
        // Generation info
        source: bg.source || 'imagen',
        created_at: new Date().toISOString(),
        usage_count: 0
      }));
      
      console.log("Would save to database:", backgroundRecords);
      
      // Future: Real database save
      // await axios.post('http://localhost:8081/api/backgrounds/cache', backgroundRecords);
      
      console.log("✅ Backgrounds saved to database (simulated)");
      
    } catch (error) {
      console.warn("⚠️ Failed to save to database:", error.message);
      // Don't throw - saving to database is not critical for immediate use
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
              alt="Uploaded content" 
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