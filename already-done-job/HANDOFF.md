# HackTrack — Project Handoff Document
## Global Competition Intelligence Platform

**Author:** S.J.  
**Date:** May 17, 2026  
**Version:** 2.0  

---

## 1. WHAT THIS PROJECT IS

HackTrack is a live, automated platform that tracks **95+ hackathons, competitions, bounty platforms, and coding contests** across the internet. It has:

- A **React + TanStack Router frontend** with a dark hacker aesthetic (IBM Plex Mono, Syne fonts, green-on-dark theme).
- A **Node.js/Express backend** with platform-specific scrapers (Devpost, Kaggle) and a generalized AI-powered web discovery engine that uses the free Google Gemini API + DuckDuckGo to find brand new hackathons automatically.
- A **typed seed database** of 95 competitions across 15 categories (2026-specific, daily, weekly, monthly, annual, always-open).

---

## 2. TECH STACK

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend Framework | React 19 + TanStack Router + TanStack Start | File-based routing in `src/routes/` |
| Styling | Tailwind CSS v4 + custom CSS vars | Dark theme in `src/styles.css` |
| Build Tool | Vite 7 | Config in `vite.config.ts` |
| Backend | Node.js + Express | `backend/server.js` |
| Scraping | Axios + Cheerio | `backend/adapters/` |
| AI Discovery | Google Gemini 1.5 Flash (free tier) | `backend/discovery/llm_extractor.js` |
| Web Search | DuckDuckGo HTML scraping (free) | `backend/discovery/search_crawler.js` |
| Scheduling | node-cron | Runs daily at midnight |
| Language | TypeScript (frontend), JavaScript (backend) | |
| Deployment target | Vite → Cloudflare Workers (frontend), Express → Railway/Render (backend) | |

---

## 3. PROJECT STRUCTURE

```
Hackathon-tracker/
├── backend/                          # Node.js backend (Express API)
│   ├── server.js                     # Express app + cron scheduler
│   ├── routes/
│   │   └── hackathons.js             # REST API: GET/POST/DELETE /api/hackathons
│   ├── adapters/                     # Platform-specific scrapers
│   │   ├── base.js                   # BaseAdapter class (retry, parsing helpers)
│   │   ├── devpost.js                # Devpost JSON API adapter
│   │   └── kaggle.js                 # Kaggle REST API adapter
│   └── discovery/                    # AI Web Discovery Engine
│       ├── search_crawler.js         # DuckDuckGo searcher + URL extractor
│       └── llm_extractor.js          # Gemini API: raw HTML → Competition JSON
│
├── src/                              # React frontend (TypeScript)
│   ├── routes/                       # TanStack file-based routes
│   │   ├── __root.tsx                # Root layout (meta tags, fonts, shell)
│   │   └── index.tsx                 # Homepage (hero, filters, cards grid)
│   ├── components/                   # UI components
│   │   ├── CompetitionCard.tsx       # Rich card with countdown, badges, intel
│   │   ├── FilterBar.tsx             # Multi-dimensional filter bar
│   │   ├── HeroSection.tsx           # Premium hero with stats
│   │   ├── CountdownCards.tsx        # Deadline countdown section
│   │   └── HiddenGems.tsx            # High-rarity competition showcase
│   ├── data/                         # Seed database (95 competitions)
│   │   ├── competitions.ts           # IDs 1–20:  2026-specific + daily
│   │   ├── competitions-part2.ts     # IDs 21–40: weekly + monthly
│   │   ├── competitions-part3.ts     # IDs 41–90: annual + always-open
│   │   ├── competitions-part4.ts     # IDs 91–95: remaining aggregators
│   │   └── index.ts                  # Master merge + filter/sort utilities
│   ├── lib/                          # Shared types and constants
│   │   ├── types.ts                  # 25+ field Competition interface
│   │   ├── constants.ts              # Taxonomies, platform registry, defaults
│   │   └── utils.ts                  # Tailwind merge utility
│   ├── styles.css                    # Global dark theme + design tokens
│   ├── router.tsx                    # TanStack router setup
│   ├── routeTree.gen.ts              # Auto-generated route tree
│   ├── server.ts                     # TanStack Start server entry
│   └── start.ts                      # Client entry point
│
├── .env                              # Environment vars (GEMINI_API_KEY)
├── .env.example                      # Template for .env
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript config
├── vite.config.ts                    # Vite build config
└── eslint.config.js                  # Linting
```

