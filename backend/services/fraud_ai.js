import OpenAI from 'openai';

/**
 * Analyze a claim for potential fraud using AI
 * @param {Object} claimData - Data about the claim
 * @param {Object} userData - Data about the user
 * @param {Object} weatherData - Live weather data at the time of trigger
 * @returns {Promise<Object>} - Fraud score and analysis
 */
export async function analyzeClaimFraud(claimData, userData, weatherData) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('[Fraud AI] OpenAI API key missing. Returning default score.');
    return {
      score: 15,
      analysis: 'AI Analysis unavailable (Missing API Key). baseline check based on location only.'
    };
  }

  const openai = new OpenAI({ apiKey });

  const prompt = `
  You are an AI Fraud Detection agent for GigShield, a parametric insurance app for gig workers.
  Analyze the following claim for fraud or inconsistency.
  
  CLAIM DATA:
  - Trigger: ${claimData.trigger}
  - Amount: ₹${claimData.amount_triggered}
  - Time: ${new Date().toISOString()}
  
  USER DATA:
  - Name: ${userData.name}
  - Base PIN Code: ${userData.pin_code}
  - Platform: ${userData.platform}
  - Historical Claims: ${userData.historical_claims_count || 0}
  
  LIVE WEATHER AT TRIGGER:
  - Recorded Value: ${claimData.amount_triggered}
  - Location: ${weatherData.location || 'Unknown'}
  - Detailed Stats: ${JSON.stringify(weatherData)}
  
  CONTEXT:
  - Rain threshold: 35mm
  - Heat threshold: 42°C
  - AQI threshold: 350
  
  INSTRUCTIONS:
  1. Calculate a fraud score from 0 to 100 (0 = Legitimate, 100 = Definitive Fraud).
  2. Provide a 2-sentence breakdown of "Signals" (e.g., GPS mismatch, frequency anomaly).
  3. Respond STRICTLY in JSON format: {"score": number, "analysis": "string"}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a professional insurance fraud analyst.' },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      score: result.score || 0,
      analysis: result.analysis || 'Analysis complete.'
    };
  } catch (error) {
    console.error('[Fraud AI] Error:', error.message);
    return {
      score: 20,
      analysis: 'AI analysis failed. Fallback to basic heuristic: Location match confirmed.'
    };
  }
}

export default {
  analyzeClaimFraud
};
