import { Router } from 'express';
import { logPayment } from '../config/supabase.js';

const router = Router();

/**
 * POST /api/payments
 * Record a successful premium payment (Simulated or Real)
 */
router.post('/', async (req, res) => {
  try {
    const { user_id, amount, platform } = req.body;
    if (!user_id || !amount) {
      return res.status(400).json({ error: 'user_id and amount are required' });
    }

    const payment = await logPayment({
      user_id,
      amount,
      platform: platform || 'UPI',
      status: 'success'
    });

    res.status(201).json(payment);
  } catch (err) {
    console.error('POST /api/payments error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
