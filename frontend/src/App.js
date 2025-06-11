import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Button, 
  Snackbar,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import { BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom';
import DesignModeSelection from './components/DesignModeSelection/DesignModeSelection';
import ManualFlierDesigner from './components/ManualFlierDesigner/ManualFlierDesigner';
import AIInfoCollection from './components/AIFlierDesigner/AIInfoProcess/AIInfoCollection';
import AIFlierSummary from './components/AIFlierDesigner/AIFlierSummary/AIFlierSummary';
import AIFlier from './components/AIFlier/AIFlier';
import StageUserInfo from './components/StageUserInfo/StageUserInfo';
import AITextResults from './components/AITextResults/AITextResults';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    py: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  backButton: {
    mt: 2,
    display: 'flex',
    justifyContent: 'center',
  }
};

// Wrap MUI components with motion
const MotionContainer = motion(Container);

// ErrorSnackbar component
const ErrorSnackbar = ({ error, setError }) => (
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
);

// HomePage component
const HomePage = ({ 
  loading, 
  selectedText, 
  handleSelectText, 
  handleContinueWithSelected, 
  handleGenerateTexts, 
  setLogo, 
  title, 
  promotionalText, 
  triggerGeneration, 
  setError, 
  handleLoadingChange, 
  logo 
}) => {
  const { language } = useLanguage();
  return (
    <>
      <StageUserInfo
        loading={loading}
        selectedText={selectedText}
        handleSelectText={handleSelectText}
        handleContinueWithSelected={handleContinueWithSelected}
        onGenerateTexts={handleGenerateTexts}
        onLogoChange={setLogo}
        language={language}
        onError={setError}
        onLoadingChange={handleLoadingChange}
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
  );
};

// AIFlierDesign component
const AIFlierDesign = ({ summaryInfo, navigate }) => (
  <>
    <AIFlier
      backgroundOptions={summaryInfo?.backgroundOptions || []}
      flyerContent={{
        title: summaryInfo?.title,
        promotionalText: summaryInfo?.promotionalText,
        logo: summaryInfo?.logo,
        image: summaryInfo?.uploadedImage,
        callToAction: summaryInfo?.callToAction || '',
        qrUrl: summaryInfo?.qrUrl || 'https://example.com',
        qrText: 'Scan the QR code!',
        cta: 'Fill in the form and get the discount'
      }}
    />
    <Box sx={styles.backButton}>
      <Button variant="outlined" color="primary" onClick={() => navigate('/summary')}>
        Back to Summary
      </Button>
    </Box>
  </>
);

function AppContent() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [title, setTitle] = useState('');
  const [promotionalText, setPromotionalText] = useState('');
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summaryInfo, setSummaryInfo] = useState(null);
  const [triggerGeneration, setTriggerGeneration] = useState(false);

  const handleGenerateTexts = (title, promotionalText) => {
    setTitle(title);
    setPromotionalText(promotionalText);
    setTriggerGeneration(prev => !prev);
  };

  const handleLoadingChange = (isLoading) => {
    setLoading(isLoading);
  };

  const handleSelectText = useCallback((selected) => {
    setSelectedText(selected);
  }, []);

  const handleDesignModeBack = () => {
    console.log('Going back from design mode');
    setSelectedText(null);
    setTriggerGeneration(false);
    setLoading(false);
    setError(null);
    navigate('/');
  };

  const handleManualDesignBack = () => {
    console.log('Going back from manual design');
    navigate('/design-mode');
  };

  const handleSummaryBack = () => {
    console.log('Going back from summary');
    navigate('/ai-info-collection');
  };

  const handleAIInfoCollectionBack = () => {
    console.log('Going back from AI info collection');
    navigate('/design-mode');
  };

  const handleSummaryConfirm = async (enhancedSummaryInfo) => {
    try {
      setLoading(true);
      console.log('📋 Flier generation process starting with enhanced summary info:', enhancedSummaryInfo);
      setSummaryInfo(enhancedSummaryInfo);
      navigate('/ai-flier-design');
    } catch (err) {
      console.error('Error during flier generation:', err);
      setError('Failed to process flier: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithSelected = (data) => {
    if (data?.selectedText) {
      setSelectedText(data.selectedText);
      if (data.logo && data.logo !== logo) {
        setLogo(data.logo);
      }
    } else {
      setSelectedText(data);
    }
    navigate('/design-mode');
  };

  const renderContent = () => (
    <Box>
      <MotionContainer
        maxWidth="xl"
        sx={styles.container}
      >
        <Routes>
          <Route path="/" element={
            <HomePage
              loading={loading}
              selectedText={selectedText}
              handleSelectText={handleSelectText}
              handleContinueWithSelected={handleContinueWithSelected}
              handleGenerateTexts={handleGenerateTexts}
              setLogo={setLogo}
              title={title}
              promotionalText={promotionalText}
              triggerGeneration={triggerGeneration}
              setError={setError}
              handleLoadingChange={handleLoadingChange}
              logo={logo}
            />
          } />
          <Route 
            path="/design-mode" 
            element={
              <DesignModeSelection 
                onBack={handleDesignModeBack}
              />
            }
          />
          <Route 
            path="/manual-design" 
            element={
              <ManualFlierDesigner
                selectedText={selectedText?.text}
                logo={logo}
                language={language}
                title={title}
                promotionTitle={title}
                promotionText={promotionalText}
                onBack={handleManualDesignBack}
              />
            }
          />
          <Route 
            path="/ai-info-collection" 
            element={
              <AIInfoCollection
                language={language}
                onSubmit={(summaryInfo) => {
                  console.log('AI Info Collection submitted:', summaryInfo); // Debug log
                  setSummaryInfo(summaryInfo);
                  navigate('/summary');
                }}
                onBack={handleAIInfoCollectionBack}
                initialData={{
                  businessType: '',
                  targetAudience: '',
                  logo,
                  title,
                  selectedText
                }}
              />
            }
          />
          <Route 
            path="/summary" 
            element={
              <AIFlierSummary
                info={summaryInfo}
                onBack={handleSummaryBack}
                onConfirm={handleSummaryConfirm}
                language={language}
              />
            }
          />
          <Route 
            path="/ai-flier-design" 
            element={
              <AIFlierDesign 
                summaryInfo={summaryInfo}
                navigate={navigate}
              />
            }
          />
        </Routes>
        <ErrorSnackbar error={error} setError={setError} />
      </MotionContainer>
    </Box>
  );

  return renderContent();
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App; 