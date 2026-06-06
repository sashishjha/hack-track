const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../db/supabase');
const { discoverNewHackathons } = require('../discovery/search_crawler');
const { resetGeminiKeyRotation } = require('../discovery/llm_extractor');

const writeClient = supabaseAdmin || supabase;
const SUPABASE_BATCH_SIZE = 200;

function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function mapDbRowToCompetition(row) {
  if (!row) return row;
  const mapped = {};
  for (const [key, value] of Object.entries(row)) {
    mapped[snakeToCamel(key)] = value;
  }
  return mapped;
}

function mapCompetitionToDbRow(comp) {
  if (!comp || typeof comp !== 'object') return comp;
  const mapped = {};
  for (const [key, value] of Object.entries(comp)) {
    mapped[camelToSnake(key)] = value;
  }
  return mapped;
}

function normalizeSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function buildDeterministicSlug(baseSlug, canonicalId) {
  const base = normalizeSlug(baseSlug) || normalizeSlug(canonicalId) || 'competition';
  const suffixSource = normalizeSlug(canonicalId);

  if (!suffixSource || suffixSource === base) {
    return base;
  }

  const maxBaseLength = Math.max(1, 120 - suffixSource.length - 1);
  const trimmedBase = base.slice(0, maxBaseLength).replace(/-+$/g, '') || 'competition';
  return `${trimmedBase}-${suffixSource}`;
}

async function loadExistingSlugMaps(competitions) {
  const ids = [...new Set(competitions.map(comp => comp?.id).filter(Boolean))];
  const urls = [...new Set(competitions.map(comp => comp?.url).filter(Boolean))];
  const existingById = new Map();
  const existingByUrl = new Map();

  for (let index = 0; index < ids.length; index += SUPABASE_BATCH_SIZE) {
    const batch = ids.slice(index, index + SUPABASE_BATCH_SIZE);
    const { data, error } = await writeClient
      .from('competitions')
      .select('id, slug, url')
      .in('id', batch);

    if (error) {
      throw new Error(error.message);
    }

    for (const row of data || []) {
      if (row?.id && row?.slug) {
        existingById.set(row.id, row.slug);
      }
      if (row?.url && row?.slug) {
        existingByUrl.set(row.url, row.slug);
      }
    }
  }

  for (let index = 0; index < urls.length; index += SUPABASE_BATCH_SIZE) {
    const batch = urls.slice(index, index + SUPABASE_BATCH_SIZE);
    const { data, error } = await writeClient
      .from('competitions')
      .select('id, slug, url')
      .in('url', batch);

    if (error) {
      throw new Error(error.message);
    }

    for (const row of data || []) {
      if (row?.id && row?.slug && !existingById.has(row.id)) {
        existingById.set(row.id, row.slug);
      }
      if (row?.url && row?.slug && !existingByUrl.has(row.url)) {
        existingByUrl.set(row.url, row.slug);
      }
    }
  }

  return { existingById, existingByUrl };
}

function buildCanonicalSlug(comp, usedSlugs, existingById, existingByUrl) {
  const existingSlug = existingById.get(comp.id) || existingByUrl.get(comp.url);
  if (existingSlug) {
    usedSlugs.add(existingSlug);
    return existingSlug;
  }

  const baseSlug = normalizeSlug(comp.slug || comp.title);
  if (baseSlug && !usedSlugs.has(baseSlug)) {
    usedSlugs.add(baseSlug);
    return baseSlug;
  }

  const deterministicSlug = buildDeterministicSlug(baseSlug, comp.id || comp.url || comp.title);
  if (!usedSlugs.has(deterministicSlug)) {
    usedSlugs.add(deterministicSlug);
    return deterministicSlug;
  }

  const stableHash = crypto
    .createHash('sha1')
    .update(String(comp.id || comp.url || comp.title || 'competition'))
    .digest('hex')
    .slice(0, 8);
  const hashedSlug = buildDeterministicSlug(baseSlug, stableHash);
  usedSlugs.add(hashedSlug);
  return hashedSlug;
}

function hasValidAdminKey(req) {
  const adminSecret = process.env.ADMIN_SECRET;
  const providedKey = req.get('X-Admin-Key');

  if (!adminSecret || !providedKey) {
    return false;
  }

  const expected = Buffer.from(adminSecret);
  const actual = Buffer.from(providedKey);

  if (expected.length !== actual.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, actual);
}

