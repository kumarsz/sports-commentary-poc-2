# SSML Prosody Implementation Guide

## Overview

This document describes how SSML (Speech Synthesis Markup Language) prosody markers are implemented in CricketAI to add natural speech rhythm and dramatic emphasis to AI-generated commentary.

## The Problem

OpenAI generates dramatic commentary text, but when played through the Web Speech API without prosody guidance, it sounds **monotone and robotic** despite the content being exciting. Users don't hear the intended drama, emphasis, and rhythm.

## The Solution: SSML Prosody Markers

We use OpenAI to generate commentary with embedded **prosody markers** that are later converted to SSML tags, instructing the Web Speech API to apply natural speech patterns.

### Prosody Markers

The OpenAI prompt instructs the model to wrap dramatic moments with these markers:

| Marker | SSML Tag | Purpose | Example |
|--------|----------|---------|---------|
| `[HIGH]...[/HIGH]` | `<prosody pitch="high">` | Excitement, surprises, highlights | "[HIGH]Four![/HIGH]" |
| `[LOW]...[/LOW]` | `<prosody pitch="low">` | Tension, drama, suspense | "[LOW]Out...[/LOW]" |
| `[EMPHASIS]...[/EMPHASIS]` | `<emphasis level="strong">` | Key words, important moments | "[EMPHASIS]beautiful[/EMPHASIS]" |
| `[FAST]...[/FAST]` | `<prosody rate="fast">` | Quick action, rapid delivery | "[FAST]He rushes down![/FAST]" |
| `[SLOW]...[/SLOW]` | `<prosody rate="slow">` | Dramatic pauses, key moments | "[SLOW]And...it's...out![/SLOW]" |

## Implementation Details

### 1. Backend: OpenAI Prompt Enhancement

**File:** `server/openai-commentary.js`

The system prompt (lines 220-226) now includes explicit instructions for OpenAI:

```javascript
// Prosody markers documentation in the prompt
"Use prosody markers to make the commentary dramatic:
- [HIGH]text[/HIGH] for excitement and highlights
- [LOW]text[/LOW] for tension and drama
- [EMPHASIS]text[/EMPHASIS] for key moments
- [FAST]text[/FAST] for quick action
- [SLOW]text[/SLOW] for dramatic pauses

Example: '[HIGH]Four![/HIGH] [EMPHASIS]Beautiful[/EMPHASIS] shot!'
Example: '[LOW]Out...[/LOW] [EMPHASIS]bowled![/EMPHASIS]'"
```

### 2. Frontend: SSML Conversion & Display

**File:** `client/src/components/LiveMatch.js`

#### Helper Function 1: `convertToSSML()`

Converts prosody markers to valid SSML XML tags:

```javascript
const convertToSSML = (text) => {
  if (!text) return '';
  return text
    .replace(/\[HIGH\](.*?)\[\/HIGH\]/g, '<prosody pitch="high">$1</prosody>')
    .replace(/\[LOW\](.*?)\[\/LOW\]/g, '<prosody pitch="low">$1</prosody>')
    .replace(/\[EMPHASIS\](.*?)\[\/EMPHASIS\]/g, '<emphasis level="strong">$1</emphasis>')
    .replace(/\[FAST\](.*?)\[\/FAST\]/g, '<prosody rate="fast">$1</prosody>')
    .replace(/\[SLOW\](.*?)\[\/SLOW\]/g, '<prosody rate="slow">$1</prosody>');
};
```

**Purpose:** Used when **speaking** commentary via TTS
**Called from:** `getCommentaryForMode()` → `speakText()` → Web Speech API

#### Helper Function 2: `stripSSMLTags()`

Removes prosody markers and SSML tags for **display purposes** (the UI should show clean text, not markup):

```javascript
const stripSSMLTags = (text) => {
  if (!text) return '';
  return text
    .replace(/\[HIGH\](.*?)\[\/HIGH\]/g, '$1')
    .replace(/\[LOW\](.*?)\[\/LOW\]/g, '$1')
    .replace(/\[EMPHASIS\](.*?)\[\/EMPHASIS\]/g, '$1')
    .replace(/\[FAST\](.*?)\[\/FAST\]/g, '$1')
    .replace(/\[SLOW\](.*?)\[\/SLOW\]/g, '$1')
    .replace(/<[^>]+>/g, ''); // Also remove any HTML/SSML tags
};
```

**Purpose:** Used when **displaying** commentary text to users
**Called from:**
- Ball history UI (line 695): `stripSSMLTags(getCommentaryForMode(ball))`
- Current ball AI commentary (line 665): `stripSSMLTags(currentBall.aiCommentary)`

#### Integration Point: `getCommentaryForMode()`

This function selects the appropriate commentary and applies SSML conversion:

```javascript
const getCommentaryForMode = (ball) => {
  if (!ball) return null;
  
  if (aiMode === 'openai') {
    // OpenAI mode: use AI-generated commentary if available
    if (ball.aiCommentary) {
      // Apply SSML prosody conversion to add natural speech rhythm
      return convertToSSML(ball.aiCommentary);
    } else {
      return 'AI commentary content not available';
    }
  } else {
    // Local mode: always use template-based commentary (no SSML needed)
    return ball.commentary;
  }
};
```

