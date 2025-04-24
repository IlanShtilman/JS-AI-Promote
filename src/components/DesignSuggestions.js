import React, { useState, useEffect } from 'react';
import { CircularProgress, Box, Typography, Card, CardContent, Button, Grid } from '@mui/material';
import { analyzeImageWithAzure } from '../services/azureVisionService';
import { generateImage } from '../services/imagenService';

const DesignSuggestions = ({ formData, onSelectDesign }) => {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  const generateColorScheme = (baseColors) => {
    // Generate complementary color schemes based on analyzed colors
    return {
      primary: baseColors.primary || '#2196F3',
      secondary: baseColors.secondary || '#21CBF3',
      background: baseColors.background || '#FFFFFF',
      text: baseColors.accent || '#000000',
      accent: baseColors.accent || '#FFA726'
    };
  };

  const generatePrompt = (businessType, tone, targetAudience) => {
    return `Create a professional ${businessType} promotional image that conveys a ${tone} atmosphere, 
    targeting ${targetAudience}. The image should be clean, modern, and suitable for a business flyer.`;
  };

  const processUserUploadedImage = async () => {
    try {
      // Analyze uploaded image with Azure Vision
      const analysis = await analyzeImageWithAzure(formData.uploadedImage);
      
      // Generate three different color schemes based on the analysis
      const baseColorScheme = analysis.colors;
      const suggestions = [
        {
          id: 1,
          colorScheme: generateColorScheme(baseColorScheme),
          atmosphere: analysis.atmosphere,
          imageUrl: formData.uploadedImage,
          description: 'Classic Professional',
          fonts: {
            title: 'Roboto',
            body: 'Open Sans'
          }
        },
        {
          id: 2,
          colorScheme: {
            ...generateColorScheme(baseColorScheme),
            accent: analysis.colors.secondary
          },
          atmosphere: 'Modern ' + analysis.atmosphere,
          imageUrl: formData.uploadedImage,
          description: 'Modern Dynamic',
          fonts: {
            title: 'Montserrat',
            body: 'Lato'
          }
        },
        {
          id: 3,
          colorScheme: {
            ...generateColorScheme(baseColorScheme),
            background: analysis.colors.accent
          },
          atmosphere: 'Bold ' + analysis.atmosphere,
          imageUrl: formData.uploadedImage,
          description: 'Bold Impact',
          fonts: {
            title: 'Playfair Display',
            body: 'Source Sans Pro'
          }
        }
      ];

      setSuggestions(suggestions);
    } catch (error) {
      setError('Failed to analyze image: ' + error.message);
    }
  };

  const processGeneratedImage = async () => {
    try {
      // Generate three different images with slightly different prompts
      const basePrompt = generatePrompt(
        formData.businessType,
        formData.tone,
        formData.targetAudience
      );

      const variations = [
        { style: 'classic', prompt: basePrompt + ' Style: classic and professional.' },
        { style: 'modern', prompt: basePrompt + ' Style: modern and innovative.' },
        { style: 'bold', prompt: basePrompt + ' Style: bold and impactful.' }
      ];

      const generatedSuggestions = await Promise.all(
        variations.map(async (variation, index) => {
          const imageUrl = await generateImage(variation.prompt);
          // Analyze generated image to get matching colors
          const analysis = await analyzeImageWithAzure(imageUrl);
          
          return {
            id: index + 1,
            colorScheme: generateColorScheme(analysis.colors),
            atmosphere: analysis.atmosphere,
            imageUrl: imageUrl,
            description: variation.style.charAt(0).toUpperCase() + variation.style.slice(1),
            fonts: {
              title: index === 0 ? 'Roboto' : index === 1 ? 'Montserrat' : 'Playfair Display',
              body: index === 0 ? 'Open Sans' : index === 1 ? 'Lato' : 'Source Sans Pro'
            }
          };
        })
      );

      setSuggestions(generatedSuggestions);
    } catch (error) {
      setError('Failed to generate images: ' + error.message);
    }
  };

  useEffect(() => {
    const processSuggestions = async () => {
      try {
        if (formData.useUploadedImage) {
          await processUserUploadedImage();
        } else {
          await processGeneratedImage();
        }
      } catch (error) {
        setError('Failed to process design suggestions: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    processSuggestions();
  }, [formData]);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" style={{ marginTop: 20 }}>
          מעבד את העיצובים המומלצים...
        </Typography>
        <Typography variant="body1" color="textSecondary" style={{ marginTop: 10 }}>
          אנחנו מנתחים את המידע שלך כדי ליצור את העיצובים המושלמים
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          style={{ marginTop: 20 }}
        >
          נסה שוב
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom align="center">
        העיצובים המומלצים שלך
      </Typography>
      <Typography variant="body1" gutterBottom align="center" color="textSecondary">
        בחר אחד מהעיצובים הבאים כדי להמשיך
      </Typography>
      
      <Grid container spacing={3} style={{ marginTop: 20 }}>
        {suggestions.map((suggestion) => (
          <Grid item xs={12} md={4} key={suggestion.id}>
            <Card 
              elevation={3}
              style={{ 
                cursor: 'pointer',
                transition: '0.3s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                }
              }}
              onClick={() => onSelectDesign(suggestion)}
            >
              <img
                src={suggestion.imageUrl}
                alt={`Design suggestion ${suggestion.id}`}
                style={{ width: '100%', height: 200, objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {suggestion.description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  אווירה: {suggestion.atmosphere}
                </Typography>
                <Box mt={2} display="flex" gap={1}>
                  {Object.entries(suggestion.colorScheme).map(([key, color]) => (
                    <Box
                      key={key}
                      width={30}
                      height={30}
                      bgcolor={color}
                      borderRadius="50%"
                      border="1px solid #ddd"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DesignSuggestions; 