const BaseAdapter = require('./base');

class UnstopAdapter extends BaseAdapter {
  constructor() {
    super({
      platform: 'unstop',
      name: 'Unstop',
      baseUrl: 'https://unstop.com',
      scraperType: 'api',
      rateLimit: 1200,
      maxPages: 2,
      timeout: 25000,
    });
  }

  async fetch() {
    const allOpportunities = [];

    for (let page = 1; page <= this.maxPages; page++) {
      let resp;

      try {
        // As requested, try singular endpoint first.
        resp = await this.httpGet('https://unstop.com/api/public/opportunity/search-result', {
          params: {
            opportunity: 'hackathon',
            per_page: 20,
            page,
          },
          headers: {
            Referer: 'https://unstop.com/hackathons',
          },
        });
      } catch {
        resp = null;
      }

      let payload = resp?.data?.data || {};
      let results = Array.isArray(payload.data) ? payload.data : [];

      if (results.length === 0) {
        // Fallback to plural value currently returning populated results.
        const fallbackResp = await this.httpGet('https://unstop.com/api/public/opportunity/search-result', {
          params: {
            opportunity: 'hackathons',
            per_page: 20,
            page,
          },
          headers: {
            Referer: 'https://unstop.com/hackathons',
          },
        });

        payload = fallbackResp.data?.data || {};
        results = Array.isArray(payload.data) ? payload.data : [];
      }

      if (page === 1) {
        const sample = results[0] || null;
        console.log('🧪 Unstop raw response sample:', JSON.stringify({
          keys: Object.keys(payload),
          total: payload.total,
          countInPage: results.length,
          firstItemKeys: sample ? Object.keys(sample).slice(0, 25) : [],
        }));
      }

      if (results.length === 0) break;
      allOpportunities.push(...results);

      if (!payload.next_page_url) break;
      await this.sleep(this.rateLimit);
    }

    return allOpportunities;
  }

  normalize(raw) {
    const title = raw.title || '';
    if (!title) return null;

    const startDate = raw.start_date || raw.approved_date || raw.updated_at || null;
    const endDate = raw.end_date || null;

    const prizeText = raw.reward_type
      || raw.reward_amount
      || (Array.isArray(raw.prizes) && raw.prizes.length ? JSON.stringify(raw.prizes) : null)
      || 'Prizes available';

    const participants = raw.participant_count || raw.registerCount || null;

    const isOpen = raw.regn_open === 1 || raw.regn_open === true || String(raw.status || '').toLowerCase().includes('open');

    return {
      id: 'unstop_' + (raw.id || raw.short_id || this.slugify(title)),
      slug: this.slugify(title),
      title,
      platform: 'unstop',
      organizer: raw.organisation?.name || 'Unstop',
      description: (raw.description || raw.details || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500),
      url: 'https://unstop.com/hackathons/' + (raw.slug || raw.seo_url || raw.public_url || raw.id),
      status: isOpen ? 'open' : 'closed',
      registrationStatus: isOpen ? 'open' : 'closed',
      submissionDeadline: endDate ? new Date(endDate).toISOString() : null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      prizePoolUsd: this.parsePrizeUsd(prizeText),
      prizeDisplay: String(prizeText).slice(0, 250),
      participantsEstimate: participants ? String(participants) : null,
      teamSizeMin: 1,
      teamSizeMax: 5,
      skillDomains: ['web_app'],
      careerOutcomes: ['cash', 'networking'],
      effortLevel: 'weekend',
      difficulty: this.estimateDifficulty(raw.details || '', (raw.tags || []).map(tag => tag?.name || tag)),
      competitionDensity: 'medium',
      recurrenceCategory: '2026_specific',
      aiPolicy: 'unknown',
      apiCreditsIncluded: false,
      gpuCreditsIncluded: false,
      mode: String(raw.region || '').toLowerCase() === 'online' ? 'remote' : 'hybrid',
      studentOnly: false,
      teamType: 'both',
      hardwareRequired: false,
      tags: (raw.tags || []).map(tag => tag?.name || tag).filter(Boolean).slice(0, 8),
      recurrence: 'one_time',
      validity: 'active',
      rarityScore: 6,
      trustScore: 7,
      source: 'scraper',
    };
  }
}

module.exports = UnstopAdapter;
