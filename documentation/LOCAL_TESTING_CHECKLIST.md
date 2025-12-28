# CricketAI - Local Testing Checklist

**Before investor demo, test these scenarios locally.**

**Time:** 30 minutes  
**Environment:** macOS, Node.js v18+, npm

---

## Pre-Test Setup

```bash
# Terminal 1: Start Backend
cd /Users/kumarsaminathan/IdeaProjects/sports-commentary-poc
npm install  # If not already done
node server/index.js

# Expected Output:
# ⚡ Express server running on http://localhost:8000
# API Endpoints Ready:
#   ✓ GET /api/matches
#   ✓ GET /api/matches/:id
#   ✓ GET /api/matches/:id/balls
```

```bash
# Terminal 2: Start Frontend
cd /Users/kumarsaminathan/IdeaProjects/sports-commentary-poc/client
npm install  # If not already done
npm start

# Expected Output:
# Compiled successfully!
# On Your Network: http://192.168.x.x:3000
# Local: http://localhost:3000
```

---

## Test 1: API Endpoints

### Test 1.1: Get Match List
```bash
curl http://localhost:8000/api/matches | jq .
```

**Expected:**
```json
[
  {
    "id": "1",
    "team_a": "India",
    "team_b": "Australia",
    ...
  }
]
```

**Status:** ✅ PASS / ❌ FAIL

---

### Test 1.2: Get Single Match
```bash
curl http://localhost:8000/api/matches/1 | jq .
```

**Expected:**
```json
{
  "id": "1",
  "team_a": "India",
  "team_a_logo": "🇮🇳",
  ...
}
```

**Status:** ✅ PASS / ❌ FAIL

---

### Test 1.3: Get Balls (Local Mode)
```bash
curl "http://localhost:8000/api/matches/1/balls?language=en&aiMode=local" | jq . | head -50
```

**Expected:**
```json
[
  {
    "ball_number": 1,
    "bowler": "...",
    "batter": "...",
    "runs": 0,
    "event": "dot",
    "commentary": "Bowler maintained tight control...",
    ...
  }
]
```

**Check:**
- [ ] Commentary exists
- [ ] Commentary is analytical (not hyper-enthusiastic)
- [ ] All fields populated

**Status:** ✅ PASS / ❌ FAIL

---

## Test 2: Frontend - Match List Page

### Test 2.1: Load App
- **URL:** http://localhost:3000
- **Expected:** Match list page loads with clickable matches

**Check:**
- [ ] Page loads in <2 seconds
- [ ] Shows 3+ matches
- [ ] Each match is clickable

**Status:** ✅ PASS / ❌ FAIL

---

### Test 2.2: Navigation
- **Action:** Click on first match
- **Expected:** Redirects to live match page

**Check:**
- [ ] URL changes to `/match/1` or similar
- [ ] Match details load (team names, venue)
- [ ] Scoreboard visible

**Status:** ✅ PASS / ❌ FAIL

---

## Test 3: Frontend - Live Match Page

### Test 3.1: Demo Banner Visible
- **Expected:** Purple "🎬 DEMO MODE" banner at top

**Status:** ✅ PASS / ❌ FAIL

---

### Test 3.2: Controls Visible
**Check all controls present:**
- [ ] **▶️ Start Live Simulation** button
- [ ] 🌍 Language dropdown (EN, HI, TA, TE)
- [ ] ⚡ Speed dropdown (0.5x - 2x)
- [ ] 🤖 AI Mode dropdown (Local, OpenAI)
- [ ] 🔊 Speech toggle
- [ ] Voice selector (when speech enabled)
- [ ] Speech rate slider

**Status:** ✅ PASS / ❌ FAIL

---

## Test 4: Simulation (Local Mode)

### Test 4.1: Start Simulation
1. Ensure **Language:** English
2. Ensure **AI Mode:** Local
3. Ensure **Speed:** 0.5x (Slow)
4. Ensure **Speech:** Disabled (for first test)
5. Click **▶️ Start Live Simulation**

**Expected:**
- Ball counter increments (Ball 1/N, Ball 2/N, etc.)
- Commentary text appears for each ball
- Score updates
- Speed controls simulation pace

**Check:**
- [ ] Simulation starts without error
- [ ] Ball counter increments smoothly
- [ ] Score updates correctly
- [ ] Speed control slows/speeds up balls
- [ ] No console errors

**Status:** ✅ PASS / ❌ FAIL

---

### Test 4.2: Pause/Resume
1. During simulation, click **⏸️ Pause**
2. Verify simulation stops
3. Click **▶️ Resume** (or ▶️ Start again)
4. Verify simulation resumes

**Status:** ✅ PASS / ❌ FAIL

---

## Test 5: Commentary Quality (Analytical Tone)