async function refreshAdapters(adapterFactories) {
  if (!adapterFactories.length) {
    return { skipped: true, reason: 'No adapters registered for refresh' };
  }

  const adapters = adapterFactories.map(createAdapter => createAdapter());
  const results = await Promise.all(adapters.map(adapter => adapter.run()));

  const platformSummary = results.map(result => ({
    platform: result.platform,
    fetched: result.competitions.length,
    errors: result.errors,
  }));

  const allCompetitions = results.flatMap(result => result.competitions || []);
  const { existingById, existingByUrl } = await loadExistingSlugMaps(allCompetitions);
  const uniqueById = new Map();
  const usedSlugs = new Set();

  for (const comp of allCompetitions) {
    if (!comp || !comp.id) continue;
    const cleaned = { ...comp };
    delete cleaned.sourceAdapter;
    delete cleaned.lastCheckedAt;
    if (!cleaned.source) cleaned.source = 'scraper';
    cleaned.slug = buildCanonicalSlug(cleaned, usedSlugs, existingById, existingByUrl);
    uniqueById.set(cleaned.id, cleaned);
  }

  const rows = Array.from(uniqueById.values()).map(mapCompetitionToDbRow);

  for (let index = 0; index < rows.length; index += SUPABASE_BATCH_SIZE) {
    const batch = rows.slice(index, index + SUPABASE_BATCH_SIZE);
    if (batch.length === 0) {
      continue;
    }

    const { error } = await writeClient
      .from('competitions')
      .upsert(batch, { onConflict: 'slug' });

    if (error) {
      throw new Error(error.message);
    }
  }

  return {
    skipped: false,
    adaptersRun: adapters.length,
    fetchedCount: allCompetitions.length,
    upsertedCount: rows.length,
    platformSummary,
  };
}

// GET all hackathons
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;

  try {
    let query = supabase.from('competitions').select('*');

    if (req.query.search) query = query.ilike('title', `%${req.query.search}%`);
    if (req.query.platform) query = query.eq('platform', req.query.platform);
    if (req.query.difficulty) query = query.eq('difficulty', req.query.difficulty);

    const category = req.query.category || req.query.filter;
    if (category && category !== 'all') query = query.eq('recurrence_category', category);

    query = query
      .range((page - 1) * limit, page * limit - 1)
      .order('submission_deadline', { ascending: true, nullsFirst: false });

    const { data, error } = await query;
    if (error) throw error;

    const hackathons = Array.isArray(data) ? data.map(mapDbRowToCompetition) : [];
    return res.json({ hackathons, page, limit });
  } catch (err) {
    console.error('Failed to fetch competitions from Supabase:', err.message);
    return res.status(200).json({
      hackathons: [],
      page,
      limit,
      fallback: true,
      error: 'Using empty fallback because database query failed',
    });
  }
});

// GET single hackathon
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.json(mapDbRowToCompetition(data));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST - Add/Update hackathon
router.post('/', async (req, res) => {
  try {
    const payload = req.body?.hackathon ? req.body.hackathon : req.body;
    const row = mapCompetitionToDbRow(payload);

    const { data, error } = await writeClient
      .from('competitions')
      .upsert(row, { onConflict: 'id' })
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, data: (data || []).map(mapDbRowToCompetition) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST - Refresh/Update data from scraper adapters
router.post('/refresh', async (req, res) => {
  try {
    const adapterFactories = req.app?.locals?.adapterFactories || [];
    const refreshResult = await refreshAdapters(adapterFactories);

    if (refreshResult.skipped) {
      return res.status(501).json({ success: false, error: refreshResult.reason });
    }

    return res.json({
      success: true,
      message: 'Adapters refreshed and competitions upserted',
      ...refreshResult,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST - Refresh adapters and run Tavily discovery
router.post('/refresh-all', async (req, res) => {
  try {
    const adapterFactories = req.app?.locals?.adapterFactories || [];
    resetGeminiKeyRotation();
    const refreshResult = await refreshAdapters(adapterFactories);
    const discoveredHackathons = await discoverNewHackathons();

    return res.json({
      success: true,
      message: refreshResult.skipped
        ? 'Discovery completed; adapter refresh skipped'
        : 'All sources refreshed and discovery completed',
      adapterRefresh: refreshResult,
      discovery: {
        discoveredCount: discoveredHackathons.length,
        titles: discoveredHackathons.map(comp => comp.title).filter(Boolean),
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/discover', async (req, res) => {
  if (!process.env.ADMIN_SECRET) {
    return res.status(500).json({ success: false, error: 'ADMIN_SECRET is not configured' });
  }

  if (!hasValidAdminKey(req)) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  try {
    const discoveredHackathons = await discoverNewHackathons();
    const summary = discoveredHackathons.summary || {};

    return res.json({
      success: true,
      found: summary.found ?? discoveredHackathons.length,
      verified: summary.verified ?? discoveredHackathons.length,
      newSources: summary.newSources ?? 0,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE hackathon
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await writeClient
      .from('competitions')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
