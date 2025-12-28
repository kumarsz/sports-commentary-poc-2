# Quick Pitch Test Guide

## What You Need to Know

**Web Speech API pitch control only works in Chrome and Edge.** Firefox and Safari ignore the pitch property completely (it's a browser limitation, not a code bug).

---

## Test Your Browser NOW

### Option 1: Copy-Paste Test (Fastest)

1. **Open your browser** (Chrome, Firefox, Safari, Edge)
2. **Press F12** to open DevTools
3. **Go to Console tab**
4. **Copy-paste this code:**

```javascript
const utter = new SpeechSynthesisUtterance("Four! What a shot!");
utter.pitch = 1.8;
console.log("Testing pitch in", navigator.userAgent.split(' ').slice(-2).join(' '));
console.log("Pitch property:", utter.pitch);
window.speechSynthesis.speak(utter);
```

5. **Listen:** 
   - **Chrome/Edge:** Should sound high-pitched ("Four! What a shot!" in high voice)
   - **Firefox/Safari:** Should sound normal pitch (monotone)

---

## Test in CricketAI App

### Steps:

1. **Start backend:**
   ```bash
   cd /Users/kumarsaminathan/IdeaProjects/sports-commentary-poc
   node server/index.js
   ```

2. **Start frontend:**
   ```bash
   cd client
   npm start
   ```

3. **Open browser:** http://localhost:3000/match/1

4. **Open DevTools:** F12 → Console tab

5. **Select settings:**
   - Language: English
   - Speed: 0.5x (Slow) - easier to hear pitch
   - AI Mode: **OpenAI (Creative)**
   - Enter your API key
   - Click "Load Commentary"

6. **Start simulation:** Click "▶️ Start Live Simulation"

7. **Watch console for pitch logs:**
   ```
   🎵 Pitch HIGH (1.8) applied: "[HIGH]Four![/HIGH]" Stokes fires...
   🎵 Pitch LOW (0.7) applied: "[LOW]Out...[/LOW]" bowled!
   ```

8. **Listen carefully:**
   - **Chrome/Edge:** You should hear pitch ups and downs
   - **Firefox/Safari:** Will be monotone

---

## Results by Browser

### ✅ Chrome (Any Version)
```
🌐 Browser Capabilities: {
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  speechSynthesisSupported: true,
  pitchSupported: true,  ← THIS WILL BE TRUE
  voices: 10
}
```
**Expected:** High pitch on [HIGH] commentary, low pitch on [LOW] commentary

### ✅ Edge (Any Version)
```
🌐 Browser Capabilities: {
  userAgent: "Mozilla/5.0 ... Edg/120.0.0.0",
  speechSynthesisSupported: true,
  pitchSupported: true,  ← THIS WILL BE TRUE
  voices: 10
}
```
**Expected:** High pitch on [HIGH] commentary, low pitch on [LOW] commentary

### ❌ Firefox
```
🌐 Browser Capabilities: {
  userAgent: "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
  speechSynthesisSupported: true,
  pitchSupported: false,  ← THIS WILL BE FALSE
  voices: 5
}
```
**Expected:** Monotone (no pitch control available in Firefox)

### ❌ Safari
```
🌐 Browser Capabilities: {
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  speechSynthesisSupported: true,
  pitchSupported: false,  ← THIS WILL BE FALSE
  voices: 10
}
```
**Expected:** Monotone (no pitch control available in Safari)

---

## For VC Demo

### ✅ Do This:
- Open app in **Chrome** or **Edge**
- Investors will hear clear pitch variations
- Dramatic difference between [HIGH] and [LOW] moments
- Impressive demo

### ❌ Don't Do This:
- Don't open in **Firefox** or **Safari** for demo
- Pitch won't work (browser limitation)
- Looks like a bug (but it's not)

---

## If Pitch Isn't Working in Chrome

If you're using Chrome but still don't hear pitch:

### Checklist:
- [ ] Using Chrome 90+ (pitch was added in Chrome 90)
- [ ] Speakers/headphones working (test with other audio)
- [ ] Volume is high enough (check OS volume + browser volume)
- [ ] Console shows `pitchSupported: true`
- [ ] Console shows `🎵 Pitch HIGH (1.8) applied:` messages
- [ ] Text includes [HIGH] or [LOW] markers

### Verify Pitch is Being Set:
```javascript
// In DevTools Console, run:
const utter = new SpeechSynthesisUtterance("Four!");
console.log("Before setting pitch:", utter.pitch);  // Should be 1
utter.pitch = 1.8;
console.log("After setting pitch:", utter.pitch);  // Should be 1.8
window.speechSynthesis.speak(utter);
```

If pitch doesn't show as 1.8 after setting, your browser has a bug.

---

## Summary

| Browser | Pitch Works | For VC Demo? |
|---------|-----------|-----------|
| Chrome | ✅ YES | ✅ YES - Use this |
| Edge | ✅ YES | ✅ YES - Use this |
| Opera | ✅ YES | ✅ YES - Can use |
| Firefox | ❌ NO | ❌ NO - Don't use |
| Safari | ❌ NO | ❌ NO - Don't use |

**Bottom line:** For the investor demo, use **Chrome** or **Edge**. Pitch will work perfectly.
