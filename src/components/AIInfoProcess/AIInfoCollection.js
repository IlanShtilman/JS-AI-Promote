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
  DialogActions,
  Snackbar
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import LockIcon from '@mui/icons-material/Lock';
import { analyzeImageWithAzure, analyzeMultipleImagesWithAzure, testBackendConnection } from '../../services/azureVisionService';
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
  { value: 'retail', label: 'Retail - קמעונאות' },
  { value: 'office', label: 'Office - משרדים' },
  { value: 'healthcare', label: 'Healthcare - בריאות' },
  { value: 'education', label: 'Education - חינוך' },
  { value: 'entertainment', label: 'Entertainment - בידור' },
  { value: 'beauty', label: 'Beauty - יופי' },
  { value: 'fitness', label: 'Fitness - כושר' },
  { value: 'general', label: 'General - כללי' }
];

const targetAudiences = [
  { value: 'families', label: 'Families - משפחות' },
  { value: 'young_adults', label: 'Young Adults - צעירים' },
  { value: 'professionals', label: 'Professionals - אנשי מקצוע' },
  { value: 'seniors', label: 'Seniors - בוגרים' },
  { value: 'students', label: 'Students - סטודנטים' },
  { value: 'children', label: 'Children - ילדים' },
  { value: 'tourists', label: 'Tourists - תיירים' },
  { value: 'locals', label: 'Locals - מקומיים' },
  { value: 'general', label: 'General - כללי' }
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
      // Check if we have any images to analyze (logo from initialData or uploaded photo)
      const hasLogo = initialData?.logo;
      const hasPhoto = formData.imagePreference === 'upload' && formData.uploadedImage;
      
      if (hasLogo || hasPhoto) {
        setIsAnalyzing(true);
        console.log('Analyzing images...', { hasLogo: !!hasLogo, hasPhoto: !!hasPhoto });
        
        // Prepare images for analysis
        const imagesToAnalyze = {};
        if (hasLogo) {
          imagesToAnalyze.logo = initialData.logo;
        }
        if (hasPhoto) {
          imagesToAnalyze.photo = formData.uploadedImage;
        }
        
        // Use multiple image analysis
        const analysisResult = await analyzeMultipleImagesWithAzure(imagesToAnalyze);
        console.log('Azure Vision multiple analysis result:', analysisResult);
        
        // Update form data with analysis results
        const updatedFormData = {
          ...formData,
          // Use Azure business type if available and user hasn't explicitly chosen one
          businessType: formData.businessType || analysisResult?.businessType || '',
          sceneType: analysisResult?.sceneType || '',
          detectedObjects: analysisResult?.combinedObjects || [],
          description: analysisResult?.combinedDescription || '',
          // Use the unified color palette from both logo and photo
          colors: analysisResult?.colors || generateDefaultColors(formData.colorScheme),
          // Store separate analysis results for reference
          logoAnalysis: analysisResult?.logoAnalysis || null,
          photoAnalysis: analysisResult?.photoAnalysis || null,
          hasLogoAnalysis: analysisResult?.hasLogoAnalysis || false,
          hasPhotoAnalysis: analysisResult?.hasPhotoAnalysis || false
        };
        
        const summaryInfo = assembleSummaryInfo(updatedFormData, initialData);
        onSubmit(summaryInfo);
      } else {
        // No images to analyze - use default colors
        console.log('No images to analyze, using default colors');
        const defaultColors = generateDefaultColors(formData.colorScheme);
        const formDataWithColors = {
          ...formData,
          colors: defaultColors,
          hasLogoAnalysis: false,
          hasPhotoAnalysis: false
        };
        
        const summaryInfo = assembleSummaryInfo(formDataWithColors, initialData);
        onSubmit(summaryInfo);
      }
    } catch (error) {
      console.error('Error analyzing images:', error);
      
      // Generate default colors based on the selected colorScheme
      const defaultColors = generateDefaultColors(formData.colorScheme);
      const formDataWithColors = {
        ...formData,
        colors: defaultColors,
        hasLogoAnalysis: false,
        hasPhotoAnalysis: false
      };
      
      const summaryInfo = assembleSummaryInfo(formDataWithColors, initialData);
      onSubmit(summaryInfo);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to generate colors based on colorScheme selection
  const generateDefaultColors = (colorScheme) => {
    // Define color mappings for different schemes
    const colorMappings = {
      'warm': {
        primary: '#FF5722',
        secondary: '#FF9800',
        accent: '#FFC107',
        background: '#FFFFFF'
      },
      'cool': {
        primary: '#2196F3',
        secondary: '#03A9F4',
        accent: '#00BCD4',
        background: '#FFFFFF'
      },
      'neutral': {
        primary: '#607D8B',
        secondary: '#9E9E9E',
        accent: '#795548',
        background: '#F5F5F5'
      },
      'vibrant': {
        primary: '#E91E63',
        secondary: '#9C27B0',
        accent: '#673AB7',
        background: '#FFFFFF'
      }
    };
    
    // Return mapped colors or fallback to warm colors
    return colorMappings[colorScheme] || colorMappings['warm'];
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
              <Typography variant="h5" className="aiinfo-flier-image-title">
                העלאת תמונה לפלייר
              </Typography>
              <Typography variant="body2" color="text.secondary" className="aiinfo-flier-image-description">
                בחר אחת מהאפשרויות הבאות להוספת תמונה לפלייר שלך
              </Typography>

              <Grid container spacing={3} className="aiinfo-flier-image-grid">
                <Grid item xs={12} sm={6}>
                  <input
                    accept="image/*"
                    type="file"
                    id="regular-upload"
                    style={{ display: 'none' }}
                    onChange={handleRegularUpload}
                  />
                  <label htmlFor="regular-upload">
                    <UploadWindow
                      title="העלאה רגילה"
                      description="בחר תמונה ממכשיר זה"
                      icon={<CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />}
                      preview={formData.uploadedImage}
                    />
                  </label>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <UploadWindow
                    title="העלאה משופרת"
                    description="צור תמונה עם בינה מלאכותית"
                    icon={<AutoFixHighIcon sx={{ fontSize: 48, color: 'secondary.main' }} />}
                    onClick={handleEnhancedUpload}
                    disabled={true}
                  />
                </Grid>
              </Grid>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Flier Size</InputLabel>
                  <Select
                    value={formData.flierSize}
                    onChange={handleInputChange('flierSize')}
                    label="Flier Size"
                  >
                    <MenuItem value="A4">A4 (210×297mm)</MenuItem>
                    <MenuItem value="A5">A5 (148×210mm)</MenuItem>
                    <MenuItem value="Letter">Letter (8.5×11in)</MenuItem>
                    <MenuItem value="Custom">Custom Size</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Orientation</InputLabel>
                  <Select
                    value={formData.orientation}
                    onChange={handleInputChange('orientation')}
                    label="Orientation"
                  >
                    <MenuItem value="portrait">Portrait - לאורך</MenuItem>
                    <MenuItem value="landscape">Landscape - לרוחב</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box className="aiinfo-submit-box">
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={isAnalyzing}
                startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                className="aiinfo-submit-button"
              >
                {isAnalyzing ? 'מנתח תמונות...' : 'המשך לסיכום'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default AIInfoCollection; 