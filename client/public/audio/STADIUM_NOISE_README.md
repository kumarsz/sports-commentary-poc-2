# Stadium Noise Audio File

## Required File
This directory should contain: `stadium-noise.mp3`

A looping ambient background noise file of a cricket stadium crowd. This creates atmosphere during live simulation.

## How to Add
1. Find or record a cricket stadium crowd noise audio file (typically 30-60 seconds)
2. Convert to MP3 format (320kbps recommended for quality)
3. Name it `stadium-noise.mp3` and place in this directory

## Audio Characteristics
- **Duration**: 30-60 seconds (will loop)
- **Format**: MP3 audio
- **Suggested Level**: Background ambient (will be set to 30% volume in app)
- **Content**: Crowd ambiance, occasional cheers, not too dramatic

## Free Resources
- YouTube Audio Library (free background tracks)
- BBC Sound Effects Library (free cricket/crowd sounds)
- Freesound.org (search: "crowd", "cricket", "stadium")

## Testing
The Stadium Atmosphere toggle in the app will play/pause this audio during simulation.
If the file is missing, you'll see a console warning but the app continues normally.

## For PoC Testing
If you don't have a file yet, the app will gracefully handle the missing file.
Once you add the MP3, the toggle will work automatically.
