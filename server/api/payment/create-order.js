// server/api/payment/create-order.js
// Backend handler for creating Razorpay orders
// Integrate this with your Node.js/Express backend

import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function handleCreateOrder(req, res) {
  try {
    const { amount, policyId, tierId } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !amount) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Verify user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `${user.id}-${Date.now()}`,
      notes: {
        userId: user.id,
        policyId: policyId || 'N/A',
        tierId: tierId || 'N/A',
      },
    });

    // Store in database for tracking
    const { error: insertError } = await supabase.from('payments').insert({
      user_id: user.id,
      razorpay_order_id: order.id,
      amount,
      currency: 'INR',
      status: 'pending',
      policy_id: policyId || null,
      tier_id: tierId || null,
    });

    if (insertError) {
      console.error('Error storing payment:', insertError);
    }

    return res.status(200).json({
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create order' });
  }
}
