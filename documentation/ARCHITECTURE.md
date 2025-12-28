# CricketAI PoC - System Architecture & Design

## Executive Summary
CricketAI is a web-based PoC that ingests live cricket match data, generates AI-powered commentary, and delivers it via text-to-speech (TTS) to users. This document defines the core flow, technology choices, and integration points.

---

## Core Flow (User Perspective)

```
1. User opens web app → Selects a live match
2. System fetches live ball-by-ball data (from CricketData.org or fallback API)
3. AI engine (Gemini/Llama) generates dramatic commentary for each ball
4. TTS engine converts text to audio (Hindi, Tamil, Telugu, English)
5. User hears commentary + sees live score, stats, and video/images
6. Ads play between overs (monetization placeholder)
```

---

## Proposed Tech Stack (Fully Local, No External APIs)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React | Interactive UI, real-time updates, TTS playback |
| **Backend** | Node.js + Express | Lightweight, easy API integration, rapid prototyping |
| **AI Integration** | Local file-based lookups (PoC) → OpenAI API (POC option) → Gemini API (future) | Start with local lookups, optionally enable OpenAI via API key, upgrade to Gemini later |
| **TTS** | Browser Web Audio API or ffmpeg (offline) → Google Cloud TTS (future) | Start without audio, add later |
| **Match Data** | JSON/CSV files on disk (matches.json, balls.json) | No external dependencies, fully reproducible |
| **Database** | JSON files (PoC) → SQLite (if needed) | Fast to prototype, no setup |
| **Deployment** | Local development (`npm run dev`) | Runs entirely on your laptop |

**Key Change:** All external API dependencies are mocked with local files. You can replace them later with real APIs without changing the core logic.

---

## System Architecture Diagram (Local-Only PoC)

```
┌─────────────────┐
│   Web Browser   │ (React frontend)
│  localhost:3000 │
├─────────────────┤
        ↓
┌─────────────────┐
│  Backend API    │ (Node.js/Express)
│  localhost:8000 │
├─────────────────┤
        ↓
┌─────────────────────────────────────────┐
│         Service Layer                   │
├─────────────────────────────────────────┤
│  ┌──────────────┐  ┌────────────────┐  │
│  │ Match Data   │  │ AI Commentary  │  │
│  │ Service      │  │ Generator      │  │
│  │ (reads JSON) │  │ (local logic)  │  │
│  └──────────────┘  └────────────────┘  │
│  ┌──────────────┐  ┌────────────────┐  │
│  │ Commentary   │  │ Match State    │  │
│  │ Storage      │  │ Manager        │  │
│  │ (JSON file)  │  │ (in-memory)    │  │
│  └──────────────┘  └────────────────┘  │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│     Data Layer (Local Files)            │
├─────────────────────────────────────────┤
│  • data/matches.json                    │
│  • data/balls.json                      │
│  • data/commentary-lookups.json         │
│  • data/sample-ipl-2024.json            │
└─────────────────────────────────────────┘
```

**No External Calls:** All data flows through local JSON files. Easy to debug, reproducible, and runs offline.

---

## Core Modules to Build

### 1. **Match Data Service (Local Files)**
**What it does:** Reads match and ball data from JSON files instead of calling external APIs

**Data Source:** `data/matches.json`, `data/balls.json`
**Outputs:** Match list, ball-by-ball data

**Key Logic:**
- Load matches.json into memory on startup
- For a selected match, stream balls.json sequentially (simulating live updates)
- Simulate real-time by adding delays between balls (configurable)

**Error Handling:**
- Graceful fallback if JSON file is missing
- Log all data reads for debugging

---

### 2. **AI Commentary Generator (Multiple Strategies, Upgradeable)**
**What it does:** Converts ball data → commentary text (using local logic, OpenAI API, or future Gemini)

**Inputs:** Ball data (e.g., "Bumrah bowls a yorker, Virat blocks, 0 runs")
**Outputs:** Commentary text (e.g., "Bumrah's deadly yorker! Ripper! Virat can only block.")

**Strategy 1: Local Lookups (Default)**
- Use lookup table or template engine (commentary-lookups.json)
- Map ball events → predefined commentary templates
- Example: `{"bowler": "Bumrah", "runs": 0, "event": "yorker"}` → "Bumrah's deadly yorker!"
- **Pros:** Fast, offline, no API calls, fully reproducible
- **Cons:** Limited creativity, static templates

