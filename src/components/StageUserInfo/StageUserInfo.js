import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './StageUserInfo.css';
import { Box, Typography, Button, InputLabel, Select, MenuItem, Paper, Stack, Tooltip, IconButton, TextField, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MicIcon from '@mui/icons-material/Mic';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { startSpeechRecognition, stopSpeechRecognition, playAudio } from '../../services/VoiceServices/speechService';
import { textToSpeech } from '../../services/VoiceServices/elevenLabsService';

// HelpIcon component with React Portal
const HelpIcon = ({ id, position }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, right: 0 });
  const iconRef = React.useRef(null);

  const contentMap = {
    language: { title: 'בחירת שפה', description: 'בחר את השפה המועדפת עליך לתוכן הפלייר' },
    logo: { title: 'העלאת לוגו', description: 'הוסף את הלוגו של העסק שלך' },
    title: { title: 'כותרת', description: 'הזן כותרת קצרה ומושכת שתהיה במוקד הפלייר' },
    promotional: { title: 'טקסט פרסומי', description: 'הזן טקסט פרסומי או השתמש ב-AI ליצירת רעיונות' },
    generate: { title: 'יצירת טקסטים', description: 'לחץ כדי ליצור מספר גרסאות של טקסט פרסומי באמצעות AI' }
  };

  const content = contentMap[id];
  
  const handleMouseEnter = (event) => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPopupPosition({
        top: rect.top + window.scrollY + rect.height/2,
        left: position === 'left' ? rect.left + window.scrollX + rect.width : undefined,
        right: position === 'right' ? window.innerWidth - rect.left - window.scrollX : undefined
      });
    }
    setShowPopup(true);
  };
  
  const handleMouseLeave = () => {
    setShowPopup(false);
  };

  return (
    <>
      <div 
        ref={iconRef}
        className="help-icon-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <HelpOutlineIcon fontSize="small" />
      </div>
      {showPopup && createPortal(
        <div 
          className={`stage-user-info-hover-guide-popup stage-user-info-hover-guide-popup-${position}`}
          style={{
            top: `${popupPosition.top}px`,
            ...(popupPosition.left !== undefined ? { left: `${popupPosition.left}px` } : {}),
            ...(popupPosition.right !== undefined ? { right: `${popupPosition.right}px` } : {})
          }}
        >
          <div className="stage-user-info-hover-guide-title">{content.title}</div>
          <div className="stage-user-info-hover-guide-desc">{content.description}</div>
        </div>,
        document.body
      )}
    </>
  );
};

