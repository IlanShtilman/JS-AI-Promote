import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DesignModeSelection.css';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLanguage } from '../../context/LanguageContext';

const MotionPaper = motion(Paper);

const ModeSelectionWindow = ({ title, description, icon, onClick, modeType, isRTL }) => (
  <MotionPaper
    elevation={3}
    className={`mode-selection-window mode-selection-window--${modeType} ${isRTL ? 'mode-selection-window--rtl' : ''}`}
    onClick={onClick}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    whileHover={{ scale: 1.03 }}
    sx={{ cursor: 'pointer' }}
  >
    <Box className="mode-selection-window-icon">
      {React.cloneElement(icon, { className: '', style: undefined })}
    </Box>
    <Typography variant="h4" className="mode-selection-window-title">
      {title}
    </Typography>
    <Typography variant="body1" className="mode-selection-window-desc">
      {description}
    </Typography>
  </MotionPaper>
);

const DesignModeSelection = ({ onBack }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'Hebrew';

  const handleModeSelect = (mode) => {
    console.log('Mode selected:', mode); // Debug log
    try {
      if (mode === 'manual') {
        console.log('Navigating to manual design');
        navigate('/manual-design');
      } else if (mode === 'ai-suggested') {
        console.log('Navigating to AI info collection');
        navigate('/ai-info-collection');
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleBack = () => {
    console.log('Back button clicked'); // Debug log
    if (typeof onBack === 'function') {
      onBack();
    } else {
      navigate('/');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={isRTL ? 'design-mode-selection--rtl' : ''}
    >
      {/* Back button */}
      <Box className="design-mode-selection-header">
        <IconButton 
          onClick={handleBack}
          className="design-mode-selection-back-btn"
          aria-label={isRTL ? 'חזור' : 'Go back'}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Typography 
        variant="h2" 
        align="center" 
        className="design-mode-selection-title"
      >
        {isRTL ? 'בחר את הדרך שלך' : 'Choose Your Path'}
      </Typography>
      <Box className="design-mode-selection-container">
        <ModeSelectionWindow
          title={isRTL ? 'עיצוב ידני' : 'Manual Design'}
          description={isRTL 
            ? 'קח שליטה על העיצוב שלך עם כלי העיצוב האינטואיטיביים שלנו. מושלם עבור אלה שרוצים חופש יצירתי מלא.'
            : 'Take control of your design with our intuitive manual design tools. Perfect for those who want complete creative freedom.'}
          icon={<DesignServicesIcon />}
          onClick={() => handleModeSelect('manual')}
          modeType="manual"
          isRTL={isRTL}
        />
        <ModeSelectionWindow
          title={isRTL ? 'פלייר מוצע AI' : 'AI Suggested Flier'}
          description={isRTL
            ? 'קבל פלייר מעוצב מושלם בלחיצה אחת. ה-AI בוחר עבורך את הפריסה, צבעים וסגנון המיטביים בהתבסס על הלוגו והתוכן שלך.'
            : 'Get a perfectly designed flier in one click. AI chooses the optimal layout, colors, and style based on your logo and content.'}
          icon={<AutoFixHighIcon />}
          onClick={() => handleModeSelect('ai-suggested')}
          modeType="ai"
          isRTL={isRTL}
        />
      </Box>
      
      {/* Video displayed below the selection windows */}
      <Box className="design-mode-selection-video-container">
        <video 
          className="design-mode-selection-video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/assets/Untitled_Project.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </Box>
    </motion.div>
  );
};

export default DesignModeSelection; 