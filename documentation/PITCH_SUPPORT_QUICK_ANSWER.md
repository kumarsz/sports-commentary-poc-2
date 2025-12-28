# ⚡ QUICK ANSWER: Pitch Support by Browser

## TL;DR

**Pitch (ups and downs in audio) only works in Chrome and Edge.**

Firefox and Safari don't support pitch control in Web Speech API (it's a browser limitation, not a code bug).

---

## Test Yours RIGHT NOW

### Quick Command (Copy-Paste in Console)

Press **F12**, go to **Console**, paste this:

```javascript
const utter = new SpeechSynthesisUtterance("Four!");
utter.pitch = 1.8;
console.log("Pitch supported:", 'pitch' in utter);
window.speechSynthesis.speak(utter);
```

**Results:**
- **Chrome/Edge:** Hears high-pitched "Four!" → ✅ Pitch works
- **Firefox:** Hears normal "Four!" → ❌ Pitch doesn't work
- **Safari:** Hears normal "Four!" → ❌ Pitch doesn't work

---

## Browser Support

| Browser | Pitch? | For Demo? |
|---------|--------|-----------|
| Chrome | ✅ YES | ✅ USE |
| Edge | ✅ YES | ✅ USE |
| Opera | ✅ YES | ✅ USE |
| Firefox | ❌ NO | ❌ DON'T |
| Safari | ❌ NO | ❌ DON'T |

---

## For Your VC Demo

**Use Chrome or Edge.** Pitch will work perfectly.

---

## For Production

If you need pitch in ALL browsers, upgrade to **Google Cloud Text-to-Speech** (~$4-16 per million characters). But for PoC, Web Speech API + Chrome is perfect.

---

## See Also

- `PITCH_TEST_GUIDE.md` - Full testing guide
- `BROWSER_PITCH_COMPATIBILITY.md` - Detailed compatibility matrix
- `PITCH_INVESTIGATION.md` - Technical deep-dive

