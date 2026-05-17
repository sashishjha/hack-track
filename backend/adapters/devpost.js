/**
 * Devpost Adapter — Fetches hackathons from Devpost's JSON API.
 * Devpost exposes a public JSON endpoint at /hackathons.json
 */
const BaseAdapter = require('./base');

class DevpostAdapter extends BaseAdapter {
  constructor() {
    super({
      platform: 'devpost',
      name: 'Devpost',
      baseUrl: 'https://devpost.com',
      scraperType: 'api',
      rateLimit: 1500,
      maxPages: 5,
    });
  }

  async fetch() {
    const allHackathons = [];
    for (let page = 1; page <= this.maxPages; page++) {
      try {
        const resp = await this.httpGet(`${this.baseUrl}/api/hackathons`, {
          params: {
            page,
            status: 'open',
            order_by: 'deadline',
          },
        });
        const hackathons = resp.data?.hackathons || resp.data || [];
        if (!Array.isArray(hackathons) || hackathons.length === 0) break;
        allHackathons.push(...hackathons);
        await this.sleep(this.rateLimit);
      } catch (err) {
        // Try fallback endpoint
        if (page === 1) {
          try {
            const resp = await this.httpGet(`${this.baseUrl}/hackathons.json?page=${page}`);
            const hackathons = resp.data?.hackathons || [];
            allHackathons.push(...hackathons);
          } catch {
            throw err;
          }
        }
        break;
      }
    }
    return allHackathons;
  }

  normalize(raw) {
    const title = raw.title || raw.name || '';
    if (!title) return null;

    const deadline = raw.submission_period_dates?.split?.(' - ')?.[1]
      || raw.submission_deadline
      || raw.end_date
      || null;

    return {
      id: `devpost_${raw.id || this.slugify(title)}`,
      slug: this.slugify(title),
      title,
      platform: 'devpost',
      organizer: raw.organization_name || 'Devpost',
      description: (raw.tagline || raw.description || '').slice(0, 500),
      url: raw.url || `${this.baseUrl}/hackathons`,
      status: this.mapStatus(raw.status || raw.state),
      registrationStatus: raw.registrations_open ? 'open' : 'unknown',
      submissionDeadline: deadline ? new Date(deadline).toISOString() : null,
      startDate: raw.start_date ? new Date(raw.start_date).toISOString() : null,
      endDate: raw.end_date ? new Date(raw.end_date).toISOString() : null,
      prizePoolUsd: this.parsePrizeUsd(raw.prize_amount || raw.prize_total),
      prizeDisplay: raw.prize_amount || raw.prize_total || 'Prizes available',
      participantsEstimate: raw.registrations_count ? `${raw.registrations_count}` : null,
      teamSizeMin: 1,
      teamSizeMax: raw.max_team_size || 5,
      skillDomains: this.extractDomains(raw),
      careerOutcomes: ['cash', 'networking'],
      effortLevel: 'weekend',
      difficulty: this.estimateDifficulty(raw.tagline, raw.themes || []),
      competitionDensity: this.estimateDensity(raw.registrations_count),
      recurrenceCategory: '2026_specific',
      aiPolicy: 'allowed',
      apiCreditsIncluded: false,
      gpuCreditsIncluded: false,
      mode: raw.location ? 'hybrid' : 'remote',
      studentOnly: false,
      teamType: 'both',
      hardwareRequired: false,
      tags: (raw.themes || raw.tags || []).slice(0, 8),
      recurrence: 'one_time',
      validity: 'active',
    };
  }

  mapStatus(status) {
    if (!status) return 'unknown';
    const s = status.toLowerCase();
    if (s.includes('open') || s.includes('ongoing')) return 'open';
    if (s.includes('upcoming') || s.includes('preview')) return 'upcoming';
    if (s.includes('ended') || s.includes('closed')) return 'closed';
    return 'unknown';
  }

  estimateDensity(registrations) {
    if (!registrations) return 'medium';
    const n = parseInt(registrations);
    if (n < 100) return 'very_low';
    if (n < 500) return 'low';
    if (n < 2000) return 'medium';
    if (n < 5000) return 'high';
    return 'overcrowded';
  }

  extractDomains(raw) {
    const text = `${raw.tagline || ''} ${raw.description || ''} ${(raw.themes || []).join(' ')}`.toLowerCase();
    const domains = [];
    if (text.match(/\b(ai|machine.?learning|ml|deep.?learning)\b/)) domains.push('ai_ml');
    if (text.match(/\b(nlp|llm|language.?model|gpt|chatbot)\b/)) domains.push('nlp_llm');
    if (text.match(/\b(web|react|frontend|backend|fullstack)\b/)) domains.push('web_app');
    if (text.match(/\b(blockchain|web3|defi|nft|crypto)\b/)) domains.push('blockchain_web3');
    if (text.match(/\b(robot|hardware|iot|embedded|arduino)\b/)) domains.push('robotics');
    if (text.match(/\b(cv|computer.?vision|image|video)\b/)) domains.push('computer_vision');
    if (text.match(/\b(cloud|devops|aws|gcp|azure)\b/)) domains.push('cloud_devops');
    if (text.match(/\b(health|climate|social|impact|sustainab)\b/)) domains.push('social_impact');
    if (text.match(/\b(security|cyber|ctf|hack)\b/)) domains.push('cybersecurity');
    if (text.match(/\b(data|analytics|visualization)\b/)) domains.push('data_science');
    return domains.length > 0 ? domains : ['web_app'];
  }
}

module.exports = DevpostAdapter;
