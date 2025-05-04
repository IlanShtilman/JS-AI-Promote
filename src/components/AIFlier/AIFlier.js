import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  TextField,
  IconButton,
  InputAdornment,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { patternTemplates, gradientTemplates } from '../../services/layoutEngine';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import PhotoIcon from '@mui/icons-material/Photo';
import LinkIcon from '@mui/icons-material/Link';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import html2canvas from 'html2canvas';
import './AIFlier.css';

const AIFlier = ({ config, flyerContent }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [gridSize, setGridSize] = useState(config?.gridSize || '3x3');
  const [background, setBackground] = useState(
    config?.colorApplications?.background || '#ffffff'
  );
  const [backgroundStyle, setBackgroundStyle] = useState('solid');
  const [customColors, setCustomColors] = useState({
    primary: config?.colorApplications?.title || '#000000',
    secondary: config?.colorApplications?.subtitle || '#333333',
    accent: config?.colorApplications?.accent || '#4caf50',
  });
  const [qrUrl, setQrUrl] = useState('https://example.com');
  const [qrText, setQrText] = useState(flyerContent?.callToAction || 'Scan to visit our website');
  const [exportMode, setExportMode] = useState(false);
  const [templateApplied, setTemplateApplied] = useState(false);
  const [isHebrewContent, setIsHebrewContent] = useState(false);
  const [editableTitle, setEditableTitle] = useState(flyerContent?.title || '');
  const [editablePromoText, setEditablePromoText] = useState(flyerContent?.promotionalText || '');
  
  const flierRef = useRef(null);

  // Detect if text contains Hebrew characters
  const containsHebrew = (text) => {
    if (!text) return false;
    const hebrewPattern = /[\u0590-\u05FF\uFB1D-\uFB4F]/;
    return hebrewPattern.test(text);
  };

  // Use the provided config from layout engine + AI suggestions
  useEffect(() => {
    if (config) {
      // Apply template if provided
      if (config.template) {
        setSelectedTemplate(config.template);
      }
      
      // Apply grid size if provided
      if (config.gridSize) {
        setGridSize(config.gridSize);
      }
      
      // Apply background if provided
      if (config.colorApplications?.background) {
        setBackground(config.colorApplications.background);
      }
      
      // Apply colors
      if (config.colorApplications) {
        setCustomColors({
          primary: config.colorApplications.title || '#000000',
          secondary: config.colorApplications.promotionalText || '#333333',
          accent: config.colorApplications.accent || '#4caf50',
        });
      }
      
      // Determine background style
      if (config.gradientType && config.gradientType !== 'none') {
        setBackgroundStyle('gradient');
      } else if (config.patternType && config.patternType !== 'none') {
        setBackgroundStyle('pattern');
      }
      
      console.log("Applied flier configuration:", config);
    }
    
    // Check if content is in Hebrew
    if (flyerContent) {
      const hasHebrewTitle = containsHebrew(flyerContent.title);
      const hasHebrewPromo = containsHebrew(flyerContent.promotionalText);
      setIsHebrewContent(hasHebrewTitle || hasHebrewPromo);
    }
  }, [config, flyerContent]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    
    // Apply template-specific styles and structure
    if (template === 'modern') {
      setBackgroundStyle('gradient');
      setCustomColors({
        ...customColors,
        primary: '#1976d2',
        secondary: '#333333'
      });
      setBackground('#e8f5fe');
      // Set grid size to match modern template
      setGridSize('3x3');
    } else if (template === 'elegant') {
      setBackgroundStyle('gradient');
      setCustomColors({
        ...customColors,
        primary: '#795548',
        secondary: '#5d4037'
      });
      setBackground('#fff8f0');
      // Set grid size for elegant template
      setGridSize('3x3');
    } else if (template === 'bold') {
      setBackgroundStyle('solid');
      setCustomColors({
        ...customColors,
        primary: '#d32f2f',
        secondary: '#333333'
      });
      setBackground('#ffebee');
      // Set grid size for bold template
      setGridSize('2x2');
    }
    
    // Show template applied toast
    setTemplateApplied(true);
    setTimeout(() => setTemplateApplied(false), 3000);
  };

  // Handle grid size change
  const handleGridSizeChange = (newSize) => {
    setGridSize(newSize);
    
    // Remove template classes to ensure grid changes take effect
    if (flierRef.current) {
      flierRef.current.classList.remove('modern-template', 'elegant-template', 'bold-template');
      // Force repaint to ensure grid changes are applied
      setTimeout(() => {
        if (flierRef.current) {
          flierRef.current.style.display = 'none';
          // Properly handle the offsetHeight to fix ESLint no-unused-expressions error
          const _ = flierRef.current.offsetHeight; // Use a dummy variable to avoid linter error
          flierRef.current.style.display = '';
        }
      }, 10);
    }
    
    // Clear selected template to ensure grid takes priority
    setSelectedTemplate('');
  };

  // Make sure the template grid gets applied correctly by modifying getGridTemplateAreas
  const getGridTemplateAreas = () => {
    // Template layouts have highest priority
    if (selectedTemplate === 'modern') {
      return '"a a b" "c c b" "c c d"';
    } else if (selectedTemplate === 'elegant') {
      return '"a a a" "b c d" "b c d"';
    } else if (selectedTemplate === 'bold') {
      return '"a a" "b b" "c d"';
    }
    
    // Fall back to grid size if no template or override requested
    if (gridSize === '2x2') {
      return '"a a" "b b"';
    } else if (gridSize === '3x3') {
      return '"a a b" "c c b" "c c d"';
    } else if (gridSize === '4x4') {
      return '"a a b b" "a a b b" "c c d d" "c c d d"';
    } else {
      return 'none';
    }
  };

  // Make sure the grid layout gets the right number of columns
  useEffect(() => {
    // If a template is selected, the template's grid structure should be used
    // This ensures that changing the grid size won't break the template layout
    if (flierRef.current && selectedTemplate) {
      const flierElement = flierRef.current;
      flierElement.classList.add(`${selectedTemplate}-template`);
    }
  }, [selectedTemplate]);

  // Update the getGridTemplateColumns function
  const getGridTemplateColumns = () => {
    if (selectedTemplate === 'modern') {
      return '1fr 1fr 1fr';
    } else if (selectedTemplate === 'elegant') {
      return '1fr 1fr 1fr';
    } else if (selectedTemplate === 'bold') {
      return '1fr 1fr';
    }
    
    // Default based on grid size
    if (gridSize === '2x2') {
      return '1fr 1fr';
    } else if (gridSize === '3x3') {
      return '1fr 1fr 1fr';
    } else {
      return '1fr 1fr 1fr 1fr';
    }
  };

  // Get background style based on configuration and template
  const getBackgroundStyle = () => {
    // Template-specific backgrounds
    if (selectedTemplate === 'modern' && backgroundStyle === 'gradient') {
      return {
        backgroundImage: 'linear-gradient(135deg, #e8f5fe 0%, #e0f0ff 100%)'
      };
    } else if (selectedTemplate === 'elegant' && backgroundStyle === 'gradient') {
      return {
        backgroundImage: 'linear-gradient(135deg, #fff8f0 0%, #fff0e0 100%)'
      };
    } else if (selectedTemplate === 'bold') {
      return {
        backgroundColor: '#ffebee'
      };
    }
    
    // Default background handling
    if (backgroundStyle === 'pattern' && config?.patternType && patternTemplates[config.patternType]) {
      return {
        backgroundImage: patternTemplates[config.patternType].pattern,
        backgroundSize: patternTemplates[config.patternType].size
      };
    }
    
    if (backgroundStyle === 'gradient' && config?.gradientType && gradientTemplates[config.gradientType]) {
      return {
        backgroundImage: gradientTemplates[config.gradientType]
      };
    }
    
    return { backgroundColor: background };
  };

  // Handle export/download
  const handleExportFlier = () => {
    if (!flierRef.current) return;
    
    setExportMode(true);
    setTimeout(() => {
      html2canvas(flierRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'my-flier.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        setExportMode(false);
      }).catch(error => {
        console.error('Error exporting flier:', error);
        setExportMode(false);
        alert('Failed to export flier. Please try again.');
      });
    }, 500);
  };

  return (
    <Box className="ai-flier-container">
      {/* Top Header with title and buttons */}
      <Box className="ai-flier-header">
        <Typography variant="h5" component="h1">Flyer Builder Pro</Typography>
        <Box className="ai-flier-header-actions">
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportFlier}
            className="header-button"
          >
            Export
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
            className="header-button"
          >
            Save
          </Button>
        </Box>
      </Box>
      
      {/* Main content area */}
      <Box className="ai-flier-main-content">
        {/* Left side - Editor panel */}
        <Box className="ai-flier-editor-container">
          <Paper elevation={0} className="ai-flier-editor">
            {/* Tabs for design controls */}
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              className="ai-flier-tabs"
              variant="fullWidth"
            >
              <Tab label="Template" icon={<PhotoIcon />} />
              <Tab label="Content" icon={<TextFormatIcon />} />
              <Tab label="Style" icon={<ColorLensIcon />} />
            </Tabs>
            
            <Box className="ai-flier-tab-content">
              {/* Template Tab */}
              {activeTab === 0 && (
                <Box className="ai-flier-template-selector">
                  <Typography variant="h6" gutterBottom>Choose a Template</Typography>
                  
                  <RadioGroup
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="ai-flier-template-grid"
                  >
                    <FormControlLabel 
                      value="modern" 
                      control={<Radio />} 
                      label={
                        <Box className="ai-flier-template-card">
                          <Box className="ai-flier-template-preview modern-preview"></Box>
                          <Typography variant="subtitle2">Modern Business</Typography>
                        </Box>
                      }
                      className="ai-flier-template-radio"
                    />
                    
                    <FormControlLabel 
                      value="elegant" 
                      control={<Radio />} 
                      label={
                        <Box className="ai-flier-template-card">
                          <Box className="ai-flier-template-preview elegant-preview"></Box>
                          <Typography variant="subtitle2">Elegant Promotion</Typography>
                        </Box>
                      }
                      className="ai-flier-template-radio"
                    />
                    
                    <FormControlLabel 
                      value="bold" 
                      control={<Radio />} 
                      label={
                        <Box className="ai-flier-template-card">
                          <Box className="ai-flier-template-preview bold-preview"></Box>
                          <Typography variant="subtitle2">Bold Impact</Typography>
                        </Box>
                      }
                      className="ai-flier-template-radio"
                    />
                  </RadioGroup>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Grid Layout</Typography>
                  
                  <Box className="ai-flier-grid-selector">
                    <Box className="ai-flier-grid-radio">
                      <input 
                        type="radio"
                        id="grid-none"
                        name="grid-size"
                        checked={gridSize === 'none'}
                        onChange={() => handleGridSizeChange('none')}
                      />
                      <label htmlFor="grid-none">No Grid</label>
                    </Box>
                    
                    <Box className="ai-flier-grid-radio">
                      <input 
                        type="radio"
                        id="grid-2x2"
                        name="grid-size"
                        checked={gridSize === '2x2'}
                        onChange={() => handleGridSizeChange('2x2')}
                      />
                      <label htmlFor="grid-2x2">
                        2×2 Grid
                        <Box className="grid-preview grid-2x2"></Box>
                      </label>
                    </Box>
                    
                    <Box className="ai-flier-grid-radio">
                      <input 
                        type="radio"
                        id="grid-3x3"
                        name="grid-size"
                        checked={gridSize === '3x3'}
                        onChange={() => handleGridSizeChange('3x3')}
                      />
                      <label htmlFor="grid-3x3">
                        3×3 Grid
                        <Box className="grid-preview grid-3x3"></Box>
                      </label>
                    </Box>
                    
                    <Box className="ai-flier-grid-radio">
                      <input 
                        type="radio"
                        id="grid-4x4"
                        name="grid-size"
                        checked={gridSize === '4x4'}
                        onChange={() => handleGridSizeChange('4x4')}
                      />
                      <label htmlFor="grid-4x4">
                        4×4 Grid
                        <Box className="grid-preview grid-4x4"></Box>
                      </label>
                    </Box>
                  </Box>
                </Box>
              )}
              
              {/* Content Tab */}
              {activeTab === 1 && (
                <Box className="ai-flier-content-editor">
                  <Typography variant="h6" gutterBottom>Edit Text</Typography>
                  
                  <TextField
                    label="Title"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                    dir={containsHebrew(editableTitle) ? "rtl" : "ltr"}
                  />
                  
                  <TextField
                    label="Promotional Text"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={3}
                    value={editablePromoText}
                    onChange={(e) => setEditablePromoText(e.target.value)}
                    dir={containsHebrew(editablePromoText) ? "rtl" : "ltr"}
                  />
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>QR Code</Typography>
                  
                  <TextField
                    label="Link URL"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={qrUrl}
                    onChange={(e) => setQrUrl(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    label="Instructions"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                  />
                  
                  <Box className="ai-flier-qr-preview">
                    <QRCodeSVG 
                      value={qrUrl} 
                      size={120} 
                    />
                  </Box>
                </Box>
              )}
              
              {/* Style Tab */}
              {activeTab === 2 && (
                <Box className="ai-flier-style-editor">
                  <Typography variant="h6" gutterBottom>Choose Background Style</Typography>
                  
                  <RadioGroup
                    value={backgroundStyle}
                    onChange={(e) => setBackgroundStyle(e.target.value)}
                    className="ai-flier-background-selector"
                  >
                    <FormControlLabel 
                      value="solid" 
                      control={<Radio />} 
                      label={
                        <Box className="ai-flier-style-option">
                          <Box className="ai-flier-bg-preview solid-preview"></Box>
                          <Typography variant="body2">Solid Color</Typography>
                        </Box>
                      }
                    />
                    
                    <FormControlLabel 
                      value="gradient" 
                      control={<Radio />} 
                      label={
                        <Box className="ai-flier-style-option">
                          <Box className="ai-flier-bg-preview warm-gradient-preview"></Box>
                          <Typography variant="body2">Gradient</Typography>
                        </Box>
                      }
                    />
                    
                    <FormControlLabel 
                      value="pattern" 
                      control={<Radio />} 
                      label={
                        <Box className="ai-flier-style-option">
                          <Box className="ai-flier-bg-preview dots-pattern-preview"></Box>
                          <Typography variant="body2">Pattern</Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Color Scheme</Typography>
                  
                  <Box className="ai-flier-color-inputs">
                    <Box className="ai-flier-color-row">
                      <Typography variant="subtitle2">Primary</Typography>
                      <Box 
                        className="ai-flier-color-swatch" 
                        sx={{ backgroundColor: customColors.primary }}
                      />
                      <TextField
                        size="small"
                        value={customColors.primary}
                        onChange={(e) => setCustomColors({...customColors, primary: e.target.value})}
                      />
                    </Box>
                    
                    <Box className="ai-flier-color-row">
                      <Typography variant="subtitle2">Secondary</Typography>
                      <Box 
                        className="ai-flier-color-swatch" 
                        sx={{ backgroundColor: customColors.secondary }}
                      />
                      <TextField
                        size="small"
                        value={customColors.secondary}
                        onChange={(e) => setCustomColors({...customColors, secondary: e.target.value})}
                      />
                    </Box>
                    
                    <Box className="ai-flier-color-row">
                      <Typography variant="subtitle2">Accent</Typography>
                      <Box 
                        className="ai-flier-color-swatch" 
                        sx={{ backgroundColor: customColors.accent }}
                      />
                      <TextField
                        size="small"
                        value={customColors.accent}
                        onChange={(e) => setCustomColors({...customColors, accent: e.target.value})}
                      />
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
            
            {config?.designRationale && (
              <Paper elevation={0} className="ai-flier-rationale">
                <Typography variant="subtitle2">Design Rationale:</Typography>
                <Typography variant="body2" component="p">{config.designRationale}</Typography>
              </Paper>
            )}
          </Paper>
        </Box>
        
        {/* Right side - Preview container */}
        <Box className="ai-flier-preview-container">
          <Typography variant="h6" className="preview-title">
            Preview
          </Typography>
          
          <Paper 
            elevation={3} 
            className={`ai-flier-preview ${exportMode ? 'export-mode' : ''} ${selectedTemplate}-template`}
            style={getBackgroundStyle()}
            ref={flierRef}
          >
            <Grid 
              container 
              className="ai-flier-grid"
              style={{
                gridTemplateAreas: getGridTemplateAreas(),
                gridTemplateColumns: getGridTemplateColumns()
              }}
            >
              {/* Title Area */}
              <Box className="ai-flier-grid-item title-area" style={{ gridArea: 'a' }}>
                {flyerContent.logo && (
                  <img 
                    src={flyerContent.logo} 
                    alt="Business Logo" 
                    className="ai-flier-logo"
                  />
                )}
                <Typography 
                  variant="h4" 
                  className={`ai-flier-title ${containsHebrew(editableTitle) ? 'rtl-text' : ''}`}
                  style={{ color: customColors.primary }}
                >
                  {editableTitle}
                </Typography>
                {editablePromoText && (
                  <Typography 
                    variant="body1"
                    className={`ai-flier-promo-text ${containsHebrew(editablePromoText) ? 'rtl-text' : ''}`}
                    style={{ color: customColors.secondary }}
                  >
                    {editablePromoText}
                  </Typography>
                )}
              </Box>
              
              {/* Image Area */}
              <Box className="ai-flier-grid-item image-area" style={{ gridArea: 'b' }}>
                {flyerContent.image ? (
                  <img 
                    src={flyerContent.image} 
                    alt="Promotional Image" 
                    className="ai-flier-image"
                  />
                ) : (
                  <Box className="ai-flier-placeholder">
                    <Typography variant="body2" color="textSecondary">
                      Image Placeholder
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Secondary Content Area */}
              <Box className="ai-flier-grid-item content-area" style={{ gridArea: 'c' }}>
                <Typography 
                  variant="h6"
                  className="rtl-text"
                  style={{ 
                    color: customColors.primary,
                    fontFamily: config?.fontSelections?.title || 'Heebo'
                  }}
                >
                  באפליקציה השכונתית
                </Typography>
                <Typography 
                  variant="h3"
                  style={{ 
                    color: "#00b2c8", // Teal/turquoise color to match the image exactly
                    fontWeight: "bold",
                    fontFamily: config?.fontSelections?.title || 'Heebo',
                    marginTop: "8px",
                    marginBottom: "8px",
                    letterSpacing: "0.5px",
                    textShadow: "0 1px 1px rgba(0,0,0,0.1)"
                  }}
                >
                  myBenefitz
                </Typography>
                <Typography 
                  variant="body2"
                  className="rtl-text"
                  style={{ 
                    color: customColors.secondary,
                    fontFamily: config?.fontSelections?.promotionalText || 'Assistant'
                  }}
                >
                  תומכת בעסקים הקטנים השכונתיים
                </Typography>
              </Box>
              
              {/* QR Code Area */}
              <Box className="ai-flier-grid-item qr-area" style={{ gridArea: 'd' }}>
                <QRCodeSVG 
                  value={qrUrl} 
                  size={120} 
                  className="ai-flier-qrcode"
                />
                <Typography 
                  variant="caption" 
                  align="center"
                  style={{ color: customColors.secondary }}
                >
                  {qrText}
                </Typography>
              </Box>
            </Grid>
          </Paper>
          
          {/* Template Applied Toast */}
          {templateApplied && (
            <Box className="template-applied-toast">
              <Typography variant="body2">
                Template "{selectedTemplate === 'modern' ? 'Modern Business' : 
                          selectedTemplate === 'elegant' ? 'Elegant Promotion' : 
                          'Bold Impact'}" applied
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AIFlier; 