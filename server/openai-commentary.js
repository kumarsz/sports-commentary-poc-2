/**
 * OpenAI Commentary Generator (PoC)
 * Generates dramatic cricket commentary using OpenAI API
 * 
 * Requires: OPENAI_API_KEY environment variable
 */

const OpenAI = require('openai');

let openaiClient = null;
let apiKeyConfigured = false;

/**
 * Create an OpenAI client. If apiKey is provided, create a temporary client for that key.
 * If not, fall back to the server-initialized client (if any).
 */
function createClient(apiKey) {
  if (apiKey) {
    // Do not persist or cache this client. It is used only for the single request.
    return new OpenAI({ apiKey });
  }
  if (openaiClient) return openaiClient;
  throw new Error('OpenAI client not initialized and no apiKey provided');
}

/**
 * Initialize OpenAI client
 * Call this once at startup to validate API key
 */
function initializeOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️  OPENAI_API_KEY not set. OpenAI commentary generation will be unavailable.');
    apiKeyConfigured = false;
    return false;
  }

  try {
    openaiClient = new OpenAI({ apiKey });
    apiKeyConfigured = true;
    console.log('✅ OpenAI API initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize OpenAI:', error.message);
    apiKeyConfigured = false;
    return false;
  }
}

/**
 * Check if OpenAI is configured on the server
 */
function isOpenAIAvailable() {
  return apiKeyConfigured && openaiClient !== null;
}

/**
 * Generate commentary for a single ball using OpenAI
 * 
 * @param {Object} ball - Ball data with event, bowler, batter, runs, etc.
 * @param {String} language - Language code ('en', 'hi', 'ta', 'te')
 * @param {String} apiKey - Optional OpenAI API key for this request (session-only)
 * @returns {Promise<String>} Commentary text
 */
