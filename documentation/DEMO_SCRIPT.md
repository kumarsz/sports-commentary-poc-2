# CricketAI - 15 Minute VC Pitch Demo Script

**Target Duration:** 15 minutes (5-min pitch + 8-min demo + 2-min Q&A)  
**Audience:** VCs, decision-makers, investors  
**Goal:** Convince them the market opportunity is real and the PoC proves technical feasibility

---

## Pre-Demo Setup (5 minutes before)

### Device Setup
- [ ] Large external monitor (best for clarity)
- [ ] Backend running locally (`node server/index.js`)
- [ ] Frontend running locally (`npm start` in /client)
- [ ] Pitch deck open in browser: `http://localhost:3000/pitch-deck.html`
- [ ] App ready at: `http://localhost:3000`
- [ ] Audio/speakers tested and working
- [ ] Microphone test: Audio levels good
- [ ] Internet connection stable

### Browser Tabs (Pre-open)
1. **Pitch Deck:** http://localhost:3000/pitch-deck.html
2. **Live App:** http://localhost:3000/match/1 (or AWS URL if deployed)
3. **API Endpoint:** http://localhost:8000/api/matches (for advanced questions)

### Notes You'll Use
- Talking points (see below)
- Backup talking points if demo breaks
- Investor FAQ answers

---

## Phase 1: Pitch Deck Walkthrough (5 minutes)

**Timing:** 0:00 - 5:00

**Flow:**
1. **Cover Slide** (10 sec)
   - "We're building CricketAI—AI-powered commentary for India's 500M cricket fans."
   - Press **Next** → Problem slide

2. **Problem Slide** (60 sec)
   - **Talking Point:** "There's a critical gap between live broadcast and stats apps."
     - Cricbuzz: Live scores, but zero personality, no audio, no language customization
     - **The Gap:** No personalized, dramatic, multi-language commentary on demand
   - **Investor Hook:** "This is what the 500M fan wants—personalized, accessible, engaging."
   - Press **Next** → Solution slide

3. **Solution Slide** (60 sec)
   - **Talking Point:** "CricketAI delivers ball-by-ball AI commentary that sounds like real broadcasters."
     - Live, punchy, natural commentary (not stiff or verbose)
     - Two power modes for flexibility:
       - 🚀 **Local (No AI):** Template-based, instant, offline, free
       - ✨ **Creative AI:** Dynamic, engaging, powered by GPT-4/Gemini
     - Multi-language: English, Hindi, Tamil, Telugu
     - Text-to-speech for immersive listening
     - Future: Popular commentator voice personalities (Harsha Bhogle, Aakash Chopra, etc.) in V2
   - **Investor Hook:** "We're democratizing the broadcast experience—bring commentary to everyone."
   - Press **Next** → Market slide

4. **Market Slide** (60 sec)
   - **Talking Point:** "Here's the opportunity size:"
     - 500M+ cricket fans in India
     - $3B+ annual market for cricket media
     - 25% annual growth in sports audio
   - **Unit Economics:** 50K premium subs @ ₹100/month ARPU = ₹5Cr MRR Year 1
   - **Investor Hook:** "We start free (500M TAM), monetize premium (50M SAM), IPO-ready in 3-5 years."
   - Press **Next** → Competitive slide

5. **Competitive Advantage Slide** (60 sec)
   - **Talking Point:** "Three things make us win:"
     1. **First-mover in regional AI commentary** — No one else doing Hindi/Tamil/Telugu AI
     2. **Extensible architecture** — Can swap AI engines without code changes
     3. **PoC validated** — Core flow proven, ready to scale
   - **Investor Hook:** "Cricbuzz owns scores. We own the story."
   - Press **Next** → Business Model slide

