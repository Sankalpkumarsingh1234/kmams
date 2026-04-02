# GigShield Setup Guide

## ✅ All Fixes Applied

Your backend and frontend have been fixed. Now you need to set up credentials to run them.

---

## 🔑 Required Environment Variables

### Backend (Non-VITE variables)
These go in `.env.local` without the `VITE_` prefix.

#### 1. **Twilio WhatsApp** (Required for notifications)
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE=whatsapp:+14155238886
```

**How to get:**
1. Go to https://console.twilio.com
2. Click account SID (starts with `AC`)
3. Copy both SID and Auth Token
4. For phone: Use sandbox number or verify your own

#### 2. **Supabase** (Required for database)
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get:**
1. Create account at https://supabase.com
2. Create new project
3. Go to Settings → API
4. Copy Project URL and Anon Key

### Frontend (VITE_ variables)
These also go in `.env.local` with the `VITE_` prefix.

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:3001
VITE_OAUTH_REDIRECT_URL=http://localhost:5173/auth/callback
```

---

## 🚀 Quick Start

### Step 1: Update `.env.local` with real credentials
```bash
# Edit this file and add your real API keys:
c:\Users\renu_\g\vite-project\.env.local
```

### Step 2: Install dependencies (if not done)
```bash
# Terminal 1: Backend dependencies
cd backend
npm install

# Terminal 2: Frontend dependencies  
cd ..
npm install
```

### Step 3: Start Backend
```bash
cd backend
npm start
# Should show: 🚀 GigShield Backend - SIMPLIFIED
# 📍 Local: http://localhost:3001
```

### Step 4: Start Frontend (new terminal)
```bash
npm run dev
# Should show: VITE v5.x.x ready in 123ms
# ➜  Local:   http://localhost:5173
```

### Step 5: Test
```bash
# Open in browser:
http://localhost:5173
```

---

## ✅ What to Expect

#### Backend Starting
```
🚀 GigShield Backend - SIMPLIFIED

📍 Local:  http://localhost:3001
📡 Health: http://localhost:3001/health

Services:
✓ Twilio WhatsApp:   Ready
✓ Supabase Database: Ready
⏸ Razorpay Payouts:  Optional (add later)

Available Endpoints:
POST /api/twilio/send-whatsapp
POST /api/claims/create
POST /api/policies/create
POST /api/payout/create (demo)
GET  /api/notifications
GET  /health
```

#### Frontend Starting
```
  VITE v5.x.x  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## 🐛 Common Errors & Fixes

### Error: "accountSid must start with AC"
**Cause:** Invalid Twilio credentials  
**Fix:** Get real SID from https://console.twilio.com (must start with `AC`)

### Error: "Missing required environment variables"
**Cause:** `.env.local` not found or incomplete  
**Fix:** Create `.env.local` in project root with all required variables

### Error: "ECONNREFUSED on port 3001"
**Cause:** Backend not running  
**Fix:** Start backend first: `cd backend && npm start`

### Error: "Cannot GET /api/*"
**Cause:** Backend not accessible from frontend  
**Fix:** 
1. Verify backend is running on 3001
2. Check `VITE_API_URL=http://localhost:3001` in `.env.local`

---

## 📋 Authentication Setup (Later)

When ready, add OAuth/JWT:

1. **Google OAuth:**
   - https://console.cloud.google.com
   - Create OAuth credentials
   - Add redirect URL: http://localhost:5173/auth/callback

2. **Razorpay Payouts:**
   - https://razorpay.com/signup
   - Submit KYC (takes 2-5 days)
   - Get API keys from dashboard

---

## 🧪 Optional: Test Without Real Credentials

If you don't have credentials yet, here's test flow:

```bash
# Backend will still start but will error when:
# - Trying to send WhatsApp (needs real Twilio)
# - Trying to log to database (needs real Supabase)

# But these will work:
# GET /health - Shows service status
# POST /api/claims/create - Validates input (fails at DB)
```

---

## 📱 Test Endpoints

Once backend is running:

```bash
# Test health
curl http://localhost:3001/health

# Test WhatsApp (needs real Twilio)
curl -X POST http://localhost:3001/api/twilio/send-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210", "message": "Test message"}'

# Test claim creation (needs real Supabase)
curl -X POST http://localhost:3001/api/claims/create \
  -H "Content-Type: application/json" \
  -d '{"claimId": "C123", "userId": "U456", "payout": 1000, "trigger": "rain"}'
```

---

## 📚 Project Structure

```
vite-project/
├── .env.local              ← Your API keys here
├── .env.example            ← Reference
├── package.json            ← Frontend dependencies
├── vite.config.js          ← Frontend config (fixed: @/ alias, proxy)
├── src/
│   ├── lib/razorpay.js     ← Payment functions (fixed: now populated)
│   ├── i18n/LanguageContext.jsx  ← Translation (fixed: consolidated)
│   └── components/         ← React components
└── backend/
    ├── package.json
    ├── .env.local          ← Loads from parent
    └── server-simple.js    ← Backend (fixed: env vars, validation)
```

---

## 🔐 Security Notes

- **Never commit `.env.local` to git**
- Keep `TWILIO_AUTH_TOKEN` secret
- Keep `SUPABASE_ANON_KEY` safe (it's semi-public but shouldn't be exposed)
- Never put backend keys in frontend code

---

## 📞 Support

If you get errors after setup:

1. Check `.env.local` has all required vars
2. Verify credentials are correct format (SID starts with `AC`, etc.)
3. Check both backend and frontend are running
4. Test health endpoint: `http://localhost:3001/health`

---

**Status:** Backend & Frontend Fixed ✅  
**Next:** Update `.env.local` → Start Backend → Start Frontend
