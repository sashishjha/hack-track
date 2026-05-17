/**
 * BaseAdapter — Abstract interface for all platform source adapters.
 * 
 * Every platform adapter must extend this class and implement:
 *   - fetch()     → scrape/fetch raw data from the platform
 *   - normalize() → convert raw data to our Competition schema
 * 
 * The orchestrator calls adapters in parallel and merges results.
 */
const axios = require('axios');

class BaseAdapter {
  constructor(config) {
    this.platform = config.platform;       // e.g. 'devpost'
    this.name = config.name;               // e.g. 'Devpost'
    this.baseUrl = config.baseUrl;
    this.scraperType = config.scraperType; // 'api' | 'html' | 'rss'
    this.rateLimit = config.rateLimit || 2000; // ms between requests
    this.timeout = config.timeout || 10000;
    this.maxPages = config.maxPages || 3;
    this.enabled = config.enabled !== false;
  }

  /** Override: Fetch raw competition data from the platform */
  async fetch() {
    throw new Error(`${this.name}: fetch() not implemented`);
  }

  /** Override: Normalize a single raw entry to our schema */
  normalize(raw) {
    throw new Error(`${this.name}: normalize() not implemented`);
  }

  /** Run the full pipeline: fetch → normalize → dedupe */
  async run() {
    if (!this.enabled) {
      console.log(`⏭️  ${this.name}: skipped (disabled)`);
      return { platform: this.platform, competitions: [], errors: [] };
    }

    console.log(`🔄 ${this.name}: fetching...`);
    const startTime = Date.now();
    const errors = [];
    let raw = [];

    try {
      raw = await this.fetch();
    } catch (err) {
      errors.push({ stage: 'fetch', message: err.message });
      console.error(`❌ ${this.name}: fetch failed — ${err.message}`);
    }

    const competitions = [];
    for (const item of raw) {
      try {
        const normalized = this.normalize(item);
        if (normalized && normalized.title && normalized.url) {
          normalized.sourceAdapter = this.platform;
          normalized.lastCheckedAt = new Date().toISOString();
          competitions.push(normalized);
        }
      } catch (err) {
        errors.push({ stage: 'normalize', message: err.message, item: item?.title || 'unknown' });
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ ${this.name}: ${competitions.length} competitions in ${elapsed}s (${errors.length} errors)`);

    return { platform: this.platform, competitions, errors };
  }

  /** Helper: HTTP GET with retry */
  async httpGet(url, options = {}) {
    const maxRetries = options.retries || 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.get(url, {
          timeout: this.timeout,
          headers: {
            'User-Agent': 'HackTrack/2.0 (Competition Intelligence Platform)',
            'Accept': 'application/json, text/html',
            ...options.headers,
          },
          ...options,
        });
        return response;
      } catch (err) {
        if (attempt === maxRetries) throw err;
        console.log(`🔁 ${this.name}: retry ${attempt + 1}/${maxRetries} for ${url}`);
        await this.sleep(this.rateLimit * (attempt + 1));
      }
    }
  }

  /** Helper: sleep for rate limiting */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Helper: generate a slug from title */
  slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  /** Helper: parse prize string to USD estimate */
  parsePrizeUsd(prizeStr) {
    if (!prizeStr) return null;
    const str = String(prizeStr).replace(/,/g, '');
    // USD
    const usdMatch = str.match(/\$\s*([\d.]+)\s*(k|m)?/i);
    if (usdMatch) {
      let val = parseFloat(usdMatch[1]);
      if (usdMatch[2]?.toLowerCase() === 'k') val *= 1000;
      if (usdMatch[2]?.toLowerCase() === 'm') val *= 1000000;
      return Math.round(val);
    }
    // INR  
    const inrMatch = str.match(/₹\s*([\d.]+)\s*(l|lakh|cr|crore|k)?/i);
    if (inrMatch) {
      let val = parseFloat(inrMatch[1]);
      const unit = (inrMatch[2] || '').toLowerCase();
      if (unit === 'l' || unit === 'lakh') val *= 100000;
      if (unit === 'cr' || unit === 'crore') val *= 10000000;
      if (unit === 'k') val *= 1000;
      return Math.round(val / 83); // INR to USD approx
    }
    return null;
  }

  /** Helper: estimate difficulty from description */
  estimateDifficulty(desc = '', tags = []) {
    const text = `${desc} ${tags.join(' ')}`.toLowerCase();
    if (text.match(/research|phd|neurips|icml|cvpr|arxiv/)) return 'research';
    if (text.match(/expert|elite|advanced|senior|$100k|professional/)) return 'elite';
    if (text.match(/advanced|intermediate|experience required/)) return 'advanced';
    if (text.match(/beginner|starter|newbie|first.time|intro/)) return 'beginner';
    return 'intermediate';
  }
}

module.exports = BaseAdapter;
