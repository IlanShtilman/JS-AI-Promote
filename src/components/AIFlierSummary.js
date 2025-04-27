import React from 'react';
import { Box, Typography, Paper, Button, Grid, Divider } from '@mui/material';

const InfoRow = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
    <Typography variant="body1">{value}</Typography>
  </Box>
);

const AIFlierSummary = ({ info, onBack, onConfirm }) => {
  return (
    <Paper elevation={4} sx={{ p: 4, maxWidth: 700, mx: 'auto', mt: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Review Your Flier Details
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <InfoRow label="Title" value={info.title} />
          <InfoRow label="Promotional Text" value={info.promotionalText} />
          <InfoRow label="Target Audience" value={info.targetAudience} />
          <InfoRow label="Business Type" value={info.businessType} />
          <InfoRow label="Style Preference" value={info.stylePreference} />
          <InfoRow label="Color Scheme" value={info.colorScheme} />
          <InfoRow label="Mood Level" value={info.moodLevel} />
          <InfoRow label="Flier Size" value={info.flierSize} />
          <InfoRow label="Orientation" value={info.orientation} />
        </Grid>
        <Grid item xs={12} sm={6}>
          {info.logo && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Logo</Typography>
              <img src={info.logo} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 8 }} />
            </Box>
          )}
          {info.uploadedImage && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Uploaded Image</Typography>
              <img src={info.uploadedImage} alt="Uploaded Preview" style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 8 }} />
            </Box>
          )}
          {info.azureVision && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Azure Vision Analysis</Typography>
              <Typography variant="body2">Scene: {info.azureVision.sceneType}</Typography>
              <Typography variant="body2">Description: {info.azureVision.description}</Typography>
              <Typography variant="body2">Objects: {Array.isArray(info.azureVision.objects) ? info.azureVision.objects.join(', ') : ''}</Typography>
              {info.azureVision.colors && (
                <Typography variant="body2">Colors: {Object.entries(info.azureVision.colors).map(([k, v]) => `${k}: ${v}`).join(', ')}</Typography>
              )}
            </Box>
          )}
        </Grid>
      </Grid>
      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" color="primary" onClick={onBack}>
          Back / Edit
        </Button>
        <Button variant="contained" color="primary" onClick={onConfirm}>
          Confirm & Generate
        </Button>
      </Box>
    </Paper>
  );
};

export default AIFlierSummary; 