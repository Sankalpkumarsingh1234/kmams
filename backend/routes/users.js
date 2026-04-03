import { Router } from 'express';
import {
  createUser,
  getUserProfile,
  getUserClaims,
} from '../config/supabase.js';

const router = Router();

/**
 * POST /api/users
 * Create or get existing user
 */
router.post('/users', async (req, res) => {
  try {
    const {
      email,
      name,
      platform,
      pin_code,
      earnings,
      nfi,
    } = req.body;

    // Validate required fields
    if (!email || !name || !platform || !pin_code || !earnings || !nfi) {
      return res.status(400).json({
        error: 'Missing required fields: email, name, platform, pin_code, earnings, nfi',
      });
    }

    const user = await createUser({
      email,
      name,
      platform,
      pin_code,
      earnings,
      nfi,
    });

    res.status(user.isNew ? 201 : 200).json({
      id: user.id,
      message: user.isNew ? 'User created' : 'User already exists',
      ...user,
    });
  } catch (error) {
    console.error('POST /api/users error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/users/:userId
 * Fetch user profile with policy and claims
 */
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const profile = await getUserProfile(userId);

    res.json(profile);
  } catch (error) {
    console.error('GET /api/users/:userId error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/users/:userId/claims
 * Fetch all claims for a user
 */
router.get('/users/:userId/claims', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const claims = await getUserClaims(userId);

    res.json({ claims, count: claims.length });
  } catch (error) {
    console.error('GET /api/users/:userId/claims error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
