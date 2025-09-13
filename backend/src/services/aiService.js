const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 min cache

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callGemini(prompt) {
  // Add instructions for concise output and key points
  const improvedPrompt = `${prompt}\n\nInstructions: Answer in a concise paragraph (no more than 10 lines). After the paragraph, list 3-5 key points as bullet points. Avoid unnecessary details.`;
  const cacheKey = `gemini:${improvedPrompt}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const res = await axios.post(
    `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: improvedPrompt }] }]
    }
  );
  const result = res.data;
  cache.set(cacheKey, result);
  return result;
}

module.exports = { callGemini };