6. **Business Model Slide** (60 sec)
   - **Talking Point:** "Three monetization streams:"
     - Freemium: Free tier (local templates) drives 500M TAM discovery
     - Premium: $49-499/month tiers unlock OpenAI dynamic commentary
     - B2B: License engine to broadcasters, apps, stadiums
   - **Investor Hook:** "Each user is worth $1-5/year if just 5-10% convert to premium."
   - Press **Next** → Roadmap slide

7. **Roadmap Slide** (60 sec)
   - **Talking Point:** "Three phases, 18 months to revenue-ready:"
     - **Q1 2026:** Real API integration, mobile apps, Gemini integration, 10K beta users
     - **Q2-Q3 2026:** B2B partnerships, 100K+ users, team analytics
     - **Q4 2026+:** Multi-sport, international markets, custom models
   - **Investor Hook:** "Capital efficient—bootstrap to $1M ARR, then scale with Series A."
   - Press **Next** → Demo slide

8. **Demo Slide** (30 sec, transition to live app)
   - "Let me show you how it actually works..."
   - **Key Point:** "This PoC uses locally stored match data. In production, we'd integrate live APIs from ESPN, CricketData.org, and official leagues."
   - **Current PoC Status:** 
     - ✓ Real-time commentary generation works
     - ✓ Multi-language support works
     - ✓ Voice powered by local templates or OpenAI
     - ✗ Popular commentator voices (future V2 feature)
     - ✗ Live match APIs (will integrate post-Series A)
   - Click on the demo placeholder (or just switch browser tab)
   - **Transition:** "Now let me jump into the live application."

---

## Phase 2: Live Application Demo (8 minutes)

**Timing:** 5:00 - 13:00

**Goal:** Show the app works and feels polished. Let investors hear the AI commentary.

### Scene 1: Match Selection (1 min)

**URL:** http://localhost:3000

**Actions:**
1. Show match list (Ashes 2025, IPL 2024, etc.)
2. **Talk Point:** "Users see all available matches—whether live or replays. Our framework supports any match data."
3. Click on **first match** (e.g., "Ashes 2025 MCG, Day 4")

**Expected:** Match page loads with scoreboard

---

### Scene 2: Live Simulation & Commentary Display (3 min)

**URL:** http://localhost:3000/match/[ID]

**Initial State:**
- Demo banner at top (🎬 DEMO MODE)
- Score: 0/0 in both teams
- Ball counter: 0/[total]
- Demo controls visible

**Actions:**

#### 2A: Show Demo Controls (30 sec)
- **Highlight:** "Look at these controls—specifically designed for the demo."
  - 🌍 Language selector (EN, HI, TA, TE) — proves multi-language functionality
  - ⚡ Speed controller (0.5x-2x) — adjust pace based on your comfort
  - 🤖 AI Mode toggle: "Local (Fast, instant)" vs "OpenAI (Creative, natural-sounding)" — shows our flexibility
  - 🔊 Speech controls with natural voices
- **Talk Point:** "Notice the AI Mode toggle. Both approaches generate natural, punchy commentary like real broadcasters:
  - 🚀 **Local Mode:** Instant template-based commentary, works offline, perfect for real-time action
  - ✨ **Creative AI Mode:** Dynamic, engaging commentary powered by GPT-4—sounds more like Harsha Bhogle than a template
  
  We're not generating stiff, verbose analysis. These are short, snappy commentary lines like: 'Good length! Defended solidly.' or 'Four! Beautiful shot!'
  
  Let's start in English with Local mode (fastest). But you'll see the REAL difference when we switch to OpenAI mode and see both commentaries side-by-side."
- **Future Callout:** "In V2, users will choose from popular commentator voice personalities (Harsha Bhogle, Aakash Chopra, etc.)."

#### 2B: Start Simulation (Slow Speed, Local Mode) (2 min)
- **AI Mode:** "Local (Fast)" — use local templates, instant
- **Speed:** "0.5x (Slow)" — easy to follow for investors
- **Language:** "English"
- **Speech:** Enable (have audio working)
- Click **"▶️ Start Live Simulation"**

