import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;

export const textToSpeech = async (text) => {
  try {
    if (!ELEVENLABS_API_KEY) {
      console.error('ElevenLabs API key is not configured');
      throw new Error('ElevenLabs API key is not configured in environment variables');
    }

    console.log('Generating speech for text:', text);
    
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
      {
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      }
    );

    console.log('Received response from ElevenLabs');
    const audioUrl = URL.createObjectURL(response.data);
    console.log('Created audio URL:', audioUrl);
    return audioUrl;
  } catch (error) {
    console.error('Error in textToSpeech:', error);
    throw error;
  }
}; 