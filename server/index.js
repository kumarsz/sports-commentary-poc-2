/**
 * CricketAI PoC - Backend Server
 * Express.js API to serve match data, balls, and commentary
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { generateCommentaryForBalls } = require('./commentary-generator');
const { initializeOpenAI, isOpenAIAvailable, generateCommentaryWithOpenAI, generateCommentaryForBallsWithOpenAI } = require('./openai-commentary');

const app = express();
const PORT = process.env.PORT || 8000;

// Initialize OpenAI at startup (optional, only if API key is set)
initializeOpenAI();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'x-openai-api-key']
}));
app.use(express.json());

// ============================================
// Data Loading & Caching
// ============================================

let cachedMatches = null;
let cachedBalls = {};
let cachedCommentaryLookups = null;

/**
 * Load matches from data/matches.json
 */
function loadMatches() {
  if (!cachedMatches) {
    const matchesPath = path.join(__dirname, '../data/matches.json');
    const data = fs.readFileSync(matchesPath, 'utf-8');
    cachedMatches = JSON.parse(data);
  }
  return cachedMatches;
}

/**
 * Load balls for a specific match
 */
function loadBallsForMatch(matchId) {
  // Find the balls file for this match
  const matches = loadMatches();
  const match = matches.find(m => m.id === matchId);
  
  if (!match || !match.balls_file) {
    return [];
  }

  // Load from cache or disk
  if (!cachedBalls[matchId]) {
    const ballsPath = path.join(__dirname, `../data/${match.balls_file}`);
    if (fs.existsSync(ballsPath)) {
      const data = fs.readFileSync(ballsPath, 'utf-8');
      cachedBalls[matchId] = JSON.parse(data);
    } else {
      cachedBalls[matchId] = [];
    }
  }

  return cachedBalls[matchId];
}

/**
 * Load commentary lookups from data/commentary-lookups.json
 */
function loadCommentaryLookups() {
  if (!cachedCommentaryLookups) {
    const lookupsPath = path.join(__dirname, '../data/commentary-lookups.json');
    const data = fs.readFileSync(lookupsPath, 'utf-8');
    cachedCommentaryLookups = JSON.parse(data);
  }
  return cachedCommentaryLookups;
}

// ============================================
// API Routes
// ============================================

/**
 * GET /api/matches
 * Returns list of all matches
 */
app.get('/api/matches', (req, res) => {
  try {
    const matches = loadMatches();
    res.json(matches);
  } catch (error) {
    console.error('Error loading matches:', error.message);
    res.status(500).json({ error: 'Failed to load matches' });
  }
});

/**
 * GET /api/matches/:id
 * Returns a specific match details
 */
app.get('/api/matches/:id', (req, res) => {
  try {
    const matches = loadMatches();
    const match = matches.find(m => m.id === req.params.id);
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    console.error('Error loading match:', error.message);
    res.status(500).json({ error: 'Failed to load match' });
  }
});

/**
 * GET /api/openai/status
 * Returns whether OpenAI is configured on the server
 */
