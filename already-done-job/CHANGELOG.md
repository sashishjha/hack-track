# HackTrack — Changelog

All notable work completed on this project, in chronological order.

---

## Session 1 (May 16, 2026 — Morning)
**AI Used:** Gemini (via Google Antigravity IDE)

### What was done:
1. **Analyzed the original prototype** — A vanilla JS (public/index.html) hackathon tracker with a Node.js/Express backend. It had a beautiful dark hacker aesthetic but was static with only 3 sample hackathons.
2. **Designed the new architecture** — Decided to keep the dark theme but migrate to React + TanStack Router for scalability. Chose Tailwind v4 for styling.
3. **Created the type system** (`src/lib/types.ts`) — 25+ field Competition interface with intelligence scores (rarity, trust), categorization (skill domains, career outcomes), and metadata.
4. **Created constants** (`src/lib/constants.ts`) — Full taxonomy with 50+ platform registry, all valid enum values.
5. **Seeded 90 competitions** across 3 files (`src/data/competitions*.ts`) — Covering 2026-specific, daily, weekly, monthly, annual, and always-open categories.
6. **Built 5 React components**:
   - `CompetitionCard.tsx` — Rich card with live countdown, category-colored badges
   - `FilterBar.tsx` — Multi-dimensional filter (platform, skill, difficulty, effort, AI policy)
   - `HeroSection.tsx` — Premium hero with live stats
   - `CountdownCards.tsx` — Urgent deadline section
   - `HiddenGems.tsx` — High-rarity competition showcase
7. **Built the homepage** (`src/routes/index.tsx`) — Nav + Hero + Countdowns + Hidden Gems + Filter + Card Grid + Footer
8. **Updated root layout** (`src/routes/__root.tsx`) — Meta tags, IBM Plex Mono + Syne fonts
9. **Implemented styles** (`src/styles.css`) — Dark hacker theme with grid overlay, glassmorphism, badge system
10. **Built backend adapters** — BaseAdapter class, Devpost adapter, Kaggle adapter

### Blockers encountered:
- `EPERM` port permission issue prevented testing `npm run dev` locally

---

## Session 2 (May 16, 2026 — Afternoon/Evening)
**AI Used:** Gemini (via Google Antigravity IDE)

### What was done:
1. **User provided 101-competition master list** in `extra_competitions.txt` (34KB)
2. **Parsed the list and added 5 remaining unique entries** → `src/data/competitions-part4.ts` (IDs 91–95: HackerRank, Startup Grants India, Where U Elevate, Halite, MLH Discord)
3. **Built the AI Web Discovery Engine** (zero-cost):
   - `backend/discovery/search_crawler.js` — DuckDuckGo HTML scraping for trending hackathon URLs
   - `backend/discovery/llm_extractor.js` — Google Gemini 1.5 Flash to extract competition data from raw page text
4. **Set up cron scheduling** — node-cron in server.js, daily at midnight
5. **Created manual trigger** — `POST /api/discover` endpoint
6. **Production build verified** — `npm run build` passes with zero errors

---

## Session 3 (May 17, 2026)
**AI Used:** Claude Opus 4.6 (via Google Antigravity IDE)

### What was done:
1. **Major cleanup** — Removed all unnecessary files accumulated from multiple tools:
   - **Deleted**: `.lovable/` directory (Lovable IDE configs, plan.md)
   - **Deleted**: `.wrangler/` (Cloudflare deploy artifacts)
   - **Deleted**: `dist/` (stale build output)
   - **Deleted**: 46 unused shadcn/Radix UI components (`src/components/ui/`)
   - **Deleted**: `src/hooks/use-mobile.tsx` (unused)
   - **Deleted**: `src/integrations/supabase/` (5 files — unused Supabase auth/client)
   - **Deleted**: `src/assets/` (3 placeholder images from Lovable)
   - **Deleted**: `src/lib/error-capture.ts`, `src/lib/error-page.ts` (unused)
   - **Deleted**: `src/lib/extra_competitions.txt` (already parsed into code)
   - **Deleted**: `public/index.html` (69KB vanilla JS prototype — aesthetics already in React)
   - **Deleted**: `public/js/` (api.js, main.js, filters.js — legacy vanilla JS)
   - **Deleted**: `data/hackathons.json` (legacy 3-item sample data)
   - **Deleted**: `backend/scraper.js` (legacy scraper, replaced by adapters + discovery)
   - **Deleted**: `backend/.env.example` (duplicate)
   - **Deleted**: `supabase/` directory (config.toml)
   - **Deleted**: `components.json` (shadcn config)
   - **Deleted**: 5 legacy doc files: `CHECKLIST.md`, `PROJECT_SUMMARY.txt`, `SETUP.md`, `START_HERE.md`, `ARCHITECTURE.md`
   - **Deleted**: `repomix-output.xml` (132KB code dump)
   - **Deleted**: `bun.lock`, `bunfig.toml`, `wrangler.jsonc` (Bun/Cloudflare configs)
   - **Deleted**: `.gitignore.merge-backup`, `package.json.merge-backup`
2. **Cleaned package.json** — Removed 30+ unused dependencies (all @radix-ui/*, @supabase/*, @hookform/*, cmdk, embla-carousel, input-otp, react-day-picker, react-hook-form, react-resizable-panels, recharts, sonner, vaul, zod, tw-animate-css, @lovable.dev/*). Added @google/generative-ai and node-cron.
3. **Cleaned .env** — Removed Supabase keys, added Gemini API key placeholder.
4. **Cleaned backend/server.js** — Removed static file serving and root route (React handles its own frontend).
5. **Created `already-done-job/` folder** with comprehensive handoff documentation.

### Files removed: ~80+
### Dependencies removed from package.json: ~30
### Final project file count: 38 files (down from 120+)
