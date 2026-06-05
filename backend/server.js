const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { discoverNewHackathons } = require('./discovery/search_crawler');
const DevpostAdapter = require('./adapters/devpost');
const KaggleAdapter = require('./adapters/kaggle');
const DevfolioAdapter = require('./adapters/devfolio');
const UnstopAdapter = require('./adapters/unstop');
const MlhAdapter = require('./adapters/mlh');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env'), override: true });

const app = express();
const PORT = process.env.PORT || 5001;

// Adapter registry used by /api/hackathons/refresh
app.locals.adapterFactories = [
  () => new DevpostAdapter(),
  () => new KaggleAdapter(),
  () => new DevfolioAdapter(),
  () => new UnstopAdapter(),
  () => new MlhAdapter(),
];

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/hackathons', require('./routes/hackathons'));

// Manual trigger for Web Discovery Engine
app.post('/api/discover', async (req, res) => {
  try {
    const newHackathons = await discoverNewHackathons();
    res.json({ success: true, count: newHackathons.length, data: newHackathons });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Scheduled Jobs — Run Discovery Engine every 24 hours at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running daily Web Discovery Engine cron job...');
  try {
    await discoverNewHackathons();
  } catch (err) {
    console.error('❌ Discovery Engine cron failed:', err);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 HackTrack API server running on http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/hackathons`);
  console.log(`🔍 Discovery: POST http://localhost:${PORT}/api/discover`);
  console.log('🕸️ Adapter refresh platforms:', app.locals.adapterFactories.length);
});

server.on('error', err => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Another backend instance is likely running.`);
    console.error('Stop the existing process or change PORT before starting a new one.');
    process.exit(0);
  }

  throw err;
});

module.exports = app;
