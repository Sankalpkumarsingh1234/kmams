import { Router } from 'express';
import {
  logClaim,
  getUserClaims,
  getAllClaims,
  updateClaimStatus,
  getUserProfile,
} from '../config/supabase.js';
import { analyzeClaimFraud } from '../services/fraud_ai.js';

const router = Router();

router.post('/claims', async (req, res) => {
  try {
    const {
      user_id,
      policy_id,
      trigger,
      amount_triggered,
      weather_data,
    } = req.body;

    if (!user_id || !trigger || !amount_triggered) {
      return res.status(400).json({
        error: 'Missing required fields: user_id, trigger, amount_triggered',
      });
    }

    // Capture User Data for AI Analysis
    const profile = await getUserProfile(user_id);
    const userData = profile.user || {};

    // 🔍 Real-time AI Fraud Analysis
    console.log(`[AI Fraud] Analyzing claim for ${userData.name}...`);
    const aiAnalysis = await analyzeClaimFraud(
      { trigger, amount_triggered },
      userData,
      weather_data || {}
    );

    const claim = await logClaim({
      user_id,
      policy_id,
      trigger,
      amount_triggered,
      weather_data,
      fraud_score: aiAnalysis.score,
      fraud_analysis: aiAnalysis.analysis
    });

    res.status(201).json({
      id: claim.id,
      message: 'Claim logged and analyzed by AI',
      fraud_score: aiAnalysis.score, // Only returned for audit/log
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

/**
 * GET /api/claims
 * Fetch ALL claims (Admin)
 */
router.get('/claims', async (req, res) => {
  try {
    const claims = await getAllClaims();
    res.json(claims);
  } catch (error) {
    console.error('GET /api/claims error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/claims/:id
 * Update claim status (Approve/Reject)
 */
router.patch('/claims/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: 'claim ID and status are required' });
    }

    const updated = await updateClaimStatus(id, status);
    res.json(updated);
  } catch (error) {
    console.error('PATCH /api/claims/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
