# Voice Services

This directory contains services for voice-related functionality in the application.

## Services

### 1. Speech Recognition (speechService.js)
Handles browser's Web Speech API for converting speech to text.

#### Main Functions:
- `startSpeechRecognition(language, onResult, onEnd)`
  - Starts listening for speech
  - Parameters:
    - `language`: 'Hebrew' or 'English'
    - `onResult`: Callback for when speech is recognized
    - `onEnd`: Callback for when recognition ends
  - Returns: void

- `stopSpeechRecognition()`
  - Stops the speech recognition
  - Returns: void

- `playAudio(audioUrl)`
  - Plays audio from a URL
  - Parameters:
    - `audioUrl`: URL of the audio to play
  - Returns: Audio element

### 2. Text-to-Speech (elevenLabsService.js)
Handles conversion of text to speech using the ElevenLabs API.

#### Main Functions:
- `textToSpeech(text)`
  - Converts text to speech
  - Parameters:
    - `text`: Text to convert to speech
  - Returns: Promise<string> (URL of the generated audio)

## Usage Example

```javascript
// Speech to Text
startSpeechRecognition(
  'English',
  (transcript) => {
    console.log('Recognized text:', transcript);
  },
  (error) => {
    if (error) {
      console.error('Error:', error);
    }
  }
);

// Text to Speech
const audioUrl = await textToSpeech('Hello, world!');
playAudio(audioUrl);
```

## Requirements

- Browser with Web Speech API support
- ElevenLabs API key in environment variables (REACT_APP_ELEVENLABS_API_KEY)

## Error Handling

Both services include comprehensive error handling:
- API key validation
- Network errors
- Browser compatibility
- Audio playback errors

## Browser Support

- Speech Recognition: Chrome, Edge, Safari
- Text-to-Speech: All modern browsers (via ElevenLabs API) 