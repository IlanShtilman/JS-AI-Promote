import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import html2canvas from 'html2canvas';
import './AIFlier.css';

// Import our new components
import TabNavigation from './tabs/TabNavigation';
import BackgroundTab from './tabs/BackgroundTab';
import ContentTab from './tabs/ContentTab';
import StyleTab from './tabs/StyleTab';
import FlierPreview from './preview/FlierPreview';

// Import configuration files
import { patternTemplates } from './config/patternTemplates';
import { getLanguageConfig, detectLanguageFromText } from './config/languageConfig';
import { DEFAULT_STYLE_OPTIONS, getLanguageAwareDefaultStyles } from './config/defaultStyles';

const AIFlier = ({ backgroundOptions = [], flyerContent }) => {
  console.log("🎨 AIFlier received backgroundOptions:", backgroundOptions);
  
  // Detect language from content
  const detectedLanguage = detectLanguageFromText(flyerContent?.title || flyerContent?.promotionalText);
  const languageConfig = getLanguageConfig(detectedLanguage);
  
  // ✅ PROCESS RAW BACKEND OPTIONS INTO COMPLETE STYLE OPTIONS
  const processBackgroundOptions = (rawOptions) => {
    if (!rawOptions || rawOptions.length === 0) {
      return getLanguageAwareDefaultStyles(detectedLanguage);
    }
    
    return rawOptions.map((option, index) => {
      // ✅ DERIVE COMPLETE TYPOGRAPHY from AI decisions
      const fontFamily = option.fontFamily || 'Roboto, sans-serif';
      const fontSize = option.fontSize || 2.8;  // Reduced default from 4.0 to 2.8
      const bodyFontSize = option.bodyFontSize || 1.3;  // Reduced default from 1.7 to 1.3
      
      // ✅ DERIVE ADDITIONAL TYPOGRAPHY PROPERTIES from AI font choice
      let letterSpacing, lineHeight, textAlign, titleWeight, bodyWeight;
      
      if (fontFamily.includes('Georgia') || fontFamily.includes('Playfair')) {
        // Elegant serif fonts
        letterSpacing = '0.01em';
        lineHeight = 1.2;
        textAlign = 'center';
        titleWeight = 700;
        bodyWeight = 400;
      } else if (fontFamily.includes('Montserrat')) {
        // Bold modern fonts  
        letterSpacing = '-0.03em';
        lineHeight = 1.0;
        textAlign = languageConfig.layout.textAlign;
        titleWeight = 900;
        bodyWeight = 600;
      } else {
        // Clean professional fonts (Roboto, Arial)
        letterSpacing = '-0.02em';
        lineHeight = 1.1;
        textAlign = languageConfig.layout.textAlign;
        titleWeight = 800;
        bodyWeight = 400;
      }
      
      const processedStyle = {
        // ✅ BACKGROUND
        backgroundImage: option.backgroundImage || 'none',    
        backgroundColor: option.backgroundColor || '#ffffff',
        backgroundCSS: option.backgroundCSS,
        
        // ✅ AI-DECIDED COLORS (harmonized with background)
        textColor: option.textColor || '#333333',                          
        accentColor: option.accentColor || '#2196F3',
        primaryColor: option.primaryColor || '#1a4a52',
        secondaryColor: option.secondaryColor || '#F5F5DC',
        
        // ✅ AI-DECIDED TYPOGRAPHY (complete set)
        fontFamily: fontFamily,
        fontSize: fontSize,
        bodyFontSize: bodyFontSize,
        letterSpacing: letterSpacing,
        lineHeight: lineHeight,
        textAlign: textAlign,
        titleWeight: titleWeight,
        bodyWeight: bodyWeight,
        
        // ✅ METADATA
        styleName: option.styleName || option.name || `Style ${index + 1}`,
        pattern: 'none',
        name: option.name || `Background ${index + 1}`,
        description: option.description || `AI Generated Style ${index + 1}`,
        source: option.source || 'ai'
      };
      
      console.log(`✅ Processed style ${index + 1}:`, processedStyle);
      return processedStyle;
    });
  };
  
  const [styleOptions, setStyleOptions] = useState(() => {
    const processed = processBackgroundOptions(backgroundOptions);
    console.log("🎨 Initial processed styleOptions:", processed);
    return processed;
  });
  
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);

  // ✅ UPDATE STYLE OPTIONS when backgroundOptions prop changes
  useEffect(() => {
    console.log("🔄 backgroundOptions prop changed, updating styleOptions...");
    const processed = processBackgroundOptions(backgroundOptions);
    console.log("🎨 Updated processed styleOptions:", processed);
    setStyleOptions(processed);
    // Reset to first style when new options arrive
    setSelectedStyleIndex(0);
  }, [backgroundOptions]);
  const [activeTab, setActiveTab] = useState('background');
  const [flierContent, setFlierContent] = useState({
    title: flyerContent?.title || "באים לפה הרבה?",
    promotionalText: flyerContent?.promotionalText || "הַמְּבוּרְגֶּר המושלם מחכה לך! בשר עסיסי, גבינה נמסה, וטעם בלתי נשכח. בואו ותטעמו את ההבדל – רק אצלנו!",
    callToAction: flyerContent?.callToAction || "",
    qrUrl: flyerContent?.qrUrl || "https://example.com",
    logo: flyerContent?.logo || null,
    image: flyerContent?.image || null,
    qrInstructions: flyerContent?.qrInstructions || languageConfig.content.qrInstructions,
    flierPhoto: null
  });
  
  const [borderRadius, setBorderRadius] = useState(22);
  const [useBackgroundImage, setUseBackgroundImage] = useState(false);
  const [uploadedBackgroundImage, setUploadedBackgroundImage] = useState(null);
  const [fontSize, setFontSize] = useState(2.8);  // Reduced from 3.9 to 2.8
  const [bodyFontSize, setBodyFontSize] = useState(1.3);  // Reduced from 1.7 to 1.3
  const [fontFamily, setFontFamily] = useState('Roboto');
  const [showImageAsBackground, setShowImageAsBackground] = useState(false);
  const [backgroundImageOpacity, setBackgroundImageOpacity] = useState(0.1);
  const [uploadedImageOpacity, setUploadedImageOpacity] = useState(0.1);
  const [showFlierPhoto, setShowFlierPhoto] = useState(true);
  const [flierPhotoSource, setFlierPhotoSource] = useState('upload');
  const [favoritePreset, setFavoritePreset] = useState('AI Recommendation');
  const [hasUserAdjustedFonts, setHasUserAdjustedFonts] = useState(false);
  // Text overlays are always enabled - no toggle needed
  
  const flierRef = useRef(null);

  const selectedStyle = styleOptions[selectedStyleIndex];
  
  useEffect(() => {
    console.log("Selected style:", selectedStyle);
  }, [selectedStyleIndex, selectedStyle]);

  // ✅ APPLY AI STYLES on initial load and when switching styles
  useEffect(() => {
    if (selectedStyle) {
      console.log("🔄 Applying style:", selectedStyle);
      
      // Apply AI-decided typography (can be overridden by user in Style tab)
      if (selectedStyle.fontFamily) {
        setFontFamily(selectedStyle.fontFamily);
        console.log("🔤 Font applied:", selectedStyle.fontFamily);
      }
      
      // Only apply AI font sizes if user hasn't manually adjusted them
      if (!hasUserAdjustedFonts) {
        if (selectedStyle.fontSize) {
          setFontSize(selectedStyle.fontSize);
          console.log("📏 AI Title size applied:", selectedStyle.fontSize);
        }
        
        if (selectedStyle.bodyFontSize) {
          setBodyFontSize(selectedStyle.bodyFontSize);
          console.log("📏 AI Body size applied:", selectedStyle.bodyFontSize);
        }
      } else {
        console.log("📏 Font sizes controlled by user sliders");
      }
      
      console.log("🎨 Complete style applied:", {
        name: selectedStyle.styleName,
        font: selectedStyle.fontFamily,
        colors: {
          text: selectedStyle.textColor,
          accent: selectedStyle.accentColor
        }
      });
    }
  }, [selectedStyleIndex]); // Only trigger on style index change, not selectedStyle object change

  // Export and save handlers
  const handleExportFlier = () => {
    if (!flierRef.current) return;
    
    const originalWidth = flierRef.current.style.width;
    const originalHeight = flierRef.current.style.height;
    
    flierRef.current.style.width = '';
    flierRef.current.style.height = '';
    
    html2canvas(flierRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'my-flier.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      flierRef.current.style.width = originalWidth;
      flierRef.current.style.height = originalHeight;
    });
  };

  const handleSaveFlier = () => {
    if (!flierRef.current) return;
    console.log("Save flier triggered");
  };
  
  // Content handlers
  const handleContentChange = (field) => (event) => {
    setFlierContent({
      ...flierContent,
      [field]: event.target.value
    });
  };
  
  const handlePatternChange = (event) => {
    const newPattern = event.target.value;
    const updatedOptions = [...styleOptions];
    updatedOptions[selectedStyleIndex] = {
      ...updatedOptions[selectedStyleIndex],
      pattern: newPattern
    };
    setStyleOptions(updatedOptions);
  };
  
  const handleBackgroundImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedBackgroundImage(e.target.result);
        setUseBackgroundImage(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFlierPhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFlierContent((prev) => ({
          ...prev,
          flierPhoto: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Style handlers
  const handleStyleColorChange = (colorKey) => (event) => {
    const updatedOptions = [...styleOptions];
    updatedOptions[selectedStyleIndex] = {
      ...updatedOptions[selectedStyleIndex],
      [colorKey]: event.target.value
    };
    setStyleOptions(updatedOptions);
  };

  // Preset style options
  const favoritePresets = {
    'AI Recommendation': {
      backgroundColor: '#f0f8ff',
      textColor: '#333333',
      accentColor: '#1976d2',
      pattern: 'none',
      fontFamily: 'Roboto',
      backgroundImage: "linear-gradient(135deg, #f0f8ff 0%, #e0e7ff 60%, #c3dafe 100%), url('data:image/svg+xml;utf8,<svg width=\"100%25\" height=\"100%25\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"80\" cy=\"80\" r=\"60\" fill=\"%23b3e5fc\" fill-opacity=\"0.18\"/><circle cx=\"300\" cy=\"200\" r=\"90\" fill=\"%231976d2\" fill-opacity=\"0.10\"/></svg>')"
    },
    'Google Clean': {
      backgroundColor: '#ffffff',
      textColor: '#202124',
      accentColor: '#50c7c7',
      pattern: 'none',
      fontFamily: 'Roboto',
      backgroundImage: "linear-gradient(120deg, #ffffff 0%, #50c7c7 30%, #4285F4 60%, #fbbc05 80%, #ea4335 100%), url('data:image/svg+xml;utf8,<svg width=\"100%25\" height=\"100%25\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"70\" y=\"70\" width=\"120\" height=\"40\" fill=\"%234285F4\" fill-opacity=\"0.08\"/><circle cx=\"350\" cy=\"120\" r=\"40\" fill=\"%23ea4335\" fill-opacity=\"0.10\"/><circle cx=\"200\" cy=\"300\" r=\"30\" fill=\"%2350c7c7\" fill-opacity=\"0.10\"/></svg>')"
    },
    'Apple Matte': {
      backgroundColor: '#F7F7F7',
      textColor: '#1F1F21',
      accentColor: '#007AFF',
      pattern: 'none',
      fontFamily: 'San Francisco, Arial, Helvetica Neue, Helvetica, sans-serif',
      backgroundImage: "linear-gradient(120deg, #F7F7F7 0%, #FF3B30 25%, #FF9500 50%, #007AFF 75%, #34AADC 100%), url('data:image/svg+xml;utf8,<svg width=\"100%25\" height=\"100%25\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"80\" cy=\"220\" rx=\"60\" ry=\"30\" fill=\"%23FF3B30\" fill-opacity=\"0.07\"/><ellipse cx=\"350\" cy=\"80\" rx=\"80\" ry=\"40\" fill=\"%23007AFF\" fill-opacity=\"0.04\"/><ellipse cx=\"200\" cy=\"300\" rx=\"50\" ry=\"20\" fill=\"%23FFD3E0\" fill-opacity=\"0.08\"/></svg>')"
    },
  };

  const handleFavoritePresetChange = (event) => {
    const preset = event.target.value;
    setFavoritePreset(preset);
    const updatedOptions = [...styleOptions];
    if (preset === 'AI Recommendation') {
      updatedOptions[selectedStyleIndex] = {
        ...updatedOptions[selectedStyleIndex],
        ...favoritePresets[preset],
      };
    } else {
      updatedOptions[selectedStyleIndex] = { ...favoritePresets[preset] };
    }
    setStyleOptions(updatedOptions);
    setFontFamily(favoritePresets[preset].fontFamily || 'Roboto');
  };

  // Background style function
  const getBackgroundStyle = () => {
    let style = {};
    
    console.log("🎨 getBackgroundStyle - selectedStyle:", selectedStyle);
    
    if (selectedStyle.backgroundImage && selectedStyle.backgroundImage !== 'none') {
      // Properly format the background image URL for CSS
      style.backgroundImage = `url(${selectedStyle.backgroundImage})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
      style.backgroundRepeat = 'no-repeat';
      console.log("✅ Using image background:", style.backgroundImage);
    } else if (selectedStyle.background) {
      switch (selectedStyle.background.type) {
        case 'solid':
          style.backgroundColor = selectedStyle.background.color || '#ffffff';
          if (selectedStyle.background.backgroundImage && selectedStyle.background.backgroundImage !== 'none') {
            style.backgroundImage = selectedStyle.background.backgroundImage;
            style.backgroundSize = 'cover';
            style.backgroundPosition = 'center';
            style.backgroundRepeat = 'no-repeat';
          } else if (selectedStyle.pattern && selectedStyle.pattern !== 'none') {
            if (patternTemplates[selectedStyle.pattern]) {
              style.backgroundImage = patternTemplates[selectedStyle.pattern].pattern;
              style.backgroundSize = patternTemplates[selectedStyle.pattern].size;
              style.backgroundRepeat = 'repeat';
            }
          }
          break;
        case 'gradient':
          style.backgroundImage = selectedStyle.background.gradient || 'none';
          style.backgroundColor = selectedStyle.background.color || 'initial';
          style.backgroundSize = 'cover';
          style.backgroundPosition = 'center';
          style.backgroundRepeat = 'no-repeat';
          break;
        default:
          style.backgroundColor = selectedStyle.background.color || '#ffffff';
      }
    } else {
      // Fallback case - handle backgroundColor and patterns directly on selectedStyle
      style.backgroundColor = selectedStyle.backgroundColor || '#ffffff';
      
      // Apply pattern if selected
      if (selectedStyle.pattern && selectedStyle.pattern !== 'none') {
        if (patternTemplates[selectedStyle.pattern]) {
          style.backgroundImage = patternTemplates[selectedStyle.pattern].pattern;
          style.backgroundSize = patternTemplates[selectedStyle.pattern].size;
          style.backgroundRepeat = 'repeat';
        }
      } else {
        style.backgroundImage = selectedStyle.backgroundImage || 'none';
      }
    }

    console.log("📱 Final background style:", style);
    return style;
  };

  const getPatternPreviewStyle = (pattern) => {
    let style = {};
    if (pattern && pattern !== 'none') {
      if (patternTemplates[pattern]) {
        style.backgroundImage = patternTemplates[pattern].pattern;
        style.backgroundSize = patternTemplates[pattern].size;
        style.backgroundRepeat = 'repeat';
      }
    }
    return style;
  };

  // Render tab content using our new components
  const renderTabContent = () => {
    switch(activeTab) {
      case 'background':
        return (
          <BackgroundTab 
            styleOptions={styleOptions}
            selectedStyleIndex={selectedStyleIndex}
            setSelectedStyleIndex={setSelectedStyleIndex}
            getPatternPreviewStyle={getPatternPreviewStyle}
          />
        );
      
      case 'content':
        return (
          <ContentTab 
            flierContent={flierContent}
            handleContentChange={handleContentChange}
            handleFlierPhotoUpload={handleFlierPhotoUpload}
            flierPhotoSource={flierPhotoSource}
            setFlierPhotoSource={setFlierPhotoSource}
            setFlierContent={setFlierContent}
            showFlierPhoto={showFlierPhoto}
            setShowFlierPhoto={setShowFlierPhoto}
          />
        );
      
      case 'style':
        return (
          <StyleTab 
            favoritePreset={favoritePreset}
            handleFavoritePresetChange={handleFavoritePresetChange}
            borderRadius={borderRadius}
            setBorderRadius={setBorderRadius}
            fontSize={fontSize}
            setFontSize={(value) => {
              setFontSize(value);
              setHasUserAdjustedFonts(true);
            }}
            bodyFontSize={bodyFontSize}
            setBodyFontSize={(value) => {
              setBodyFontSize(value);
              setHasUserAdjustedFonts(true);
            }}
            fontFamily={fontFamily}
            setFontFamily={(value) => {
              setFontFamily(value);
              setHasUserAdjustedFonts(true);
            }}
            selectedStyle={selectedStyle}
            handleStyleColorChange={handleStyleColorChange}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Box className="ai-flier-container">
      {/* Header */}
      <Box className="ai-flier-header" sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Flyer Builder Pro</Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleSaveFlier}
            sx={{ mr: 2 }}
          >
            SAVE
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleExportFlier}
          >
            EXPORT
          </Button>
        </Box>
      </Box>
            
      {/* Main content area with tabs */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        {/* Left panel - Style options */}
        <Box sx={{ 
          width: { xs: '100%', md: '300px' }, 
          backgroundColor: '#f9f9f9', 
          borderRadius: 2,
          p: 2,
          height: 'fit-content'
        }}>
          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* Tab Content */}
          {renderTabContent()}
        </Box>
        
        {/* Right panel - Flier Preview */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: 'fit-content'
        }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5 }}>Preview</Typography>
          <FlierPreview 
            flierRef={flierRef}
            flierContent={flierContent}
            selectedStyle={selectedStyle}
            getBackgroundStyle={getBackgroundStyle}
            useBackgroundImage={useBackgroundImage}
            uploadedBackgroundImage={uploadedBackgroundImage}
            backgroundImageOpacity={backgroundImageOpacity}
            showImageAsBackground={showImageAsBackground}
            uploadedImageOpacity={uploadedImageOpacity}
            showFlierPhoto={showFlierPhoto}
            borderRadius={borderRadius}
            fontSize={fontSize}
            bodyFontSize={bodyFontSize}
            fontFamily={fontFamily}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AIFlier; 