/**
 * Backend API Routes (Express.js example)
 * Place these in your backend server (Node/Express)
 * 
 * SETUP:
 * 1. Create a new folder: backend/
 * 2. npm init -y && npm install express razorpay twilio supabase
 * 3. Create routes/payout.js with content below
 * 4. Create routes/twilio.js with Twilio content
 * 5. Create .env with RAZORPAY_KEY_SECRET and TWILIO_AUTH_TOKEN
 * 6. Update VITE_API_URL in frontend .env to http://localhost:3000
 */

// ========== BACKEND ROUTES EXAMPLE ==========
// File: backend/routes/payout.js

import Razorpay from 'razorpay';
import { supabase } from '../lib/supabase.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function createPayoutRoute(req, res) {
  try {
    const { amount, claimId, riderPhoneNumber, riderUPI } = req.body;

    // Create payout in Razorpay
    const payout = await razorpay.payouts.create({
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      mode: 'UPI', // or 'NEFT', 'IMPS'
      purpose: 'insurancepayout',
      description: `GigShield Payout - Claim ${claimId}`,
      receipt: `GS-${claimId}`,
      reference_id: claimId,
      upi: riderUPI, // Format: mobile@bank (e.g., 9876543210@okhdfcbank)
    });

    // Store in Supabase
    const { data, error } = await supabase
      .from('payouts')
      .insert({
        claim_id: claimId,
        payout_id: payout.id,
        amount,
        status: 'processing',
        upi: riderUPI,
        created_at: new Date(),
      });

    if (error) throw error;

    res.json({
      success: true,
      payoutId: payout.id,
      status: payout.status,
      amount,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      code: error.code,
    });
  }
}

export async function getPayoutStatusRoute(req, res) {
  try {
    const { payoutId } = req.params;

    const payout = await razorpay.payouts.fetch(payoutId);

    // Update in Supabase
    await supabase
      .from('payouts')
      .update({ status: payout.status })
      .eq('payout_id', payoutId);

    res.json({
      payoutId,
      status: payout.status,
      amount: payout.amount / 100,
      failureReason: payout.failure_reason,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function verifyPayoutWebhookRoute(req, res) {
  try {
    const { id, event, payload } = req.body;
    
    // Verify signature on backend only
    const signature = req.headers['x-razorpay-signature'];
    // Verification happens here - check Razorpay docs
    
    if (event === 'payout.processed' || event === 'payout.reversed') {
      const payout = payload.payout.entity;
      
      // Update Supabase
      await supabase
        .from('payouts')
        .update({ 
          status: payout.status,
          utr: payout.utr, // Updated Transaction Reference
        })
        .eq('payout_id', payout.id);
      
      // Send WhatsApp notification
      // Trigger Twilio notification here
    }

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// ========== TWILIO WHATSAPP ROUTE ==========
// File: backend/routes/twilio.js

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function sendWhatsAppRoute(req, res) {
  try {
    const { to, message, type } = req.body;

    const msg = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM, // whatsapp:+14155238886
      to: to, // whatsapp:+919876543210
      body: message,
    });

    // Store in Supabase
    await supabase
      .from('notifications')
      .insert({
        type,
        phone: to,
        message,
        twilio_sid: msg.sid,
        status: msg.status,
        created_at: new Date(),
      });

    res.json({
      success: true,
      messageSid: msg.sid,
      status: msg.status,
    });
  } catch (error) {
    console.error('Twilio error:', error);
    res.status(400).json({ error: error.message });
  }
}

// ========== INITIALIZE ROUTES IN EXPRESS APP ==========
/*
// File: backend/server.js

import express from 'express';
import { createPayoutRoute, getPayoutStatusRoute, verifyPayoutWebhookRoute } from './routes/payout.js';
import { sendWhatsAppRoute } from './routes/twilio.js';

const app = express();
app.use(express.json());

// Payout routes
app.post('/api/payout/create', createPayoutRoute);
app.get('/api/payout/:payoutId', getPayoutStatusRoute);
app.post('/api/payout/webhook', verifyPayoutWebhookRoute);

// Twilio routes
app.post('/api/twilio/send-whatsapp', sendWhatsAppRoute);

app.listen(3000, () => console.log('Backend running on :3000'));
*/