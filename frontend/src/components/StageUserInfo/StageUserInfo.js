import React, { useState } from 'react';
import { Box, Stack, Button, Alert, Paper, Typography, Grid, Divider } from '@mui/material';
import './StageUserInfo.css';
import LanguageSelector from './components/LanguageSelector/LanguageSelector';
import LogoUpload from './components/LogoUpload/LogoUpload';
import TextInput from './components/TextInput/TextInput';

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
  
  // Speech-to-text state
  const [isRecording, setIsRecording] = useState(false);
  const [activeInput, setActiveInput] = useState(null);

  // Logo change handler
  const handleLogoChange = (newLogo, error) => {
    setLogo(newLogo);
    setError(error || '');
    if (onLogoChange) onLogoChange(newLogo);
  };

  // Generate button handler with validation
  const handleGenerateClick = () => {
    if (!title.trim()) {
      setError(language === 'Hebrew' ? 'אנא הזן כותרת' : 'Please enter a title');
      return;
    }

    if (!promotionalText.trim()) {
      setError(language === 'Hebrew' ? 'אנא הזן טקסט פרסומי' : 'Please enter promotional text');
      return;
    }

    setError('');
    if (onGenerateTexts) {
      onGenerateTexts(title, promotionalText, language);
    }
  };

  return (
    <Box className="stage-user-info-outer" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
      <Paper elevation={3} className="stage-user-info-container" sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, minWidth: 340, maxWidth: 900, width: '100%' }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 700, color: '#1976d2', letterSpacing: 1, textAlign: 'center' }}>
          AI Flier Generator
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {error && <Alert severity="error" className="stage-user-info-error-alert">{error}</Alert>}
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <LanguageSelector
                language={language}
                onLanguageChange={e => setLanguage(e.target.value)}
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
                onError={setError}
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
                onError={setError}
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
                {language === 'he' ? 'צור טקסטים' : 'Generate Texts'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default StageUserInfo; 