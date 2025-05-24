import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Button, 
  Snackbar,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import { generateFlierConfig } from './services/aiService';
import DesignModeSelection from './components/DesignModeSelection/DesignModeSelection';
import ManualFlierDesigner from './components/ManualFlierDesigner/ManualFlierDesigner';
import AIInfoCollection from './components/AIInfoProcess/AIInfoCollection';
import AIFlierSummary from './components/AIFlierSummary/AIFlierSummary';
import AIFlier from './components/AIFlier/AIFlier';
import StageUserInfo from './components/StageUserInfo/StageUserInfo';
import AITextResults from './components/AITextResults/AITextResults';

// Wrap MUI components with motion
const MotionContainer = motion(Container);

function App() {
  const [language, setLanguage] = useState('Hebrew');
  const [title, setTitle] = useState('');
  const [promotionalText, setPromotionalText] = useState('');
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [currentStage, setCurrentStage] = useState('input');
  const [aiDesignInfo, setAiDesignInfo] = useState(null);
  const [summaryInfo, setSummaryInfo] = useState(null);
  const [triggerGeneration, setTriggerGeneration] = useState(false);

  // Updated to trigger generation in AITextResults
  const handleGenerateTexts = (title, promotionalText, language) => {
    setTitle(title);
    setPromotionalText(promotionalText);
    setLanguage(language);
    setTriggerGeneration(prev => !prev); // Toggle to trigger useEffect in AITextResults
  };

  const handleLoadingChange = (isLoading) => {
    setLoading(isLoading);
  };

  const handleSelectText = useCallback((selected) => {
    setSelectedText(selected);
  }, []);

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    if (mode === 'manual') {
      setCurrentStage('manual-design');
    } else if (mode === 'ai-suggested') {
      setCurrentStage('ai-info-collection');
    }
  };

  const handleSummaryBack = () => {
    setCurrentStage('ai-info-collection');
  };

  const handleSummaryConfirm = async () => {
    try {
      setLoading(true);
      console.log('Starting flier generation process with summary info:', summaryInfo);
      
      // Call the updated generateFlierConfig function that uses both
      // the AI styling advice and the layout engine
      const config = await generateFlierConfig(summaryInfo);
      
      console.log('Combined AI and layout engine flier config:', config);
      setAiDesignInfo(config);
      setCurrentStage('ai-flier-design');
    } catch (err) {
      console.error('Error during flier generation:', err);
      setError('Failed to generate flier config: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithSelected = (data) => {
    // Handle both old format (just text) and new format (object with text and logo)
    if (data?.selectedText) {
      setSelectedText(data.selectedText);
      // Logo is already stored in state, but if passed in data, use that
      if (data.logo && data.logo !== logo) {
        setLogo(data.logo);
      }
    } else {
      // Backward compatibility - if data is just the text object
      setSelectedText(data);
    }
    setCurrentStage('design-mode');
  };

  return (
    <Box>
      <MotionContainer
        maxWidth="xl"
        sx={{
          minHeight: '100vh',
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {currentStage === 'input' ? (
          <>
            <StageUserInfo
              loading={loading}
              selectedText={selectedText}
              handleSelectText={handleSelectText}
              handleContinueWithSelected={handleContinueWithSelected}
              onGenerateTexts={handleGenerateTexts}
              onLogoChange={setLogo}
            />
            <AITextResults
              language={language}
              title={title}
              promotionalText={promotionalText}
              triggerGeneration={triggerGeneration}
              onSelectText={handleSelectText}
              onContinue={handleContinueWithSelected}
              onError={setError}
              onLoadingChange={handleLoadingChange}
              logo={logo}
            />
          </>
        ) : currentStage === 'design-mode' ? (
          <DesignModeSelection 
            language={language}
            onModeSelect={handleModeSelect}
          />
        ) : currentStage === 'manual-design' ? (
          <ManualFlierDesigner
            selectedText={selectedText?.text}
            logo={logo}
            language={language}
            title={title}
            promotionTitle={title}
            promotionText={promotionalText}
          />
        ) : currentStage === 'ai-info-collection' ? (
          <AIInfoCollection
            language={language}
            onSubmit={(summaryInfo) => {
              setSummaryInfo(summaryInfo);
              setCurrentStage('summary');
            }}
            initialData={{
              businessType: '',
              targetAudience: '',
              logo, // Pass the logo state
              title, // Pass the title
              selectedText  // Pass the selected text
            }}
          />
        ) : currentStage === 'summary' ? (
          <AIFlierSummary
            info={summaryInfo}
            onBack={handleSummaryBack}
            onConfirm={handleSummaryConfirm}
            language={language}
          />
        ) : currentStage === 'ai-flier-design' ? (
          <>
            <AIFlier
              aiStyleOptions={aiDesignInfo?.aiStyleOptions}
              flyerContent={{
                title: summaryInfo?.title,
                promotionalText: summaryInfo?.promotionalText,
                logo: summaryInfo?.logo,
                image: summaryInfo?.uploadedImage,
                callToAction: summaryInfo?.callToAction || 'Your CTA here',
                qrUrl: summaryInfo?.qrUrl || 'https://example.com',
                qrText: 'Scan the QR code!',
                cta: 'Fill in the form and get the discount'
              }}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button variant="outlined" color="primary" onClick={() => setCurrentStage('summary')}>
                Back to Summary
              </Button>
            </Box>
          </>
        ) : null}
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity={error?.severity || "error"} sx={{ width: '100%' }}>
            {error?.message || error}
          </Alert>
        </Snackbar>
      </MotionContainer>
    </Box>
  );
}

export default App; 