# CricketAI - PoC

AI-Powered Live Cricket Commentary Application (Proof of Concept)

A fully local, self-contained web application that demonstrates real-time cricket commentary generation using mocked data, ready to integrate with real APIs later.

## 🎯 What is This?

This is a **proof-of-concept** that shows:

1. ✅ A web-based match list and live scoreboard
2. ✅ Ball-by-ball cricket data (from local JSON files)
3. ✅ AI-powered commentary generation (using template lookups)
4. ✅ Live simulation of cricket events with real-time commentary
5. ✅ Clean React UI for browsing matches and watching live action

**No external dependencies:** Everything runs on your laptop. No API keys, no cloud services, no internet required (after initial setup).

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│  React Frontend (Port 3000)                      │
│  - Match List                                     │
│  - Live Match View with Commentary               │
└─────────────────────────────────────────────────┘
            ↓ HTTP/Polling
┌─────────────────────────────────────────────────┐
│  Express.js Backend (Port 8000)                  │
│  - Match Data Service                            │
│  - Commentary Generator                          │
│  - API Endpoints                                 │
└─────────────────────────────────────────────────┘
            ↓ File System
┌─────────────────────────────────────────────────┐
│  Local Data Files (data/ folder)                │
│  - matches.json → Match metadata                 │
│  - *.json → Ball-by-ball data                   │
│  - commentary-lookups.json → Templates          │
└─────────────────────────────────────────────────┘
```

## 📦 Project Structure

```
sports-commentary-poc/
├── server/                      # Node.js/Express backend
│   ├── index.js                 # Main server file
│   └── commentary-generator.js  # Commentary generation logic
│
├── client/                      # React frontend
│   ├── public/
│   │   └── index.html           # HTML template
│   └── src/
│       ├── App.js               # Main React component
│       ├── App.css              # Global styles
│       └── components/
│           ├── MatchList.js     # Match browsing page
│           ├── MatchList.css
│           ├── LiveMatch.js     # Live match view
│           └── LiveMatch.css
│
├── data/                        # Local data files
│   ├── matches.json             # List of all matches
│   ├── ipl-2024-mi-vs-rcb-01.json  # Ball data for a match
│   └── commentary-lookups.json  # Commentary templates
│
├── package.json                 # Root package (for backend)
└── ARCHITECTURE.md              # System design doc
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

Verify installation:
```bash
node --version
npm --version
```

### Step 1: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 1b: (Optional) Set up OpenAI for Dynamic Commentary

If you want to use OpenAI to generate **dynamic, dramatic commentary** instead of static templates:

1. **Get an OpenAI API Key:**
   - Visit https://platform.openai.com/api-keys
   - Create a new API key (requires OpenAI account)
   - Copy the key (starts with `sk-`)

2. **Set the environment variable:**
   ```bash
   # Create a .env file in the root directory
   echo 'OPENAI_API_KEY=sk-your-api-key-here' > .env
   
   # Or set it directly in your terminal (bash/zsh):
   export OPENAI_API_KEY="sk-your-api-key-here"
   ```

3. **That's it!** When you start the backend and select "OpenAI-POC" from the AI Mode dropdown, it will use your API key.

**Note:** OpenAI API calls cost money. Each ball's commentary generation costs ~$0.001-0.005. For a test match (300 balls), expect ~$0.30-1.50 in API costs. The default "No AI (Local)" mode is completely free.

### Step 2: Start the Backend

```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║    CricketAI PoC Backend Server       ║
╠════════════════════════════════════════╣
║  Running on http://localhost:8000       ║
║  Serving match data from /data folder  ║
...
```

Leave this terminal open and running.

### Step 3: Start the Frontend (in a new terminal)

```bash
cd client
npm start
```

React will automatically open your browser to `http://localhost:3000`.

## 📱 Using the App

### 1. **Browse Matches**
   - Visit the home page to see all cricket matches
   - Filter by status: All, Live, Scheduled, Completed
   - Click on a match to view details

### 2. **Watch Live Commentary**
   - Click "Watch Live" or "View Match" to enter the live match view
   - See the current score and match details
   - Click "▶️ Simulate Live" to start the simulation
   - Watch as balls are revealed one by one with AI-generated commentary

### 3. **Choose AI Mode (Commentary Generation)**
   - **No AI (Local)**: Uses fast, free local template lookups (default)
   - **OpenAI-POC**: Generates dynamic commentary using OpenAI API (requires API key, slower, paid)
   - Select the mode from the "AI Mode" dropdown before starting simulation
   - Can't change mode while simulation is running—pause first
   - If OpenAI fails, falls back to local mode automatically

