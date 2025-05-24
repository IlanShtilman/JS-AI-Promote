import React from 'react';
import { Box, Typography, RadioGroup, FormControlLabel, Radio, Grid, Card, CardContent } from '@mui/material';

const BackgroundTab = ({ 
  styleOptions, 
  selectedStyleIndex, 
  setSelectedStyleIndex,
  getPatternPreviewStyle 
}) => {
  return (
    <>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Choose a Background</Typography>
      
      {/* AI Style Options - Redesigned as Cards */}
      <Box sx={{ mb: 3 }}>
        <RadioGroup
          value={selectedStyleIndex}
          onChange={e => setSelectedStyleIndex(Number(e.target.value))}
        >
          <Grid container spacing={2}>
            {styleOptions.map((style, idx) => (
              <Grid item xs={12} key={idx}>
                <Card 
                  sx={{ 
                    border: idx === selectedStyleIndex ? '2px solid #1976d2' : '1px solid #ddd',
                    borderRadius: 2,
                    boxShadow: idx === selectedStyleIndex ? '0 0 10px rgba(25, 118, 210, 0.3)' : 'none',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                  onClick={() => setSelectedStyleIndex(idx)}
                >
                  <Box 
                    sx={{
                      // Show image background if available, otherwise fallback to color
                      ...(style.backgroundImage ? {
                        backgroundImage: `url(${style.backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      } : {
                        backgroundColor: style.backgroundColor || '#ffffff',
                        ...getPatternPreviewStyle(style.pattern)
                      }),
                      height: '60px',
                      position: 'relative'
                    }}
                  />
                  <CardContent sx={{ p: 1.5 }}>
                    <FormControlLabel 
                      value={idx}
                      control={<Radio />} 
                      label={
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            Background {idx + 1}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 1 }}>
                            {style.designRationale ? 
                              (style.designRationale.length > 60 ? 
                                style.designRationale.substring(0, 60) + '...' : 
                                style.designRationale) : 
                              `AI Generated Background ${idx + 1}`}
                          </Typography>
                        </Box>
                      }
                      sx={{ display: 'flex', alignItems: 'flex-start', m: 0 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </RadioGroup>
      </Box>
      
      {/* Design rationale section */}
      <Box sx={{ 
        p: 1.5, 
        backgroundColor: 'rgba(0,0,0,0.03)', 
        borderRadius: 1, 
        border: '1px solid rgba(0,0,0,0.08)'
      }}>
        <Typography variant="caption" sx={{ display: 'block', color: '#555', fontWeight: 600, mb: 0.5 }}>
          Design Rationale:
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
          {styleOptions[selectedStyleIndex]?.designRationale || 'A professionally designed style for your flier.'}
        </Typography>
      </Box>
    </>
  );
};

export default BackgroundTab; 