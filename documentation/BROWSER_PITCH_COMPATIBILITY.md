# Web Speech API & Pitch Support by Browser

**TL;DR:** Pitch control works in **Chrome/Edge**, but has **very limited support** in Firefox/Safari. This is a browser limitation, not a code issue.

---

## Browser Compatibility Matrix

| Browser | OS | Web Speech API | Pitch Control | Quality |
|---------|----|----|-------|---------|
| **Chrome 120+** | Windows/Mac/Linux | ✅ Full | ✅ **YES** | 🟢 Best |
| **Edge 120+** | Windows/Mac | ✅ Full | ✅ **YES** | 🟢 Best |
| **Firefox 110+** | Windows/Mac/Linux | ✅ Full | ❌ **NO** | 🟡 Good |
| **Safari 17+** | Mac/iOS | ✅ Full | ❌ **NO** | 🟡 Good |
| **Opera 106+** | Windows/Mac/Linux | ✅ Full | ✅ **YES** | 🟢 Best |

---

## What This Means for CricketAI

### ✅ Pitch Works Great In:
- **Google Chrome** (all versions)
- **Microsoft Edge** (all versions)
- **Opera** (all versions)

### ❌ Pitch Does NOT Work In:
- **Firefox** (pitch property ignored)
- **Safari** (pitch property ignored)
- **Mobile browsers** (variable support)

---

## Why the Pitch Isn't Working

**If you're not hearing pitch changes, check which browser you're using:**

### Test Instructions

1. **Open DevTools** (F12 or Cmd+Option+I on Mac)
2. **Go to Console tab**
3. **Look for the log message:**
   ```
   🌐 Browser Capabilities: {
     userAgent: "Mozilla/5.0...",
     speechSynthesisSupported: true,
     pitchSupported: true/false,  ← THIS TELLS YOU IF PITCH WORKS
     voices: 10
   }
   ```

4. **If `pitchSupported: false`**, your browser doesn't support Web Speech API pitch control

---

## Solutions for Non-Chromium Browsers

### Option 1: Switch to Chrome/Edge (Recommended for PoC)
- Best user experience
- Full pitch support
- No code changes needed

### Option 2: Use Google Cloud Text-to-Speech API (Better Long-Term)
- Professional audio with full SSML support
- Works in all browsers
- Better audio quality
- **Cost:** ~$4-16 per million characters

### Option 3: Use Browser-Specific APIs
- **Chrome:** Web Speech API (current approach) ✅
- **Safari:** Use AVSpeechSynthesizer (native, requires iOS app)
- **Firefox:** Would need alternative TTS service

---

## How to Verify Pitch is Working

### Step 1: Check Browser
```
Chrome/Edge: ✅ Pitch should work
Firefox/Safari: ❌ Won't work (browser limitation)
```

### Step 2: Open DevTools Console (F12)

### Step 3: Start Demo
- Select **OpenAI (Creative)** mode
- Enter API key
- Click **"Load Commentary"**
- Start **Live Simulation**

### Step 4: Watch Console Logs
You should see lines like:
```
🎵 Pitch HIGH (1.8) applied: "[HIGH]Four![/HIGH]" Stokes fires...
🎵 Pitch LOW (0.7) applied: "[LOW]Out...[/LOW]" bowled!
```

### Step 5: Listen to Audio
- **Chrome/Edge:** You should hear pitch variations
- **Firefox/Safari:** Audio will be monotone (browser can't do pitch)

---

## For the VC Demo

**Recommendation:** Test the demo on **Chrome or Edge** only.

### Pre-Demo Checklist
- [ ] Using Chrome 120+ or Edge 120+
- [ ] Speakers/headphones working
- [ ] OpenAI API key ready
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] DevTools open (F12) to monitor console
- [ ] Test audio quality before investor arrives

### During Demo Talking Point
> "Notice the audio has natural pitch variations—excitement in high pitch, tension in low pitch. This works great in Chrome. (On other browsers like Firefox, this would need a premium TTS service like Google Cloud.)"

---

## Technical Details

### What is Pitch in Web Speech API?

The `pitch` property on `SpeechSynthesisUtterance` controls the fundamental frequency:

```javascript
const utterance = new SpeechSynthesisUtterance("Hello");
utterance.pitch = 1.8;  // Higher pitch (0.1 - 2.0 range)
utterance.pitch = 0.7;  // Lower pitch
utterance.pitch = 1.0;  // Normal pitch (default)
```

