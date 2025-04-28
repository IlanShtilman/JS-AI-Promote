import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './ManualFlierDesigner.css';

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
  // All hooks must be called unconditionally at the top
  const isRTL = /[\u0590-\u05FF]/.test(flyerContent?.title || '');
  const [flierTitle, setFlierTitle] = useState(flyerContent?.title || '');
  // Always use the user-selected AI text as default
  const [flierText, setFlierText] = useState(flyerContent?.promotionalText || '');
  const [backgroundColor, setBackgroundColor] = useState(config?.colorApplications?.background || '#ffffff');
  const [titleColor, setTitleColor] = useState(config?.colorApplications?.title || '#000000');
  const [textColor, setTextColor] = useState(config?.colorApplications?.promotionalText || '#000000');
  const [qrLink, setQrLink] = useState('');
  const [borderRadius, setBorderRadius] = useState(16);
  // Uploaded image is always the user's uploaded photo (not the logo)
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
  // Logo is always at the top-left
  const logo = flyerContent?.logo;
  // Vibe/template selection
  const [vibe, setVibe] = useState('ai');

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

  if (!config) return <div>No AI flyer config provided.</div>;

  return (
    <div className={`flier-designer-container ${isRTL ? 'rtl' : ''}`} style={{ display: 'flex', alignItems: 'stretch', minHeight: 700 }}>
      {/* Flyer Preview */}
      <div className="flier-preview" style={{ flex: 1, minHeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="flier-canvas"
          style={{
            backgroundColor,
            borderRadius: `${borderRadius}px`,
            minHeight: 600,
            minWidth: 400,
            position: 'relative',
            backgroundImage: isBackgroundImage && uploadedImage ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${uploadedImage})` : 'none',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
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
            <div className="flier-logo" style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
              <img src={logo} alt="Business Logo" style={{ maxWidth: 80, maxHeight: 80, borderRadius: 8 }} />
            </div>
          )}
          <h1 style={{ 
            color: titleColor,
            fontFamily: titleFont,
            fontSize: `${titleSize}px`,
            direction: isRTL ? 'rtl' : 'ltr',
            textAlign: 'center',
            width: '100%',
            marginTop: logo ? 100 : 32,
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
            whiteSpace: 'pre-wrap',
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
                maxWidth: '200px',
                maxHeight: '200px',
                transform: 'translate(-50%, -50%)',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              }}
              onMouseDown={handleDragStart}
            />
          )}
          {qrLink && (
            <div className="qr-code-container">
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
      {/* Controls and AI Suggestions Panel */}
      <div className="flier-controls" style={{ minWidth: 340, minHeight: 700, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        {/* Vibe/Template Combo Box */}
        <div className="control-group" style={{ marginBottom: 24 }}>
          <label htmlFor="vibeSelect" style={{ fontWeight: 600, fontSize: 16 }}>🎨 Vibe / Template</label>
          <select id="vibeSelect" value={vibe} onChange={handleVibeChange} style={{ fontSize: 15, marginTop: 8, padding: 6 }}>
            {VIBE_TEMPLATES.map(v => (
              <option key={v.value} value={v.value}>{v.icon} {v.label}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {VIBE_TEMPLATES.map(v => (
              <div key={v.value} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 18 }}>{v.icon}</span>
                <span style={{ width: 18, height: 18, background: v.swatch, borderRadius: 4, display: 'inline-block', border: '1px solid #ccc' }}></span>
                <span style={{ fontFamily: v.font, fontSize: 13, marginLeft: 2 }}>{v.font}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Rest of controls... */}
        <div className="control-group">
          <label htmlFor="flierTitle">{isRTL ? 'כותרת' : 'Title'}</label>
          <input
            type="text"
            id="flierTitle"
            value={flierTitle}
            onChange={(e) => setFlierTitle(e.target.value)}
            placeholder={flyerContent.title || (isRTL ? 'הכנס כותרת' : 'Enter title')}
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          />
          <div className="font-controls">
            <select
              value={titleFont}
              onChange={(e) => setTitleFont(e.target.value)}
              title={isRTL ? 'בחר פונט' : 'Select font'}
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
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          />
          <div className="font-controls">
            <select
              value={textFont}
              onChange={(e) => setTextFont(e.target.value)}
              title={isRTL ? 'בחר פונט' : 'Select font'}
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
            />
          </div>
        </div>
        <div className="control-group">
          <label htmlFor="borderRadius">
            {isRTL ? 'עיגול פינות' : 'Border Radius'}
            <span className="radius-value">{borderRadius}px</span>
          </label>
          <input
            type="range"
            id="borderRadius"
            value={borderRadius}
            onChange={(e) => setBorderRadius(Number(e.target.value))}
            min="0"
            max="50"
            step="1"
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
          />
        </div>
        <div className="control-group">
          <label htmlFor="backgroundColor">{isRTL ? 'צבע רקע' : 'Background Color'}</label>
          <input
            type="color"
            id="backgroundColor"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </div>
        <div className="control-group">
          <label htmlFor="titleColor">{isRTL ? 'צבע כותרת' : 'Title Color'}</label>
          <input
            type="color"
            id="titleColor"
            value={titleColor}
            onChange={(e) => setTitleColor(e.target.value)}
          />
        </div>
        <div className="control-group">
          <label htmlFor="textColor">{isRTL ? 'צבע טקסט' : 'Text Color'}</label>
          <input
            type="color"
            id="textColor"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
          />
        </div>
        <div className="control-group">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id="imageUpload2"
          />
          <label htmlFor="imageUpload2" className="image-upload-button">
            {isRTL ? 'העלה תמונה חדשה' : 'Upload New Image'}
          </label>
        </div>
        {uploadedImage && (
          <div className="switch-container">
            <span>{isRTL ? 'תמונת רקע' : 'Background Image'}</span>
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
        <button 
          className="download-button"
          onClick={() => {}}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
          </svg>
          {isRTL ? 'הורד פלייר' : 'Download Flier'}
        </button>
        {/* AI Suggestions Panel */}
        <div style={{ marginTop: 32, background: '#fafbfc', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>AI Suggestions</h2>
          <div style={{ fontSize: 15, color: '#333', marginBottom: 16 }}>
            <b>Fonts:</b> <span style={{ marginLeft: 8 }}>{config?.fontSelections?.title || 'Heebo'} / {config?.fontSelections?.promotionalText || 'Heebo'}</span>
            <button onClick={applyAIFonts} style={{ marginLeft: 8 }}>Apply</button>
          </div>
          <div style={{ fontSize: 15, color: '#333', marginBottom: 16 }}>
            <b>Colors:</b> <span style={{ marginLeft: 8 }}>BG: {config?.colorApplications?.background || '#fff'}, Title: {config?.colorApplications?.title || '#000'}, Text: {config?.colorApplications?.promotionalText || '#000'}</span>
            <button onClick={applyAIColors} style={{ marginLeft: 8 }}>Apply</button>
          </div>
          <div style={{ fontSize: 15, color: '#333', marginBottom: 16 }}>
            <b>Background:</b> <span style={{ marginLeft: 8 }}>{config?.colorApplications?.background || '#fff'}</span>
            <button onClick={applyAIBackground} style={{ marginLeft: 8 }}>Apply</button>
          </div>
          <button onClick={resetToAI} style={{ marginTop: 12, background: '#1976d2', color: '#fff', borderRadius: 8, padding: '8px 16px', border: 'none' }}>Reset to AI Suggestion</button>
        </div>
      </div>
    </div>
  );
};

export default AIFlier; 