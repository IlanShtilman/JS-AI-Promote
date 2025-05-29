import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
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
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import LockIcon from '@mui/icons-material/Lock';
import { analyzeMultipleImagesWithAzure } from '../../../services/AzureVision/azureVisionService';
import { assembleSummaryInfo, validateFormData, getUIText, generateDefaultColors } from './summaryUtils';
import AIInfoCollectionConfig from './AIInfoCollectionConfig';
import './AIInfoCollection.css';

const AIInfoCollection = ({ language, onSubmit, initialData }) => {
  
  // ================================
  // 1. STATE INITIALIZATION
  // ================================
  const [formData, setFormData] = useState(AIInfoCollectionConfig.defaultFormData);
  const [enhancedUploadOpen, setEnhancedUploadOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ================================
  // 2. UI SETUP (Based on language prop)
  // ================================
  const uiText = getUIText(language);

  // ================================
  // 3. EVENT HANDLERS (Functions that respond to user actions)
  // ================================
  
  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    
    if (showErrors) {
      const validation = validateFormData({
        ...formData,
        [field]: event.target.value
      });
      setErrors(validation.errors);
    }
  };

  const handleRegularUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size
      if (file.size > AIInfoCollectionConfig.upload.maxFileSize) {
        alert(`File size too large. Maximum size is ${AIInfoCollectionConfig.upload.maxFileSize / (1024 * 1024)}MB`);
        return;
      }

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
    const validation = validateFormData(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      // Check if we have any images to analyze (logo from initialData or uploaded photo)
      const hasLogo = initialData?.logo;
      const hasPhoto = formData.imagePreference === 'upload' && formData.uploadedImage;
      
      if ((hasLogo || hasPhoto) && AIInfoCollectionConfig.analysis.enableImageAnalysis) {
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
          businessType: formData.businessType || analysisResult?.businessType || AIInfoCollectionConfig.defaultFormData.businessType,
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
        // No images to analyze or analysis disabled - use default colors
        console.log('No images to analyze or analysis disabled, using default colors');
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

  // ================================
  // 4. JSX RENDER (What gets displayed)
  // ================================
  
  return (
    <Container maxWidth="md" className="aiinfo-collection-container">
      <Dialog
        open={enhancedUploadOpen}
        onClose={handleEnhancedUploadClose}
        maxWidth="md"
      >
        <DialogTitle className="aiinfo-dialog-title">
          {uiText.enhancedUploadTitle}
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="aiinfo-dialog-content-text">
            {uiText.enhancedUploadPlaceholder}
          </DialogContentText>
          <Box className="aiinfo-dialog-box">
            <Typography variant="body1" color="text.secondary" className="aiinfo-dialog-italic">
              {uiText.enhancedUploadComingSoon}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEnhancedUploadClose} color="primary">
            {uiText.close}
          </Button>
          <Button onClick={handleEnhancedUploadClose} color="primary" variant="contained">
            {uiText.confirm}
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
          {uiText.title}
        </Typography>

        {showErrors && !validateFormData(formData).isValid && (
          <Alert severity="error" className="aiinfo-error-alert">
            {uiText.fillAllFields}
          </Alert>
        )}

        <Paper 
          elevation={3} 
          className="aiinfo-collection-paper"
        >
          <Stack spacing={4}>
            <FormControl fullWidth error={showErrors && errors.targetAudience}>
              <InputLabel>{uiText.targetAudience} *</InputLabel>
              <Select
                value={formData.targetAudience}
                onChange={handleInputChange('targetAudience')}
                label={`${uiText.targetAudience} *`}
                error={showErrors && errors.targetAudience}
              >
                {AIInfoCollectionConfig.targetAudiences.map((audience) => (
                  <MenuItem key={audience.value} value={audience.value}>
                    {audience.label}
                  </MenuItem>
                ))}
              </Select>
              {showErrors && errors.targetAudience && (
                <FormHelperText error>
                  {uiText.requiredField}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth error={showErrors && errors.businessType}>
              <InputLabel>{uiText.businessType} *</InputLabel>
              <Select
                value={formData.businessType}
                onChange={handleInputChange('businessType')}
                label={`${uiText.businessType} *`}
                error={showErrors && errors.businessType}
              >
                {AIInfoCollectionConfig.businessTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {showErrors && errors.businessType && (
                <FormHelperText error>
                  {uiText.requiredField}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{uiText.designStyle}</InputLabel>
              <Select
                value={formData.stylePreference}
                onChange={handleInputChange('stylePreference')}
                label={uiText.designStyle}
              >
                {AIInfoCollectionConfig.stylePreferences.map((style) => (
                  <MenuItem key={style.value} value={style.value}>
                    {style.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth error={showErrors && errors.colorScheme}>
              <InputLabel>{uiText.colorScheme} *</InputLabel>
              <Select
                value={formData.colorScheme}
                onChange={handleInputChange('colorScheme')}
                label={`${uiText.colorScheme} *`}
                error={showErrors && errors.colorScheme}
              >
                {AIInfoCollectionConfig.colorSchemes.map((scheme) => (
                  <MenuItem key={scheme.value} value={scheme.value}>
                    {scheme.label}
                  </MenuItem>
                ))}
              </Select>
              {showErrors && errors.colorScheme && (
                <FormHelperText error>{uiText.requiredField}</FormHelperText>
              )}
            </FormControl>

            <Box className="aiinfo-flier-image-box">
              <Typography variant="h5" className="aiinfo-flier-image-title">
                {uiText.flierImageTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary" className="aiinfo-flier-image-description">
                {uiText.flierImageDescription}
              </Typography>

              <Grid container spacing={3} className="aiinfo-flier-image-grid">
                <Grid item xs={12} sm={6}>
                  <input
                    accept={AIInfoCollectionConfig.upload.acceptedFormats}
                    type="file"
                    id="regular-upload"
                    style={{ display: 'none' }}
                    onChange={handleRegularUpload}
                  />
                  <label htmlFor="regular-upload">
                    <UploadWindow
                      title={uiText.regularUpload}
                      description={uiText.regularUploadDesc}
                      icon={<CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />}
                      preview={formData.uploadedImage}
                    />
                  </label>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <UploadWindow
                    title={uiText.enhancedUpload}
                    description={uiText.enhancedUploadDesc}
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
                  <InputLabel>{uiText.flierSize}</InputLabel>
                  <Select
                    value={formData.flierSize}
                    onChange={handleInputChange('flierSize')}
                    label={uiText.flierSize}
                  >
                    {AIInfoCollectionConfig.flierSizes.map((size) => (
                      <MenuItem key={size.value} value={size.value}>
                        {size.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{uiText.orientation}</InputLabel>
                  <Select
                    value={formData.orientation}
                    onChange={handleInputChange('orientation')}
                    label={uiText.orientation}
                  >
                    {AIInfoCollectionConfig.orientations.map((orient) => (
                      <MenuItem key={orient.value} value={orient.value}>
                        {orient.label}
                      </MenuItem>
                    ))}
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
                {isAnalyzing ? uiText.analyzingImages : uiText.continueButton}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
};

// ================================
// HELPER SUB-COMPONENTS (Used in JSX above)
// ================================

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
        <Tooltip title={getUIText().comingSoon} placement="top">
          <LockIcon sx={{ position: 'absolute', top: 10, right: 10, color: 'text.disabled' }} />
        </Tooltip>
      )}
      {preview && (
        <Box sx={{ mt: 'auto', width: '100%', maxHeight: AIInfoCollectionConfig.upload.previewMaxHeight, overflow: 'hidden' }}>
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

export default AIInfoCollection;