async function generateCommentaryWithOpenAI(ball, language = 'en', apiKey = null) {
  // Use a client created for this request if apiKey passed, otherwise use server client
  const client = createClient(apiKey);

  try {
    // Build ball description
    const ballDescription = describeBall(ball);

    // Language-specific system prompt
    const systemPrompt = getSystemPrompt(language);

    // Call OpenAI API
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Generate dramatic cricket commentary for this ball:\n\n${ballDescription}`
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    const commentary = response.choices[0]?.message?.content?.trim();
    
    if (!commentary) {
      throw new Error('Empty response from OpenAI');
    }

    return commentary;
  } catch (error) {
    // Do not log API keys. Log only the error message.
    console.error('OpenAI API error:', error.message);
    throw error;
  }
}

/**
 * Generate commentary for multiple balls using OpenAI
 * Validates the API key FIRST with a test request before processing all balls.
 * 
 * @param {Array} balls - Array of ball objects
 * @param {String} language - Language code
 * @param {String} apiKey - Optional OpenAI API key for this request (session-only)
 * @returns {Promise<Array>} Balls with commentary added
 */
async function generateCommentaryForBallsWithOpenAI(balls, language = 'en', apiKey = null) {
  // Validate client availability (either server client or provided apiKey)
  if (!apiKey && !isOpenAIAvailable()) {
    throw new Error('OpenAI not configured on server and no apiKey provided.');
  }

  try {
    const client = apiKey ? createClient(apiKey) : openaiClient;

    // ========== VALIDATE API KEY FIRST ==========
    // Make a test call with a minimal sample to validate the key before processing all balls
    console.log('🔐 Validating OpenAI API key with test request...');
    const testBall = { bowler: 'Validator', batter: 'Tester', runs: 0, event: 'dot', ball_number: 0 };
    try {
      await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: getSystemPrompt(language) },
          { role: 'user', content: `Generate dramatic cricket commentary for this ball:\n\n${describeBall(testBall)}` }
        ],
        temperature: 0.7,
        max_tokens: 100
      });
      console.log('✅ OpenAI API key validated successfully');
    } catch (validationError) {
      // Key validation failed - throw error BEFORE processing any balls
      console.error('❌ OpenAI API key validation failed:', validationError.message);
      throw new Error(`API key validation failed: ${validationError.message}`);
    }

    // ========== KEY IS VALID - NOW PROCESS BALLS ==========
    const results = [];
    
    for (const ball of balls) {
      try {
        // Build input description
        const ballInput = describeBall(ball);
        console.log(`   🎾 Ball #${ball.ball_number}: INPUT → ${JSON.stringify({bowler: ball.bowler, batter: ball.batter, runs: ball.runs, event: ball.event})}`);

        // Use the pre-created client to call the API
        const response = await client.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: getSystemPrompt(language) },
            { role: 'user', content: `Generate dramatic cricket commentary for this ball:\n\n${ballInput}` }
          ],
          temperature: 0.7,
          max_tokens: 100
        });

        const commentary = response.choices[0]?.message?.content?.trim();
        if (!commentary) throw new Error('Empty response from OpenAI');

        // Log the output
        console.log(`   🎙️  Ball #${ball.ball_number}: OUTPUT → "${commentary}"`);

        results.push({
          ...ball,
          commentary
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.warn(`❌ Failed to generate commentary for ball ${ball.ball_number}:`, err.message);
        // If we get rate limit or quota errors, re-throw so frontend knows
        if (err.status === 429 || err.message.includes('quota') || err.message.includes('exceeded')) {
          throw err;
        }
        // For other non-critical errors, fallback to basic commentary
        results.push({
          ...ball,
          commentary: `${ball.bowler} bowls, ${ball.batter} plays it.`
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error generating commentaries with OpenAI:', error.message);
    throw error;
  }
}

/**
 * Build a natural language description of a ball
 */
function describeBall(ball) {
  let description = `Bowler: ${ball.bowler}\nBatter: ${ball.batter}\nRuns: ${ball.runs}\nEvent: ${ball.event}`;
  
  if (ball.wicket_type) description += `\nWicket Type: ${ball.wicket_type}`;
  if (ball.description) description += `\nDescription: ${ball.description}`;
  
  return description;
}

/**
 * Get system prompt for OpenAI based on language
 */
function getSystemPrompt(language) {
  const prompts = {
    en: `You are a legendary cricket commentator known for dramatic, exciting, and engaging ball-by-ball commentary. 
Generate 1-2 sentences of dramatic cricket commentary that captures the excitement and tension of the moment. 
Be vivid, use cricket metaphors, and make the listener feel the drama of the game.
Keep it to 1-2 sentences maximum.`,
    
    hi: `आप एक प्रसिद्ध क्रिकेट कमेंटेटर हैं जो नाटकीय और रोमांचक कमेंटरी के लिए जाने जाते हैं।
गेंद-दर-गेंद की नाटकीय क्रिकेट कमेंटरी जनरेट करें जो पल की उत्तेजना और तनाव को पकड़े।
जीवंत रहें, क्रिकेट की बातें करें, और श्रोता को खेल का नाटक महसूस कराएं।
अधिकतम 2 वाक्य।`,
    
    ta: `நீங்கள் நாடகமயமான மற்றும் உத்தேஜக ஆன்ட்டிக் பற்றி பழகிய பிரபல கிரிக்கெட் வர்ணனாகாரர்.
நாடகமயமான கிரிக்கெட் வர்ணனை உத்பா்திக்கவும் முறைபொறுப்பின் கூச சலிக்க.
உயிருள்ள, கிரிக்கெட் உபமை பயன்படுத்தவும், மற்றும் நேயரை கொள்ளை உணர்ந்து பொழிய விடுங்கள்.
அதிகபட்சம் 2 வாக்கியங்கள்.`,
    
    te: `మీరు నాటకీయ మరియు ఉత్తేజితమైన క్రికెట్ వివరణకారుగా ఈ భాషను ఆలోచించండి.
ప్రతిటి బంతిని నాటకీయమైన క్రికెట్ వర్ణన ఉత్పత్తి చేయండి.
జీవంతమైన, క్రికెట్ ఉపమానాలను ఉపయోగించండి, మరియు వినేవారిని ఆట యొక్క నాటకం అనుభవించండి.
గరిష్ట 2 వాక్యాలు.`
  };

  return prompts[language] || prompts['en'];
}

module.exports = {
  initializeOpenAI,
  isOpenAIAvailable,
  generateCommentaryWithOpenAI,
  generateCommentaryForBallsWithOpenAI
};
