import React, { useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HelpIcon from '../HelpIcon/HelpIcon';
import './LogoUpload.css';

const LogoUpload = ({ onLogoChange, language, error, logo }) => {
  const fileInputRef = useRef();

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="logo-upload-container">
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.5 }}>
        <Typography variant="subtitle1">{language === 'Hebrew' ? 'לוגו' : 'Logo'}</Typography>
        <Box sx={{ mt: 0.2, ml: language === 'Hebrew' ? 0 : 1, mr: language === 'Hebrew' ? 1 : 0 }}>
          <HelpIcon topic="logo" language={language} />
        </Box>
      </Box>
      {logo && (
        <img src={logo} alt="Logo Preview" className="logo-upload-preview" />
      )}
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        onClick={handleButtonClick}
        className="logo-upload-button"
      >
        {language === 'Hebrew' ? 'העלה לוגו' : 'Upload Logo'}
      </Button>
      {error && <Typography className="logo-upload-error">{error}</Typography>}
    </div>
  );
};

export default LogoUpload; 