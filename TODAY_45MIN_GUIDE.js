/*
╔════════════════════════════════════════════════════════════════════════════╗
║                   DO THIS TODAY (< 1 HOUR)                                  ║
║              Get Twilio + Supabase working RIGHT NOW                        ║
╚════════════════════════════════════════════════════════════════════════════╝

⏱️  TIMELINE: 45 MINUTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


⏰ STEP 1: TWILIO SETUP (10 MIN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Open: https://www.twilio.com/console
2. Sign up (use your email)
3. Verify phone number
4. Go to: Account > API Credentials
5. COPY these two:
   - Account SID (AC...)
   - Auth Token (secret)

6. Go back to Messaging > Channels > WhatsApp
7. Create Sandbox
8. COPY the number: whatsapp:+14155238886
9. Send this message from your phone:
   Message to: +1 415-523-8886
   Text: join <code shown on page>
10. Wait for WhatsApp "Twilio" confirmation

DONE! You now have:
   ✓ Account SID
   ✓ Auth Token
   ✓ WhatsApp number
   ✓ Sandbox activated


⏰ STEP 2: SUPABASE SETUP (15 MIN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Open: https://supabase.com/dashboard
2. Sign up (Google/GitHub easiest)
3. Create New Project
4. Name: "gigshield"
5. Region: Select closest to you
6. Create (wait 2-3 minutes)

7. Once created, go to Settings > API
8. COPY:
   - Project URL (https://xxxxx.supabase.co)
   - anon key (starts with eyJ...)

9. Open SQL Editor
10. Create new query
11. Open file: backend/supabase.sql (in your project)
12. Copy ALL contents
13. Paste into SQL editor
14. Click "Run"
15. Wait for ✓ (all tables created)

DONE! You now have:
   ✓ Supabase project
   ✓ Database schema
   ✓ Project URL
   ✓ ANON key


⏰ STEP 3: CREATE .env.local (5 MIN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In vite-project/ directory:

Create file: .env.local

Paste THIS (replace with YOUR values):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TWILIO
VITE_TWILIO_ACCOUNT_SID=AC1234567890abcdef
VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
VITE_TWILIO_PHONE=whatsapp:+14155238886

# SUPABASE
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# BACKEND
VITE_API_URL=http://localhost:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Save file.


⏰ STEP 4: BACKEND SETUP (10 MIN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Open terminal, go to backend folder:

cd backend

Install dependencies:
npm install

Should show: ✓ express, cors, dotenv, twilio, supabase

Start server:
npm start

Should show:
╔══════════════════════════════════════════════════════════════════╗
║         🚀 GigShield Backend - SIMPLIFIED                       ║
║         📍 Local:  http://localhost:3000                        ║
║         ✓ Twilio WhatsApp:   Ready                              ║
║         ✓ Supabase Database: Ready                              ║
╚══════════════════════════════════════════════════════════════════╝

✓ Server running!


⏰ STEP 5: TEST WHATSAPP (5 MIN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Open new terminal (keep backend running in first terminal)

Test sending WhatsApp:

curl -X POST http://localhost:3000/api/twilio/send-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "Test from GigShield backend!"
  }'

Expected response:
{
  "success": true,
  "messageSid": "SM_xxxxx"
}

Check your phone: You should get WhatsApp message!

Also check Supabase:
  Dashboard > notifications table > should see your message logged


⏰ STEP 6: TEST FRONTEND (5 MIN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Open third terminal:

cd .. (go back to vite-project)
npm run dev

Should show:
  ✓ VITE v7.3.1 ready in 485ms
  ✓ Local: http://localhost:5175

Open browser: http://localhost:5175

Test:
  ✓ App loads
  ✓ Click "हिंदी" → texts translate
  ✓ Fill Onboarding → Risk → Policy → Dashboard
  ✓ Click "Simulate disruption"
  ✓ See payout animation
  ✓ Tests for admin dashboard


✅ YOU'RE DONE! EVERYTHING WORKING!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What Works NOW:
  ✓ Frontend (all 4 screens)
  ✓ Language toggle (EN ↔ हिंदी)
  ✓ Backend server
  ✓ Twilio WhatsApp sending
  ✓ Supabase data logging
  ✓ Mobile responsive
  ✓ Admin dashboard

What to Add LATER:
  ⏳ Razorpay (when KYC approved)
  ⏳ Real payout flow (instead of demo animation)
  ⏳ Chart.js dashboard


RUNNING SERVERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keep 3 terminals open:

Terminal 1 (Backend):
  cd backend && npm start
  → http://localhost:3000

Terminal 2 (Frontend):
  npm run dev
  → http://localhost:5175

Terminal 3 (Testing):
  Any commands/curl tests


🎯 NEXT: Record Demo Video
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Now that everything works:

1. Start screen recording (phone or browser)
2. Go to http://localhost:5175
3. Fill form: Name, pin, platform, earnings
4. See risk profile
5. Choose policy tier
6. Click "Activate GigShield"
7. See dashboard
8. Click "Simulate disruption"
9. See payout animation
10. Get WhatsApp notification
11. Done! 90-second demo ✓

*/
