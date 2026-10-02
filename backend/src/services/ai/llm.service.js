// Talks to the LLM (Google Gemini). Only the backend calls this, so the API key never reaches the browser.

const getModel = () => process.env.LLM_MODEL || 'gemini-3.5-flash-lite';

/**
 * @param {string} systemPrompt  rules + store data
 * @param {{role: 'user'|'model', text: string}[]} messages  conversation, ending with the new user message
 * @returns {Promise<string>} the model's reply text
 */
export const generateReply = async (systemPrompt, messages) => {
  if (!process.env.LLM_API_KEY) throw new Error('LLM_API_KEY is not set in .env');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${getModel()}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.LLM_API_KEY,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
    }),
    signal: AbortSignal.timeout(20000), // give up after 20 seconds
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LLM API error ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || '')
    .join('')
    .trim();

  if (!text) throw new Error('The model returned an empty reply');
  return text;
};
