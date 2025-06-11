import React, { useState, useEffect } from 'react';
import { Box, Stack, Button, Alert, Paper, Typography, Grid, Divider } from '@mui/material';
import './StageUserInfo.css';
import LanguageSelector from './components/LanguageSelector/LanguageSelector';
import LogoUpload from './components/LogoUpload/LogoUpload';
import TextInput from './components/TextInput/TextInput';
import AITextResults from '../AITextResults/AITextResults';
import DesignModeSelection from '../DesignModeSelection/DesignModeSelection';
import { useLanguage } from '../../context/LanguageContext';

const StageUserInfo = ({
  loading,
  onGenerateTexts,
  onLogoChange,
  onError,
  onLoadingChange,
  stage,
  user,
  onLanguageChange
}) => {
  const { language, setLanguage } = useLanguage();
  const [title, setTitle] = useState('');
  const [promotionalText, setPromotionalText] = useState('');
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState('');
  const [triggerGeneration, setTriggerGeneration] = useState(false);
  const [mode, setMode] = useState('input');
  const [selectedText, setSelectedText] = useState(null);
  
  // Speech-to-text state
  const [isRecording, setIsRecording] = useState(false);
  const [activeInput, setActiveInput] = useState(null);

  useEffect(() => {
    // Initialize language from user preferences if available
    if (user?.preferences?.language) {
      console.log('Initializing language from user preferences:', user.preferences.language);
      setLanguage(user.preferences.language);
    }
  }, [user, setLanguage]);

  // Handle local error state and propagate to parent
  const handleError = (errorMessage) => {
    setError(errorMessage);
    if (onError) onError(errorMessage);
  };

  // Logo change handler
  const handleLogoChange = (newLogo, error) => {
    setLogo(newLogo);
    handleError(error || '');
    if (onLogoChange) onLogoChange(newLogo);
  };

  // Generate button handler with validation
  const handleGenerateClick = () => {
    if (!title.trim()) {
      handleError(language === 'Hebrew' ? 'אנא הזן כותרת' : 'Please enter a title');
      return;
    }

    if (!promotionalText.trim()) {
      handleError(language === 'Hebrew' ? 'אנא הזן טקסט פרסומי' : 'Please enter promotional text');
      return;
    }

    handleError('');
    setTriggerGeneration(true);
  };

  const handleSelectText = (selected) => {
    setSelectedText(selected);
  };

  const handleContinue = (data) => {
    if (data?.selectedText) {
      setSelectedText(data.selectedText);
      if (data.logo && data.logo !== logo) {
        setLogo(data.logo);
      }
    } else {
      setSelectedText(data);
    }
    setMode('design');
  };

  // Effect to handle loading state changes
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading);
    }
  }, [loading, onLoadingChange]);

  const handleLanguageChange = (newLanguage) => {
    console.log('StageUserInfo handling language change to:', newLanguage);
    setLanguage(newLanguage);
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  if (mode === 'design') {
    return (
      <DesignModeSelection
        language={language}
        selectedText={selectedText}
        logo={logo}
        onBack={() => {
          setMode('input');
          setTitle('');
          setPromotionalText('');
          setLogo(null);
          setSelectedText(null);
          setTriggerGeneration(false);
          handleError('');
        }}
      />
    );
  }

  return (
    <Box className="stage-user-info-outer" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
      <Paper elevation={3} className="stage-user-info-container" sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, minWidth: 340, maxWidth: 900, width: '100%' }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 700, color: '#1976d2', letterSpacing: 1, textAlign: 'center' }}>
          {language === 'Hebrew' ? 'מחולל פליירים AI' : 'AI Flier Generator'}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {error && <Alert severity="error" className="stage-user-info-error-alert">{error}</Alert>}
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <LanguageSelector
                language={language}
                onLanguageChange={handleLanguageChange}
              />

              <LogoUpload
                onLogoChange={handleLogoChange}
                language={language}
                error={error}
                logo={logo}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <TextInput
                type="title"
                value={title}
                onChange={setTitle}
                language={language}
                isRecording={isRecording}
                activeInput={activeInput}
                onError={handleError}
                onRecordingStateChange={(recording, input) => {
                  setIsRecording(recording);
                  setActiveInput(input);
                }}
              />

              <TextInput
                type="promotional"
                value={promotionalText}
                onChange={setPromotionalText}
                language={language}
                isRecording={isRecording}
                activeInput={activeInput}
                onError={handleError}
                onRecordingStateChange={(recording, input) => {
                  setIsRecording(recording);
                  setActiveInput(input);
                }}
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleGenerateClick}
                disabled={loading}
                className="stage-user-info-generate"
              >
                {language === 'Hebrew' ? 'צור טקסטים' : 'Generate Texts'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
        <AITextResults
          language={language}
          onSelectText={handleSelectText}
          onContinue={handleContinue}
          title={title}
          promotionalText={promotionalText}
          triggerGeneration={triggerGeneration}
          logo={logo}
        />
      </Paper>
    </Box>
  );
};

export default StageUserInfo; 