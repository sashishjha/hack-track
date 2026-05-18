const cheerio = require('cheerio');
const BaseAdapter = require('./base');

class MlhAdapter extends BaseAdapter {
  constructor() {
    super({
      platform: 'mlh',
      name: 'MLH',
      baseUrl: 'https://mlh.io',
      scraperType: 'html',
      rateLimit: 1000,
      maxPages: 1,
      timeout: 25000,
    });
  }

  async fetch() {
    const resp = await this.httpGet('https://mlh.io/seasons/2026/events', {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    const html = String(resp.data || '');
    console.log('🧪 MLH raw HTML sample:', html.slice(0, 250).replace(/\s+/g, ' '));

    const $ = cheerio.load(html);

    // Fallback #1: traditional card selectors (kept for compatibility if MLH changes back)
    const cardNodes = $('.event-wrapper, .event');
    if (cardNodes.length > 0) {
      const rows = [];
      cardNodes.each((_, el) => {
        const node = $(el);
        rows.push({
          name: node.find('.event-name').first().text().trim(),
          dateRange: node.find('.event-date').first().text().trim(),
          location: node.find('.event-location').first().text().trim(),
          url: node.find('a').first().attr('href') || null,
        });
      });

      console.log('🧪 MLH selector-based sample keys:', Object.keys(rows[0] || {}));
      return rows;
    }

    // Current MLH page stores events in Inertia payload under #app[data-page]
    const dataPage = $('#app').attr('data-page');
    if (!dataPage) return [];

    const parsed = JSON.parse(dataPage);
    const upcoming = Array.isArray(parsed.props?.upcomingEvents) ? parsed.props.upcomingEvents : [];
    const past = Array.isArray(parsed.props?.pastEvents) ? parsed.props.pastEvents : [];

    const allEvents = [...upcoming, ...past];
    console.log('🧪 MLH data-page sample:', JSON.stringify({
      component: parsed.component,
      upcomingCount: upcoming.length,
      pastCount: past.length,
      firstItemKeys: allEvents[0] ? Object.keys(allEvents[0]).slice(0, 20) : [],
    }));

    return allEvents;
  }

  normalize(raw) {
    const title = raw.name || raw.title || '';
    if (!title) return null;

    const startDate = raw.startsAt || raw.start_date || null;
    const endDate = raw.endsAt || raw.end_date || null;

    const canonicalPath = raw.url || raw.public_url || ('/events/' + (raw.slug || this.slugify(title)));
    const normalizedPath = canonicalPath.startsWith('http') ? canonicalPath : (this.baseUrl + canonicalPath);

    const tags = [
      raw.region,
      raw.formatType,
      ...(Array.isArray(raw.tags) ? raw.tags : []),
    ].filter(Boolean).slice(0, 8);

    return {
      id: 'mlh_' + (raw.id || raw.slug || this.slugify(title)),
      slug: raw.slug || this.slugify(title),
      title,
      platform: 'mlh',
      organizer: 'Major League Hacking',
      description: (raw.description || raw.dateRange || raw.location || 'MLH student hackathon').slice(0, 500),
      url: normalizedPath,
      status: String(raw.status || '').toLowerCase() === 'pending' ? 'upcoming' : 'open',
      registrationStatus: 'open',
      submissionDeadline: endDate ? new Date(endDate).toISOString() : null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      prizePoolUsd: null,
      prizeDisplay: 'Prizes vary by event',
      participantsEstimate: null,
      teamSizeMin: 1,
      teamSizeMax: 4,
      skillDomains: ['web_app'],
      careerOutcomes: ['networking', 'resume_signal'],
      effortLevel: 'weekend',
      difficulty: 'beginner',
      competitionDensity: 'medium',
      recurrenceCategory: 'seasonal',
      aiPolicy: 'allowed',
      apiCreditsIncluded: false,
      gpuCreditsIncluded: false,
      mode: String(raw.formatType || '').toLowerCase() === 'physical' ? 'onsite' : 'remote',
      studentOnly: true,
      teamType: 'team',
      hardwareRequired: false,
      tags,
      recurrence: 'recurring',
      validity: 'active',
      rarityScore: 4,
      trustScore: 9,
      source: 'scraper',
    };
  }
}

module.exports = MlhAdapter;
