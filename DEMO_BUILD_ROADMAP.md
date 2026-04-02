# GigShield Demo Build Roadmap – Step by Step

> **Timeline:** 12 days to demo-ready  
> **Goal:** End-to-end working app with real integrations  
> **Status:** Currently have frontend UI + basic backend skeleton

---

## **PHASE 1: Infrastructure Setup (Days 1-2)**

### Step 1.1: Create GitHub branch for phase-2
```bash
git checkout -b phase-2
git push origin phase-2
```
Set this as default branch on GitHub (for all PRs).

### Step 1.2: Supabase Setup
1. Go to **supabase.com** → Sign up (free tier)
2. Create new project: `gigshield-demo` (choose India region if available)
3. Go to **SQL Editor** → Paste the schema below → Run it:

```sql
-- Users table
create table public.users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text not null,
  platform text not null, -- "Zomato" or "Swiggy"
  pin_code text not null,
  earnings_weekly integer not null,
  nfi_score integer not null,
  created_at timestamp default now()
);

-- Policies table
create table public.policies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  tier text not null, -- "basic", "standard", "premium"
  premium_weekly integer not null,
  max_payout integer not null,
  active boolean default true,
  created_at timestamp default now(),
  expires_at timestamp
);

-- Claims table
create table public.claims (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  policy_id uuid references public.policies(id),
  trigger text not null, -- "rain", "heat", "aqi", "outage"
  amount_triggered integer not null,
  amount_paid integer,
  status text default 'pending', -- "pending", "paid", "rejected"
  weather_data jsonb, -- store {temp, rain, aqi, etc}
  created_at timestamp default now(),
  paid_at timestamp
);

-- Weather log (for debugging parametric triggers)
create table public.weather_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id),
  pin_code text,
  temp_c float,
  rain_mm float,
  aqi integer,
  heat_index float,
  triggered boolean default false,
  created_at timestamp default now()
);

-- API Keys vault (store safe, never commit)
create table public.api_keys (
  id uuid default gen_random_uuid() primary key,
  service text not null, -- "razorpay", "twilio", "groq", "openweathermap"
  key_value text not null,
  is_test_mode boolean default true,
  created_at timestamp default now()
);
```

4. Copy your **Supabase URL** and **Anon Key** from Settings → API

