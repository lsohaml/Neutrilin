function createGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  const { GoogleGenAI } = require('@google/genai');
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return {
    async generate(prompt) {
      const response = await client.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: prompt,
        config: { maxOutputTokens: 700, responseMimeType: 'application/json' },
      });
      return response.text;
    },
  };
}

module.exports = { createGeminiClient };
