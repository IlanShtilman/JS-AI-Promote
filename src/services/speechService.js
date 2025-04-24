const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

export const startSpeechRecognition = (language, onResult, onEnd) => {
  recognition.lang = language === 'Hebrew' ? 'he-IL' : 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onend = onEnd;

  try {
    recognition.start();
  } catch (error) {
    console.error('Speech recognition error:', error);
  }
};

export const stopSpeechRecognition = () => {
  try {
    recognition.stop();
  } catch (error) {
    console.error('Error stopping speech recognition:', error);
  }
}; 