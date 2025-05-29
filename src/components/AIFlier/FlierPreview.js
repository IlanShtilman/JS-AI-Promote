import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';

// Helper function to detect RTL (Hebrew/Arabic) or LTR (default)
function getDirection(text) {
  if (/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/.test(text)) {
    return 'rtl';
  }
  return 'ltr';
}

const FlierPreview = ({ 
  flierRef,
  flierContent,
  selectedStyle,
  getBackgroundStyle,
  useBackgroundImage,
  uploadedBackgroundImage,
  backgroundImageOpacity,
  showImageAsBackground,
  uploadedImageOpacity,
  showFlierPhoto,
  borderRadius,
  fontSize,
  bodyFontSize,
  fontFamily,
  // Text overlays are always enabled
}) => {
  
  // Helper function to get smart background colors from the color palette
  const getSmartBackgroundColor = (elementType) => {
    // Get colors from the Azure Vision analysis
    const primaryColor = selectedStyle?.primaryColor || '#1a4a52';
    const secondaryColor = selectedStyle?.secondaryColor || '#F5F5DC';
    const accentColor = selectedStyle?.accentColor || '#8B4513';
    const textColor = selectedStyle?.textColor || '#333333';
    
    // Convert hex to rgba for transparency
    const hexToRgba = (hex, alpha = 0.9) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    // Determine if a color is light or dark
    const isLightColor = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128;
    };
    
    switch (elementType) {
             case 'title':
         // Glass effect for title - semi-transparent with blur
         return {
           backgroundColor: hexToRgba(secondaryColor, 0.25),
           borderColor: hexToRgba(primaryColor, 0.4),
           textColor: textColor || '#333333'
         };
      case 'promotional':
        // Use primary color with high transparency for promotional text
        return {
          backgroundColor: hexToRgba(primaryColor, 0.15),
          borderColor: hexToRgba(primaryColor, 0.4),
          textColor: textColor
        };
      case 'mybenefitz':
        // Use accent color for MyBenefitz section
        return {
          backgroundColor: hexToRgba(accentColor, 0.2),
          borderColor: hexToRgba(accentColor, 0.5),
          textColor: textColor
        };
      case 'qr':
        // Use white/light background for QR code for maximum contrast
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderColor: hexToRgba(primaryColor, 0.3),
          textColor: textColor
        };
      default:
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          textColor: textColor
        };
    }
  };
  return (
    <Paper 
      elevation={3} 
      className="ai-flier-preview"
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
      {/* Background images */}
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

      {/* Single overlay covering the entire flyer */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // Light transparent overlay
        backdropFilter: 'blur(2px)', // Subtle blur effect
        pointerEvents: 'none' // Allow clicks to pass through
      }} />

      {/* Main grid layout for flier with RTL support */}
      <Box className="flier-main-grid flier-content-rtl" sx={{
        position: 'relative',
        zIndex: 2, // Above the overlay
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' },
        gridTemplateRows: 'auto 1fr auto auto',
        height: '100%',
        gap: 2,
        padding: 2,
        overflow: 'hidden',
        opacity: 1 // Keep original content visible
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
          width: '120%',
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
              color: selectedStyle?.textColor || '#333333',
              fontWeight: selectedStyle.titleWeight || 800,
              mb: 1.5,
              fontSize: `${fontSize}rem`, // Use state value from slider
              letterSpacing: selectedStyle.letterSpacing || '-0.5px',
              lineHeight: selectedStyle.lineHeight || 1.1,
              textAlign: selectedStyle.textAlign || 'right',
              fontFamily: fontFamily,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%',
              // Remove individual background box - use global overlay instead
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' // Add text shadow for readability
            }}>
              {flierContent.title}
            </Typography>
            <Typography variant="body1" className="ai-flier-promo-text" sx={{ 
              color: selectedStyle?.textColor || '#333333',
              fontSize: `${bodyFontSize}rem`, // Use state value from slider
              fontWeight: selectedStyle.bodyWeight || 500,
              mb: 2,
              lineHeight: selectedStyle.lineHeight || 1.5,
              letterSpacing: selectedStyle.letterSpacing || 'normal',
              textAlign: selectedStyle.textAlign || 'right',
              fontFamily: fontFamily,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%',
              // Remove individual background box - use global overlay instead
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' // Add text shadow for readability
            }}>
              {flierContent.promotionalText}
            </Typography>
          </Box>
          
          {/* MyBenefitz section */}
          <Box sx={{ 
            textAlign: 'right', 
            width: '100%',
            mt: 1,
            mb: 2,
            // Remove individual background box - use global overlay instead
          }}>
            <Typography variant="body2" sx={{ 
              color: selectedStyle?.textColor || '#333333',
              fontWeight: 400, 
              fontFamily: fontFamily, 
              fontSize: '1.2rem',
              lineHeight: 1.2,
              mb: 0.2,
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' // Add text shadow for readability
            }}>
              באפליקציה השכונתית
            </Typography>
            <Typography variant="h5" sx={{ 
              color: selectedStyle?.accentColor || '#00b2c8', 
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
              color: selectedStyle?.textColor || '#333333',
              fontFamily: fontFamily, 
              fontSize: '1.2rem',
              lineHeight: 1.1,
              display: 'block',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' // Add text shadow for readability
            }}>
              תומכת בעסקים הקטנים השכונתיים
            </Typography>
          </Box>
        </Box>
        
        {/* QR Code section */}
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
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            // Smart background box using Azure Vision colors
            backgroundColor: getSmartBackgroundColor('qr').backgroundColor,
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${getSmartBackgroundColor('qr').borderColor}`
          }}>
            <QRCodeSVG 
              value={flierContent.qrUrl} 
              size={110} 
              bgColor={getSmartBackgroundColor('qr').backgroundColor.includes('255, 255, 255') ? '#ffffff' : '#f8f9fa'}
              fgColor={selectedStyle?.primaryColor || '#000000'}
              level={"L"}
              includeMargin={false}
            />
            {/* QR instructions from content */}
            {flierContent.qrInstructions.split('\n').map((line, idx) => (
              <Typography key={idx} variant="subtitle2" sx={{ 
                color: selectedStyle?.accentColor || getSmartBackgroundColor('qr').textColor,
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
  );
};

export default FlierPreview; 