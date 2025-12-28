# OpenAI Integration Setup Guide

## Overview
CricketAI PoC now supports **two AI commentary generation strategies**:

1. **No AI (Local Lookups)** - Default, fast, free
   - Uses predefined templates from `data/commentary-lookups.json`
   - Zero API calls, zero cost
   - Deterministic output

2. **OpenAI-POC (Dynamic Generation)** - New, optional, requires API key
   - Generates unique, dramatic commentary for each ball
   - Uses OpenAI GPT-3.5-turbo model
   - ~1-2 seconds per ball (slower than local)
   - ~$0.30-1.50 per full match in API costs

---

## Quick Start with OpenAI

### 1. Get an API Key

1. Go to https://platform.openai.com/api-keys
2. Log in (create account if needed)
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-`)
5. **Keep it secret!** Don't commit to git.

### 2. Set Environment Variable

**Option A: Using .env file (Recommended)**
```bash
# In the project root directory
echo 'OPENAI_API_KEY=sk-your-api-key-here' > .env
```

**Option B: Set in your shell**
```bash
# For bash/zsh
export OPENAI_API_KEY="sk-your-api-key-here"

# For Windows cmd
set OPENAI_API_KEY=sk-your-api-key-here

# For PowerShell
$env:OPENAI_API_KEY="sk-your-api-key-here"
```

### 3. Start the Application

```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start frontend
cd client && npm start
```

### 4. Use OpenAI in the UI

1. Open http://localhost:3001
2. Click on a match (e.g., "Men's Ashes 2025-26")
3. In the **AI Mode** dropdown, select **"OpenAI-POC"**
4. The app will load and regenerate all commentary using OpenAI
5. Click **▶️ Simulate Live** to watch the match with dynamic commentary

---

## How It Works

### Backend Flow

```
User selects "OpenAI-POC" in UI
  ↓
Frontend calls /api/matches/:id/balls?aiMode=openai
  ↓
Backend checks if OPENAI_API_KEY is set
  ↓
If YES → Use openai-commentary.js to generate commentary
If NO → Show error and fall back to local mode
  ↓
For each ball:
  - Build prompt with ball data (bowler, batter, runs, event)
  - Send to OpenAI API
  - Get dramatic commentary back
  - Return to frontend
  ↓
Frontend plays audio + displays commentary
```

### Key Files

- **server/openai-commentary.js** - OpenAI API integration
  - `initializeOpenAI()` - Called at startup
  - `generateCommentaryWithOpenAI(ball, language)` - Single ball
  - `generateCommentaryForBallsWithOpenAI(balls, language)` - Batch
  
- **server/index.js** - Updated endpoint
  - `GET /api/matches/:id/balls?aiMode=openai` - New parameter

- **client/src/components/LiveMatch.js** - UI selector
  - AI Mode dropdown in controls
  - Handles loading state and fallback errors

---

## Examples of Generated Commentary

### Local Mode (Static Template):
> "Bumrah bowls a deadly yorker! Can the batter handle it?"

### OpenAI Mode (Dynamic):
> "Bumrah unleashes a perfect yorker! The batter barely gets a bat on it! What a delivery from the master!"

> "A short ball sails over the batter's head for four! That's outrageous! The fielder at fine leg can't do a thing!"

---

## Costs & Pricing

**OpenAI GPT-3.5-turbo pricing** (as of Dec 2024):
- Input: $0.50 per 1M tokens
- Output: $1.50 per 1M tokens

**Per ball estimate:**
- ~100 input tokens (ball description + prompt)
- ~50 output tokens (commentary)
- **Cost per ball:** ~$0.0005-0.0015

**Full match (300 balls):**
- **Total cost:** ~$0.15-0.45

**Test match (360-450 balls):**
- **Total cost:** ~$0.20-0.70

---

## Troubleshooting

### "OpenAI not configured" Error

**Problem:** You see an error message in the UI when selecting OpenAI-POC

**Solution:**
1. Check that `OPENAI_API_KEY` is set in your environment
2. Restart the backend (`npm run dev`)
3. The backend logs should show: `✅ OpenAI API initialized successfully`

### API Key Not Found

**Problem:** Backend shows `⚠️ OPENAI_API_KEY not set`

**Solution:**
```bash
# Check if the env variable is set
echo $OPENAI_API_KEY

# If empty, set it again
export OPENAI_API_KEY="sk-your-key"

# Then restart the backend
```

### Rate Limiting (Too Many Requests)

**Problem:** OpenAI returns 429 error after many requests

**Solution:**
- Wait a few minutes before trying again
- Use "No AI" mode to continue testing
- Consider a higher OpenAI tier if you hit limits frequently

### Slow Commentary Generation

**Problem:** Each ball takes 2-3 seconds to load

**Note:** This is expected! OpenAI API calls take ~1-2 seconds. Options:
- Use "No AI" mode for instant generation
- Increase speech rate to match longer generation time
- Run with slow simulation speed (0.33x or 0.5x)

---

## Disabling OpenAI (Reverting to Local Mode)

To remove OpenAI support and use only local lookups:

1. Unset the environment variable:
   ```bash
   unset OPENAI_API_KEY  # On macOS/Linux
   ```

2. Or remove the `.env` file:
   ```bash
   rm .env
   ```

3. The UI will only show "No AI" option (OpenAI-POC will still appear but fail with a helpful error)

---

## Future: Upgrading to Gemini API

When ready, you can swap OpenAI for Google's Gemini API:

1. Create `server/gemini-commentary.js` (similar structure to openai-commentary.js)
2. Update `server/index.js` endpoint to accept `?aiMode=gemini`
3. No frontend changes needed
4. Same user experience, different backend provider

---

## Questions?

- Check `ARCHITECTURE.md` for system design details
- Check `README.md` for general usage
- Review `.env.example` for all available environment variables