### 4. **Adjust Speed**
   - Use the "Speed" dropdown to slow down or speed up the simulation
   - Great for testing or demoing

### 5. **Change Language**
   - Select a language from the top-right dropdown (currently English only in templates)
   - Framework supports Hindi, Tamil, Telugu (templates in `data/commentary-lookups.json`)

### 6. **Enable Speech**
   - In the Live Match view, toggle **Enable Speech** to turn on audio commentary.
   - The app will automatically speak each ball's generated commentary as it appears.
   - Use **Replay Commentary** to replay the last spoken line or click the 🔊 button next to any ball in the ball history to hear it again.

### 7. **Voice & Rate Control**
   - Select a voice from the dropdown (depends on your OS/browser).
   - Adjust the speech **Rate** slider for faster or slower narration.
   - Use **Stop** to immediately halt any speaking.

## 🧪 API Endpoints (Backend)

The backend provides REST APIs for the frontend. All data comes from local JSON files.

### Matches
```bash
# Get all matches
curl http://localhost:8000/api/matches

# Get a specific match
curl http://localhost:8000/api/matches/ipl-2024-mi-vs-rcb-01

# Get balls for a match (with commentary)
curl "http://localhost:8000/api/matches/ipl-2024-mi-vs-rcb-01/balls?language=en"
```

### Commentary
```bash
# Get all commentary lookups (templates)
curl http://localhost:8000/api/commentary-lookups
```

### Health
```bash
# Check if backend is running
curl http://localhost:8000/api/health
```

## 📂 Data Files Explained

### `data/matches.json`
Contains metadata for all matches:
```json
[
  {
    "id": "ipl-2024-mi-vs-rcb-01",
    "team_a": "Mumbai Indians",
    "team_b": "Royal Challengers Bangalore",
    "status": "live",
    "venue": "Wankhede Stadium, Mumbai",
    "balls_file": "ipl-2024-mi-vs-rcb-01.json"
  }
]
```

### `data/ipl-2024-mi-vs-rcb-01.json`
Contains ball-by-ball data:
```json
[
  {
    "match_id": "ipl-2024-mi-vs-rcb-01",
    "ball_number": 1,
    "over": 1,
    "ball_in_over": 1,
    "runs": 0,
    "bowler": "Bumrah",
    "batter": "Virat Kohli",
    "event": "dot",
    "description": "Bumrah bowls a tight line, Virat blocks"
  }
]
```

### `data/commentary-lookups.json`
Contains templates for generating commentary:
```json
{
  "commentary_templates": {
    "dot": ["Tight line. Just a dot.", "No runs off that delivery!"],
    "four": ["Boundary! That's a four!", "Powered away for four!"],
    "six": ["Out of the ground! That's a six!", "BOOM! That's gone for six!"]
  },
  "bowler_specific": {
    "Bumrah": {
      "yorker": ["Bumrah's deadly yorker! Ripper!"]
    }
  }
}
```

## 🔧 How Commentary Generation Works

**Current Approach (PoC):**
1. Backend receives a request for balls with commentary
2. For each ball, it looks up commentary templates in `commentary-lookups.json`
3. Returns a random appropriate template based on the event (dot, four, six, wicket, etc.)

**Upgrade Path (Future):**
Replace the lookup logic with a call to Google Gemini API:
```javascript
// Instead of:
const commentary = getRandomTemplate(ball.event);

// Do this:
const commentary = await callGeminiAPI({
  prompt: `Generate cricket commentary for: ${ball.description}`,
  context: matchContext
});
```

No UI changes needed—the API contract remains the same.

## 🎮 Sample Data

The app comes with sample IPL 2024 match data and an Ashes Test match sample. You can load and play the Ashes demo:

- Match: "Men's Ashes 2025-26" (Live)
- ID: `ashes-2025-mcg-4th-day2`
- Date: 26-27 December 2025 (Day 2)
- Venue: MCG, Melbourne

This sample uses pre-written commentary from `data/sample-commentary.txt` and demonstrates the audio flow. To play it in the UI, open the home page and click on the match card for "Men's Ashes 2025-26".

### Audio/Text Synchronization

**How to keep audio and text in sync:**

1. **Complete Mode** (default & recommended for sync)
   - Audio for current ball **completes fully** before the next ball is revealed
   - Simulation waits for speech to finish before advancing
   - Good for: perfect synchronization—no interruptions or text ahead of audio
   - Experience: dramatic, immersive, every word is heard before next ball
   - Note: Overall speed depends on commentary length + voice speed

