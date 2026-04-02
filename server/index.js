// server/index.js
// Express.js server setup for GigShield backend
// Run with: node server/index.js
// Don't forget to install dependencies: npm install express dotenv cors
// Razorpay temporarily disabled - using Twilio WhatsApp instead

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleRegister } from './api/auth/register.js';
import { handleLogin } from './api/auth/login.js';
import { handleLogout } from './api/auth/logout.js';
// import { handleCreateOrder } from './api/payment/create-order.js';
// import { handleVerifyPayment } from './api/payment/verify.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ─── Auth Routes ────────────────────────────────────────────────────────────
app.post('/api/auth/register', handleRegister);
app.post('/api/auth/login', handleLogin);
app.post('/api/auth/logout', handleLogout);

// ─── Payment Routes ─────────────────────────────────────────────────────────
// app.post('/api/payment/create-order', handleCreateOrder);
// app.post('/api/payment/verify', handleVerifyPayment);

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GigShield server running at http://localhost:${PORT}`);
  console.log(`   Make sure your .env has:
    - VITE_SUPABASE_URL
    - VITE_SUPABASE_ANON_KEY
    - SUPABASE_SERVICE_ROLE_KEY
    - TWILIO_ACCOUNT_SID
    - TWILIO_AUTH_TOKEN
    - TWILIO_WHATSAPP_NUMBER
  `);
});
