---
name: HackTrack Backend Agent
description: Connects the Express backend to Supabase. Rewrites hackathons.js routes to use real database queries. Called as a sub-agent by the Master Agent.
tools:
  - codebase
  - editFiles
  - runCommands
  - problems
---

# BACKEND AGENT — Wire Express to Supabase

Your job: Replace the flat JSON file storage in the Express backend with real Supabase queries.

---

## SAFETY RULES — READ FIRST, NEVER VIOLATE
- NEVER run rm, rmdir, or any command that deletes files or folders
- NEVER touch .git/ folder
- NEVER run git push or git commit
- NEVER print or expose values from .env
- NEVER install global npm packages
- Files you MAY edit: backend/routes/hackathons.js, backend/server.js, backend/discovery/llm_extractor.js
- Files you must NOT touch: src/ folder (frontend), .env (read only), package.json (read only)
- ONLY work inside ~/Downloads/Hackathon-tracker/
- If unsure whether an action is safe: STOP and tell Sashish

---

## PLAIN ENGLISH CONTEXT
The backend is like a restaurant kitchen. Right now it keeps its inventory
in a handwritten paper notebook (a flat JSON file). We are replacing that
notebook with a proper computer inventory system (Supabase database).
The menu (the API endpoints) stays exactly the same — only the storage changes.

---

## PRE-CHECKS BEFORE STARTING
1. Read tasks/lessons.md — avoid past mistakes
2. Verify backend/db/supabase.js exists — if it does not, STOP and tell Sashish the Database Agent must run first
3. Test connection: `node -e "require('./backend/db/supabase.js'); console.log('OK')"` — must print OK
4. Read the current backend/routes/hackathons.js in full before changing anything
5. Run `npm run build` — note if it passes before you start making changes

---

## STEP 1 — Rewrite backend/routes/hackathons.js

Replace all readHackathons/writeHackathons file operations with Supabase queries.
Keep the exact same URL paths and response shapes so the frontend does not break.

### GET /api/hackathons
```javascript
const { supabase } = require('../db/supabase');

router.get('/', async (req, res) => {
  try {
    let query = supabase.from('competitions').select('*');
    if (req.query.search) query = query.ilike('title', `%${req.query.search}%`);
    if (req.query.platform) query = query.eq('platform', req.query.platform);
    if (req.query.difficulty) query = query.eq('difficulty', req.query.difficulty);
    if (req.query.category) query = query.eq('recurrence_category', req.query.category);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    query = query.range((page - 1) * limit, page * limit - 1);
    query = query.order('submission_deadline', { ascending: true, nullsFirst: false });
    const { data, error } = await query;
    if (error) throw error;
    res.json({ hackathons: data, page, limit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### GET /api/hackathons/:id
```javascript
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('competitions').select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### POST /api/hackathons
```javascript
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('competitions').upsert(req.body, { onConflict: 'id' }).select();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### DELETE /api/hackathons/:id
```javascript
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('competitions').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

## STEP 2 — Update AI Discovery to Save to Database
In backend/discovery/llm_extractor.js, after a competition is extracted:
- Require the supabase client
- Save the extracted competition to the competitions table
- Add a field: source: 'ai_discovered'

---

## STEP 3 — Test Every Endpoint
Start the backend: `npm run dev:backend`
In a separate test, run:
```bash
curl http://localhost:5001/api/health
curl http://localhost:5001/api/hackathons
```
Both must return valid JSON. If either fails, fix the error before proceeding.

---

## STEP 4 — Report Back to Master
Update tasks/todo.md, then report:

```
BACKEND SUB-AGENT COMPLETE:
- GET /api/hackathons: [WORKING/FAILED]
- GET /api/hackathons/:id: [WORKING/FAILED]
- POST /api/hackathons: [WORKING/FAILED]
- DELETE /api/hackathons/:id: [WORKING/FAILED]
- AI Discovery saves to database: [YES/NO]
- tasks/todo.md updated
```
