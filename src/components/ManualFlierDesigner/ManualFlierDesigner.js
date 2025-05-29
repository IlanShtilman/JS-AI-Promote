import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { FLIER_DESIGNER_CONFIG, getTextContent, formatText } from './ManualFlierDesignerConfig';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ImageIcon from '@mui/icons-material/Image';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import './ManualFlierDesigner.css';

const ManualFlierDesigner = ({ title: initialTitle, selectedText, promotionText, language, logo, onBack }) => {
  const config = FLIER_DESIGNER_CONFIG;
  const t = (key) => getTextContent(language, key);

  // State initialization using config defaults
  const [flierTitle, setFlierTitle] = useState(initialTitle || config.DEFAULTS.title);
  const [flierText, setFlierText] = useState(selectedText || promotionText || config.DEFAULTS.text);
  const [backgroundColor, setBackgroundColor] = useState(config.DEFAULTS.backgroundColor);
  const [titleColor, setTitleColor] = useState(config.DEFAULTS.titleColor);
  const [textColor, setTextColor] = useState(config.DEFAULTS.textColor);
  const [qrLink, setQrLink] = useState(config.DEFAULTS.qrLink);
  const [borderRadius, setBorderRadius] = useState(config.DEFAULTS.borderRadius);
  
  // Image controls
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isBackgroundImage, setIsBackgroundImage] = useState(config.DEFAULTS.isBackgroundImage);
  const [imagePosition, setImagePosition] = useState(config.DEFAULTS.imagePosition);
  const imageRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragThreshold = useRef(config.IMAGE.dragThreshold);
  const startPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  // Font controls
  const [titleFont, setTitleFont] = useState(config.DEFAULTS.titleFont);
  const [textFont, setTextFont] = useState(config.DEFAULTS.textFont);
  const [titleSize, setTitleSize] = useState(config.DEFAULTS.titleSize);
  const [textSize, setTextSize] = useState(config.DEFAULTS.textSize);

  const isRTL = language === 'Hebrew';

  const flierRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && config.SUPPORTED_IMAGE_TYPES.includes(file.type)) {
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

  const handleDrag = useCallback((e) => {
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
        
        // Round to nearest configured factor for smooth movement
        const roundingFactor = config.IMAGE.roundingFactor;
        const roundedX = Math.round(newX / roundingFactor) * roundingFactor;
        const roundedY = Math.round(newY / roundingFactor) * roundingFactor;
        
        setImagePosition({
          x: Math.max(config.LIMITS.imagePosition.min, Math.min(config.LIMITS.imagePosition.max, roundedX)),
          y: Math.max(config.LIMITS.imagePosition.min, Math.min(config.LIMITS.imagePosition.max, roundedY))
        });
      }
      e.preventDefault();
    }
  }, [isBackgroundImage, config.IMAGE.roundingFactor, config.LIMITS.imagePosition]);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    hasMoved.current = false;
  }, []);

  const handleDownload = async () => {
    if (flierRef.current) {
      try {
        const canvas = await html2canvas(flierRef.current, {
          scale: config.DOWNLOAD.scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
        });
        
        const link = document.createElement('a');
        link.download = config.DOWNLOAD.filename;
        link.href = canvas.toDataURL(config.DOWNLOAD.format);
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
  }, [initialTitle, selectedText, promotionText, handleDrag, handleDragEnd]);

  return (
    <>
      {/* Back button header */}
      <div className="manual-flier-designer-header">
        <button 
          className="manual-flier-designer-back-btn"
          onClick={onBack}
          aria-label={t('backToModeSelection')}
        >
          <ArrowBackIcon />
          {t('backToModeSelection')}
        </button>
      </div>

      <div className={`flier-designer-container ${isRTL ? 'rtl' : ''}`}>
        <div className="image-controls">
          <h3>{t('imageSettings')}</h3>
          <div className="image-preview" style={uploadedImage ? { backgroundImage: `url(${uploadedImage})` } : {}}>
            {!uploadedImage && (
              <span>{t('noImageUploaded')}</span>
            )}
          </div>
          <div className="control-group">
            <input
              type="file"
              accept={config.SUPPORTED_IMAGE_TYPES.join(',')}
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="imageUpload"
            />
            <label htmlFor="imageUpload" className="image-upload-button">
              <ImageIcon />
              {t('uploadImage')}
            </label>
          </div>
          {uploadedImage && (
            <div className="switch-container">
              <span>{t('backgroundImage')}</span>
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
                src={config.PHONE_PREVIEW.imagePath}
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
              {flierTitle || t('yourTitleHere')}
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
              {flierText || t('enterPromotionalTextHere')}
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
                  <QRCodeSVG value={qrLink} size={config.QR_CODE.size} />
                </div>
                <div className="qr-instructions">
                  <div className="qr-scan-icon">
                    <QrCodeScannerIcon />
                  </div>
                  <div className="qr-text">
                    <p className="primary">{t('qrPrimary')}</p>
                    <p className="secondary">{t('qrSecondary1')}</p>
                    <p className="secondary">{t('qrSecondary2')}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flier-footer">
              {formatText(t('footerText'), { brandName: config.FOOTER.brandName })}
            </div>
          </div>
        </div>

        <div className="flier-controls">
          <div className="control-group">
            <label htmlFor="flierTitle">{t('title')}</label>
            <input
              type="text"
              id="flierTitle"
              value={flierTitle}
              onChange={(e) => setFlierTitle(e.target.value)}
              placeholder={initialTitle || t('enterTitle')}
              style={{ direction: isRTL ? 'rtl' : 'ltr' }}
            />
            <div className="font-controls">
              <select
                value={titleFont}
                onChange={(e) => setTitleFont(e.target.value)}
                title={t('selectFont')}
              >
                {config.FONT_OPTIONS.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
              <input
                type="number"
                value={titleSize}
                onChange={(e) => setTitleSize(Number(e.target.value))}
                min={config.LIMITS.titleSize.min}
                max={config.LIMITS.titleSize.max}
                step={config.LIMITS.titleSize.step}
                title={t('fontSize')}
              />
            </div>
          </div>
          <div className="control-group">
            <label htmlFor="flierText">{t('text')}</label>
            <textarea
              id="flierText"
              value={flierText}
              onChange={(e) => setFlierText(e.target.value)}
              placeholder={selectedText || promotionText || t('enterPromotionalText')}
              style={{ direction: isRTL ? 'rtl' : 'ltr' }}
            />
            <div className="font-controls">
              <select
                value={textFont}
                onChange={(e) => setTextFont(e.target.value)}
                title={t('selectFont')}
              >
                {config.FONT_OPTIONS.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
              <input
                type="number"
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
                min={config.LIMITS.textSize.min}
                max={config.LIMITS.textSize.max}
                step={config.LIMITS.textSize.step}
                title={t('fontSize')}
              />
            </div>
          </div>
          <div className="control-group">
            <label htmlFor="borderRadius">
              {t('borderRadius')}
              <span className="radius-value">{borderRadius}px</span>
            </label>
            <input
              type="range"
              id="borderRadius"
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              min={config.LIMITS.borderRadius.min}
              max={config.LIMITS.borderRadius.max}
              step={config.LIMITS.borderRadius.step}
            />
          </div>
          <div className="control-group">
            <label htmlFor="qrLink">{t('qrLink')}</label>
            <input
              type="url"
              id="qrLink"
              value={qrLink}
              onChange={(e) => setQrLink(e.target.value)}
              placeholder={t('enterLinkForQR')}
            />
          </div>
          <div className="control-group">
            <label htmlFor="backgroundColor">{t('backgroundColor')}</label>
            <input
              type="color"
              id="backgroundColor"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </div>
          <div className="control-group">
            <label htmlFor="titleColor">{t('titleColor')}</label>
            <input
              type="color"
              id="titleColor"
              value={titleColor}
              onChange={(e) => setTitleColor(e.target.value)}
            />
          </div>
          <div className="control-group">
            <label htmlFor="textColor">{t('textColor')}</label>
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
            <FileDownloadIcon />
            {t('downloadFlier')}
          </button>
        </div>
      </div>
    </>
  );
};

export default ManualFlierDesigner; 