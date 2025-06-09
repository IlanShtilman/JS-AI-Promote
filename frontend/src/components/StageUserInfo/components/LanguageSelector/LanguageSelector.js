import React from 'react';
import { Box, InputLabel, Select, MenuItem } from '@mui/material';
import HelpIcon from '../HelpIcon/HelpIcon';
import './LanguageSelector.css';

const LanguageSelector = ({ language, onLanguageChange }) => {
  return (
    <Box className="language-selector-container">
      <Box className="language-selector-label" sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.5 }}>
        <InputLabel htmlFor="language-select">{language === 'he' ? 'שפה' : 'Language'}</InputLabel>
        <Box sx={{ mt: 0.2, ml: language === 'he' ? 0 : 1, mr: language === 'he' ? 1 : 0 }}>
          <HelpIcon topic="language" language={language} />
        </Box>
      </Box>
      <Select
        id="language-select"
        value={language}
        onChange={onLanguageChange}
        className="language-selector-select"
        fullWidth
      >
        <MenuItem value="he">עברית</MenuItem>
        <MenuItem value="en">English</MenuItem>
      </Select>
    </Box>
  );
};

export default LanguageSelector; 