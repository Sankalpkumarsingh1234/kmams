/*
╔════════════════════════════════════════════════════════════════════════════╗
║           GigShield Backend - Complete Parametric Insurance Server           ║
║     Supabase + Twilio WhatsApp + Razorpay + Groq AI + Weather Triggers     ║
╚════════════════════════════════════════════════════════════════════════════╝
*/

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from parent directory (vite-project root) - MUST BE FIRST
const envPath = path.join(__dirname, '../.env.local');
const result = dotenv.config({ path: envPath });

console.log(`[✓] Environment loaded from: ${envPath}`);

// NOW import everything else after env is loaded
import express from 'express';
import cors from 'cors';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

// Import routes AFTER dotenv is configured
import usersRouter from './routes/users.js';
import policiesRouter from './routes/policies.js';
import claimsRouter from './routes/claims.js';
import chatRouter from './routes/chat.js';
import triggersRouter from './routes/triggers.js';
import notificationsRouter from './routes/notifications.js';

// ══════════════════════════════════════════════════════════════════════════
// ENVIRONMENT VALIDATION
// ══════════════════════════════════════════════════════════════════════════

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];

const missingRequired = requiredEnv.filter(key => !process.env[key]);
if (missingRequired.length > 0) {
  console.error('\n[FATAL] Missing REQUIRED environment variables');
}

// ══════════════════════════════════════════════════════════════════════════
// EXPRESS SETUP
// ══════════════════════════════════════════════════════════════════════════

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ══════════════════════════════════════════════════════════════════════════
// SERVICE INITIALIZATION
// ══════════════════════════════════════════════════════════════════════════

const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) 
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

// Add middleware to warn users of missing DB
app.use((req, res, next) => {
  if (!supabase && req.url !== '/health') {
    return res.status(500).json({ error: "Backend Database not configured." });
  }
  next();
});

// ══════════════════════════════════════════════════════════════════════════
// REGISTER ROUTES (FIXED PREFIXES)
// ══════════════════════════════════════════════════════════════════════════

app.use('/api', usersRouter);
app.use('/api', policiesRouter);
app.use('/api', claimsRouter);
app.use('/api', chatRouter);
app.use('/api', triggersRouter);
app.use('/api', notificationsRouter);

// ══════════════════════════════════════════════════════════════════════════
// TWILIO WHATSAPP HELPERS
// ══════════════════════════════════════════════════════════════════════════

async function sendWhatsAppNotification(phoneNumber, message) {
  try {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) throw new Error('Twilio not configured');

    const client = twilio(sid, token);
    const msg = await client.messages.create({
      from: process.env.TWILIO_PHONE,
      to: `whatsapp:${phoneNumber}`,
      body: message,
    });

    console.log(`📱 WhatsApp sent: ${msg.sid}`);
    return msg.sid;
  } catch (err) {
    console.error('WhatsApp send failed:', err.message);
    throw err;
  }
}

// Route: Send WhatsApp (POST /api/twilio/send-whatsapp)
app.post('/api/twilio/send-whatsapp', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Missing phoneNumber or message' });
    }
    const sid = await sendWhatsAppNotification(phoneNumber, message);
    res.json({ success: true, messageSid: sid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send WhatsApp', details: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// DEMO PAYOUT ENDPOINT (EXCLUDING RAZORPAY AS REQUESTED)
// ═══════════════════════════════════════════════════════════════════════════

app.post('/api/payout/create', async (req, res) => {
  try {
    const { amount, userPhone } = req.body;
    if (!amount || !userPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`💰 Demo Payout: ₹${amount} to ${userPhone}`);
    const payoutId = `POUT-${Date.now()}`;

    // Log to Supabase
    await supabase.from('payouts').insert({
      payout_id: payoutId,
      amount: amount,
      status: 'demo',
      user_phone: userPhone,
      created_at: new Date().toISOString(),
    });

    // Simulated WhatsApp
    await sendWhatsAppNotification(userPhone, `GigShield: Your payout of ₹${amount} has been initiated. ✓`);

    res.json({ success: true, payoutId, amount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create demo payout', details: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      twilio: process.env.TWILIO_ACCOUNT_SID ? '✓' : '✗',
      supabase: process.env.SUPABASE_URL ? '✓' : '✗',
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════════════

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 GigShield Backend Running on http://localhost:${PORT}`);
  });
}

export default app;
