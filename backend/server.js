/*
╔════════════════════════════════════════════════════════════════════════════╗
║              GigShield Backend - Express.js Server                          ║
║         Razorpay Payouts + Twilio WhatsApp + Supabase Integration          ║
╚════════════════════════════════════════════════════════════════════════════╝

SETUP:
  1. npm init -y
  2. npm install express cors dotenv razorpay twilio supabase-js axios
  3. Create .env with credentials (see .env.example in root)
  4. node server.js (runs on localhost:3000)
*/

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const Razorpay = require('razorpay'); // RAZORPAY DISABLED - Using Twilio WhatsApp instead
const twilio = require('twilio');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

dotenv.config({ path: '../.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

import disruptionsRoute from './routes/disruptions.js';
app.use('/api', disruptionsRoute);

// ── Initialize Services ────────────────────────────────────────────────────
// const razorpay = new Razorpay({
//   key_id: process.env.VITE_RAZORPAY_KEY_ID,
//   key_secret: process.env.VITE_RAZORPAY_KEY_SECRET,
// });

const twilioClient = twilio(
  process.env.VITE_TWILIO_ACCOUNT_SID,
  process.env.VITE_TWILIO_AUTH_TOKEN
);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// ── Error Handler ──────────────────────────────────────────────────────────
const handleError = (res, status, message, error = null) => {
  console.error(`[ERROR] ${message}`, error);
  res.status(status).json({ error: message, details: error?.message || '' });
};

// ── Route: Create Payout (POST /api/payout/create) ────────────────────────
// RAZORPAY TEMPORARILY DISABLED - Using Twilio WhatsApp instead
/*
app.post('/api/payout/create', async (req, res) => {
  try {
    const { amount, recipientType, claimId, userPhone, userName } = req.body;

    if (!amount || amount < 100) {
      return handleError(res, 400, 'Amount must be at least ₹100');
    }

    console.log(`📤 Creating payout: ₹${amount} (${recipientType})`);

    // Create Razorpay contact (recipient)
    const contactResponse = await razorpay.contacts.create({
      type: 'customer',
      name: userName || 'GigShield User',
      email: `user-${Date.now()}@gigshield.app`,
      contact_email: `user-${Date.now()}@gigshield.app`,
      notes: { claimId: claimId || 'demo' },
    });

    const contactId = contactResponse.id;
    console.log(`✓ Contact created: ${contactId}`);

    // Create fund account (bank/UPI)
    let fundResponse;
    if (recipientType === 'UPI') {
      fundResponse = await razorpay.fundAccounts.create({
        contact_id: contactId,
        account_type: 'upi',
        upi: {
          address: userPhone || 'dummy@okhdfcbank', // Test UPI
        },
      });
    } else {
      fundResponse = await razorpay.fundAccounts.create({
        contact_id: contactId,
        account_type: 'bank_account',
        bank_account: {
          ifsc: 'HDFC0000123',
          bank_name: 'HDFC Bank',
          name: userName || 'Rider',
          notes: { test: true },
          account_number: '1121220061746170', // Test account
        },
      });
    }

    const fundAccountId = fundResponse.id;
    console.log(`✓ Fund account created: ${fundAccountId}`);

    // Create actual payout
    const payoutResponse = await razorpay.payouts.create({
      account_number: '2121220061746170', // Test Razorpay account
      fund_account_id: fundAccountId,
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      mode: recipientType === 'UPI' ? 'NEFT' : 'NEFT',
      purpose: 'payout',
      description: `GigShield Payout - Claim ${claimId || 'demo'}`,
      notes: {
        claimId: claimId || 'demo',
        userId: `user-${Date.now()}`,
        trigger: 'weather_parametric',
      },
    });

    const payoutId = payoutResponse.id;
    console.log(`✓ Payout created: ${payoutId}`);

    // Store in Supabase
    await supabase.from('payouts').insert({
      payout_id: payoutId,
      amount: amount,
      status: payoutResponse.status,
      recipient_type: recipientType,
      claim_id: claimId || null,
      user_phone: userPhone || null,
      razorpay_contact_id: contactId,
      razorpay_fund_account_id: fundAccountId,
      created_at: new Date(),
    });

    res.json({
      success: true,
      payoutId: payoutId,
      status: payoutResponse.status,
      amount: amount,
    });
  } catch (err) {
    handleError(res, 500, 'Failed to create payout', err);
  }
});
*/

// ── Route: Get Payout Status (GET /api/payout/:payoutId) ──────────────────
/*
app.get('/api/payout/:payoutId', async (req, res) => {
  try {
    const { payoutId } = req.params;

    const payoutResponse = await razorpay.payouts.fetch(payoutId);

    // Update Supabase
    await supabase
      .from('payouts')
      .update({ status: payoutResponse.status })
      .eq('payout_id', payoutId);

    res.json({
      payoutId: payoutResponse.id,
      status: payoutResponse.status, // 'initiated', 'processing', 'processed', 'reversed', 'failed'
      amount: Math.round(payoutResponse.amount / 100),
      createdAt: payoutResponse.created_at,
    });
  } catch (err) {
    handleError(res, 500, 'Failed to fetch payout', err);
  }
});
*/

// ── Route: Webhook Handler (POST /api/payout/webhook) ─────────────────────
/*
app.post('/api/payout/webhook', async (req, res) => {
  try {
    // Verify webhook signature
    const hmac = crypto.createHmac('sha256', process.env.VITE_RAZORPAY_KEY_SECRET);
    hmac.update(JSON.stringify(req.body));
    const generatedSignature = hmac.digest('hex');

    // Note: Actual webhook includes X-Razorpay-Signature header
    // For now, skip signature verification in test mode

    const { event, payload } = req.body;
    const payout = payload.payout;

    console.log(`🔔 Webhook: ${event} - ${payout.id} (${payout.status})`);

    // Handle payout events
    if (event === 'payout.processed') {
      console.log(`✓ Payout ${payout.id} successful!`);

      // Update Supabase
      await supabase
        .from('payouts')
        .update({ status: 'processed', processed_at: new Date() })
        .eq('payout_id', payout.id);

      // Get payout details to send SMS
      const { data: payoutData } = await supabase
        .from('payouts')
        .select('user_phone, amount')
        .eq('payout_id', payout.id)
        .single();

      // Send WhatsApp notification
      if (payoutData?.user_phone) {
        await sendWhatsAppNotification(
          payoutData.user_phone,
          `Your GigShield payout of ₹${payoutData.amount} has been processed! ✓`
        );
      }
    } else if (event === 'payout.reversed') {
      console.log(`⚠️ Payout ${payout.id} reversed`);
      await supabase
        .from('payouts')
        .update({ status: 'reversed' })
        .eq('payout_id', payout.id);
    } else if (event === 'payout.failed') {
      console.log(`❌ Payout ${payout.id} failed`);
      await supabase
        .from('payouts')
        .update({ status: 'failed' })
        .eq('payout_id', payout.id);
    }

    res.json({ success: true });
  } catch (err) {
    handleError(res, 500, 'Webhook processing failed', err);
  }
});
*/

// ── Route: Send WhatsApp Message (POST /api/twilio/send-whatsapp) ─────────
async function sendWhatsAppNotification(phoneNumber, message) {
  try {
    const msg = await twilioClient.messages.create({
      from: process.env.VITE_TWILIO_PHONE, // e.g., whatsapp:+14155238886
      to: `whatsapp:${phoneNumber}`,
      body: message,
    });

    console.log(`📱 WhatsApp sent: ${msg.sid}`);

    // Log to Supabase
    await supabase.from('notifications').insert({
      type: 'whatsapp',
      phone: phoneNumber,
      message: message,
      twilio_sid: msg.sid,
      status: 'sent',
      created_at: new Date(),
    });

    return msg.sid;
  } catch (err) {
    console.error('WhatsApp send failed:', err);
    // Still log failure
    await supabase.from('notifications').insert({
      type: 'whatsapp',
      phone: phoneNumber,
      message: message,
      status: 'failed',
      error: err.message,
      created_at: new Date(),
    });
    throw err;
  }
}

app.post('/api/twilio/send-whatsapp', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return handleError(res, 400, 'Missing phoneNumber or message');
    }

    const sid = await sendWhatsAppNotification(phoneNumber, message);

    res.json({ success: true, messageSid: sid });
  } catch (err) {
    handleError(res, 500, 'Failed to send WhatsApp', err);
  }
});

// ── Route: Health Check (GET /health) ──────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    twilio: !!process.env.VITE_TWILIO_ACCOUNT_SID ? 'configured' : 'missing',
    supabase: !!process.env.VITE_SUPABASE_URL ? 'configured' : 'missing',
  });
});

// ── Start Server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║         🚀 GigShield Backend Server Running                     ║
║                                                                  ║
║         📍 Local:  http://localhost:${PORT}                         ║
║         📡 Health: http://localhost:${PORT}/health               ║
║                                                                  ║
║         ✓ Razorpay: ${process.env.VITE_RAZORPAY_KEY_ID ? '[✓ Ready]' : '[✗ Missing]'}
║         ✓ Twilio:   ${process.env.VITE_TWILIO_ACCOUNT_SID ? '[✓ Ready]' : '[✗ Missing]'}
║         ✓ Supabase: ${process.env.VITE_SUPABASE_URL ? '[✓ Ready]' : '[✗ Missing]'}
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
