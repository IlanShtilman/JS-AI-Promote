import React from 'react';
import './DesignModeSelection.css';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MotionPaper = motion(Paper);

const ModeSelectionWindow = ({ title, description, icon, onClick, modeType }) => (
  <MotionPaper
    elevation={3}
    className={`mode-selection-window mode-selection-window--${modeType}`}
    onClick={onClick}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    whileHover={{ scale: 1.03 }}
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

const DesignModeSelection = ({ language, onModeSelect, onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Back button */}
      <Box className="design-mode-selection-header">
        <IconButton 
          onClick={onBack}
          className="design-mode-selection-back-btn"
          aria-label={language === 'Hebrew' ? 'חזור' : 'Go back'}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Typography 
        variant="h2" 
        align="center" 
        className="design-mode-selection-title"
      >
        {language === 'Hebrew' ? 'בחר את הדרך שלך' : 'Choose Your Path'}
      </Typography>
      <Box className="design-mode-selection-container">
        <ModeSelectionWindow
          title={language === 'Hebrew' ? 'עיצוב ידני' : 'Manual Design'}
          description={language === 'Hebrew' 
            ? 'קח שליטה על העיצוב שלך עם כלי העיצוב האינטואיטיביים שלנו. מושלם עבור אלה שרוצים חופש יצירתי מלא.'
            : 'Take control of your design with our intuitive manual design tools. Perfect for those who want complete creative freedom.'}
          icon={<DesignServicesIcon />}
          onClick={() => onModeSelect('manual')}
          modeType="manual"
        />
        <ModeSelectionWindow
          title={language === 'Hebrew' ? 'פלייר מוצע AI' : 'AI Suggested Flier'}
          description={language === 'Hebrew'
            ? 'קבל פלייר מעוצב מושלם בלחיצה אחת. ה-AI בוחר עבורך את הפריסה, צבעים וסגנון המיטביים בהתבסס על הלוגו והתוכן שלך.'
            : 'Get a perfectly designed flier in one click. AI chooses the optimal layout, colors, and style based on your logo and content.'}
          icon={<AutoFixHighIcon />}
          onClick={() => onModeSelect('ai-suggested')}
          modeType="ai"
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
        </video>
      </Box>
    </motion.div>
  );
};

export default DesignModeSelection; 