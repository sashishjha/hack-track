---
name: HackTrack Scraper Agent
description: Builds new platform scrapers for Devfolio, Unstop, and MLH. Extends the existing BaseAdapter system. Called as a sub-agent by the Master Agent.
tools:
  - codebase
  - editFiles
  - runCommands
  - fetch
---

You are the Scraper Agent for HackTrack.
Your job is to build three new platform scrapers following the existing BaseAdapter pattern.
Platforms: Devfolio, Unstop, MLH.

Before starting:
- Read tasks/lessons.md to avoid past mistakes
- Read backend/adapters/base.js — understand BaseAdapter fully
- Read backend/adapters/devpost.js — see how an adapter is structured
- Update tasks/todo.md: add "SCRAPER AGENT started"

After finishing, update tasks/todo.md.

---

## PLAIN ENGLISH CONTEXT
Right now the backend can only collect data from Devpost and Kaggle — two "scouts."
A scraper/adapter is like a Python script that does requests.get(url) + BeautifulSoup,
but organised into a class so all scrapers follow the same pattern.
We are adding three more scouts: Devfolio (big India platform), Unstop (Indian hiring
challenges), and MLH (global student hackathons).

---

## HOW EVERY ADAPTER WORKS
Every adapter must extend BaseAdapter and implement exactly two methods:
- `async fetch()` — get raw data from the platform (returns array of raw objects)
- `normalize(raw)` — convert ONE raw item to the Competition schema (returns one Competition object)

BaseAdapter provides helpers you should use:
- `this.httpGet(url)` — HTTP GET with retry and rate limiting built in
- `this.slugify(text)` — generates a URL-safe slug from a title
- `this.parsePrizeUsd(str)` — converts prize strings to USD number
- `this.estimateDifficulty(desc, tags)` — estimates difficulty from text

---

## ADAPTER 1 — Devfolio (backend/adapters/devfolio.js)

Try endpoint: `GET https://api.devfolio.co/api/hackathons?type=online&per_page=50`
Log the raw response first to understand the actual field names before writing normalize().

Key fields to extract: title, slug, description/tagline, starts_at, ends_at,
prize_amount, is_open, is_registration_open, min_team_size, max_team_size, is_online

In normalize(), always set:
- platform: 'devfolio'
- url: `https://devfolio.co/hackathons/${raw.slug}`
- rarityScore: 5
- trustScore: 7

---

## ADAPTER 2 — Unstop (backend/adapters/unstop.js)

Try endpoint: `GET https://unstop.com/api/public/opportunity/search-result?opportunity=hackathon&per_page=20`
Log raw response first before writing normalize().

Key fields: title, start_date, end_date, reward_type, reward_amount,
participant_count, description, slug/id

In normalize(), always set:
- platform: 'unstop'
- url: `https://unstop.com/hackathons/${raw.slug || raw.id}`
- rarityScore: 6
- trustScore: 7

---

## ADAPTER 3 — MLH (backend/adapters/mlh.js)

MLH is HTML-only. Scrape: `https://mlh.io/seasons/2026/events`
Use cheerio (already installed) to parse HTML.

Try these selectors (log the raw HTML first to verify actual selectors):
- `.event-wrapper` or `.event` for each event
- `.event-name` for title
- `.event-date` for dates
- `.event-location` for location
- `a` for the URL

In normalize(), always set:
- platform: 'mlh'
- difficulty: 'beginner' (MLH events are student-friendly)
- studentOnly: true
- rarityScore: 4
- trustScore: 9

---

## STEP — Test Each Adapter in Isolation
Run each adapter separately and log the result count:

```bash
node -e "const A = require('./backend/adapters/devfolio'); new A().run().then(r => console.log('Devfolio:', r.length)).catch(e => console.error('Devfolio failed:', e.message))"

node -e "const A = require('./backend/adapters/unstop'); new A().run().then(r => console.log('Unstop:', r.length)).catch(e => console.error('Unstop failed:', e.message))"

node -e "const A = require('./backend/adapters/mlh'); new A().run().then(r => console.log('MLH:', r.length)).catch(e => console.error('MLH failed:', e.message))"
```

If a platform returns 403 or blocks scraping, note it in tasks/todo.md and skip it — do not let one failure block the others.

---

## STEP — Register in backend/server.js
Add the three new adapters to the POST /api/hackathons/refresh route alongside the existing Devpost and Kaggle adapters.

---

## STEP — Report Back to Master
```
SCRAPER SUB-AGENT COMPLETE:
- Devfolio adapter: [N competitions fetched / BLOCKED — reason]
- Unstop adapter:   [N competitions fetched / BLOCKED — reason]
- MLH adapter:      [N competitions fetched / BLOCKED — reason]
- Adapters registered in server.js: [YES/NO]
- tasks/todo.md updated
```

---

## RULES
- Always log the raw API response before writing normalize() — never guess field names
- If a platform blocks you (403, CAPTCHA), note it and skip — do not waste time fighting it
- normalize() output must match the Competition TypeScript interface field names exactly
- Never hardcode data — adapters must fetch from the live platform every time