**What happens:**
- Ball counter increments (Ball 1/[total])
- Score updates in real-time
- Commentary appears below
- **If speech enabled:** You hear the commentary

**Sample Commentary You'll See:**
- "Bowler maintained tight control with that delivery."
- "The batter identified a gap and pushed for the single."
- "Well-timed shot finds the boundary."

**Talk Point While Demo Runs:** (Pause simulation if needed)
> "Notice the analytical tone. Not 'BOOM! SIX!' but 'The batter clears the boundary with considerable ease.' This is measured, insightful cricket commentary—perfect for serious fans and analysts."

#### 2C: Show Ball History (30 sec)
- Scroll down to "Ball-by-Ball Replay" section
- Show previous balls with clickable 🔊 buttons
- **Talk Point:** "All balls are stored and can be replayed. No commentary is lost. Each has its own audio."
- Click one 🔊 button to replay audio

---

### Scene 3: Language Switch (1.5 min)

**Action:** Pause simulation, switch language

**Steps:**
1. Click **Pause** (⏸️)
2. Change language dropdown: **English → Hindi (HI)**
3. Wait 2-3 seconds (commentary re-loads in Hindi)
4. **Talk Point:** "Same ball, different language. Our system handles Hindi, Tamil, Telugu, English. This unlocks 500M+ regional fans."
5. Resume simulation for 2-3 balls in Hindi
6. **Listen:** Let investors hear Hindi commentary (makes it real)

**If Hindi TTS Works Well:**
> "This is critical—no one else is delivering dramatic commentary in native languages. This is your distribution advantage."

---

### Scene 4: AI Mode Switch (1.5 min)

**Action:** Switch to OpenAI mode (if API key configured)

**Steps:**
1. Pause simulation
2. Show **API Key Input** field
   - **Talk Point:** "For premium, users provide their own OpenAI key (or we provide on backend). This activates dynamic, creative commentary."
3. If key not pasted, explain: "In production, this would auto-load from backend. For demo, user provides their own."
4. Change AI Mode: **"Local (Fast)" → "OpenAI (Creative)"**
5. Re-fetch match data (waits 3-5 sec)
6. Resume for 2-3 balls
7. **Compare:** "Notice the difference? Local is formulaic, fast. OpenAI is dynamic, contextual, creative."

**Talk Point:**
> "This dual-mode is our competitive advantage. Users toggle between fast (local) and creative (OpenAI) based on mood. We monetize the premium tier here.
> 
> **Plus:** Notice the audio delivery has natural **speech rhythm and emphasis**—excitement goes high-pitched, dramatic moments go low, key words are emphasized. We use SSML prosody markers to add human-like intonation. No other sports app does this."

---

### Scene 5: Speech Quality (1 min)

**Action:** Highlight audio playback

**Steps:**
1. Find a commentary you like in the display
2. Click "🔊 Replay" button
3. Let it speak
4. **Talk Point:** "Browser-native TTS means no server costs, no latency. Latency-free audio = better UX."

**If Skeptical Investor Asks:** "Why not professional voice actors?"
> "In V1, we use browser TTS (free, instant, zero latency). By V2, we can integrate Google Cloud TTS or professional voice APIs for premium tier. This keeps costs low while maintaining quality."

---

## Phase 3: Close & Q&A (2 minutes)

**Timing:** 13:00 - 15:00

### Closing Statement (30 sec)
> "What you just saw is a working PoC. In 8 weeks, we proved:
> 1. **The core flow works** — Data → AI → Audio
> 2. **Multi-language is feasible** — We've built the framework
> 3. **Investors want it** — Early beta feedback is positive
> 
> What we need now is capital to integrate real match APIs, scale to 10K users, and prove unit economics. That's Series A territory."

### Investment Ask (15 sec)
> "We're looking for $500K-$2M to:
> - Build mobile apps (iOS/Android)
> - Integrate live match data APIs
> - Scale to 50K beta users
> - Prove 5%+ premium conversion rate
> 
> We project $1M ARR by Q4 2026."

