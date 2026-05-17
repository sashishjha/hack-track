const axios = require('axios');
const cheerio = require('cheerio');
const { extractCompetitionData } = require('./llm_extractor');

const KNOWN_DOMAINS = ['devpost.com', 'kaggle.com', 'hackerearth.com', 'unstop.com', 'devfolio.co', 'mlh.io', 'topcoder.com'];

async function searchDuckDuckGo(query) {
  try {
    console.log(`🔍 Searching DuckDuckGo for: "${query}"`);
    const response = await axios.get('https://html.duckduckgo.com/html/', {
      params: { q: query },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const results = [];
    
    $('.result__url').each((i, el) => {
      const url = $(el).text().trim();
      if (url && url.startsWith('http')) {
        results.push(url);
      } else if (url) {
        results.push('https://' + url);
      }
    });
    
    return results;
  } catch (err) {
    console.error('❌ DuckDuckGo search failed:', err.message);
    return [];
  }
}

async function discoverNewHackathons() {
  console.log('\n🚀 Starting Free Web Discovery Engine...');
  
  // Search query targeting new/unlisted hackathons
  const query = '"hackathon 2026" registration OR prizes';
  const urls = await searchDuckDuckGo(query);
  
  // Filter out known domains
  const newUrls = urls.filter(url => {
    return !KNOWN_DOMAINS.some(domain => url.includes(domain));
  }).slice(0, 3); // Process only top 3 to keep it lightweight
  
  console.log(`📌 Found ${newUrls.length} potentially new hackathon URLs.`);
  
  const discoveredHackathons = [];
  
  for (const url of newUrls) {
    try {
      console.log(`📥 Fetching content from: ${url}`);
      const pageRes = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(pageRes.data);
      // Clean up DOM before text extraction
      $('script, style, nav, footer, header').remove();
      const textContent = $('body').text();
      
      console.log(`🤖 Passing content to Gemini LLM for extraction...`);
      const competition = await extractCompetitionData(textContent, url);
      
      if (competition && competition.title) {
        console.log(`✅ Discovered: ${competition.title}`);
        discoveredHackathons.push(competition);
      }
    } catch (err) {
      console.error(`⚠️ Could not scrape ${url}: ${err.message}`);
    }
  }
  
  console.log(`🎉 Web Discovery completed. Extracted ${discoveredHackathons.length} new competitions.`);
  return discoveredHackathons;
}

module.exports = { discoverNewHackathons };
