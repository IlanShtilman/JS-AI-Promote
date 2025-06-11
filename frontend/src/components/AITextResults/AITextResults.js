import React, { useRef, useEffect, useState, useCallback } from 'react';
import './AITextResults.css';
import { Box, Typography, Button,  CircularProgress } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { generateAllTexts } from '../../services/AIService/aiService';
import TextContainer from './TextContainer';

const AITextResults = ({
  language,
  onSelectText,
  onContinue,
  title,
  promotionalText,
  triggerGeneration,
  onError,
  onLoadingChange,
  logo
}) => {
  const [generatedTexts, setGeneratedTexts] = useState({});
  const [selectedText, setSelectedText] = useState(null);
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef(null);
  
  // Use refs to store latest callback functions to avoid dependency issues
  const onErrorRef = useRef(onError);
  const onLoadingChangeRef = useRef(onLoadingChange);
  
  // Update refs when props change
  useEffect(() => {
    onErrorRef.current = onError;
    onLoadingChangeRef.current = onLoadingChange;
  }, [onError, onLoadingChange]);
  
  // Handle text generation
  const generateTexts = useCallback(async (title, promotionalText, language) => {
    setLoading(true);
    if (onLoadingChangeRef.current) onLoadingChangeRef.current(true);
    
    try {
      const results = await generateAllTexts(title, promotionalText, language);
      const processedResults = {
        'OpenAI': results.openai || 'No text generated',
        'Claude': results.claude || 'No text generated',
        'Groq': results.groq || 'No text generated',
        'Gemini': results.gemini || 'No text generated'
      };
      setGeneratedTexts(processedResults);
      setSelectedText(null);
    } catch (err) {
      if (onErrorRef.current) {
        onErrorRef.current('Failed to generate text. Please check your API keys and try again.');
      }
      console.error('Error:', err);
    } finally {
      setLoading(false);
      if (onLoadingChangeRef.current) onLoadingChangeRef.current(false);
    }
  }, []);

  useEffect(() => {
    if (triggerGeneration && title) {
      generateTexts(title, promotionalText, language);
    }
  }, [triggerGeneration, title, promotionalText, language, generateTexts]);

  // Handle text selection
  const handleSelectText = useCallback((model, text) => {
    const selected = { model, text };
    setSelectedText(selected);
    if (onSelectText) onSelectText(selected);
  }, [onSelectText]);

  // Handle continue button click
  const handleContinue = () => {
    if (onContinue && selectedText) {
      onContinue({
        selectedText,
        logo
      });
    }
  };

  // Scroll to results when they are generated
  useEffect(() => {
    if (!loading && Object.keys(generatedTexts).length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, generatedTexts]);

  // If there are no generated texts and not loading, don't render anything
  if (Object.keys(generatedTexts).length === 0 && !loading && !triggerGeneration) {
    return null;
  }

  return (
    <>
      <Box className="ai-text-results-container" ref={resultsRef}>
        <Typography variant="h5" gutterBottom align="center">
          {language === 'Hebrew' ? 'בחר את הטקסט המועדף עליך' : 'Choose Your Preferred Text'}
        </Typography>
        {loading ? (
          <Box className="ai-text-results-loading">
            <CircularProgress />
            <Typography variant="body1" align="center" sx={{ mt: 2 }}>
              {language === 'Hebrew' ? 'מייצר טקסטים...' : 'Generating texts...'}
            </Typography>
          </Box>
        ) : (
          Object.entries(generatedTexts).map(([model, text]) => (
            <TextContainer
              key={model}
              model={model}
              text={text}
              selectedText={selectedText}
              handleSelectText={handleSelectText}
              language={language}
            />
          ))
        )}
      </Box>
      {!loading && selectedText && (
        <Box className="ai-text-results-continue-btn">
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={handleContinue}
            className="ai-text-results-continue-btn-inner"
          >
            {language === 'Hebrew' ? 'המשך עם הטקסט הנבחר' : 'Continue with Selected Item'}
          </Button>
        </Box>
      )}
    </>
  );
};

export default AITextResults; 