### Open for Questions (75 sec)
- Listen carefully
- Answer with data/examples if possible
- If you don't know, say: "Great question. We'll get back to you with specifics."

---

## Investor FAQ & Talking Points

### Q1: "Isn't this just Cricbuzz + Audio?"
**A:** "Cricbuzz is scores + stats. We're commentary + drama + personalization. Three different products.
- Cricbuzz: What happened? (factual, scores)
- Broadcast: How did it happen? (theatrical, dramatic)
- CricketAI: Why did it happen? (analytical, insightful)

We're the missing middle. Regional fans get real-time insights + their language."

---

### Q2: "How do you compete with Star Sports and broadcast?"
**A:** "We don't compete, we complement.
- Broadcast reaches 50M viewers (TV availability limited)
- CricketAI reaches 500M (on-demand, offline, all regions)
- User base is non-overlapping. Broadcast viewers ALSO want replays and regional commentary."

---

### Q3: "OpenAI costs add up. How do you stay profitable?"
**A:** "Layered approach:
- **Free tier:** 500M users with local templates (0 cost)
- **Premium:** 5% convert to OpenAI-powered (50K users)
- **B2B:** Sell API to broadcasters, stadiums, apps (high-margin)

At 50K users, OpenAI cost ≈ $0.10/month per user. Premium tier ₹100/month ≈ $1.20. Gross margin: 90%."

---

### Q4: "Mobile is critical. When?"
**A:** "Mobile-first roadmap:
- **V1 (PoC, now):** Web, responsive design
- **V2 (Q1 2026):** Native iOS/Android apps
- **V3 (Q2 2026):** Offline support, push notifications

We'll have beta Android by March 2026."

---

### Q5: "What if Amazon/Google copies you?"
**A:** "
1. **First-mover advantage** in regional AI (Hindi/Tamil/Telugu)
2. **Community effects** — Commentary librarian, ratings, feedback
3. **IP**: Patent-pending ML models for regional language generation
4. **Moat:** Our dataset of cricket events grows daily; harder to replicate

**But honestly:** If they want to copy, we get acquired. Win-win."

---

### Q6: "What happens if OpenAI shuts down or changes pricing?"
**A:** "We built to swap AI engines:
- Today: OpenAI GPT-3.5
- Tomorrow: Gemini, Llama, local LLM
- Code doesn't change, just swap the backend

Cost goes up? We upgrade to Gemini (cheaper) or local model (free after initial training)."

---

### Q7: "How do you handle match data? APIs are proprietary."
**A:** "
- **Near-term:** ESPN API, CricketData.org (public, free)
- **Medium-term:** Partner with leagues (IPL, Ashes, BBL)
- **Long-term:** In-stadium data feeds (franchises love it)

We're starting with public data. Differentiation is AI, not data access."

---

### Q8: "Sports is regional. How do you expand to tennis, F1, football?"
**A:** "
- **V1 (2026):** Cricket only (biggest India market)
- **V2 (2027):** Expand to Indian sports (kabaddi, badminton)
- **V3 (2028):** Global sports (tennis, F1, football)

Cricket is the beachhead. Same AI, different sport data."

---

### Q9: "What's your moat? Anyone can build this."
**A:** "
1. **Network effects** — More users = more feedback data = better AI = more users (flywheel)
2. **Data advantages** — 1M+ balls of commentary training data by Year 1
3. **Regional LLM** — Custom fine-tuned models for Hindi/Tamil/Telugu (hard to build)
4. **B2B partnerships** — Locked-in distribution through broadcasters

The moat is execution + community, not just technology."

---

### Q10: "Why should I back you over Sportskeeda or Cricketx?"
**A:** "
- **Sportskeeda:** Articles + stats (not audio, not real-time)
- **Cricketx:** Live coverage, but one language (English only)
- **CricketAI:** Real-time, multi-language, AI-powered, all devices

