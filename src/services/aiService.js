


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
  try {
    const response = await fetch('http://localhost:8081/api/v1/claude/generate', {
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
    console.error('Claude Error:', error);
    return language === 'Hebrew' ? 'שגיאה בקבלת תוצאות מ-Claude' : 'Error getting results from Claude';
  }
};

export const generateWithGroq = async (title, promotionalText, language) => {
  try {
    const response = await fetch('http://localhost:8081/api/v1/groq/generate', {
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
    console.error('Groq Error:', error);
    return language === 'Hebrew' ? 'שגיאה בקבלת תוצאות מ-Groq' : 'Error getting results from Groq';
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

export async function generateFlierConfig(infoObject) {
  const response = await fetch('http://localhost:8081/api/flier/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(infoObject)
  });
  if (!response.ok) throw new Error('Failed to generate flier config');
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON returned from backend');
  }
} 