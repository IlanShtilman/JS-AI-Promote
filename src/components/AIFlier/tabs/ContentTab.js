import React from 'react';
import { Box, Typography, TextField, Button, RadioGroup, FormControlLabel, Radio, Checkbox, Tooltip } from '@mui/material';

// Helper function to detect RTL (Hebrew/Arabic) or LTR (default)
function getDirection(text) {
  if (/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/.test(text)) {
    return 'rtl';
  }
  return 'ltr';
}

const ContentTab = ({ 
  flierContent, 
  handleContentChange,
  handleFlierPhotoUpload,
  flierPhotoSource,
  setFlierPhotoSource,
  setFlierContent,
  showFlierPhoto,
  setShowFlierPhoto
}) => {
  return (
    <>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Edit Content</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="Title"
          value={flierContent.title}
          onChange={handleContentChange('title')}
          fullWidth
          variant="outlined"
          inputProps={{ dir: getDirection(flierContent.title) }}
          sx={{ '& .MuiInputBase-input': { fontWeight: 'bold' } }}
          helperText={<span dir={getDirection('כותרת ראשית של הפלייר')}>כותרת ראשית של הפלייר</span>}
        />
        
        <TextField
          label="Promotional Text"
          value={flierContent.promotionalText}
          onChange={handleContentChange('promotionalText')}
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          inputProps={{ dir: getDirection(flierContent.promotionalText) }}
          helperText={<span dir={getDirection('כתבו את הטקסט הפרסומי')}>כתבו את הטקסט הפרסומי</span>}
        />
        
        <TextField
          label="QR Code URL"
          value={flierContent.qrUrl}
          onChange={handleContentChange('qrUrl')}
          fullWidth
          variant="outlined"
          inputProps={{ dir: getDirection(flierContent.qrUrl) }}
          helperText={<span dir={getDirection('הכתובת אליה יוביל קוד ה-QR')}>הכתובת אליה יוביל קוד ה-QR</span>}
        />

        <TextField
          label="QR Instructions"
          value={flierContent.qrInstructions}
          onChange={handleContentChange('qrInstructions')}
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          inputProps={{ dir: getDirection(flierContent.qrInstructions) }}
          helperText={<span dir={getDirection('הוראות מתחת לקוד ה-QR (שורה לכל הוראה)')}>הוראות מתחת לקוד ה-QR (שורה לכל הוראה)</span>}
        />

        {/* Add Photo to Flier (not as background) */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>Add Photo to Flier</Typography>
          <RadioGroup
            row
            value={flierPhotoSource}
            onChange={e => {
              setFlierPhotoSource(e.target.value);
              if (e.target.value === 'previous') {
                setFlierContent(prev => ({ ...prev, flierPhoto: prev.image }));
                setShowFlierPhoto(true);
              }
              if (e.target.value === 'upload') {
                setFlierContent(prev => ({ ...prev, flierPhoto: null }));
                setShowFlierPhoto(false);
              }
            }}
            sx={{ mb: 1 }}
          >
            <FormControlLabel
              value="previous"
              control={<Radio />}
              label="Use previously uploaded photo"
              disabled={!flierContent.image}
            />
            <FormControlLabel
              value="upload"
              control={<Radio />}
              label="Upload new photo"
            />
          </RadioGroup>
          {flierPhotoSource === 'upload' && (
            <Button variant="outlined" component="label" fullWidth>
              Upload Photo
              <input 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={handleFlierPhotoUpload}
              />
            </Button>
          )}
          {flierContent.flierPhoto && (
            <Box sx={{ mt: 2, p: 1, border: '1px dashed #ccc', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                Photo on Flier:
              </Typography>
              <img 
                src={flierContent.flierPhoto} 
                alt="Flier Photo" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100px', 
                  display: 'block',
                  margin: '0 auto'
                }} 
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showFlierPhoto}
                    onChange={e => setShowFlierPhoto(e.target.checked)}
                  />
                }
                label="Show photo on flier"
                sx={{ mt: 1 }}
              />
            </Box>
          )}
        </Box>

        {/* Generate the food (locked) */}
        <Box>
          <Tooltip title="Coming soon: Generate food photo with AI" placement="top">
            <span>
              <Button variant="contained" color="secondary" fullWidth disabled startIcon={<span className="material-icons">lock</span>}>
                Generate the food
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </>
  );
};

export default ContentTab; 