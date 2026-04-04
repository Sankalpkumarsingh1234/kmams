/*
╔════════════════════════════════════════════════════════════════════════════╗
║           GigShield Backend - Complete Parametric Insurance Server           ║
║     Supabase + Twilio WhatsApp + Groq AI + OpenWeather + Fraud Detection   ║
╚════════════════════════════════════════════════════════════════════════════╝
*/

// ══════════════════════════════════════════════════════════════════════════
// STEP 1: Load env vars FIRST using a startup script (dotenv/config import)
// ESM hoists all imports, so we MUST use dotenv/config as an import
// ══════════════════════════════════════════════════════════════════════════
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from parent directory (vite-project root) - overrides dotenv/config
const envPath = path.join(__dirname, '../.env.local');
dotenv.config({ path: envPath, override: true });

console.log(`[ENV] Loaded from: ${envPath}`);
console.log(`[ENV] SUPABASE_URL: ${process.env.SUPABASE_URL ? '✓ set' : '✗ missing'}`);
console.log(`[ENV] OPENWEATHER_API_KEY: ${process.env.OPENWEATHER_API_KEY ? '✓ set' : '✗ missing'}`);
console.log(`[ENV] GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✓ set' : '✗ missing'}`);
console.log(`[ENV] TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? '✓ set' : '✗ missing'}`);

// ══════════════════════════════════════════════════════════════════════════
// STEP 2: Import everything after env is loaded
// ══════════════════════════════════════════════════════════════════════════
import express from 'express';
import cors from 'cors';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

// Import routes
import usersRouter from './routes/users.js';
import policiesRouter from './routes/policies.js';
import claimsRouter from './routes/claims.js';
import chatRouter from './routes/chat.js';
import triggersRouter from './routes/triggers.js';
import notificationsRouter from './routes/notifications.js';
import disruptionsRouter from './routes/disruptions.js';

// ══════════════════════════════════════════════════════════════════════════
// EXPRESS SETUP
// ══════════════════════════════════════════════════════════════════════════
const app = express();
const PORT = process.env.PORT || 3001;

// CORS - allow frontend dev server + Vercel production
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://*.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ══════════════════════════════════════════════════════════════════════════
// HEALTH CHECK (No DB required)
// ══════════════════════════════════════════════════════════════════════════
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      supabase: process.env.SUPABASE_URL ? '✓ configured' : '✗ missing',
      twilio: process.env.TWILIO_ACCOUNT_SID ? '✓ configured' : '✗ missing',
      openweather: process.env.OPENWEATHER_API_KEY ? '✓ configured' : '✗ missing',
      groq: process.env.GROQ_API_KEY ? '✓ configured' : '✗ missing',
      openai: process.env.OPENAI_API_KEY ? '✓ configured' : '✗ missing',
    },
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SUPABASE MIDDLEWARE - Only warn, don't block all routes
// Disruptions and Weather endpoints work even without DB
// ══════════════════════════════════════════════════════════════════════════
const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

// Routes that require Supabase
const DB_REQUIRED_ROUTES = ['/api/users', '/api/policies', '/api/claims'];

app.use((req, res, next) => {
  const needsDB = DB_REQUIRED_ROUTES.some(route => req.url.startsWith(route));
  if (!hasSupabase && needsDB) {
    return res.status(503).json({
      error: 'Database not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.local',
      hint: 'Weather/disruption APIs still work without DB'
    });
  }
  next();
});

// ══════════════════════════════════════════════════════════════════════════
// REGISTER ALL ROUTES
// ══════════════════════════════════════════════════════════════════════════
app.use('/api', disruptionsRouter);   // Live weather disruptions — works WITHOUT DB
app.use('/api', triggersRouter);      // Weather trigger checks — works WITHOUT DB
app.use('/api', chatRouter);          // AI chat — works WITHOUT DB
app.use('/api', notificationsRouter); // Twilio WhatsApp notifications
app.use('/api', usersRouter);         // User CRUD — requires Supabase
app.use('/api', policiesRouter);      // Policy CRUD — requires Supabase
app.use('/api', claimsRouter);        // Claims + Fraud AI — requires Supabase

// ══════════════════════════════════════════════════════════════════════════
// TWILIO WHATSAPP - Direct endpoint
// ══════════════════════════════════════════════════════════════════════════
app.post('/api/twilio/send-whatsapp', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Missing phoneNumber or message' });
    }

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE || 'whatsapp:+14155238886';

    if (!sid || !token) {
      return res.status(503).json({ error: 'Twilio not configured' });
    }

    const client = twilio(sid, token);
    const msg = await client.messages.create({
      from,
      to: `whatsapp:${phoneNumber}`,
      body: message,
    });

    console.log(`📱 WhatsApp sent: ${msg.sid}`);
    res.json({ success: true, messageSid: msg.sid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send WhatsApp', details: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// DEMO PAYOUT ENDPOINT
// ══════════════════════════════════════════════════════════════════════════
app.post('/api/payout/create', async (req, res) => {
  try {
    const { amount, userPhone, claimId } = req.body;
    if (!amount) {
      return res.status(400).json({ error: 'Missing fields: amount required' });
    }

    console.log(`💰 Demo Payout: ₹${amount} → ${userPhone}`);
    const payoutId = `POUT-${Date.now()}`;

    // Store in Supabase if available
    if (hasSupabase) {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
      await supabase.from('payouts').insert({
        payout_id: payoutId,
        amount,
        status: 'demo',
        user_phone: userPhone || null,
        claim_id: claimId || null,
        created_at: new Date().toISOString(),
      }).catch(e => console.warn('[payout] Supabase insert failed:', e.message));
    }

    res.json({ success: true, payoutId, amount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create demo payout', details: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// 404 HANDLER
// ══════════════════════════════════════════════════════════════════════════
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// ══════════════════════════════════════════════════════════════════════════
// START SERVER
// ══════════════════════════════════════════════════════════════════════════
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║         🚀 GigShield Backend Running                            ║
║                                                                  ║
║         📍 Local:    http://localhost:${PORT}                       ║
║         📡 Health:   http://localhost:${PORT}/health               ║
║         🌦️  Weather:  http://localhost:${PORT}/api/disruptions/600001
║                                                                  ║
║         Supabase:    ${process.env.SUPABASE_URL ? '[✓]' : '[✗ MISSING]'}
║         Twilio:      ${process.env.TWILIO_ACCOUNT_SID ? '[✓]' : '[✗ MISSING]'}
║         OpenWeather: ${process.env.OPENWEATHER_API_KEY ? '[✓]' : '[✗ MISSING]'}
║         Groq AI:     ${process.env.GROQ_API_KEY ? '[✓]' : '[✗ MISSING]'}
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
    `);
  });
}

export default app;
