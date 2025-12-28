# CricketAI PoC - Vision & Strategic Requirements

## 🎯 Core Vision

**Goal:** Build a proof-of-concept web-based sports commentary application that delivers **AI-powered, real-time ball-by-ball cricket commentary in multiple regional languages** to India's 500M+ cricket fans.

**Key Differentiator:** Real-time, dramatic, personality-driven commentary in regional languages (Hindi, Tamil, Telugu, English)—filling the gap between static scores (Cricbuzz) and live broadcast availability.

**Approach:** Demonstrate the core flow works (live match data → AI generation → TTS → user interface) with minimal viable features.

---

## 📋 Strategic Requirements

### **Must-Have (PoC Phase)**
- [x] Live match selection & simulation
- [x] Ball-by-ball data ingestion (JSON-based)
- [x] AI-powered commentary generation (local lookups + OpenAI optional)
- [x] Real-time UI updates with commentary text
- [x] Multi-language support framework (English, Hindi, Tamil, Telugu)
- [x] OpenAI API integration with fallback to local mode
- [x] Comprehensive documentation & architecture guides

### **Should-Have (Nice-to-Have)**
- [ ] Text-to-speech (TTS) playback with browser Web Speech API
- [ ] Enhanced UI/UX (better styling, responsive design)
- [ ] Match replay functionality
- [ ] Player statistics display
- [ ] WebSocket real-time updates (currently using polling)
- [ ] Multilingual prompt engineering for better commentary

### **Out of Scope (Post-PoC)**
- ❌ Production scaling (multi-user, load balancing)
- ❌ User authentication & accounts
- ❌ Monetization (ads, premium tiers)
- ❌ External sports data APIs (Cricbuzz, ESPN, etc.)
- ❌ Mobile app (web-only for PoC)
- ❌ Database (SQLite, PostgreSQL—JSON files sufficient)
- ❌ Multi-sport support (cricket only)
- ❌ Advanced analytics & insights

---

## 🏗️ Technical Architecture

### **Tech Stack**
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React | Interactive UI, real-time updates, hooks-based |
| **Backend** | Node.js + Express | Lightweight, rapid prototyping, easy API integration |
| **AI Integration** | Local lookups → OpenAI API (PoC) → Gemini (future) | Start free, scale with API if needed |
| **Data** | JSON files (matches.json, balls.json) | No external dependencies, fully reproducible |
| **TTS** | Browser Web Speech API (future) | Offline, no API keys, simple PoC |
| **Deployment** | Local development | Runs entirely on developer laptop |

### **System Design**
```
Frontend (React, port 3000)
    ↓ REST API (axios)
Backend (Express, port 8000)
    ├→ Match Data Service (reads JSON)
    ├→ AI Commentary Generator (local or OpenAI)
    └→ TTS Handler (browser-side)
    ↓
Local Data Files (matches.json, balls.json, lookups.json)
```

### **Key Architectural Decisions**
1. **No External APIs Initially** - Use JSON mocks; replace later without code changes
2. **Dual AI Mode** - Local lookups (instant, free) + OpenAI (creative, optional)
3. **Client-Side TTS** - Browser Web Speech API keeps PoC offline
4. **Polling Over WebSocket** - Simpler for PoC; upgrade later if needed
5. **Stateless Backend** - Each request is independent; no session management
6. **Single API Key Input** - User can paste OpenAI key directly in UI (session-only)

---

## 🌍 Language & Localization Strategy

### **Supported Languages**
- **English** - Default, universal
- **Hindi** - Largest cricket audience in India
- **Tamil** - South Indian market
- **Telugu** - Growing market

### **Implementation**
- **Local Mode:** Pre-written commentary templates in each language (commentary-lookups.json)
- **OpenAI Mode:** Language-specific system prompts to generate dramatic commentary in target language
- **UI:** Language selector dropdown on live match page

---

## 🔌 AI Integration Strategy

### **Three Tiers (Designed for Easy Upgrade)**

**Tier 1: Local Lookups (Default, Free)**
```
Ball Data → Template Lookup → Predefined Commentary
Pros: Fast, offline, no API keys, fully reproducible
Cons: Limited creativity, static templates
```

**Tier 2: OpenAI API (PoC Option, Paid)**
```
Ball Data → OpenAI GPT-3.5-turbo → Dynamic Commentary
Pros: Dramatic, context-aware, multilingual
Cons: Slower (1-2s per ball), costs $, rate-limited
```

**Tier 3: Gemini API (Future, TBD)**
```
Ball Data → Google Gemini → Better cost/performance
Pros: Potentially cheaper, better quality
Cons: Requires integration work
```

