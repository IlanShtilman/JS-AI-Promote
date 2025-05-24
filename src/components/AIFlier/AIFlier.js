import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, Button, RadioGroup, FormControlLabel, Radio, Divider, Tooltip, Grid, Card, CardContent, TextField, IconButton, Slider, Switch, FormGroup, Select, MenuItem, InputLabel, FormControl, Checkbox } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import './AIFlier.css';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AppleIcon from '@mui/icons-material/Apple';
import FacebookIcon from '@mui/icons-material/Facebook';
import PaletteIcon from '@mui/icons-material/Palette';

// Helper function to detect RTL (Hebrew/Arabic) or LTR (default)
function getDirection(text) {
  if (/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/.test(text)) {
    return 'rtl';
  }
  return 'ltr';
}

// Pattern templates for background patterns
const patternTemplates = {
  dots: {
    pattern: 'radial-gradient(#0002 1px, transparent 1px)',
    size: '12px 12px'
  },
  grid: {
    pattern: 'linear-gradient(#0001 1px, transparent 1px), linear-gradient(90deg, #0001 1px, transparent 1px)',
    size: '20px 20px'
  },
  lines: {
    pattern: 'linear-gradient(45deg, #0001 1px, transparent 1px)',
    size: '10px 10px'
  },
  circles: {
    pattern: 'radial-gradient(circle, #0002 2px, transparent 2px)',
    size: '20px 20px'
  }
};

