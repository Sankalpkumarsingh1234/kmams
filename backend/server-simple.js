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
if (result.error) {
  console.warn(`[⚠] Warning: ${result.error.message}`);
} else {
  console.log(`[✓] Variables loaded: ${Object.keys(result.parsed || {}).length} keys`);
}

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
// import paymentsRouter from './routes/payments.js'; // DISABLED - Razorpay integration coming soon
import triggersRouter from './routes/triggers.js';
import notificationsRouter from './routes/notifications.js';

// ══════════════════════════════════════════════════════════════════════════
// ENVIRONMENT VALIDATION
// ══════════════════════════════════════════════════════════════════════════

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const optionalEnv = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'GROQ_API_KEY', 'OPENWEATHER_API_KEY'];

const missingRequired = requiredEnv.filter(key => !process.env[key]);
if (missingRequired.length > 0) {
  console.error('\n[FATAL] Missing REQUIRED environment variables:');
  missingRequired.forEach(key => console.error(`  - ${key}`));
  console.error('\nPlease set these variables in Vercel or .env.local');
  // Skip process.exit(1) so Vercel Serverless doesn't permanently crash routing 500s without CORS headers
}

console.log('[✓] All required environment variables loaded');

const missingOptional = optionalEnv.filter(key => !process.env[key]);
if (missingOptional.length > 0) {
  console.log('[⚠] Missing optional environment variables:');
  missingOptional.forEach(key => console.log(`  - ${key} (feature disabled)`));
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

const twilioClient = process.env.TWILIO_ACCOUNT_SID ? twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
) : null;

const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) 
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

// Add middleware to warn users of missing DB
app.use((req, res, next) => {
  if (!supabase && req.url !== '/health') {
    return res.status(500).json({ error: "Backend Database not configured. Please add SUPABASE_URL to Vercel Environment Variables." });
  }
  next();
});

// ══════════════════════════════════════════════════════════════════════════
// REGISTER ROUTES
// ══════════════════════════════════════════════════════════════════════════

app.use('/', usersRouter);
app.use('/', policiesRouter);
app.use('/', claimsRouter);
app.use('/', chatRouter);
// app.use('/', paymentsRouter); // DISABLED - Razorpay integration coming soon
app.use('/', triggersRouter);
app.use('/', notificationsRouter);

// ── Validation Middleware ──────────────────────────────────────────────────
const validatePhone = (phone) => {
  return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/[\s()-]/g, ''));
};

const validateMessage = (msg) => {
  return msg && typeof msg === 'string' && msg.length > 0 && msg.length <= 4096;
};

const validateAmount = (amount) => {
  return Number.isFinite(amount) && amount > 0 && amount < 1000000;
};

// ── Error Handler ──────────────────────────────────────────────────────────
const handleError = (res, status, message, error = null) => {
  console.error(`[ERROR] ${message}`, error?.message || '');
  res.status(status).json({ error: message, details: error?.message || '' });
};

// ═══════════════════════════════════════════════════════════════════════════
// TWILIO WHATSAPP INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

async function sendWhatsAppNotification(phoneNumber, message) {
  try {
    // Validate inputs
    if (!validatePhone(phoneNumber)) {
      throw new Error('Invalid phone number format');
    }
    if (!validateMessage(message)) {
      throw new Error('Invalid message: must be 1-4096 characters');
    }

    const msg = await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE,
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
    console.error('WhatsApp send failed:', err.message);
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

/**
 * Send WhatsApp template-based notification (using Twilio Content Templates)
 * @param {string} phoneNumber - User's phone with country code (e.g., +919369889575)
 * @param {string} contentSid - Twilio content template SID
 * @param {object} contentVariables - Variables to substitute in template
 */
async function sendWhatsAppTemplate(phoneNumber, contentSid, contentVariables) {
  try {
    const message = await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE,
      contentSid: contentSid,
      contentVariables: JSON.stringify(contentVariables),
      to: `whatsapp:${phoneNumber}`
    });

    console.log(`✅ WhatsApp template sent to ${phoneNumber}: ${message.sid}`);

    // Log to Supabase
    await supabase.from('notifications').insert({
      type: 'whatsapp_template',
      phone: phoneNumber,
      twilio_sid: message.sid,
      status: 'sent',
      template_sid: contentSid,
      created_at: new Date().toISOString(),
    });

    return message.sid;
  } catch (err) {
    console.error(`❌ WhatsApp template error for ${phoneNumber}:`, err.message);
    await supabase.from('notifications').insert({
      type: 'whatsapp_template',
      phone: phoneNumber,
      status: 'failed',
      error: err.message,
      template_sid: contentSid,
      created_at: new Date().toISOString(),
    });
    throw err;
  }
}

// Route: Send WhatsApp (POST /api/twilio/send-whatsapp)
app.post('/api/twilio/send-whatsapp', async (req, res) => {
  try {
    const { phoneNumber, message, userId } = req.body;

    // Validate inputs
    if (!phoneNumber || !message) {
      return handleError(res, 400, 'Missing required fields: phoneNumber, message');
    }

    if (!validatePhone(phoneNumber)) {
      return handleError(res, 400, 'Invalid phone number format. Expected E.164 format (e.g., +919876543210)');
    }

    if (!validateMessage(message)) {
      return handleError(res, 400, 'Invalid message: must be 1-4096 characters');
    }

    console.log(`📤 Sending WhatsApp to ${phoneNumber}: "${message}"`);

    const sid = await sendWhatsAppNotification(phoneNumber, message);

    res.json({ success: true, messageSid: sid });
  } catch (err) {
    handleError(res, 500, 'Failed to send WhatsApp', err);
  }
});

