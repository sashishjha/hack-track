# 🎯 HackTrack Architecture & Design Decisions

## Your Original Questions Answered

### Q1: "Is it possible to make a live hackathon tracker that fetches data from different websites?"

**Answer: YES, with a caveat about CORS**

**The Challenge:**
- Direct fetching from websites in browser JS won't work due to CORS (Cross-Origin Resource Sharing)
- Example: `fetch('https://www.kaggle.com/api/...')` will be **blocked by browser**

**The Solution:**
Build a backend server that does the fetching. Here's how:

```
Browser → API Call → Node.js Backend → Kaggle/Devpost/Unstop → Parse Data → Send back to Browser
```

This is exactly what we've built for you.

---

### Q2: "Should I use native JS or a framework?"

**Answer: We chose VANILLA JS (Your choice was perfect!)**

**Why:**
✅ Lightweight - no build step needed
✅ Responsive - pure CSS Grid and Flexbox
✅ Fast - no framework overhead
✅ Educational - see exactly what's happening
✅ Scalable - easy to add frameworks later if needed

**If you need to scale later:**
- Add React.js for complex state management
- Add Vue.js for reactive data binding
- Add TypeScript for type safety

But for now: **Vanilla JS is the right choice**. It's simpler and doesn't hide how things work.

---

### Q3: "How does the 'Update' button work to fetch data from different websites?"

**Current Implementation:**

```javascript
// 1. User clicks "🔄 Update" button
// ↓
// 2. Frontend sends POST request to backend
POST /api/hackathons/refresh
// ↓
// 3. Backend triggers scraper.js
// ↓
// 4. Scraper fetches from multiple sources:
//    - Kaggle API
//    - Devpost JSON endpoint
//    - Unstop (if implemented)
// ↓
// 5. Backend parses & aggregates data
// ↓
// 6. Saves to data/hackathons.json
// ↓
// 7. Backend returns {"success": true, "lastUpdated": "..."}
// ↓
// 8. Frontend reloads and displays new data
```

**Flow Diagram:**
```
┌─────────────┐
│  Update btn │ User clicks
└──────┬──────┘
       │ onClick
       ▼
┌──────────────────────────────┐
│ API.refreshData() [api.js]   │ Frontend initiates
└──────┬───────────────────────┘
       │ POST /api/hackathons/refresh
       ▼
┌──────────────────────────────┐
│ backend/routes/hackathons.js │ Backend receives
└──────┬───────────────────────┘
       │ Calls scraper
       ▼
┌──────────────────────────────┐
│ backend/scraper.js           │ Main logic
├──────────────────────────────┤
│ fetchFromKaggle()            │ Calls Kaggle API
│ fetchFromDevPost()           │ Calls Devpost API
│ fetchFromUnstop()            │ (Ready for scraping)
└──────┬───────────────────────┘
       │ Aggregates results
       ▼
┌──────────────────────────────┐
│ data/hackathons.json         │ Writes to storage
└──────┬───────────────────────┘
       │ Returns success
       ▼
┌──────────────────────────────┐
│ Frontend reloads data         │ UI updates
└──────────────────────────────┘
```

---

### Q4: "Should it show a timeline and add new hackathons dynamically?"

**Answer: YES - We've set it up for this!**

**What's Ready Now:**
- ✅ Cards with all hackathon metadata (name, deadline, platform, etc.)
- ✅ Dynamic card generation from data
- ✅ Filter buttons (by category/type)
- ✅ Search functionality

**What You Can Add:**
1. **Timeline View**
   - Add a calendar component showing deadlines
   - Use library like `fullcalendar.js` or build custom
   - Color-code by category

2. **Automatic Addition**
   - Already built-in! When scraper runs, new hackathons auto-add to JSON
   - Frontend doesn't need changes - just reload

3. **Auto-Update Schedule**
   - Use GitHub Actions to run scraper daily
   - Or deploy cron job on backend

---

## 🏗️ Architecture Deep Dive

### Layer 1: Frontend (Public-Facing)
```
public/index.html
    ├── CSS Grid responsive design
    ├── Dark theme with accent colors
    └── Dynamic card rendering

public/js/api.js (Module)
    └── API communication abstraction
        - getHackathons(filter, search, page, limit)
        - refreshData()
        - addHackathon(data)
        - deleteHackathon(id)
        - healthCheck()

public/js/main.js (Core App)
    ├── HackTracker class
    ├── Event listeners
    ├── Data loading & filtering
    └── UI updates

public/js/filters.js (Utilities)
    └── Advanced filtering functions
```

### Layer 2: Backend (Node.js + Express)
```
backend/server.js
    ├── Express app setup
    ├── CORS middleware
    ├── Static file serving
    └── Route mounting

backend/routes/hackathons.js (REST API)
    ├── GET /api/hackathons              → List all
    ├── GET /api/hackathons/:id          → Get one
    ├── POST /api/hackathons             → Create
    ├── DELETE /api/hackathons/:id       → Delete
    ├── POST /api/hackathons/refresh     → Trigger scrape
    └── GET /api/health                  → Check if alive

backend/scraper.js (Data Fetcher)
    ├── fetchFromKaggle()
    ├── fetchFromDevPost()
    ├── fetchFromUnstop()
    ├── transformHackathon()
    └── scrapeHackathons() [Main function]
```