const AIFlier = ({ aiStyleOptions = [], flyerContent }) => {
  console.log("AIFlier received style options:", aiStyleOptions);
  
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);
  const [exportMode, setExportMode] = useState(false);
  const [activeTab, setActiveTab] = useState('template'); // 'template', 'content', 'style', or 'ground'
  const [flierContent, setFlierContent] = useState({
    title: flyerContent?.title || "באים לפה הרבה?",
    promotionalText: flyerContent?.promotionalText || "הַמְּבוּרְגֶּר המושלם מחכה לך! בשר עסיסי, גבינה נמסה, וטעם בלתי נשכח. בואו ותטעמו את ההבדל – רק אצלנו!",
    callToAction: flyerContent?.callToAction || "",
    qrUrl: flyerContent?.qrUrl || "https://example.com",
    logo: flyerContent?.logo || null,
    image: flyerContent?.image || null,
    qrInstructions: flyerContent?.qrInstructions || 'scan the QR code\nfill in the form\nget the discount',
    flierPhoto: null // New: photo to appear on flier, not as background
  });
  
  const [borderRadius, setBorderRadius] = useState(22);
  const [useBackgroundImage, setUseBackgroundImage] = useState(false);
  const [uploadedBackgroundImage, setUploadedBackgroundImage] = useState(null);
  const [fontSize, setFontSize] = useState(3.9);
  const [bodyFontSize, setBodyFontSize] = useState(1.7);
  const [fontFamily, setFontFamily] = useState('Roboto');
  const [showImageAsBackground, setShowImageAsBackground] = useState(false);
  const [backgroundImageOpacity, setBackgroundImageOpacity] = useState(0.1);
  const [uploadedImageOpacity, setUploadedImageOpacity] = useState(0.1);
  const [showFlierPhoto, setShowFlierPhoto] = useState(true); // New: control showing the flier photo
  const [flierPhotoSource, setFlierPhotoSource] = useState('upload'); // 'upload' or 'previous'
  
  const flierRef = useRef(null);

  // Make sure we have default style options if none are provided (update default structure)
  const [styleOptions, setStyleOptions] = useState(
    aiStyleOptions && aiStyleOptions.length > 0 ? aiStyleOptions : [{
      background: { type: 'solid', color: '#f0f8ff', gradient: null },
      textColor: '#333333',
      accentColor: '#1976d2',
      highlightColor: '#F1C40F', // Added default highlight color
      pattern: 'none',
      backgroundImage: 'none',
      designRationale: 'Default professional style with clean look and high readability'
    }]
  );
  
  // Set selected style and log it for debugging
  const selectedStyle = styleOptions[selectedStyleIndex];
  useEffect(() => {
    console.log("Selected style:", selectedStyle);
  }, [selectedStyleIndex, selectedStyle]);

  const handleExportFlier = () => {
    if (!flierRef.current) return;
    
    // Store original dimensions
    const originalWidth = flierRef.current.style.width;
    const originalHeight = flierRef.current.style.height;
    
    // Remove any inline dimensions to get natural size
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
      
      // Restore original dimensions
      flierRef.current.style.width = originalWidth;
      flierRef.current.style.height = originalHeight;
    });
  };

  const handleSaveFlier = () => {
    if (!flierRef.current) return;
    // Trigger save action here
    console.log("Save flier triggered");
  };
  
  const handleContentChange = (field) => (event) => {
    setFlierContent({
      ...flierContent,
      [field]: event.target.value
    });
  };
  
  // Add this function to handle pattern changes
  const handlePatternChange = (event) => {
    const newPattern = event.target.value;
    const updatedOptions = [...styleOptions];
    updatedOptions[selectedStyleIndex] = {
      ...updatedOptions[selectedStyleIndex],
      pattern: newPattern
    };
    setStyleOptions(updatedOptions);
  };
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFlierContent({
          ...flierContent,
          image: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
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

  // Handler for uploading a photo to the flier (not as background)
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

  // Enhanced background style function using pattern templates and new background structure
  const getBackgroundStyle = () => {
    let style = {};
    
    // Prioritize a main background image if provided at the top level or within the background object
    if (selectedStyle.backgroundImage && selectedStyle.backgroundImage !== 'none') {
        style.backgroundImage = selectedStyle.backgroundImage;
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'center';
        style.backgroundRepeat = 'no-repeat';
        // If a main image is present, other background types (solid, gradient, pattern) might be secondary
        // We can potentially layer patterns or SVGs on top if needed, but for now, let's prioritize the main image.

    } else if (selectedStyle.background) {
      switch (selectedStyle.background.type) {
        case 'solid':
          style.backgroundColor = selectedStyle.background.color || '#ffffff';
          // Layer pattern or background image from the background object if available for solid types
          if (selectedStyle.background.backgroundImage && selectedStyle.background.backgroundImage !== 'none') {
               // If the backend provided a specific background image for the solid type
                style.backgroundImage = selectedStyle.background.backgroundImage;
                style.backgroundSize = 'cover'; // Adjust as needed for SVGs vs images
                style.backgroundPosition = 'center'; // Adjust as needed
                style.backgroundRepeat = 'no-repeat'; // Adjust as needed
          } else if (selectedStyle.pattern && selectedStyle.pattern !== 'none') {
            // Otherwise, apply a pattern if specified and not 'none'
            if (patternTemplates[selectedStyle.pattern]) {
              style.backgroundImage = patternTemplates[selectedStyle.pattern].pattern;
              style.backgroundSize = patternTemplates[selectedStyle.pattern].size;
              style.backgroundRepeat = 'repeat';
            }
          }
          break;
          
        case 'gradient':
          // Apply gradient as the background image
          style.backgroundImage = selectedStyle.background.gradient || 'none';
          style.backgroundColor = selectedStyle.background.color || 'initial'; // Fallback color
          style.backgroundSize = 'cover'; // Ensure gradient covers the area
          style.backgroundPosition = 'center';
          style.backgroundRepeat = 'no-repeat';
          break;
          
        default:
          // Fallback for unknown types
          style.backgroundColor = selectedStyle.background.color || '#ffffff';
      }
    } else {
      // Fallback for older style options without the new structure
      style.backgroundColor = selectedStyle.backgroundColor || '#ffffff';
      style.backgroundImage = selectedStyle.backgroundImage || 'none';
    }

    return style;
  };

  // Function to get a pattern preview style 
  const getPatternPreviewStyle = (pattern) => {
    let style = {};
    if (pattern && pattern !== 'none') {
      if (patternTemplates[pattern]) {
        style.backgroundImage = patternTemplates[pattern].pattern;
        style.backgroundSize = patternTemplates[pattern].size;
      } else if (pattern === 'dots') {
        style.backgroundImage = 'radial-gradient(#0002 1px, transparent 1px)';
        style.backgroundSize = '12px 12px';
      } else if (pattern === 'grid') {
        style.backgroundImage = 'linear-gradient(#0001 1px, transparent 1px), linear-gradient(90deg, #0001 1px, transparent 1px)';
        style.backgroundSize = '20px 20px';
      }
    }
    return style;
  };

  // Handler for color changes in style options
  const handleStyleColorChange = (colorKey) => (event) => {
    const updatedOptions = [...styleOptions];
    updatedOptions[selectedStyleIndex] = {
      ...updatedOptions[selectedStyleIndex],
      [colorKey]: event.target.value
    };
    setStyleOptions(updatedOptions);
  };

  // Preset style options for 'Our Favorite'
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
    'Canva Style': {
      backgroundColor: '#eaf6fb',
      textColor: '#22223b',
      accentColor: '#00c4cc',
      pattern: 'dots',
      fontFamily: 'Montserrat, Lato, Arial, sans-serif',
      backgroundImage: "linear-gradient(135deg, #eaf6fb 0%, #b8c6db 50%, #fbc2eb 100%), url('data:image/svg+xml;utf8,<svg width=\"100%25\" height=\"100%25\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"60\" cy=\"60\" r=\"30\" fill=\"%2300c4cc\" fill-opacity=\"0.10\"/><circle cx=\"320\" cy=\"200\" r=\"50\" fill=\"%23fbc2eb\" fill-opacity=\"0.10\"/></svg>')"
    },
    'Facebook Meta': {
      backgroundColor: '#f0f2f5',
      textColor: '#050505',
      accentColor: '#0081FB',
      pattern: 'none',
      fontFamily: 'Helvetica Neue, Arial, sans-serif',
      backgroundImage: "linear-gradient(135deg, #f0f2f5 0%, #0081FB 60%, #1877f2 100%), url('data:image/svg+xml;utf8,<svg width=\"100%25\" height=\"100%25\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"320\" cy=\"80\" rx=\"80\" ry=\"40\" fill=\"%230081FB\" fill-opacity=\"0.08\"/><ellipse cx=\"100\" cy=\"300\" rx=\"60\" ry=\"30\" fill=\"%231877f2\" fill-opacity=\"0.06\"/></svg>')"
    },
    'Samsung': {
      backgroundColor: '#f7faff',
      textColor: '#1428a0',
      accentColor: '#00aaff',
      pattern: 'none',
      fontFamily: 'Roboto, Arial, sans-serif',
      backgroundImage: "linear-gradient(135deg, #f7faff 0%, #b3c6f7 40%, #00aaff 70%, #1428a0 100%), url('data:image/svg+xml;utf8,<svg width=\"100%25\" height=\"100%25\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"320\" cy=\"80\" rx=\"80\" ry=\"40\" fill=\"%2300aaff\" fill-opacity=\"0.06\"/><ellipse cx=\"100\" cy=\"300\" rx=\"60\" ry=\"30\" fill=\"%23b3c6f7\" fill-opacity=\"0.04\"/></svg>')"
    },
    'Nokia': {
      backgroundColor: '#f7faff',
      textColor: '#005AFF',
      accentColor: '#7ec0ee',
      pattern: 'none',
      fontFamily: 'Arial, sans-serif',
      backgroundImage: "linear-gradient(135deg, #f7faff 0%, #b3d1ff 60%, #005AFF 100%), url('data:image/svg+xml;utf8,<svg width=\"100%25\" height=\"100%25\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"320\" cy=\"80\" rx=\"80\" ry=\"40\" fill=\"%23005AFF\" fill-opacity=\"0.06\"/><ellipse cx=\"100\" cy=\"300\" rx=\"60\" ry=\"30\" fill=\"%23b3d1ff\" fill-opacity=\"0.04\"/></svg>')"
    },
    'HTC': {
      backgroundColor: '#f7faf7',
      textColor: '#8CC751',
      accentColor: '#cccccc',
      pattern: 'none',
      fontFamily: 'Arial, sans-serif',
      backgroundImage: "linear-gradient(135deg, #f7faf7 0%, #d6f5c7 60%, #8CC751 100%), url('data:image/svg+xml;utf8,<svg width=\"100%25\" height=\"100%25\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"320\" cy=\"80\" rx=\"80\" ry=\"40\" fill=\"%238CC751\" fill-opacity=\"0.06\"/><ellipse cx=\"100\" cy=\"300\" rx=\"60\" ry=\"30\" fill=\"%23d6f5c7\" fill-opacity=\"0.04\"/></svg>')"
    },
    'Sony': {
      backgroundColor: '#f7f7f7',
      textColor: '#222222',
      accentColor: '#7c8285',
      pattern: 'none',
      fontFamily: 'Arial, sans-serif',
      backgroundImage: "linear-gradient(135deg, #f7f7f7 0%, #bfbdb0 40%, #7c8285 80%, #fdd666 100%), url('data:image/svg+xml;utf8,<svg width=\"100%25\" height=\"100%25\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"320\" cy=\"80\" rx=\"80\" ry=\"40\" fill=\"%237c8285\" fill-opacity=\"0.06\"/><ellipse cx=\"100\" cy=\"300\" rx=\"60\" ry=\"30\" fill=\"%23fdd666\" fill-opacity=\"0.04\"/></svg>')"
    },
    'Netflix': {
      backgroundColor: '#f7f7f7',
      textColor: '#e50914',
      accentColor: '#221f1f',
      pattern: 'none',
      fontFamily: 'Arial Black, Arial, sans-serif',
      backgroundImage: "linear-gradient(135deg, #f7f7f7 0%, #fbcfd0 60%, #e50914 100%), url('data:image/svg+xml;utf8,<svg width=\"100%25\" height=\"100%25\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"320\" cy=\"80\" rx=\"80\" ry=\"40\" fill=\"%23e50914\" fill-opacity=\"0.06\"/><ellipse cx=\"100\" cy=\"300\" rx=\"60\" ry=\"30\" fill=\"%23fbcfd0\" fill-opacity=\"0.04\"/></svg>')"
    },
    'Android': {
      backgroundColor: '#f7faf7',
      textColor: '#222222',
      accentColor: '#a4c639',
      pattern: 'none',
      fontFamily: 'Roboto, Arial, sans-serif',
      backgroundImage: "linear-gradient(135deg, #f7faf7 0%, #b5ca75 60%, #a4c639 100%), url('data:image/svg+xml;utf8,<svg width=\"100%25\" height=\"100%25\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"320\" cy=\"80\" rx=\"80\" ry=\"40\" fill=\"%23a4c639\" fill-opacity=\"0.06\"/><ellipse cx=\"100\" cy=\"300\" rx=\"60\" ry=\"30\" fill=\"%23b5ca75\" fill-opacity=\"0.04\"/></svg>')"
    },
    'Xiaomi': {
      backgroundColor: '#fff7f0',
      textColor: '#ff6900',
      accentColor: '#222222',
      pattern: 'none',
      fontFamily: 'Arial, sans-serif',
      backgroundImage: "linear-gradient(135deg, #fff7f0 0%, #ffd6b3 60%, #ff6900 100%), url('data:image/svg+xml;utf8,<svg width=\"100%25\" height=\"100%25\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"320\" cy=\"80\" rx=\"80\" ry=\"40\" fill=\"%23ff6900\" fill-opacity=\"0.06\"/><ellipse cx=\"100\" cy=\"300\" rx=\"60\" ry=\"30\" fill=\"%23ffd6b3\" fill-opacity=\"0.04\"/></svg>')"
    },
  };
  const [favoritePreset, setFavoritePreset] = useState('AI Recommendation');

  // Handler for changing favorite preset
  const handleFavoritePresetChange = (event) => {
    const preset = event.target.value;
    setFavoritePreset(preset);
    const updatedOptions = [...styleOptions];
    if (preset === 'AI Recommendation') {
      // Merge with previous/AI style for AI Recommendation
      updatedOptions[selectedStyleIndex] = {
        ...updatedOptions[selectedStyleIndex],
        ...favoritePresets[preset],
      };
    } else {
      // For brand templates, use only the preset's values
      updatedOptions[selectedStyleIndex] = { ...favoritePresets[preset] };
    }
    setStyleOptions(updatedOptions);
    setFontFamily(favoritePresets[preset].fontFamily || 'Roboto');
  };

  // Function to render appropriate tab content
  const renderTabContent = () => {
    switch(activeTab) {
      case 'template':
        return (
          <>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Choose a Template</Typography>
            
            {/* AI Style Options - Redesigned as Cards */}
            <Box sx={{ mb: 3 }}>
                  <RadioGroup
                value={selectedStyleIndex}
                onChange={e => setSelectedStyleIndex(Number(e.target.value))}
              >
                <Grid container spacing={2}>
                  {styleOptions.map((style, idx) => (
                    <Grid item xs={12} key={idx}>
                      <Card 
                        sx={{ 
                          border: idx === selectedStyleIndex ? '2px solid #1976d2' : '1px solid #ddd',
                          borderRadius: 2,
                          boxShadow: idx === selectedStyleIndex ? '0 0 10px rgba(25, 118, 210, 0.3)' : 'none',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          overflow: 'hidden'
                        }}
                        onClick={() => setSelectedStyleIndex(idx)}
                      >
                        <Box 
                          sx={{
                            backgroundColor: style.backgroundColor || '#ffffff',
                            height: '60px',
                            position: 'relative',
                            ...getPatternPreviewStyle(style.pattern)
                          }}
                        />
                        <CardContent sx={{ p: 1.5 }}>
                    <FormControlLabel 
                            value={idx}
                      control={<Radio />} 
                      label={
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  Style {idx + 1}
                                </Typography>
                                <Box sx={{ display: 'flex', my: 1 }}>
                                  <Box 
                                    sx={{ 
                                      width: 25, 
                                      height: 25, 
                                      mr: 1, 
                                      borderRadius: '50%', 
                                      backgroundColor: style.backgroundColor || '#ffffff',
                                      border: '1px solid #ddd'
                                    }} 
                                    title="Background Color"
                                  />
                                  <Box 
                                    sx={{ 
                                      width: 25, 
                                      height: 25, 
                                      mr: 1, 
                                      borderRadius: '50%', 
                                      backgroundColor: style.textColor || '#000000',
                                      border: '1px solid #ddd'
                                    }} 
                                    title="Text Color"
                                  />
                                  <Box 
                                    sx={{ 
                                      width: 25, 
                                      height: 25, 
                                      borderRadius: '50%', 
                                      backgroundColor: style.accentColor || '#FFA726',
                                      border: '1px solid #ddd'
                                    }} 
                                    title="Accent Color"
                                  />
                    </Box>
                                <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                  {style.designRationale ? 
                                    (style.designRationale.length > 60 ? 
                                      style.designRationale.substring(0, 60) + '...' : 
                                      style.designRationale) : 
                                    `AI Style ${idx + 1}`}
                                </Typography>
                    </Box>
                      }
                            sx={{ display: 'flex', alignItems: 'flex-start', m: 0 }}
                    />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                  </RadioGroup>
                    </Box>
                    
            {/* Design rationale section */}
            <Box sx={{ 
              p: 1.5, 
              backgroundColor: 'rgba(0,0,0,0.03)', 
              borderRadius: 1, 
              border: '1px solid rgba(0,0,0,0.08)'
            }}>
              <Typography variant="caption" sx={{ display: 'block', color: '#555', fontWeight: 600, mb: 0.5 }}>
                Design Rationale:
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                {selectedStyle.designRationale || 'A professionally designed style for your flier.'}
              </Typography>
                    </Box>
          </>
        );
      
      case 'content':
        return (
          <>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Edit Content</Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Title"
                    value={flierContent.title}
                    onChange={handleContentChange('title')}
                    fullWidth
                    variant="outlined"
                    inputProps={{ dir: getDirection(flierContent.title) }}
                    sx={{ '& .MuiInputBase-input': { fontWeight: 'bold' } }}
                    helperText={<span dir={getDirection('כותרת ראשית של הפלייר')}>כותרת ראשית של הפלייר</span>}
                  />
                  
                  <TextField
                    label="Promotional Text"
                    value={flierContent.promotionalText}
                    onChange={handleContentChange('promotionalText')}
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    inputProps={{ dir: getDirection(flierContent.promotionalText) }}
                    helperText={<span dir={getDirection('כתבו את הטקסט הפרסומי')}>כתבו את הטקסט הפרסומי</span>}
                  />
                  
                  <TextField
                    label="QR Code URL"
                    value={flierContent.qrUrl}
                    onChange={handleContentChange('qrUrl')}
                    fullWidth
                    variant="outlined"
                    inputProps={{ dir: getDirection(flierContent.qrUrl) }}
                    helperText={<span dir={getDirection('הכתובת אליה יוביל קוד ה-QR')}>הכתובת אליה יוביל קוד ה-QR</span>}
                  />

                  <TextField
                    label="QR Instructions"
                    value={flierContent.qrInstructions}
                    onChange={handleContentChange('qrInstructions')}
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    inputProps={{ dir: getDirection(flierContent.qrInstructions) }}
                    helperText={<span dir={getDirection('הוראות מתחת לקוד ה-QR (שורה לכל הוראה)')}>הוראות מתחת לקוד ה-QR (שורה לכל הוראה)</span>}
                  />

                  {/* Add Photo to Flier (not as background) */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Add Photo to Flier</Typography>
                    <RadioGroup
                      row
                      value={flierPhotoSource}
                      onChange={e => {
                        setFlierPhotoSource(e.target.value);
                        if (e.target.value === 'previous') {
                          setFlierContent(prev => ({ ...prev, flierPhoto: prev.image }));
                          setShowFlierPhoto(true);
                        }
                        if (e.target.value === 'upload') {
                          setFlierContent(prev => ({ ...prev, flierPhoto: null }));
                          setShowFlierPhoto(false);
                        }
                      }}
                      sx={{ mb: 1 }}
                    >
                      <FormControlLabel
                        value="previous"
                        control={<Radio />}
                        label="Use previously uploaded photo"
                        disabled={!flierContent.image}
                      />
                      <FormControlLabel
                        value="upload"
                        control={<Radio />}
                        label="Upload new photo"
                      />
                    </RadioGroup>
                    {flierPhotoSource === 'upload' && (
                      <Button variant="outlined" component="label" fullWidth>
                        Upload Photo
                        <input 
                          type="file" 
                          hidden 
                          accept="image/*" 
                          onChange={handleFlierPhotoUpload}
                        />
                      </Button>
                    )}
                    {flierContent.flierPhoto && (
                      <Box sx={{ mt: 2, p: 1, border: '1px dashed #ccc', borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                          Photo on Flier:
                        </Typography>
                        <img 
                          src={flierContent.flierPhoto} 
                          alt="Flier Photo" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100px', 
                            display: 'block',
                            margin: '0 auto'
                          }} 
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={showFlierPhoto}
                              onChange={e => setShowFlierPhoto(e.target.checked)}
                            />
                          }
                          label="Show photo on flier"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Generate the food (locked) */}
                  <Box>
                    <Tooltip title="Coming soon: Generate food photo with AI" placement="top">
                      <span>
                        <Button variant="contained" color="secondary" fullWidth disabled startIcon={<span className="material-icons">lock</span>}>
                          Generate the food
                        </Button>
                      </span>
                    </Tooltip>
                  </Box>
            </Box>
          </>
        );
      
      case 'style':
        return (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Our Favorite</Typography>
              <FormControl fullWidth>
                <InputLabel id="favorite-preset-label">Choose a Style</InputLabel>
                <Select
                  labelId="favorite-preset-label"
                  value={favoritePreset}
                  label="Choose a Style"
                  onChange={handleFavoritePresetChange}
                >
                  <MenuItem value="AI Recommendation">
                    <AutoAwesomeIcon sx={{ mr: 1, color: '#fbc02d' }} /> AI Recommendation
                  </MenuItem>
                  <MenuItem value="Google Clean">
                    <Box sx={{ width: 20, height: 20, background: '#4285F4', borderRadius: '4px', display: 'inline-block', mr: 1, border: '1px solid #ccc' }} /> Google Clean
                  </MenuItem>
                  <MenuItem value="Apple Matte">
                    <AppleIcon sx={{ mr: 1, color: '#1d1d1f' }} /> Apple Matte
                  </MenuItem>
                  <MenuItem value="Canva Style">
                    <PaletteIcon sx={{ mr: 1, color: '#3ec6e0' }} /> Canva Style
                  </MenuItem>
                  <MenuItem value="Facebook Meta">
                    <FacebookIcon sx={{ mr: 1, color: '#1877f2' }} /> Facebook Meta
                  </MenuItem>
                  <MenuItem value="Samsung">
                    <span style={{fontSize: '1.2em', marginRight: 6}}>📱</span> Samsung
                  </MenuItem>
                  <MenuItem value="Nokia">
                    <span style={{fontSize: '1.2em', marginRight: 6}}>📞</span> Nokia
                  </MenuItem>
                  <MenuItem value="HTC">
                    <span style={{fontSize: '1.2em', marginRight: 6}}>🟩</span> HTC
                  </MenuItem>
                  <MenuItem value="Sony">
                    <span style={{fontSize: '1.2em', marginRight: 6}}>🎵</span> Sony
                  </MenuItem>
                  <MenuItem value="Netflix">
                    <span style={{fontSize: '1.2em', marginRight: 6}}>🎬</span> Netflix
                  </MenuItem>
                  <MenuItem value="Android">
                    <span style={{fontSize: '1.2em', marginRight: 6}}>🤖</span> Android
                  </MenuItem>
                  <MenuItem value="Xiaomi">
                    <span style={{fontSize: '1.2em', marginRight: 6}}>🟧</span> Xiaomi
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Style Options</Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Border radius control */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Border Radius: {borderRadius}px
                </Typography>
                <Slider
                  value={borderRadius}
                  onChange={(e, newValue) => setBorderRadius(newValue)}
                  min={0}
                  max={30}
                  step={1}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 0, label: '0' },
                    { value: 15, label: '15' },
                    { value: 30, label: '30' },
                  ]}
                />
              </Box>
                    
              {/* Font controls */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Title Font Size: {fontSize}rem
                </Typography>
                <Slider
                  value={fontSize}
                  onChange={(e, newValue) => setFontSize(newValue)}
                  min={1.5}
                  max={4}
                  step={0.1}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 1.5, label: 'S' },
                    { value: 2.5, label: 'M' },
                    { value: 4, label: 'L' },
                  ]}
                />
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Body Font Size: {bodyFontSize}rem
                </Typography>
                <Slider
                  value={bodyFontSize}
                  onChange={(e, newValue) => setBodyFontSize(newValue)}
                  min={0.8}
                  max={1.8}
                  step={0.05}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 0.8, label: 'S' },
                    { value: 1.2, label: 'M' },
                    { value: 1.8, label: 'L' },
                  ]}
                />
              </Box>
              
              <FormControl fullWidth>
                <InputLabel id="font-family-label">Font Family</InputLabel>
                <Select
                  labelId="font-family-label"
                  value={fontFamily}
                  label="Font Family"
                  onChange={(e) => setFontFamily(e.target.value)}
                >
                  <MenuItem value="Roboto">Roboto</MenuItem>
                  <MenuItem value="Arial">Arial</MenuItem>
                  <MenuItem value="Helvetica">Helvetica</MenuItem>
                  <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                  <MenuItem value="David">David</MenuItem>
                </Select>
              </FormControl>
                    
              {/* Display color pickers */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>Background Color</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: 1, 
                      border: '1px solid #ccc',
                      backgroundColor: selectedStyle.backgroundColor || '#ffffff',
                      cursor: 'pointer',
                      position: 'relative'
                    }} 
                    onClick={() => document.getElementById('bg-color-picker').click()}
                  >
                    <input
                      id="bg-color-picker"
                      type="color"
                      value={selectedStyle.backgroundColor || '#ffffff'}
                      onChange={handleStyleColorChange('backgroundColor')}
                      style={{ opacity: 0, width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, cursor: 'pointer' }}
                      tabIndex={-1}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {selectedStyle.backgroundColor || '#ffffff'}
                  </Typography>
                </Box>
              </Box>
                    
              <Box>
                <Typography variant="subtitle2" gutterBottom>Text Color</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: 1, 
                      border: '1px solid #ccc',
                      backgroundColor: selectedStyle.textColor || '#333333',
                      cursor: 'pointer',
                      position: 'relative'
                    }} 
                    onClick={() => document.getElementById('text-color-picker').click()}
                  >
                    <input
                      id="text-color-picker"
                      type="color"
                      value={selectedStyle.textColor || '#333333'}
                      onChange={handleStyleColorChange('textColor')}
                      style={{ opacity: 0, width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, cursor: 'pointer' }}
                      tabIndex={-1}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {selectedStyle.textColor || '#333333'}
                  </Typography>
                </Box>
              </Box>
                    
              <Box>
                <Typography variant="subtitle2" gutterBottom>Accent Color</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: 1, 
                      border: '1px solid #ccc',
                      backgroundColor: selectedStyle.accentColor || '#1976d2',
                      cursor: 'pointer',
                      position: 'relative'
                    }} 
                    onClick={() => document.getElementById('accent-color-picker').click()}
                  >
                    <input
                      id="accent-color-picker"
                      type="color"
                      value={selectedStyle.accentColor || '#1976d2'}
                      onChange={handleStyleColorChange('accentColor')}
                      style={{ opacity: 0, width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, cursor: 'pointer' }}
                      tabIndex={-1}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {selectedStyle.accentColor || '#1976d2'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        );

      case 'ground':
        return (
          <>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Background Options</Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Background pattern options */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>Background Pattern</Typography>
                <RadioGroup
                  value={selectedStyle.pattern || 'none'}
                  onChange={handlePatternChange}
                  name="background-pattern"
                  disabled={useBackgroundImage}
                >
                  <Grid container spacing={1}>
                    {['none', 'grid', 'dots', 'diagonal'].map(pattern => (
                      <Grid item xs={6} sm={3} key={pattern}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box 
                            sx={{
                              width: 50,
                              height: 50,
                              borderRadius: 1,
                              border: selectedStyle.pattern === pattern ? '2px solid #1976d2' : '1px solid #ddd',
                              ...getPatternPreviewStyle(pattern),
                              backgroundColor: pattern === 'none' ? '#ffffff' : 'transparent',
                              mb: 1,
                              cursor: 'pointer',
                              opacity: useBackgroundImage ? 0.5 : 1
                            }}
                            onClick={() => !useBackgroundImage && handlePatternChange({ target: { value: pattern } })}
                          />
                          <FormControlLabel
                            value={pattern}
                            control={<Radio size="small" disabled={useBackgroundImage} />}
                            label={
                              <Typography variant="caption">
                                {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                              </Typography>
                            }
                            sx={{ m: 0 }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </RadioGroup>
              </Box>

              {/* Background image upload */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>Background Image</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useBackgroundImage}
                      onChange={(e) => setUseBackgroundImage(e.target.checked)}
                      disabled={!uploadedBackgroundImage}
                    />
                  }
                  label="Use Image as Background"
                />
                {/* Opacity slider for background image */}
                {useBackgroundImage && uploadedBackgroundImage && (
                  <Box sx={{ mt: 1, mb: 1 }}>
                    <Typography variant="caption" sx={{ mb: 0.5 }}>Transparency</Typography>
                    <Slider
                      value={backgroundImageOpacity}
                      onChange={(e, value) => setBackgroundImageOpacity(value)}
                      min={0}
                      max={1}
                      step={0.01}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                )}
                <Button 
                  variant="outlined" 
                  component="label" 
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Upload Background Image
                  <input 
                    type="file" 
                    hidden 
                    accept="image/*" 
                    onChange={handleBackgroundImageUpload}
                  />
                </Button>
                
                {uploadedBackgroundImage && (
                  <Box sx={{ mt: 2, p: 1, border: '1px dashed #ccc', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      Background Image:
                    </Typography>
                    <img 
                      src={uploadedBackgroundImage} 
                      alt="Background" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100px', 
                        display: 'block',
                        margin: '0 auto'
                      }} 
                    />
                  </Box>
                )}
              </Box>

              {/* Use uploaded image as background option */}
              {flierContent.image && (
                <FormGroup>
                  <FormControlLabel 
                    control={
                      <Switch
                        checked={showImageAsBackground}
                        onChange={(e) => setShowImageAsBackground(e.target.checked)}
                      />
                    } 
                    label="Use Uploaded Image as Background" 
                  />
                  {/* Opacity slider for uploaded image as background */}
                  {showImageAsBackground && (
                    <Box sx={{ mt: 1, mb: 1 }}>
                      <Typography variant="caption" sx={{ mb: 0.5 }}>Transparency</Typography>
                      <Slider
                        value={uploadedImageOpacity}
                        onChange={(e, value) => setUploadedImageOpacity(value)}
                        min={0}
                        max={1}
                        step={0.01}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  )}
                </FormGroup>
              )}
            </Box>
          </>
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
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button 
              variant="contained" 
              sx={{ 
                width: '80px', 
                height: '80px', 
                mr: 1, 
                backgroundColor: activeTab === 'template' ? '#e3f2fd' : '#fff', 
                color: activeTab === 'template' ? '#1976d2' : '#666'
              }}
              onClick={() => setActiveTab('template')}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="material-icons">template</span>
                <Typography variant="caption">TEMPLATE</Typography>
              </Box>
            </Button>
            <Button 
              variant="contained" 
              sx={{ 
                width: '80px', 
                height: '80px', 
                mr: 1, 
                backgroundColor: activeTab === 'content' ? '#e3f2fd' : '#fff', 
                color: activeTab === 'content' ? '#1976d2' : '#666'
              }}
              onClick={() => setActiveTab('content')}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="material-icons">edit</span>
                <Typography variant="caption">CONTENT</Typography>
              </Box>
            </Button>
            <Button 
              variant="contained" 
              sx={{ 
                width: '80px', 
                height: '80px', 
                mr: 1, 
                backgroundColor: activeTab === 'style' ? '#e3f2fd' : '#fff', 
                color: activeTab === 'style' ? '#1976d2' : '#666'
              }}
              onClick={() => setActiveTab('style')}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="material-icons">palette</span>
                <Typography variant="caption">STYLE</Typography>
              </Box>
            </Button>
            <Button 
              variant="contained" 
              sx={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: activeTab === 'ground' ? '#e3f2fd' : '#fff', 
                color: activeTab === 'ground' ? '#1976d2' : '#666'
              }}
              onClick={() => setActiveTab('ground')}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="material-icons">wallpaper</span>
                <Typography variant="caption">GROUND</Typography>
              </Box>
            </Button>
          </Box>
        
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
          <Paper 
            elevation={3} 
            className={`ai-flier-preview ${exportMode ? 'export-mode' : ''}`}
            style={{
              ...(showImageAsBackground && flierContent.image ? {
                background: 'none',
              } : {
                ...getBackgroundStyle(),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }),
              borderRadius: `${borderRadius}px`,
            }}
            ref={flierRef}
            sx={{ 
              position: 'relative',
              height: { xs: '700px', md: '850px' }, 
              width: '100%',
              maxWidth: { xs: '450px', md: '580px' },
              margin: '0 auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
              overflow: 'hidden'
            }}
          >
            {/* Absolutely positioned background image for uploaded background image */}
            {useBackgroundImage && uploadedBackgroundImage ? (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 0,
                  pointerEvents: 'none',
                  backgroundImage: `url(${uploadedBackgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: backgroundImageOpacity,
                  transition: 'opacity 0.2s',
                }}
              />
            ) : (showImageAsBackground && flierContent.image) ? (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 0,
                  pointerEvents: 'none',
                  backgroundImage: `url(${flierContent.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: uploadedImageOpacity,
                  transition: 'opacity 0.2s',
                }}
              />
            ) : null}
            {/* Flier photo at bottom left corner */}
            {flierContent.flierPhoto && showFlierPhoto && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 70,
                  bottom: '12%',
                  zIndex: 2,
                  maxWidth: 300,
                  maxHeight: 300,
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
                  overflow: 'hidden',
                  background: '#fff',
                  p: 0.5
                }}
              >
                <img
                  src={flierContent.flierPhoto}
                  alt="Flier Photo"
                  style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 300 }}
                />
              </Box>
            )}
            {/* Main grid layout for flier with RTL support */}
            <Box className="flier-main-grid flier-content-rtl" sx={{
              position: 'relative',
              zIndex: 1,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' },
              gridTemplateRows: 'auto 1fr auto auto',
              height: '100%',
              gap: 2,
              padding: 2,
              overflow: 'hidden'
            }}>
              {/* Logo at top left */}
              <Box sx={{
                position: 'absolute',
                top: 15,
                left: 30,
                zIndex: 3,
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center'
              }}>
                {flierContent.logo && (
                  <img src={flierContent.logo} alt="Logo" className="ai-flier-logo" style={{ maxHeight: 100, maxWidth: 200 }} />
                )}
              </Box>
              
              {/* Phone image top-middle right */}
              <Box sx={{
                gridColumn: '2',
                gridRow: '1 / span 3',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                zIndex: 2,
                transform: 'translateX(35px)',
                width: '120%', // Wider than its container
                overflow: 'visible'
              }}>
                <img 
                  src="/assets/Phone-APP.png" 
                  alt="MyBenefitz App" 
                  style={{ 
                    maxWidth: '520px', 
                    width: '120%',
                    height: 'auto',
                    transform: 'rotate(-12deg) scale(1.5)',
                    filter: 'drop-shadow(0px 15px 20px rgba(0,0,0,0.25))'
                  }} 
                />
              </Box>
              
              {/* Left column - Title, Text, myBenefitz */}
              <Box sx={{
                gridColumn: '1',
                gridRow: '1 / span 3',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                pr: { xs: 2, md: 3 },
                pl: { xs: 2, md: 1 },
                overflow: 'hidden',
                mt: 5
              }}>
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  width: '100%',
                  mt: 0,
                  overflow: 'hidden'
                }}>
                  <Typography variant="h4" className="ai-flier-title" sx={{ 
                    color: selectedStyle.textColor, 
                    fontWeight: 800,
                    mb: 1.5,
                    fontSize: `${fontSize}rem`,
                    letterSpacing: '-0.5px',
                    textAlign: 'right',
                    fontFamily: fontFamily,
                    lineHeight: 1.1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%'
                  }}>
                    {flierContent.title}
                  </Typography>
                  <Typography variant="body1" className="ai-flier-promo-text" sx={{ 
                    color: selectedStyle.textColor, 
                    fontSize: `${bodyFontSize}rem`, 
                    fontWeight: 500,
                    mb: 2,
                    lineHeight: 1.5,
                    textAlign: 'right',
                    fontFamily: fontFamily,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%'
                  }}>
                    {flierContent.promotionalText}
                  </Typography>
                </Box>
                
                {/* MyBenefitz section - updated styling */}
                <Box sx={{ 
                  textAlign: 'right', 
                  width: '100%',
                  mt: 1,
                  mb: 2
                }}>
                  <Typography variant="body2" sx={{ 
                    color: selectedStyle.textColor, 
                    fontWeight: 400, 
                    fontFamily: fontFamily, 
                    fontSize: '1.2rem',
                    lineHeight: 1.2,
                    mb: 0.2
                  }}>
                    באפליקציה השכונתית
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    color: '#00b2c8', 
                    fontWeight: 600, 
                    letterSpacing: 0.5, 
                    fontFamily: fontFamily,
                    fontSize: '2rem',
                    lineHeight: 1.2,
                    mb: 0.2
                  }}>
                    myBenefitz
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: selectedStyle.textColor, 
                    fontFamily: fontFamily, 
                    fontSize: '1.2rem',
                    lineHeight: 1.1,
                    display: 'block'
                  }}>
                    תומכת בעסקים הקטנים השכונתיים
                  </Typography>
                </Box>
              </Box>
              
              {/* QR Code moved up, now in row 3 instead of row 4 */}
              <Box sx={{
                gridColumn: '1',
                gridRow: '3',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                width: '100%',
                mt: 2,
                mb: 1,
                ml: 2
              }}>
                {/* QR Code section */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <QRCodeSVG 
                    value={flierContent.qrUrl} 
                    size={110} 
                    bgColor={'#ffffff'}
                    fgColor={'#000000'}
                    level={"L"}
                    includeMargin={false}
                  />
                  {/* QR instructions from content */}
                  {flierContent.qrInstructions.split('\n').map((line, idx) => (
                    <Typography key={idx} variant="subtitle2" sx={{ 
                      color: selectedStyle.accentColor || selectedStyle.textColor, 
                      fontWeight: 600, 
                      mt: idx === 0 ? 1 : 0,
                      textAlign: 'center',
                      fontFamily: fontFamily,
                      fontSize: '0.85rem',
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    dir={getDirection(line)}
                    >
                      {line}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AIFlier; 