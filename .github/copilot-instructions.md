# HackTrack — Global Copilot Instructions
# Copilot reads this file automatically for every conversation in this repo.

## THE PROJECT
HackTrack is a Global Competition Intelligence Platform.
Tracks 95+ hackathons, competitions, and bounty platforms.
- Frontend: React 19 + TanStack Router + Tailwind CSS v4 (TypeScript)
- Backend: Node.js + Express (JavaScript)
- AI Discovery: DuckDuckGo + Google Gemini 1.5 Flash (free tier)
- Build tool: Vite 7

## THE USER
Sashish is a Robotics & AI student at IISc Bengaluru.
He is a COMPLETE BEGINNER at web development — zero React, Node.js, or TypeScript experience.
He is strong in Python, C, control theory, and ML.

ALWAYS:
- Explain every change in plain English before making it
- Use analogies from Python, robotics, or embedded systems
- Say WHY a change is needed, not just WHAT it does
- Never assume web dev knowledge

## CURRENT STATE
✅ Done: Full React frontend, 95 competitions seeded in src/data/, Express backend,
         Devpost + Kaggle scrapers, AI discovery engine, build passes with zero errors

❌ Not done: No database (data is hardcoded), no detail pages, not deployed (intentional)

## TASK PRIORITY
1. Database setup (Supabase free tier) — MOST CRITICAL, everything else blocked on this
2. Connect backend to database
3. Connect frontend to API instead of static imports
4. Competition detail page
5. Bookmarking
6. More scrapers (Devfolio, Unstop, MLH)

## KEY FILES
- src/lib/types.ts              → Competition interface (25+ fields)
- src/data/index.ts             → Merges all 95 competitions + filter utilities
- backend/server.js             → Express API + cron scheduler
- backend/routes/hackathons.js  → API endpoints
- .env                          → API keys — NEVER print values from this file
- tasks/todo.md                 → Live task tracker — all agents update this
- tasks/lessons.md              → Mistake log — all agents read this before starting

## GLOBAL SAFETY RULES — APPLY TO EVERY AGENT
- NEVER run rm -rf, rmdir, or any command that deletes files or folders
- NEVER touch the .git/ folder under any circumstances
- NEVER run git push, git commit, or any git write command
- NEVER print or expose values from the .env file
- NEVER install global npm packages (no npm install -g anything)
- NEVER modify files outside ~/Downloads/Hackathon-tracker/
- If unsure whether an action is safe: STOP and ask Sashish first
