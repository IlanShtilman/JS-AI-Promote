import React from 'react';

const AIFlier = ({ config, flyerContent }) => {
  // More precise positioning calculations
  const calculatePosition = (element) => {
    const pos = config.elementPositions[element];
    if (!pos) return {};
    return {
      position: 'absolute',
      left: pos.alignment === 'right' ? 'auto' : pos.x,
      right: pos.alignment === 'right' ? `${100 - parseFloat(pos.x)}%` : 'auto',
      top: pos.y,
      width: pos.width,
      textAlign: pos.alignment,
      direction: /[\u0590-\u05FF]/.test(flyerContent[element]) ? 'rtl' : 'ltr'
    };
  };

  return (
    <div className="flyer-container" style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      backgroundColor: config.colorApplications.background,
      padding: '20px',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      border: '1px solid #ddd'
    }}>
      {/* Logo */}
      {flyerContent.logo && (
        <img 
          src={flyerContent.logo} 
          alt="Logo"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            maxWidth: '100px',
            maxHeight: '60px'
          }}
        />
      )}
      {/* Title */}
      <div style={{
        ...calculatePosition('title'),
        fontSize: '32px',
        fontWeight: 'bold',
        color: config.colorApplications.title,
        fontFamily: config.fontSelections.title,
        margin: '20px 0'
      }}>
        {flyerContent.title}
      </div>
      {/* Main Image */}
      {flyerContent.image && (
        <div style={{
          ...calculatePosition('image'),
          textAlign: 'center',
          margin: '20px 0'
        }}>
          <img 
            src={flyerContent.image} 
            alt="Promotional Image"
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              objectFit: 'contain'
            }}
          />
        </div>
      )}
      {/* Promotional Text */}
      <div style={{
        ...calculatePosition('promotionalText'),
        fontSize: '18px',
        lineHeight: '1.5',
        color: config.colorApplications.promotionalText,
        fontFamily: config.fontSelections.promotionalText,
        margin: '20px 0'
      }}>
        {flyerContent.promotionalText}
      </div>
      {/* CTA Button */}
      <div style={{
        ...calculatePosition('callToAction'),
        padding: '10px 20px',
        backgroundColor: config.colorApplications.callToAction,
        color: '#FFFFFF',
        fontWeight: 'bold',
        borderRadius: '5px',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        margin: '20px 0'
      }}>
        {flyerContent.callToAction}
      </div>
    </div>
  );
};

export default AIFlier; 