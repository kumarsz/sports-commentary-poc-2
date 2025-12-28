# CricketAI PoC - Comprehensive Logging Guide

## Overview
The server logs detailed information about OpenAI API connections, ball-by-ball processing, input data, and generated commentary. This helps you debug and verify the system is working correctly.

---

## Log Locations

### Server Logs
**File:** `server.log` (in project root)

**View live logs:**
```bash
tail -f server.log
```

**Clear logs before testing:**
```bash
> server.log  # Clear the file
```

---

## Startup Logging

When the server starts, you'll see:

```
⚠️  OPENAI_API_KEY not set. OpenAI commentary generation will be unavailable.
(if env var is set, you'll see ✅ OpenAI API initialized successfully)

╔════════════════════════════════════════╗
║    CricketAI PoC Backend Server       ║
╠════════════════════════════════════════╣
║  Running on http://localhost:8000       ║
║  Serving match data from /data folder  ║
╚════════════════════════════════════════╝
```

**What it means:**
- ✅ Server started successfully
- ⚠️ OpenAI is not available via server env var (but you can pass API key via frontend)

---

## API Key Validation Logging

### When User Enters API Key in Frontend

**Request:** User enters API key and hits "Validate"

**Frontend calls:** `GET /api/validate-openai-key`

**Server logs:**
```
🔐 Validating OpenAI API key with test request...
[VALIDATION] OpenAI API key validation successfully
```
Or on failure:
```
[VALIDATION] OpenAI API key validation failed: 401 Incorrect API key provided: sk-proj-...
```

**What to look for:**
- ✅ `successfully` = Key is valid, quota OK
- ❌ `401 Incorrect API key` = Wrong key format or invalid
- ❌ `429 quota exceeded` = Quota limit hit, need to add credits

---

## Ball-by-Ball Commentary Generation Logging

### When User Clicks "Start Simulation"

**Request:** Frontend fetches balls with `?aiMode=openai&language=en`

**Server logs - Header:**
```
📍 [/api/matches/ipl-2024-mi-vs-rcb/balls] Request received
   Language: en
   AI Mode: openai
   Client Key Provided: Yes (will validate)
   Total Balls: 120
   → Generating commentary with OpenAI for 120 balls...
```

**Per-Ball Logging (NEW):**

For each ball processed:

```
🔐 Validating OpenAI API key with test request...
✅ OpenAI API key validated successfully
   🎾 Ball #1: INPUT → {"bowler":"Bumrah","batter":"Virat","runs":0,"event":"dot"}
   🎙️  Ball #1: OUTPUT → "Bumrah starts with a dot! Virat watchful, plays it down the line."
   🎾 Ball #2: INPUT → {"bowler":"Bumrah","batter":"Virat","runs":1,"event":"single"}
   🎙️  Ball #2: OUTPUT → "Single! Virat opens his account with a neat single down the line!"
   🎾 Ball #3: INPUT → {"bowler":"Bumrah","batter":"Virat","runs":4,"event":"four"}
   🎙️  Ball #3: OUTPUT → "FOUR! Virat unleashes a beautiful cover drive! Pure class!"
```

**Key elements:**

| Symbol | Meaning |
|--------|---------|
| 🎾 | Input ball data sent to OpenAI |
| 🎙️ | Output commentary received from OpenAI |
| ✅ | Success |
| ❌ | Error |
| 🔐 | Validation attempt |

---

## Understanding the Per-Ball Logs

### INPUT Format
```
🎾 Ball #1: INPUT → {"bowler":"Bumrah","batter":"Virat","runs":0,"event":"dot"}
```

**This shows:**
- Ball number: `#1`
- Bowler name: `Bumrah`
- Batter name: `Virat`
- Runs scored: `0`
- Event type: `dot` (could be `four`, `six`, `wicket`, etc.)

### OUTPUT Format
```
🎙️  Ball #1: OUTPUT → "Bumrah starts with a dot! Virat watchful, plays it down the line."
```

**This shows:**
- Ball number: `#1`
- Generated commentary text from OpenAI

---

## Error Logging Examples

### Invalid API Key
```
[VALIDATION] OpenAI API key validation failed: 401 Incorrect API key provided: sk-proj-test
```
**Fix:** Check API key format, regenerate from https://platform.openai.com/account/api-keys