---

## 4. THE COMPETITION DATA SCHEMA

Every competition in `src/data/` follows this TypeScript interface (defined in `src/lib/types.ts`):

```typescript
interface Competition {
  id: string;
  slug: string;
  title: string;
  platform: string;
  organizer: string;
  description: string;
  url: string;
  status: 'open' | 'upcoming' | 'closed' | 'archived' | 'unknown';
  registrationStatus: 'open' | 'closed' | 'waitlist' | 'unknown';
  submissionDeadline?: string;        // ISO-8601
  startDate?: string;
  endDate?: string;
  prizePoolUsd?: number;
  prizeDisplay: string;
  participantsEstimate?: string;
  teamSizeMin: number;
  teamSizeMax: number;
  skillDomains: SkillDomain[];        // e.g. ['ai_ml', 'robotics']
  careerOutcomes: CareerOutcome[];    // e.g. ['cash', 'recruitment_pipeline']
  effortLevel: EffortLevel;           // '2h_sprint' | 'weekend' | 'multi_month' etc.
  difficulty: DifficultyLevel;        // 'beginner' | 'intermediate' | 'advanced' | 'elite' | 'research'
  competitionDensity: CompetitionDensity; // 'very_low' .. 'overcrowded'
  recurrenceCategory: RecurrenceCategory;
  aiPolicy: AIPolicy;                 // 'no_ai' | 'allowed' | 'ai_core' | 'open_model'
  apiCreditsIncluded: boolean;
  gpuCreditsIncluded: boolean;
  mode: 'remote' | 'hybrid' | 'in_person';
  studentOnly: boolean;
  teamType: 'individual' | 'team' | 'both';
  hardwareRequired: boolean;
  tags: string[];
  recurrence: string;
  validity: 'active' | 'historical';
  rarityScore?: number;               // 1–10 (10 = extreme hidden gem)
  trustScore?: number;
  recruiterVisibility?: number;
  resumeValue?: number;
  beginnerFriendlyScore?: number;
  countryRestrictions?: string[];
}
```

---

## 5. WHAT HAS BEEN COMPLETED

### Phase 1: Foundation (DONE ✅)
- [x] Designed the 25+ field Competition type schema
- [x] Created constants/taxonomies with 50+ platform registry
- [x] Seeded 95 competitions across 4 data files (Part 1–4)
- [x] Built the dark hacker aesthetic (IBM Plex Mono + Syne fonts, green accents, grid overlay)
- [x] Built 5 React components: CompetitionCard, FilterBar, HeroSection, CountdownCards, HiddenGems
- [x] Assembled responsive homepage with nav, hero, filters, card grid, footer
- [x] Implemented multi-dimensional client-side filtering and sorting
- [x] Production build passes with zero TypeScript errors

### Phase 2: Live Engine (DONE ✅)
- [x] Built BaseAdapter class for platform-specific scrapers
- [x] Built Devpost adapter (JSON API, pagination, domain extraction)
- [x] Built Kaggle adapter (REST API)
- [x] Built AI Web Discovery Engine (DuckDuckGo search → Gemini extraction)
- [x] Set up node-cron daily job for automated discovery
- [x] Created manual trigger endpoint: `POST /api/discover`
- [x] Cleaned project: removed 46 unused shadcn/UI components, Lovable configs, legacy vanilla JS frontend, Supabase integration, repomix dump

---

## 6. WHAT STILL NEEDS TO BE DONE

