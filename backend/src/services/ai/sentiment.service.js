// Hugging Face sentiment analysis (F06). Called only from the backend so the token stays secret.

export const SENTIMENT_MODEL = 'cardiffnlp/twitter-xlm-roberta-base-sentiment';

// Maps whatever label names the model returns to our three values
const LABELS = {
  positive: 'positive',
  neutral: 'neutral',
  negative: 'negative',
  label_0: 'negative',
  label_1: 'neutral',
  label_2: 'positive',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The API returns [[{label, score}, ...]] (or without the outer array). Pick the highest score.
export const pickLabel = (data) => {
  const list = Array.isArray(data?.[0]) ? data[0] : data;
  if (!Array.isArray(list) || list.length === 0) throw new Error('Unexpected sentiment response');

  const best = list.reduce((a, b) => (b.score > a.score ? b : a));
  const sentiment = LABELS[String(best.label).toLowerCase()];
  if (!sentiment) throw new Error(`Unknown sentiment label: ${best.label}`);
  return sentiment;
};

/** @returns {Promise<'positive'|'neutral'|'negative'>} */
export const classifySentiment = async (text) => {
  if (!process.env.HF_TOKEN) throw new Error('HF_TOKEN is not set in .env');

  const url = `https://router.huggingface.co/hf-inference/models/${SENTIMENT_MODEL}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text.slice(0, 500) }),
      signal: AbortSignal.timeout(20000),
    });

    // 503 means the model is still loading. Wait a little and try once more.
    if (response.status === 503 && attempt === 0) {
      await sleep(8000);
      continue;
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Hugging Face API error ${response.status}: ${body.slice(0, 200)}`);
    }

    return pickLabel(await response.json());
  }

  throw new Error('Hugging Face model did not respond');
};

// Never breaks review submission: if the model fails, the review is saved as "neutral"
export const getSentiment = async (text) => {
  try {
    return await classifySentiment(text);
  } catch (err) {
    console.error('Sentiment error (saved as neutral):', err.message);
    return 'neutral';
  }
};
