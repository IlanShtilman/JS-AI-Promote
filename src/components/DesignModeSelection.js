import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const MotionPaper = motion(Paper);

const ModeSelectionWindow = ({ title, description, icon, onClick, gradient }) => (
  <MotionPaper
    elevation={3}
    sx={{
      p: 4,
      m: 2,
      width: '340px',
      height: '340px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease-in-out',
      background: gradient,
      borderRadius: '20px',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'scale(1.03) translateY(-5px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255,255,255,0.1)',
        transform: 'translateX(-100%) rotate(45deg)',
        transition: 'transform 0.5s',
      },
      '&:hover::before': {
        transform: 'translateX(100%) rotate(45deg)',
      },
    }}
    onClick={onClick}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    whileHover={{ scale: 1.03 }}
  >
    <Box 
      sx={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: '120px',
        height: '120px',
        borderRadius: '60px',
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(5px)',
        mb: 2
      }}
    >
      {React.cloneElement(icon, { 
        sx: { 
          fontSize: 72, 
          color: 'white',
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))',
        } 
      })}
    </Box>
    <Typography 
      variant="h4" 
      sx={{ 
        mb: 2, 
        fontWeight: 800,
        color: 'white',
        textAlign: 'center',
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        letterSpacing: '0.5px',
      }}
    >
      {title}
    </Typography>
    <Typography 
      variant="body1" 
      align="center" 
      sx={{ 
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 1.8,
        fontSize: '1.1rem',
        fontWeight: 500,
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
      }}
    >
      {description}
    </Typography>
  </MotionPaper>
);

const DesignModeSelection = ({ language, onModeSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Typography 
        variant="h2" 
        align="center" 
        sx={{ 
          mb: 6,
          mt: 4,
          fontWeight: 800,
          background: 'linear-gradient(45deg, #2196F3 30%, #00E5FF 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 10px rgba(33,150,243,0.3)',
          letterSpacing: '1px'
        }}
      >
        {language === 'Hebrew' ? 'בחר את הדרך שלך' : 'Choose Your Path'}
      </Typography>
      <Box 
        sx={{ 
          width: '100%', 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
          flexWrap: 'wrap'
        }}
      >
        <ModeSelectionWindow
          title={language === 'Hebrew' ? 'עיצוב ידני' : 'Manual Design'}
          description={language === 'Hebrew' 
            ? 'קח שליטה על העיצוב שלך עם כלי העיצוב האינטואיטיביים שלנו. מושלם עבור אלה שרוצים חופש יצירתי מלא.'
            : 'Take control of your design with our intuitive manual design tools. Perfect for those who want complete creative freedom.'}
          icon={<DesignServicesIcon />}
          onClick={() => onModeSelect('manual')}
          gradient="linear-gradient(135deg, #2196F3 0%, #1976D2 100%)"
        />
        <ModeSelectionWindow
          title={language === 'Hebrew' ? 'פלייר מוצע AI' : 'AI Suggested Flier'}
          description={language === 'Hebrew'
            ? 'קבל פלייר מעוצב מושלם בלחיצה אחת. ה-AI בוחר עבורך את הפריסה, צבעים וסגנון המיטביים בהתבסס על הלוגו והתוכן שלך.'
            : 'Get a perfectly designed flier in one click. AI chooses the optimal layout, colors, and style based on your logo and content.'}
          icon={<AutoFixHighIcon />}
          onClick={() => onModeSelect('ai-suggested')}
          gradient="linear-gradient(135deg, #FF9800 0%, #F57C00 100%)"
        />
        <ModeSelectionWindow
          title={language === 'Hebrew' ? 'AI חכם' : 'AI Smart'}
          description={language === 'Hebrew'
            ? 'תן ל-AI המתקדם שלנו ליצור עיצובים מרהיבים בשבילך. מופעל על-ידי בינה מלאכותית חדשנית שתתאים את העיצוב בדיוק לצרכים שלך.'
            : 'Let our advanced AI create stunning designs for you. Powered by innovative artificial intelligence that will perfectly match your needs.'}
          icon={<AutoAwesomeIcon />}
          onClick={() => onModeSelect('ai')}
          gradient="linear-gradient(135deg, #6B1FA6 0%, #4A148C 100%)"
        />
      </Box>
    </motion.div>
  );
};

export default DesignModeSelection; 