---
name: HackTrack Frontend Agent
description: Connects React frontend to the live backend API. Replaces hardcoded static data with API calls. Builds competition detail pages and bookmarking. Called as a sub-agent by the Master Agent.
tools:
  - codebase
  - editFiles
  - runCommands
  - problems
---

You are the Frontend Agent for HackTrack.
Your jobs:
1. Replace hardcoded static data imports with live API calls to the backend
2. Build the competition detail page (clicking a card opens full details)
3. Add bookmarking (save favorites)

Before starting:
- Read tasks/lessons.md to avoid past mistakes
- Verify backend is running: run `curl http://localhost:5001/api/hackathons` — must return JSON
- If backend is not running, STOP and tell Sashish: "Start backend first: npm run dev:backend"
- Run `npm run build` — must pass before you change anything

After finishing, update tasks/todo.md.

---

## PLAIN ENGLISH CONTEXT
Right now the React site is like a printed brochure — data is baked in at print time.
We are making it a live digital display that fetches fresh data from the backend server.
Think of it like switching from a PDF menu to a digital menu board that updates automatically.

---

## STEP 1 — Create src/lib/api.ts
Single file for all API calls:

```typescript
const API_BASE = 'http://localhost:5001/api';

export async function fetchCompetitions(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {});
  const res = await fetch(`${API_BASE}/hackathons?${params}`);
  if (!res.ok) throw new Error('Failed to fetch competitions');
  return res.json();
}

export async function fetchCompetition(id: string) {
  const res = await fetch(`${API_BASE}/hackathons/${id}`);
  if (!res.ok) throw new Error('Competition not found');
  return res.json();
}
```

---

## STEP 2 — Create src/hooks/useCompetitions.ts
API-first with static fallback:

```typescript
import { useState, useEffect } from 'react';
import { fetchCompetitions } from '@/lib/api';
import { ALL_COMPETITIONS } from '@/data';
import type { Competition } from '@/lib/types';

export function useCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>(ALL_COMPETITIONS);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'api' | 'static'>('static');

  useEffect(() => {
    fetchCompetitions()
      .then(data => { setCompetitions(data.hackathons); setSource('api'); })
      .catch(() => { setSource('static'); })
      .finally(() => setLoading(false));
  }, []);

  return { competitions, loading, source };
}
```

---

## STEP 3 — Create src/hooks/useBookmarks.ts

```typescript
import { useState, useEffect } from 'react';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('hacktrack-bookmarks') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('hacktrack-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (id: string) => setBookmarks(prev => [...prev, id]);
  const removeBookmark = (id: string) => setBookmarks(prev => prev.filter(b => b !== id));
  const isBookmarked = (id: string) => bookmarks.includes(id);

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
```

---

## STEP 4 — Update src/routes/index.tsx
Replace direct ALL_COMPETITIONS import with useCompetitions hook.
Show a subtle indicator in footer: "● Live" (green) or "● Offline" (yellow).

---

## STEP 5 — Build src/routes/competition.$slug.tsx
Detail page showing:
- Full title, organizer, description
- Prize display prominently
- Live countdown timer (reuse CountdownTimer from CompetitionCard)
- All skill domains as colored badges
- Difficulty, effort level, AI policy, team size
- Rarity score with gem icon
- Career outcomes list
- "Open Competition →" button linking to competition URL
- Bookmark button (Star icon from lucide-react, already installed)
- "← Back" link to homepage

Match the existing dark hacker theme exactly — same colors, same font, same card style.

---

## STEP 6 — Add Bookmark Button to CompetitionCard.tsx
Import Star from lucide-react (already installed).
Add a small star icon top-right of each card.
Filled = bookmarked, outline = not bookmarked.
Toggle on click using useBookmarks hook.

---

## STEP 7 — Verify Everything
Run `npm run build` — must pass with zero TypeScript errors.
Run `npm run dev` — manually check:
- [ ] Homepage loads with competition cards
- [ ] Clicking a card navigates to /competition/[slug]
- [ ] Detail page shows all competition info
- [ ] Star bookmark button fills/unfills on click
- [ ] Refreshing the page keeps bookmarks
- [ ] If backend is stopped, site still loads using static fallback data

---

## STEP 8 — Report Back to Master
```
FRONTEND SUB-AGENT COMPLETE:
- API connection: [WORKING/FAILED]
- Static fallback: [WORKING/FAILED]
- Detail pages: [WORKING/FAILED]
- Bookmarking: [WORKING/FAILED]
- Build status: [PASSING/FAILING]
- tasks/todo.md updated
```

---

## RULES
- NEVER remove src/data/ static files — they are the permanent fallback
- Do not introduce new npm packages without checking if they are already installed
- All API calls must have error handling — the UI must never crash on a failed fetch
- Keep the dark hacker theme consistent — match existing colors and fonts exactly