### Test 5.1: Read Sample Commentary
While simulation is paused or after few balls, read the commentary displayed.

**Expected Tone:**
- "Bowler maintained tight control..."
- "The batter identified a gap and pushed for the single..."
- "Well-timed shot finds the boundary. The batter capitalized..."

**NOT Expected (old hyper-enthusiastic style):**
- "BOOM! That's a six!"
- "Absolute carnage!"
- "The King Kohli gets going!"

**Check:**
- [ ] Commentary sounds analytical
- [ ] Commentary mentions technique/strategy
- [ ] Commentary avoids all-caps exclamations
- [ ] Commentary mentions bowler/batter names

**Status:** ✅ PASS / ❌ FAIL

**Sample Commentary Quality Rating:** 1/5 ⭐ (Needs Work) → 5/5 ⭐ (Excellent)

---

## Test 6: Language Switching

### Test 6.1: Switch to Hindi
1. Pause simulation
2. Change **Language** dropdown to "Hindi (HI)"
3. Wait 2-3 seconds for UI to update
4. Check that commentary text reloads

**Expected:**
- Commentary text changes to Hindi (Devanagari script)
- Example: "गेंदबाज ने तंग नियंत्रण..."

**Status:** ✅ PASS / ❌ FAIL

---

### Test 6.2: Switch to Tamil
1. Pause simulation
2. Change **Language** dropdown to "Tamil (TA)"
3. Wait 2-3 seconds

**Expected:**
- Commentary text in Tamil script
- Example: "வீச்சாளர் இறுக்கமான கட்டுப்பாட்டை பராமரித்தார்..."

**Status:** ✅ PASS / ❌ FAIL

---

### Test 6.3: Switch to Telugu
1. Pause simulation
2. Change **Language** dropdown to "Telugu (TE)"
3. Wait 2-3 seconds

**Expected:**
- Commentary text in Telugu script
- Example: "బౌలర్ కఠోర నియంత్రణ నిర్వహించాడు..."

**Status:** ✅ PASS / ❌ FAIL

---

## Test 7: Speech Synthesis (TTS)

### Test 7.1: Enable Speech
1. Check **🔊 Enable Speech** checkbox
2. Verify voice selector appears
3. Verify speech rate slider appears

**Status:** ✅ PASS / ❌ FAIL

---

### Test 7.2: Play Speech (Local Language)
1. Make sure **Language:** English
2. Make sure **AI Mode:** Local
3. Scroll to **Ball-by-Ball Replay** section (bottom)
4. Find a ball's commentary
5. Click the 🔊 button next to commentary

**Expected:**
- Browser starts speaking the commentary
- Audio plays through speakers
- Quality is understandable (browser TTS can sound robotic)

**Check:**
- [ ] Audio plays
- [ ] Audio is in English
- [ ] Volume is audible
- [ ] Speech rate slider controls speed

**Status:** ✅ PASS / ❌ FAIL

---

### Test 7.3: Play Speech (Different Language)
1. Switch **Language** to Hindi (HI)
2. Click 🔊 button again
3. Verify audio plays in Hindi

**Expected:**
- Audio plays in Hindi accent/voice
- Different from English

**Status:** ✅ PASS / ❌ FAIL

---

## Test 8: Ball History & Replay

### Test 8.1: Ball History Populates
1. Run simulation for 5-10 balls
2. Scroll to **Ball-by-Ball Replay** section
3. Verify 5-10 balls are listed

**Expected:**
```
Ball 1 | DOT • 0R | Commentary text... 🔊
Ball 2 | SINGLE • 1R | Commentary text... 🔊
...
```

**Status:** ✅ PASS / ❌ FAIL

---

### Test 8.2: Replay Individual Ball Commentary
1. Click 🔊 button on any ball in history
2. Verify audio plays that ball's commentary

**Status:** ✅ PASS / ❌ FAIL

---

## Test 9: AI Mode Switch (If OpenAI API Key Available)

### Test 9.1: Paste OpenAI API Key
1. **Important:** Only do this if you have a valid OpenAI API key
2. Find the API Key input field
3. Enter your key: `sk-...`
4. Wait 2-3 seconds for validation

**Expected:**
- ✅ Key Valid message appears (if key is valid)
- 🔄 Validating spinner appears briefly

**Status:** ✅ PASS / ❌ FAIL

---

### Test 9.2: Switch to OpenAI Mode
1. Change **AI Mode** from "Local" to "OpenAI"
2. Wait 5-10 seconds (API loads new balls)

**Expected:**
- Balls reload with OpenAI commentary
- Commentary is more creative/detailed
- No errors in console

**Check:**
- [ ] Commentary changed
- [ ] Longer, more nuanced text
- [ ] Still analytical tone (not hyper-enthusiastic)