const StageUserInfo = ({
  loading,
  onGenerateTexts,
  onLogoChange
}) => {
  // Local state for input fields
  const [language, setLanguage] = useState('Hebrew');
  const [title, setTitle] = useState('');
  const [promotionalText, setPromotionalText] = useState('');
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState('');
  
  // Speech-to-text and text-to-speech state
  const [isRecording, setIsRecording] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Logo upload handler with improved error handling
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setLogo(e.target.result);
      if (onLogoChange) onLogoChange(e.target.result);
      setError(''); // Clear any previous errors
    };
    reader.onerror = () => {
      setError('Error reading the file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  // Handlers for input fields
  const handleLanguageChange = (e) => setLanguage(e.target.value);
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handlePromotionalTextChange = (e) => setPromotionalText(e.target.value);

  // Generate button handler with validation
  const handleGenerateClick = () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    setError('');
    if (onGenerateTexts) {
      onGenerateTexts(title, promotionalText, language);
    }
  };

  // Text-to-speech handler with improved service integration
  const handleTextToSpeech = useCallback(async (text) => {
    if (language !== 'English') {
      setError('Text-to-speech is only available in English');
      return;
    }
    if (!text.trim()) {
      setError('No text to convert to speech');
      return;
    }
    try {
      setIsPlaying(true);
      setError('');
      const audioUrl = await textToSpeech(text);
      const audio = playAudio(audioUrl);
      
      // Use the service's events instead of timeout
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audio.onerror = (err) => {
        setIsPlaying(false);
        setError('Error playing audio. Please try again.');
      };
    } catch (err) {
      setIsPlaying(false);
      setError('Error converting text to speech. Please try again.');
    }
  }, [language]);

  // Speech-to-text handler with improved error handling
  const toggleRecording = useCallback((inputField) => {
    if (isRecording) {
      stopSpeechRecognition();
      setIsRecording(false);
      setActiveInput(null);
    } else {
      try {
        setIsRecording(true);
        setActiveInput(inputField);
        startSpeechRecognition(
          language,
          (transcript) => {
            if (inputField === 'title') {
              setTitle(transcript);
            } else if (inputField === 'promotional') {
              setPromotionalText(transcript);
            }
          },
          (error) => {
            setIsRecording(false);
            setActiveInput(null);
            // Only show error if there actually was an error
            if (error) {
              setError(`Speech recognition error: ${error.message || 'Please try again'}`);
            }
          }
        );
      } catch (error) {
        setIsRecording(false);
        setActiveInput(null);
        setError('Speech recognition is not supported in your browser');
      }
    }
  }, [isRecording, language]);

  // Tooltip for speech
  const getSpeechTooltip = useCallback((inputType) => {
    return `Click to ${isRecording && activeInput === inputType ? 'stop' : 'start'} voice input for ${inputType}. Currently supporting ${language === 'Hebrew' ? 'Hebrew' : 'English'} language.`;
  }, [isRecording, activeInput, language]);

  // Get text direction based on language
  const getTextDirection = useCallback(() => {
    return language === 'Hebrew' ? 'rtl' : 'ltr';
  }, [language]);

  // InputControls component
  const InputControls = ({ inputType, text }) => (
    <Stack direction="row" spacing={1} alignItems="center" className="stage-user-info-input-controls">
      <Tooltip title={getSpeechTooltip(inputType)} arrow>
        <IconButton
          onClick={() => toggleRecording(inputType)}
          color={isRecording && activeInput === inputType ? 'error' : 'primary'}
          size="small"
        >
          <MicIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {language === 'English' && (
        <Tooltip title="Click to hear the text" arrow>
          <span>
            <IconButton
              onClick={() => handleTextToSpeech(text)}
              disabled={isPlaying || !text}
              size="small"
            >
              <VolumeUpIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Stack>
  );

  return (
    <Box className="stage-user-info-container">
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        AI-Powered Flier Creation
      </Typography>
      <Typography variant="subtitle1" align="center" gutterBottom>
        Create professional promotional materials in seconds with advanced AI
      </Typography>
      <Paper className="stage-user-info-form">
        {error && (
          <Alert severity="error" className="stage-user-info-error-alert">{error}</Alert>
        )}
        <div className="stage-user-info-language">
          <Box className="stage-user-info-relative-container">
            <InputLabel id="language-label">Language</InputLabel>
            <Select
              labelId="language-label"
              value={language}
              onChange={handleLanguageChange}
              label="Language"
              className="stage-user-info-language-select"
            >
              <MenuItem value="Hebrew">Hebrew</MenuItem>
              <MenuItem value="English">English</MenuItem>
            </Select>
            <HelpIcon id="language" position="left" />
          </Box>
        </div>
        
        <Box className="stage-user-info-logo stage-user-info-relative-container">
          <Typography variant="h6" gutterBottom>
            {language === 'Hebrew' ? 'לוגו העסק' : 'Business Logo'}
          </Typography>
          {logo && <img src={logo} alt="Business Logo" />}
          <Box className="stage-user-info-inline-container">
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
              className="stage-user-info-button"
            >
              {language === 'Hebrew' ? 'העלאת לוגו' : 'Upload Logo'}
              <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
            </Button>
            <HelpIcon id="logo" position="right" />
          </Box>
        </Box>
        
        <div className="stage-user-info-title">
          <Box className="stage-user-info-relative-container">
            <TextField
              fullWidth
              label={language === 'Hebrew' ? 'כותרת' : 'Title'}
              value={title}
              onChange={handleTitleChange}
              dir={getTextDirection()}
              InputProps={{ 
                endAdornment: (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <InputControls inputType="title" text={title} />
                    <div className="help-icon-wrapper">
                      <HelpIcon id="title" position="left" />
                    </div>
                  </Stack>
                ),
              }}
            />
          </Box>
        </div>
        
        <div className="stage-user-info-promotional">
          <Box className="stage-user-info-relative-container">
            <TextField
              fullWidth
              label={language === 'Hebrew' ? 'טקסט פרסומי' : 'Promotional Text'}
              multiline
              rows={4}
              value={promotionalText}
              onChange={handlePromotionalTextChange}
              dir={getTextDirection()}
              InputProps={{ 
                endAdornment: (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <InputControls inputType="promotional" text={promotionalText} />
                    <div className="help-icon-wrapper">
                      <HelpIcon id="promotional" position="right" />
                    </div>
                  </Stack>
                ),
              }}
            />
          </Box>
        </div>
        
        <div className="stage-user-info-generate">
          <Box className="stage-user-info-button-container">
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={handleGenerateClick}
              disabled={loading}
              className="stage-user-info-button"
            >
              {language === 'Hebrew' ? 'צור טקסט' : 'Generate Text'}
            </Button>
            <HelpIcon id="generate" position="left" />
          </Box>
        </div>
      </Paper>
    </Box>
  );
};

export default StageUserInfo; 