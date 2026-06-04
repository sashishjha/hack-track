const { GoogleGenerativeAI } = require('@google/generative-ai');
const { supabase, supabaseAdmin } = require('../db/supabase');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env'), override: true });

// ─── Gemini Client Setup ───
const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const writeClient = supabaseAdmin || supabase;

// Model fallback chain: try newer models first, fall back to older ones
const MODEL_CHAIN = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

// Track if we've already logged a key validation failure this session
let keyValidated = null; // null = untested, true = works, false = broken

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

/**
 * Validate the Gemini API key with a minimal test call.
 * Only runs once per server lifecycle to avoid repeated failures.
 */
async function validateApiKey() {
  if (keyValidated !== null) return keyValidated;
  if (!genAI) {
    keyValidated = false;
    return false;
  }

  for (const modelName of MODEL_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      await model.generateContent('test');
      console.log(`✅ Gemini API key validated successfully (model: ${modelName})`);
      keyValidated = true;
      return true;
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('API_KEY_INVALID') || msg.includes('API Key not found')) {
        console.error('');
        console.error('╔══════════════════════════════════════════════════════════════╗');
        console.error('║  ❌ GEMINI API KEY IS INVALID OR REVOKED                    ║');
        console.error('║                                                              ║');
        console.error('║  Your GEMINI_API_KEY in .env is being rejected by Google.    ║');
        console.error('║                                                              ║');
        console.error('║  To fix:                                                     ║');
        console.error('║  1. Go to https://aistudio.google.com/apikey                 ║');
        console.error('║  2. Create a new API key (starts with "AIza...")              ║');
        console.error('║  3. Update GEMINI_API_KEY in your .env file                  ║');
        console.error('║  4. Restart the server                                       ║');
        console.error('║                                                              ║');
        console.error(`║  Key used: ${API_KEY.substring(0,10)}...${API_KEY.substring(API_KEY.length-4)}  ║`);
        console.error('╚══════════════════════════════════════════════════════════════╝');
        console.error('');
        keyValidated = false;
        return false;
      }
      // Model not available, try next in chain
      continue;
    }
  }

  console.warn('⚠️ All Gemini models failed. LLM extraction will be skipped.');
  keyValidated = false;
  return false;
}

/**
 * Try generating content with a model fallback chain.
 */
async function generateWithFallback(prompt) {
  for (const modelName of MODEL_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const msg = err.message || '';
      // If key is invalid, stop immediately — no point trying other models
      if (msg.includes('API_KEY_INVALID') || msg.includes('API Key not found')) {
        throw err;
      }
      // Model-specific error (quota, not found), try next
      console.warn(`⚠️ ${modelName} failed: ${msg}. Trying next model...`);
      continue;
    }
  }
  throw new Error('All Gemini models failed');
}

async function extractCompetitionData(htmlContent, sourceUrl) {
  // Check 1: Is the key even set?
  if (!API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not set in .env. Skipping LLM extraction.');
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
    if (msg.includes('API_KEY_INVALID') || msg.includes('API Key not found')) {
      // Mark key as broken so we don't retry for every URL
      keyValidated = false;
      console.error('🔑 Gemini API key invalid — skipping all remaining LLM extractions this session.');
    } else {
      console.error(`❌ LLM extraction failed for ${sourceUrl}: ${msg}`);
    }
    return null;
  }
}

module.exports = { extractCompetitionData, validateApiKey };
