import { Router } from 'express';
import {
  logClaim,
  getUserClaims,
} from '../config/supabase.js';

const router = Router();

router.post('/claims', async (req, res) => {
  try {
    const {
      user_id,
      policy_id,
      trigger,
      amount_triggered, // REVERTED amount -> amount_triggered
      weather_data,
    } = req.body;

    if (!user_id || !trigger || !amount_triggered) {
      return res.status(400).json({
        error: 'Missing required fields: user_id, trigger, amount_triggered',
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
      id: claim.id,
      message: 'Claim logged successfully',
      ...claim,
    });
  } catch (error) {
    console.error('POST /api/claims error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/claims/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const claims = await getUserClaims(userId);
    res.json({ claims, count: claims.length });
  } catch (error) {
    console.error('GET /api/claims/user/:userId error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
