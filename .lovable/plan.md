# HackTrack — Vibrant Poster Grid Restyle

You picked the **Vibrant poster grid** direction: warm cream background, coral primary, big Bebas Neue display type with Playfair Display italics, neo-brutalist hard borders + offset shadows, mono accents.

## What I'll change

Pure visual restyle of the React frontend. No backend, scraper, or data-shape changes.

### 1. `src/styles.css` — new design tokens
Replace the current oklch palette with the picked direction's tokens:
- `--background: hsl(45 35% 98%)` (warm cream)
- `--foreground: hsl(20 20% 12%)` (near-black ink)
- `--primary: hsl(15 90% 58%)` (coral)
- `--secondary: hsl(195 85% 42%)` (teal)
- `--accent: hsl(48 95% 55%)` (yellow)
- `--muted-foreground: hsl(20 10% 45%)`
- `--border: hsl(20 20% 12% / 0.12)`

Add font tokens (`--font-display: 'Bebas Neue'`, `--font-serif: 'Playfair Display'`, `--font-mono: 'JetBrains Mono'`, body `Inter`) and a global `entrance` keyframe + `.animate-in` utility.

### 2. `src/routes/__root.tsx`
- Add Google Fonts `<link>` tags (Bebas Neue, Inter, JetBrains Mono, Playfair Display italic) into `head().links`.
- Update `<title>` and meta description to `HackTrack — Live Hackathon Tracker`.

### 3. `src/routes/index.tsx` — replace placeholder with the real homepage
Build the picked layout:
- **Sticky nav**: rotated coral `H` logo tile + "HackTrack" wordmark, live-sync indicator (green pulse + mono timestamp), pill REFRESH button.
- **Hero**: huge centered headline `THE global HACKATHON COLLECTIVE` (Bebas Neue + Playfair italic for "global"), supporting tagline, search input with hard black border + offset shadow and `CMD + K` chip.
- **Filter row**: pill chips — ALL PLATFORMS (active coral) / KAGGLE / DEVPOST / UNSTOP / ZINDI / AICROWD.
- **Card grid** (3-col responsive): white cards with 2px ink border + 4px offset shadow, hover lifts to 12px colored shadow. Each card shows platform tag, deadline/status, display-font title, image area, mono tag chips, prize pool, circular `→` CTA.
- **Footer**: stats row (Active Hackathons / Total Bounty / Platforms) + "Stay hungry, keep building." italic + back-to-top circle.

Cards will be rendered from a small typed array so when you wire the backend later the props already match (`platform`, `title`, `prize`, `deadline`, `status`, `tags`, `image`).

### 4. Card images
The prototype has 3 image placeholders. I'll generate them with `imagegen`:
- vibrant abstract geometric pattern (teal/orange)
- soft isometric city illustration (warm pastels)
- minimalist robot arm diagram (warm bg)

Saved to `src/assets/` and imported as ES6 modules.

## Out of scope (separate tasks if you want them later)
- Wiring your Express backend / scraper into TanStack Start
- Real countdown timers
- Card detail pages, auth, database
- Migrating the original `public/` + `backend/` Node project structure

## After you approve
I'll switch to build mode and do all of the above in one pass, then you can preview and we iterate.