**Strategy 2: OpenAI API (PoC Option)**
- Generate dynamic, dramatic commentary using OpenAI's GPT-3.5-turbo
- Requires `OPENAI_API_KEY` environment variable
- User can toggle between "No AI (Local)" and "OpenAI-POC" in the UI
- Response time: ~1-2 seconds per ball (slower, but more creative)
- **Pros:** Dynamic, dramatic, context-aware commentary
- **Cons:** Requires API key, slower, costs per API call, rate-limited

**Strategy 3: Gemini API (Future)**
- Replace OpenAI with Gemini for potentially better cost/performance
- Same user experience, drop-in replacement

**Architecture:**
```
User selects AI Mode:
  → "No AI (Local)" → Uses local lookups (fast, free)
  → "OpenAI-POC" → Uses OpenAI API (requires API key, slower but more creative)

Backend (/api/matches/:id/balls endpoint):
  - Accept ?aiMode=local or ?aiMode=openai query param
  - Route to appropriate generator (commentary-generator.js or openai-commentary.js)
  - On error, fallback to local lookups
```

**Setting up OpenAI (Optional):**
1. Get API key from https://platform.openai.com/api-keys
2. Set environment variable: `export OPENAI_API_KEY="sk-..."`
3. Run backend: `npm run dev`
4. In UI, select "OpenAI-POC" from AI Mode dropdown
5. First match load will generate commentary using OpenAI

**Multilingual Support:**
- Generate commentary in English, Hindi, Tamil, Telugu
- Each language has a custom system prompt for OpenAI
- Local lookups also support multiple languages via static data

---### 3. **Text-to-Speech (TTS)**

- Use the **Browser Web Speech API (SpeechSynthesis)** for local audio playback of commentary. This keeps the PoC offline and simple — no API keys or cloud services required.
- The frontend is responsible for playback: Enable/Disable speech, choose voice/rate/pitch, and replay spoken commentary.
- Playback behavior: commentary utterances are queued and played sequentially with a short gap to ensure natural flow. Replaying or explicit 'play' actions interrupt the queue and play immediately.

Future Option:
- Add server-side TTS (Google Cloud TTS / Amazon Polly) to generate high-quality audio files and return audio URLs to the frontend. This requires API keys and caching of generated audio to disk or bucket.

**Decision Rationale:** Web Speech API is ideal for quick demos and offline PoC. Server-side TTS is a production-grade path when better voice quality and caching are needed.

---

### 4. **Frontend UI**
**What it does:** Display match, live score, commentary, and audio playback

**Pages:**
1. **Match List** → Browse upcoming/live matches
2. **Live Match View** → Score, commentary text, audio player, team stats
3. **Settings** → Language, voice preference, playback speed

**Real-Time Updates:**
- WebSocket (for live ball updates) OR polling (simpler for PoC)
- Display new commentary as it's generated
- Sync audio playback with match progression

---

### 5. **Data Storage (Local Files)**
**What it does:** Store match data and generated commentary in JSON files

**Files:**
- `data/matches.json` — List of cricket matches
- `data/balls.json` — Ball-by-ball events for a match
- `data/commentary-lookups.json` — Templates for offline commentary generation

**Example Structure:**
```json
// matches.json
[
  {
    "id": "ipl-2024-mi-vs-rcb",
    "team_a": "Mumbai Indians",
    "team_b": "Royal Challengers Bangalore",
    "format": "T20",
    "status": "completed"
  }
]

// balls.json
[
  {
    "match_id": "ipl-2024-mi-vs-rcb",
    "ball_number": 1,
    "over": 1,
    "bowler": "Bumrah",
    "batter": "Virat",
    "runs": 0,
    "event": "dot"
  }
]
```

---

## Data Flow (Local-Only PoC)

### Step 1: Match Selection
1. User opens app → sees list of matches (from `data/matches.json`)
2. Frontend fetches match list from backend (`GET /api/matches`)
3. Backend reads and returns matches.json

### Step 2: Simulate Live Ball Events
1. User selects a match
2. **Backend job** (simulates live updates):
   - Read `data/balls.json` for the selected match
   - Emit balls sequentially with configurable delay (e.g., 5 seconds between balls)
   - Use WebSocket or polling to send new balls to frontend

