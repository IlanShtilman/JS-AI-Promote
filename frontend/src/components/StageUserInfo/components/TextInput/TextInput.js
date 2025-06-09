import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import HelpIcon from '../HelpIcon/HelpIcon';
import VoiceControls from '../VoiceControls/VoiceControls';
import './TextInput.css';

const TextInput = ({
  type,
  value,
  onChange,
  language,
  isRecording,
  activeInput,
  onError,
  onRecordingStateChange
}) => {
  const getLabel = () => {
    if (type === 'title') return language === 'he' ? 'כותרת' : 'Title';
    if (type === 'promotional') return language === 'he' ? 'טקסט פרסומי' : 'Promotional Text';
    return '';
  };

  const getPlaceholder = () => {
    if (type === 'title') return language === 'he' ? 'הזן כותרת...' : 'Enter title...';
    if (type === 'promotional') return language === 'he' ? 'הזן טקסט פרסומי...' : 'Enter promotional text...';
    return '';
  };

  return (
    <Box className="text-input-container">
      <Box className="text-input-label" sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.5 }}>
        <Typography variant="subtitle1">{getLabel()}</Typography>
        <Box sx={{ mt: 0.2, ml: language === 'he' ? 0 : 1, mr: language === 'he' ? 1 : 0 }}>
          <HelpIcon topic={type} language={language} />
        </Box>
      </Box>
      <TextField
        className="text-input-field"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={getPlaceholder()}
        fullWidth
        multiline={type === 'promotional'}
        minRows={type === 'promotional' ? 5 : 1}
        inputProps={{ dir: language === 'he' ? 'rtl' : 'ltr' }}
      />
      <Box className="text-input-controls">
        <VoiceControls
          inputType={type}
          text={value}
          language={language}
          isRecording={isRecording}
          activeInput={activeInput}
          onError={onError}
          onTextChange={onChange}
          onRecordingStateChange={onRecordingStateChange}
        />
      </Box>
    </Box>
  );
};

export default TextInput; 