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

export const generateWithOpenAI = async (title, promotionalText, language) => {
  if (!openai) {
    return 'OpenAI Error: API key not configured';
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',  // Changed from gpt-4 to a valid model
      messages: [
        {
          role: 'system',
          content: language === 'Hebrew' 
            ? 'אתה מומחה לכתיבת תוכן שיווקי לפליירים עסקיים. כתוב 2 משפטים קצרים, ממוקדים ומשכנעים שמתאימים לפרסום של עסק. השתמש בשפה מושכת, הדגש את היתרונות והצע ערך ברור ללקוח. התמקד בהצעות, מבצעים או הנחות אם הם רלוונטיים.'
            : 'You are an expert at writing marketing content for business flyers. Write 2 short, focused and persuasive sentences suitable for business promotion. Use engaging language, emphasize benefits and offer clear value to the customer. Focus on offers, deals or discounts if relevant.'
        },
        {
          role: 'user',
          content: language === 'Hebrew'
            ? `כותרת מוצר/שירות: ${title}\nמידע נוסף: ${promotionalText || 'לא הוזן מידע נוסף'}\n\nכתוב 2 משפטי פרסום אטרקטיביים בעברית עבור פלייר שמקדם מוצר/שירות זה. התמקד במבצעים והטבות אם הם קיימים.`
            : `Product/Service Title: ${title}\nAdditional Info: ${promotionalText || 'No additional info provided'}\n\nWrite 2 attractive promotional sentences in English for a flyer promoting this product/service. Focus on special offers and benefits if they exist.`
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    return limitToTwoSentences(response.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI Error:', error);
    return `OpenAI Error: ${getErrorMessage(error)}`;
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
    return 'Groq Error: API key not configured';
  }

  try {
    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',  // 
      messages: [
        {
          role: 'system',
          content: language === 'Hebrew'
            ? 'אתה כותב תוכן פרסומי מקצועי לפליירים עסקיים. המטרה שלך היא לכתוב בדיוק 2 משפטים קצרים, חדים ומשכנעים שמתאימים לפרסום מסחרי. התמקד במבצעים והטבות מיוחדות, הדגש את ההנחות ואת הערך שהלקוח יקבל.'
            : 'You are a professional copywriter for business flyers. Your goal is to write exactly 2 short, sharp and persuasive sentences suitable for commercial promotion. Focus on special deals and offers, emphasize discounts and the value the customer will receive.'
        },
        {
          role: 'user',
          content: language === 'Hebrew'
            ? `מוצר/שירות: ${title}\nמידע נוסף: ${promotionalText || 'לא הוזן מידע נוסף'}\n\nכתוב 2 משפטי פרסום שיווקיים מעולים בעברית עבור פלייר עסקי. התמקד בהנחות, מבצעים מיוחדים או הטבות אם הם רלוונטיים.`
            : `Product/Service: ${title}\nAdditional Info: ${promotionalText || 'No additional info provided'}\n\nWrite 2 excellent marketing sentences in English for a business flyer. Focus on discounts, special deals or benefits if they are relevant.`
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    return limitToTwoSentences(response.choices[0].message.content);
  } catch (error) {
    console.error('Groq Error:', error);
    return `Groq Error: ${getErrorMessage(error)}`;
  }
};

export const generateWithGemini = async (title, promotionalText, language) => {
  if (!genAI) {
    return 'Gemini Error: API key not configured';
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = language === 'Hebrew'
      ? `מוצר/שירות: ${title}\nמידע נוסף: ${promotionalText || 'לא הוזן מידע נוסף'}\n\nאתה מומחה לכתיבת תוכן שיווקי לפליירים מסחריים. כתוב בדיוק 2 משפטי פרסום מעולים, קצרים ומשכנעים בעברית עבור פלייר שמקדם את המוצר/שירות הזה. התמקד במבצעים מיוחדים, הנחות או הטבות ללקוח. הפוך את המשפטים למושכים ומשכנעים.`
      : `Product/Service: ${title}\nAdditional Info: ${promotionalText || 'No additional info provided'}\n\nYou are an expert at writing marketing content for commercial flyers. Write exactly 2 excellent, short and persuasive promotional sentences in English for a flyer promoting this product/service. Focus on special deals, discounts or customer benefits. Make the sentences catchy and convincing.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return limitToTwoSentences(response.text());
  } catch (error) {
    console.error('Gemini Error:', error);
    return `Gemini Error: ${getErrorMessage(error)}`;
  }
};

// Export this before the individual functions to avoid the reference error
export const generateAllTexts = async (title, promotionalText, language) => {
  const results = await Promise.all([
    generateWithOpenAI(title, promotionalText, language),
    generateWithClaude(title, promotionalText, language),
    generateWithGroq(title, promotionalText, language),
    generateWithGemini(title, promotionalText, language)
  ]);

  return {
    openai: results[0],
    claude: results[1],
    groq: results[2],
    gemini: results[3]
  };
}; 