2. **Queued Mode** (broadcast-style, smooth flow)
   - Audio queues and plays smoothly one after another
   - Simulation advances at the set speed independently
   - Good for: listening to continuous narration while watching scores update
   - Experience: smooth, natural broadcast-like commentary flow
   - Trade-off: audio may slightly lag the visible ball

3. **Interrupt Mode** (immediate playback, testing)
   - Audio for current ball plays immediately when revealed
   - Previous audio is cut off
   - Good for: quick testing or demo of multiple speeds
   - Experience: quick, punchy, but may feel abrupt
   - Trade-off: commentary may be interrupted between balls

**Recommended settings for best sync:**
- Enable Speech: ON
- Audio Mode: **Complete** (audio finishes, then next ball appears)
- Simulation Speed: **0.5x (Slow)** or **1x (Normal)** to allow audio time to play
- This ensures every word of commentary is heard before the next ball is revealed

**Pause & Stop behavior:**
- Click **⏸️ Pause**: Pauses both simulation and any speaking audio
- Click **▶️ Simulate Live**: Resumes both
- Click **⏹ Stop All**: Stops everything (simulation + audio) and resets


To add more matches:

1. **Create a new balls file** (e.g., `data/ipl-2024-kkr-vs-dc.json`)
2. **Add the match to** `data/matches.json`
3. **Restart the backend** (it caches data on startup)

Example ball event:
```json
{
  "match_id": "your-match-id",
  "ball_number": 1,
  "over": 1,
  "ball_in_over": 1,
  "runs": 4,
  "bowler": "Fast Bowler",
  "batter": "Opening Batter",
  "event": "four",
  "description": "Short and wide, driven for four"
}
```

## 🚀 Future Enhancements

### Phase 1: Real APIs (Minimal Changes)
- [ ] Replace `data/matches.json` with calls to CricketData.org API
- [ ] Keep commentary lookup structure, add Gemini API integration
- [ ] Add Google Cloud TTS for audio playback

### Phase 2: Production Ready
- [ ] Add database (SQLite → PostgreSQL)
- [ ] Implement user authentication
- [ ] Add ads between overs
- [ ] Deploy to cloud (Vercel + Railway)

### Phase 3: Advanced Features
- [ ] Multi-sport support
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Personalized commentary preferences

## 🛠️ Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is already in use
lsof -i :8000

# If in use, either:
# 1. Kill the process: kill -9 <PID>
# 2. Or change the port by setting PORT environment variable when starting:
#    PORT=8000 npm run dev
```

### Frontend can't reach backend
```bash
# Make sure backend is running on a browser-safe port (recommended: 8000):
curl http://localhost:8000/api/health

# Note: Some ports (e.g., 6000) are considered unsafe by browsers and will be blocked (ERR_UNSAFE_PORT).
# Ensure client/package.json has a proxy pointing at the backend, e.g.:
# "proxy": "http://localhost:8000"
```

### Data not loading
```bash
# Check that data files exist:
ls -la data/

# Check backend logs for errors
# Files should be readable from the data/ folder
```

### Port conflicts
Backend default: **8000** (change in `server/index.js` → `const PORT = ...`)
Frontend default: **3000** (React will suggest an alternative port if 3000 is in use)

## 📊 Development Notes

- **Frontend:** React 18 with hooks, React Router for navigation
- **Backend:** Express.js with CORS enabled for local development
- **Data:** JSON files for simplicity (no database needed for PoC)
- **Styling:** CSS Grid and Flexbox, mobile-responsive

## 📝 File Sizes & Performance

- Total data (~12 balls): ~3 KB
- Bundle size (after npm install): ~200 MB (typical for React + dependencies)
- Runtime memory: ~50 MB (backend) + ~150 MB (frontend)

## 🎓 Learning Resources

Want to understand the code better?

1. **Backend API:** See `server/index.js` for route handlers
2. **Commentary Logic:** See `server/commentary-generator.js` for template matching
3. **Frontend Components:** See `client/src/components/` for React components
4. **Data Structure:** See `data/*.json` for data format examples

## ✅ Checklist Before Going Live

- [ ] Backend is running on port 8000 without errors
- [ ] Frontend is running on port 3000
- [ ] Can see matches on home page
- [ ] Can navigate to a match and simulate live action
- [ ] Commentary appears as balls are revealed
- [ ] No console errors in browser dev tools

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Look at console errors (browser dev tools: F12)
3. Check backend logs in the terminal
4. Verify all files exist in the `data/` folder

## 📄 License

MIT License - This PoC is provided as-is for demonstration purposes.

---

**Enjoy exploring CricketAI! 🏏🎙️**

Next steps: Replace mock data with real APIs and add Gemini for smarter commentary.
