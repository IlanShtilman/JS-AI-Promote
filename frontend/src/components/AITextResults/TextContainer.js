import React from 'react';
import { Paper, Box, Typography, FormControlLabel, Radio } from '@mui/material';

const detectTextLanguage = (text) => {
  if (!text) return 'ltr';
  const cleanText = text.replace(/[.,!?;:\s\-\n]/g, '');
  const hebrewChars = (cleanText.match(/[\u0590-\u05FF]/g) || []).length;
  const englishChars = (cleanText.match(/[a-zA-Z]/g) || []).length;
  const totalRelevantChars = hebrewChars + englishChars;
  if (totalRelevantChars === 0) return 'ltr';
  return (hebrewChars / totalRelevantChars) > 0.5 ? 'rtl' : 'ltr';
};

const TextContainer = ({ model, text, selectedText, handleSelectText, language }) => {
  const textDirection = detectTextLanguage(text);
  return (
    <Paper
      elevation={3}
      className={`ai-text-results-text-container${selectedText?.model === model ? ' ai-text-results-selected' : ''}`}
    >
      <Box className={`ai-text-results-header ${language === 'he' ? 'ai-text-results-header-rtl' : ''}`}>
        <Typography
          variant="h6"
          component="div"
          className={`ai-text-results-model-name ${language === 'he' ? 'ai-text-results-model-name-rtl' : ''}`}
        >
          {model}
        </Typography>
        <FormControlLabel
          control={
            <Radio
              checked={selectedText?.model === model}
              onChange={() => handleSelectText(model, text)}
              color="primary"
            />
          }
          label={language === 'he' ? 'בחר' : 'Select'}
          labelPlacement={language === 'he' ? 'start' : 'end'}
          className="ai-text-results-radio-label"
        />
      </Box>
      <div className="ai-text-results-text-block" dir={textDirection}>
        {text.split('\n').map((line, index) => (
          <div
            key={index}
            className="ai-text-results-text-line"
            dir={textDirection}
          >
            {line}
          </div>
        ))}
      </div>
    </Paper>
  );
};

export default TextContainer; 