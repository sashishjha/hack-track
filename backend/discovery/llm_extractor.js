const { GoogleGenerativeAI } = require('@google/generative-ai');
const { supabase, supabaseAdmin } = require('../db/supabase');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env'), override: true });

// ─── Gemini Client Setup ───
const GEMINI_KEYS = [1, 2, 3, 4, 5]
  .map(index => process.env[`GEMINI_API_KEY_${index}`] || '')
  .filter(Boolean);
const LEGACY_GEMINI_KEY = process.env.GEMINI_API_KEY || '';
if (!GEMINI_KEYS.length && LEGACY_GEMINI_KEY) {
  GEMINI_KEYS.push(LEGACY_GEMINI_KEY);
}
const GEMINI_CLIENTS = GEMINI_KEYS.map(apiKey => new GoogleGenerativeAI(apiKey));
const writeClient = supabaseAdmin || supabase;

// Model fallback chain: try current stable models first, then lighter variants.
const MODEL_CHAIN = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];

// Track which Gemini key we should try next.
let activeKeyIndex = 0;

function resetGeminiKeyRotation() {
  activeKeyIndex = 0;
}

function getActiveClient() {
  if (!GEMINI_CLIENTS.length) {
    return null;
  }

  if (activeKeyIndex < 0 || activeKeyIndex >= GEMINI_CLIENTS.length) {
    activeKeyIndex = 0;
  }

  return GEMINI_CLIENTS[activeKeyIndex];
}

function advanceGeminiKey() {
  if (!GEMINI_CLIENTS.length) {
    return null;
  }

  activeKeyIndex += 1;
  if (activeKeyIndex >= GEMINI_CLIENTS.length) {
    return null;
  }

  return GEMINI_CLIENTS[activeKeyIndex];
}

function isQuotaError(err) {
  const msg = err?.message || '';
  return /quota|rate limit|RESOURCE_EXHAUSTED|429/i.test(msg);
}

function isInvalidKeyError(err) {
  const msg = err?.message || '';
  return msg.includes('API_KEY_INVALID') || msg.includes('API Key not found') || /invalid api key/i.test(msg);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function toDbRow(comp) {
  const row = {};
  for (const [key, value] of Object.entries(comp)) {
    row[camelToSnake(key)] = value;
  }
  return row;
}

async function persistDiscoveredCompetition(competition) {
  const dbRow = toDbRow({
    ...competition,
    source: 'ai_discovered',
    slug: competition.slug || slugify(competition.title) || competition.id,
    prizeDisplay: competition.prizeDisplay || 'Prizes TBD',
    registrationStatus: competition.registrationStatus || 'open',
    recurrenceCategory: competition.recurrenceCategory || 'always_open',
    recurrence: competition.recurrence || 'one_time',
    validity: competition.validity || 'active',
    mode: competition.mode || 'remote',
    teamType: competition.teamType || 'both',
    teamSizeMin: competition.teamSizeMin || 1,
    apiCreditsIncluded: competition.apiCreditsIncluded || false,
    gpuCreditsIncluded: competition.gpuCreditsIncluded || false,
    studentOnly: competition.studentOnly || false,
    hardwareRequired: competition.hardwareRequired || false,
    platform: competition.platform || 'discovered',
    tags: competition.tags || ['ai_discovered'],
  });

  const { error } = await writeClient
    .from('competitions')
    .upsert(dbRow, { onConflict: 'slug' });

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }
}

async function validateApiKey() {
  if (!GEMINI_CLIENTS.length) {
    return false;
  }

  return true;
}

/**
 * Try generating content with a model fallback chain.
 */
