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
  const [speechRate, setSpeechRate] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // AI mode state
  const [aiMode, setAiMode] = useState('local'); // 'local' | 'openai'
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // OpenAI session key (stored in sessionStorage so it expires when the browser session ends)
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiKeyValid, setOpenaiKeyValid] = useState(false);
  const [openaiValidating, setOpenaiValidating] = useState(false);
  const [openaiError, setOpenaiError] = useState(null);

  const speechQueueRef = useRef([]);
  const isSpeakingRef = useRef(false);

  // Fetch match & balls from backend
  const fetchMatch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setAiError(null);
      setAiLoading(true);

      // Fetch match details
      const matchRes = await axios.get(`/api/matches/${id}`);
      setMatch(matchRes.data);

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
          // OpenAI not available, show error and fall back
          setAiError('OpenAI not configured. Using local commentary instead.');
          setAiMode('local');
          // Retry with local mode
          const ballsRes = await axios.get(`/api/matches/${id}/balls?language=${language}&aiMode=local`);
          setBalls(ballsRes.data);
          setBallIndex(0);
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
    };

    loadVoices();
    synth.addEventListener('voiceschanged', loadVoices);
    return () => synth.removeEventListener('voiceschanged', loadVoices);
  }, []);

  // Default voice selection when voices list or language changes
  useEffect(() => {
    if (voices.length === 0) return;
    const langPrefix = {
      en: 'en',
      hi: 'hi',
      ta: 'ta',
      te: 'te'
    }[language] || 'en';

    const preferred = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
    const id = preferred ? (preferred.voiceURI || preferred.name) : (voices[0].voiceURI || voices[0].name);
    setSelectedVoice(id);
  }, [voices, language]);

  const processSpeechQueue = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeakingRef.current) return; // already speaking

    const next = speechQueueRef.current.shift();
    if (!next) return;

    const utter = new SpeechSynthesisUtterance(next.text);
    const voiceObj = voices.find(v => (v.voiceURI || v.name) === selectedVoice);
    if (voiceObj) utter.voice = voiceObj;

    const langMapToLocale = { en: 'en-US', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN' };
    utter.lang = langMapToLocale[language] || utter.lang;
    utter.rate = speechRate;
    // Note: pitch and volume controls removed as they were unused
    // Users can control speech rate via the UI slider

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

  // Speak automatically when a new ball is revealed
  useEffect(() => {
    const current = getCurrentBall();
    if (ttsEnabled && current && current.commentary) {
      // Behavior based on selected TTS mode
      if (ttsMode === 'complete') {
        // Complete mode: queue the audio so it plays after previous audio finishes
        speakText(current.commentary, { interrupt: false, prepend: false });
      } else if (ttsMode === 'interrupt') {
        // Interrupt mode: stop current and play immediately (for testing)
        speakText(current.commentary, { interrupt: true, prepend: false });
      } else {
        // queued mode: let processor handle natural flow
        speakText(current.commentary, { interrupt: false, prepend: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ballIndex, ttsEnabled, ttsMode]);

  // Simulate live ball updates
  useEffect(() => {
    if (!simulateMode || ballIndex >= balls.length) {
      setSimulateMode(false);
      return;
    }

    let timer;

    if (ttsEnabled && (ttsMode === 'complete' || ttsMode === 'queued')) {
      // In 'complete' or 'queued' mode, wait for speech to finish before advancing
      const scheduleAdvance = () => {
        if (!simulateMode) return; // Stop if simulation was paused
        if (isSpeakingRef.current) {
          timer = setTimeout(scheduleAdvance, 200);
          return;
        }
        // Wait for any queued items to start processing
        timer = setTimeout(() => setBallIndex(prev => prev + 1), 100);
      };
      timer = setTimeout(scheduleAdvance, 100);
    } else {
      // Interrupt mode or TTS disabled: use normal speed
      timer = setTimeout(() => {
        setBallIndex(prev => prev + 1);
      }, speed);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [simulateMode, ballIndex, balls.length, speed, ttsEnabled, ttsMode]);

  const getCurrentBall = () => {
    if (ballIndex === 0) return null;
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

  // AI mode change effect
  useEffect(() => {
    if (aiMode === 'openai' && !openaiKeyValid) {
      setAiMode('local'); // Fallback to local mode if OpenAI key is not valid
    }
  }, [aiMode, openaiKeyValid]);

  if (loading) {
    return (
      <div className="live-match-container">
        <Link to="/" className="back-link">← Back to Matches</Link>
        <h2>Loading match...</h2>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
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

      {/* Controls */}
      <div className="controls card">
        <button
          className={`btn-primary ${simulateMode ? 'btn-danger' : ''}`}
          onClick={() => {
            const newMode = !simulateMode;
            setSimulateMode(newMode);
            // If pausing, stop TTS
            if (!newMode) {
              stopSpeech();
            }
          }}
        >
          {simulateMode ? '⏸️ Pause' : '▶️ Simulate Live'}
        </button>

        <div className="speed-control">
          <label>Speed:</label>
          <select value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))}>
            <option value={500}>2x (Fast)</option>
            <option value={1000}>1x (Normal)</option>
            <option value={2000}>0.5x (Slow)</option>
            <option value={3000}>0.33x (Very Slow)</option>
          </select>
        </div>

        {/* OpenAI API Key Input */}
        <div className="openai-key-control">
          <label>OpenAI API Key (Optional):</label>
          <div className="api-key-input-group">
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
              className="api-key-input"
              disabled={simulateMode}
            />
            {openaiValidating && <span className="validating-spinner">🔄 Validating...</span>}
            {openaiKeyValid && <span className="key-valid">✅ Key Valid</span>}
            {openaiError && <span className="key-error">{openaiError}</span>}
          </div>
          <p className="api-key-help">
            Enter your OpenAI API key to enable dynamic commentary generation. Leave blank to use local lookup tables.
          </p>
        </div>

        {/* AI Mode Selection */}
        <div className="ai-mode-control">
          <label>AI Mode (Commentary Generation):</label>
          <select 
            value={aiMode} 
            onChange={(e) => {
              setAiMode(e.target.value);
              // Reload balls with new AI mode
              setAiLoading(true);
              setTimeout(fetchMatch, 300);
            }}
            disabled={simulateMode || aiLoading}
          >
            <option value="local">No AI (Local Lookup)</option>
            <option value="openai">OpenAI-POC (Dynamic Generation)</option>
          </select>
          {aiLoading && <span className="loading-spinner">🔄 Loading...</span>}
          {aiError && <span className="ai-error">{aiError}</span>}
        </div>

        {/* TTS Controls */}
        <div className="tts-controls">
          <label className="tts-toggle">
            <input type="checkbox" checked={ttsEnabled} onChange={(e) => setTtsEnabled(e.target.checked)} />
            &nbsp;Enable Speech
          </label>

          {ttsEnabled && (
            <>
              <label className="voice-select">
                Voice:
                <select value={selectedVoice || ''} onChange={(e) => setSelectedVoice(e.target.value)}>
                  {voices.map(v => (
                    <option key={v.voiceURI || v.name} value={v.voiceURI || v.name}>{v.name} ({v.lang})</option>
                  ))}
                </select>
              </label>

              <label className="speech-rate">
                Rate: <input type="range" min="0.5" max="2" step="0.1" value={speechRate} onChange={(e) => setSpeechRate(parseFloat(e.target.value))} />
              </label>

              <label className="tts-mode">
                Audio Mode:
                <select value={ttsMode} onChange={(e) => {
                  setTtsMode(e.target.value);
                  stopSpeech(); // Clear queue when switching modes
                }}>
                  <option value="complete">Complete (wait for audio, then next ball)</option>
                  <option value="queued">Queued (smooth broadcast)</option>
                  <option value="interrupt">Interrupt (immediate, may cut off)</option>
                  <option value="follow">Follow (wait for speech before advancing)</option>
                </select>
              </label>

              <button className="btn-primary" onClick={() => speakText(currentBall?.commentary, { interrupt: true, prepend: true })}>🔊 Replay Commentary</button>
              <button className="btn-primary" onClick={() => {
                stopSpeech();
                setSimulateMode(false);
              }} disabled={!isSpeaking && !simulateMode}>⏹ Stop All</button>
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
                <button className="play-commentary" onClick={() => speakText(ball.commentary, { interrupt: true, prepend: true })} aria-label="Play commentary">🔊</button>
                <span>{ball.commentary}</span>
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
