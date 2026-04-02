import { Router } from 'express';
import axios from 'axios';

const router = Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
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

    // If Groq not configured, return helpful fallback
    if (!GROQ_API_KEY) {
      return res.status(200).json({
        reply: '⚠️ [System Error]: The GROQ_API_KEY environment variable is currently completely missing or empty on Vercel! Please add your Groq API Key to the Vercel Dashboard Environment Variables and redeploy.',
        model: 'error-missing-key',
        timestamp: new Date().toISOString(),
      });
    }

    // Build system prompt with user context
    const systemPrompt = `You are a helpful insurance advisor for GigShield - parametric income protection for delivery workers.

User Profile:
- Name: ${userContext?.name || 'Worker'}
- Platform: ${userContext?.platform || 'Delivery'}
- Policy Tier: ${userContext?.policyTier || 'Standard'}
- Weekly Earnings: ₹${userContext?.earnings || 6000}
- NFI Score: ${userContext?.nfiScore || 'N/A'}

You provide:
1. Policy coverage explanations
2. Claim trigger information (rain >35mm, heat >42°C, AQI >350, app outage >90min)
3. Payout processing answers
4. Premium calculation explanations
5. General insurance guidance

Keep responses SHORT (1-2 sentences), FRIENDLY, and in CONTEXT with their policy.
If unsure, direct them to support@gigshield.work`;

    // Call Groq API
    const response = await axios.post(
      GROQ_URL,
      {
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        timeout: 15000,
      }
    );

    const reply = response.data.choices[0].message.content;

    res.json({
      reply,
      model: 'llama3-8b-8192',
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
    if (!GROQ_API_KEY) {
      return res.json({ status: 'unconfigured', message: 'Groq API key not set' });
    }

    // Quick test call
    const response = await axios.post(
      GROQ_URL,
      {
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      },
      {
        headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
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