### Quota Exceeded (429)
```
❌ OpenAI API key validation failed: 429 You exceeded your current quota
   → Returning 429 (Quota Exceeded)
```
**Fix:** Add credits to OpenAI account at https://platform.openai.com/account/billing/overview

### Empty Response
```
❌ Failed to generate commentary for ball 5: Empty response from OpenAI
```
**Fix:** Retry later, or check OpenAI service status

### Rate Limiting (Too Many Requests)
```
❌ Failed to generate commentary for ball 12: 429 Rate limit exceeded
```
**Fix:** Wait a minute before requesting again, or increase delays in the code

---

## Local Lookup Logging

When using local mode (no OpenAI):

```
📍 [/api/matches/ipl-2024-mi-vs-rcb/balls] Request received
   Language: en
   AI Mode: local
   Client Key Provided: No
   Total Balls: 120
   → Using local lookup tables for commentary
   ✅ Returned 120 balls with local commentary
```

**No per-ball logs** because lookups are instant (from `data/commentary-lookups.json`)

---

## Complete Flow Example: OpenAI Mode

```
========== STARTUP ==========
✅ OpenAI API initialized successfully

========== VALIDATION ENDPOINT CALL ==========
🔐 Validating OpenAI API key with test request...
✅ OpenAI API key validated successfully
[VALIDATION] OpenAI API key validation successfully

========== MATCH ENDPOINT CALL WITH 3 BALLS ==========
📍 [/api/matches/ipl-2024-mi-vs-rcb/balls] Request received
   Language: en
   AI Mode: openai
   Client Key Provided: Yes (will validate)
   Total Balls: 3
   → Generating commentary with OpenAI for 3 balls...
   🔐 Validating OpenAI API key with test request...
   ✅ OpenAI API key validated successfully
   🎾 Ball #1: INPUT → {"bowler":"Bumrah","batter":"Virat","runs":0,"event":"dot"}
   🎙️  Ball #1: OUTPUT → "Bumrah opens with a dot! Virat leaves it carefully."
   🎾 Ball #2: INPUT → {"bowler":"Bumrah","batter":"Virat","runs":4,"event":"four"}
   🎙️  Ball #2: OUTPUT → "FOUR! Virat punches through the covers, magnificent stroke!"
   🎾 Ball #3: INPUT → {"bowler":"Bumrah","batter":"Virat","runs":0,"event":"dot"}
   🎙️  Ball #3: OUTPUT → "Bumrah responds with another dot! The battle continues..."
   ✅ OpenAI generation successful - 3 balls processed
   ✅ Returned 3 balls with OpenAI commentary
```

---

## How to Use Logs for Debugging

### 1. Check If OpenAI Connected
```bash
grep "OpenAI API initialized" server.log
# Expected: ✅ OpenAI API initialized successfully
```

### 2. Check If Key Was Valid
```bash
grep "OpenAI API key validated" server.log
# Expected: ✅ successfully (or see error)
```

### 3. See All Ball Inputs
```bash
grep "🎾 Ball" server.log
# Shows: Ball #1, #2, #3... with input data
```

### 4. See All Outputs
```bash
grep "🎙️" server.log
# Shows: Generated commentary for each ball
```

### 5. Check for Errors
```bash
grep "❌\|error\|Error\|429\|401" server.log
# Shows: Any errors that occurred
```

### 6. Count Successful Balls
```bash
grep "🎙️" server.log | wc -l
# Example: 120 (means 120 balls were processed)
```

---

## Real-Time Monitoring

To watch logs as they happen:

```bash
# Terminal 1: Keep server running
npm run dev

# Terminal 2: Watch logs in real-time
tail -f server.log
```

Then test in another terminal or browser, and watch the logs appear in real-time.

---

## Log Retention

Logs are appended to `server.log`. To clear logs before a fresh test:

```bash
> server.log  # Truncate to empty
```

Or:

```bash
rm server.log  # Delete entirely (will be recreated on next run)
```

---

## Summary

With the enhanced logging, you can now:

✅ **Verify OpenAI connection** on startup
✅ **See API key validation** results in real-time
✅ **Track input data** sent to OpenAI for each ball
✅ **See output commentary** received from OpenAI
✅ **Debug errors** (quota, auth, rate limits, etc.)
✅ **Monitor overall flow** from request to response

**The logs tell the complete story of what your CricketAI system is doing! 🎙️📊**
