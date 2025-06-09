import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { startSpeechRecognition, stopSpeechRecognition, playAudio } from '../../../../services/VoiceServices/speechService';
import { textToSpeech } from '../../../../services/VoiceServices/elevenLabsService';
import './VoiceControls.css';

const VoiceControls = ({
  inputType,
  text,
  language,
  isRecording,
  activeInput,
  onError,
  onTextChange,
  onRecordingStateChange
}) => {
  const handleSpeechToText = () => {
    if (isRecording) {
      stopSpeechRecognition();
      onRecordingStateChange(false, null);
    } else {
      try {
        onRecordingStateChange(true, inputType);
        startSpeechRecognition(
          language,
          (transcript) => {
            onTextChange(transcript);
          },
          (error) => {
            onRecordingStateChange(false, null);
            if (error) {
              onError(`Speech recognition error: ${error.message || 'Please try again'}`);
            }
          }
        );
      } catch (error) {
        onRecordingStateChange(false, null);
        onError('Speech recognition is not supported in your browser');
      }
    }
  };

  const handleTextToSpeech = async () => {
    if (language !== 'English') {
      onError('Text-to-speech is only available in English');
      return;
    }
    if (!text.trim()) {
      onError('No text to convert to speech');
      return;
    }
    try {
      const audioUrl = await textToSpeech(text);
      const audio = playAudio(audioUrl);
      
      audio.onended = () => {
        // Handle audio ended
      };
      
      audio.onerror = () => {
        onError('Error playing audio. Please try again.');
      };
    } catch (err) {
      onError('Error converting text to speech. Please try again.');
    }
  };

  return (
    <div className="voice-controls">
      <Tooltip title={language === 'Hebrew' ? 'הקלט טקסט' : 'Record Text'}>
        <IconButton
          onClick={handleSpeechToText}
          color={isRecording && activeInput === inputType ? 'primary' : 'default'}
          className="voice-control-button"
        >
          <MicIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={language === 'Hebrew' ? 'השמע טקסט' : 'Play Text'}>
        <IconButton
          onClick={handleTextToSpeech}
          className="voice-control-button"
        >
          <VolumeUpIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default VoiceControls; 