### Step 3: AI Commentary Generation (Offline)
1. **Backend** receives a new ball event
2. Look up commentary from `data/commentary-lookups.json` based on:
   - Bowler name
   - Ball event type (dot, four, six, wicket, etc.)
   - Match context (score, overs remaining)
3. Return predefined commentary (e.g., "Bumrah's deadly yorker!")
4. Store in memory or append to output JSON

### Step 4: Frontend Display
1. Frontend receives new ball via WebSocket or polling
2. Display ball event (runs, wicket, etc.)
3. Display commentary text
4. Update live score, overs, and player stats

### No TTS in PoC
- Commentary is text-only for now
- Add TTS later if needed

---

## Decisions You Need to Make (As AI Director)

### 1. **Commentary Generation Strategy (PoC)**
- [ ] Simple lookup table (commentary-lookups.json) — fastest to build
- [ ] Template engine (e.g., Handlebars) — more flexible
- [ ] Deterministic rules (if bowler == "Bumrah" && event == "yorker" → ...) — clearest logic

**Recommendation:** Start with lookup table, migrate to Gemini API when ready.

### 2. **Frontend Framework**
- [ ] React (recommended: popular, large ecosystem)
- [ ] Vue.js (lighter, easier learning curve)
- [ ] Plain HTML/CSS/JS (simplest, but less maintainable)

### 3. **Real-Time Updates (Frontend ↔ Backend)**
- [ ] WebSocket (real-time, bidirectional)
- [ ] Server-Sent Events (one-way, simpler)
- [ ] Polling (simplest, but less efficient)

**Recommendation:** Polling (simplest for PoC), upgrade to WebSocket later.

### 4. **Deployment**
- [ ] Local development only (no deployment)
- [ ] Docker containerization (optional, for easy setup sharing)

**Recommendation:** Local dev only; no Docker for now.

---

## MVP Features (Local-Only PoC)

### Must-Have (Week 1)
- [x] Display list of cricket matches (from JSON file)
- [x] Simulate live ball events (read from JSON with delays)
- [x] Generate commentary using lookup table (no API calls)
- [x] Display commentary text in real-time
- [x] Basic UI (match score, ball number, commentary)

### Nice-to-Have (Week 2)
- [ ] WebSocket for real-time updates
- [ ] Language selection (English, Hindi, Tamil via static lookups)
- [ ] Match replay (view past match with all commentary)
- [ ] Player stats display (strike rates, averages, etc.)
- [ ] Better UI/UX (CSS styling, responsive design)

### Out of Scope (Post-PoC)
- [ ] External API integration (Gemini, TTS, sports data)
- [ ] User authentication
- [ ] Ads & monetization
- [ ] Mobile app
- [ ] Database (SQLite/PostgreSQL)
- [ ] Scaling to multiple users
- [ ] Multi-sport support

---

## Success Criteria for PoC

By end of this session, you'll have:

1. ✅ A working web app that reads match data from JSON files
2. ✅ Simulated live ball events (with realistic delays)
3. ✅ Offline commentary generation (lookup-based, no external APIs)
4. ✅ Live score and ball-by-ball display in React UI
5. ✅ Backend API endpoints (Express.js) to serve match and ball data
6. ✅ Sample IPL match data (JSON files) for testing
7. ✅ README with setup and run instructions
8. ✅ Clear documentation on how to plug in real APIs later (Gemini, TTS, CricketData, etc.)
9. ✅ Easy upgrade path: replace JSON lookups → Gemini API (no code refactoring)

---

## Next Steps (Ready to Build)

I'm ready to scaffold the entire PoC:

1. **Backend (Node.js/Express):**
   - API endpoints for matches and balls
   - Match data service (reads JSON)
   - Commentary generator (lookup-based)
   - WebSocket support for live updates

2. **Frontend (React):**
   - Match list page
   - Live match view (score, balls, commentary)
   - Real-time updates
   - Settings page (language, speed)

3. **Sample Data:**
   - Realistic IPL 2024 match data (JSON)
   - Commentary lookup table

4. **Documentation:**
   - README: setup and run instructions
   - Architecture guide (this file)
   - How to swap in real APIs

**Ready to proceed? Approve, and I'll generate the full scaffold.**

> Note: Some ports (for example, 6000) may be considered unsafe by browsers and will be blocked (ERR_UNSAFE_PORT). Use a browser-safe port like 8000 when running the backend locally.
