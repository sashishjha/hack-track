const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/hackathons.json');

// Sample data for initialization
const SAMPLE_HACKATHONS = [
  {
    id: 'hack_kaggle_1',
    name: 'Kaggle Competition',
    platform: 'Kaggle',
    category: 'recurring',
    description: 'Weekly & monthly machine learning competitions',
    prizeRange: '$1K – $100K',
    participants: 'Variable (1K–10K)',
    deadline: '2026-06-30T23:59:59Z',
    url: 'https://www.kaggle.com/competitions',
    tags: ['ml', 'data-science', 'ai', 'competitive', 'python'],
    remote: true,
    aiAllowed: true
  },
  {
    id: 'hack_devpost_1',
    name: 'DevPost Hackathons',
    platform: 'DevPost',
    category: 'recurring',
    description: 'Global software hackathons on DevPost',
    prizeRange: 'Variable',
    participants: 'Variable',
    deadline: null,
    url: 'https://www.devpost.com/hackathons',
    tags: ['hackathon', 'web', 'mobile', 'ai', 'iot'],
    remote: true,
    aiAllowed: true
  },
  {
    id: 'hack_unstop_1',
    name: 'Unstop Hackathons',
    platform: 'Unstop',
    category: 'rolling',
    description: 'India-focused continuous hackathon platform',
    prizeRange: '₹5K – ₹5L',
    participants: '50–500',
    deadline: null,
    url: 'https://unstop.com/hackathons/',
    tags: ['india', 'hackathon', 'low-competition'],
    remote: true,
    aiAllowed: true
  }
];

// Function to fetch from Kaggle API
async function fetchFromKaggle() {
  try {
    console.log('📊 Fetching from Kaggle...');
    // Using public competitions endpoint (no auth needed)
    const response = await axios.get('https://www.kaggle.com/api/v1/competitions/list', {
      params: { page: 1, search: '', sortBy: 'deadline' },
      timeout: 5000
    });
    console.log('✅ Kaggle data fetched successfully');
    return response.data || [];
  } catch (err) {
    console.error('❌ Error fetching from Kaggle:', err.message);
    return [];
  }
}

// Function to fetch from DevPost RSS
async function fetchFromDevPost() {
  try {
    console.log('📊 Fetching from DevPost...');
    const response = await axios.get('https://www.devpost.com/hackathons.json', {
      timeout: 5000
    });
    console.log('✅ DevPost data fetched successfully');
    return response.data.hackathons || [];
  } catch (err) {
    console.error('❌ Error fetching from DevPost:', err.message);
    return [];
  }
}

// Function to fetch from Unstop
async function fetchFromUnstop() {
  try {
    console.log('📊 Fetching from Unstop...');
    // Unstop doesn't have public API, so we'd need to scrape or use a proxy
    console.log('⏳ Unstop requires custom scraping (set up later)');
    return [];
  } catch (err) {
    console.error('❌ Error fetching from Unstop:', err.message);
    return [];
  }
}

// Transform data to standard format
function transformHackathon(data, platform) {
  const now = new Date();
  return {
    id: `hack_${platform}_${data.id || Date.now()}`,
    name: data.title || data.name,
    platform: platform,
    category: data.status || 'upcoming',
    description: data.description || '',
    prizeRange: data.prize_amount || 'N/A',
    participants: data.participants_count || 'Unknown',
    deadline: data.deadline || null,
    url: data.url || data.link || '',
    tags: data.tags || [],
    remote: data.remote || true,
    aiAllowed: data.ai_allowed !== false,
    fetchedAt: now.toISOString()
  };
}

// Main scraper function
async function scrapeHackathons() {
  console.log('\n🚀 Starting hackathon data scrape...');
  console.log(`⏰ Time: ${new Date().toISOString()}\n`);

  let allHackathons = [];

  // Fetch from all sources
  const kaggle = await fetchFromKaggle();
  const devpost = await fetchFromDevPost();
  const unstop = await fetchFromUnstop();

  // Transform and combine
  allHackathons = [
    ...kaggle.map(h => transformHackathon(h, 'kaggle')).slice(0, 10),
    ...devpost.map(h => transformHackathon(h, 'devpost')).slice(0, 10),
    ...unstop.map(h => transformHackathon(h, 'unstop')).slice(0, 10)
  ];

  console.log(`\n📊 Found ${allHackathons.length} hackathons from live sources`);

  // Read existing data
  let existingData = { hackathons: SAMPLE_HACKATHONS, lastUpdated: new Date().toISOString() };
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
      existingData = JSON.parse(fileContent);
    }
  } catch (err) {
    console.error('Error reading existing data:', err.message);
  }

  // Merge: new data + existing (avoid duplicates by platform+name)
  const existing = new Set(existingData.hackathons.map(h => `${h.platform}_${h.name}`));
  const newHackathons = allHackathons.filter(h => !existing.has(`${h.platform}_${h.name}`));

  const merged = [
    ...newHackathons,
    ...existingData.hackathons
  ];

  // Save to file
  const dataToSave = {
    hackathons: merged.slice(0, 100), // Keep latest 100
    lastUpdated: new Date().toISOString(),
    totalCount: merged.length,
    sourcesFetched: ['kaggle', 'devpost'],
    note: 'Live data fetched from multiple platforms'
  };

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
    console.log(`\n✅ Data saved to ${DATA_FILE}`);
    console.log(`📈 Total hackathons: ${dataToSave.hackathons.length}`);
    console.log(`⏰ Last updated: ${dataToSave.lastUpdated}\n`);
  } catch (err) {
    console.error('❌ Error saving data:', err.message);
  }
}

// Run if called directly
if (require.main === module) {
  scrapeHackathons().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { scrapeHackathons };
