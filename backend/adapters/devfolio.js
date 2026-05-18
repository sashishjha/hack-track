const BaseAdapter = require('./base');

class DevfolioAdapter extends BaseAdapter {
  constructor() {
    super({
      platform: 'devfolio',
      name: 'Devfolio',
      baseUrl: 'https://devfolio.co',
      scraperType: 'api',
      rateLimit: 1500,
      maxPages: 2,
      timeout: 25000,
    });
  }

  async fetch() {
    const allHackathons = [];
    for (let page = 1; page <= this.maxPages; page++) {
      const resp = await this.httpGet('https://api.devfolio.co/api/hackathons', {
        params: {
          type: 'online',
          per_page: 50,
          page,
        },
      });

      const payload = resp.data || {};
      if (page === 1) {
        const sample = Array.isArray(payload.result) ? payload.result[0] : null;
        console.log('🧪 Devfolio raw response sample:', JSON.stringify({
          keys: Object.keys(payload),
          count: payload.count,
          pages: payload.pages,
          firstItemKeys: sample ? Object.keys(sample).slice(0, 20) : [],
        }));
      }

      const results = Array.isArray(payload.result) ? payload.result : [];
      if (results.length === 0) break;
      allHackathons.push(...results);

      if (page >= (payload.pages || 0)) break;
      await this.sleep(this.rateLimit);
    }

    return allHackathons;
  }

  normalize(raw) {
    const title = raw.name || raw.title || '';
    if (!title) return null;

    const startsAt = raw.starts_at ? new Date(raw.starts_at).toISOString() : null;
    const endsAt = raw.ends_at ? new Date(raw.ends_at).toISOString() : null;
    const isOpen = raw.is_open !== undefined ? !!raw.is_open : raw.status === 'publish';
    const registrationOpen = raw.is_registration_open !== undefined
      ? !!raw.is_registration_open
      : isOpen;

    const minTeam = Number.isFinite(Number(raw.min_team_size))
      ? Number(raw.min_team_size)
      : (Number.isFinite(Number(raw.team_min)) ? Number(raw.team_min) : 1);
    const maxTeam = Number.isFinite(Number(raw.max_team_size))
      ? Number(raw.max_team_size)
      : (Number.isFinite(Number(raw.team_size)) ? Number(raw.team_size) : null);

    const prizeText = raw.prize_amount
      || raw.prize
      || (Array.isArray(raw.prizes) && raw.prizes.length ? JSON.stringify(raw.prizes) : null)
      || 'Prizes available';

    const tags = [
      ...(Array.isArray(raw.themes) ? raw.themes.map(t => t?.name || t).filter(Boolean) : []),
      ...(raw.is_online ? ['online'] : []),
    ].slice(0, 8);

    return {
      id: 'devfolio_' + (raw.uuid || raw.slug || this.slugify(title)),
      slug: raw.slug || this.slugify(title),
      title,
      platform: 'devfolio',
      organizer: raw.hackathon_brand?.name || 'Devfolio',
      description: (raw.tagline || raw.desc || raw.description || '').slice(0, 500),
      url: 'https://devfolio.co/hackathons/' + (raw.slug || this.slugify(title)),
      status: isOpen ? 'open' : 'closed',
      registrationStatus: registrationOpen ? 'open' : 'closed',
      submissionDeadline: endsAt,
      startDate: startsAt,
      endDate: endsAt,
      prizePoolUsd: this.parsePrizeUsd(prizeText),
      prizeDisplay: String(prizeText).slice(0, 250),
      participantsEstimate: raw.participants_count ? String(raw.participants_count) : raw.approx_participant || null,
      teamSizeMin: minTeam,
      teamSizeMax: maxTeam,
      skillDomains: ['web_app'],
      careerOutcomes: ['cash', 'networking'],
      effortLevel: 'weekend',
      difficulty: this.estimateDifficulty(raw.tagline || raw.desc || '', tags),
      competitionDensity: 'medium',
      recurrenceCategory: '2026_specific',
      aiPolicy: 'allowed',
      apiCreditsIncluded: false,
      gpuCreditsIncluded: false,
      mode: raw.is_online ? 'remote' : 'hybrid',
      studentOnly: false,
      teamType: 'team',
      hardwareRequired: false,
      tags,
      recurrence: 'one_time',
      validity: 'active',
      rarityScore: 5,
      trustScore: 7,
      source: 'scraper',
    };
  }
}

module.exports = DevfolioAdapter;
