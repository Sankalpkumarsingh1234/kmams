import { Router } from 'express';
import { sendChatMessage } from '../services/chat.js';

const router = Router();

/**
 * POST /api/chat
 * Send message to AI with user context and optional provider
 */
router.post('/chat', async (req, res) => {
  try {
    const { userMessage, userContext, provider = 'groq' } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    // Call the polymorphic chat service
    const result = await sendChatMessage(userMessage, userContext, provider);

    if (result.success) {
      res.json({
        reply: result.reply,
        model: result.model,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Return 200 with error message for better UI handling
      res.status(200).json({
        reply: `[System]: AI service error (${provider}). ${result.error}`,
        model: 'error-fallback',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Chat route error:', error.message);
    res.status(200).json({
      reply: `[System]: Critical error in chat route. ${error.message}`,
      model: 'error-fallback',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/chat/health
 * Check AI service status
 */
router.post('/chat/health', async (req, res) => {
  const provider = req.body.provider || 'groq';
  const apiKey = provider === 'openai' ? process.env.OPENAI_API_KEY : 
                 provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : 
                 process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.json({ 
      status: 'unconfigured', 
      message: `${provider} API key not set` 
    });
  }

  res.json({
    status: 'healthy',
    message: `${provider} API is configured`,
    provider
  });
});

export default router;

