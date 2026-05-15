const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/hackathons.json');

// Helper to read hackathons data
const readHackathons = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading data:', err);
    return { hackathons: [], lastUpdated: null };
  }
};

// Helper to write hackathons data
const writeHackathons = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing data:', err);
    return false;
  }
};

// GET all hackathons
router.get('/', (req, res) => {
  try {
    const data = readHackathons();
    const { filter, search, limit = 100, page = 1 } = req.query;

    let hackathons = data.hackathons || [];

    // Filter by category
    if (filter && filter !== 'all') {
      hackathons = hackathons.filter(h => h.category === filter);
    }

    // Search by text
    if (search) {
      const q = search.toLowerCase();
      hackathons = hackathons.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q) ||
        h.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    // Pagination
    const start = (page - 1) * limit;
    const paginatedHackathons = hackathons.slice(start, start + parseInt(limit));

    res.json({
      success: true,
      total: hackathons.length,
      limit: parseInt(limit),
      page: parseInt(page),
      data: paginatedHackathons,
      lastUpdated: data.lastUpdated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single hackathon
router.get('/:id', (req, res) => {
  try {
    const data = readHackathons();
    const hackathon = data.hackathons.find(h => h.id === req.params.id);

    if (!hackathon) {
      return res.status(404).json({ success: false, error: 'Hackathon not found' });
    }

    res.json({ success: true, data: hackathon });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST - Add/Update hackathons (admin)
router.post('/', (req, res) => {
  try {
    const { hackathon } = req.body;

    if (!hackathon || !hackathon.name) {
      return res.status(400).json({ success: false, error: 'Invalid hackathon data' });
    }

    const data = readHackathons();
    hackathon.id = hackathon.id || `hack_${Date.now()}`;
    hackathon.addedAt = hackathon.addedAt || new Date().toISOString();

    // Check if exists and update or add
    const idx = data.hackathons.findIndex(h => h.id === hackathon.id);
    if (idx >= 0) {
      data.hackathons[idx] = { ...data.hackathons[idx], ...hackathon };
    } else {
      data.hackathons.push(hackathon);
    }

    data.lastUpdated = new Date().toISOString();
    writeHackathons(data);

    res.json({ success: true, data: hackathon, message: 'Hackathon saved' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST - Refresh/Update data from sources
router.post('/refresh', async (req, res) => {
  try {
    // This would trigger the scraper
    // For now, just return success
    const data = readHackathons();
    data.lastUpdated = new Date().toISOString();
    writeHackathons(data);

    res.json({
      success: true,
      message: 'Data refresh initiated',
      lastUpdated: data.lastUpdated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE hackathon
router.delete('/:id', (req, res) => {
  try {
    const data = readHackathons();
    const idx = data.hackathons.findIndex(h => h.id === req.params.id);

    if (idx < 0) {
      return res.status(404).json({ success: false, error: 'Hackathon not found' });
    }

    data.hackathons.splice(idx, 1);
    data.lastUpdated = new Date().toISOString();
    writeHackathons(data);

    res.json({ success: true, message: 'Hackathon deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
