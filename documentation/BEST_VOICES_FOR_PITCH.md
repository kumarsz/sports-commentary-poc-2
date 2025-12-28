# Best Voices for Pitch Control

When testing the pitch feature, **voice quality matters**. Some voices respond much better to pitch variations than others.

---

## Recommended Voices by OS

### 🪟 Windows

| Voice | Pitch Response | Recommendation |
|-------|---|---|
| **Microsoft Zira** | ✅ Excellent | 🏆 **BEST** - Very responsive to pitch changes |
| **Microsoft Mark** | ⚠️ Fair | Good, but less responsive |
| **Microsoft David** | ⚠️ Fair | Good, but less responsive |
| **Cortana** | ❌ Poor | Flat, not good for pitch |

**Recommended:** Use **Microsoft Zira** for best pitch effect

---

### 🍎 Mac

| Voice | Pitch Response | Recommendation |
|-------|---|---|
| **Samantha** | ✅ Excellent | 🏆 **BEST** - Most responsive to pitch |
| **Victoria** | ✅ Excellent | Great alternative |
| **Karen** | ✅ Good | Good pitch response |
| **Alex** | ⚠️ Fair | Older voice, less responsive |
| **Daniel** | ❌ Poor | Very flat, not good for pitch ❌ |

**Recommended:** Use **Samantha** or **Victoria** for best pitch effect

---

### 🐧 Linux

| Voice | Pitch Response | Recommendation |
|-------|---|---|
| **Google US English** | ✅ Excellent | 🏆 **BEST** - Very responsive |
| **eSpeak** | ⚠️ Fair | Limited quality |
| **Festival** | ⚠️ Fair | Limited quality |

**Recommended:** Use **Google US English** for best pitch effect

---

### 🌐 Google Cloud Voices (All OS)

| Voice | Pitch Response | Recommendation |
|-------|---|---|
| **Google UK English Male** | ✅ Excellent | 🏆 **BEST** - Excellent pitch response |
| **Google US English** | ✅ Excellent | Great alternative |
| **Google Australian English** | ✅ Good | Good pitch response |
| **Google Indian English** | ✅ Good | Good for Hindi/English mix |

**Recommended:** Use **Google UK English Male** for best pitch effect

---

## How CricketAI Selects the Best Voice

The app now **automatically selects a pitch-friendly voice**:

1. **Preferred Language Match:** Finds voices matching the selected language
2. **Pitch-Friendly Priority:** Prefers voices known to handle pitch well
3. **Fallback:** Uses any available voice if no pitch-friendly voice found

**Console Output:**
```
🎤 Selected voice for pitch: Microsoft Zira
```

---

## Why Voice Quality Matters for Pitch

### Bad Voice (Daniel - Flat)
```
[HIGH]Four![/HIGH] - Sounds like: "Four" (no pitch change)
[LOW]Out![/LOW] - Sounds like: "Out" (no pitch change)
Result: Monotone, no dramatic effect ❌
```

### Good Voice (Zira - Responsive)
```
[HIGH]Four![/HIGH] - Sounds like: "Four" (higher pitch, excited)
[LOW]Out![/LOW] - Sounds like: "Out" (lower pitch, tense)
Result: Dramatic, engaging, clear pitch effect ✅
```

---

## Testing on Your System

### Step 1: Check Available Voices
Open **DevTools (F12)** → **Console** and paste:
```javascript
window.speechSynthesis.getVoices().forEach(v => {
  console.log(v.name, '(' + v.lang + ')');
});
```

### Step 2: Test Pitch Response
```javascript
const utter = new SpeechSynthesisUtterance("Four!");
const voice = window.speechSynthesis.getVoices()
  .find(v => v.name.includes('Zira')); // Replace 'Zira' with your voice
if (voice) utter.voice = voice;
utter.pitch = 1.8;
window.speechSynthesis.speak(utter);
```

Listen for noticeable pitch increase.

### Step 3: Try Different Voices
Repeat Step 2 with different voice names to find the most responsive one.

---

## App Default Selection

The app now selects voices in this order of preference:

### English
1. Google UK English Male ✅
2. Google US English ✅
3. Microsoft Zira ✅
4. Samantha (Mac) ✅
5. Any English voice available

### Hindi
1. Google हिन्दी ✅
2. Any Hindi voice

### Tamil
1. Google தமிழ் ✅
2. Any Tamil voice

### Telugu
1. Google తెలుగు ✅
2. Any Telugu voice

---

## For VC Demo

### Preparation
Before the demo:
1. Open the app in Chrome/Edge
2. Check the console: `🎤 Selected voice for pitch: [voice name]`
3. **If you see a pitch-friendly voice → You're good!**
4. **If you see "Daniel" or another flat voice → Manually select a better voice from the dropdown**

### During Demo
> "Notice the voice has natural pitch variations. We've optimized for voices that respond well to pitch control—like Zira on Windows or Samantha on Mac."

---

## Troubleshooting

### "I'm not hearing pitch changes"

**Check 1: Voice Selection**
- Open voice dropdown in the app
- Look for: Zira, Samantha, Victoria, or Google voices
- **Don't use:** Daniel, Cortana, Alex

**Check 2: Console Verification**
```
🎤 Selected voice for pitch: Microsoft Zira ✅
🎵 Pitch HIGH (1.8) applied: "[HIGH]Four![/HIGH]"
```
If you see this, pitch is being applied. Problem is voice choice, not code.

**Check 3: Test Different Voice**
Manually select different voice from dropdown and retry.

**Check 4: Browser**
- Chrome/Edge: Pitch should work
- Firefox/Safari: Pitch doesn't work (browser limitation)

---

## Recommended Voices by Use Case

### For Best Dramatic Effect
**Windows:** Microsoft Zira
**Mac:** Samantha
**Linux:** Google US English
**Any OS:** Google UK English Male

### For Professional Sound
**Windows:** Microsoft Mark
**Mac:** Victoria
**Any OS:** Google Australian English

### For Neutral/Analytical
**Windows:** Microsoft David
**Mac:** Karen
**Any OS:** Google Indian English

---

## Summary

| OS | Best Voice | Pitch Response |
|---|---|---|
| Windows | **Zira** | ✅ Excellent |
| Mac | **Samantha** | ✅ Excellent |
| Linux | **Google US English** | ✅ Excellent |
| All | **Google UK English Male** | ✅ Excellent |

**TL;DR:** Use **Zira** (Windows), **Samantha** (Mac), or **Google UK English Male** (any OS) for the best pitch effect.

App now automatically selects the best available voice for your system! 🎤
