# CricketAI - Quick Start (Next 3-4 Hours)

**Goal:** Get pitch-ready in 3-4 hours  
**Time:** Now until demo time  
**Status:** Everything is prepared, this is execution

---

## If You Have 3 Hours (FAST TRACK)

### Hour 1: Quick Local Test (30 min)
```bash
# Terminal 1
cd ~/IdeaProjects/sports-commentary-poc
npm install --legacy-peer-deps  # If needed
node server/index.js
# Wait for: ⚡ Express server running on http://localhost:8000

# Terminal 2 (new tab)
cd client
npm install
npm start
# Wait for: Compiled successfully! Local: http://localhost:3000
```

### Hour 1: Quick Visual Check (30 min)
```bash
# Open browser tabs
1. http://localhost:3000/pitch-deck.html
2. http://localhost:3000  # (Match list)
3. http://localhost:3000/match/1  # (Live demo)
```

**Visual Checklist (3 minutes):**
- [ ] Pitch deck loads, slides work (← →, click next)
- [ ] Match list shows 3+ matches
- [ ] Live match page shows demo banner (🎬 DEMO MODE)
- [ ] Scoreboard visible
- [ ] Controls visible (language, speed, AI mode, speech)

**If all ✅, proceed. If ❌, debug (see troubleshooting below).**

---

### Hour 2: Practice Pitch (60 min)
```bash
# Open DEMO_SCRIPT.md
cat ~/IdeaProjects/sports-commentary-poc/DEMO_SCRIPT.md | less

# Read Phase 1 (Pitch Deck) section carefully
# Read Phase 2 (Live Demo) section carefully
```

**Practice Flow:**
1. Open pitch deck (`http://localhost:3000/pitch-deck.html`)
2. Read the talking points from DEMO_SCRIPT.md
3. Do ONE full run-through (should take ~7 min)
4. Time yourself with stopwatch
5. Read Q&A answers from DEMO_SCRIPT.md

**Target:** 15 minutes total (5 pitch + 8 demo + 2 Q&A)

---

### Hour 3: Final Polish (30 min)
```bash
# Check for any obvious bugs
# Test in different browser (Chrome, Safari, Firefox)
# Make sure audio/speakers work
```

**Final Checklist:**
- [ ] Backend running, no errors
- [ ] Frontend fast, responsive
- [ ] All controls working
- [ ] Audio playback working (if needed)
- [ ] Pitch deck smooth transitions
- [ ] Comfortable with demo flow

**Status:** 🚀 **READY TO DEMO**

---

## If You Have 6-8 Hours (FULL TRACK)

### Hour 1-2: AWS Deployment (Optional but Recommended)
```bash
# If deploying to AWS EC2:
# Follow AWS_DEPLOYMENT_GUIDE.md exactly
# Time: 30-45 minutes
# Result: Public URL like http://54.123.45.67/
# This looks more professional than localhost
```

### Hour 2-3: Full Local Testing
```bash
# Run LOCAL_TESTING_CHECKLIST.md
# Tests: API, Frontend, Simulation, Languages, TTS, Pitch Deck
# Estimated: 45 minutes
# Target: 95%+ pass rate
```

### Hour 3-4: Rehearsal & Practice
```bash
# Same as "Hour 2" above
# But do 2-3 full run-throughs
# Time yourself each time
# Get comfortable with transitions
```

### Hour 4+: Buffer & Polish
- Review FAQ answers
- Practice handling objections
- Prepare backup talking points
- Print hardcopy of pitch deck (PDF)

---

## Ultra-Quick Demo (If Low on Time)

**Absolute minimum to impress:**

