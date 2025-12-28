import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './LiveMatch.css';

function LiveMatch({ language }) {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [balls, setBalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulateMode, setSimulateMode] = useState(false);
  const [ballIndex, setBallIndex] = useState(0);
  const [speed, setSpeed] = useState(2000); // milliseconds between balls

  // TTS state
  const [ttsEnabled, setTtsEnabled] = useState(true); // Speech enabled by default
  const [ttsMode, setTtsMode] = useState('complete'); // 'complete' | 'queued' | 'interrupt'
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voiceGender, setVoiceGender] = useState('female'); // 'male' or 'female'
  const [speechRate, setSpeechRate] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [stadiumNoise, setStadiumNoise] = useState(true); // Toggle stadium background noise
  const [naturalGaps, setNaturalGaps] = useState(true); // Toggle natural gaps between balls

  // AI mode state
  const [aiMode, setAiMode] = useState('local'); // 'local' | 'openai'
  const [aiLoading, setAiLoading] = useState(false);

  // OpenAI session key (stored in sessionStorage so it expires when the browser session ends)
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiKeyValid, setOpenaiKeyValid] = useState(false);
  const [openaiValidating, setOpenaiValidating] = useState(false);
  const [openaiError, setOpenaiError] = useState(null);

  const speechQueueRef = useRef([]);
  const isSpeakingRef = useRef(false);
  const audioContextRef = useRef(null);
  const stadiumNoiseGainRef = useRef(null);
  const currentVoiceGenderRef = useRef('female'); // Track current voice for alternation
  const manualVoiceSelectedRef = useRef(false); // Track if user manually selected a voice

  // Fetch match & balls from backend
  const fetchMatch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setAiLoading(true);

      // Fetch match details
      const matchRes = await axios.get(`/api/matches/${id}`);
      setMatch(matchRes.data);

      // Check if OpenAI mode is selected but no API key is provided
      if (aiMode === 'openai' && !openaiKey) {
        // Don't fetch balls yet - wait for user to provide API key
        setError('Please provide your OpenAI API key below to use Creative AI mode, or switch to Local mode.');
        setBalls([]);
        setLoading(false);
        setAiLoading(false);
        return;
      }

      // Fetch balls with commentary (pass aiMode parameter and include OpenAI key in headers if needed)
      try {
        const headers = {};
        if (aiMode === 'openai' && openaiKey) {
          headers['x-openai-api-key'] = openaiKey;
        }
        const ballsRes = await axios.get(`/api/matches/${id}/balls?language=${language}&aiMode=${aiMode}`, { headers });
        setBalls(ballsRes.data);
        setBallIndex(0);
        setAiLoading(false);
      } catch (ballError) {
        if (ballError.response?.status === 503 && aiMode === 'openai') {
          // OpenAI not available - show error but don't auto-fallback
          setError('OpenAI mode requires an API key. Please provide your OpenAI API key below or switch to Local mode.');
          setBalls([]);
          setAiLoading(false);
        } else if (ballError.response?.status === 401 && aiMode === 'openai') {
          // Invalid API key - show error but don't auto-fallback
          setError('Invalid OpenAI API key. Please check your key or switch to Local mode.');
          setBalls([]);
          setAiLoading(false);
        } else if (ballError.response?.status === 429 && aiMode === 'openai') {
          // Quota exceeded - show error but don't auto-fallback
          setError('OpenAI API quota exceeded. Please check your billing or switch to Local mode.');
          setBalls([]);
          setAiLoading(false);
        } else {
          throw ballError;
        }
      }
    } catch (err) {
      console.error('Error fetching match:', err);
      setError('Failed to load match data. Is the backend running and reachable?');
      setAiLoading(false);
    } finally {
      setLoading(false);
    }
  }, [id, language, aiMode, openaiKey]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  // Load available voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const v = synth.getVoices();
      setVoices(v);
      
      // Log browser and Web Speech API capabilities
      const browserInfo = {
        userAgent: navigator.userAgent,
        speechSynthesisSupported: !!window.speechSynthesis,
        pitchSupported: checkPitchSupport(),
        voices: v.length
      };
      console.log('🌐 Browser Capabilities:', browserInfo);
    };

    loadVoices();
    synth.addEventListener('voiceschanged', loadVoices);
    return () => synth.removeEventListener('voiceschanged', loadVoices);
  }, []);

  // Check if browser supports pitch control in Web Speech API
  const checkPitchSupport = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return false;
    try {
      const test = new SpeechSynthesisUtterance('test');
      // Check if pitch property exists and can be set
      return 'pitch' in test && typeof test.pitch === 'number';
    } catch (e) {
      return false;
    }
  };

  // Function to select voice based on gender and language (synchronously)
  const selectVoiceForGender = (genderPreference) => {
    if (voices.length === 0) return null;
    
    const langPrefix = {
      en: 'en',
      hi: 'hi',
      ta: 'ta',
      te: 'te'
    }[language] || 'en';

    const maleVoiceKeywords = ['Male', 'man', 'Boy', 'David', 'Mark', 'Google UK English Male', 'Alex'];
    const femaleVoiceKeywords = ['Female', 'woman', 'Girl', 'Zira', 'Samantha', 'Victoria', 'Karen', 'Siri'];
    const pitchFriendlyVoices = [
      'Google UK English Male', 'Google US English', 'Microsoft Zira', 'Samantha', 'Victoria', 'Karen',
    ];

    const genderKeywords = genderPreference === 'male' ? maleVoiceKeywords : femaleVoiceKeywords;
    
    let preferred = voices.find(v => 
      v.lang && v.lang.toLowerCase().startsWith(langPrefix) && 
      pitchFriendlyVoices.some(name => v.name && v.name.includes(name)) &&
      genderKeywords.some(keyword => v.name && v.name.includes(keyword))
    );

    if (!preferred) {
      preferred = voices.find(v => 
        v.lang && v.lang.toLowerCase().startsWith(langPrefix) && 
        pitchFriendlyVoices.some(name => v.name && v.name.includes(name))
      );
    }

    if (!preferred) {
      preferred = voices.find(v =>
        v.lang && v.lang.toLowerCase().startsWith(langPrefix) &&
        genderKeywords.some(keyword => v.name && v.name.includes(keyword))
      );
    }

    if (!preferred) {
      preferred = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
    }

    if (!preferred) {
      preferred = voices[0];
    }

    return preferred ? (preferred.voiceURI || preferred.name) : (voices[0].voiceURI || voices[0].name);
  };

  // Default voice selection when voices list or language changes
  useEffect(() => {
    if (voices.length === 0) return;
    const voiceId = selectVoiceForGender(voiceGender);
    console.log(`🎤 Selected ${voiceGender} voice for pitch:`, voiceId);
    setSelectedVoice(voiceId);
  }, [voices, language, voiceGender]);


  // Initialize and generate stadium noise using Web Audio API
  const initStadiumNoise = useCallback(() => {
    if (!stadiumNoise || typeof window === 'undefined') return;

    try {
      const audioContext = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create noise buffer
      const bufferSize = audioContext.sampleRate * 2; // 2 seconds of noise
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Generate white noise (random values)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      // Create noise source
      const noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Create gain node for volume control
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.15; // 15% volume (background level)
      stadiumNoiseGainRef.current = gainNode;

      // Apply low-pass filter for natural crowd sound
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000; // Filter out high frequencies

      // Connect nodes
      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);

      noiseSource.start(0);

      console.log('🎭 Stadium noise initialized');
    } catch (err) {
      console.warn('Could not initialize stadium noise:', err);
    }
  }, [stadiumNoise]);

  // Stop stadium noise
  const stopStadiumNoise = () => {
    if (stadiumNoiseGainRef.current) {
      try {
        stadiumNoiseGainRef.current.gain.value = 0;
      } catch (err) {
        console.warn('Error stopping stadium noise:', err);
      }
    }
  };

  const processSpeechQueue = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeakingRef.current) return; // already speaking

    const next = speechQueueRef.current.shift();
    if (!next) return;

    const utter = new SpeechSynthesisUtterance(next.text);
    
    // Use manually selected voice if available, otherwise use gender-based selection
    let voiceId;
    if (manualVoiceSelectedRef.current && selectedVoice) {
      voiceId = selectedVoice;
    } else {
      // Use the current voice gender from ref to select the right voice
      const targetGender = currentVoiceGenderRef.current;
      voiceId = selectVoiceForGender(targetGender);
    }
    
    const voiceObj = voices.find(v => (v.voiceURI || v.name) === voiceId);
    if (voiceObj) utter.voice = voiceObj;

    const langMapToLocale = { en: 'en-US', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN' };
    utter.lang = langMapToLocale[language] || utter.lang;
    utter.rate = speechRate;
    
    // Apply pitch variation based on text markers for dramatic effect
    // [HIGH] text → higher pitch (excitement, highlights)
    // [LOW] text → lower pitch (tension, drama)
    // Note: Web Speech API pitch support is limited on some browsers/systems
    if (next.text && next.text.includes('[HIGH]')) {
      utter.pitch = 1.8; // High pitch for excitement
      console.log('🎵 Pitch HIGH (1.8) applied:', next.text.substring(0, 60));
    } else if (next.text && next.text.includes('[LOW]')) {
      utter.pitch = 0.7; // Low pitch for tension
      console.log('🎵 Pitch LOW (0.7) applied:', next.text.substring(0, 60));
    } else {
      utter.pitch = 1.0; // Normal pitch (default)
    }

    utter.onstart = () => {
      isSpeakingRef.current = true;
      setIsSpeaking(true);
    };
    utter.onend = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      // small pause for natural flow before speaking next queued item
      setTimeout(processSpeechQueue, 200);
    };
    utter.onerror = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      setTimeout(processSpeechQueue, 200);
    };

    try {
      window.speechSynthesis.speak(utter);
    } catch (err) {
      console.error('TTS error:', err);
    }
  };

  const speakText = (text, options = { interrupt: false, prepend: false }) => {
    if (!text) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Browser does not support SpeechSynthesis API.');
      return;
    }

    if (options.interrupt) {
      // stop any ongoing speech and clear queued items
      window.speechSynthesis.cancel();
      speechQueueRef.current = [];
      isSpeakingRef.current = false;
      setIsSpeaking(false);
    }

    // Add to queue
    if (options.prepend) {
      speechQueueRef.current.unshift({ text });
    } else {
      speechQueueRef.current.push({ text });
    }

    // Kick the processor (will early-return if something is already speaking)
    setTimeout(processSpeechQueue, 0);
  };

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      speechQueueRef.current = [];
      isSpeakingRef.current = false;
      setIsSpeaking(false);
    }
  };

  /**
   * Strip SSML tags and prosody markers for display purposes
   * Note: Web Speech API doesn't properly support SSML, so we strip markers
   * and just use the dramatic text generated by OpenAI (which is the real value)
   */
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

  // Validate OpenAI API key with backend
  const validateOpenAIKey = async (key) => {
    if (!key) {
      setOpenaiKeyValid(false);
      setOpenaiError(null);
      return;
    }

    try {
      setOpenaiValidating(true);
      setOpenaiError(null);

      // Send a test request to validate the key with backend
      const response = await axios.get('/api/validate-openai-key', {
        headers: {
          'x-openai-api-key': key
        }
      });

      if (response.status === 200) {
        setOpenaiKeyValid(true);
        setOpenaiError(null);
      }
    } catch (err) {
      setOpenaiKeyValid(false);
      if (err.response?.status === 401) {
        setOpenaiError('Invalid OpenAI API key. Please check and try again.');
      } else if (err.response?.status === 400) {
        setOpenaiError('OpenAI key format is invalid.');
      } else {
        setOpenaiError('Failed to validate OpenAI key. Is the backend running?');
      }
      console.error('Error validating OpenAI key:', err);
    } finally {
      setOpenaiValidating(false);
    }
  };

  /**
   * Get the appropriate commentary text based on current AI mode
   * - Local mode: returns commentary (template-based)
   * - OpenAI mode: returns aiCommentary if available, otherwise placeholder
   * Note: Returns text with prosody markers intact (for pitch detection)
   * Markers are stripped for display only, not for TTS
   */
  const getCommentaryForMode = (ball) => {
    if (!ball) return null;
    
    if (aiMode === 'openai') {
      // OpenAI mode: use AI-generated commentary if available
      if (ball.aiCommentary) {
        // Return with markers intact - they're used for pitch detection in TTS
        // But the pitch will be applied based on [HIGH]/[LOW] markers
        return ball.aiCommentary;
      } else {
        // If AI commentary not available, return placeholder
        return 'AI commentary content not available';
      }
    } else {
      // Local mode: always use template-based commentary
      return ball.commentary;
    }
  };

  // Speak automatically when a new ball is revealed
  useEffect(() => {
    const current = getCurrentBall();
    if (ttsEnabled && current) {
      const textToSpeak = getCommentaryForMode(current);
      if (textToSpeak) {
        // Randomly alternate between male and female voices for natural variety
        const randomGender = Math.random() > 0.5 ? 'male' : 'female';
        currentVoiceGenderRef.current = randomGender;
        // Don't update state - it causes re-renders that desync speech timing
        // Instead, just update the ref and let the voice be selected in processSpeechQueue
        
        // Behavior based on selected TTS mode
        if (ttsMode === 'complete') {
          // Complete mode: queue the audio so it plays after previous audio finishes
          speakText(textToSpeak, { interrupt: false, prepend: false });
        } else if (ttsMode === 'interrupt') {
          // Interrupt mode: stop current and play immediately (for testing)
          speakText(textToSpeak, { interrupt: true, prepend: false });
        } else {
          // queued mode: let processor handle natural flow
          speakText(textToSpeak, { interrupt: false, prepend: false });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ballIndex, ttsEnabled, ttsMode, aiMode]);

  // Simulate live ball updates
  useEffect(() => {
    if (!simulateMode) {
      return;
    }

    if (ballIndex <= 0 || ballIndex > balls.length) {
      setSimulateMode(false);
      // Reset ball index when simulation ends so user can restart from ball 1
      if (ballIndex > balls.length && balls.length > 0) {
        setBallIndex(0);
      }
      return;
    }

    let timer;

    if (ttsEnabled && (ttsMode === 'complete' || ttsMode === 'queued')) {
      // In 'complete' or 'queued' mode, wait for speech to finish before advancing
      const scheduleAdvance = () => {
        if (!simulateMode) return; // Stop if simulation was paused
        
        // Wait if either:
        // 1. Audio is currently playing, OR
        // 2. There are items queued to be spoken
        if (isSpeakingRef.current || speechQueueRef.current.length > 0) {
          timer = setTimeout(scheduleAdvance, 100);
          return;
        }
        
        // Add natural gaps between balls (silence for dramatic effect)
        let delayBeforeNext = 100;
        if (naturalGaps) {
          // Add 1-2 second gap after each ball (simulates field commentary rhythm)
          delayBeforeNext = 1000 + Math.random() * 1000; // 1-2 seconds
        }
        
        timer = setTimeout(() => setBallIndex(prev => prev + 1), delayBeforeNext);
      };
      // Wait longer on first ball to ensure speech queue is populated
      timer = setTimeout(scheduleAdvance, 500);
    } else {
      // Interrupt mode or TTS disabled: use normal speed
      let finalSpeed = speed;
      if (naturalGaps) {
        // Add natural gap to the speed setting
        finalSpeed = speed + (1000 + Math.random() * 1000);
      }
      timer = setTimeout(() => {
        setBallIndex(prev => prev + 1);
      }, finalSpeed);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [simulateMode, balls.length, speed, ttsEnabled, ttsMode, naturalGaps, ballIndex]);

  // Control stadium noise playback using Web Audio API
  useEffect(() => {
    if (simulateMode && stadiumNoise) {
      // Start playing stadium noise
      initStadiumNoise();
      if (stadiumNoiseGainRef.current) {
        stadiumNoiseGainRef.current.gain.value = 0.15; // Turn on noise
      }
      console.log('🎭 Stadium noise ON');
    } else {
      // Stop stadium noise
      stopStadiumNoise();
      console.log('🎭 Stadium noise OFF');
    }
  }, [simulateMode, stadiumNoise, initStadiumNoise]);

  const getCurrentBall = () => {
    if (ballIndex <= 0 || ballIndex > balls.length) return null;
    return balls[ballIndex - 1];
  };

  const getTeamInfo = (teamName) => {
    if (!match) return { runs: 0, wickets: 0, overs: 0 };

    const teamBalls = balls.slice(0, ballIndex).filter(b => {
      // Assuming team_a bats first
      if (match.toss_decision === 'bat') {
        return match.team_a === teamName;
      }
      return true;
    });

    let runs = 0;
    let wickets = 0;

    teamBalls.forEach(b => {
      if (b.event !== 'wicket') {
        runs += b.runs;
      } else {
        wickets += 1;
      }
    });

    const overs = Math.floor(teamBalls.length / 6);
    const ballsInCurrentOver = teamBalls.length % 6;

    return {
      runs,
      wickets,
      overs: `${overs}.${ballsInCurrentOver}`
    };
  };

  // AI key validation effect
  useEffect(() => {
    // If key is empty, clear validation state
    if (!openaiKey) {
      setOpenaiKeyValid(false);
      setOpenaiError(null);
      return;
    }

    // Validate OpenAI key format (basic validation)
    // OpenAI keys typically start with 'sk-' and are 40+ characters long
    if (!openaiKey.startsWith('sk-') || openaiKey.length < 40) {
      setOpenaiKeyValid(false);
      setOpenaiError('Invalid OpenAI key format. Key should start with "sk-" and be at least 40 characters.');
      return;
    }

    // If key format is valid, validate it with the backend
    // Use a debounce timer to avoid too many validation requests
    const validationTimer = setTimeout(() => {
      validateOpenAIKey(openaiKey);
    }, 500); // Wait 500ms after user stops typing before validating

    return () => clearTimeout(validationTimer);
  }, [openaiKey]);

  if (loading) {
    return (
      <div className="live-match-container">
        <Link to="/" className="back-link">← Back to Matches</Link>
        <h2>Loading match...</h2>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error && !error.includes('OpenAI API key')) {
    return (
      <div className="live-match-container">
        <Link to="/" className="back-link">← Back to Matches</Link>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchMatch} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  const teamAInfo = getTeamInfo(match.team_a);
  const teamBInfo = getTeamInfo(match.team_b);
  const currentBall = getCurrentBall();

  return (
    <div className="live-match-container">
      <Link to="/" className="back-link">← Back to Matches</Link>

      {/* Match Header */}
      <div className="match-header-section card">
        <div className="match-title">
          <h2>
            {match.team_a} vs {match.team_b}
          </h2>
          <p className="match-info">{match.venue} • {match.format}</p>
        </div>

        <div className="match-status">
          <span className={`status-badge status-${match.status}`}>
            {match.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Score Board */}
      <div className="scoreboard card">
        <div className="team-score">
          <div className="team-logo">{match.team_a_logo}</div>
          <div className="score-details">
            <p className="team-name">{match.team_a}</p>
            <p className="score">
              <span className="runs">{teamAInfo.runs}</span>
              <span className="separator">/</span>
              <span className="wickets">{teamAInfo.wickets}</span>
            </p>
            <p className="overs">({teamAInfo.overs} overs)</p>
          </div>
        </div>

        <div className="divider"></div>

        <div className="team-score">
          <div className="team-logo">{match.team_b_logo}</div>
          <div className="score-details">
            <p className="team-name">{match.team_b}</p>
            <p className="score">
              <span className="runs">{teamBInfo.runs}</span>
              <span className="separator">/</span>
              <span className="wickets">{teamBInfo.wickets}</span>
            </p>
            <p className="overs">({teamBInfo.overs} overs)</p>
          </div>
        </div>
      </div>

      {/* Demo Banner */}
      <div className="demo-banner card">
        <span className="demo-badge">🎬 DEMO MODE</span>
        <span className="demo-info">Use controls below to showcase CricketAI features</span>
      </div>

      {/* Controls */}
      <div className="controls card">
        <div className="control-section">
          <h4>Demo Controls</h4>
          
          <div className="control-row">
            <div className="control-group">
              <label>🌍 Language:</label>
              <select value={language} onChange={(e) => {
                window.location.href = `/match/${id}?language=${e.target.value}`;
              }}>
                <option value="en">English (EN)</option>
                <option value="hi">Hindi (HI)</option>
                <option value="ta">Tamil (TA)</option>
                <option value="te">Telugu (TE)</option>
              </select>
            </div>

            <div className="control-group">
              <label>⚡ Speed:</label>
              <select value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))}>
                <option value={500}>2x (Fast)</option>
                <option value={1000}>1x (Normal)</option>
                <option value={2000}>0.5x (Slow)</option>
                <option value={3000}>0.33x (Very Slow)</option>
              </select>
            </div>

            <div className="control-group">
              <label>🤖 AI Mode:</label>
              <select 
                value={aiMode} 
                onChange={(e) => {
                  setAiMode(e.target.value);
                  // fetchMatch will be triggered automatically by useEffect when aiMode changes
                }}
                disabled={simulateMode || aiLoading}
              >
                <option value="local">Local (Fast)</option>
                <option value="openai">OpenAI (Creative)</option>
              </select>
              {aiLoading && <span className="loading-spinner">🔄</span>}
            </div>
          </div>
        </div>

        {aiMode === 'openai' && (
          <div className="control-section">
            <h4>🔑 OpenAI API Key (Required)</h4>
            <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 1rem 0' }}>
              You selected Creative AI mode. Please provide your OpenAI API key to generate dramatic commentary.
            </p>
            <div className="openai-key-control">
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-... (OpenAI API key required for Creative mode)"
                className="api-key-input"
                disabled={simulateMode}
              />
              <button 
                className="btn-primary btn-small"
                onClick={() => {
                  if (openaiKey) {
                    validateOpenAIKey(openaiKey);
                    fetchMatch();
                  }
                }}
                disabled={!openaiKey || openaiValidating || simulateMode}
                style={{ marginLeft: '0.5rem' }}
              >
                Load Commentary
              </button>
              {openaiValidating && <span className="validating-spinner">🔄 Validating...</span>}
              {openaiKeyValid && <span className="key-valid">✅ Valid</span>}
              {openaiError && <span className="key-error">⚠️ {openaiError}</span>}
            </div>
          </div>
        )}

        <div className="control-section">
          <h4>🔊 Audio & Voice</h4>
          
          <div className="control-row">
            <label className="tts-toggle">
              <input type="checkbox" checked={ttsEnabled} onChange={(e) => setTtsEnabled(e.target.checked)} />
              &nbsp;<strong>Enable Speech</strong>
            </label>
          </div>

          {ttsEnabled && (
            <>
              <div className="control-row">
                <div className="control-group">
                  <label>Voice:</label>
                  <select value={selectedVoice || ''} onChange={(e) => {
                    setSelectedVoice(e.target.value);
                    // Mark that user manually selected a voice
                    manualVoiceSelectedRef.current = e.target.value !== '';
                  }}>
                    {voices.map(v => (
                      <option key={v.voiceURI || v.name} value={v.voiceURI || v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div className="control-group">
                  <label>Rate: {speechRate.toFixed(1)}x</label>
                  <input type="range" min="0.5" max="2" step="0.1" value={speechRate} onChange={(e) => setSpeechRate(parseFloat(e.target.value))} />
                </div>
              </div>

              <div className="control-row">
                <div className="control-group">
                  <label>Audio Mode:</label>
                  <select value={ttsMode} onChange={(e) => {
                    setTtsMode(e.target.value);
                    stopSpeech();
                  }}>
                    <option value="complete">Complete (wait for audio)</option>
                    <option value="queued">Queued (smooth)</option>
                    <option value="interrupt">Interrupt (immediate)</option>
                  </select>
                </div>
              </div>

              <div className="control-row">
                <div className="control-group">
                  <label>🎤 Commentator Gender:</label>
                  <select value={voiceGender} onChange={(e) => {
                    const newGender = e.target.value;
                    setVoiceGender(newGender);
                    // Also update the ref so the next ball uses this gender
                    currentVoiceGenderRef.current = newGender;
                  }}>
                    <option value="female">Female Voice</option>
                    <option value="male">Male Voice</option>
                  </select>
                </div>
              </div>

              <div className="control-row">
                <label className="tts-toggle">
                  <input type="checkbox" checked={stadiumNoise} onChange={(e) => setStadiumNoise(e.target.checked)} />
                  &nbsp;<strong>🎭 Stadium Atmosphere</strong>
                </label>
                <label className="tts-toggle">
                  <input type="checkbox" checked={naturalGaps} onChange={(e) => setNaturalGaps(e.target.checked)} />
                  &nbsp;<strong>⏱️ Natural Pacing</strong>
                </label>
              </div>

              <div className="control-row">
                <button
                  className={`btn-primary btn-small ${simulateMode ? 'btn-danger' : ''}`}
                  onClick={() => {
                    const newMode = !simulateMode;
                    if (newMode && ballIndex === 0) {
                      // Starting simulation for the first time or after reset
                      setBallIndex(1); // Start with ball 1
                    }
                    setSimulateMode(newMode);
                    // If pausing, stop TTS
                    if (!newMode) {
                      stopSpeech();
                    }
                  }}
                >
                  {simulateMode ? '⏸️ Pause Simulation' : '▶️ Start Live Simulation'}
                </button>
                <button className="btn-primary btn-small" onClick={() => speakText(getCommentaryForMode(currentBall), { interrupt: true, prepend: true })}>🔊 Replay</button>
                <button className="btn-primary btn-small" onClick={() => {
                  stopSpeech();
                  setSimulateMode(false);
                }} disabled={!isSpeaking && !simulateMode}>⏹ Stop</button>
              </div>
            </>
          )}
        </div>

        <p className="ball-counter">
          Ball {ballIndex} / {balls.length}
        </p>
      </div>

      {/* Current Ball & Commentary */}
      {currentBall && (
        <div className="commentary-card card">
          <div className="ball-info">
            <h3>Over {currentBall.over}.{currentBall.ball_in_over}</h3>
            <p className="ball-description">{currentBall.description}</p>
          </div>

          <div className="commentary-section">
            <h3>🎙️ Commentary</h3>
            <p className="commentary-text">{currentBall.commentary}</p>
            
            {/* Show AI Commentary only if in OpenAI mode and aiCommentary exists */}
            {aiMode === 'openai' && currentBall.aiCommentary && (
              <div className="ai-commentary-container">
                <h4>✨ AI-Generated Dramatic Commentary</h4>
                <p className="ai-commentary-text">{stripSSMLTags(currentBall.aiCommentary)}</p>
              </div>
            )}
            
            <div className={`event-badge event-${currentBall.event}`}>
              {currentBall.event.toUpperCase()}
              {currentBall.runs > 0 && ` • ${currentBall.runs} RUNS`}
            </div>
          </div>

          <div className="bowler-batter">
            <span className="player">🎱 {currentBall.bowler}</span>
            <span className="separator">→</span>
            <span className="player">{currentBall.batter}</span>
          </div>
        </div>
      )}

      {/* Ball History */}
      <div className="ball-history card">
        <h3>📊 Ball-by-Ball Replay</h3>
        <div className="history-list">
          {balls.slice(0, ballIndex).map((ball, idx) => (
            <div key={idx} className={`history-item event-${ball.event}`}>
              <span className="ball-num">Ball {idx + 1}</span>
              <span className="event-name">{ball.event.toUpperCase()}</span>
              <span className="runs-badge">
                {ball.runs > 0 ? `${ball.runs}R` : 'DOT'}
              </span>
              <div className="commentary-brief">
                <button className="play-commentary" onClick={() => speakText(getCommentaryForMode(ball), { interrupt: true, prepend: true })} aria-label="Play commentary">🔊</button>
                <span>{stripSSMLTags(getCommentaryForMode(ball))}</span>
              </div>
            </div>
          ))}
        </div>
        {ballIndex === 0 && <p className="no-balls">Start simulation to see ball history</p>}
      </div>
    </div>
  );
}

export default LiveMatch;
