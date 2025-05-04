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
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import LockIcon from '@mui/icons-material/Lock';
import { analyzeImageWithAzure } from '../../services/azureVisionService';
import { assembleSummaryInfo } from './summaryUtils';
import './AIInfoCollection.css';

const UploadWindow = ({ title, description, icon, onClick, disabled, preview }) => (
  <Paper
    elevation={2}
    className={`${disabled ? 'aiinfo-disabled-paper' : 'aiinfo-paper'}`}
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

const businessTypes = [
  { value: 'cafe', label: 'Caffe - בית קפה' },
  { value: 'restaurant', label: 'Restaurant - מסעדה' },
  // ...add more as needed
];

const targetAudiences = [
  { value: 'families', label: 'Families - משפחות' },
  { value: 'young_adults', label: 'Young Adults - צעירים' },
  // ...add more as needed
];

const AIInfoCollection = ({ language, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    targetAudience: targetAudiences[0].value,
    businessType: businessTypes[0].value,
    stylePreference: 'modern',
    colorScheme: 'warm',
    imagePreference: 'system',
    uploadedImage: null,
    uploadType: 'regular',
    flierSize: 'A4',
    orientation: 'portrait'
  });

  const [enhancedUploadOpen, setEnhancedUploadOpen] = useState(false);

  const [errors, setErrors] = useState({
    targetAudience: false,
    businessType: false,
    colorScheme: false,
    imageUpload: false,
    flierSize: false,
    orientation: false
  });

  const [showErrors, setShowErrors] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const validateForm = () => {
    const newErrors = {
      targetAudience: !formData.targetAudience.trim(),
      businessType: !formData.businessType.trim(),
      colorScheme: !formData.colorScheme,
      imageUpload: formData.imagePreference === 'upload' && !formData.uploadedImage,
      flierSize: !formData.flierSize,
      orientation: !formData.orientation
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
    setEnhancedUploadOpen(true);
  };

  const handleEnhancedUploadClose = () => {
    setEnhancedUploadOpen(false);
  };

  const handleSubmit = async () => {
    setShowErrors(true);
    if (!validateForm()) {
      return;
    }

    try {
      if (formData.imagePreference === 'upload' && formData.uploadedImage) {
        setIsAnalyzing(true);
        console.log('Analyzing uploaded image...');
        const analysisResult = await analyzeImageWithAzure(formData.uploadedImage);
        console.log('Azure Vision analysis result:', analysisResult);
        
        // Update form data with analysis results
        // Only use Azure detected businessType if user hasn't selected one
        const updatedFormData = {
          ...formData,
          // Only use Azure business type if the user hasn't explicitly chosen one
          businessType: formData.businessType || analysisResult.businessType,
          colorScheme: analysisResult.colors?.primary || formData.colorScheme,
          sceneType: analysisResult.sceneType,
          detectedObjects: analysisResult.objects,
          description: analysisResult.description
        };
        
        const summaryInfo = assembleSummaryInfo(updatedFormData, initialData);
        onSubmit(summaryInfo);
      } else {
        onSubmit(formData);
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      // Continue with original form data if analysis fails
      onSubmit(formData);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Container maxWidth="md" className="aiinfo-collection-container">
      <Dialog
        open={enhancedUploadOpen}
        onClose={handleEnhancedUploadClose}
        maxWidth="md"
      >
        <DialogTitle className="aiinfo-dialog-title">
          העלאה משופרת
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="aiinfo-dialog-content-text">
            יאאלה גל סומך עליך
          </DialogContentText>
          <Box className="aiinfo-dialog-box">
            <Typography variant="body1" color="text.secondary" className="aiinfo-dialog-italic">
              העלאה משופרת תופיע כאן
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEnhancedUploadClose} color="primary">
            סגור
          </Button>
          <Button onClick={handleEnhancedUploadClose} color="primary" variant="contained">
            אישור
          </Button>
        </DialogActions>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <Typography 
          variant="h3" 
          align="center" 
          className="aiinfo-collection-title"
        >
          מידע נוסף לעיצוב
        </Typography>

        {showErrors && Object.values(errors).some(error => error) && (
          <Alert severity="error" className="aiinfo-error-alert">
            אנא מלא את כל השדות הנדרשים לפני שתמשיך
          </Alert>
        )}

        <Paper 
          elevation={3} 
          className="aiinfo-collection-paper"
        >
          <Stack spacing={4}>
            <FormControl fullWidth error={showErrors && errors.targetAudience}>
              <InputLabel>קהל יעד *</InputLabel>
              <Select
                value={formData.targetAudience}
                onChange={handleInputChange('targetAudience')}
                label="קהל יעד *"
                error={showErrors && errors.targetAudience}
              >
                {targetAudiences.map((audience) => (
                  <MenuItem key={audience.value} value={audience.value}>
                    {audience.label}
                  </MenuItem>
                ))}
              </Select>
              {showErrors && errors.targetAudience && (
                <FormHelperText error>
                  שדה חובה
                </FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth error={showErrors && errors.businessType}>
              <InputLabel>סוג העסק *</InputLabel>
              <Select
                value={formData.businessType}
                onChange={handleInputChange('businessType')}
                label="סוג העסק *"
                error={showErrors && errors.businessType}
              >
                {businessTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {showErrors && errors.businessType && (
                <FormHelperText error>
                  שדה חובה
                </FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Design Style</InputLabel>
              <Select
                value={formData.stylePreference}
                onChange={handleInputChange('stylePreference')}
                label="Design Style"
              >
                <MenuItem value="modern">Modern - מודרני</MenuItem>
                <MenuItem value="classic">Classic - קלאסי</MenuItem>
                <MenuItem value="minimalist">Minimalist - מינימליסטי</MenuItem>
                <MenuItem value="bold">Bold - נועז</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth error={showErrors && errors.colorScheme}>
              <InputLabel>Color Scheme *</InputLabel>
              <Select
                value={formData.colorScheme}
                onChange={handleInputChange('colorScheme')}
                label="Color Scheme *"
                error={showErrors && errors.colorScheme}
              >
                <MenuItem value="warm">Warm - חם</MenuItem>
                <MenuItem value="cool">Cool - קר</MenuItem>
                <MenuItem value="neutral">Neutral - ניטרלי</MenuItem>
                <MenuItem value="vibrant">Vibrant - תוסס</MenuItem>
              </Select>
              {showErrors && errors.colorScheme && (
                <FormHelperText>Please select a color scheme</FormHelperText>
              )}
            </FormControl>

            <Box className="aiinfo-flier-image-box">
              <Typography variant="h6" gutterBottom>
                תמונות בפלייר *
              </Typography>
              <RadioGroup
                row
                className="rtl-row-group"
                value={formData.imagePreference}
                onChange={handleInputChange('imagePreference')}
              >
                <FormControlLabel
                  value="system"
                  control={<Radio />}
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ImageSearchIcon color="primary" />
                      <Typography>תן למערכת לבחור תמונות מתאימות</Typography>
                    </Stack>
                  }
                  labelPlacement="start"
                />
                <FormControlLabel
                  value="upload"
                  control={<Radio />}
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CloudUploadIcon color="primary" />
                      <Typography>העלה תמונה משלך</Typography>
                    </Stack>
                  }
                  labelPlacement="start"
                />
              </RadioGroup>
              
              {formData.imagePreference === 'upload' && (
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <UploadWindow
                        title="העלאה רגילה"
                        description="העלה תמונה מהמחשב שלך"
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
                        title="העלאה משופרת"
                        description="העלה ושפר את איכות התמונה באופן אוטומטי"
                        icon={
                          <AutoFixHighIcon 
                            sx={{ fontSize: 40, color: 'primary.main' }}
                          />
                        }
                        onClick={handleEnhancedUpload}
                        disabled={false}
                        preview={formData.uploadType === 'enhanced' ? formData.uploadedImage : null}
                      />
                    </Grid>
                  </Grid>
                  {showErrors && errors.imageUpload && (
                    <Typography color="error" sx={{ mt: 2 }}>
                      אנא העלה תמונה
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {/* Flier Size Selection */}
            <FormControl fullWidth className="aiinfo-flier-size" error={showErrors && errors.flierSize}>
              <Typography variant="h6" gutterBottom>
                גודל פלייר
              </Typography>
              <RadioGroup
                row
                className="rtl-row-group"
                value={formData.flierSize}
                onChange={e => setFormData({ ...formData, flierSize: e.target.value })}
                name="flier-size-group"
              >
                <FormControlLabel value="A4" control={<Radio />} label="A4" labelPlacement="start" />
                <FormControlLabel value="A5" control={<Radio />} label="A5" labelPlacement="start" />
              </RadioGroup>
            </FormControl>

            {/* Orientation Selection */}
            <FormControl fullWidth className="aiinfo-orientation" error={showErrors && errors.orientation}>
              <Typography variant="h6" gutterBottom>
                כיוון הדף
              </Typography>
              <RadioGroup
                row
                className="rtl-row-group"
                value={formData.orientation}
                onChange={e => setFormData({ ...formData, orientation: e.target.value })}
                name="orientation-group"
              >
                <FormControlLabel value="portrait" control={<Radio />} label="לאורך" labelPlacement="start" />
                <FormControlLabel value="landscape" control={<Radio />} label="לרוחב" labelPlacement="start" />
              </RadioGroup>
            </FormControl>

            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              endIcon={isAnalyzing ? <CircularProgress size={24} color="inherit" /> : <ArrowForwardIcon />}
              disabled={isAnalyzing}
              className="aiinfo-continue-btn"
            >
              {isAnalyzing 
                ? 'מנתח תמונה...'
                : 'המשך לעיצוב'
              }
            </Button>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default AIInfoCollection; 