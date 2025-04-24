import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import './ManualFlierDesigner.css';

const FONT_OPTIONS = [
  { value: 'Heebo', label: 'Heebo' },
  { value: 'Assistant', label: 'Assistant' },
  { value: 'Rubik', label: 'Rubik' },
];

const ManualFlierDesigner = ({ title: initialTitle, selectedText, promotionText, language, logo }) => {
  const [flierTitle, setFlierTitle] = useState(initialTitle || '');
  const [flierText, setFlierText] = useState(selectedText || promotionText || '');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [titleColor, setTitleColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#000000');
  const [qrLink, setQrLink] = useState('');
  const [borderRadius, setBorderRadius] = useState(0);
  
  // Image controls
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isBackgroundImage, setIsBackgroundImage] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 }); // percentage values
  const imageRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragThreshold = useRef(5); // minimum pixels to move before starting drag
  const startPos = useRef({ x: 0, y: 0 }); // initial click position
  const hasMoved = useRef(false);

  // Font controls
  const [titleFont, setTitleFont] = useState('Heebo');
  const [textFont, setTextFont] = useState('Heebo');
  const [titleSize, setTitleSize] = useState(40);
  const [textSize, setTextSize] = useState(18);

  const isRTL = language === 'Hebrew';

  const flierRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

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
      // Calculate distance moved
      const deltaX = Math.abs(e.clientX - startPos.current.x);
      const deltaY = Math.abs(e.clientY - startPos.current.y);
      
      // Only start moving if we've exceeded the threshold
      if (!hasMoved.current && (deltaX > dragThreshold.current || deltaY > dragThreshold.current)) {
        hasMoved.current = true;
      }
      
      if (hasMoved.current) {
        // Slow down movement by reducing sensitivity
        const newX = e.clientX - dragStart.current.x;
        const newY = e.clientY - dragStart.current.y;
        
        // Round to nearest 10 pixels for even smoother movement
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

  const handleDownload = async () => {
    if (flierRef.current) {
      try {
        const canvas = await html2canvas(flierRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
        });
        
        const link = document.createElement('a');
        link.download = 'mybenefitz-flier.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Error generating image:', error);
      }
    }
  };

  useEffect(() => {
    if (initialTitle) setFlierTitle(initialTitle);
    if (selectedText || promotionText) setFlierText(selectedText || promotionText);

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [initialTitle, selectedText, promotionText]);

  return (
    <div className={`flier-designer-container ${isRTL ? 'rtl' : ''}`}>
      <div className="image-controls">
        <h3>{isRTL ? 'הגדרות תמונה' : 'Image Settings'}</h3>
        <div className="image-preview" style={uploadedImage ? { backgroundImage: `url(${uploadedImage})` } : {}}>
          {!uploadedImage && (
            <span>{isRTL ? 'טרם נבחרה תמונה' : 'No image uploaded'}</span>
          )}
        </div>
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
      </div>

      <div className="flier-preview">
        <div
          ref={flierRef}
          className="flier-canvas"
          style={{
            backgroundColor: backgroundColor,
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
              <img src={logo} alt="Business Logo" />
            </div>
          )}
          <h1 style={{ 
            color: titleColor,
            fontFamily: titleFont,
            fontSize: `${titleSize}px`,
            direction: isRTL ? 'rtl' : 'ltr',
            textAlign: 'center',
            width: '100%',
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

      <div className="flier-controls">
        <div className="control-group">
          <label htmlFor="flierTitle">{isRTL ? 'כותרת' : 'Title'}</label>
          <input
            type="text"
            id="flierTitle"
            value={flierTitle}
            onChange={(e) => setFlierTitle(e.target.value)}
            placeholder={initialTitle || (isRTL ? 'הכנס כותרת' : 'Enter title')}
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
            placeholder={selectedText || promotionText || (isRTL ? 'הכנס טקסט פרסומי' : 'Enter promotional text')}
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
        <button 
          className="download-button"
          onClick={handleDownload}
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

export default ManualFlierDesigner; 