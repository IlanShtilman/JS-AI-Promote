import React from 'react';
import { Box, InputLabel, Select, MenuItem } from '@mui/material';
import HelpIcon from '../HelpIcon/HelpIcon';
import './LanguageSelector.css';

const LanguageSelector = ({ language, onLanguageChange }) => {
  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    console.log('Language selector changing to:', newLanguage); // Debug log
    onLanguageChange(newLanguage);
  };

  return (
    <Box className="language-selector-container">
      <Box className="language-selector-label" sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.5 }}>
        <InputLabel htmlFor="language-select">{language === 'Hebrew' ? 'שפה' : 'Language'}</InputLabel>
        <Box sx={{ mt: 0.2, ml: language === 'Hebrew' ? 0 : 1, mr: language === 'Hebrew' ? 1 : 0 }}>
          <HelpIcon topic="language" language={language} />
        </Box>
      </Box>
      <Select
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        className="language-selector-select"
        fullWidth
      >
        <MenuItem value="Hebrew">עברית</MenuItem>
        <MenuItem value="English">English</MenuItem>
      </Select>
    </Box>
  );
};

export default LanguageSelector; 