// Route: Send WhatsApp Template (POST /api/twilio/send-whatsapp-template)
app.post('/api/twilio/send-whatsapp-template', async (req, res) => {
  try {
    const { phoneNumber, contentSid, contentVariables } = req.body;

    if (!phoneNumber || !contentSid || !contentVariables) {
      return handleError(res, 400, 'Missing phoneNumber, contentSid, or contentVariables');
    }

    console.log(`📤 Sending WhatsApp template to ${phoneNumber}`);

    const sid = await sendWhatsAppTemplate(phoneNumber, contentSid, contentVariables);

    res.json({ success: true, messageSid: sid });
  } catch (err) {
    handleError(res, 500, 'Failed to send WhatsApp template', err);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SUPABASE DATA LOGGING
// ═══════════════════════════════════════════════════════════════════════════

// Route: Log claim (POST /api/claims/create)
app.post('/api/claims/create', async (req, res) => {
  try {
    const { claimId, userId, payout, trigger } = req.body;

    console.log(`📋 Creating claim: ${claimId}`);

    const { data, error } = await supabase.from('claims').insert({
      claim_id: claimId,
      user_id: userId,
      payout_amount: payout,
      trigger_type: trigger,
      status: 'pending',
      created_at: new Date(),
    });

    if (error) throw error;

    res.json({ success: true, claimId: claimId });
  } catch (err) {
    handleError(res, 500, 'Failed to create claim', err);
  }
});

// Route: Log policy signup (POST /api/policies/create)
app.post('/api/policies/create', async (req, res) => {
  try {
    const { userId, userName, platform, tier, nfi } = req.body;

    console.log(`🛡️ Creating policy for ${userName}`);

    const policyId = `POL-${Date.now()}`;

    const { data, error } = await supabase.from('policies').insert({
      policy_id: policyId,
      user_id: userId,
      user_name: userName,
      platform: platform,
      tier: tier,
      nfi_score: nfi,
      status: 'active',
      created_at: new Date(),
    });

    if (error) throw error;

    res.json({ success: true, policyId: policyId });
  } catch (err) {
    handleError(res, 500, 'Failed to create policy', err);
  }
});

// Route: Get notifications (GET /api/notifications?phone=919876543210)
app.get('/api/notifications', async (req, res) => {
  try {
    const { phone } = req.query;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({ notifications: data });
  } catch (err) {
    handleError(res, 500, 'Failed to fetch notifications', err);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// RAZORPAY PAYOUT (OPTIONAL - Can add later)
// ═══════════════════════════════════════════════════════════════════════════

// For now, this is a demo endpoint that simulates a payout
app.post('/api/payout/create', async (req, res) => {
  try {
    const { amount, userName, userPhone, claimId } = req.body;

    // Validate inputs
    if (!amount || !userPhone) {
      return handleError(res, 400, 'Missing required fields: amount, userPhone');
    }

    if (!validateAmount(amount)) {
      return handleError(res, 400, 'Invalid amount: must be between 1 and 999999');
    }

    if (!validatePhone(userPhone)) {
      return handleError(res, 400, 'Invalid phone number format');
    }

    console.log(`💰 Payout request: ₹${amount} to ${userPhone}`);

    // Create demo payout ID
    const payoutId = `POUT-${Date.now()}`;

    // Log to Supabase
    await supabase.from('payouts').insert({
      payout_id: payoutId,
      amount: amount,
      status: 'demo',
      user_phone: userPhone,
      claim_id: claimId,
      created_at: new Date().toISOString(),
    });

    // Send WhatsApp notification
    if (userPhone) {
      await sendWhatsAppNotification(
        userPhone,
        `GigShield: Your payout of ₹${amount} has been initiated. ✓`
      );
    }

    res.json({
      success: true,
      payoutId: payoutId,
      amount: amount,
      message: 'Demo payout (Razorpay integration coming)',
    });
  } catch (err) {
    handleError(res, 500, 'Failed to create payout', err);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH CHECK & STATUS
// ═══════════════════════════════════════════════════════════════════════════

app.get('/health', (req, res) => {
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      twilio: process.env.TWILIO_ACCOUNT_SID ? '✓ Ready' : '✗ Missing',
      supabase: process.env.SUPABASE_URL ? '✓ Ready' : '✗ Missing',
      razorpay: process.env.RAZORPAY_KEY_ID ? '✓ Ready' : '⏸ Skipped (Optional)',
    },
  };
  res.json(status);
});

// ═══════════════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════════════

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║         🚀 GigShield Backend - SIMPLIFIED                       ║
║                                                                  ║
║         📍 Local:  http://localhost:${PORT}                         ║
║         📡 Health: http://localhost:${PORT}/health               ║
║                                                                  ║
║         Services:                                               ║
║         ${process.env.TWILIO_ACCOUNT_SID ? '✓' : '✗'} Twilio WhatsApp:   Ready                  ║
║         ${process.env.SUPABASE_URL ? '✓' : '✗'} Supabase Database: Ready                  ║
║         ⏸ Razorpay Payouts:  Optional (add later)           ║
║                                                                  ║
║         Available Endpoints:                                    ║
║         POST /api/twilio/send-whatsapp                          ║
║         POST /api/claims/create                                 ║
║         POST /api/policies/create                               ║
║         POST /api/payout/create (demo)                          ║
║         GET  /api/notifications                                 ║
║         GET  /health                                            ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
    `);
  });
}

export default app;
