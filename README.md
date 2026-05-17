# HackTrack — Global Competition Intelligence

A live, AI-powered platform tracking **95+ hackathons, competitions, bounties, and coding contests** across the internet. Built with a dark hacker aesthetic.

## Quick Start

```bash
npm install
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001

## Features

- 🎯 **95 seeded competitions** across 15 categories (2026-specific, daily, weekly, monthly, annual, always-open)
- 🔍 **AI Web Discovery Engine** — automatically finds new hackathons using DuckDuckGo + Google Gemini
- 🎨 **Dark hacker aesthetic** — IBM Plex Mono, Syne fonts, green-on-dark theme
- 📊 **Multi-dimensional filtering** — by platform, skill domain, difficulty, effort level, AI policy, mode
- 💎 **Hidden Gems** — rarity scoring system to surface low-competition, high-reward opportunities
- ⏰ **Live countdowns** — tracks nearest deadlines
- 🤖 **Platform scrapers** — Devpost and Kaggle adapters with retry and rate limiting

## Project Docs

See `already-done-job/` for:
- `HANDOFF.md` — Complete architecture, schema, file map, and roadmap
- `CHANGELOG.md` — Detailed history of all work done
- `PROMPT_FOR_NEW_AI.md` — Quick-start prompt to hand off to another AI

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TanStack Router, Tailwind CSS v4, Vite 7, TypeScript |
| Backend | Node.js, Express, Axios, Cheerio |
| AI Discovery | Google Gemini 1.5 Flash (free), DuckDuckGo |
| Scheduling | node-cron |

## License

MIT — Conceived & engineered by S.J.
