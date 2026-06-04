/**
 * Kaggle Adapter — Fetches competitions from Kaggle's public API.
 * Note: Full API requires credentials. Public endpoint returns active competitions.
 */
const BaseAdapter = require('./base');

class KaggleAdapter extends BaseAdapter {
  constructor() {
    super({
      platform: 'kaggle',
      name: 'Kaggle',
      baseUrl: 'https://www.kaggle.com',
      scraperType: 'api',
      rateLimit: 2000,
      maxPages: 2,
    });
    this.apiToken = process.env.KAGGLE_API_TOKEN || '';
  }

  async fetch() {
    const headers = {};
    if (this.apiToken) {
      headers.Authorization = 'Bearer ' + this.apiToken;
    }

    const allComps = [];
    for (let page = 1; page <= this.maxPages; page++) {
      try {
        const resp = await this.httpGet(`${this.baseUrl}/api/v1/competitions/list`, {
          params: { page },
          headers,
        });
        const comps = Array.isArray(resp.data) ? resp.data : [];
        if (comps.length === 0) break;
        allComps.push(...comps);
        await this.sleep(this.rateLimit);
      } catch (err) {
        if (page === 1) console.warn(`⚠️ Kaggle API: ${err.message}. Try setting KAGGLE_USERNAME and KAGGLE_KEY.`);
        break;
      }
    }
    return allComps;
  }

  normalize(raw) {
    const title = raw.title || raw.name || '';
    if (!title) return null;

    const deadline = raw.deadline || raw.end_date;
    const isActive = deadline ? new Date(deadline) > new Date() : true;

    return {
      id: `kaggle_${raw.ref || raw.id || this.slugify(title)}`,
      slug: this.slugify(title),
      title,
      platform: 'kaggle',
      organizer: raw.organizationName || 'Kaggle',
      description: (raw.description || '').slice(0, 500),
      url: raw.url ? `${this.baseUrl}${raw.url}` : `${this.baseUrl}/competitions`,
      status: isActive ? 'open' : 'closed',
      registrationStatus: isActive ? 'open' : 'closed',
      submissionDeadline: deadline ? new Date(deadline).toISOString() : null,
      prizePoolUsd: this.parsePrizeUsd(raw.reward),
      prizeDisplay: raw.reward || 'Knowledge / Medals',
      participantsEstimate: raw.teamCount ? `${raw.teamCount} teams` : null,
      teamSizeMin: 1,
      teamSizeMax: raw.maxTeamSize || 5,
      skillDomains: this.extractDomains(raw),
      careerOutcomes: raw.reward ? ['cash', 'research_visibility'] : ['research_visibility'],
      effortLevel: 'multi_month',
      difficulty: this.estimateKaggleDifficulty(raw),
      competitionDensity: raw.teamCount > 5000 ? 'overcrowded' : raw.teamCount > 1000 ? 'high' : 'medium',
      recurrenceCategory: raw.isKernelsSubmissionsOnly ? 'always_open' : '2026_specific',
      aiPolicy: 'allowed',
      apiCreditsIncluded: false,
      gpuCreditsIncluded: true, // Kaggle provides free GPU notebooks
      mode: 'remote',
      studentOnly: false,
      teamType: 'both',
      hardwareRequired: false,
      tags: (raw.tags || []).map(t => t.name || t).slice(0, 8),
      recurrence: raw.isKernelsSubmissionsOnly ? 'always_open' : 'one_time',
      validity: 'active',
    };
  }

  estimateKaggleDifficulty(raw) {
    const text = `${raw.title || ''} ${raw.description || ''} ${(raw.tags || []).join(' ')}`.toLowerCase();
    if (text.match(/getting.?started|playground|learn/)) return 'beginner';
    if (text.match(/research|featured/)) return 'advanced';
    if (raw.reward && this.parsePrizeUsd(raw.reward) > 50000) return 'elite';
    return 'intermediate';
  }

  extractDomains(raw) {
    const text = `${raw.title || ''} ${raw.description || ''} ${(raw.tags || []).map(t => t.name || t).join(' ')}`.toLowerCase();
    const domains = [];
    if (text.match(/nlp|text|language|translation|sentiment/)) domains.push('nlp_llm');
    if (text.match(/image|vision|object.?detect|segment|cv/)) domains.push('computer_vision');
    if (text.match(/tabular|regression|classif|forecast/)) domains.push('data_science');
    if (text.match(/reinforcement|rl|game|simulation/)) domains.push('reinforcement_learning');
    if (text.match(/time.?series|finance|stock|trading/)) domains.push('quant_finance');
    if (text.match(/health|medical|bio|drug/)) domains.push('social_impact');
    if (domains.length === 0) domains.push('ai_ml');
    return domains;
  }
}

module.exports = KaggleAdapter;
