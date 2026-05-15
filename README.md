# 🚀 HackTrack — Live Hackathon Tracker

A responsive, real-time hackathon tracker that aggregates competitions from multiple platforms. Built with vanilla JavaScript frontend and Node.js backend.

## 📁 Project Structure

```
hackathon-tracker/
├── public/               # Frontend (static files)
│   ├── index.html       # Main UI
│   ├── css/
│   │   └── styles.css   # Separated styles
│   └── js/
│       ├── main.js      # Core logic
│       ├── api.js       # API communication
│       └── filters.js   # Filter/search logic
├── backend/              # Node.js backend
│   ├── server.js        # Express server
│   ├── scraper.js       # Data fetchers
│   ├── routes/
│   │   └── hackathons.js # API endpoints
│   └── utils/
│       └── parser.js    # Parse hackathon data
├── data/                 # Data storage
│   ├── hackathons.json  # Aggregated data
│   └── cache.json       # Caching layer
├── package.json         # Dependencies
└── README.md           # This file
```

## 🛠 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (responsive)
- **Backend**: Node.js + Express
- **Data Fetching**: Axios + Cheerio (web scraping)
- **Storage**: JSON files (can migrate to MongoDB)
- **Deployment**: Vercel (frontend) + Railway/Render (backend)

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
PORT=5000
NODE_ENV=development
```

3. Start the backend server:
```bash
npm run dev
```

4. Open `public/index.html` in your browser

### Fetching Data

```bash
npm run fetch
```

This will scrape and aggregate hackathon data from configured sources.

## 📊 API Endpoints

- `GET /api/hackathons` — Get all hackathons
- `POST /api/hackathons/refresh` — Trigger data update
- `GET /api/hackathons?filter=open` — Filter by status
- `GET /api/hackathons/search?q=kaggle` — Search hackathons

## 🔄 How Live Updates Work

1. **Frontend**: User clicks "Update" button
2. **Backend**: Receives request, triggers scraper
3. **Scraper**: Fetches from Kaggle API, Devpost RSS, Unstop, etc.
4. **Database**: Updates `hackathons.json` with new data
5. **Frontend**: Polls or receives WebSocket update, refreshes UI

## 🌐 Data Sources (Planned)

- ✅ Kaggle API
- ✅ Devpost (RSS/Scraping)
- ✅ Unstop
- ✅ Zindi
- ✅ AIcrowd
- ✅ Devfolio
- ✅ HackerEarth API
- ⏳ Custom hackathon feeds

## 📝 Features

- [x] Responsive design (mobile-first)
- [x] Real-time filtering & search
- [x] Hackathon categorization (Open, Upcoming, Recurring, etc.)
- [ ] Live update via button click
- [ ] Automated daily scraping (GitHub Actions)
- [ ] Timeline/calendar view
- [ ] Export as CSV/ICS
- [ ] Dark theme (already included)

## 🔐 Environment Variables

```
PORT=5000
NODE_ENV=development
KAGGLE_API_KEY=your_key_here
DEVPOST_API=https://devpost.com/hackathons.json
```

## 📦 Deployment

### Frontend (Vercel)
```bash
vercel deploy
```

### Backend (Railway/Render)
- Push to GitHub
- Connect repository
- Auto-deploy on push

### GitHub Actions (Scheduled Scraping)
Set up workflow to run `npm run fetch` daily at midnight

## 💡 Contributing

1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request

## 📄 License

MIT License — feel free to use this for personal or commercial projects.

## 👤 Author

Built for IISc RBCCPS M.Tech AI/ML students.

---

**Next Steps**: Set up backend scrapers, create API endpoints, and deploy!
