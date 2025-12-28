/**
 * Commentary Generator
 * Converts ball data into dramatic cricket commentary using lookups
 */

const fs = require('fs');
const path = require('path');

let cachedLookups = null;

/**
 * Load commentary lookups from data/commentary-lookups.json
 */
function loadCommentaryLookups() {
  if (!cachedLookups) {
    const lookupsPath = path.join(__dirname, '../data/commentary-lookups.json');
    const data = fs.readFileSync(lookupsPath, 'utf-8');
    cachedLookups = JSON.parse(data);
  }
  return cachedLookups;
}

/**
 * Get a random item from an array
 */
function getRandomItem(arr) {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Helper to map short language codes to lookup keys
 */
function mapLangCodeToKey(code) {
  switch (code) {
    case 'hi':
      return 'hindi';
    case 'ta':
      return 'tamil';
    case 'te':
      return 'telugu';
    case 'en':
    default:
      return null;
  }
}

/**
 * Generate commentary for a single ball
 * 
 * @param {Object} ball - Ball data with event, bowler, batter, etc.
 * @param {String} language - Language code ('en', 'hi', 'ta', 'te')
 * @returns {String} Commentary text
 */
function generateCommentary(ball, language = 'en') {
  // If the ball already contains a commentary for the requested language, use it
  if (ball && typeof ball === 'object') {
    const langKey = `commentary_${language}`;
    if (ball[langKey]) return ball[langKey];
    if (language === 'en' && ball.commentary) return ball.commentary;
  }

  const lookups = loadCommentaryLookups();

  // Start with bowler-specific commentary if available
  if (lookups.bowler_specific[ball.bowler]) {
    const bowlerCommentary = lookups.bowler_specific[ball.bowler][ball.event];
    if (bowlerCommentary) {
      return getRandomItem(bowlerCommentary);
    }
  }

  // Special handling for wickets
  if (ball.event === 'wicket') {
    if (ball.wicket_type === 'bowled') {
      return getRandomItem(lookups.commentary_templates.wicket_bowled);
    } else if (ball.wicket_type === 'lbw') {
      return getRandomItem(lookups.commentary_templates.wicket_lbw);
    } else if (ball.wicket_type === 'caught') {
      return getRandomItem(lookups.commentary_templates.wicket_caught);
    }
    return getRandomItem(lookups.commentary_templates.wicket);
  }

  // Special handling for yorker
  if (ball.event === 'yorker' || ball.description?.includes('yorker')) {
    if (lookups.bowler_specific[ball.bowler]?.yorker) {
      return getRandomItem(lookups.bowler_specific[ball.bowler].yorker);
    }
  }

  // Default commentary based on event type
  const eventCommentary = lookups.commentary_templates[ball.event];
  if (eventCommentary) {
    if (language === 'en') {
      return getRandomItem(eventCommentary);
    }

    // Use language-specific snippet if available
    const langKey = mapLangCodeToKey(language);
    if (langKey && lookups.languages && lookups.languages[langKey] && lookups.languages[langKey][ball.event]) {
      return lookups.languages[langKey][ball.event];
    }

    // Fallback to English template
    return getRandomItem(eventCommentary);
  }

  // Fallback
  return `${ball.bowler} bowls, ${ball.batter} plays it. ${ball.runs} runs.`;
}

/**
 * Generate commentary for multiple balls
 * 
 * @param {Array} balls - Array of ball objects
 * @param {String} language - Language code
 * @returns {Array} Balls with commentary added
 */
function generateCommentaryForBalls(balls, language = 'en') {
  return balls.map(ball => ({
    ...ball,
    commentary: generateCommentary(ball, language)
  }));
}

module.exports = {
  generateCommentary,
  generateCommentaryForBalls,
  loadCommentaryLookups
};
