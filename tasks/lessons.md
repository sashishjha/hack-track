# HackTrack — Lessons Log
# Every time an agent makes a mistake or gets corrected, it logs it here.
# Future agents read this before starting to avoid repeating the same errors.

---

## FORMAT FOR NEW ENTRIES
### [LESSON TITLE]
- **Context:** What was being worked on
- **Mistake:** What went wrong
- **Rule:** The rule to follow to avoid this next time
- **Date:** When this happened

---

## LESSONS

### TypeScript vs JavaScript — Do Not Mix
- **Context:** Backend is JavaScript, frontend is TypeScript
- **Mistake:** Attempting to import TypeScript files directly in Node.js backend scripts
- **Rule:** Backend (backend/) uses plain JavaScript with require(). Frontend (src/) uses TypeScript with import. Never use `require()` in src/, never use `import` ES module syntax in backend/ unless configured.
- **Date:** May 17, 2026

### Static Data Files Are Backup — Do Not Delete
- **Context:** Replacing static data with database
- **Mistake:** Removing src/data/ files when moving to database
- **Rule:** Keep src/data/ files permanently as fallback. The useCompetitions hook tries API first, falls back to static. Never delete the static files.
- **Date:** May 17, 2026

### Supabase Setup Requires Manual Steps
- **Context:** Database agent tried to automate Supabase account creation
- **Mistake:** Cannot automate account creation — requires human to visit supabase.com
- **Rule:** Always pause and give Sashish explicit manual instructions for: Supabase account creation, copying API keys to .env, running SQL in Supabase dashboard. These 3 steps cannot be automated.
- **Date:** May 17, 2026

---
<!-- New lessons appended below this line -->