app.get('/api/openai/status', (req, res) => {
  try {
    res.json({ configuredInServer: isOpenAIAvailable() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check OpenAI status' });
  }
});

/**
 * POST /api/openai/validate
 * Validate a client-provided OpenAI API key (sent via x-openai-api-key header)
 */
app.post('/api/openai/validate', async (req, res) => {
  const clientProvidedKey = req.headers['x-openai-api-key'] || null;

  if (!clientProvidedKey && !isOpenAIAvailable()) {
    return res.status(400).json({ valid: false, error: 'No API key provided and server-wide OpenAI is not configured.' });
  }

  try {
    // Use a tiny sample ball to validate the key
    const sampleBall = { bowler: 'Test', batter: 'Test', runs: 0, event: 'dot', ball_number: 0 };
    // generateCommentaryWithOpenAI is available from the openai-commentary module
    await generateCommentaryWithOpenAI(sampleBall, 'en', clientProvidedKey);
    res.json({ valid: true });
  } catch (err) {
    res.status(400).json({ valid: false, error: err.message });
  }
});

/**
 * GET /api/validate-openai-key
 * Frontend-facing endpoint to validate OpenAI API key
 * Used by React frontend for real-time key validation
 */
app.get('/api/validate-openai-key', async (req, res) => {
  const clientProvidedKey = req.headers['x-openai-api-key'] || null;

  if (!clientProvidedKey) {
    return res.status(400).json({ valid: false, error: 'No API key provided in x-openai-api-key header.' });
  }

  try {
    // Use a tiny sample ball to validate the key
    const sampleBall = { bowler: 'Test', batter: 'Test', runs: 0, event: 'dot', ball_number: 0 };
    await generateCommentaryWithOpenAI(sampleBall, 'en', clientProvidedKey);
    console.log('[VALIDATION] OpenAI API key validated successfully');
    res.json({ valid: true });
  } catch (err) {
    console.log('[VALIDATION] OpenAI API key validation failed:', err.message);
    res.status(401).json({ valid: false, error: err.message });
  }
});

/**
 * GET /api/matches/:id/balls
 * Returns all balls for a specific match with generated commentary
 * Query params: language (default 'en'), aiMode (default 'local', 'openai')
 */
app.get('/api/matches/:id/balls', async (req, res) => {
  try {
    const balls = loadBallsForMatch(req.params.id);
    const language = req.query.language || 'en';
    const aiMode = req.query.aiMode || 'local';
    const clientProvidedKey = req.headers['x-openai-api-key'] || null;

    console.log(`\n📍 [/api/matches/${req.params.id}/balls] Request received`);
    console.log(`   Language: ${language}`);
    console.log(`   AI Mode: ${aiMode}`);
    console.log(`   Client Key Provided: ${clientProvidedKey ? 'Yes (will validate)' : 'No'}`);
    console.log(`   Total Balls: ${balls.length}`);

    let ballsWithCommentary;
    let aiModeUsed = 'local';
    let openaiErrorMsg = null;

    if (aiMode === 'openai') {
      // Use OpenAI for commentary generation. Prefer client-provided key (session-only),
      // otherwise use server-configured OpenAI (if available).
      if (!clientProvidedKey && !isOpenAIAvailable()) {
        return res.status(503).json({ 
          error: 'OpenAI not configured on server and no API key provided in request. Provide API key via UI or set OPENAI_API_KEY on the server.',
          aiMode: 'local'
        });
      }

      try {
        // Pass clientProvidedKey (may be null) into generator - it will use server client if null
        console.log(`   → Generating commentary with OpenAI for ${balls.length} balls...`);
        ballsWithCommentary = await generateCommentaryForBallsWithOpenAI(balls, language, clientProvidedKey);
        aiModeUsed = 'openai';
        console.log(`   ✅ OpenAI generation successful - ${ballsWithCommentary.length} balls processed`);
      } catch (openaiError) {
        console.error('❌ OpenAI error:', openaiError.message);
        
        // Extract the actual error message (may be wrapped by validation function)
        const errorMsg = openaiError.message || '';
        
        // Check if it's a quota/billing error (429)
        if (openaiError.status === 429 || errorMsg.includes('quota') || errorMsg.includes('exceeded') || errorMsg.includes('Quota exceeded')) {
          console.log(`   → Returning 429 (Quota Exceeded)`);
          return res.status(429).json({
            error: 'OpenAI API quota exceeded or billing issue. Please check your OpenAI account billing details.',
            details: openaiError.message,
            aiMode: 'local'
          });
        }
        
        // Check if it's an auth error (401)
        if (openaiError.status === 401 || errorMsg.includes('Incorrect API key') || errorMsg.includes('invalid') || errorMsg.includes('Invalid API Key')) {
          console.log(`   → Returning 401 (Invalid Key)`);

          return res.status(401).json({
            error: 'Invalid OpenAI API key. Please check your key and try again.',
            details: openaiError.message,
            aiMode: 'local'
          });
        }
        
        // For other errors, fallback to local mode
        openaiErrorMsg = openaiError.message;
        console.log(`   → Falling back to local mode due to error`);
        ballsWithCommentary = generateCommentaryForBalls(balls, language);
        aiModeUsed = 'local';
      }
    } else {
      // Use local lookups (default)
      console.log(`   → Using local lookup tables for commentary`);
      ballsWithCommentary = generateCommentaryForBalls(balls, language);
      aiModeUsed = 'local';
    }

    // Expose which AI mode was actually used and any errors encountered
    res.setHeader('x-ai-mode-used', aiModeUsed);
    if (openaiErrorMsg) res.setHeader('x-openai-error', encodeURIComponent(openaiErrorMsg));

    console.log(`✅ Response prepared`);
    console.log(`   AI Mode Used: ${aiModeUsed}`);
    console.log(`   Balls Returned: ${ballsWithCommentary.length}`);
    if (openaiErrorMsg) console.log(`   Error: ${openaiErrorMsg}`);
    console.log(`   Status: 200 OK\n`);

    res.json(ballsWithCommentary);
  } catch (error) {
    console.error('Error loading balls:', error.message);
    res.status(500).json({ error: 'Failed to load balls' });
  }
});

/**
 * GET /api/matches/:id/balls?limit=10&offset=0
 * Returns paginated balls for a specific match
 */
app.get('/api/matches/:id/balls/paginated', (req, res) => {
  try {
    const balls = loadBallsForMatch(req.params.id);
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    const paginated = balls.slice(offset, offset + limit);
    
    res.json({
      balls: paginated,
      total: balls.length,
      offset,
      limit
    });
  } catch (error) {
    console.error('Error loading paginated balls:', error.message);
    res.status(500).json({ error: 'Failed to load paginated balls' });
  }
});

/**
 * GET /api/commentary-lookups
 * Returns commentary templates and lookups
 */
app.get('/api/commentary-lookups', (req, res) => {
  try {
    const lookups = loadCommentaryLookups();
    res.json(lookups);
  } catch (error) {
    console.error('Error loading commentary lookups:', error.message);
    res.status(500).json({ error: 'Failed to load commentary lookups' });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// 404 Handler
// ============================================

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ============================================
// Server Startup
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║    CricketAI PoC Backend Server       ║
╠════════════════════════════════════════╣
║  Running on http://localhost:${PORT}       ║
║  Serving match data from /data folder  ║
║  API docs:                             ║
║    GET  /api/matches                   ║
║    GET  /api/matches/:id               ║
║    GET  /api/matches/:id/balls         ║
║    GET  /api/commentary-lookups        ║
║    GET  /api/health                    ║
╚════════════════════════════════════════╝
  `);
});
