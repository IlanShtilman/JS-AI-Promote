import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { Groq } from 'groq-sdk';



// Simple check of environment variables
console.log('Checking environment variables...');
console.log('OPENAI_API_KEY:', process.env.REACT_APP_OPENAI_API_KEY ? 'Found' : 'Missing');
console.log('CLAUDE_API_KEY:', process.env.REACT_APP_CLAUDE_API_KEY ? 'Found' : 'Missing');
console.log('GROQ_API_KEY:', process.env.REACT_APP_GROQ_API_KEY ? 'Found' : 'Missing');
console.log('GEMINI_API_KEY:', process.env.REACT_APP_GEMINI_API_KEY ? 'Found' : 'Missing');

// Initialize variables
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const CLAUDE_API_KEY = process.env.REACT_APP_CLAUDE_API_KEY;
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Initialize clients only if API keys are available
let openai, anthropic, groq, genAI;

try {
  if (OPENAI_API_KEY) {
    openai = new OpenAI({ 
      apiKey: OPENAI_API_KEY, 
      dangerouslyAllowBrowser: true 
    });
    console.log('OpenAI client initialized');
  }
  if (CLAUDE_API_KEY) {
    anthropic = new Anthropic({ 
      apiKey: CLAUDE_API_KEY, 
      dangerouslyAllowBrowser: true 
    });
    console.log('Claude client initialized');
  }
  if (GROQ_API_KEY) {
    groq = new Groq({ 
      apiKey: GROQ_API_KEY,
      dangerouslyAllowBrowser: true 
    });
    console.log('Groq client initialized');
  }
  if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log('Gemini client initialized');
  }
} catch (error) {
  console.error('Error initializing AI clients:', error);
}

const limitToTwoSentences = (text) => {
  const sentences = text.match(/[^.!?]+[.!?](\s|$)/g) || [];
  return sentences.slice(0, 2).join('').trim();
};

const getErrorMessage = (error) => {
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error.response?.data?.error) {
    return typeof error.response.data.error === 'string' 
      ? error.response.data.error 
      : JSON.stringify(error.response.data.error);
  }
  if (error.message) {
    return error.message;
  }
  return 'An unknown error occurred';
};

const generateWithBackend = async (title, promotionalText, language) => {
  try {
    const response = await fetch('http://localhost:8081/api/v1/openai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: language === 'Hebrew'
          ? `כתוב טקסט פרסומי קצר בשתי שורות עבור: ${promotionalText || title}`
          : `Write a short promotional text in two lines for: ${promotionalText || title}`,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.generatedText;
  } catch (error) {
    console.error('Backend Error:', error);
    throw error;
  }
};

export const generateWithOpenAI = async (title, promotionalText, language) => {
  try {
    return await generateWithBackend(title, promotionalText, language);
  } catch (error) {
    console.error('OpenAI Error:', error);
    throw error;
  }
};

export const generateWithClaude = async (title, promotionalText, language) => {
  if (!anthropic) {
    return 'Claude Error: API key not configured';
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 100,
      temperature: 0.7,
      system: language === 'Hebrew'
        ? "אתה מומחה לכתיבת תוכן שיווקי לפליירים ופרסומים עסקיים. תפקידך לכתוב בדיוק 2 משפטים קצרים, משכנעים ואפקטיביים המתאימים לפרסום מסחרי. התמקד בהטבות, מבצעים מיוחדים או הנחות אם הם רלוונטיים, והבלט את היתרונות הייחודיים."
        : "You are an expert at writing marketing content for business flyers and advertisements. Your task is to write exactly 2 short, persuasive and effective sentences suitable for commercial promotion. Focus on benefits, special deals or discounts if relevant, and highlight unique advantages.",
      messages: [
        {
          role: "user",
          content: language === 'Hebrew'
            ? `מוצר/שירות: ${title}\nמידע נוסף: ${promotionalText || 'לא הוזן מידע נוסף'}\n\nכתוב 2 משפטי פרסום מעולים בעברית לפלייר מסחרי שמקדם את המוצר/שירות הזה. הדגש מבצעים מיוחדים או הנחות אם הם רלוונטיים.`
            : `Product/Service: ${title}\nAdditional Info: ${promotionalText || 'No additional info provided'}\n\nWrite 2 excellent promotional sentences in English for a commercial flyer promoting this product/service. Emphasize special deals or discounts if relevant.`
        }
      ]
    });

    return limitToTwoSentences(response.content[0].text);
  } catch (error) {
    console.error('Claude Error:', error);
    return `Claude Error: ${getErrorMessage(error)}`;
  }
};

