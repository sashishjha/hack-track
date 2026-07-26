const { tavily } = require('@tavily/core');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const { supabase, supabaseAdmin } = require('../db/supabase');
const { extractCompetitionData } = require('./llm_extractor');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), override: true });

const KNOWN_DOMAINS = [
  'devpost.com',
  'kaggle.com',
  'hackerearth.com',
  'unstop.com',
  'devfolio.co',
  'mlh.io',
  'topcoder.com',
];

const DEFAULT_SEARCH_SOURCES = [
  'site:devpost.com',
  'site:devfolio.co',
  'site:unstop.com',
  'site:mlh.io',
  'site:hackerearth.com',
  'site:kaggle.com',
];

const DEFAULT_SEARCH_THEMES = [
  'hackathon',
  'hackathon open registration',
  'hackathon upcoming',
  'student hackathon',
  'global hackathon',
  'virtual hackathon',
  'AI hackathon',
  'developer challenge',
  'innovation challenge',
  'hackathon prize',
  'hackathon API credits',
  'hackathon GPU credits',
];

const DEFAULT_SEED_QUERY_CAP = 12;
const DEFAULT_SEARCH_QUERY_CAP = 16;
const SEARCH_CONFIG_PATH = path.resolve(__dirname, 'search_config.json');
const GEMINI_MODEL_CHAIN = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_VARIANTS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];
const RATE_LIMIT_MS = 6500; // 6.5 seconds to respect 15 RPM free tier limit
const writeClient = supabaseAdmin || supabase;
const SUPABASE_BATCH_SIZE = 200;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getTavilyClient() {
  if (!process.env.TAVILY_API_KEY) {
    console.warn('⚠️ TAVILY_API_KEY not set in .env. Skipping Tavily discovery.');
    return null;
  }

  return tavily({ apiKey: process.env.TAVILY_API_KEY });
}

function getGeminiKeys() {
  const keys = [1, 2, 3, 4, 5]
    .map(index => process.env[`GEMINI_API_KEY_${index}`] || '')
    .filter(Boolean);
  const legacyKey = process.env.GEMINI_API_KEY || '';

  if (!keys.length && legacyKey) {
    keys.push(legacyKey);
  }

  return keys;
}

function getGeminiClients() {
  return getGeminiKeys().map(apiKey => new GoogleGenerativeAI(apiKey));
}

function parseStringList(value) {
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(item => String(item).trim()).filter(Boolean);
    }
  } catch {
    // fall through to CSV parsing
  }

  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBoolean(value, fallback) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
}

function loadSearchConfigFile() {
  if (!fs.existsSync(SEARCH_CONFIG_PATH)) {
    return {};
  }

  try {
    const raw = fs.readFileSync(SEARCH_CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    console.warn(`⚠️ Failed to read ${SEARCH_CONFIG_PATH}: ${err.message}`);
    return {};
  }
}

function getSearchDiscoveryConfig() {
  const fileConfig = loadSearchConfigFile();

  const sources = parseStringList(
    process.env.HACKTRACK_SEARCH_SOURCES ||
      fileConfig.sources ||
      fileConfig.searchSources ||
      DEFAULT_SEARCH_SOURCES,
  ) || DEFAULT_SEARCH_SOURCES;

  const themes = parseStringList(
    process.env.HACKTRACK_SEARCH_THEMES ||
      fileConfig.themes ||
      fileConfig.searchThemes ||
      DEFAULT_SEARCH_THEMES,
  ) || DEFAULT_SEARCH_THEMES;

  const seedQueryCap = parseInteger(
    process.env.HACKTRACK_SEARCH_SEED_CAP ?? fileConfig.seedQueryCap ?? fileConfig.seedCap,
    DEFAULT_SEED_QUERY_CAP,
  );

  const searchQueryCap = parseInteger(
    process.env.HACKTRACK_SEARCH_QUERY_CAP ?? fileConfig.searchQueryCap ?? fileConfig.queryCap,
    DEFAULT_SEARCH_QUERY_CAP,
  );

  const enableGeminiExpansion = parseBoolean(
    process.env.HACKTRACK_ENABLE_GEMINI_QUERY_EXPANSION ??
      fileConfig.enableGeminiExpansion ??
      fileConfig.useGeminiExpansion,
    true,
  );

  return {
    sources,
    themes,
    seedQueryCap,
    searchQueryCap,
    enableGeminiExpansion,
  };
}

function normalizeUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
}

function isKnownDomain(url) {
  return KNOWN_DOMAINS.some(domain => url.includes(domain));
}

