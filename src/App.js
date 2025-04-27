import React, { useState, useRef, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
  Snackbar,
  Alert,
  Stack,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MicIcon from '@mui/icons-material/Mic';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { motion, AnimatePresence } from 'framer-motion';
import { startSpeechRecognition, stopSpeechRecognition, playAudio } from './services/speechService';
import { textToSpeech } from './services/elevenLabsService';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { generateAllTexts } from './services/aiService';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DesignModeSelection from './components/DesignModeSelection';
import ManualFlierDesigner from './components/ManualFlierDesigner';
import AIFlierDesigner from './components/AIFlierDesigner';
import AIInfoCollection from './components/AIInfoCollection';

// Wrap MUI components with motion
const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

// Optimize text input components to prevent re-renders
const MemoizedTextField = React.memo(({ label, value, onChange, multiline, rows, dir, InputProps }) => (
  <TextField
    fullWidth
    label={label}
    value={value}
    onChange={onChange}
    multiline={multiline}
    rows={rows}
    dir={dir}
    InputProps={InputProps}
  />
));

// Completely isolated hover guide component
const HoverGuide = React.memo(({ id, children }) => {
  const [hover, setHover] = React.useState(false);
  
  // Isolated content mapping that doesn't depend on any parent state
  const getContent = (id) => {
    return {
      language: { title: 'בחירת שפה', description: 'בחר את השפה המועדפת עליך לתוכן הפלייר' },
      logo: { title: 'העלאת לוגו', description: 'הוסף את הלוגו של העסק שלך' },
      title: { title: 'כותרת', description: 'הזן כותרת קצרה ומושכת שתהיה במוקד הפלייר' },
      promotional: { title: 'טקסט פרסומי', description: 'הזן טקסט פרסומי או השתמש ב-AI ליצירת רעיונות' },
      generate: { title: 'יצירת טקסטים', description: 'לחץ כדי ליצור מספר גרסאות של טקסט פרסומי באמצעות AI' }
    }[id] || { title: '', description: '' };
  };

  const content = getContent(id);
  const isRtl = true; // Always RTL for the guide
  
  // Determine position based on ID
  const position = ['language', 'title', 'generate'].includes(id) ? 'left' : 'right';
  
  return (
    <div 
      style={{ position: 'relative' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
      
      {hover && (
        <div
          style={{
            position: 'absolute',
            [position]: '105%',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            backgroundColor: 'rgba(248, 249, 250, 0.98)',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            width: '250px',
            border: '1px solid rgba(33, 150, 243, 0.3)',
            direction: 'rtl',
            textAlign: 'right',
            pointerEvents: 'none' // Prevent guide from interfering with mouse events
          }}
        >
          <div style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '8px', color: '#1976d2' }}>
            {content.title}
          </div>
          <div style={{ opacity: 0.87, lineHeight: 1.6, fontSize: '0.875rem' }}>
            {content.description}
          </div>
        </div>
      )}
    </div>
  );
});

// Add this component before the App component
const ModeSelectionWindow = ({ title, description, icon, onClick }) => (
  <Paper
    elevation={3}
    sx={{
      p: 4,
      m: 2,
      width: '300px',
      height: '300px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: 6,
      },
    }}
    onClick={onClick}
  >
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {React.cloneElement(icon, { sx: { fontSize: 64, color: 'primary.main' } })}
    </Box>
    <Typography variant="h5" sx={{ mt: 3, mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
      {title}
    </Typography>
    <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
      {description}
    </Typography>
  </Paper>
);

function App() {
  const [language, setLanguage] = useState('Hebrew');
  const [title, setTitle] = useState('');
  const [promotionalText, setPromotionalText] = useState('');
  const [logo, setLogo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [generatedTexts, setGeneratedTexts] = useState({});
  const [selectedText, setSelectedText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const [imagenAIImage, setImagenAIImage] = useState(null);
  const audioRef = useRef(null);
  const [activeGuide, setActiveGuide] = useState(null);
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [currentStage, setCurrentStage] = useState('input');
  const [aiDesignInfo, setAiDesignInfo] = useState(null);

  // RTL cache
  const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
  });

  // LTR cache
  const cacheLtr = createCache({
    key: 'muiltr',
    stylisPlugins: [prefixer],
  });

  const isRTL = language === 'Hebrew';
  const direction = isRTL ? 'rtl' : 'ltr';
  const theme = createTheme({ direction });

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setLogo(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUserPhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUserPhoto(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAIImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagenAIImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateFlier = async () => {
    if (!title) {
      setError('Please enter a title');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const results = await generateAllTexts(title, promotionalText, language);
      // Ensure we have all model outputs
      const processedResults = {
        'OpenAI': results.openai || 'No text generated',
        'Claude': results.claude || 'No text generated',
        'Groq': results.groq || 'No text generated',
        'Gemini': results.gemini || 'No text generated'
      };
      setGeneratedTexts(processedResults);
      setSelectedText(null);
    } catch (err) {
      setError('Failed to generate text. Please check your API keys and try again.');
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const handleSelectText = useCallback((model, text) => {
    setSelectedText({ model, text });
  }, []);

  const toggleRecording = useCallback((inputField) => {
    if (isRecording) {
      stopSpeechRecognition();
      setIsRecording(false);
      setActiveInput(null);
    } else {
      setIsRecording(true);
      setActiveInput(inputField);
      startSpeechRecognition(
        language,
        (transcript) => {
          if (inputField === 'title') {
            setTitle(transcript);
          } else if (inputField === 'promotional') {
            setPromotionalText(transcript);
          }
        },
        () => {
          setIsRecording(false);
          setActiveInput(null);
        }
      );
    }
  }, [isRecording, language]);

  const handleTextToSpeech = useCallback(async (text) => {
    if (language !== 'English') {
      setError('Text-to-speech is only available for English');
      return;
    }

    try {
      setIsPlaying(true);
      console.log("Converting text to speech:", text);
      const audioUrl = await textToSpeech(text);
      playAudio(audioUrl);
      setTimeout(() => {
        setIsPlaying(false);
      }, 10000);
    } catch (err) {
      console.error("TTS Error:", err);
      setError('Failed to convert text to speech');
      setIsPlaying(false);
    }
  }, [language]);

  const getSpeechTooltip = useCallback((inputType) => {
    return `Click to ${isRecording && activeInput === inputType ? 'stop' : 'start'} voice input for ${inputType}. 
    Currently supporting ${language === 'Hebrew' ? 'Hebrew' : 'English'} language.`;
  }, [isRecording, activeInput, language]);

  const InputControls = React.memo(({ inputType, text }) => (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ px: 1 }}
    >
      <Tooltip title={getSpeechTooltip(inputType)} arrow>
        <IconButton
          onClick={() => toggleRecording(inputType)}
          color={isRecording && activeInput === inputType ? 'error' : 'primary'}
          size="small"
        >
          <MicIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {language === 'English' && (
        <Tooltip title="Click to hear the text" arrow>
          <span>
            <IconButton
              onClick={() => handleTextToSpeech(text)}
              disabled={isPlaying || !text}
              size="small"
            >
              <VolumeUpIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}
      <Tooltip title="Click the microphone to start voice input. Speak clearly and the text will appear here." arrow>
        <IconButton
          size="small"
        >
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  ));

  // Memoize input handlers
  const handleTitleChange = useCallback((e) => {
    setTitle(e.target.value);
  }, []);

  const handlePromotionalTextChange = useCallback((e) => {
    setPromotionalText(e.target.value);
  }, []);

  const handleLanguageChange = useCallback((e) => {
    setLanguage(e.target.value);
  }, []);

  const TextContainer = React.memo(({ model, text }) => (
    <MotionPaper
      elevation={3}
      sx={{
        p: 3,
        mb: 2,
        backgroundColor: 'white',
        border: selectedText?.model === model ? '2px solid #1976d2' : 'none',
        position: 'relative',
        borderRadius: '8px'
      }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        flexDirection: language === 'Hebrew' ? 'row-reverse' : 'row',
        borderBottom: '1px solid #e0e0e0',
        pb: 1
      }}>
        <Typography 
          variant="h6" 
          component="div" 
          color="primary"
          sx={{ 
            fontSize: '1.1rem',
            fontWeight: 600,
            fontFamily: 'Arial',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexDirection: language === 'Hebrew' ? 'row-reverse' : 'row'
          }}
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
          label={language === 'Hebrew' ? "בחר" : "Select"}
          labelPlacement={language === 'Hebrew' ? 'start' : 'end'}
          sx={{
            margin: 0
          }}
        />
      </Box>
      <div
        style={{ 
          direction: 'rtl',
          textAlign: 'right'
        }}
        dir="rtl"
      >
        {text.split('\n').map((line, index) => (
          <div 
            key={index}
            style={{
              marginBottom: index === text.split('\n').length - 1 ? 0 : 16,
              fontSize: '1rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap'
            }}
            dir="rtl"
          >
            {line}
          </div>
        ))}
      </div>
    </MotionPaper>
  ));

  const handleContinueWithSelected = () => {
    setCurrentStage('design-mode');
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    if (mode === 'manual') {
      setCurrentStage('manual-design');
    } else if (mode === 'ai-suggested') {
      setCurrentStage('ai-info-collection');
    }
  };

  const handleAIInfoSubmit = (formData) => {
    setAiDesignInfo(formData);
    setCurrentStage('ai-flier-design');
  };

  const content = (
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
          <Box sx={{ mt: 4, mb: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Typography variant="h3" component="h1" align="center" gutterBottom>
                AI-Powered Flier Creation
              </Typography>
              <Typography variant="subtitle1" align="center" gutterBottom>
                Create professional promotional materials in seconds with advanced AI
              </Typography>
            </motion.div>

            <MotionPaper
              sx={{ mt: 4, p: 3, position: 'relative' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <HoverGuide id="language">
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="language-label">Language</InputLabel>
                  <Select
                    labelId="language-label"
                    value={language}
                    onChange={handleLanguageChange}
                    label="Language"
                    sx={{
                      textAlign: 'left',
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '14px'
                      }
                    }}
                  >
                    <MenuItem value="Hebrew" sx={{ justifyContent: 'flex-start' }}>Hebrew</MenuItem>
                    <MenuItem value="English" sx={{ justifyContent: 'flex-start' }}>English</MenuItem>
                  </Select>
                </FormControl>
              </HoverGuide>

              <HoverGuide id="logo">
                <MotionBox sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    לוגו העסק
                  </Typography>
                  <AnimatePresence mode="wait">
                    {logo && (
                      <MotionBox
                        sx={{ mb: 2 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img src={logo} alt="Business Logo" style={{ maxWidth: '200px' }} />
                      </MotionBox>
                    )}
                  </AnimatePresence>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ 
                      '& .MuiButton-startIcon': {
                        marginRight: '16px',
                        marginLeft: '8px'
                      },
                      padding: '6px 16px 6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    העלאת לוגו
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </Button>
                </MotionBox>
              </HoverGuide>

              <HoverGuide id="title">
                <div style={{ marginBottom: '24px' }}>
                  <MemoizedTextField
                    label="כותרת"
                    value={title}
                    onChange={handleTitleChange}
                    dir="rtl"
                    InputProps={{
                      endAdornment: <InputControls inputType="title" text={title} />
                    }}
                  />
                </div>
              </HoverGuide>

              <HoverGuide id="promotional">
                <div style={{ marginBottom: '24px' }}>
                  <MemoizedTextField
                    label="טקסט פרסומי"
                    multiline
                    rows={4}
                    value={promotionalText}
                    onChange={handlePromotionalTextChange}
                    dir="rtl"
                    InputProps={{
                      endAdornment: <InputControls inputType="promotional" text={promotionalText} />
                    }}
                  />
                </div>
              </HoverGuide>

              <HoverGuide id="generate">
                <div style={{ marginBottom: '24px' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleGenerateFlier}
                    disabled={loading}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={24} color="inherit" />
                        <span>מייצר טקסט...</span>
                      </Box>
                    ) : (
                      'צור טקסט'
                    )}
                  </Button>
                </div>
              </HoverGuide>

              {Object.entries(generatedTexts).length > 0 && (
                <Box sx={{ mt: 4, position: 'relative' }}>
                  <Typography variant="h5" gutterBottom align="center">
                    {language === 'Hebrew' ? 'בחר את הטקסט המועדף עליך' : 'Choose Your Preferred Text'}
                  </Typography>
                  {Object.entries(generatedTexts).map(([model, text]) => (
                    <TextContainer key={model} model={model} text={text} />
                  ))}
                </Box>
              )}
            </MotionPaper>
          </Box>
          {Object.entries(generatedTexts).length > 0 && selectedText && (
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={handleContinueWithSelected}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                }}
              >
                {language === 'Hebrew' ? 'המשך עם הטקסט הנבחר' : 'Continue with Selected Items'}
              </Button>
            </Box>
          )}
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
          userPhoto={userPhoto}
          imagenAIImage={imagenAIImage}
        />
      ) : currentStage === 'ai-info-collection' ? (
        <AIInfoCollection
          language={language}
          onSubmit={handleAIInfoSubmit}
          initialData={{
            businessType: '',
            targetAudience: '',
          }}
        />
      ) : currentStage === 'ai-flier-design' ? (
        <AIFlierDesigner
          selectedText={selectedText?.text}
          logo={logo}
          language={language}
          title={title}
          promotionText={promotionalText}
          designInfo={aiDesignInfo}
        />
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
  );

  return (
    <CacheProvider value={isRTL ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={theme}>
        <Box dir={direction}>
          {/* Rest of your existing App component */}
          {content}
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App; 