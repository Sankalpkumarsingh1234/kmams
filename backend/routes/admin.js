import { Router } from 'express';
import {
  getAllClaims,
  getAllActiveUsers,
  getAllPayments,
  getAdminStats,
  updateClaimStatus
} from '../config/supabase.js';

const router = Router();

// Middleware: Simple PIN Auth for Demo
const verifyAdmin = (req, res, next) => {
  const pin = req.headers['x-admin-pin'];
  if (pin === '1234') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized. Invalid Admin PIN.' });
  }
};

/**
 * GET /api/admin/stats
 * Unified KPIs for the overview tab
 */
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const stats = await getAdminStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/users
 * Tab: Riders
 */
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await getAllActiveUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/payments
 * Tab: Finance (Revenue)
 */
router.get('/payments', verifyAdmin, async (req, res) => {
  try {
    const payments = await getAllPayments();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