### Immediate Priority
1. **Install dependencies**: Run `npm install` (the node_modules may be stale after cleanup)
2. **Get free Gemini API key**: Go to https://aistudio.google.com/app/apikey → paste into `.env`
3. **Test frontend**: `npm run dev:frontend` → visit localhost
4. **Test backend**: `npm run dev:backend` → hit `POST http://localhost:5001/api/discover`

### Phase 3: Database Integration
- [ ] Set up Supabase (or any PostgreSQL) and run migration
- [ ] Replace the static `src/data/` imports with API calls to the backend
- [ ] Backend should persist discovered hackathons to the database
- [ ] Frontend should fetch from `/api/hackathons` instead of importing static TypeScript arrays

### Phase 4: Detail Pages & Polish
- [ ] Implement `src/routes/competition.$slug.tsx` (competition detail page)
- [ ] Add bookmarking / favorites functionality
- [ ] Add calendar view (FullCalendar or similar)
- [ ] Build admin panel for manual competition entry
- [ ] Add email/push notification for deadline reminders

### Phase 5: Deployment
- [ ] Deploy frontend to Vercel or Cloudflare Pages
- [ ] Deploy backend to Railway or Render
- [ ] Set up CI/CD for automated deploys on push
- [ ] Configure production cron jobs

### Phase 6: Mobile App
- [ ] Convert to React Native or build a PWA
- [ ] Push notification support

---

## 7. HOW TO RUN LOCALLY

```bash
# Terminal 1: Frontend
cd ~/Downloads/Hackathon-tracker
npm install
npm run dev:frontend
# Opens at http://localhost:5173

# Terminal 2: Backend
npm run dev:backend
# API at http://localhost:5001

# Or run both together:
npm run dev
```

---

## 8. KEY DESIGN DECISIONS

1. **Why React + TanStack instead of Vanilla JS?** — The original prototype was vanilla JS. We migrated to React for scalability, type safety, and component reuse. TanStack Router gives file-based routing with SSR capability.

2. **Why static seed data instead of database?** — The 95 competitions are baked into TypeScript for instant load and zero-config startup. The plan is to migrate to a database in Phase 3 while keeping the seeds as fallback.

3. **Why DuckDuckGo + Gemini instead of a paid search API?** — User has no budget for paid APIs. DuckDuckGo's HTML interface can be scraped for free. Google Gemini's free tier gives 1,500 requests/day which is more than enough for a daily cron job.

4. **Why dark hacker aesthetic?** — User's explicit design preference. IBM Plex Mono + Syne fonts, `#07090f` background, `#00e5a0` accent green, subtle grid overlay.

5. **Rarity Score system** — Each competition has a 1–10 rarity score. Scores ≥ 7 are "Hidden Gems" featured prominently. This helps users find low-competition, high-reward opportunities.

---

## 9. API REFERENCE

### Backend API (Express, port 5001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hackathons` | List all hackathons (supports `?filter=`, `?search=`, `?page=`, `?limit=`) |
| GET | `/api/hackathons/:id` | Get single hackathon by ID |
| POST | `/api/hackathons` | Add/update a hackathon |
| DELETE | `/api/hackathons/:id` | Delete a hackathon |
| POST | `/api/hackathons/refresh` | Trigger platform scrapers |
| POST | `/api/discover` | Trigger AI Web Discovery Engine |
| GET | `/api/health` | Health check |

---

## 10. IMPORTANT FILE DETAILS

### `src/data/index.ts` — The data hub
Merges all 4 competition files and exports utility functions:
- `ALL_COMPETITIONS` — full array (95 items)
- `getHiddenGems(limit)` — competitions with rarityScore ≥ 7
- `getUpcomingDeadlines(limit)` — sorted by nearest deadline
- `getFreshlyOpened(limit)` — 2026-specific open competitions
- `getStats()` — { totalCompetitions, activeNow, totalBountyUsd, platformsTracked, hiddenGems }
- `filterCompetitions(competitions, filters)` — multi-dimensional filtering + sorting

