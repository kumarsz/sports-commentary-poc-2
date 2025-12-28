# Copilot Session Context Template

## 📌 Session #[NUMBER]: [Session Goal/Focus]

**Date:** [Date]  
**Duration:** [Start - End time if tracked]

---

## 🎯 Session Goals

- [ ] Goal #1
- [ ] Goal #2
- [ ] Goal #3

*Example: "Implement multilingual commentary", "Fix validation loop", "Add TTS playback"*

---

## 📊 Current System State

### **Backend**
- Status: [Running ✅ / Stopped ❌ / Needs restart]
- Port: 8000
- Process: `node server/index.js`
- Last restart: [Timestamp]

### **Frontend**
- Status: [Running ✅ / Stopped ❌]
- Port: 3000
- Process: `npm start` (from /client)
- Last restart: [Timestamp]

### **OpenAI Integration**
- Status: [Key provided? / Valid? / Quota OK?]
- Mode: [Local / OpenAI / Hybrid]
- Known issues: [If any]

### **Data**
- Sample matches: [List files in /data]
- Lookups: [Current state of commentary-lookups.json]

---

## 🧠 Immediate Context to Remember

### **What We've Built So Far**
- ✅ Express.js backend with API endpoints (/api/matches, /api/matches/:id/balls)
- ✅ React frontend with live match simulation UI
- ✅ OpenAI integration with client-side API key validation
- ✅ Local commentary lookups (fallback when OpenAI unavailable)
- ✅ Real-time ball-by-ball commentary generation
- ✅ Multi-language support framework
- ✅ Comprehensive logging for debugging

### **Key Files & Their Purpose**

| File | Purpose | Status |
|------|---------|--------|
| `/server/index.js` | Express backend, API routes | Core ✅ |
| `/server/openai-commentary.js` | OpenAI integration, validation | Core ✅ |
| `/server/commentary-generator.js` | Local lookup-based generation | Core ✅ |
| `/client/src/components/LiveMatch.js` | Main React component, UI | Core ✅ |
| `/data/matches.json` | Available matches list | Sample data |
| `/data/balls.json` | Ball-by-ball events | Sample data |
| `/data/commentary-lookups.json` | Template-based commentary | Extensible |
| `VISION.md` | Strategic vision & requirements | Reference |
| `/documentation/ARCHITECTURE.md` | System design | Reference |
| `/documentation/LOGGING_GUIDE.md` | Logging reference | Reference |

### **Important Decisions Made**
1. **Local-first approach** - JSON files for data, no external APIs in PoC
2. **Dual AI mode** - Users toggle between local (free) and OpenAI (optional)
3. **Client-side API key** - User pastes key in UI, validated upfront, session-only
4. **Polling over WebSocket** - Simpler for PoC, can upgrade later
5. **Browser TTS** - Web Speech API for audio (offline, no API keys)
6. **PoC mindset** - Skip scaling, auth, monetization; prove concept only

### **Known Limitations**
- Local commentary templates are static (templates in commentary-lookups.json)
- TTS not yet implemented (framework ready, implementation pending)
- Only JSON data (no real sports APIs integrated)
- Single-user PoC (no persistence or auth)
- No database (JSON files sufficient)

---

## 🔄 Last Session Summary

**What was accomplished:**
- [List key changes/additions from previous session]

**What's left to do:**
- [Unfinished work]

**Known issues:**
- [Bugs or limitations discovered]

**Commits made:**
- [List recent commits if applicable]

---

## 📖 Reference Documents to Review

Before starting, reference these to refresh context:

1. **`VISION.md`** - Your strategic vision & requirements (read if unclear on scope)
2. **`/documentation/ARCHITECTURE.md`** - System design & data flow
3. **`/documentation/LOGGING_GUIDE.md`** - How to interpret logs
4. **`.github/copilot-instructions.md`** - Working agreement with Copilot
5. **`README.md`** - Setup and run instructions

---

## 🚀 How to Use This Session Context

**For the Copilot:**

> "This is a new session. Reference `/VISION.md` for the strategic context and this session document for immediate state. My goals for this session are: [list goals]. Here's what I want to build..."

**Expected Copilot behavior:**
- ✅ Understands the PoC scope (not production)
- ✅ Knows what's built already (won't duplicate work)
- ✅ References VISION.md when uncertain about scope
- ✅ Suggests architecture aligned with existing design
- ✅ Flags if requested work contradicts project constraints

---

## 📝 Session Notes

### **What I Built This Session:**
```
[Log changes, decisions, discoveries here as you work]

Example:
- Created /client/components/LanguageSelector.js
- Modified /server/openai-commentary.js to support custom prompts
- Fixed validation loop bug in LiveMatch.js (removed circular dependency)
```

### **Challenges Encountered:**
```
[Document blockers, workarounds, lessons learned]

Example:
- 429 quota error: OpenAI account needed credits
- Validation endpoint missing: Added GET /api/validate-openai-key
- Logging not showing per-ball details: Enhanced openai-commentary.js
```

### **Decisions Made:**
```
[Record architectural/technical decisions for future reference]

Example:
- Chose debounce over immediate validation to reduce API calls
- Kept session-only API keys (not stored in localStorage)
- Added per-ball logging to track OpenAI inputs/outputs
```

### **Follow-Up for Next Session:**
```
[Document incomplete work, next priorities]

Example:
- [ ] Implement TTS playback with Web Speech API
- [ ] Add language selector to UI
- [ ] Test with real OpenAI account (added credits)
```

---

## ✅ End-of-Session Checklist

- [ ] Code changes committed to git
- [ ] Logs reviewed for errors/issues
- [ ] Documentation updated if scope changed
- [ ] This session context updated for next session
- [ ] Backend/frontend tested (both work)
- [ ] No secrets left in unstaged files

---

## 🔗 Quick Links

- **GitHub Repo:** https://github.com/kumarsz/sports-commentary-poc-2.git
- **Vision:** `VISION.md` (root)
- **Architecture:** `/documentation/ARCHITECTURE.md`
- **Local setup:** `README.md`
- **Logging:** `/documentation/LOGGING_GUIDE.md`
- **Copilot instructions:** `/.github/copilot-instructions.md`

---

**Ready to start? Fill in the sections above with your session goals and current state!**
