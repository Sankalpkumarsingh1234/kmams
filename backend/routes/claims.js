import { Router } from 'express';
import { logClaim, getUserClaims } from '../config/supabase.js';

const router = Router();

// Trigger thresholds
const TRIGGER_THRESHOLDS = {
  rain: 35, // mm
  heat: 42, // Celsius
  aqi: 350, // Air Quality Index
  outage: 90, // minutes
};

/**
 * POST /api/claims
 * Log a new claim trigger (auto-payout)
 */
router.post('/api/claims', async (req, res) => {
  try {
    const {
      user_id,
      policy_id,
      trigger,
      amount_triggered,
      weather_data,
    } = req.body;

    // Validate trigger type
    if (!['rain', 'heat', 'aqi', 'outage'].includes(trigger)) {
      return res.status(400).json({
        error: 'Invalid trigger type. Must be: rain, heat, aqi, or outage',
      });
    }

    if (!user_id || !policy_id) {
      return res.status(400).json({
        error: 'user_id and policy_id are required',
      });
    }

    const claim = await logClaim({
      user_id,
      policy_id,
      trigger,
      amount_triggered,
      weather_data,
    });

    res.status(201).json({
      ...claim,
      message: `Auto-payout triggered for ${trigger} event`,
    });
  } catch (error) {
    console.error('POST /api/claims error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/claims/:userId
 * Get all claims for a user
 */
router.get('/api/claims/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const claims = await getUserClaims(userId);

    res.json({
      claims,
      count: claims.length,
    });
  } catch (error) {
    console.error('GET /api/claims/:userId error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/triggers
 * Get trigger threshold definitions
 */
router.get('/api/triggers', (req, res) => {
  res.json(TRIGGER_THRESHOLDS);
});

export default router;
