# 🚀 Complete Backend Setup Guide

## STEP 1: Create Supabase Project (5 minutes)

1. Go to https://supabase.com → Click **"Start your project"**
2. Sign up with email or GitHub
3. Create a new project:
   - Organization: Create one (e.g., "GigShield")
   - Project name: `gigshield-dev`
   - Password: Save this (master password)
   - Region: Choose closest to you (e.g., Singapore/India)
   - Click **"Create new project"** and wait 2-3 minutes

4. Once ready, go to **Settings → API**
5. Copy these values:
   - `Project URL` → This is your `SUPABASE_URL`
   - `anon public` key → This is your `SUPABASE_ANON_KEY`

---

## STEP 2: Deploy Database Schema (2 minutes)

1. Go to Supabase dashboard → **SQL Editor**
2. Click **"New query"**
3. Copy-paste this entire schema:

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

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_policies_user_id ON policies(user_id);
CREATE INDEX idx_claims_user_id ON claims(user_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_notifications_phone ON notifications(phone);
```

4. Click **"Run"** and wait for success message ✓

---

## STEP 3: Update .env.local (1 minute)

Replace `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env.local`:

```env
SUPABASE_URL=YOUR_PROJECT_URL
SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Example:
```env
SUPABASE_URL=https://xxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## STEP 4: Test Backend API (2 minutes)

Run in PowerShell from `c:\Users\renu_\g\vite-project\backend`:

```powershell
# Create a test user
$body = @{
  email = "test@gigshield.work"
  name = "Test Worker"
  platform = "Zomato"
  pin_code = "560001"
  earnings_weekly = 8000
  nfi_score = 75
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3001/api/users" -Method POST -Body $body -ContentType "application/json"
echo $response.Content
```

Should return user ID ✓

---

## STEP 5: Wire Frontend to Backend (10 minutes)

### Update `src/components/OnboardingScreen.jsx`:

Replace the form submission with API call:

```javascript
const handleSubmit = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name,
        platform,
        pin_code,
        earnings_weekly: parseFloat(earnings_weekly),
        nfi_score: parseFloat(nfi_score),
      }),
    });
    
    const data = await response.json();
    localStorage.setItem('userId', data.id);
    onNext();
  } catch (error) {
    console.error('Failed to create user:', error);
  }
};
```

### Update `src/components/PolicyScreen.jsx`:

```javascript
const handlePolicySelect = async (tier) => {
  try {
    const userId = localStorage.getItem('userId');
    const response = await fetch('http://localhost:3001/api/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        tier,
        premium_weekly: PREMIUM_AMOUNTS[tier],
      }),
    });
    
    const data = await response.json();
    localStorage.setItem('policyId', data.policy_id);
    onNext();
  } catch (error) {
    console.error('Failed to create policy:', error);
  }
};
```

---

## STEP 6: Test Full Flow (3 minutes)

1. Start backend: `node "C:\Users\renu_\g\vite-project\backend\server-simple.js"`
2. Start frontend: `npm run dev`
3. Open http://localhost:5175
4. Fill onboarding form → Should save to Supabase ✓
5. Select policy tier → Should save policy ✓

---

## STEP 7: Add Optional API Keys (5 minutes each)

### Groq API (for AI chat):
1. Go to https://console.groq.com/keys
2. Create API key → Copy to `GROQ_API_KEY` in .env.local

### OpenWeather API (for weather triggers):
1. Go to https://openweathermap.org/api
2. Sign up → Go to API keys tab
3. Copy key → Set `OPENWEATHER_API_KEY` in .env.local

### Razorpay (for payments):
1. Go to https://razorpay.com
2. Sign up → Complete KYC (2-5 days)
3. Settings → API Keys → Copy test key IDs
4. Add to .env.local (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`)

### Twilio (for WhatsApp):
1. Go to https://twilio.com
2. Sign up → Verify phone
3. Messaging → Try it out
4. Copy Account SID, Auth Token, WhatsApp number
5. Add to .env.local

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] .env.local updated with real credentials
- [ ] Backend running on http://localhost:3001
- [ ] `/health` endpoint returns 200
- [ ] `POST /api/users` creates user
- [ ] `POST /api/policies` creates policy
- [ ] Frontend calls backend APIs
- [ ] Data saves to Supabase ✓

---

## 🆘 Troubleshooting

**"Missing Supabase credentials"**
→ Check .env.local has correct URL and key (no spaces)

**"CORS error"**
→ Backend needs CORS enabled (already done in server-simple.js)

**"Connection refused on localhost:3001"**
→ Backend not running? Run: `node "C:\Users\renu_\g\vite-project\backend\server-simple.js"`

**API returns 500**
→ Check browser console + backend terminal for error logs

---

Ready? Let me know which step you're on! 🚀
