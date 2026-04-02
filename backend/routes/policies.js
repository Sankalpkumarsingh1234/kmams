import { Router } from 'express';
import { createPolicy } from '../config/supabase.js';

const router = Router();

// Tier definitions
const TIERS = {
  basic: { base: 20, max_payout: 50000 },
  standard: { base: 54, max_payout: 200000 },
  premium: { base: 99, max_payout: 500000 },
};

/**
 * POST /api/policies
 * Create or update policy for user
 */
router.post('/api/policies', async (req, res) => {
  try {
    const { user_id, tier, premium_weekly, max_payout } = req.body;

    // Validate tier
    if (!TIERS[tier]) {
      return res.status(400).json({
        error: `Invalid tier. Must be one of: ${Object.keys(TIERS).join(', ')}`,
      });
    }

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Use provided premium and payout, or fall back to defaults
    const finalPremium = premium_weekly || TIERS[tier].base;
    const finalPayout = max_payout || TIERS[tier].max_payout;

    const policy = await createPolicy({
      user_id,
      tier,
      premium_weekly: finalPremium,
      max_payout: finalPayout,
    });

    res.status(201).json({
      ...policy,
      id: policy.id,
      policy_id: policy.id,
      tier,
      premium_weekly: finalPremium,
      max_payout: finalPayout,
    });
  } catch (error) {
    console.error('POST /api/policies error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tiers
 * Get all tier definitions
 */
router.get('/api/tiers', (req, res) => {
  res.json(TIERS);
});

export default router;