### Layer 3: Data Storage
```
data/hackathons.json
    ├── hackathons array (with full details)
    ├── lastUpdated timestamp
    ├── totalCount
    ├── sourcesFetched
    └── metadata
```

---

## 🔄 Data Flow for Live Updates

### Scenario: User clicks "Update" at 2 PM

**Step 1: Frontend → Backend**
```javascript
// public/js/main.js
button.onClick → API.refreshData()
                → fetch('http://localhost:5000/api/hackathons/refresh', {method: 'POST'})
```

**Step 2: Backend Receives & Starts Scraping**
```javascript
// backend/routes/hackathons.js
POST /hackathons/refresh
→ require('./scraper.js').scrapeHackathons()
→ Calls fetchFromKaggle(), fetchFromDevPost(), etc.
```

**Step 3: Scraper Fetches from Sources**
```javascript
// backend/scraper.js
fetchFromKaggle()
  → axios.get('https://www.kaggle.com/api/v1/competitions/list')
  → Returns array of competitions
  
transformHackathon() → Converts to standard format
  {
    id: 'hack_kaggle_123',
    name: 'Competition Name',
    category: 'open',
    deadline: '2026-06-30T23:59:59Z',
    prizeRange: '$50,000',
    url: 'https://...',
    aiAllowed: true,
    ...
  }
```

**Step 4: Save & Respond**
```javascript
fs.writeFileSync('data/hackathons.json', JSON.stringify(merged), 'utf8')
res.json({ success: true, lastUpdated: new Date() })
```

**Step 5: Frontend Updates UI**
```javascript
// public/js/main.js
→ Receives success response
→ Calls loadHackathons() again
→ Cards re-render with new data
→ Stats update
→ "Updating..." button returns to normal
```

---

## 🎯 How Remote Hackathons Are Detected

Currently: Manual tagging in data
```json
{
  "remote": true,          // Boolean flag
  "url": "https://...",    // Link to event
  "platform": "Devpost"    // Source platform
}
```

**How to Auto-Detect:**
```javascript
// In scraper.js - check multiple signals
function isRemote(hackathon) {
  return (
    hackathon.location === 'Virtual' ||
    hackathon.location === 'Online' ||
    hackathon.format.includes('remote') ||
    hackathon.format.includes('virtual') ||
    !hackathon.location // If no location = likely virtual
  )
}
```

---

## 🌐 Multi-Source Integration (Scalable Design)

The architecture is designed to add sources easily:

```javascript
// backend/scraper.js - To add a new source:

async function fetchFromNewPlatform() {
  try {
    console.log('📊 Fetching from NewPlatform...');
    const response = await axios.get('https://api.newplatform.com/competitions', {
      params: { limit: 100 },
      timeout: 5000
    });
    return response.data.competitions || [];
  } catch (err) {
    console.error('❌ Error fetching from NewPlatform:', err.message);
    return [];
  }
}

async function scrapeHackathons() {
  // Add new source
  const newPlatform = await fetchFromNewPlatform();
  
  // Transform
  const transformed = newPlatform
    .map(h => transformHackathon(h, 'newplatform'))
    .slice(0, 10);
  
  // Merge with existing
  allHackathons = [...transformed, ...existingHackathons];
  
  // Save
  writeHackathons({
    hackathons: allHackathons,
    lastUpdated: new Date(),
    sourcesFetched: ['kaggle', 'devpost', 'newplatform']
  });
}
```

---

## 📈 Future Scaling Path

```
MVP (Now)                 Growth Phase              Production
├── JSON storage          ├── MongoDB              ├── PostgreSQL
├── Single server         ├── Redis cache          ├── Kubernetes
├── Manual update         ├── GitHub Actions       ├── Auto-scaling
└── localhost:5000        ├── Vercel + Railway     └── CDN + load balancing
```

---

## ✅ Your Tech Stack Validated

```
Frontend:
├── Vanilla JavaScript (no frameworks) ✅
├── HTML5 semantic markup ✅
├── CSS Grid + Flexbox (responsive) ✅
└── SVG icons (crisp & scalable) ✅

Backend:
├── Node.js + Express ✅
├── Axios (HTTP client) ✅
├── Cheerio (web scraping) ✅
└── File-based storage (JSON) ✅

Deployment:
├── GitHub (version control) ✅
├── Frontend: Vercel/GitHub Pages ✅
├── Backend: Railway/Render ✅
└── Data: JSON → MongoDB (upgrade path) ✅
```

**This is a solid, modern tech stack. Good choices! 🎉**

---

## 🚀 Ready to Launch?

1. **Test locally**: `npm run dev`
2. **Add real data**: `npm run fetch`
3. **Deploy backend**: Push to Railway
4. **Deploy frontend**: Push to Vercel
5. **Go live**: Share the URL!

You have everything you need. The rest is just connecting APIs and deploying.

**You've got this! 🙌**