**Key Insight:** SSML is applied **only for TTS playback**, not for display.

## Data Flow

```
OpenAI API
    ↓
[Returns commentary with prosody markers]
    "[HIGH]Four![/HIGH] Beautiful shot!"
    ↓
Store in ball.aiCommentary
    ↓
When TTS plays:
    getCommentaryForMode(ball)
    ↓
    convertToSSML() 
    ↓
    "<prosody pitch='high'>Four!</prosody> Beautiful shot!"
    ↓
    speakText(ssml_text)
    ↓
    Web Speech API processes SSML
    ↓
    Speaker hears: High pitch on "Four!", natural rhythm on rest
    ↓
When UI displays:
    stripSSMLTags(getCommentaryForMode(ball))
    ↓
    "Four! Beautiful shot!" [clean, no markup]
    ↓
    Displayed in ball-by-ball history
```

## Testing the Implementation

### 1. Verify OpenAI is Generating Markers

Open DevTools Console and check network requests:
- Go to OpenAI mode
- Load commentary with valid API key
- In Network tab, find the `/api/matches/{id}/balls` request
- Check the response JSON for `aiCommentary` fields
- Look for markers like `[HIGH]`, `[LOW]`, etc.

Example:
```json
{
  "aiCommentary": "[HIGH]Four![/HIGH] [EMPHASIS]Beautiful[/EMPHASIS] shot down the ground!"
}
```

### 2. Listen to Prosody in Action

1. Select **OpenAI (Creative)** mode
2. Enter your OpenAI API key
3. Click **"Load Commentary"**
4. Click **"▶️ Start Live Simulation"**
5. Listen carefully:
   - **High-pitched moments:** Exciting events, boundaries
   - **Low-pitched moments:** Tension, wickets, critical moments
   - **Emphasized words:** Key actions (bowled, caught, four, six)
   - **Speed variations:** Fast-paced action, then dramatic pauses

### 3. Compare Local vs OpenAI Mode

1. Play same match in **Local mode** → hear flat, neutral commentary
2. Play same match in **OpenAI mode** → hear dramatic, prosody-enhanced commentary
3. The difference should be immediately obvious

## Browser Compatibility

Web Speech API SSML support varies by browser:

| Browser | SSML Support | Notes |
|---------|--------------|-------|
| Chrome/Edge | ✅ Full | Best SSML support |
| Firefox | ⚠️ Partial | Basic prosody works |
| Safari | ⚠️ Partial | Pitch variations work, emphasis may not |

**Recommendation:** Test on Chrome for best SSML prosody experience.

## Future Enhancements

1. **Volume variations:** Add `<prosody volume="...">` for dynamic volume
2. **Phonetic stress:** Add `<phoneme>` markers for precise pronunciation
3. **Language-specific prosody:** Adjust markers for Hindi/Tamil/Telugu
4. **User control:** Allow users to enable/disable prosody or adjust intensity
5. **Local model prosody:** Extend to local commentary generator (currently local-mode has no markers)

## Key Files

| File | Role | Change |
|------|------|--------|
| `server/openai-commentary.js` | OpenAI prompt | Lines 220-226: Added prosody marker documentation |
| `client/src/components/LiveMatch.js` | Frontend logic | Lines 212-230: Added `convertToSSML()` and `stripSSMLTags()` |
| | | Line 275: Updated `getCommentaryForMode()` to apply SSML |
| | | Line 665: Updated AI commentary display to strip markers |
| | | Line 695: Updated ball history to strip markers |

## Troubleshooting

### Markers Not Appearing in API Response

**Problem:** `aiCommentary` field is empty or has no markers
**Solution:** 
1. Verify OpenAI API key is valid
2. Check backend logs for OpenAI API errors
3. Ensure prompt was updated (rebuild server)
4. Try a different match/ball

### Prosody Sounds Strange or Doesn't Work

**Problem:** No pitch changes heard, or voice sounds broken
**Solution:**
1. Test on Chrome first (best SSML support)
2. Check browser console for speech synthesis errors
3. Try different voice (select different language voice in controls)
4. Verify Web Speech API is enabled in browser

### Text Shows Markers in UI

**Problem:** Users see "[HIGH]Four![/HIGH]" instead of "Four!"
**Solution:** This means `stripSSMLTags()` isn't being called. Check that:
1. `stripSSMLTags()` is called when displaying commentary (not when speaking)
2. Both display locations use `stripSSMLTags()`:
   - Ball history list (line 695)
   - Current ball AI commentary (line 665)

## Summary

SSML prosody adds dramatic, human-like speech patterns to AI commentary through:
1. **OpenAI generates** commentary with prosody markers
2. **Frontend converts** markers to SSML for TTS playback
3. **Web Speech API** applies natural rhythm and pitch variations
4. **Users experience** dramatic, engaging audio commentary

This is a simple yet effective approach that requires **no external TTS service** and works with the browser's built-in speech synthesis.
