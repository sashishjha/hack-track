const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Ensure there is an API key, otherwise just return null
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

async function extractCompetitionData(htmlContent, sourceUrl) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY not set in .env. Skipping LLM extraction.");
    return null;
  }

  // To save tokens, strip out excessive HTML whitespace
  const cleanText = htmlContent.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').substring(0, 15000); // Send max 15k chars

  const prompt = `
  You are an AI that extracts hackathon and competition details from webpage text.
  Extract the following competition from this raw webpage text and return ONLY a valid JSON object matching this schema. Do not return markdown tags, just the raw JSON.
  {
    "title": "string (name of the hackathon)",
    "organizer": "string (company/group hosting it)",
    "description": "string (short 1-2 sentence description)",
    "prizeDisplay": "string (e.g. '$10,000' or 'Prizes TBD')",
    "submissionDeadline": "ISO-8601 string or null if not found",
    "status": "open" or "upcoming",
    "skillDomains": ["ai_ml", "web_app", "data_science", "cybersecurity", "robotics"] (pick best matches, max 3)
  }

  Source URL: ${sourceUrl}

  Raw Page Text:
  ${cleanText}
  `;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Clean up markdown formatting if any
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(text);
    parsed.url = sourceUrl;
    parsed.platform = 'discovered'; // flag indicating it was found by web crawler
    parsed.id = 'disc_' + Date.now() + Math.floor(Math.random()*1000);
    parsed.rarityScore = 8; // Newly discovered are usually rare!
    parsed.trustScore = 5; // Needs manual verification
    
    return parsed;
  } catch (err) {
    console.error("❌ Failed to extract with Gemini:", err.message);
    return null;
  }
}

module.exports = { extractCompetitionData };
