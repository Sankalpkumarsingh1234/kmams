import { Router } from 'express';
import {
  checkWeatherTriggers,
  processAllTriggers,
  manualTrigger,
} from '../services/triggers.js';

const router = Router();

/**
 * POST /api/triggers/check/:pinCode
 * Check weather triggers for a specific pincode (for testing)
 */
router.post('/triggers/check/:pinCode', async (req, res) => {
  try {
    const { pinCode } = req.params;

    if (!pinCode) {
      return res.status(400).json({ error: 'pinCode is required' });
    }

    const result = await checkWeatherTriggers(pinCode);

    res.json(result);
  } catch (error) {
    console.error('Weather trigger check failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/triggers/process-all
 * Process weather triggers for all active users
 * (Call this via cron job or manually)
 */
router.post('/triggers/process-all', async (req, res) => {
  try {
    // Optional: Add secret token verification for security
    const token = req.headers['x-cron-token'];
    if (token !== process.env.CRON_SECRET) {
      return res.status(401).json({
        error: 'Unauthorized - Invalid cron token',
      });
    }

    const result = await processAllTriggers();

    res.json({
      message: 'Trigger processing complete',
      ...result,
    });
  } catch (error) {
    console.error('Trigger processing failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/triggers/manual
 * Manually trigger a claim for testing
 */
router.post('/triggers/manual', async (req, res) => {
  try {
    const { userId, triggerType } = req.body;

    if (!userId || !triggerType) {
      return res
        .status(400)
        .json({ error: 'userId and triggerType are required' });
    }

    const result = await manualTrigger(userId, triggerType);

    res.json({
      message: 'Manual trigger processed',
      ...result,
    });
  } catch (error) {
    console.error('Manual trigger failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/triggers/thresholds
 * Get all trigger thresholds
 */
router.get('/triggers/thresholds', (req, res) => {
  res.json({
    rain_mm: 35,
    heat_celsius: 42,
    aqi: 350,
    outage_minutes: 90,
  });
});

export default router;