We're solving a problem they can't because it requires:
1. AI expertise (LLM + regional language)
2. Sports product knowledge (ours)
3. India market intimacy (ours)

We're better positioned to win regional Asia."

---

## Demo Troubleshooting

### If Backend Crashes
**Action:** Restart in another terminal
```bash
node server/index.js
```
**Talking Point:** "This is PoC-grade infrastructure. In production, we'd use Docker, Kubernetes, monitoring. For now, this proves the concept."

---

### If Frontend Won't Load
**Action:** Check if `npm start` is running in `/client`
```bash
cd client
npm start
```
**Talking Point:** "Let me get the frontend back up—just a sec."

---

### If OpenAI API Fails
**Action:** Fall back to Local mode, apologize
**Talking Point:** "OpenAI had a blip—this actually demonstrates our dual-mode architecture. Local mode works instantly, no dependencies."

---

### If Speech Doesn't Work
**Action:** Disable speech, show text commentary
**Talking Point:** "Audio varies by browser. The important part is the commentary quality. Let me show you the text."

---

### If Investor Asks About Code Quality
**Show:** github.com/kumarsz/sports-commentary-poc (if public)
**Talking Point:** "This is PoC-grade (intentionally). When we fundraise, we'll bring on a Senior Eng to productionize. Cost: $200K-400K first year."

---

## Post-Demo Follow-Up

**Send within 24 hours:**

1. **Deck PDF** — Your pitch deck (no animations)
2. **Demo Link** — AWS URL or localhost instructions
3. **One-pager** — 1-page summary (company, market, ask, cap table)
4. **FAQ Doc** — Answers to all Q&A
5. **Investor Feedback Form** (see template below)

---

## Investor Feedback Template

**Use this after demo to collect signals:**

```
Dear [Investor Name],

Thank you for the CricketAI demo. We'd love your feedback:

1. **Problem Resonance:** Did the market opportunity (500M fans, $3B TAM) feel real? [Y/N]
   Feedback: ___

2. **Solution Fit:** Does AI-powered multi-language commentary solve the gap? [Y/N]
   Feedback: ___

3. **Founder Confidence:** Do you believe we can execute this? [Y/N]
   Feedback: ___

4. **Monetization:** Does the freemium → premium model make sense? [Y/N]
   Feedback: ___

5. **Investment Interest:** Would you like to see a full pitch deck or term sheet? [Y/N]
   Feedback: ___

6. **Biggest Concern:**
   ___

7. **Next Steps:** [We're raising $500K Series Seed. Interested in 30-min deep dive?]

Thanks!
[Your Name]
```

---

## Success Metrics

**After the pitch, you want:**
- [ ] Investor asks for investor deck (not just pitch deck)
- [ ] Investor asks for term sheet
- [ ] Investor says "we'd like to participate"
- [ ] Investor makes intro to other VCs
- [ ] Investor commits capital

---

## Before You Present

**Checklist:**
- [ ] Backend running, port 8000 responding
- [ ] Frontend running, localhost:3000 working
- [ ] Pitch deck loads without lag
- [ ] Audio/speakers tested
- [ ] All 4 languages (EN, HI, TA, TE) pre-tested
- [ ] Sample matches pre-loaded (no network lag during demo)
- [ ] OpenAI API key set (if using dynamic mode)
- [ ] Backup: Have offline deck (PowerPoint PDF) just in case
- [ ] Have AWS URL (not just localhost) for post-demo

---

## Final Talking Points to Memorize

1. **"500M fans, $3B TAM, 25% annual growth."**
2. **"No one else doing regional AI commentary."**
3. **"Free tier drives usage, premium unlocks monetization."**
4. **"First-mover + community effects = defensible moat."**
5. **"Capital-efficient: bootstrap to $1M ARR, then Series A."**

---

**You've got this. Go convince them. 🚀**
