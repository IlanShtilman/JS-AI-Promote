import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import './AIFlier.css';

const FONT_OPTIONS = [
  { value: 'Heebo', label: 'Heebo' },
  { value: 'Assistant', label: 'Assistant' },
  { value: 'Rubik', label: 'Rubik' },
  { value: 'Arial', label: 'Arial' },
];

const VIBE_TEMPLATES = [
  {
    label: 'AI Suggestion',
    value: 'ai',
    getConfig: (config) => ({
      backgroundColor: config?.colorApplications?.background || '#ffffff',
      titleColor: config?.colorApplications?.title || '#000000',
      textColor: config?.colorApplications?.promotionalText || '#000000',
      titleFont: config?.fontSelections?.title || 'Heebo',
      textFont: config?.fontSelections?.promotionalText || 'Heebo',
    }),
    swatch: '#1976d2',
    font: 'Heebo',
    icon: '🤖',
  },
  {
    label: 'Green Apple',
    value: 'green',
    getConfig: () => ({
      backgroundColor: '#e8f5e9',
      titleColor: '#388e3c',
      textColor: '#1b5e20',
      titleFont: 'Rubik',
      textFont: 'Assistant',
    }),
    swatch: '#388e3c',
    font: 'Rubik',
    icon: '🍏',
  },
  {
    label: 'Sunny Orange',
    value: 'orange',
    getConfig: () => ({
      backgroundColor: '#fff3e0',
      titleColor: '#ef6c00',
      textColor: '#bf360c',
      titleFont: 'Rubik',
      textFont: 'Heebo',
    }),
    swatch: '#f57c00',
    font: 'Rubik',
    icon: '☀️',
  },
  {
    label: 'Google Cloud',
    value: 'google',
    getConfig: () => ({
      backgroundColor: '#e8f0fe',
      titleColor: '#4285f4',
      textColor: '#3c4043',
      titleFont: 'Arial',
      textFont: 'Assistant',
    }),
    swatch: '#4285f4',
    font: 'Arial',
    icon: '☁️',
  },
  {
    label: 'Meta Facebook',
    value: 'meta',
    getConfig: () => ({
      backgroundColor: '#e3f2fd',
      titleColor: '#1877f2',
      textColor: '#0a2540',
      titleFont: 'Arial',
      textFont: 'Heebo',
    }),
    swatch: '#1877f2',
    font: 'Arial',
    icon: '📘',
  },
  {
    label: 'Classic',
    value: 'classic',
    getConfig: () => ({
      backgroundColor: '#fff',
      titleColor: '#000',
      textColor: '#222',
      titleFont: 'Arial',
      textFont: 'Arial',
    }),
    swatch: '#000',
    font: 'Arial',
    icon: '🎩',
  },
];

