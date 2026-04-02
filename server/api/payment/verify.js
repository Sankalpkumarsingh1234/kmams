// server/api/payment/verify.js
// Backend handler for verifying Razorpay payments
// Integrate this with your Node.js/Express backend

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function handleVerifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Verify user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Update payment status in database
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'success',
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return res.status(500).json({ error: 'Failed to update payment' });
    }

    return res.status(200).json({
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    return res.status(500).json({ error: err.message || 'Verification failed' });
  }
}