### **User Control**
- Frontend dropdown: "AI Mode" = "Local" or "OpenAI"
- If OpenAI selected: User pastes API key in UI (session-only, not stored)
- If key invalid/quota exceeded: Auto-fallback to local mode
- No disruption to user experience

---

## 📊 Success Criteria for PoC

By end of PoC phase, the system should:

1. ✅ **Core Flow Works** - Match data → AI generation → UI display
2. ✅ **Multi-Mode** - Users can toggle between local and OpenAI commentary
3. ✅ **Language Support** - At least 2 languages functional (English + Hindi)
4. ✅ **Real-Time Feel** - Ball-by-ball simulation with realistic delays
5. ✅ **Error Handling** - Graceful fallback when APIs fail or quota exceeded
6. ✅ **Documentation** - Architecture, setup, and API docs clear
7. ✅ **Reproducible** - Anyone can clone, run locally, and test
8. ✅ **Upgrade Path Clear** - Easy to swap in real APIs/data later

---

## 🎓 Key Design Principles

### **1. Prove the Concept (Not Build for Scale)**
- Focus on demonstrating the core value proposition
- Skip non-essential features
- Use simple, local-first approaches
- Optimize for clarity, not performance

### **2. Minimize External Dependencies**
- Use JSON files instead of APIs
- Use browser APIs (Web Speech) instead of cloud services
- Make API integration *optional* (local fallback always works)
- Keep deployment simple (no Docker, no cloud required)

### **3. Make It Upgradeable**
- Architecture allows swapping local → real APIs without refactoring
- Multi-language support is built-in from day 1
- AI integration is pluggable (OpenAI → Gemini without code changes)
- Logging and monitoring ready for scale

### **4. Prioritize Developer Experience**
- Clear documentation for extending
- Meaningful error messages
- Detailed logging for debugging
- Simple setup: `npm install && npm run dev`

---

## 💡 User Journey (PoC)

```
1. User opens web app (localhost:3000)
   ↓
2. Sees list of cricket matches (from data/matches.json)
   ↓
3. Selects a match to simulate
   ↓
4. Optionally enters OpenAI API key (or skips for local mode)
   ↓
5. Clicks "Start Simulation"
   ↓
6. Sees live ball-by-ball events with AI-generated commentary
   ↓
7. Hears commentary via TTS (future)
   ↓
8. Can switch AI modes or languages mid-match
```

---

## 🚀 Phase Roadmap

### **Phase 1: Core PoC (DONE ✅)**
- Local match data & ball simulation
- Local lookup commentary generation
- OpenAI integration with client API key
- Basic React UI
- Real-time validation

### **Phase 2: Polish & Enhance (IN PROGRESS)**
- Improve UI/UX (styling, responsiveness)
- Add language selector
- Implement TTS playback
- Better error messages
- Comprehensive logging

### **Phase 3: Real-World Data (Future)**
- Integrate real cricket APIs (Cricbuzz, ESPN)
- Live match ingestion
- User accounts (optional)
- Analytics dashboard

### **Phase 4: Scale & Monetize (Post-PoC)**
- Production deployment
- Load balancing & caching
- Ad integration
- Premium features
- Mobile app

---

## 📝 Important Constraints & Notes

### **PoC Mindset**
- This is a **proof-of-concept, not production software**
- Focus on demonstrating the idea works, not on perfection
- Skip optimization, scaling, and non-essential features
- Use mockups/sample data instead of real APIs

### **Security Notes**
- ⚠️ API keys are **never stored** (session-only in frontend)
- ⚠️ `secret/` folder is in `.gitignore` (never commit API keys)
- ⚠️ Backend validates keys upfront (prevents cascading failures)
- ⚠️ Error messages don't leak sensitive info

### **Operational Notes**
- Backend runs on port 8000 (safe from browser blocking)
- Frontend runs on port 3000 (standard React dev port)
- Server logs to `server.log` for debugging
- All data is JSON (easy to inspect and modify)

---

## 🎯 High-Level Summary

**CricketAI PoC** is a minimal but complete demonstration that:
- AI can generate dramatic, personality-driven sports commentary
- Multiple languages are feasible (templates + API prompts)
- Real-time streaming of commentary is possible
- Local-first approach keeps the PoC simple and offline-capable
- Easy upgrade path to real APIs and scaling later

**Success = Proving the core idea works with minimal complexity.**

---

## 📚 Related Documents

- **Architecture:** `/documentation/ARCHITECTURE.md`
- **Logging Guide:** `/documentation/LOGGING_GUIDE.md`
- **Setup Instructions:** `/README.md`
- **OpenAI Setup:** `/documentation/OPENAI_SETUP.md`
- **Copilot Instructions:** `/.github/copilot-instructions.md`
