import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Grid
} from '@mui/material';
import { motion } from 'framer-motion';

const AIFlierDesigner = ({ selectedText, logo, language, title, promotionText }) => {
  const [loading, setLoading] = useState(false);
  const [generatedDesigns, setGeneratedDesigns] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);

  const isRTL = language === 'Hebrew';
  const direction = isRTL ? 'rtl' : 'ltr';

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          {isRTL ? 'עיצוב פלייר באמצעות AI' : 'AI Flier Designer'}
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary">
          {isRTL 
            ? 'המערכת תייצר מספר עיצובים מותאמים אישית עבורך' 
            : 'The system will generate multiple customized designs for you'}
        </Typography>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          mb: 4,
          backgroundColor: '#f8f9fa',
          borderRadius: '12px'
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: '8px' }}>
              <Typography variant="h6" gutterBottom>
                {isRTL ? 'פרטי העיצוב' : 'Design Details'}
              </Typography>
              <Typography variant="body1" paragraph>
                {isRTL ? 'כותרת: ' : 'Title: '} {title}
              </Typography>
              {logo && (
                <Box sx={{ my: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    {isRTL ? 'לוגו:' : 'Logo:'}
                  </Typography>
                  <img 
                    src={logo} 
                    alt="Business Logo" 
                    style={{ maxWidth: '100%', height: 'auto' }} 
                  />
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box 
              sx={{ 
                p: 2, 
                backgroundColor: 'white', 
                borderRadius: '8px',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {loading ? (
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={60} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {isRTL ? 'מעצב את הפלייר...' : 'Designing your flier...'}
                  </Typography>
                </Box>
              ) : generatedDesigns.length === 0 ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => {
                    // TODO: Implement AI design generation
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                      // Add mock designs for now
                      setGeneratedDesigns(['Design 1']);
                    }, 2000);
                  }}
                >
                  {isRTL ? 'צור עיצובים' : 'Generate Designs'}
                </Button>
              ) : (
                <Typography variant="h6">
                  {isRTL ? 'עיצובים שנוצרו' : 'Generated Designs'}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AIFlierDesigner; 