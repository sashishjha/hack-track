const { tavily } = require('@tavily/core');
const { extractCompetitionData } = require('./llm_extractor');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env'), override: true });

const KNOWN_DOMAINS = [
  'devpost.com',
  'kaggle.com',
  'hackerearth.com',
  'unstop.com',
  'devfolio.co',
  'mlh.io',
  'topcoder.com',
];

const SEARCH_QUERIES = [
  'new hackathon 2026',
  'open hackathon registration 2026',
  'hackathon with free API credits',
  'hackathon providing free GPU compute',
];
const RATE_LIMIT_MS = 6500; // 6.5 seconds to respect 15 RPM free tier limit

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

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

async function searchHackathonUrls(tvly) {
  const discoveredUrls = [];

  for (const query of SEARCH_QUERIES) {
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

  const discoveredHackathons = [];

  for (const url of urls) {
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
    verified: discoveredHackathons.length,
    newSources: new Set(discoveredHackathons.map(comp => getHostname(comp.url)).filter(Boolean)).size,
  };

  console.log(`🎉 Web Discovery completed. Extracted ${discoveredHackathons.length} new competitions.`);
  return discoveredHackathons;
}

module.exports = { discoverNewHackathons };