async function generateWithFallback(prompt) {
  if (!GEMINI_CLIENTS.length) {
    throw new Error('No Gemini API keys configured');
  }

  const startIndex = activeKeyIndex;

  while (activeKeyIndex < GEMINI_CLIENTS.length) {
    const client = getActiveClient();
    let shouldAdvanceKey = false;

    for (const modelName of MODEL_CHAIN) {
      try {
        const model = client.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        const msg = err.message || '';
        if (isInvalidKeyError(err)) {
          shouldAdvanceKey = true;
          break;
        }
        if (isQuotaError(err) || /503|service unavailable|high demand|temporarily unavailable|permission denied|model not found|not found|unavailable/i.test(msg)) {
          console.warn(`⚠️ ${modelName} failed for key ${activeKeyIndex + 1}: ${msg}. Trying next model...`);
          continue;
        }
        console.warn(`⚠️ ${modelName} failed for key ${activeKeyIndex + 1}: ${msg}. Trying next model...`);
      }
    }

    if (shouldAdvanceKey) {
      const failedKeyNumber = activeKeyIndex + 1;
      const nextClient = advanceGeminiKey();
      if (!nextClient) {
        break;
      }
      console.warn(`⚠️ Gemini key ${failedKeyNumber} is invalid. Switching to key ${activeKeyIndex + 1}...`);
      continue;
    }

    const failedKeyNumber = activeKeyIndex + 1;
    const nextClient = advanceGeminiKey();
    if (!nextClient) {
      break;
    }
    console.warn(`⚠️ Gemini key ${failedKeyNumber} exhausted or invalid. Switching to key ${activeKeyIndex + 1}...`);
  }

  activeKeyIndex = startIndex;
  throw new Error('All Gemini API keys failed');
}

function logMissingKeysOnce() {
  if (!GEMINI_KEYS.length) {
    console.warn('⚠️ No GEMINI_API_KEY_1..5 values set in .env. Skipping LLM extraction.');
  }
}

async function extractCompetitionData(htmlContent, sourceUrl) {
  // Check 1: Is the key even set?
  if (!GEMINI_KEYS.length) {
    logMissingKeysOnce();
    return null;
  }

  // Check 2: Has the key been validated?
  const isValid = await validateApiKey();
  if (!isValid) {
    // Key is invalid — skip silently (error was already logged once)
    return null;
  }

  // To save tokens, strip out excessive HTML whitespace
  const cleanText = htmlContent.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').substring(0, 15000);

  const prompt = `
  You are an AI that extracts hackathon and competition details from webpage text.
  Extract the following competition from this raw webpage text and return ONLY a valid JSON object matching this schema. Do not return markdown tags, just the raw JSON.
  {
    "title": "string (name of the hackathon)",
    "organizer": "string (company/group hosting it)",
    "description": "string (short 1-2 sentence description)",
    "prizeDisplay": "string (e.g. '$10,000' or 'Prizes TBD')",
    "submissionDeadline": "ISO-8601 string or null if not found",
    "status": "open" or "upcoming",
    "skillDomains": ["ai_ml", "web_app", "data_science", "cybersecurity", "robotics"] (pick best matches, max 3),
    "apiCreditsIncluded": boolean (true if the hackathon provides free API credits, tokens, or cloud credits),
    "gpuCreditsIncluded": boolean (true if the hackathon provides free compute, GPUs, or cloud VMs)
  }

  Source URL: ${sourceUrl}

  Raw Page Text:
  ${cleanText}
  `;

  try {
    let text = await generateWithFallback(prompt);

    // Clean up markdown formatting if any
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(text);
    parsed.url = sourceUrl;
    parsed.platform = 'discovered';
    parsed.id = 'disc_' + Date.now() + Math.floor(Math.random() * 1000);
    parsed.slug = parsed.slug || slugify(parsed.title) || parsed.id;
    parsed.rarityScore = 8;
    parsed.trustScore = 5;
    parsed.source = 'ai_discovered';

    try {
      await persistDiscoveredCompetition(parsed);
    } catch (saveErr) {
      console.error(`❌ Failed to save discovered competition to Supabase: ${saveErr.message}`);
    }

    return parsed;
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('API_KEY_INVALID') || msg.includes('API Key not found') || /invalid api key/i.test(msg)) {
      advanceGeminiKey();
      console.error('🔑 Gemini API key invalid — skipping all remaining LLM extractions this session.');
    } else if (isQuotaError(err) || /503|service unavailable|high demand|temporarily unavailable|permission denied|model not found|not found|unavailable/i.test(msg)) {
      console.warn('⚠️ Gemini quota reached — rotating to next key.');
      advanceGeminiKey();
    } else {
      console.error(`❌ LLM extraction failed for ${sourceUrl}: ${msg}`);
    }
    return null;
  }
}

module.exports = { extractCompetitionData, validateApiKey, resetGeminiKeyRotation };
