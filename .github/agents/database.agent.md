---
name: HackTrack Database Agent
description: Sets up Supabase database files. Creates schema, seed script, and client module. Called as a sub-agent by the Master Agent. Does NOT handle account creation (Master does that).
tools:
  - codebase
  - editFiles
  - runCommands
---

# DATABASE AGENT — Supabase File Setup

Your job: Create the database files for HackTrack.
You are called as a SUB-AGENT by the Master Agent.
The Master Agent has ALREADY guided Sashish through creating a Supabase account
and adding SUPABASE_URL + SUPABASE_KEY to .env. Do NOT repeat those instructions.

---

## SAFETY RULES — READ FIRST, NEVER VIOLATE
- NEVER run rm, rmdir, or any command that deletes files or folders
- NEVER touch .git/ folder
- NEVER run git push or git commit
- NEVER print or expose values from the .env file
- NEVER install global npm packages (no npm install -g)
- ONLY create NEW files in: backend/db/ — do not overwrite existing backend files
- The ONLY existing file you may modify is: package.json (to add db:seed script)
- ONLY work inside ~/Downloads/Hackathon-tracker/
- If you are unsure whether an action is safe: STOP and report back

---

## PRE-CHECKS
1. Read tasks/lessons.md — understand past mistakes
2. Read src/lib/types.ts — memorise every field in the Competition interface
3. Check if backend/db/ folder already exists — if yes, read what is in it

---

## STEP 1 — Install Supabase Client
Run: `npm install @supabase/supabase-js`
Verify it was added to dependencies in package.json.

---

## STEP 2 — Create backend/db/supabase.js
Create this file exactly:

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_KEY in .env file.\n' +
    'Ask the Master Agent for setup instructions.'
  );
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = { supabase };
```

Test it runs without error: `node -e "require('./backend/db/supabase.js'); console.log('Connection OK')"`

---

## STEP 3 — Create backend/db/schema.sql
Create the SQL file that defines the competitions table.
Map EVERY field from the Competition TypeScript interface in src/lib/types.ts to a SQL column.

Required columns (map camelCase TypeScript → snake_case SQL):
- id TEXT PRIMARY KEY
- slug TEXT UNIQUE NOT NULL
- title TEXT NOT NULL
- platform TEXT NOT NULL
- organizer TEXT
- description TEXT
- url TEXT NOT NULL
- status TEXT DEFAULT 'unknown'
- registration_status TEXT DEFAULT 'unknown'
- submission_deadline TIMESTAMPTZ
- registration_deadline TIMESTAMPTZ
- start_date TIMESTAMPTZ
- end_date TIMESTAMPTZ
- prize_pool_usd INTEGER
- prize_display TEXT NOT NULL DEFAULT ''
- participants_estimate TEXT
- team_size_min INTEGER DEFAULT 1
- team_size_max INTEGER
- skill_domains TEXT[] DEFAULT '{}'
- career_outcomes TEXT[] DEFAULT '{}'
- effort_level TEXT
- difficulty TEXT
- competition_density TEXT
- recurrence_category TEXT
- ai_policy TEXT
- api_credits_included BOOLEAN DEFAULT false
- gpu_credits_included BOOLEAN DEFAULT false
- mode TEXT DEFAULT 'remote'
- country_restrictions TEXT[]
- student_only BOOLEAN DEFAULT false
- team_type TEXT DEFAULT 'both'
- hardware_required BOOLEAN DEFAULT false
- rarity_score INTEGER
- trust_score INTEGER
- recruiter_visibility INTEGER
- resume_value INTEGER
- beginner_friendly_score INTEGER
- tags TEXT[] DEFAULT '{}'
- recurrence TEXT
- validity TEXT DEFAULT 'active'
- source TEXT DEFAULT 'seed'
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()

Also add:
- Enable Row Level Security (RLS)
- Policy: allow public SELECT (anon role can read)
- Policy: allow authenticated INSERT, UPDATE, DELETE

---

## STEP 4 — Create backend/db/seed.js
This script reads all competition data from src/data/ files and inserts into Supabase.

Important: Node.js cannot import TypeScript files directly. You must extract the raw
competition data by reading the TypeScript files and converting the objects to plain JavaScript.

The seed script must:
1. Require @supabase/supabase-js and dotenv
2. Define all 95 competitions as plain JavaScript objects (extracted from the TypeScript data files)
3. Convert every camelCase field name to snake_case before inserting
4. Use supabase.from('competitions').upsert() with onConflict: 'id'
5. Log progress: "Seeding [N]/95: [title]"
6. Log final result: total inserted, any errors

Add this to package.json scripts section:
"db:seed": "node backend/db/seed.js"

---

## STEP 5 — Report Back to Master
Do NOT run the seed script — the Master Agent will do that after Sashish runs the SQL.

Report what you created:
```
DATABASE SUB-AGENT COMPLETE:
- Created: backend/db/supabase.js (client module)
- Created: backend/db/schema.sql (table definition with [N] columns)
- Created: backend/db/seed.js (seeds 95 competitions)
- Installed: @supabase/supabase-js
- Connection test: [PASSED/FAILED]
- Files ready for Master to proceed with SQL execution and seeding.
```
