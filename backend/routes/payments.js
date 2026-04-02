import { Router } from 'express';

const router = Router();

/**
 * RAZORPAY PAYMENT INTEGRATION - DISABLED TEMPORARILY
 * Will be enabled after KYC and business verification
 * 
 * All payment endpoints return 503 (Service Unavailable)
 */

/**
 * POST /api/payment/create-order
 * DISABLED - Coming soon
 */
router.post('/api/payment/create-order', async (req, res) => {
  return res.status(503).json({
    error: 'Payment service temporarily disabled',
    message: 'Razorpay integration will be enabled after KYC verification',
    status: 'disabled',
    nextStep: 'Submit KYC verification for business account',
  });
});

/**
 * POST /api/payment/verify
 * DISABLED - Coming soon
 */
router.post('/api/payment/verify', async (req, res) => {
  return res.status(503).json({
    error: 'Payment service temporarily disabled',
    message: 'Razorpay integration will be enabled after KYC verification',
    status: 'disabled',
  });
});

/**
 * GET /api/payment/status/:orderId
 * DISABLED - Coming soon
 */
router.get('/api/payment/status/:orderId', async (req, res) => {
  return res.status(503).json({
    error: 'Payment service temporarily disabled',
    message: 'Razorpay integration will be enabled after KYC verification',
    status: 'disabled',
  });
});

/**
 * POST /api/payment/webhook
 * DISABLED - Coming soon
 */
router.post('/api/payment/webhook', (req, res) => {
  return res.status(503).json({
    error: 'Webhook service disabled',
    message: 'Razorpay webhooks will be available after KYC verification',
  });
});

export default router;