### Step 1.3: Update .env.local
Add to `.env.local`:
```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

### Step 1.4: Create Supabase client
Create `src/lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper: Get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper: Get user profile + policy + claims
export async function getUserFullProfile(userId) {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  const { data: policy } = await supabase
    .from('policies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: claims } = await supabase
    .from('claims')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { user, policy, claims }
}
```

### Step 1.5: Install Supabase client
```bash
npm install @supabase/supabase-js
```

---

## **PHASE 2: Backend APIs (Days 2-4)**

### Step 2.1: Create API route - POST /api/users (save new user)

Create `backend/routes/users.js`:
```javascript
import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

// POST /api/users - Create or get user
router.post('/api/users', async (req, res) => {
  try {
    const { email, name, platform, pin_code, earnings_weekly, nfi_score } = req.body

    // Check: Email required
    if (!email) return res.status(400).json({ error: 'Email required' })

    // Try to find existing user
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return res.status(200).json({ id: existing.id, message: 'User already exists' })
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        email,
        name,
        platform,
        pin_code,
        earnings_weekly,
        nfi_score
      }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json(newUser)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
```

### Step 2.2: Create API route - GET /api/users/:id (fetch user + profile)

Add to same `backend/routes/users.js`:
```javascript
// GET /api/users/:id - Get user with policy + claims
router.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (userError) throw userError

    const { data: policy } = await supabase
      .from('policies')
      .select('*')
      .eq('user_id', id)
      .eq('active', true)
      .single()

    const { data: claims } = await supabase
      .from('claims')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })

    res.json({ user, policy, claims: claims || [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
```

### Step 2.3: Create API route - POST /api/policies (create policy)

Create `backend/routes/policies.js`:
```javascript
import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

// TIER definitions (from your src/data.js)
const TIERS = {
  basic: { base: 20, max_payout: 50000 },
  standard: { base: 54, max_payout: 200000 },
  premium: { base: 99, max_payout: 500000 }
}

// POST /api/policies - Activate policy for user
router.post('/api/policies', async (req, res) => {
  try {
    const { user_id, tier, nfi_score, seasonal } = req.body

    if (!TIERS[tier]) {
      return res.status(400).json({ error: `Invalid tier. Use: ${Object.keys(TIERS).join(', ')}` })
    }

    // Calculate premium based on NFI + seasonal
    const basePrice = TIERS[tier].base
    const nfiSurcharge = Math.round((nfi_score / 100) * 12)
    const loyaltyDiscount = Math.round(basePrice * 0.12)
    const premiumWeekly = basePrice + nfiSurcharge - loyaltyDiscount

    const { data: policy, error } = await supabase
      .from('policies')
      .insert([{
        user_id,
        tier,
        premium_weekly: premiumWeekly,
        max_payout: TIERS[tier].max_payout,
        active: true
      }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json(policy)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
```

### Step 2.4: Create API route - POST /api/claims (log claim)

Create `backend/routes/claims.js`:
```javascript
import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

// POST /api/claims - Log a claim trigger
router.post('/api/claims', async (req, res) => {
  try {
    const { user_id, policy_id, trigger, amount_triggered, weather_data } = req.body

    if (!['rain', 'heat', 'aqi', 'outage'].includes(trigger)) {
      return res.status(400).json({ error: 'Invalid trigger type' })
    }

    const { data: claim, error } = await supabase
      .from('claims')
      .insert([{
        user_id,
        policy_id,
        trigger,
        amount_triggered,
        weather_data,
        status: 'paid' // Auto-payout on trigger
      }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json(claim)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/claims/:userId - Fetch all claims for user
router.get('/api/claims/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const { data: claims, error } = await supabase
      .from('claims')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json(claims || [])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
```

### Step 2.5: Wire routes into backend server

Edit `backend/server-simple.js` - Add at the top:
```javascript
import usersRouter from './routes/users.js'
import policiesRouter from './routes/policies.js'
import claimsRouter from './routes/claims.js'

// ... after app.use(express.json())
app.use('/', usersRouter)
app.use('/', policiesRouter)
app.use('/', claimsRouter)
```

### Step 2.6: Test APIs with curl/Postman

```bash
# Test 1: Create user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"rider@test.com","name":"Shiva","platform":"Zomato","pin_code":"600001","earnings_weekly":6000,"nfi_score":65}'

# Test 2: Get user (replace ID)
curl http://localhost:3001/api/users/{userId}

# Test 3: Create policy
curl -X POST http://localhost:3001/api/policies \
  -H "Content-Type: application/json" \
  -d '{"user_id":"{userId}","tier":"standard","nfi_score":65,"seasonal":6}'
```

---

## **PHASE 3: AI Chat (Days 4-5)**

### Step 3.1: Get Groq API key
1. Go to **console.groq.com**
2. Sign up → Create API key
3. Add to `.env.local`:
```env
GROQ_API_KEY=gsk_xxxxx...
```

### Step 3.2: Update AI chat to use real data

Edit `src/components/AIChatAssistant.jsx`:
```javascript
import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { supabase } from '../lib/supabase'

export default function AIChatAssistant({ userPolicy }) {
  const { t } = useLanguage()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEnd = useRef(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim()) return

    setMessages(prev => [...prev, { role: 'user', content: input }])
    setInput('')
    setLoading(true)

    try {
      // Fetch user data for context
      const { data: user } = await supabase.auth.getUser()
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      // Call Groq API with context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: input,
          userContext: {
            name: userData?.name,
            platform: userData?.platform,
            nfiScore: userData?.nfi_score,
            policyTier: userPolicy?.tier,
            earnings: userData?.earnings_weekly
          }
        })
      })

      const { reply } = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I had trouble understanding. Can you rephrase?' 
      }])
    }

    setLoading(false)
  }

  return (
    <div style={{ height: '400px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, background: '#FAFAF8', borderRadius: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 8, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
            <div style={{
              display: 'inline-block',
              maxWidth: '80%',
              padding: '8px 12px',
              borderRadius: 8,
              background: msg.role === 'user' ? '#FF6B35' : '#E0D9D0',
              color: msg.role === 'user' ? '#fff' : '#1A1512',
              fontSize: 13
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ color: '#9B8E84', fontSize: 12 }}>Thinking...</div>}
        <div ref={messagesEnd} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about your coverage..."
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #E0D9D0',
            fontSize: 13,
            outline: 'none'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: '#FF6B35',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
```

### Step 3.3: Create backend chat API

Create `backend/routes/chat.js`:
```javascript
import { Router } from 'express'
import axios from 'axios'

const router = Router()

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

router.post('/api/chat', async (req, res) => {
  try {
    const { userMessage, userContext } = req.body

    const systemPrompt = `You are a helpful insurance advisor for GigShield.
    The user is ${userContext.name}, delivers for ${userContext.platform}.
    They have a ${userContext.policyTier} policy covering ₹${userContext.policyTier === 'basic' ? '50k' : userContext.policyTier === 'standard' ? '2L' : '5L'}.
    Weekly earnings: ~₹${userContext.earnings}.
    
    Help them understand:
    - When they get payouts (rain >35mm, heat >42C, AQI >350, app outage >90min)
    - How NFI score (${userContext.nfiScore}) affects their premium
    - Claims process and payout timeline
    
    Keep responses short (1-2 sentences), friendly, and in context.`

    const response = await axios.post(GROQ_URL, {
      model: 'mixtral-8x7b-32768',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 200
    }, {
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` }
    })

    const reply = response.data.choices[0].message.content

    res.json({ reply })
  } catch (error) {
    console.error('Groq API error:', error.message)
    res.status(500).json({ error: 'Chat service unavailable' })
  }
})

export default router
```

Add to `backend/server-simple.js`:
```javascript
import chatRouter from './routes/chat.js'
app.use('/', chatRouter)
```

---

## **PHASE 4: Parametric Triggers (Days 5-6)**

### Step 4.1: Get OpenWeatherMap API key
1. Go to **openweathermap.org**
2. Sign up → API keys section
3. Copy "Current Weather Data" API key
4. Add to `.env.local`:
```env
VITE_OPENWEATHER_API_KEY=xxxxx
OPENWEATHER_API_KEY=xxxxx
```

### Step 4.2: Create weather trigger service

Create `backend/services/triggers.js`:
```javascript
import axios from 'axios'
import { supabase } from '../config/supabase.js'

const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY

// Parametric trigger thresholds
const TRIGGERS = {
  rain: 35, // mm
  heat: 42, // Celsius
  aqi: 350,
  outage: 90 // minutes
}

export async function checkWeatherTriggers(pinCode) {
  try {
    // Get lat/lon from pincode (use a static mapping or API)
    const locationMap = {
      '600001': { lat: 13.0827, lon: 80.2707 }, // Chennai
      '560001': { lat: 12.9716, lon: 77.5946 }, // Bangalore
      '400001': { lat: 19.0760, lon: 72.8777 }  // Mumbai
    }

    const location = locationMap[pinCode] || locationMap['600001']

    // Fetch current weather
    const weatherRes = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: location.lat,
        lon: location.lon,
        appid: OPENWEATHER_KEY,
        units: 'metric'
      }
    })

    const weather = weatherRes.data
    const temp = weather.main.temp
    const rainMM = (weather.rain?.['1h'] || 0) * 25.4 // Convert to mm
    const humidity = weather.main.humidity

    // Heat index calculation: HI = c1 + c2*T + c3*RH + c4*T*RH + c5*T² + c6*RH² + c7*T²*RH + c8*T*RH² + c9*T²*RH²
    const c1 = -42.379, c2 = 2.04901523, c3 = 10.14333127, c4 = -0.22475541, c5 = -0.00683783, c6 = -0.05481717, c7 = 0.00122874, c8 = 0.00085282, c9 = -0.00000199
    const heatIndex = c1 + c2*temp + c3*humidity + c4*temp*humidity + c5*temp*temp + c6*humidity*humidity + c7*temp*temp*humidity + c8*temp*humidity*humidity + c9*temp*temp*humidity*humidity

    // Fetch AQI
    const aqiRes = await axios.get('https://api.openweathermap.org/data/2.5/air_pollution', {
      params: {
        lat: location.lat,
        lon: location.lon,
        appid: OPENWEATHER_KEY
      }
    })

    const aqi = aqiRes.data.list[0].main.aqi // 1=Good, 5=Very Poor

    // Log weather
    await supabase.from('weather_logs').insert([{
      pin_code: pinCode,
      temp_c: temp,
      rain_mm: rainMM,
      aqi: aqi * 70, // Scale to 0-350
      heat_index: heatIndex
    }])

    // Check triggers
    const triggered = []
    if (rainMM > TRIGGERS.rain) triggered.push({ type: 'rain', value: rainMM })
    if (heatIndex > TRIGGERS.heat) triggered.push({ type: 'heat', value: heatIndex })
    if (aqi * 70 > TRIGGERS.aqi) triggered.push({ type: 'aqi', value: aqi * 70 })

    return { triggered, weather: { temp, rainMM, heatIndex, aqi } }
  } catch (error) {
    console.error('Weather trigger error:', error.message)
    return { triggered: [], error: error.message }
  }
}

// Cron job: Check all active users every 30 mins
export async function checkAllUserTriggers() {
  try {
    // Get all users with active policies
    const { data: users } = await supabase
      .from('users')
      .select('id, pin_code, name')

    for (const user of users) {
      const { triggered, weather } = await checkWeatherTriggers(user.pin_code)

      for (const trigger of triggered) {
        // Get user's policy
        const { data: policy } = await supabase
          .from('policies')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true)
          .single()

        if (policy) {
          // Create claim
          await supabase.from('claims').insert([{
            user_id: user.id,
            policy_id: policy.id,
            trigger: trigger.type,
            amount_triggered: trigger.value,
            weather_data: weather,
            status: 'paid'
          }])

          console.log(`✅ Auto-payout triggered for ${user.name}: ${trigger.type}`)
        }
      }
    }
  } catch (error) {
    console.error('Trigger check error:', error)
  }
}
```

### Step 4.3: Setup Vercel cron (for production)

Create `pages/api/cron/triggers.js`:
```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify Vercel cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { checkAllUserTriggers } = await import('../../backend/services/triggers.js')
    await checkAllUserTriggers()
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
```

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/triggers",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

---

## **PHASE 5: Payments (Days 6-8)**

### Step 5.1: Sign up for Razorpay + Twilio
1. **Razorpay:** razorpay.com → Sign up → KYC form (submit now, 2-5 days)
2. **Twilio:** twilio.com → Messaging → WhatsApp sandbox
3. Add keys to `.env.local`:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxx

TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE=+1234567890 (your sandbox number)
```

### Step 5.2: Create Razorpay payment API

Create `backend/routes/payments.js`:
```javascript
import { Router } from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'

const router = Router()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

// POST /api/payment/create-order
router.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, userId, policyId } = req.body

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `order_${userId}_${Date.now()}`,
      notes: { userId, policyId }
    })

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/payment/verify
router.post('/api/payment/verify', async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + '|' + paymentId)
      .digest('hex')

    if (generated_signature === signature) {
      res.json({ success: true, message: 'Payment verified' })
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
```

### Step 5.3: Integrate Razorpay into UPI Payment Flow

Update `src/components/UPIPaymentFlow.jsx`:
```javascript
import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

export default function UPIPaymentFlow({ amount, onSuccess, onCancel }) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)

  async function handlePayment() {
    setLoading(true)

    try {
      // Step 1: Create order
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })

      const { orderId } = await orderRes.json()

      // Step 2: Load Razorpay script
      const options = {
        key: 'rzp_test_xxxxx', // Replace with your key
        amount: amount * 100,
        currency: 'INR',
        order_id: orderId,
        handler: async (response) => {
          // Step 3: Verify payment
          const verify = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            })
          })

          const result = await verify.json()
          if (result.success) {
            onSuccess?.()
          }
        },
        prefill: {
          contact: '9999999999',
          email: 'demo@gigshield.test'
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      alert('Payment failed: ' + error.message)
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h3 style={{ color: '#1A1512', marginBottom: 20 }}>Pay ₹{amount} via UPI</h3>
      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          padding: '12px 24px',
          background: '#FF6B35',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          fontSize: 14,
          fontWeight: 600
        }}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      <button onClick={onCancel} style={{ marginLeft: 10, padding: '12px 24px', background: '#E0D9D0', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
        Cancel
      </button>
    </div>
  )
}
```

### Step 5.4: Create Twilio WhatsApp service

Create `backend/services/twilio.js`:
```javascript
import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhone = process.env.TWILIO_PHONE
const client = twilio(accountSid, authToken)

export async function sendWhatsAppMessage(toPhone, message) {
  try {
    const msg = await client.messages.create({
      body: message,
      from: `whatsapp:${twilioPhone}`,
      to: `whatsapp:${toPhone}`
    })
    return { success: true, messageId: msg.sid }
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return { success: false, error: error.message }
  }
}

export async function sendPayoutNotification(phone, amount, claimId) {
  const message = `🎉 Your GigShield payout of ₹${amount} has been processed! Claim ID: ${claimId}. Check your UPI app for the transfer.`
  return sendWhatsAppMessage(phone, message)
}
```

---

## **PHASE 6: Frontend Polish (Days 8-10)**

### Step 6.1: Mobile Responsiveness

Update `src/App.css` or `src/Login.jsx` inline styles:
```javascript
// Add media query overrides for mobile
const mobileStyle = window.innerWidth < 480 ? {
  width: "90%",
  maxWidth: "100%",
  borderRadius: 16,
  boxShadow: "0 2px 20px rgba(0,0,0,0.05)"
} : {
  width: "100%",
  maxWidth: 440
}

// Apply to card wrapper
<div style={{ ...mobileStyle, background: "#fff" }}>
```

### Step 6.2: Add animations

Create `src/utils/animations.js` (if not exists):
```javascript
export const fadeInSlide = {
  animation: "fadeInSlide 0.4s ease-out forwards"
}

export const slideUp = {
  animation: "slideUp 0.3s ease-out forwards"
}

// Add to index.css:
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Step 6.3: Insurer Dashboard Charts

Update `src/components/InsurerDashboard.jsx` - Add Chart.js:
```bash
npm install chart.js react-chartjs-2
```

Then add:
```javascript
import { Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

<Line data={{
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{
    label: 'Claims Paid',
    data: [2, 3, 5, 7, 12, 8, 4],
    borderColor: '#FF6B35',
    tension: 0.4
  }]
}} />
```

---

## **PHASE 7: Demo Prep (Days 10-12)**

### Step 7.1: Seed demo data

Create `backend/scripts/seed.js`:
```javascript
import { supabase } from '../config/supabase.js'

async function seed() {
  // Create demo user
  const { data: user } = await supabase
    .from('users')
    .insert([{
      email: 'demo@gigshield.test',
      name: 'Raj Kumar',
      platform: 'Zomato',
      pin_code: '600001',
      earnings_weekly: 6500,
      nfi_score: 68
    }])
    .select()
    .single()

  // Create policy
  const { data: policy } = await supabase
    .from('policies')
    .insert([{
      user_id: user.id,
      tier: 'standard',
      premium_weekly: 54,
      max_payout: 200000
    }])
    .select()
    .single()

  // Create 3 demo claims
  await supabase.from('claims').insert([
    {
      user_id: user.id,
      policy_id: policy.id,
      trigger: 'rain',
      amount_triggered: 45.5,
      status: 'paid'
    },
    {
      user_id: user.id,
      policy_id: policy.id,
      trigger: 'heat',
      amount_triggered: 43.2,
      status: 'paid'
    },
    {
      user_id: user.id,
      policy_id: policy.id,
      trigger: 'outage',
      amount_triggered: 120,
      status: 'pending'
    }
  ])

  console.log('✅ Demo data seeded!')
}

seed()
```

Run: `node backend/scripts/seed.js`

### Step 7.2: Full flow test checklist

- [ ] User onboarding (name → risk → policy selection → dashboard)
- [ ] Weather triggers hit automatically (or manually test via API)
- [ ] WhatsApp notification sent on payout
- [ ] Razorpay payment modal opens in sandbox mode
- [ ] Dashboard shows all past claims
- [ ] Hindi language toggle works everywhere
- [ ] Mobile responsive on iPhone + Android
- [ ] No console errors

### Step 7.3: Screen recording backup

Use OBS Studio:
1. Open app on localhost:5173
2. Record full flow: onboarding → policy → dashboard → claim
3. Save as `demo-backup.mp4`

---

## **Next Steps**

1. **TODAY:** Complete Phase 1 (Supabase + .env setup)
2. **TOMORROW:** Phase 2 (Backend APIs)
3. **Days 3-4:** Phase 3 + 4 (AI + Triggers)
4. **Days 5-7:** Phase 5 + 6 (Payments + UI polish)
5. **Days 8-12:** Phase 7 (Data seeding, testing, rehearsing)

Each phase has only 2-3 days. Move fast, don't perfectionize.

---

**Questions? Ask in standup. Blocked? Message now.**
