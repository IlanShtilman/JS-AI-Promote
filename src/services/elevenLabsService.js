import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;

export const textToSpeech = async (text, voiceId = '21m00Tcm4TlvDq8ikWAM', stability = 0.5, similarity = 0.5) => {
  try {
    if (!ELEVENLABS_API_KEY) {
      console.error('ElevenLabs API key is not configured');
      throw new Error('ElevenLabs API key is not configured in environment variables');
    }

    console.log('Generating speech for text:', text);
    
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: stability,
          similarity_boost: similarity
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

// Helper function to convert base64 to Blob
const base64ToBlob = (base64, contentType) => {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}; 