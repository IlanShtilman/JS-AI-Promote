import React, { useRef, useEffect, useState, useCallback } from 'react';
import './AITextResults.css';
import { Box, Typography, Button, Paper, FormControlLabel, Radio, CircularProgress } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { generateAllTexts } from '../../services/AIService/aiService';

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
  }, []); // Empty dependency array is now safe because we use refs

  useEffect(() => {
    if (triggerGeneration && title) {
      generateTexts(title, promotionalText, language);
    }
  }, [triggerGeneration, title, promotionalText, language, generateTexts]); // Now safe to include generateTexts

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

  // Function to detect if text is Hebrew or English
  const detectTextLanguage = (text) => {
    if (!text) return 'ltr';
    
    // Remove common punctuation and whitespace
    const cleanText = text.replace(/[.,!?;:\s\-\n]/g, '');
    
    // Count Hebrew characters (Unicode range for Hebrew)
    const hebrewChars = (cleanText.match(/[\u0590-\u05FF]/g) || []).length;
    
    // Count English/Latin characters
    const englishChars = (cleanText.match(/[a-zA-Z]/g) || []).length;
    
    // If more than 50% of characters are Hebrew, consider it Hebrew text
    const totalRelevantChars = hebrewChars + englishChars;
    if (totalRelevantChars === 0) return 'ltr'; // Default to LTR if no relevant chars
    
    return (hebrewChars / totalRelevantChars) > 0.5 ? 'rtl' : 'ltr';
  };

  // TextContainer component
  const TextContainer = ({ model, text }) => {
    const textDirection = detectTextLanguage(text);
    
    return (
      <Paper
        elevation={3}
        className={`ai-text-results-text-container${selectedText?.model === model ? ' ai-text-results-selected' : ''}`}
      >
        <Box className={`ai-text-results-header ${language === 'Hebrew' ? 'ai-text-results-header-rtl' : ''}`}>
          <Typography
            variant="h6"
            component="div"
            className={`ai-text-results-model-name ${language === 'Hebrew' ? 'ai-text-results-model-name-rtl' : ''}`}
          >
            {model}
          </Typography>
          <FormControlLabel
            control={
              <Radio
                checked={selectedText?.model === model}
                onChange={() => handleSelectText(model, text)}
                color="primary"
              />
            }
            label={language === 'Hebrew' ? 'בחר' : 'Select'}
            labelPlacement={language === 'Hebrew' ? 'start' : 'end'}
            className="ai-text-results-radio-label"
          />
        </Box>
        <div className="ai-text-results-text-block" dir={textDirection}>
          {text.split('\n').map((line, index) => (
            <div
              key={index}
              className="ai-text-results-text-line"
              dir={textDirection}
            >
              {line}
            </div>
          ))}
        </div>
      </Paper>
    );
  };

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
            <TextContainer key={model} model={model} text={text} />
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