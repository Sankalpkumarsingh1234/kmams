import { Router } from 'express';
import axios from 'axios';

const router = Router();

// GROQ_API_KEY will be read dynamically in the route handler
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * POST /api/chat
 * Send message to Groq API with user context
 */
router.post('/api/chat', async (req, res) => {
  try {
    const { userMessage, userContext } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    const apiKey = process.env.GROQ_API_KEY;

    // If Groq not configured, return helpful fallback
    if (!apiKey) {
      return res.status(200).json({
        reply: '⚠️ [System Error]: The GROQ_API_KEY environment variable is currently completely missing or empty on Vercel! Please add your Groq API Key to the Vercel Dashboard Environment Variables and redeploy.',
        model: 'error-missing-key',
        timestamp: new Date().toISOString(),
      });
    }

    // Build system prompt with user context
    const systemPrompt = `You are the official GigShield AI Advisor - the smart parametric income protection assistant for Indian delivery workers (Zomato/Swiggy).

User Profile Context:
- Name: ${userContext?.name || 'Worker'}
- Platform: ${userContext?.platform || 'Delivery'}
- Policy Tier: ${userContext?.policyTier || 'Standard'}
- Weekly Earnings: ₹${userContext?.earnings || 6000}
- NFI Score: ${userContext?.nfiScore || 'N/A'} (Score > 65 is High Risk)

CORE KNOWLEDGE BASE (Use this to answer their questions):

1. COVERAGE & TRIGGERS
- Rain: Payout triggers if rainfall exceeds 35mm in a 1-hour window.
- Heat: Triggered if the Heat Index exceeds 42°C. The heat index is calculated using the Rothfusz formula combining real temperature and relative humidity.
- Air Quality (AQI): Triggered if AQI > 350 (Very Poor).
- Platform Outage: Swiggy/Zomato servers must be continuously down for > 90 minutes. Yes, they are covered for Swiggy going down!

2. PAYOUTS & MONEY
- Payout amounts vary by tier, usually between 40% to 70% of max weekly coverage. Example: Standard plan max is roughly ₹2,000/week, so a rain trigger yields ~₹800.
- Speed: Money reaches the bank instantly within 2 hours.
- Method: Direct transfer via registered UPI ID.
- Multiple Claims: No limits per week up to the total max policy limit.

3. MY POLICY
- Explain their current plan (Standard = ₹54/wk premium).
- Recommend upgrading to Premium (₹99/wk) if they want 2x higher payouts per trigger and extended coverage limits.

4. RISK & ZONE (NFI)
- NFI (National Friction Index) Score: Predicts weather/historical disruption risk. 
- High Risk (Score > 65): Means their zone experiences frequent heavy rains or dense smog/heatwaves.
- Metros like Mumbai (Rain) and Delhi (AQI) historically have the highest disruption risks.

5. CLAIMS & FRAUD
- Manual Claims: NEVER required! GigShield is parametric. Sensors detect the weather, and payouts are totally automatic.
- Fraud: The system cross-references their live GPS zone via the app with verified OpenWeatherMap API data. Legitimate delivery workers will never be naturally flagged for fraud.
- Notification: They will get a WhatsApp alert the second they are paid.

INSTRUCTIONS:
Keep responses SHORT (1-3 sentences maximum). Be friendly, empathetic, and speak in plain English. Use ₹ for currency. Directly inform them of exact numbers if they ask. If unsure, direct them to support!`;

    // Call Groq API
    const response = await axios.post(
      GROQ_URL,
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 15000,
      }
    );

    const reply = response.data.choices[0].message.content;

    res.json({
      reply,
      model: 'llama-3.1-8b-instant',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Groq API error:', error.response?.data || error.message);

    const errorMessage = error.response?.data?.error?.message || error.message;
    // Return 200 so the frontend cleanly displays the error in the chat window to the user
    res.status(200).json({
      reply: `[System]: Groq AI is failing to respond. Error: ${errorMessage}`,
      model: 'error-fallback',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/chat/health
 * Check if Groq service is available
 */
router.post('/api/chat/health', async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.json({ status: 'unconfigured', message: 'Groq API key not set' });
    }

    // Quick test call
    const response = await axios.post(
      GROQ_URL,
      {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 5000,
      }
    );

    res.json({
      status: 'healthy',
      message: 'Groq API is responding',
      model: 'mixtral-8x7b-32768',
    });
  } catch (error) {
    console.error('Groq health check failed:', error.message);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

export default router;
