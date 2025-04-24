import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Stack,
  RadioGroup,
  Radio,
  FormControlLabel,
  IconButton,
  Grid,
  Tooltip,
  FormHelperText,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import LockIcon from '@mui/icons-material/Lock';

const UploadWindow = ({ title, description, icon, onClick, disabled, preview }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      height: '100%',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      opacity: disabled ? 0.7 : 1,
      '&:hover': !disabled && {
        transform: 'translateY(-4px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      },
    }}
    onClick={!disabled ? onClick : undefined}
  >
    <Stack spacing={2} alignItems="center" height="100%">
      {icon}
      <Typography variant="h6" align="center">
        {title}
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary">
        {description}
      </Typography>
      {disabled && (
        <Tooltip title="Coming soon!" placement="top">
          <LockIcon sx={{ position: 'absolute', top: 10, right: 10, color: 'text.disabled' }} />
        </Tooltip>
      )}
      {preview && (
        <Box sx={{ mt: 'auto', width: '100%', maxHeight: '150px', overflow: 'hidden' }}>
          <img
            src={preview}
            alt="Upload preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
          />
        </Box>
      )}
    </Stack>
  </Paper>
);

const AIInfoCollection = ({ language, onSubmit, initialData }) => {
  const isRTL = language === 'Hebrew';
  const direction = isRTL ? 'rtl' : 'ltr';

  const [formData, setFormData] = useState({
    targetAudience: '',
    businessType: '',
    stylePreference: 'modern', // modern, classic, minimalist, bold
    colorScheme: '',
    moodLevel: 50, // 0-100: professional to playful
    imagePreference: 'system', // 'system' or 'upload'
    uploadedImage: null,
    uploadType: 'regular' // 'regular' or 'enhanced'
  });

  const [errors, setErrors] = useState({
    targetAudience: false,
    businessType: false,
    colorScheme: false,
    imageUpload: false
  });

  const [showErrors, setShowErrors] = useState(false);

  const validateForm = () => {
    const newErrors = {
      targetAudience: !formData.targetAudience.trim(),
      businessType: !formData.businessType.trim(),
      colorScheme: !formData.colorScheme,
      imageUpload: formData.imagePreference === 'upload' && !formData.uploadedImage
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    
    if (showErrors) {
      setErrors({
        ...errors,
        [field]: !event.target.value.trim()
      });
    }
  };

  const handleRegularUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({
          ...formData,
          uploadedImage: e.target.result,
          imagePreference: 'upload',
          uploadType: 'regular'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhancedUpload = () => {
    // This will be implemented later with Claid integration
    console.log('Enhanced upload coming soon!');
  };

  const handleSubmit = () => {
    setShowErrors(true);
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Container maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <Typography 
          variant="h3" 
          align="center" 
          sx={{ 
            mb: 4,
            mt: 4,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #FF9800 30%, #F57C00 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {isRTL ? 'מידע נוסף לעיצוב' : 'Additional Design Information'}
        </Typography>

        {showErrors && Object.values(errors).some(error => error) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {isRTL 
              ? 'אנא מלא את כל השדות הנדרשים לפני שתמשיך'
              : 'Please fill in all required fields before continuing'
            }
          </Alert>
        )}

        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            borderRadius: '16px',
            backgroundColor: '#fff',
          }}
        >
          <Stack spacing={4} dir={direction}>
            <FormControl fullWidth error={showErrors && errors.targetAudience}>
              <TextField
                label={isRTL ? 'קהל יעד *' : 'Target Audience *'}
                value={formData.targetAudience}
                onChange={handleInputChange('targetAudience')}
                dir={direction}
                placeholder={isRTL ? 'למשל: צעירים, משפחות, אנשי עסקים' : 'e.g., Young adults, Families, Business professionals'}
                error={showErrors && errors.targetAudience}
                helperText={showErrors && errors.targetAudience ? (isRTL ? 'שדה חובה' : 'This field is required') : ''}
              />
            </FormControl>

            <FormControl fullWidth error={showErrors && errors.businessType}>
              <TextField
                label={isRTL ? 'סוג העסק *' : 'Business Type *'}
                value={formData.businessType}
                onChange={handleInputChange('businessType')}
                dir={direction}
                placeholder={isRTL ? 'למשל: מסעדה, חנות בגדים, משרד עורכי דין' : 'e.g., Restaurant, Clothing store, Law firm'}
                error={showErrors && errors.businessType}
                helperText={showErrors && errors.businessType ? (isRTL ? 'שדה חובה' : 'This field is required') : ''}
              />
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{isRTL ? 'סגנון עיצוב' : 'Design Style'}</InputLabel>
              <Select
                value={formData.stylePreference}
                onChange={handleInputChange('stylePreference')}
                label={isRTL ? 'סגנון עיצוב' : 'Design Style'}
              >
                <MenuItem value="modern">{isRTL ? 'מודרני' : 'Modern'}</MenuItem>
                <MenuItem value="classic">{isRTL ? 'קלאסי' : 'Classic'}</MenuItem>
                <MenuItem value="minimalist">{isRTL ? 'מינימליסטי' : 'Minimalist'}</MenuItem>
                <MenuItem value="bold">{isRTL ? 'נועז' : 'Bold'}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth error={showErrors && errors.colorScheme}>
              <InputLabel>{isRTL ? 'סכמת צבעים *' : 'Color Scheme *'}</InputLabel>
              <Select
                value={formData.colorScheme}
                onChange={handleInputChange('colorScheme')}
                label={isRTL ? 'סכמת צבעים *' : 'Color Scheme *'}
                error={showErrors && errors.colorScheme}
              >
                <MenuItem value="warm">{isRTL ? 'חם' : 'Warm'}</MenuItem>
                <MenuItem value="cool">{isRTL ? 'קר' : 'Cool'}</MenuItem>
                <MenuItem value="neutral">{isRTL ? 'ניטרלי' : 'Neutral'}</MenuItem>
                <MenuItem value="vibrant">{isRTL ? 'תוסס' : 'Vibrant'}</MenuItem>
              </Select>
              {showErrors && errors.colorScheme && (
                <FormHelperText>{isRTL ? 'אנא בחר סכמת צבעים' : 'Please select a color scheme'}</FormHelperText>
              )}
            </FormControl>

            <Box>
              <Typography gutterBottom>
                {isRTL ? 'רמת הרשמיות' : 'Professional to Playful'}
              </Typography>
              <Slider
                value={formData.moodLevel}
                onChange={(e, newValue) => setFormData({ ...formData, moodLevel: newValue })}
                valueLabelDisplay="auto"
                marks={[
                  { value: 0, label: isRTL ? 'רשמי' : 'Professional' },
                  { value: 100, label: isRTL ? 'קליל' : 'Playful' }
                ]}
              />
            </Box>

            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {isRTL ? 'תמונות בפלייר *' : 'Flier Images *'}
              </Typography>
              <RadioGroup
                value={formData.imagePreference}
                onChange={handleInputChange('imagePreference')}
              >
                <FormControlLabel 
                  value="system"
                  control={<Radio />}
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ImageSearchIcon color="primary" />
                      <Typography>
                        {isRTL ? 'תן למערכת לבחור תמונות מתאימות' : 'Let the system choose appropriate images'}
                      </Typography>
                    </Stack>
                  }
                />
                <FormControlLabel 
                  value="upload"
                  control={<Radio />}
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CloudUploadIcon color="primary" />
                      <Typography>
                        {isRTL ? 'העלה תמונה משלך' : 'Upload your own image'}
                      </Typography>
                    </Stack>
                  }
                />
              </RadioGroup>
              
              {formData.imagePreference === 'upload' && (
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <UploadWindow
                        title={isRTL ? 'העלאה רגילה' : 'Regular Upload'}
                        description={isRTL 
                          ? 'העלה תמונה מהמחשב שלך'
                          : 'Upload an image from your computer'
                        }
                        icon={
                          <CloudUploadIcon 
                            sx={{ fontSize: 40, color: 'primary.main' }}
                          />
                        }
                        onClick={() => document.getElementById('regular-upload').click()}
                        preview={formData.uploadType === 'regular' ? formData.uploadedImage : null}
                      />
                      <input
                        id="regular-upload"
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleRegularUpload}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <UploadWindow
                        title={isRTL ? 'העלאה משופרת' : 'Enhanced Upload'}
                        description={isRTL 
                          ? 'העלה ושפר את איכות התמונה באופן אוטומטי'
                          : 'Upload and automatically enhance image quality'
                        }
                        icon={
                          <AutoFixHighIcon 
                            sx={{ fontSize: 40, color: 'primary.main' }}
                          />
                        }
                        onClick={handleEnhancedUpload}
                        disabled={true} // Will be enabled when Claid integration is ready
                        preview={formData.uploadType === 'enhanced' ? formData.uploadedImage : null}
                      />
                    </Grid>
                  </Grid>
                  {showErrors && errors.imageUpload && (
                    <Typography color="error" sx={{ mt: 2 }}>
                      {isRTL ? 'אנא העלה תמונה' : 'Please upload an image'}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              endIcon={<ArrowForwardIcon />}
              sx={{
                mt: 4,
                py: 2,
                background: 'linear-gradient(45deg, #FF9800 30%, #F57C00 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #F57C00 30%, #FF9800 90%)',
                },
              }}
            >
              {isRTL ? 'המשך לעיצוב' : 'Continue to Design'}
            </Button>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default AIInfoCollection; 