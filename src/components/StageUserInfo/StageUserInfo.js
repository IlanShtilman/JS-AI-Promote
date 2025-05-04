import React, { useState, useCallback, useRef } from 'react';
import './StageUserInfo.css';
import { Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress, Paper, Stack, Tooltip, IconButton, TextField, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MicIcon from '@mui/icons-material/Mic';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { startSpeechRecognition, stopSpeechRecognition, playAudio } from '../../services/speechService';
import { textToSpeech } from '../../services/elevenLabsService';

// Helper function to create help popup
const createHelpPopup = (content, position, event) => {
  const targetElement = event.currentTarget;
  const rect = targetElement.getBoundingClientRect();
  
  const popup = document.createElement('div');
  popup.className = `stage-user-info-hover-guide-popup stage-user-info-hover-guide-popup-${position}`;
  
  // Position popup relative to help icon
  popup.style.top = (rect.top + window.scrollY + rect.height/2) + 'px';
  
  if (position === 'left') {
    popup.style.left = (rect.left + window.scrollX + rect.width) + 'px';
  } else {
    popup.style.right = (window.innerWidth - rect.left - window.scrollX) + 'px';
  }
  
  const title = document.createElement('div');
  title.className = 'stage-user-info-hover-guide-title';
  title.textContent = content.title;
  
  const desc = document.createElement('div');
  desc.className = 'stage-user-info-hover-guide-desc';
  desc.textContent = content.description;
  
  popup.appendChild(title);
  popup.appendChild(desc);
  
  return popup;
};

// HelpIcon component
const HelpIcon = ({ id, position }) => {
  const contentMap = {
    language: { title: 'בחירת שפה', description: 'בחר את השפה המועדפת עליך לתוכן הפלייר' },
    logo: { title: 'העלאת לוגו', description: 'הוסף את הלוגו של העסק שלך' },
    title: { title: 'כותרת', description: 'הזן כותרת קצרה ומושכת שתהיה במוקד הפלייר' },
    promotional: { title: 'טקסט פרסומי', description: 'הזן טקסט פרסומי או השתמש ב-AI ליצירת רעיונות' },
    generate: { title: 'יצירת טקסטים', description: 'לחץ כדי ליצור מספר גרסאות של טקסט פרסומי באמצעות AI' }
  };

  const content = contentMap[id];
  
  const handleMouseEnter = (event) => {
    const popup = createHelpPopup(content, position, event);
    document.body.appendChild(popup);
    popup.setAttribute('data-help-id', id);
  };
  
  const handleMouseLeave = () => {
    const popups = document.querySelectorAll(`[data-help-id="${id}"]`);
    popups.forEach(popup => {
      if (document.body.contains(popup)) {
        document.body.removeChild(popup);
      }
    });
  };

  return (
    <div 
      className="help-icon-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <HelpOutlineIcon fontSize="small" />
    </div>
  );
};

const StageUserInfo = ({
  loading,
  selectedText,
  handleSelectText,
  handleContinueWithSelected,
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
  const audioRef = useRef(null);

  // Logo upload handler
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target.result);
        if (onLogoChange) onLogoChange(e.target.result);
      };
      reader.readAsDataURL(file);
    }
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
    // Optionally, validate promotionalText as well
    // if (!promotionalText.trim()) {
    //   setError('Please enter promotional text');
    //   return;
    // }
    setError('');
    if (onGenerateTexts) {
      onGenerateTexts(title, promotionalText, language);
    }
  };

  // Speech-to-text handler
  const toggleRecording = useCallback((inputField) => {
    if (isRecording) {
      stopSpeechRecognition();
      setIsRecording(false);
      setActiveInput(null);
    } else {
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
        () => {
          setIsRecording(false);
          setActiveInput(null);
        }
      );
    }
  }, [isRecording, language]);

  // Text-to-speech handler
  const handleTextToSpeech = useCallback(async (text) => {
    if (language !== 'English') {
      // Optionally show an error or ignore
      return;
    }
    try {
      setIsPlaying(true);
      const audioUrl = await textToSpeech(text);
      playAudio(audioUrl);
      setTimeout(() => {
        setIsPlaying(false);
      }, 10000);
    } catch (err) {
      setIsPlaying(false);
    }
  }, [language]);

  // Tooltip for speech
  const getSpeechTooltip = useCallback((inputType) => {
    return `Click to ${isRecording && activeInput === inputType ? 'stop' : 'start'} voice input for ${inputType}. Currently supporting ${language === 'Hebrew' ? 'Hebrew' : 'English'} language.`;
  }, [isRecording, activeInput, language]);

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
            לוגו העסק
          </Typography>
          {logo && <img src={logo} alt="Business Logo" />}
          <Box className="stage-user-info-inline-container">
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
              className="stage-user-info-button"
            >
              העלאת לוגו
              <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
            </Button>
            <HelpIcon id="logo" position="right" />
          </Box>
        </Box>
        
        <div className="stage-user-info-title">
          <Box className="stage-user-info-relative-container">
            <TextField
              fullWidth
              label="כותרת"
              value={title}
              onChange={handleTitleChange}
              dir="rtl"
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
              label="טקסט פרסומי"
              multiline
              rows={4}
              value={promotionalText}
              onChange={handlePromotionalTextChange}
              dir="rtl"
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
              {loading ? (
                <Box className="stage-user-info-loading">
                  <CircularProgress size={24} color="inherit" />
                  <span>מייצר טקסט...</span>
                </Box>
              ) : (
                'צור טקסט'
              )}
            </Button>
            <HelpIcon id="generate" position="left" />
          </Box>
        </div>
      </Paper>
    </Box>
  );
};

export default StageUserInfo; 