1. **Open Pitch Deck** (http://localhost:3000/pitch-deck.html)
   - Show cover, problem, solution, market, roadmap (3 min)

2. **Show Live App** (http://localhost:3000/match/1)
   - Click "Start Live Simulation"
   - Let 5-10 balls play with English + Local mode
   - Read commentary to show analytical tone
   - Switch to Hindi, let 3-5 balls play
   - (4 min)

3. **Answer Q&A** (2 min)
   - Use FAQ answers from DEMO_SCRIPT.md

**Total:** 9 minutes, still impressive.

---

## Troubleshooting (Quick Fixes)

### "Backend won't start"
```bash
# Check if port 8000 is in use
lsof -i :8000
# Kill if needed
kill -9 [PID]
# Try again
node server/index.js
```

### "Frontend won't start"
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

### "Pitch deck won't load"
- Check file exists: `~/IdeaProjects/sports-commentary-poc/pitch-deck.html`
- Try direct file path: `file:///Users/kumarsaminathan/IdeaProjects/sports-commentary-poc/pitch-deck.html`

### "Match page won't load"
- Verify backend is running (check Terminal 1)
- Check http://localhost:8000/api/matches returns data
- If not, restart backend

### "No audio/speech"
- Check browser supports Web Speech API (Chrome, Safari, Edge do)
- Enable microphone/speakers
- If still no audio, just show text commentary instead

---

## During Demo (Remember)

### Tone
- **Calm** (you built a real product, act like it)
- **Confident** (you know this market)
- **Collaborative** (invite investor into the story)

### Key Phrases to Use
1. "500M cricket fans, zero personalized commentary"
2. "We're not competing with broadcast, we're complementing it"
3. "Free tier drives discovery, premium unlocks AI"
4. "This is a working PoC, not a pitch video"
5. "Series A timeline: 18 months to $1M ARR"

### If Something Breaks
- **Stay calm** ("This is a PoC, not production")
- **Have a backup** (show the code, show the data)
- **Move on** ("Let me show you another angle...")
- **Follow up** ("I'll send you a video of this working fully")

---

## Demo Flow (Exact Sequence)

```
0:00 - Cover Slide
  Talk: "Hi, I'm [Your Name]. We built CricketAI for India's 500M cricket fans."
  Next slide →

1:00 - Problem Slide
  Talk: "There's a gap between static scores and live broadcast..."
  Next slide →

2:00 - Solution Slide
  Talk: "CricketAI delivers real-time AI commentary in multiple languages..."
  Next slide →

3:00 - Market Slide
  Talk: "Here's why this matters: $3B market, 25% annual growth..."
  Next slide →

4:00 - Competitive Slide
  Talk: "We're first-mover in regional AI commentary..."
  Next slide →

5:00 - Business Model Slide
  Talk: "We monetize: free tier drives 500M, premium converts 5%..."
  Next slide →

5:30 - Roadmap Slide
  Talk: "Three phases: APIs, mobile, multi-sport..."
  Next slide →

6:00 - SWITCH TO LIVE APP
  Click: http://localhost:3000/match/1
  Wait for match page to load

6:30 - Show Controls
  Talk: "Look at these demo controls: language, speed, AI mode..."
  Start simulation: Click ▶️

7:00 - Run Simulation (English, Local, 0.5x speed)
  Watch 5-10 balls play
  Read commentary out loud: "Notice the analytical tone..."

8:00 - Switch Language to Hindi
  Pause sim
  Change dropdown to Hindi
  Wait 3 sec
  Resume sim for 3 balls
  Talk: "Same balls, different language. This unlocks 500M regional fans."

9:00 - Closing
  Talk: "This is what we built. Market is real. Ask is $500K-$2M Series Seed."

9:15 - Q&A
  Listen, answer with facts
  Use FAQ answers from DEMO_SCRIPT.md

10:00 - Thank you + Follow-up
  "I'll send you the full pitch deck and a video of the app. Let's stay in touch."
```

---

## Files You'll Reference During Demo

| File | Purpose | When |
|------|---------|------|
| `pitch-deck.html` | Visual slides | First 5 min |
| `DEMO_SCRIPT.md` | Talking points | Throughout |
| Live app (localhost:3000) | Working product | Last 8 min |
| `FAQ` section in DEMO_SCRIPT.md | Q&A answers | Last 2 min |

---

## Post-Demo (What to Send)

**Within 24 hours, send investor:**

1. **PDF of pitch deck** (export pitch-deck.html as PDF)
2. **One-pager** (see template in PITCH_READY_SUMMARY.md)
3. **Demo video** (optional: screen recording of app in action)
4. **GitHub link** (if open-source: https://github.com/kumarsz/sports-commentary-poc)
5. **Contact info** for follow-up

---

## Success = Investor Says

**One of these:**
- "We'd like to see a full pitch deck"
- "Can we do a technical deep dive?"
- "We're interested in participating"
- "I'd like to introduce you to [other VCs]"

**NOT:**
- "Let us know when you're further along"
- "We only invest in Series A"
- "Market is too small"

If you get the latter, ask: **"What would change your mind?"** and iterate.

---

## FINAL CHECKLIST (1 Hour Before Demo)

- [ ] Backend running (`node server/index.js`)
- [ ] Frontend running (`npm start`)
- [ ] Pitch deck loads (http://localhost:3000/pitch-deck.html)
- [ ] App loads (http://localhost:3000/match/1)
- [ ] Audio/speakers tested
- [ ] Demo script reviewed
- [ ] Q&A answers memorized
- [ ] Laptop plugged in
- [ ] Notes printed
- [ ] Deep breaths taken ✓

---

## You're Ready 🚀

**Everything is prepared.**
**Every slide is written.**
**Every talking point is scripted.**
**Every Q&A is answered.**

Now just **execute it** with confidence.

The PoC is solid. The market is real. The story is compelling.

**Go win the funding. 🎯**

---

**Good luck!**  
— Your AI Co-Founder

P.S. If anything breaks, it's not a big deal. The backup talking point is: "This is PoC-grade. When we fundraise, our first hire is a senior engineer to productionize." Investors respect scrappiness. Just keep moving forward.
