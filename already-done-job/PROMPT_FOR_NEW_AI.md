# HackTrack — Quick-Start Prompt for a New AI

Copy-paste this entire file as context to any AI (ChatGPT, Claude, Gemini, etc.) if you want to continue building this project.

---

## Context

I am building a project called **HackTrack** — a Global Competition Intelligence Platform. It is located at `~/Downloads/Hackathon-tracker/`.

### What it does
Tracks 95+ hackathons, coding competitions, bounty platforms, and AI challenges across the internet. Has a dark hacker-themed React frontend and a Node.js backend with an AI-powered web discovery engine that automatically finds new hackathons using DuckDuckGo + Google Gemini API (free tier).

### Tech stack
- **Frontend:** React 19 + TanStack Router + Tailwind CSS v4 + Vite 7 (TypeScript)
- **Backend:** Node.js + Express (JavaScript)
- **Scraping:** Axios + Cheerio (platform adapters for Devpost/Kaggle)
- **AI Discovery:** @google/generative-ai (Gemini 1.5 Flash free tier) + DuckDuckGo HTML scraping
- **Scheduling:** node-cron (daily at midnight)

### Current state
- ✅ Frontend fully built (homepage with hero, filters, card grid, countdown, hidden gems)
- ✅ 95 competitions seeded in TypeScript files
- ✅ Backend API server with adapters for Devpost and Kaggle
- ✅ AI Web Discovery Engine built (DuckDuckGo → Gemini extraction)
- ✅ Project fully cleaned (all legacy/unused files removed)
- ❌ Not yet connected to a database (data is static TypeScript arrays)
- ❌ No competition detail page yet
- ❌ Not deployed yet

### What to do next
1. **The Strategic Roadmap:** The project is transitioning from a "directory" to a "Living Intelligence System." Read `already-done-job/HANDOFF.md` section 12. There is a 20-point strategic roadmap detailing exactly what needs to be built (Status Intelligence, Trust Scores, Team Formation, Personalization, etc.).
2. **Missing Competitions:** We have a master list of 101 competitions (v3.0), but currently only 95 are seeded in the `src/data/` files. Identify and add the missing ~6 competitions.
3. Read `already-done-job/HANDOFF.md` for the complete architecture, file structure, data schema, and roadmap.
4. Read `already-done-job/CHANGELOG.md` for the full history of what was built and when.

### How to run
```bash
cd ~/Downloads/Hackathon-tracker
npm install
npm run dev          # Runs both frontend + backend
# Frontend: http://localhost:5173
# Backend:  http://localhost:5001
```

### Key files to understand first
1. `src/lib/types.ts` — The Competition interface (25+ fields)
2. `src/data/index.ts` — Master data merge + filter utilities
3. `src/routes/index.tsx` — The homepage
4. `backend/server.js` — Express API + cron
5. `backend/discovery/search_crawler.js` — The web discovery engine
6. `already-done-job/HANDOFF.md` — Full project documentation
