import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import './ManualFlierDesigner/ManualFlierDesigner.css';

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
    <div className={`flier-designer-container ${isRTL ? 'rtl' : ''}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, padding: 20, maxWidth: '100%', margin: '0 auto' }}>
      {/* Image Controls - Now on the left side */}
      <div className="image-controls" style={{ 
        width: 320, 
        padding: 25, 
        backgroundColor: '#f8f9fa', 
        borderRadius: 12, 
        position: 'sticky', 
        top: 20, 
        marginTop: topMargin, 
        height: `${sideColumnHeight}px`, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
        zIndex: 20, 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: 20, color: '#2c3e50', fontWeight: 600 }}>{isRTL ? 'הגדרות תמונה' : 'Image Settings'}</h3>
        
        <div className="image-preview" style={uploadedImage ? { backgroundImage: `url(${uploadedImage})`, width: '100%', height: 200, border: '2px dashed #cbd5e0', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', transition: 'all 0.3s ease' } : { width: '100%', height: 200, border: '2px dashed #cbd5e0', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', transition: 'all 0.3s ease' }}>
          {!uploadedImage && (
            <span style={{ color: '#718096', fontSize: '1.1rem' }}>{isRTL ? 'טרם נבחרה תמונה' : 'No image uploaded'}</span>
          )}
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="control-group" style={{ backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 15, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="imageUpload"
            />
            <label htmlFor="imageUpload" className="image-upload-button" style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 0,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
              </svg>
              {isRTL ? 'העלה תמונה' : 'Upload Image'}
            </label>
          </div>
          
          {uploadedImage && (
            <div className="switch-container" style={{ 
              backgroundColor: 'white',
              padding: '12px 15px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 15,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              gap: 10
            }}>
              <span style={{ fontSize: '1rem', color: '#4a5568', fontWeight: 500, flex: 1 }}>{isRTL ? 'תמונת רקע' : 'Background Image'}</span>
              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: 52, height: 26, margin: 0 }}>
                <input
                  type="checkbox"
                  checked={isBackgroundImage}
                  onChange={(e) => setIsBackgroundImage(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span className="slider" style={{ 
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: isBackgroundImage ? '#4299e1' : '#cbd5e0',
                  transition: '.3s',
                  borderRadius: 26,
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: 20,
                    width: 20,
                    left: isBackgroundImage ? 29 : 3,
                    bottom: 3,
                    backgroundColor: 'white',
                    transition: '.3s',
                    borderRadius: '50%',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}></span>
                </span>
              </label>
            </div>
          )}
        </div>
        
        {/* Back to Summary button */}
        <button 
          onClick={() => window.history.back()}
          style={{ 
            marginTop: 'auto', 
            marginBottom: 10,
            background: '#e2e8f0', 
            color: '#2d3748', 
            border: 'none', 
            borderRadius: 8, 
            padding: '10px 16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 8,
            width: '100%',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
          </svg>
          {isRTL ? 'חזרה לסיכום' : 'Back to Summary'}
        </button>
        
        {/* Reset to AI button - moved to the bottom */}
        <button 
          onClick={resetToAI}
          style={{ 
            marginTop: 0, 
            background: '#f0f7ff', 
            color: '#0d47a1', 
            border: '1px solid #bfdaff', 
            borderRadius: 8, 
            padding: '10px 16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 8,
            width: '100%',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          <span style={{ fontSize: 18 }}>✨</span>
          {isRTL ? 'חזור להמלצות ה-AI' : 'Reset to AI Suggestions'}
        </button>
      </div>

      {/* Flyer Preview */}
      <div className="flier-preview" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          ref={flyerCanvasRef}
          className="flier-canvas"
          style={{
            backgroundColor,
            borderRadius: `${borderRadius}px`,
            width: 600,
            height: flyerHeight,
            position: 'relative',
            backgroundImage: isBackgroundImage && uploadedImage ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${uploadedImage})` : 'none',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            padding: 40,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div className="phone-preview" style={{ position: 'absolute', left: -180, top: '50%', transform: isRTL ? 'translateY(-50%) rotate(-15deg)' : 'translateY(-50%) rotate(15deg)', width: 600, height: 'auto', zIndex: 5, pointerEvents: 'none' }}>
            <img 
              src="/assets/Phone-APP.png" 
              alt="myBenefitz App Preview" 
              className="phone-image"
              style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))' }}
            />
          </div>
          {logo && (
            <div className="flier-logo" style={{ position: 'absolute', top: 20, left: 20, width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 8, zIndex: 2 }}>
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
                maxWidth: 300,
                maxHeight: 300,
                transform: 'translate(-50%, -50%)',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                zIndex: 3,
                cursor: 'move',
                userSelect: 'none',
              }}
              onMouseDown={handleDragStart}
            />
          )}
          {qrLink && (
            <div className="qr-code-container" style={{ position: 'absolute', left: isRTL ? 'auto' : 40, right: isRTL ? 40 : 'auto', bottom: 80, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20, zIndex: 2 }}>
              <div className="qr-code" style={{ background: 'white', padding: 10, borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                <QRCodeSVG value={qrLink} size={120} />
              </div>
              <div className="qr-instructions" style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '12px 16px', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.1)', maxWidth: 220 }}>
                <div className="qr-scan-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4299e1', marginTop: 3 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3H4V6H7V3Z" fill="currentColor"/>
                    <path d="M20 3H17V6H20V3Z" fill="currentColor"/>
                    <path d="M7 18H4V21H7V18Z" fill="currentColor"/>
                    <path d="M20 18H17V21H20V18Z" fill="currentColor"/>
                    <path d="M20 11H4V13H20V11Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="qr-text" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p className="primary" style={{ margin: 0, lineHeight: 1.3, fontSize: '0.95rem', color: '#2d3748', fontWeight: 600 }}>{isRTL ? 'סרקו את הקוד לקבלת ההטבה' : 'Scan the code to get the benefit'}</p>
                  <p className="secondary" style={{ margin: 0, lineHeight: 1.3, fontSize: '0.85rem', color: '#4a5568', fontWeight: 400 }}>{isRTL ? 'פתחו את המצלמה בנייד' : 'Open your phone camera'}</p>
                  <p className="secondary" style={{ margin: 0, lineHeight: 1.3, fontSize: '0.85rem', color: '#4a5568', fontWeight: 400 }}>{isRTL ? 'כוונו לקוד וקבלו את ההטבה' : 'Point at the code and get your benefit'}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flier-footer" style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', padding: 10, fontSize: '1em', fontFamily: 'Arial, sans-serif' }}>
            {isRTL ? (
              <>באפליקציה השכונתית <span className="brand-name" style={{ color: '#0b6bf2', fontWeight: 700 }}>myBenefitz</span> תומכת בעסקים הקטנים השכונתיים</>
            ) : (
              <><span className="brand-name" style={{ color: '#0b6bf2', fontWeight: 700 }}>myBenefitz</span> The neighborhood app supporting local small businesses</>
            )}
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="flier-controls" style={{ 
        width: 300, 
        padding: 20, 
        backgroundColor: '#f5f5f5', 
        borderRadius: 8, 
        position: 'sticky', 
        top: 20, 
        marginTop: topMargin, 
        height: `${sideColumnHeight}px`, 
        overflow: 'auto', 
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Vibe/Template Combo Box */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <div className="control-group" style={{ marginBottom: 15 }}>
            <label htmlFor="vibeSelect" style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              {isRTL ? 'סגנון / תבנית' : 'Vibe / Template'}
            </label>
            <select 
              id="vibeSelect" 
              value={vibe} 
              onChange={handleVibeChange} 
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, backgroundColor: 'white' }}
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
              style={{ 
                width: '100%', 
                padding: 8, 
                border: '1px solid #ddd', 
                borderRadius: 4, 
                backgroundColor: 'white',
                direction: isRTL ? 'rtl' : 'ltr' 
              }}
            />
            <div className="font-controls" style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
              <select
                value={titleFont}
                onChange={(e) => setTitleFont(e.target.value)}
                title={isRTL ? 'בחר פונט' : 'Select font'}
                style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 4, backgroundColor: 'white' }}
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
                style={{ width: 80, padding: 8, border: '1px solid #ddd', borderRadius: 4, backgroundColor: 'white' }}
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
              style={{ 
                width: '100%', 
                padding: 8, 
                border: '1px solid #ddd', 
                borderRadius: 4, 
                backgroundColor: 'white',
                direction: isRTL ? 'rtl' : 'ltr',
                height: 100,
                resize: 'vertical'
              }}
            />
            <div className="font-controls" style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
              <select
                value={textFont}
                onChange={(e) => setTextFont(e.target.value)}
                title={isRTL ? 'בחר פונט' : 'Select font'}
                style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 4, backgroundColor: 'white' }}
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
                style={{ width: 80, padding: 8, border: '1px solid #ddd', borderRadius: 4, backgroundColor: 'white' }}
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
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, backgroundColor: 'white' }}
            />
          </div>

          <div className="control-group">
            <label htmlFor="backgroundColor">{isRTL ? 'צבע רקע' : 'Background Color'}</label>
            <input
              type="color"
              id="backgroundColor"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, backgroundColor: 'white' }}
            />
          </div>

          <div className="control-group">
            <label htmlFor="titleColor">{isRTL ? 'צבע כותרת' : 'Title Color'}</label>
            <input
              type="color"
              id="titleColor"
              value={titleColor}
              onChange={(e) => setTitleColor(e.target.value)}
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, backgroundColor: 'white' }}
            />
          </div>

          <div className="control-group">
            <label htmlFor="textColor">{isRTL ? 'צבע טקסט' : 'Text Color'}</label>
            <input
              type="color"
              id="textColor"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, backgroundColor: 'white' }}
            />
          </div>
        </div>
        
        <button 
          className="download-button"
          onClick={handleDownloadFlier}
          style={{
            width: '100%',
            padding: '12px 20px',
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: '1.1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 'auto',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
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