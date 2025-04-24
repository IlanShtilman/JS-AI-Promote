import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export const textToSpeech = async (text) => {
  try {
    const response = await axios.post(
      `${ELEVENLABS_API_URL}/text-to-speech/21m00Tcm4TlvDq8ikWAM`,
      {
        text,
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
          'Content-Type': 'application/json',
        },
        responseType: 'blob'
      }
    );

    const audioUrl = URL.createObjectURL(response.data);
    return audioUrl;
  } catch (error) {
    console.error('Error in textToSpeech:', error);
    throw error;
  }
}; 