export const generateWithGroq = async (title, promotionalText, language) => {
  if (!groq) {
    return language === 'Hebrew' ? 'שגיאה: מפתח API של Groq לא מוגדר' : 'Groq Error: API key not configured';
  }

  try {
    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',  // 
      messages: [
        {
          role: 'system',
          content: language === 'Hebrew'
            ? 'כתוב טקסט פרסומי בדיוק כפי שמתבקש, ללא הקדמות או תוספות. הטקסט צריך להיות בשתי שורות עם ירידת שורה ביניהן.'
            : 'Write promotional text exactly as requested, without any prefixes or additions. The text should be in two lines with a line break between them.'
        },
        {
          role: 'user',
          content: language === 'Hebrew'
            ? `כתוב טקסט פרסומי בשתי שורות עבור: ${promotionalText || title}`
            : `Write promotional text in two lines for: ${promotionalText || title}`
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    let text = response.choices[0].message.content.trim();
    // Remove any prefixes
    text = text.replace(/^[^א-ת\w]*|^.*?:/g, '').trim();
    return text;
  } catch (error) {
    console.error('Groq Error:', error);
    throw error;
  }
};

export const generateWithGemini = async (title, promotionalText, language) => {
  try {
    const response = await fetch('http://localhost:8081/api/v1/gemini/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: language === 'Hebrew'
          ? `כתוב טקסט פרסומי קצר בשתי שורות עבור: ${promotionalText || title}`
          : `Write a short promotional text in two lines for: ${promotionalText || title}`,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.generatedText;
  } catch (error) {
    console.error('Gemini Error:', error);
    return language === 'Hebrew' ? 'שגיאה בקבלת תוצאות מ-Gemini' : 'Error getting results from Gemini';
  }
};

// Export this before the individual functions to avoid the reference error
export const generateAllTexts = async (title, promotionalText, language) => {
  const results = {};
  const isHebrew = language === 'Hebrew';

  try {
    // OpenAI
    try {
      const openaiResult = await generateWithOpenAI(title, promotionalText, language);
      results.openai = openaiResult;
    } catch (error) {
      console.error('OpenAI Error:', error);
      results.openai = isHebrew ? 'שגיאה בקבלת תוצאות מ-OpenAI' : 'Error getting results from OpenAI';
    }

    // Claude
    try {
      const claudeResult = await generateWithClaude(title, promotionalText, language);
      results.claude = claudeResult;
    } catch (error) {
      console.error('Claude Error:', error);
      results.claude = isHebrew ? 'שגיאה בקבלת תוצאות מ-Claude' : 'Error getting results from Claude';
    }

    // Groq
    try {
      const groqResult = await generateWithGroq(title, promotionalText, language);
      results.groq = groqResult;
    } catch (error) {
      console.error('Groq Error:', error);
      results.groq = isHebrew ? 'שגיאה בקבלת תוצאות מ-Groq' : 'Error getting results from Groq';
    }

    // Gemini
    try {
      const geminiResult = await generateWithGemini(title, promotionalText, language);
      results.gemini = geminiResult;
    } catch (error) {
      console.error('Gemini Error:', error);
      results.gemini = isHebrew ? 'שגיאה בקבלת תוצאות מ-Gemini' : 'Error getting results from Gemini';
    }

    // Validate and format results
    const cleanAndValidateText = (text, isHebrew) => {
      // Remove any prefixes like "Here's your text:" or similar
      text = text.replace(/^[^א-ת\w]*|^.*?:/g, '').trim();
      
      // Split into lines and filter out empty ones
      const lines = text.split('\n').filter(line => line.trim());
      
      // If we have less than 2 lines, add a default second line
      if (lines.length < 2) {
        lines.push(isHebrew ? 'בואו לגלות עוד!' : 'Come discover more!');
      }
      
      // Take only the first two lines
      return lines.slice(0, 2).join('\n');
    };

    Object.keys(results).forEach(model => {
      if (results[model]) {
        results[model] = cleanAndValidateText(results[model], isHebrew);
      }
    });

    return results;
  } catch (error) {
    console.error('Error generating texts:', error);
    throw error;
  }
}; 