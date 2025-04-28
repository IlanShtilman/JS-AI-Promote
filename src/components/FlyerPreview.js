import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';

const FlyerPreview = ({ flyerData, userImages = {} }) => {
  // If no data is available yet, show a placeholder
  if (!flyerData) {
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '500px',
          width: '100%',
          backgroundColor: '#f8f8f8'
        }}
      >
        <Typography variant="h5" color="textSecondary">
          Flyer preview will appear here
        </Typography>
      </Paper>
    );
  }

  const { layout, elementPositions, colorApplications, fontSelections } = flyerData;

  return (
    <Paper 
      elevation={3}
      sx={{
        position: 'relative',
        width: layout === "A4" ? '595px' : layout === "A5" ? '420px' : '100%',
        height: layout === "A4" ? '842px' : layout === "A5" ? '595px' : '500px',
        margin: '0 auto',
        backgroundColor: colorApplications?.background || '#fff',
        color: colorApplications?.text || '#000',
        overflow: 'hidden'
      }}
    >
      {elementPositions && Object.entries(elementPositions).map(([key, element]) => {
        // Render text elements
        if (element.type === 'text') {
          return (
            <Typography
              key={key}
              variant={element.role === 'heading' ? 'h4' : 'body1'}
              sx={{
                position: 'absolute',
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                color: element.color || colorApplications?.text || '#000',
                fontFamily: element.fontFamily || fontSelections?.body || 'Arial',
                fontSize: element.fontSize || (element.role === 'heading' ? '24px' : '16px'),
                fontWeight: element.fontWeight || (element.role === 'heading' ? 'bold' : 'normal'),
                textAlign: element.textAlign || 'left',
                zIndex: 2
              }}
            >
              {element.content}
            </Typography>
          );
        }
        
        // Render image elements
        if (element.type === 'image') {
          // Check if we have an actual image from the user
          const userImage = userImages[element.src];
          
          // If we have a user-provided image, display it
          if (userImage) {
            return (
              <Box
                key={key}
                component="img"
                src={userImage}
                alt={element.alt || "Flyer image"}
                sx={{
                  position: 'absolute',
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  objectFit: 'cover',
                  zIndex: 1
                }}
              />
            );
          }
          
          // Otherwise display a placeholder
          return (
            <Box
              key={key}
              sx={{
                position: 'absolute',
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                height: `${element.height}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f0f0f0',
                border: '1px dashed #ccc',
                zIndex: 1
              }}
            >
              <ImageIcon sx={{ fontSize: 40, color: '#999' }} />
            </Box>
          );
        }
        
        return null;
      })}
    </Paper>
  );
};

export default FlyerPreview; 