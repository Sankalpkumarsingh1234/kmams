# 🚀 Complete API Implementation Guide (Step-by-Step)

## CRITICAL: You need REAL APIs, not demo placeholders!

Your current issue: .env.local has demo credentials that don't work.

---

# STEP 1: Create Real Supabase Project (5 minutes)

### 1a. Go to Supabase
- Open: https://supabase.com
- Click **"Start your project"**
- Sign up with email/GitHub (takes 1 minute)

### 1b. Create Project
- Organization: Click "Create new org" 
- Name: `gigshield-dev`
- Password: `YourSecurePassword123` (save this!)
- Region: Choose closest (Asia-Singapore or India)
- Click **"Create new project"** → Wait 2-3 minutes

### 1c. Get Credentials
Once project loads:
1. Click **Settings** (bottom left)
2. Click **API**
3. Copy these values:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## STEP 2: Deploy Database Schema (3 minutes)

### 2a. Open SQL Editor
1. In Supabase, click **SQL Editor**
2. Click **"New query"**

### 2b. Copy-Paste This Schema:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  pin_code VARCHAR(10) NOT NULL,
  earnings_weekly DECIMAL(10, 2) NOT NULL,
  nfi_score INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create policies table
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  tier VARCHAR(50) NOT NULL,
  premium_weekly DECIMAL(10, 2) NOT NULL,
  max_payout DECIMAL(10, 2) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  policy_id UUID REFERENCES policies(id),
  trigger VARCHAR(50) NOT NULL,
  amount_triggered DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending',
  weather_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create weather_logs table
CREATE TABLE IF NOT EXISTS weather_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_code VARCHAR(10),
  temp_c DECIMAL(5, 2),
  rain_mm DECIMAL(5, 2),
  aqi INT,
  heat_index DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50),
  phone VARCHAR(20),
  message TEXT,
  twilio_sid VARCHAR(100),
  status VARCHAR(50),
  template_sid VARCHAR(100),
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_policies_user_id ON policies(user_id);
CREATE INDEX idx_claims_user_id ON claims(user_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_notifications_phone ON notifications(phone);
```

### 2c. Run It
- Click **"Run"** button
- Wait for ✅ "Queries executed successfully"

---

## STEP 3: Update .env.local with Real Credentials

Open: `c:\Users\renu_\g\vite-project\.env.local`

Replace these lines (Lines 14-15):
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Also update lines 22-23 (VITE versions):
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Save the file!**

---

## STEP 4: Test Supabase Connection (2 minutes)

### 4a. Kill Old Backend
Run in PowerShell:
```powershell
Get-Process node | Stop-Process -Force
```

### 4b. Start Backend
```powershell
cd "C:\Users\renu_\g\vite-project\backend"
node server-simple.js
```

Should show:
```
[✓] Environment loaded from: C:\Users\renu_\g\vite-project\.env.local
[✓] Variables loaded: 11 keys
[✓] All required environment variables loaded
🚀 GigShield Backend - SIMPLIFIED
📍 Local: http://localhost:3001
```

### 4c. Test Create User
Open PowerShell and run:
```powershell
$body = @{
  email = "test@gigshield.work"
  name = "Test User"
  platform = "Zomato"
  pin_code = "560001"
  earnings_weekly = 8000
  nfi_score = 75
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/users" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" | Select-Object Content
```

Should return user ID ✅

---

## STEP 5: Setup Groq API (for AI Chat) - 2 minutes

### 5a. Get API Key
1. Go to https://console.groq.com
2. Sign up (email or OAuth)
3. Click **"API Keys"** (left menu)
4. Click **"Create API Key"** 
5. Copy the key (looks like `gsk_xxxxxxxxxxxxx`)

### 5b. Add to .env.local
Find line with `GROQ_API_KEY=` and replace with:
```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
```

### 5c. Test It
Run in PowerShell:
```powershell
$body = @{
  userMessage = "What is my coverage?"
  userContext = @{
    name = "Test"
    platform = "Zomato"
    tier = "standard"
    earnings = 8000
    nfiScore = 75
  }
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/chat" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" | Select-Object Content
```

Should return AI response ✅

---

## STEP 6: Setup OpenWeatherMap API (for Weather) - 3 minutes

### 6a. Get API Key
1. Go to https://openweathermap.org/api
2. Sign up (free tier)
3. Go to **"API Keys"** tab
4. Copy default key

### 6b. Add to .env.local
Find `OPENWEATHER_API_KEY=` and replace:
```env
OPENWEATHER_API_KEY=your_key_here
VITE_OPENWEATHER_API_KEY=your_key_here
```

### 6c. Test It
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/triggers/check/560001" `
  -Method POST | Select-Object Content
```

Should return weather data ✅

---

## STEP 7: Setup Groq Chat in Frontend - 1 minute

Open: `src/components/AIChatAssistant.jsx`

Find the submit handler and replace with:

```javascript
const handleSendMessage = async () => {
  if (!userMessage.trim()) return;
  
  setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
  setUserMessage("");
  setLoading(true);
  
  try {
    const userId = localStorage.getItem('userId');
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage,
        userContext: {
          name: localStorage.getItem('userName'),
          platform: localStorage.getItem('userPlatform'),
          tier: localStorage.getItem('policyTier'),
          earnings: localStorage.getItem('userEarnings'),
          nfiScore: localStorage.getItem('nfiScore'),
        },
      }),
    });
    
    const data = await response.json();
    setMessages(prev => [...prev, { type: 'assistant', text: data.reply }]);
  } catch (error) {
    console.error('Chat error:', error);
    setMessages(prev => [...prev, { type: 'assistant', text: 'Sorry, something went wrong.' }]);
  } finally {
    setLoading(false);
  }
};
```

---

## STEP 8: Setup Weather in Frontend - 1 minute

Open: `src/components/LiveWeatherWidget.jsx`

Find the weather fetch and replace:

```javascript
useEffect(() => {
  const fetchWeather = async () => {
    try {
      const pinCode = localStorage.getItem('userPin');
      if (!pinCode) return;
      
      const response = await fetch(`http://localhost:3001/api/triggers/check/${pinCode}`, {
        method: 'POST',
      });
      const data = await response.json();
      
      setWeather({
        temp: data.weather?.temp || 28,
        rain: data.weather?.rainMM || 0,
        aqi: data.weather?.aqi || 150,
        heatIndex: data.weather?.heatIndex || 32,
        location: data.weather?.location || 'Your city',
        triggered: data.triggered || [],
      });
    } catch (error) {
      console.error('Weather fetch error:', error);
    }
  };
  
  fetchWeather();
  const interval = setInterval(fetchWeather, 60000); // Refresh every minute
  return () => clearInterval(interval);
}, []);
```

---

## STEP 9: Setup Claims Display - 1 minute

Open: `src/components/ClaimsHistory.jsx`

Add:

```javascript
useEffect(() => {
  const fetchClaims = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      const response = await fetch(`http://localhost:3001/api/users/${userId}/claims`);
      const data = await response.json();
      setClaims(data.claims || []);
    } catch (error) {
      console.error('Claims error:', error);
    }
  };
  
  fetchClaims();
}, []);
```

---

## STEP 10: Comment Out Razorpay (Until Later)

Open: `backend/routes/payments.js`

Replace entire file content with:

```javascript
import { Router } from 'express';