### `src/lib/constants.ts` — The source of truth
Contains the full taxonomy: all valid values for SkillDomain, EffortLevel, Difficulty, CompetitionDensity, AIPolicy, RecurrenceCategory, CareerOutcome, and a 50+ entry PLATFORM_REGISTRY.

### `backend/adapters/base.js` — Scraper framework
All platform adapters extend BaseAdapter which provides: retry logic, rate limiting, HTTP helpers, slug generation, prize parsing, difficulty estimation.

---

## 11. COMPETITION COVERAGE

The seed database covers these categories:

| Category | Count | Examples |
|----------|-------|---------|
| 2026 Specific | 19 | Goldman Sachs, ARC Prize, NVIDIA Nemotron, Gemma 4 Good |
| Daily Bounties | 7 | Topcoder, Algora, Polar.sh, Immunefi, HackerOne |
| Weekly | 7 | MLH, Kaggle, Codeforces, LeetCode, Numerai |
| Monthly | 13 | Lablab.ai, Zindi, AIcrowd, DrivenData, Devfolio |
| Annual | 18 | SIH, NASA Space Apps, MIT Battlecode, XPRIZE, DARPA |
| Always Open | 15 | Solafune, EvalAI, CodaLab, HeroX, Quantiacs |
| Aggregators | 5 | Devpost, MLContests, HackerRank, Startup Grants India |

Platforms tracked: Kaggle, Devpost, Unstop, Devfolio, HackerEarth, MLH, AIcrowd, Zindi, DrivenData, Topcoder, Numerai, WorldQuant, and 30+ more.

---

## 12. STRATEGIC ROADMAP (The "Living Intelligence" Vision)

The ultimate goal is to transition from a static directory to a "Living Intelligence System." The following feature roadmap outlines the long-term vision provided by the project's strategic planning:

### A. Core Intelligence & Status Engine
- [ ] **Live Status Intelligence:** Track Registration Open/Closed, submission countdowns, and active participants.
- [ ] **Change Tracking & News Feed:** Detect when deadlines extend or prizes change, and show a timeline of updates.
- [ ] **Validity Layer / Automatic Archiving:** Auto-check link availability, disable dead links, and preserve historical data for analytics.

### B. Strategic Categorization
- [ ] **Skill Domain Tags:** AI/ML, Reinforcement Learning, Robotics, Quant, Web3, etc.
- [ ] **Career Outcome Tags:** Cash, Internships, Hiring, Research Visibility, etc.
- [ ] **Effort Required:** 2-hour sprint vs. multi-month research.
- [ ] **Competition Density & Difficulty:** Low competition, overcrowded, beginner, elite, research-level.

### C. Advanced Discovery & Scraping
- [ ] **Platform Adapters:** Build specific API/data adapters for platforms like Devfolio, Unstop, and MLH (Devpost and Kaggle are already done).
- [ ] **New Discovery Pipelines:** Monitor Reddit, Discord, Twitter, LinkedIn, GitHub trending, and HuggingFace.
- [ ] **Missing Competitions:** Add the remaining ~6 competitions from the user's 101-item v3.0 master list (currently 95 are seeded in `src/data/`).

### D. User Experience & Engagement
- [ ] **Personalization Engine:** Recommend hackathons based on user profiles (e.g., beginner in quant, prefers remote, weekends only).
- [ ] **Trust Score:** Rate competitions on organizer credibility, payout history, and sponsor legitimacy.
- [ ] **Team Formation Ecosystem:** Add features to find teammates by timezone, skill tag, or university.
- [ ] **Notifications:** Email, Discord, Telegram, or WhatsApp alerts for deadlines and new opportunities.
- [ ] **Past Winning Projects:** Archive and display top projects, repos, and tech stacks for inspiration.

### E. Execution Phasing
- **Phase 1 (Done):** Static curated directory.
- **Phase 2 (In Progress):** Live updating platform (scrapers & database).
- **Phase 3:** Personalized recommendation engine.
- **Phase 4:** Team formation ecosystem.
- **Phase 5:** Autonomous AI agent for discovery.
