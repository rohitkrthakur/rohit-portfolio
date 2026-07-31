const REVIEW_MIN_LENGTH = 60;
const REVIEW_MAX_LENGTH = 200;
const AI_TARGET_MIN_LENGTH = 170;
const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';
const FALLBACK_GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];
const DEPRECATED_GEMINI_MODELS = new Set([
  'gemini-2.5-flash',
  'models/gemini-2.5-flash',
]);

function getGeminiModels() {
  const configuredModels = String(process.env.GEMINI_MODEL || '')
    .split(',')
    .map((model) => model.trim())
    .filter((model) => model && !DEPRECATED_GEMINI_MODELS.has(model));

  return Array.from(new Set([
    ...configuredModels,
    DEFAULT_GEMINI_MODEL,
    ...FALLBACK_GEMINI_MODELS,
  ]));
}

function cleanReview(value) {
  return String(value || '')
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getGeminiText(data) {
  return cleanReview(
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join(' ')
  );
}

function trimToMaxLength(value) {
  const cleaned = cleanReview(value);

  if (cleaned.length <= REVIEW_MAX_LENGTH) {
    return cleaned;
  }

  const sentenceEnd = Math.max(
    cleaned.lastIndexOf('.', REVIEW_MAX_LENGTH),
    cleaned.lastIndexOf('!', REVIEW_MAX_LENGTH),
    cleaned.lastIndexOf('?', REVIEW_MAX_LENGTH)
  );

  if (sentenceEnd >= REVIEW_MIN_LENGTH) {
    return cleaned.slice(0, sentenceEnd + 1).trim();
  }

  const wordEnd = cleaned.lastIndexOf(' ', REVIEW_MAX_LENGTH);
  const end = wordEnd >= REVIEW_MIN_LENGTH ? wordEnd : REVIEW_MAX_LENGTH;

  return cleaned.slice(0, end).replace(/[,:;.-]+$/g, '').trim();
}

function expandToTargetLength(value, occupation) {
  let expanded = cleanReview(value);
  const roleText = occupation ? ` as a ${cleanReview(occupation)}` : '';
  const additions = [
    ` Their work shows strong attention to detail${roleText}.`,
    ' The result feels polished, thoughtful, and easy to trust.',
    ' I would gladly recommend their work to others.',
  ];

  for (const addition of additions) {
    if (expanded.length >= AI_TARGET_MIN_LENGTH) {
      break;
    }

    const next = `${expanded}${addition}`.trim();

    if (next.length <= REVIEW_MAX_LENGTH) {
      expanded = next;
    }
  }

  return trimToMaxLength(expanded);
}

function fitReviewToRange(value, occupation) {
  const trimmed = trimToMaxLength(value);

  if (trimmed.length >= AI_TARGET_MIN_LENGTH) {
    return trimmed;
  }

  return expandToTargetLength(trimmed, occupation);
}

async function requestGeminiReview(prompt, model) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.55,
          maxOutputTokens: 90,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Gemini request failed.');
  }

  return getGeminiText(data);
}

async function generateReview(prompt) {
  let lastError;

  for (const model of getGeminiModels()) {
    try {
      return await requestGeminiReview(prompt, model);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Gemini request failed.');
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { username, occupation, review } = req.body || {};
    const draft = cleanReview(review);

    if (!draft && !occupation) {
      return res.status(400).json({ error: 'Add a draft review or occupation first.' });
    }

    const prompt = `
Rewrite or generate a portfolio review.

Rules:
- Return only the review text.
- Must be between ${REVIEW_MIN_LENGTH} and ${REVIEW_MAX_LENGTH} characters.
- Aim for ${AI_TARGET_MIN_LENGTH}-${REVIEW_MAX_LENGTH} characters when possible.
- Never exceed ${REVIEW_MAX_LENGTH} characters.
- Do not cut off mid-sentence.
- Do not use quotation marks.
- Do not mention AI.
- Keep the tone natural, specific, and professional.

Reviewer name: ${username || 'Not provided'}
Reviewer occupation: ${occupation || 'Not provided'}
Draft review: ${draft || 'No draft provided. Generate one concise review.'}
`;

    let generated = fitReviewToRange(await generateReview(prompt), occupation);

    if (generated.length > REVIEW_MAX_LENGTH || generated.length < REVIEW_MIN_LENGTH) {
      generated = fitReviewToRange(await generateReview(`
Rewrite this review again so it is a complete sentence between ${AI_TARGET_MIN_LENGTH} and ${REVIEW_MAX_LENGTH} characters.
Return only the review text. Do not exceed ${REVIEW_MAX_LENGTH} characters.

Review: ${generated || draft}
`), occupation);
    }

    if (generated.length > REVIEW_MAX_LENGTH) {
      return res.status(502).json({
        error: `AI returned a review over ${REVIEW_MAX_LENGTH} characters. Try again.`,
      });
    }

    if (generated.length < REVIEW_MIN_LENGTH) {
      generated = fitReviewToRange(draft, occupation);
    }

    return res.status(200).json({ review: generated });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'AI assist failed.',
    });
  }
}