const router = Router();

/**
 * POST /api/payment/create-order
 * DISABLED FOR NOW - Razorpay integration coming soon
 */
router.post('/api/payment/create-order', (req, res) => {
  return res.status(503).json({
    error: 'Payment feature coming soon. KYC approval pending.',
    message: 'Razorpay integration will be enabled after business verification.',
  });
});

/**
 * POST /api/payment/verify
 * DISABLED FOR NOW
 */
router.post('/api/payment/verify', (req, res) => {
  return res.status(503).json({
    error: 'Payment verification disabled',
  });
});

/**
 * GET /api/payment/status/:orderId
 * DISABLED FOR NOW
 */
router.get('/api/payment/status/:orderId', (req, res) => {
  return res.status(503).json({
    error: 'Payment status check disabled',
  });
});

/**
 * POST /api/payment/webhook
 * DISABLED FOR NOW
 */
router.post('/api/payment/webhook', (req, res) => {
  return res.status(503).json({
    error: 'Webhook disabled',
  });
});

export default router;
```

Also comment Razorpay in server-simple.js:
Find line with `import paymentsRouter` and comment it out:
```javascript
// import paymentsRouter from './routes/payments.js';
```

And comment the route registration:
```javascript
// app.use('/', paymentsRouter);
```

---

## ✅ FINAL CHECKLIST

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] .env.local updated with real SUPABASE_URL and SUPABASE_ANON_KEY
- [ ] .env.local updated with GROQ_API_KEY
- [ ] .env.local updated with OPENWEATHER_API_KEY
- [ ] Backend tested successfully (user creation works)
- [ ] Groq API key tested
- [ ] OpenWeatherMap key tested
- [ ] Frontend components wired (Chat, Weather, Claims)
- [ ] Razorpay commented out

---

## 🎯 Test Full Flow:

1. Kill backend: `Get-Process node | Stop-Process -Force`
2. Restart backend: `node "C:\Users\renu_\g\vite-project\backend\server-simple.js"`
3. Restart frontend: `cd c:\Users\renu_\g\vite-project && npm run dev`
4. Open http://localhost:5173
5. Fill form and create user ✅
6. Create policy ✅
7. Go to Chat tab and ask a question ✅
8. Go to Weather tab and see real weather ✅

---

## 🆘 Troubleshooting

**"Network Error" when creating user?**
→ Check Supabase credentials are correct (no spaces, full URL)

**"Chat returns error"?**
→ Make sure GROQ_API_KEY is set correctly

**"Weather shows 0 values"?**
→ Make sure OPENWEATHER_API_KEY is set

**Backend shows "Missing required environment variables"?**
→ .env.local not found or values are empty - check line 14-15

**"Port 3001 already in use"?**
→ Run: `Get-Process node | Stop-Process -Force`

---

Ready? Start with STEP 1! 🚀