### Browser Implementation

| Browser | Implementation | Pitch Support |
|---------|---|---|
| Chrome | Uses native OS text-to-speech + pitch modification | ✅ Works |
| Edge | Uses Windows SAPI or Chromium TTS | ✅ Works |
| Opera | Uses Chromium engine | ✅ Works |
| Firefox | Uses OS speech API but ignores pitch property | ❌ Doesn't work |
| Safari | Uses AVSpeechSynthesizer but ignores pitch property | ❌ Doesn't work |

### Why Firefox/Safari Ignore Pitch

These browsers implemented Web Speech API but don't expose pitch control to JavaScript due to OS-level limitations or design decisions. The W3C spec allows this flexibility.

---

## Workaround Solutions

### For Production (Not PoC)

If you need pitch in all browsers, consider these alternatives:

#### 1. **Google Cloud Text-to-Speech** (Recommended)
- Full SSML support including pitch/rate/volume
- Works in all browsers
- Premium audio quality
- Cost: $4-16 per million characters

**Implementation:**
```javascript
// Send SSML to Google Cloud TTS
const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input: {
      ssml: '<speak><prosody pitch="high">Four!</prosody></speak>'
    },
    voice: { languageCode: 'en-US' },
    audioConfig: { audioEncoding: 'MP3' }
  })
});
```

#### 2. **Amazon Polly**
- Similar to Google Cloud
- Works in all browsers
- Professional audio quality
- Cost: $4-16 per million characters

#### 3. **ElevenLabs** (Premium)
- Human-quality voice cloning
- Supports pitch in SSML
- Most expensive (~$10-30 per million characters)
- But sounds amazing

#### 4. **OpenAI TTS (NEW)**
- Text-to-speech built into OpenAI
- Supports pitch indirectly through prompt engineering
- Works in all browsers
- Cost: Included in API usage

---

## Current PoC Status

**What Works:**
- ✅ Chrome/Edge: Full pitch support
- ✅ All browsers: Dramatic commentary text (the real value)
- ✅ All browsers: Natural TTS without pitch

**What Doesn't Work:**
- ❌ Firefox/Safari: Pitch control (browser limitation)

**For VC Demo:**
- Use **Chrome or Edge only**
- Pitch variations will be clearly audible
- Text is dramatic regardless of browser

---

## How to Test Your Current Browser

### Quick Test in Console (F12)

```javascript
// Paste this into your browser console to check pitch support

const utter = new SpeechSynthesisUtterance("Test");
console.log("Pitch property exists:", 'pitch' in utter);
console.log("Pitch is writable:", Object.getOwnPropertyDescriptor(utter, 'pitch')?.writable);

// Try to set pitch and see if it works
utter.pitch = 1.8;
console.log("Pitch set to:", utter.pitch);

// Try speaking with high pitch
window.speechSynthesis.speak(utter);
```

**Results:**
- **Chrome/Edge:** "Pitch property exists: true" + you hear high pitch
- **Firefox:** "Pitch property exists: true" but monotone audio
- **Safari:** "Pitch property exists: true" but monotone audio

---

## Recommendation for PoC

### For Investor Demo
Use **Chrome 120+** or **Edge 120+**. Pitch will work perfectly.

### For Production (Next Phase)
Switch to **Google Cloud Text-to-Speech** or **OpenAI TTS** for:
- Universal browser support
- Professional audio quality
- Full SSML support
- Better voice options

### Cost Analysis (Per 1M API calls)
| Service | Cost | Pitch Support |
|---------|------|---|
| Web Speech API (Chrome) | $0 | ✅ Free |
| Google Cloud TTS | $4-16 | ✅ Full |
| Amazon Polly | $4-16 | ✅ Full |
| OpenAI TTS | ~$5-10 | ✅ Good |
| ElevenLabs | $10-30 | ✅ Full |

---

## Summary

### Right Now
- **Test on Chrome/Edge** → Pitch works, investors love it
- **Firefox/Safari** → No pitch (browser limitation), but still great commentary

### For VC Demo
- **Requirement:** Chrome 120+ or Edge 120+
- **Why:** Pitch control shows the dramatic difference

### For Production
- **Upgrade to:** Google Cloud TTS or OpenAI TTS
- **Benefit:** Works everywhere, better quality
- **Cost:** Low (~$4-16 per million characters)

