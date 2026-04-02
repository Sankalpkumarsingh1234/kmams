// server/api/payout/create.js
// Create payout request via Razorpay
// Handles UPI and bank account transfers

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

export async function handleCreatePayout(req, res) {
  try {
    const { amount, claimId, recipientType = 'UPI' } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !amount) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user profile with bank details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(400).json({ error: 'Profile not found' });
    }

    // Create payout request in Razorpay
    const payoutResponse = await razorpay.payouts.create({
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      mode: recipientType === 'UPI' ? 'UPI' : 'NEFT',
      purpose: 'payout',
      recipient: {
        id_type: recipientType === 'UPI' ? 'phone' : 'vpa',
        id_value: profile.upi_id || profile.phone,
      },
      queue_if_low_balance: true,
      notes: {
        user_id: user.id,
        claim_id: claimId,
        platform: profile.platform,
      },
    });

    // Store payout record in database
    const { error: insertError } = await supabase.from('payouts').insert({
      user_id: user.id,
      razorpay_payout_id: payoutResponse.id,
      amount,
      status: 'initiated',
      claim_id: claimId,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Error storing payout:', insertError);
    }

    // Update claim status
    if (claimId) {
      await supabase
        .from('claims')
        .update({ status: 'payout_initiated' })
        .eq('id', claimId);
    }

    return res.status(200).json({
      payoutId: payoutResponse.id,
      amount,
      status: payoutResponse.status,
      message: 'Payout initiated successfully',
    });
  } catch (err) {
    console.error('Payout creation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create payout' });
  }
}
