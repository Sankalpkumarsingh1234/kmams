// server/api/webhooks/razorpay-payout.js
// Razorpay payout webhook handler
// Triggered when a payout completes or fails

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendPayoutNotification, sendClaimNotification } from '../../services/twilio-whatsapp.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(body, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
  
  return expectedSignature === signature;
}

/**
 * Handle Razorpay payout webhook
 * Webhook events: payout.initiated, payout.processed, payout.failed, payout.rejected
 */
export async function handlePayoutWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    // Verify webhook signature
    const isValid = verifyWebhookSignature(
      body,
      signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { event, payload } = body;

    if (event === 'payout.processed') {
      await handlePayoutProcessed(payload.payout);
    } else if (event === 'payout.failed') {
      await handlePayoutFailed(payload.payout);
    } else if (event === 'payout.rejected') {
      await handlePayoutRejected(payload.payout);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Process successful payout
 */
async function handlePayoutProcessed(payoutData) {
  try {
    const { id, amount, receipt, notes, initiated_at } = payoutData;

    // Find the claim/payment that triggered this payout
    const claimId = notes?.claim_id;
    const userId = notes?.user_id;

    if (!userId) {
      console.warn('No user_id in payout webhook');
      return;
    }

    // Get user's phone for WhatsApp
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', userId)
      .single();

    // Update claims table status
    if (claimId) {
      await supabase
        .from('claims')
        .update({
          status: 'paid',
          payout_id: id,
          paid_at: new Date().toISOString(),
        })
        .eq('id', claimId);
    }

    // Log payout in database
    await supabase.from('payouts').insert({
      user_id: userId,
      razorpay_payout_id: id,
      amount: amount / 100, // Convert from paise
      status: 'processed',
      claim_id: claimId,
      created_at: new Date().toISOString(),
    });

    // Send WhatsApp notification
    if (profile?.phone) {
      await sendPayoutNotification(profile.phone, {
        amount: (amount / 100).toFixed(2),
        reference: id,
        timestamp: initiated_at,
      });
    }

    console.log(`✅ Payout processed: ${id} for user ${userId}`);
  } catch (err) {
    console.error('Error handling payout.processed:', err);
  }
}

/**
 * Process failed payout
 */
async function handlePayoutFailed(payoutData) {
  try {
    const { id, amount, notes } = payoutData;
    const claimId = notes?.claim_id;
    const userId = notes?.user_id;

    if (!userId) return;

    // Update claims table
    if (claimId) {
      await supabase
        .from('claims')
        .update({ status: 'payout_failed' })
        .eq('id', claimId);
    }

    // Log failed payout
    await supabase.from('payouts').insert({
      user_id: userId,
      razorpay_payout_id: id,
      amount: amount / 100,
      status: 'failed',
      claim_id: claimId,
      created_at: new Date().toISOString(),
    });

    console.log(`❌ Payout failed: ${id}`);
  } catch (err) {
    console.error('Error handling payout.failed:', err);
  }
}

/**
 * Process rejected payout
 */
async function handlePayoutRejected(payoutData) {
  try {
    const { id, amount, notes } = payoutData;
    const claimId = notes?.claim_id;
    const userId = notes?.user_id;

    if (!userId) return;

    // Update claims table
    if (claimId) {
      await supabase
        .from('claims')
        .update({ status: 'payout_rejected' })
        .eq('id', claimId);
    }

    console.log(`⛔ Payout rejected: ${id}`);
  } catch (err) {
    console.error('Error handling payout.rejected:', err);
  }
}