**Status:** ✅ PASS / ❌ FAIL

---

### Test 9.3: Compare Local vs OpenAI
1. Read OpenAI commentary
2. Switch back to Local
3. Compare quality/creativity

**Expected Observations:**
- **Local:** Formulaic ("Bowler maintained control. Dot ball.")
- **OpenAI:** More creative ("The bowler's strategy was evident—line and length discipline restricted opportunities.")

**Status:** ✅ PASS / ❌ FAIL

---

## Test 10: Pitch Deck

### Test 10.1: Load Pitch Deck
- **URL:** http://localhost:3000/pitch-deck.html
- **Expected:** Deck loads with slides visible

**Status:** ✅ PASS / ❌ FAIL

---

### Test 10.2: Navigation
1. Click **Next →** button
2. Verify slide transitions smoothly
3. Click **Previous ←** button
4. Verify slide transitions backward

**Status:** ✅ PASS / ❌ FAIL

---

### Test 10.3: Keyboard Navigation
1. Press **→ (Right Arrow)** key
2. Verify next slide appears
3. Press **← (Left Arrow)** key
4. Verify previous slide appears
5. Press **Spacebar**
6. Verify next slide appears

**Status:** ✅ PASS / ❌ FAIL

---

### Test 10.4: Slide Content
- [ ] Cover slide shows "CricketAI"
- [ ] Problem slide has market comparison
- [ ] Solution slide lists features
- [ ] Market slide shows stats
- [ ] Demo slide has working app demo
- [ ] Closing slide has investment ask

**Status:** ✅ PASS / ❌ FAIL

---

## Test 11: Responsive Design

### Test 11.1: Desktop View (1920x1080)
- [ ] All controls visible
- [ ] No horizontal scrolling
- [ ] Commentary readable

**Status:** ✅ PASS / ❌ FAIL

---

### Test 11.2: Laptop View (1366x768)
- [ ] Controls still visible (may stack)
- [ ] Scoreboard readable
- [ ] Commentary section works

**Status:** ✅ PASS / ❌ FAIL

---

## Test 12: Error Handling

### Test 12.1: Invalid Match ID
- **URL:** http://localhost:3000/match/99999
- **Expected:** Error message or redirect

**Status:** ✅ PASS / ❌ FAIL

---

### Test 12.2: API Unreachable
1. Stop backend server
2. Try to load match page
3. **Expected:** "Failed to load match data" error

**Status:** ✅ PASS / ❌ FAIL

---

### Test 12.3: Recover from Error
1. Restart backend server
2. Click **Retry** button
3. **Expected:** Match loads successfully

**Status:** ✅ PASS / ❌ FAIL

---

## Test 13: Performance

### Test 13.1: Page Load Time
- **URL:** http://localhost:3000/match/1
- **Time:** Should load in <3 seconds
- **Tool:** Chrome DevTools > Network

**Status:** ✅ PASS / ❌ FAIL

---

### Test 13.2: Simulation Smoothness
- Run simulation for 20+ balls
- Verify no lag or jank
- Verify ball counter increments smoothly

**Status:** ✅ PASS / ❌ FAIL

---

## Test 14: Console Errors

### Test 14.1: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Run full simulation cycle
4. **Expected:** No errors, only info/warnings

**Check:**
- [ ] No red error messages
- [ ] No CORS errors
- [ ] No 404 errors for assets

**Status:** ✅ PASS / ❌ FAIL

---

## Test 15: Accessibility

### Test 15.1: Keyboard Navigation
- [ ] Can tab through all controls
- [ ] Can use arrow keys in dropdowns
- [ ] Can press Spacebar for buttons

**Status:** ✅ PASS / ❌ FAIL

---

### Test 15.2: Color Contrast
- [ ] Text is readable against backgrounds
- [ ] Demo banner is clearly visible

**Status:** ✅ PASS / ❌ FAIL

---

## Summary

**Total Tests:** 45+

**Passing:** _____ / 45
**Failing:** _____ / 45
**Success Rate:** ____%

---

## Critical Fixes Required (if failing)

| Issue | Priority | Fix |
|-------|----------|-----|
| --- | --- | --- |
| | | |

---

## Nice-to-Have Improvements

- [ ] Add loading skeleton for match details
- [ ] Add confetti animation on 6-run shot
- [ ] Add match stats display
- [ ] Add player photos
- [ ] Improve mobile responsiveness

---

## Ready for Demo? ✅

- [ ] All critical tests passing
- [ ] No console errors
- [ ] Audio working
- [ ] All languages rendering
- [ ] Pitch deck navigating smoothly
- [ ] 15-min demo script reviewed

**Status:** 🚀 READY FOR DEMO

---

**Test completed on:** _______________  
**Tested by:** _______________  
**Browser/OS:** Chrome on macOS

