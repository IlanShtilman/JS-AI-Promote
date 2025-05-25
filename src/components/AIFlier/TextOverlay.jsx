import React from 'react';
import './TextOverlay.css';

const TextOverlay = ({ 
  text, 
  position = 'center-right', 
  variant = 'solid',
  textColor = '#333333',
  className = ''
}) => {
  
  // Calculate adaptive sizing based on text length
  const getAdaptiveStyle = () => {
    const textLength = text.length;
    const lines = text.split('\n').length;
    
    // Adaptive border radius based on text length
    let borderRadius;
    if (textLength < 20) {
      borderRadius = '25px'; // Pill shape for short text
    } else if (textLength < 100) {
      borderRadius = '15px'; // Rounded for medium text
    } else {
      borderRadius = '10px'; // Subtle curves for long text
    }
    
    return {
      borderRadius,
      padding: textLength < 20 ? '12px 20px' : '16px 24px',
      minWidth: textLength < 20 ? 'auto' : '200px',
      maxWidth: textLength < 50 ? '300px' : '400px'
    };
  };
  
  // Get variant styles
  const getVariantStyle = () => {
    const adaptiveStyle = getAdaptiveStyle();
    
    const variants = {
      solid: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        color: textColor,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(8px)'
      },
      bubble: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        color: textColor,
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '20px'
      },
      curved: {
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        color: textColor,
        boxShadow: '0 6px 25px rgba(0, 0, 0, 0.12)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        transform: 'perspective(1000px) rotateX(2deg)'
      },
      shadow: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#ffffff',
        boxShadow: '0 10px 35px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }
    };
    
    return {
      ...variants[variant],
      ...adaptiveStyle
    };
  };
  
  // Position-specific styles
  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontWeight: '500',
      lineHeight: '1.4',
      zIndex: 10,
      transition: 'all 0.3s ease',
      animation: 'fadeInSlide 0.6s ease-out'
    };
    
    switch (position) {
      case 'top-right':
        return {
          ...baseStyle,
          top: '10%',
          right: '5%'
        };
      case 'center-right':
        return {
          ...baseStyle,
          top: '50%',
          right: '5%',
          transform: 'translateY(-50%)'
        };
      case 'bottom-center':
        return {
          ...baseStyle,
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%)'
        };
      case 'center':
        return {
          ...baseStyle,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
      case 'top-left':
        return {
          ...baseStyle,
          top: '10%',
          left: '5%'
        };
      case 'bottom-right':
        return {
          ...baseStyle,
          bottom: '15%',
          right: '5%'
        };
      default:
        return baseStyle;
    }
  };
  
  const combinedStyle = {
    ...getPositionStyle(),
    ...getVariantStyle()
  };
  
  return (
    <div 
      className={`text-overlay ${className}`}
      style={combinedStyle}
    >
      {text.split('\n').map((line, index) => (
        <div key={index} style={{ 
          marginBottom: index < text.split('\n').length - 1 ? '8px' : '0' 
        }}>
          {line}
        </div>
      ))}
    </div>
  );
};

export default TextOverlay; 