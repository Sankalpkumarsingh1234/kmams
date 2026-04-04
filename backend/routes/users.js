import { Router } from 'express';
import {
  createUser,
  getUserProfile,
  getUserClaims,
  getUserByEmail,
} from '../config/supabase.js';

const router = Router();

router.post('/users', async (req, res) => {
  try {
    const {
      email,
      name,
      platform,
      pin_code,
      earnings_weekly, // REVERTED
      nfi_score,      // REVERTED
    } = req.body;

    console.log('[API] POST /api/users request body:', req.body);

    if (
      email === undefined || name === undefined || platform === undefined || 
      pin_code === undefined || earnings_weekly === undefined || nfi_score === undefined
    ) {
      return res.status(400).json({
        error: 'Missing required fields: email, name, platform, pin_code, earnings_weekly, nfi_score',
      });
    }

    const user = await createUser({
      email,
      name,
      platform,
      pin_code,
      earnings_weekly,
      nfi_score,
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

router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const profile = await getUserProfile(userId);
    res.json(profile);
  } catch (error) {
    console.error('GET /api/users/:userId error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/users/:userId/claims', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const claims = await getUserClaims(userId);
    res.json({ claims, count: claims.length });
  } catch (error) {
    console.error('GET /api/users/:userId/claims error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/lookup/:email', async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ error: 'email is required' });
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('GET /api/users/lookup/:email error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