const AIFlier = ({ config, flyerContent }) => {
  // Debug data flow
  console.log('AIFlier received:', { config, flyerContent });
  
  // All hooks must be called unconditionally at the top
  const isRTL = /[\u0590-\u05FF]/.test(flyerContent?.title || '');
  const [flierTitle, setFlierTitle] = useState(flyerContent?.title || '');
  // Make sure we use the promotional text from the AI (already properly passed in flyerContent)
  const [flierText, setFlierText] = useState(flyerContent?.promotionalText || '');
  const [backgroundColor, setBackgroundColor] = useState(config?.colorApplications?.background || '#ffffff');
  const [titleColor, setTitleColor] = useState(config?.colorApplications?.title || '#000000');
  const [textColor, setTextColor] = useState(config?.colorApplications?.promotionalText || '#000000');
  const [qrLink, setQrLink] = useState('');
  const [borderRadius, setBorderRadius] = useState(16);
  // Initialize with the user's uploaded photo from flyerContent.image
  const [uploadedImage, setUploadedImage] = useState(flyerContent?.image || null);
  const [isBackgroundImage, setIsBackgroundImage] = useState(false);
  const [imagePosition, setImagePosition] = useState(config?.elementPositions?.image
    ? { x: parseFloat(config.elementPositions.image.x) || 50, y: parseFloat(config.elementPositions.image.y) || 50 }
    : { x: 50, y: 50 });
  const imageRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragThreshold = useRef(5);
  const startPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const [titleFont, setTitleFont] = useState(config?.fontSelections?.title || 'Heebo');
  const [textFont, setTextFont] = useState(config?.fontSelections?.promotionalText || 'Heebo');
  const [titleSize, setTitleSize] = useState(40);
  const [textSize, setTextSize] = useState(18);
  // Get logo from flyerContent.logo
  const logo = flyerContent?.logo;
  // Vibe/template selection
  const [vibe, setVibe] = useState('ai');

  // Add a ref for the flyer canvas for capturing in download
  const flyerCanvasRef = useRef(null);

  // Apply vibe/template
  const handleVibeChange = (e) => {
    const selected = VIBE_TEMPLATES.find(v => v.value === e.target.value);
    setVibe(selected.value);
    const vibeConfig = selected.getConfig(config);
    setBackgroundColor(vibeConfig.backgroundColor);
    setTitleColor(vibeConfig.titleColor);
    setTextColor(vibeConfig.textColor);
    setTitleFont(vibeConfig.titleFont);
    setTextFont(vibeConfig.textFont);
  };

  // AI Suggestions apply handlers
  const applyAIColors = () => {
    setBackgroundColor(config?.colorApplications?.background || '#ffffff');
    setTitleColor(config?.colorApplications?.title || '#000000');
    setTextColor(config?.colorApplications?.promotionalText || '#000000');
  };
  const applyAIFonts = () => {
    setTitleFont(config?.fontSelections?.title || 'Heebo');
    setTextFont(config?.fontSelections?.promotionalText || 'Heebo');
  };
  const applyAIBackground = () => {
    setBackgroundColor(config?.colorApplications?.background || '#ffffff');
    setIsBackgroundImage(false); // AI suggestion is always color for now
  };
  const applyAILayout = () => {
    if (config?.elementPositions?.image) {
      setImagePosition({
        x: parseFloat(config.elementPositions.image.x) || 50,
        y: parseFloat(config.elementPositions.image.y) || 50
      });
    }
  };
  const resetToAI = () => {
    setFlierTitle(flyerContent?.title || '');
    setFlierText(flyerContent?.promotionalText || '');
    applyAIColors();
    applyAIFonts();
    applyAILayout();
    setBorderRadius(16);
    setQrLink('');
    setIsBackgroundImage(false);
    setVibe('ai');
  };

  // Drag logic for image
  const handleDragStart = (e) => {
    if (!isBackgroundImage && imageRef.current) {
      isDragging.current = true;
      startPos.current = {
        x: e.clientX,
        y: e.clientY
      };
      dragStart.current = {
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      };
      hasMoved.current = false;
      e.preventDefault();
    }
  };
  const handleDrag = (e) => {
    if (isDragging.current && !isBackgroundImage) {
      const deltaX = Math.abs(e.clientX - startPos.current.x);
      const deltaY = Math.abs(e.clientY - startPos.current.y);
      if (!hasMoved.current && (deltaX > dragThreshold.current || deltaY > dragThreshold.current)) {
        hasMoved.current = true;
      }
      if (hasMoved.current) {
        const newX = e.clientX - dragStart.current.x;
        const newY = e.clientY - dragStart.current.y;
        const roundedX = Math.round(newX / 10) * 10;
        const roundedY = Math.round(newY / 10) * 10;
        setImagePosition({
          x: Math.max(0, Math.min(100, roundedX)),
          y: Math.max(0, Math.min(100, roundedY))
        });
      }
      e.preventDefault();
    }
  };
  const handleDragEnd = () => {
    isDragging.current = false;
    hasMoved.current = false;
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [imagePosition, isBackgroundImage]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Download flyer functionality
  const handleDownloadFlier = () => {
    if (!flyerCanvasRef.current) return;
    
    // Add loading state or notification here if desired
    
    html2canvas(flyerCanvasRef.current, {
      scale: 2, // Higher quality
      logging: false,
      useCORS: true, // Allow cross-origin images
      allowTaint: true,
      backgroundColor: backgroundColor,
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'myBenefitz-flier.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }).catch(error => {
      console.error('Error downloading flyer:', error);
      alert('There was an error downloading your flyer. Please try again.');
    });
  };

  if (!config) return <div>No AI flyer config provided.</div>;

  // Calculate the height of the flyer preview for column height alignment
  const flyerHeight = 800; // The height of the flyer canvas
  const topMargin = 20; // Reduced the top margin of the side panels
  const sideColumnHeight = flyerHeight; // Match exactly to the flyer height
  
  return (
    <div className={`flier-designer-container ${isRTL ? 'rtl' : ''}`}>
      {/* Image Controls - Left side panel */}
      <div className="side-panel" style={{ height: `${sideColumnHeight}px`, marginTop: topMargin }}>
        <h3 className="panel-title">{isRTL ? 'הגדרות תמונה' : 'Image Settings'}</h3>
        
        <div 
          className={`image-preview ${uploadedImage ? 'image-preview-with-image' : ''}`} 
          style={uploadedImage ? { backgroundImage: `url(${uploadedImage})` } : {}}
        >
          {!uploadedImage && (
            <span className="no-image-text">{isRTL ? 'טרם נבחרה תמונה' : 'No image uploaded'}</span>
          )}
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="control-group">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="imageUpload"
            />
            <label htmlFor="imageUpload" className="image-upload-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
              </svg>
              {isRTL ? 'העלה תמונה' : 'Upload Image'}
            </label>
          </div>
          
          {uploadedImage && (
            <div className="switch-container">
              <span className="switch-label">{isRTL ? 'תמונת רקע' : 'Background Image'}</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isBackgroundImage}
                  onChange={(e) => setIsBackgroundImage(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          )}
        </div>
        
        {/* Back to Summary button */}
        <button 
          onClick={() => window.history.back()}
          className="back-button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
          </svg>
          {isRTL ? 'חזרה לסיכום' : 'Back to Summary'}
        </button>
        
        {/* Reset to AI button */}
        <button 
          onClick={resetToAI}
          className="reset-button"
        >
          <span style={{ fontSize: 18 }}>✨</span>
          {isRTL ? 'חזור להמלצות ה-AI' : 'Reset to AI Suggestions'}
        </button>
      </div>

      {/* Flier Preview */}
      <div className="flier-preview">
        <div
          ref={flyerCanvasRef}
          className="flier-canvas"
          style={{
            backgroundColor,
            borderRadius: `${borderRadius}px`,
            backgroundImage: isBackgroundImage && uploadedImage ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${uploadedImage})` : 'none',
          }}
        >
          <div className="phone-preview">
            <img 
              src="/assets/Phone-APP.png" 
              alt="myBenefitz App Preview" 
              className="phone-image"
            />
          </div>
          {logo && (
            <div className="flier-logo">
              <img src={logo} alt="Business Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          )}
          <h1 style={{ 
            color: titleColor,
            fontFamily: titleFont,
            fontSize: `${titleSize}px`,
            direction: isRTL ? 'rtl' : 'ltr',
            textAlign: 'center',
            width: '100%',
            margin: 0,
            marginRight: logo ? '0' : 'auto',
            marginLeft: logo ? '0' : 'auto',
            paddingLeft: logo ? '80px' : '0',
            lineHeight: 1.2,
            marginBottom: 10,
          }}>
            {flierTitle || (isRTL ? 'הכנס כותרת' : 'Your Title Here')}
          </h1>
          <p style={{ 
            color: textColor,
            fontFamily: textFont,
            fontSize: `${textSize}px`,
            direction: isRTL ? 'rtl' : 'ltr',
            textAlign: 'center',
            width: '100%',
            paddingLeft: logo ? '60px' : '0',
            whiteSpace: 'pre-wrap',
            margin: 0,
            lineHeight: 1.5,
          }}>
            {flierText || (isRTL ? 'הכנס טקסט פרסומי' : 'Enter your promotional text here')}
          </p>
          {uploadedImage && !isBackgroundImage && (
            <img
              ref={imageRef}
              src={uploadedImage}
              alt="Uploaded"
              className="flier-image-element"
              style={{
                left: `${imagePosition.x}%`,
                top: `${imagePosition.y}%`,
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
                zIndex: 3,
              }}
              onMouseDown={handleDragStart}
            />
          )}
          {qrLink && (
            <div className={`qr-code-container ${isRTL ? 'rtl' : ''}`}>
              <div className="qr-code">
                <QRCodeSVG value={qrLink} size={120} />
              </div>
              <div className="qr-instructions">
                <div className="qr-scan-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3H4V6H7V3Z" fill="currentColor"/>
                    <path d="M20 3H17V6H20V3Z" fill="currentColor"/>
                    <path d="M7 18H4V21H7V18Z" fill="currentColor"/>
                    <path d="M20 18H17V21H20V18Z" fill="currentColor"/>
                    <path d="M20 11H4V13H20V11Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="qr-text">
                  <p className="primary">{isRTL ? 'סרקו את הקוד לקבלת ההטבה' : 'Scan the code to get the benefit'}</p>
                  <p className="secondary">{isRTL ? 'פתחו את המצלמה בנייד' : 'Open your phone camera'}</p>
                  <p className="secondary">{isRTL ? 'כוונו לקוד וקבלו את ההטבה' : 'Point at the code and get your benefit'}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flier-footer">
            {isRTL ? (
              <>באפליקציה השכונתית <span className="brand-name">myBenefitz</span> תומכת בעסקים הקטנים השכונתיים</>
            ) : (
              <><span className="brand-name">myBenefitz</span> The neighborhood app supporting local small businesses</>
            )}
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="side-panel" style={{ height: `${sideColumnHeight}px`, marginTop: topMargin }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <div className="control-group">
            <label htmlFor="vibeSelect" style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              {isRTL ? 'סגנון / תבנית' : 'Vibe / Template'}
            </label>
            <select 
              id="vibeSelect" 
              value={vibe} 
              onChange={handleVibeChange} 
              className="form-control"
            >
              {VIBE_TEMPLATES.map(v => (
                <option key={v.value} value={v.value}>{v.icon} {v.label}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="flierTitle">{isRTL ? 'כותרת' : 'Title'}</label>
            <input
              type="text"
              id="flierTitle"
              value={flierTitle}
              onChange={(e) => setFlierTitle(e.target.value)}
              placeholder={flyerContent.title || (isRTL ? 'הכנס כותרת' : 'Enter title')}
              className={`form-control ${isRTL ? 'rtl-control' : ''}`}
            />
            <div className="font-controls" style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
              <select
                value={titleFont}
                onChange={(e) => setTitleFont(e.target.value)}
                title={isRTL ? 'בחר פונט' : 'Select font'}
                className="form-control"
                style={{ flex: 1 }}
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
              <input
                type="number"
                value={titleSize}
                onChange={(e) => setTitleSize(Number(e.target.value))}
                min="20"
                max="80"
                title={isRTL ? 'גודל פונט' : 'Font size'}
                className="form-control"
                style={{ width: 80 }}
              />
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="flierText">{isRTL ? 'טקסט' : 'Text'}</label>
            <textarea
              id="flierText"
              value={flierText}
              onChange={(e) => setFlierText(e.target.value)}
              placeholder={flyerContent.promotionalText || (isRTL ? 'הכנס טקסט פרסומי' : 'Enter promotional text')}
              className={`form-control ${isRTL ? 'rtl-control' : ''}`}
              style={{ height: 100, resize: 'vertical' }}
            />
            <div className="font-controls" style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
              <select
                value={textFont}
                onChange={(e) => setTextFont(e.target.value)}
                title={isRTL ? 'בחר פונט' : 'Select font'}
                className="form-control"
                style={{ flex: 1 }}
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
              <input
                type="number"
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
                min="12"
                max="40"
                title={isRTL ? 'גודל פונט' : 'Font size'}
                className="form-control"
                style={{ width: 80 }}
              />
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="borderRadius" style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              {isRTL ? 'עיגול פינות' : 'Border Radius'}
              <span style={{ display: 'inline-block', minWidth: 40, textAlign: 'center', marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}>{borderRadius}px</span>
            </label>
            <input
              type="range"
              id="borderRadius"
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              min="0"
              max="50"
              step="1"
              style={{ width: '100%', margin: '10px 0' }}
            />
          </div>

          <div className="control-group">
            <label htmlFor="qrLink">{isRTL ? 'קישור ל-QR' : 'QR Link'}</label>
            <input
              type="url"
              id="qrLink"
              value={qrLink}
              onChange={(e) => setQrLink(e.target.value)}
              placeholder={isRTL ? 'הכנס קישור ליצירת QR' : 'Enter link for QR code'}
              className="form-control"
            />
          </div>

          <div className="control-group">
            <label htmlFor="backgroundColor">{isRTL ? 'צבע רקע' : 'Background Color'}</label>
            <input
              type="color"
              id="backgroundColor"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="control-group">
            <label htmlFor="titleColor">{isRTL ? 'צבע כותרת' : 'Title Color'}</label>
            <input
              type="color"
              id="titleColor"
              value={titleColor}
              onChange={(e) => setTitleColor(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="control-group">
            <label htmlFor="textColor">{isRTL ? 'צבע טקסט' : 'Text Color'}</label>
            <input
              type="color"
              id="textColor"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="form-control"
            />
          </div>
        </div>
        
        <button 
          className="download-button"
          onClick={handleDownloadFlier}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
          </svg>
          {isRTL ? 'הורד פלייר' : 'Download Flier'}
        </button>
      </div>
    </div>
  );
};

export default AIFlier; 