function normalizeQuery(query) {
  if (!query || typeof query !== 'string') {
    return null;
  }

  const normalized = query
    .replace(/\s+/g, ' ')
    .replace(/^["'`]+|["'`]+$/g, '')
    .trim();

  return normalized || null;
}

function dedupeQueries(queries, cap = DEFAULT_SEARCH_QUERY_CAP) {
  const seen = new Set();
  const output = [];

  for (const rawQuery of queries) {
    const query = normalizeQuery(rawQuery);
    if (!query) {
      continue;
    }

    const key = query.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(query);

    if (output.length >= cap) {
      break;
    }
  }

  return output;
}

function buildQueryPool(config) {
  const sources = config.sources?.length ? config.sources : DEFAULT_SEARCH_SOURCES;
  const themes = config.themes?.length ? config.themes : DEFAULT_SEARCH_THEMES;
  const queries = [
    `hackathon ${CURRENT_YEAR}`,
    `open hackathon registration ${CURRENT_YEAR}`,
    `student hackathon ${CURRENT_YEAR}`,
    `AI hackathon ${CURRENT_YEAR}`,
    `site:devpost.com hackathon ${CURRENT_YEAR}`,
    `site:devfolio.co hackathon ${CURRENT_YEAR}`,
    `site:unstop.com hackathon ${CURRENT_YEAR}`,
    `site:mlh.io hackathon ${CURRENT_YEAR}`,
    `site:hackerearth.com hackathon ${CURRENT_YEAR}`,
    `hackathon prizes ${CURRENT_YEAR}`,
    `hackathon API credits ${CURRENT_YEAR}`,
    `hackathon GPU credits ${CURRENT_YEAR}`,
    `global hackathon ${CURRENT_YEAR}`,
    `virtual hackathon ${CURRENT_YEAR}`,
    `developer challenge ${CURRENT_YEAR}`,
  ];

  for (const year of YEAR_VARIANTS) {
    for (const theme of themes) {
      queries.push(`${theme} ${year}`);
    }
  }

  for (const year of YEAR_VARIANTS) {
    for (const source of sources) {
      queries.push(`${source} hackathon ${year}`);
      queries.push(`${source} hackathon open registration ${year}`);
    }
  }

  queries.push(
    'new hackathon listings',
    'hackathon deadline soon',
    'hackathon accepting applications',
    'hackathon with prizes',
    'hackathon with free API credits',
    'hackathon with free GPU credits',
  );

  return dedupeQueries(queries, 100);
}

function buildSeedQueries(config) {
  const pool = buildQueryPool(config);
  if (!pool.length) {
    return [];
  }

  const rotation = Math.floor(Date.now() / 86400000) % pool.length;
  const rotated = [...pool.slice(rotation), ...pool.slice(0, rotation)];
  return rotated.slice(0, config.seedQueryCap || DEFAULT_SEED_QUERY_CAP);
}

function parseGeminiQueryList(text) {
  if (!text) {
    return [];
  }

  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start === -1 || end === -1 || end <= start) {
      return [];
    }

    try {
      const parsed = JSON.parse(cleaned.slice(start, end + 1));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

async function generateGeminiQueryExpansion(seedQueries, config) {
  if (!config.enableGeminiExpansion) {
    return [];
  }

  const clients = getGeminiClients();
  if (!clients.length) {
    return [];
  }

  const prompt = `
You are helping discover currently open or upcoming hackathons around the world.
Generate search queries that can find NEW hackathon listings and registration pages.

Seed queries:
${seedQueries.map(query => `- ${query}`).join('\n')}

Rules:
- Return ONLY a JSON array of strings.
- Return between 8 and 12 queries.
- Avoid duplicates of the seed queries.
- Prefer search phrases that surface fresh hackathon pages, not generic news.
- Include a mix of broad and source-specific queries.
- Include at least one query each for Devpost, Devfolio, Unstop, MLH, and HackerEarth.
- Include at least one query about prizes, one about API credits, and one about GPU credits.
- Keep each query short and natural.
`;

  const startIndex = 0;

  for (let clientIndex = startIndex; clientIndex < clients.length; clientIndex += 1) {
    const client = clients[clientIndex];
    let shouldAdvanceKey = false;

    for (const modelName of GEMINI_MODEL_CHAIN) {
      try {
        const model = client.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = parseGeminiQueryList(text);
        if (parsed.length) {
          return parsed;
        }
      } catch (err) {
        const msg = err?.message || '';
        if (/invalid api key|API_KEY_INVALID|API Key not found/i.test(msg)) {
          shouldAdvanceKey = true;
          break;
        }
        if (/quota|rate limit|RESOURCE_EXHAUSTED|429|503|service unavailable|high demand|temporarily unavailable|permission denied|model not found|not found|unavailable/i.test(msg)) {
          console.warn(`⚠️ Gemini query expansion failed with ${modelName}: ${msg}`);
          continue;
        }
        console.warn(`⚠️ Gemini query expansion failed with ${modelName}: ${msg}`);
      }
    }

    if (shouldAdvanceKey) {
      continue;
    }
  }

  return [];
}

async function buildSearchQueries() {
  const config = getSearchDiscoveryConfig();
  const seedQueries = buildSeedQueries(config);
  const geminiQueries = await generateGeminiQueryExpansion(seedQueries, config);

  return dedupeQueries([...seedQueries, ...geminiQueries], config.searchQueryCap || DEFAULT_SEARCH_QUERY_CAP);
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

async function loadExistingUrls(urls) {
  const existingUrls = new Set();
  const uniqueUrls = [...new Set(urls)].filter(Boolean);

  for (let index = 0; index < uniqueUrls.length; index += SUPABASE_BATCH_SIZE) {
    const batch = uniqueUrls.slice(index, index + SUPABASE_BATCH_SIZE);
    const { data, error } = await writeClient
      .from('competitions')
      .select('url')
      .in('url', batch);

    if (error) {
      throw new Error(`Failed to load existing competition URLs: ${error.message}`);
    }

    for (const row of data || []) {
      if (row?.url) {
        existingUrls.add(row.url);
      }
    }
  }

  return existingUrls;
}

async function searchHackathonUrls(tvly) {
  const discoveredUrls = [];
  const queries = await buildSearchQueries();

  console.log(`🧭 Using ${queries.length} search queries for this discovery run.`);

  for (const query of queries) {
    try {
      console.log(`🔍 Searching Tavily for: "${query}"`);
      const response = await tvly.search(query, {
        searchDepth: 'advanced',
        maxResults: 10,
        topic: 'general',
      });

      const urls = (response.results || [])
        .map(result => normalizeUrl(result.url))
        .filter(Boolean);

      discoveredUrls.push(...urls);
    } catch (err) {
      console.error(`❌ Tavily search failed for "${query}": ${err.message}`);
    }

    await sleep(RATE_LIMIT_MS);
  }

  return [...new Set(discoveredUrls)].filter(url => !isKnownDomain(url));
}

async function extractCleanText(tvly, url) {
  const response = await tvly.extract([url], {
    extractDepth: 'advanced',
    format: 'text',
  });

  const extractedResult = (response.results || []).find(result => result.url === url) || response.results?.[0];
  return extractedResult?.rawContent || null;
}

async function discoverNewHackathons() {
  console.log('\n🚀 Starting Tavily Discovery Engine...');

  const tvly = getTavilyClient();
  if (!tvly) {
    const emptyResults = [];
    emptyResults.summary = { found: 0, verified: 0, newSources: 0 };
    return emptyResults;
  }

  const urls = await searchHackathonUrls(tvly);
  console.log(`📌 Found ${urls.length} potentially new hackathon URLs.`);

  let existingUrls = new Set();
  try {
    existingUrls = await loadExistingUrls(urls);
    if (existingUrls.size > 0) {
      console.log(`🗂️ Skipping ${existingUrls.size} URLs already in the database.`);
    }
  } catch (err) {
    console.error(`⚠️ Could not check existing competition URLs: ${err.message}`);
  }

  const newUrls = urls.filter(url => !existingUrls.has(url));
  console.log(`🆕 ${newUrls.length} URLs remain after database dedupe.`);

  const discoveredHackathons = [];

  for (const url of newUrls) {
    try {
      console.log(`📥 Extracting clean content from: ${url}`);
      const textContent = await extractCleanText(tvly, url);

      if (!textContent) {
        console.warn(`⚠️ No extractable content returned for ${url}`);
        await sleep(RATE_LIMIT_MS);
        continue;
      }

      console.log('🤖 Passing content to Gemini LLM for extraction...');
      const competition = await extractCompetitionData(textContent, url);

      if (competition && competition.title) {
        console.log(`✅ Discovered: ${competition.title}`);
        discoveredHackathons.push(competition);
      }
    } catch (err) {
      console.error(`⚠️ Tavily extract failed for ${url}: ${err.message}`);
    }

    await sleep(RATE_LIMIT_MS);
  }

  discoveredHackathons.summary = {
    found: urls.length,
    skippedExisting: existingUrls.size,
    queuedForGemini: newUrls.length,
    verified: discoveredHackathons.length,
    newSources: new Set(discoveredHackathons.map(comp => getHostname(comp.url)).filter(Boolean)).size,
  };

  console.log(`🎉 Web Discovery completed. Extracted ${discoveredHackathons.length} new competitions.`);
  return discoveredHackathons;
}

module.exports = { discoverNewHackathons };
