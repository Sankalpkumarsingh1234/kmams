# GigShield Setup Checklist ✅

## Step 1: Twilio WhatsApp Setup (10 minutes)

- [ ] Go to https://www.twilio.com/console
- [ ] Create free account (sign up with email)
- [ ] Go to Explore Products → Messaging → WhatsApp
- [ ] Create WhatsApp Sandbox
- [ ] Copy **Account SID** (format: `AC...`)
- [ ] Copy **Auth Token** (format: long string)
- [ ] Get WhatsApp Sandbox Number: `whatsapp:+14155238886`
- [ ] Add your personal WhatsApp number to sandbox (follow Twilio's opt-in message)

**Result**: You'll receive a WhatsApp confirmation from Twilio


## Step 2: Supabase Database Setup (15 minutes)

- [ ] Go to https://supabase.com
- [ ] Create free account (sign up with GitHub or email)
- [ ] Create new project (choose region close to you, e.g., Singapore)
- [ ] Wait for project initialization (2-3 minutes)
- [ ] Go to **SQL Editor**
- [ ] Paste entire content of `backend/supabase.sql`
- [ ] Click **"Run"** button
- [ ] Go to **Project Settings** → **API**
- [ ] Copy **Project URL** (format: `https://xxxxx.supabase.co`)
- [ ] Copy **Anon/Public Key** (under "API Key")

**Result**: Database tables created + credentials ready


## Step 3: Fill .env.local Files (5 minutes)

### Frontend .env.local
```
.env.local (in vite-project/ root)
```
- [ ] Replace `ACxxxxxxxxxxxxxxx` with your Twilio Account SID
- [ ] Replace `your_auth_token_here` with your Twilio Auth Token
- [ ] Replace `https://xxxxx.supabase.co` with your Supabase URL
- [ ] Replace `eyJhbGciOi...` with your Supabase Anon Key

### Backend .env.local
```
backend/.env.local (in backend/ folder)
```
- [ ] Same Twilio credentials as above
- [ ] Same Supabase credentials as above


## Step 4: Backend Setup (10 minutes)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start server
npm start
```

**You should see**:
```
🚀 GigShield Backend running on http://localhost:3000
✓ Twilio configured
✓ Supabase connected
```


## Step 5: Test WhatsApp Integration (5 minutes)

### Option A: Using curl (recommended)
```bash
curl -X POST http://localhost:3000/api/twilio/send-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"919876543210","message":"GigShield test message! ✓"}'
```

Replace `919876543210` with your WhatsApp number (country code + number)

**Expected**:
- [ ] See response: `{"success":true,"messageSid":"SM_..."}`
- [ ] Receive WhatsApp on your phone within 5 seconds ✓


### Option B: Using Postman
- [ ] Download Postman: https://www.postman.com/downloads/
- [ ] Create POST request to `http://localhost:3000/api/twilio/send-whatsapp`
- [ ] Body (JSON): `{"phoneNumber":"919876543210","message":"Test!"}`
- [ ] Click Send
- [ ] Check your WhatsApp phone


## Step 6: Verify Database Connection (2 minutes)

- [ ] Go to Supabase Dashboard
- [ ] Click **"notifications"** table
- [ ] Should see 1 row with your WhatsApp test message ✓
- [ ] If not, check backend terminal for errors


## Step 7: Frontend Test (5 minutes)

In another terminal window:
```bash
# Terminal 1: Backend still running
cd backend
npm start

# Terminal 2: New terminal for frontend
cd vite-project
npm run dev
```

- [ ] Opens http://localhost:5175
- [ ] Click **"EN"** / **"हिंदी"** toggle in top right
- [ ] Language switches instantly ✓
- [ ] Fill out onboarding flow (name, platform, pin code, earnings)
- [ ] See risk dashboard appear


## Step 8: Create Demo Payout (2 minutes)

In backend terminal, test with curl:
```bash
curl -X POST http://localhost:3000/api/payout/create \
  -H "Content-Type: application/json" \
  -d '{"amount":420,"userName":"Your Name","userPhone":"919876543210","claimId":"DEMO1"}'
```

- [ ] Receive WhatsApp: "GigShield: Your payout of ₹420 has been initiated"
- [ ] Check Supabase notifications table (new entry added)


## ✅ YOU'RE DONE! NEXT STEPS:

1. **Record Demo Video** (optional)
   - [ ] Screen record the full flow: onboarding → language toggle → dashboard
   - [ ] Share with stakeholders

2. **When Razorpay Ready** (after KYC approval, 2-5 days)
   - [ ] Get Razorpay KEY_ID and KEY_SECRET
   - [ ] Add to .env.local files
   - [ ] Backend automatically enables real payouts

3. **Deploy Backend** (optional, for production)
   - [ ] Create Railway/Heroku account
   - [ ] Follow `backend/README.md` deployment section
   - [ ] Update VITE_API_URL to production URL


---

## TROUBLESHOOTING

**Q: WhatsApp message not arriving?**
- Check Twilio account SID/Auth Token are correct in .env.local
- Restart backend: `npm start`
- Check you joined WhatsApp sandbox (Twilio sent opt-in text)

**Q: npm install fails?**
- Make sure you're in `backend/` folder
- Delete `node_modules/` and `package-lock.json`, try again

**Q: Supabase connection error?**
- Check SUPABASE_URL format (should have https://)
- Check SUPABASE_ANON_KEY is not pasted as plain text
- Check internet connection

**Q: Frontend won't start?**
- Check you're in `vite-project/` (root), not `backend/`
- Run: `npm install` first

**Q: Port 3000 already in use?**
- Change PORT in backend/.env.local
- Update VITE_API_URL in frontend .env.local

---

**SUPPORT**: Check API_TESTING_REFERENCE.js for all curl commands
