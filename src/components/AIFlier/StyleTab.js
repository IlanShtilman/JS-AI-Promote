import React from 'react';
import { Box, Typography, Slider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AppleIcon from '@mui/icons-material/Apple';
import FacebookIcon from '@mui/icons-material/Facebook';
import PaletteIcon from '@mui/icons-material/Palette';

const StyleTab = ({
  favoritePreset,
  handleFavoritePresetChange,
  borderRadius,
  setBorderRadius,
  fontSize,
  setFontSize,
  bodyFontSize,
  setBodyFontSize,
  fontFamily,
  setFontFamily,
  selectedStyle,
  handleStyleColorChange
}) => {
  // Check if current style uses an image background
  const hasImageBackground = selectedStyle.backgroundImage && 
                             selectedStyle.backgroundImage !== 'none' && 
                             selectedStyle.backgroundImage.includes('http');

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Our Favorite</Typography>
        <FormControl fullWidth>
          <InputLabel id="favorite-preset-label">Choose a Style</InputLabel>
          <Select
            labelId="favorite-preset-label"
            value={favoritePreset}
            label="Choose a Style"
            onChange={handleFavoritePresetChange}
          >
            <MenuItem value="AI Recommendation">
              <AutoAwesomeIcon sx={{ mr: 1, color: '#fbc02d' }} /> AI Recommendation
            </MenuItem>
            <MenuItem value="Google Clean">
              <Box sx={{ width: 20, height: 20, background: '#4285F4', borderRadius: '4px', display: 'inline-block', mr: 1, border: '1px solid #ccc' }} /> Google Clean
            </MenuItem>
            <MenuItem value="Apple Matte">
              <AppleIcon sx={{ mr: 1, color: '#1d1d1f' }} /> Apple Matte
            </MenuItem>
            <MenuItem value="Canva Style">
              <PaletteIcon sx={{ mr: 1, color: '#3ec6e0' }} /> Canva Style
            </MenuItem>
            <MenuItem value="Facebook Meta">
              <FacebookIcon sx={{ mr: 1, color: '#1877f2' }} /> Facebook Meta
            </MenuItem>
            <MenuItem value="Samsung">
              <span style={{fontSize: '1.2em', marginRight: 6}}>📱</span> Samsung
            </MenuItem>
            <MenuItem value="Nokia">
              <span style={{fontSize: '1.2em', marginRight: 6}}>📞</span> Nokia
            </MenuItem>
            <MenuItem value="HTC">
              <span style={{fontSize: '1.2em', marginRight: 6}}>🟩</span> HTC
            </MenuItem>
            <MenuItem value="Sony">
              <span style={{fontSize: '1.2em', marginRight: 6}}>🎵</span> Sony
            </MenuItem>
            <MenuItem value="Netflix">
              <span style={{fontSize: '1.2em', marginRight: 6}}>🎬</span> Netflix
            </MenuItem>
            <MenuItem value="Android">
              <span style={{fontSize: '1.2em', marginRight: 6}}>🤖</span> Android
            </MenuItem>
            <MenuItem value="Xiaomi">
              <span style={{fontSize: '1.2em', marginRight: 6}}>🟧</span> Xiaomi
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Style Options</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Border radius control */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Border Radius: {borderRadius}px
          </Typography>
          <Slider
            value={borderRadius}
            onChange={(e, newValue) => setBorderRadius(newValue)}
            min={0}
            max={30}
            step={1}
            valueLabelDisplay="auto"
            marks={[
              { value: 0, label: '0' },
              { value: 15, label: '15' },
              { value: 30, label: '30' },
            ]}
          />
        </Box>
        
        {/* Font controls */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Title Font Size: {fontSize}rem
          </Typography>
          <Slider
            value={fontSize}
            onChange={(e, newValue) => setFontSize(newValue)}
            min={1.5}
            max={3.5}
            step={0.1}
            valueLabelDisplay="auto"
            marks={[
              { value: 1.5, label: 'S' },
              { value: 2.5, label: 'M' },
              { value: 3.5, label: 'L' },
            ]}
          />
        </Box>
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Body Font Size: {bodyFontSize}rem
          </Typography>
          <Slider
            value={bodyFontSize}
            onChange={(e, newValue) => setBodyFontSize(newValue)}
            min={0.8}
            max={1.6}
            step={0.05}
            valueLabelDisplay="auto"
            marks={[
              { value: 0.8, label: 'S' },
              { value: 1.2, label: 'M' },
              { value: 1.6, label: 'L' },
            ]}
          />
        </Box>
        
        <FormControl fullWidth>
          <InputLabel id="font-family-label">Font Family</InputLabel>
          <Select
            labelId="font-family-label"
            value={fontFamily}
            label="Font Family"
            onChange={(e) => setFontFamily(e.target.value)}
          >
            <MenuItem value="Roboto">Roboto</MenuItem>
            <MenuItem value="Arial">Arial</MenuItem>
            <MenuItem value="Helvetica">Helvetica</MenuItem>
            <MenuItem value="Times New Roman">Times New Roman</MenuItem>
            <MenuItem value="David">David</MenuItem>
          </Select>
        </FormControl>
        

        
        {/* Color pickers - Hide background color for image backgrounds */}
        {!hasImageBackground && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>Background Color</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: 1, 
                  border: '1px solid #ccc',
                  backgroundColor: selectedStyle.backgroundColor || '#ffffff',
                  cursor: 'pointer',
                  position: 'relative'
                }} 
                onClick={() => document.getElementById('bg-color-picker').click()}
              >
                <input
                  id="bg-color-picker"
                  type="color"
                  value={selectedStyle.backgroundColor || '#ffffff'}
                  onChange={handleStyleColorChange('backgroundColor')}
                  style={{ opacity: 0, width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, cursor: 'pointer' }}
                  tabIndex={-1}
                />
              </Box>
              <Typography variant="body2" sx={{ color: '#666' }}>
                {selectedStyle.backgroundColor || '#ffffff'}
              </Typography>
            </Box>
          </Box>
        )}
        
        {/* Show info when using image background */}
        {hasImageBackground && (
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'rgba(25, 118, 210, 0.1)', 
            borderRadius: 1, 
            border: '1px solid rgba(25, 118, 210, 0.2)'
          }}>
            <Typography variant="subtitle2" sx={{ color: '#1976d2', fontWeight: 600, mb: 1 }}>
              🎨 Using AI Generated Background
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Background color controls are disabled when using image backgrounds. 
              Switch to a different background in the BACKGROUND tab to access color controls.
            </Typography>
          </Box>
        )}
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>Text Color</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              sx={{ 
                width: 36, 
                height: 36, 
                borderRadius: 1, 
                border: '1px solid #ccc',
                backgroundColor: selectedStyle.textColor || '#333333',
                cursor: 'pointer',
                position: 'relative'
              }} 
              onClick={() => document.getElementById('text-color-picker').click()}
            >
              <input
                id="text-color-picker"
                type="color"
                value={selectedStyle.textColor || '#333333'}
                onChange={handleStyleColorChange('textColor')}
                style={{ opacity: 0, width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, cursor: 'pointer' }}
                tabIndex={-1}
              />
            </Box>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {selectedStyle.textColor || '#333333'}
            </Typography>
          </Box>
        </Box>
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>Primary Color (from Image Analysis)</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              sx={{ 
                width: 36, 
                height: 36, 
                borderRadius: 1, 
                border: '1px solid #ccc',
                backgroundColor: selectedStyle.primaryColor || '#1a4a52',
                cursor: 'pointer',
                position: 'relative'
              }} 
              onClick={() => document.getElementById('primary-color-picker').click()}
            >
              <input
                id="primary-color-picker"
                type="color"
                value={selectedStyle.primaryColor || '#1a4a52'}
                onChange={handleStyleColorChange('primaryColor')}
                style={{ opacity: 0, width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, cursor: 'pointer' }}
                tabIndex={-1}
              />
            </Box>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {selectedStyle.primaryColor || '#1a4a52'}
            </Typography>
          </Box>
        </Box>
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>Secondary Color (from Image Analysis)</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              sx={{ 
                width: 36, 
                height: 36, 
                borderRadius: 1, 
                border: '1px solid #ccc',
                backgroundColor: selectedStyle.secondaryColor || '#F5F5DC',
                cursor: 'pointer',
                position: 'relative'
              }} 
              onClick={() => document.getElementById('secondary-color-picker').click()}
            >
              <input
                id="secondary-color-picker"
                type="color"
                value={selectedStyle.secondaryColor || '#F5F5DC'}
                onChange={handleStyleColorChange('secondaryColor')}
                style={{ opacity: 0, width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, cursor: 'pointer' }}
                tabIndex={-1}
              />
            </Box>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {selectedStyle.secondaryColor || '#F5F5DC'}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>Accent Color</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              sx={{ 
                width: 36, 
                height: 36, 
                borderRadius: 1, 
                border: '1px solid #ccc',
                backgroundColor: selectedStyle.accentColor || '#1976d2',
                cursor: 'pointer',
                position: 'relative'
              }} 
              onClick={() => document.getElementById('accent-color-picker').click()}
            >
              <input
                id="accent-color-picker"
                type="color"
                value={selectedStyle.accentColor || '#1976d2'}
                onChange={handleStyleColorChange('accentColor')}
                style={{ opacity: 0, width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, cursor: 'pointer' }}
                tabIndex={-1}
              />
            </Box>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {selectedStyle.accentColor || '#1976d2'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default StyleTab; 