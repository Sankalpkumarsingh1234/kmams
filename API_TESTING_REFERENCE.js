/*
╔════════════════════════════════════════════════════════════════════════════╗
║                         API TESTING REFERENCE                               ║
║                  Use with curl, Postman, or browser                        ║
╚════════════════════════════════════════════════════════════════════════════╝

Make sure backend is running:
  npm start (in backend/ folder)
  Should see: 🚀 GigShield Backend running on http://localhost:3000


1️⃣  HEALTH CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GET http://localhost:3000/health

curl http://localhost:3000/health

Expected:
{
  "status": "ok",
  "timestamp": "2026-04-01T10:30:00Z",
  "services": {
    "twilio": "✓ Ready",
    "supabase": "✓ Ready",
    "razorpay": "⏸ Skipped (Optional)"
  }
}


2️⃣  SEND WHATSAPP MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POST http://localhost:3000/api/twilio/send-whatsapp

Headers:
  Content-Type: application/json

Body (JSON):
{
  "phoneNumber": "919876543210",
  "message": "Hello from GigShield! ✓"
}

curl example:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
curl -X POST http://localhost:3000/api/twilio/send-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "message": "Your GigShield payout is ready!"
  }'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Expected Response:
{
  "success": true,
  "messageSid": "SM_abcd1234efgh5678"
}

Result: WhatsApp message sent to your phone ✓
Also: Message logged in Supabase notifications table


3️⃣  CREATE CLAIM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POST http://localhost:3000/api/claims/create

Body:
{
  "claimId": "CLAIM_001",
  "userId": "user_123",
  "payout": 420,
  "trigger": "heavy_rain"
}

Expected Response:
{
  "success": true,
  "claimId": "CLAIM_001"
}

Result: Claim logged in Supabase claims table


4️⃣  CREATE POLICY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POST http://localhost:3000/api/policies/create

Body:
{
  "userId": "user_123",
  "userName": "Raj Kumar",
  "platform": "Zomato",
  "tier": "standard",
  "nfi": 65
}

Expected Response:
{
  "success": true,
  "policyId": "POL-1234567890"
}

Result: Policy created in Supabase policies table


5️⃣  GET NOTIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GET http://localhost:3000/api/notifications?phone=919876543210

curl example:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
curl "http://localhost:3000/api/notifications?phone=919876543210"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Expected Response:
{
  "notifications": [
    {
      "id": 1,
      "type": "whatsapp",
      "phone": "919876543210",
      "message": "Your GigShield payout is ready!",
      "twilio_sid": "SM_abcd1234efgh5678",
      "status": "sent",
      "created_at": "2026-04-01T10:30:00Z"
    }
  ]
}

Result: All your WhatsApp messages shown


6️⃣  CREATE DEMO PAYOUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POST http://localhost:3000/api/payout/create

Body:
{
  "amount": 420,
  "userName": "Raj Kumar",
  "userPhone": "919876543210",
  "claimId": "CLAIM_001"
}

Expected Response:
{
  "success": true,
  "payoutId": "POUT-1234567890",
  "amount": 420,
  "message": "Demo payout (Razorpay integration coming)"
}

What happens:
  1. ✓ Payout created in Supabase
  2. ✓ WhatsApp sent: "GigShield: Your payout of ₹420 has been initiated."
  3. ✓ Data logged


ERROR RESPONSES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If .env.local missing credentials:

{
  "error": "Failed to send WhatsApp",
  "details": "Authentication failed - check TWILIO credentials"
}

Fix: Check .env.local has VITE_TWILIO_ACCOUNT_SID and VITE_TWILIO_AUTH_TOKEN


TESTING WITH POSTMAN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Download Postman: https://www.postman.com/downloads/
2. Create new request
3. Select: POST
4. Paste URL: http://localhost:3000/api/twilio/send-whatsapp
5. Go to Body tab
6. Select: raw + JSON
7. Paste:
{
  "phoneNumber": "919876543210",
  "message": "Test from Postman!"
}
8. Click "Send"
9. See response below


TESTING WITH BROWSER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For GET requests, can test directly in browser:

http://localhost:3000/health
http://localhost:3000/api/notifications?phone=919876543210

For POST requests, need curl or Postman


QUICK TEST SEQUENCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Check health:
   curl http://localhost:3000/health

2. Send test WhatsApp:
   curl -X POST http://localhost:3000/api/twilio/send-whatsapp \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber":"919876543210","message":"Test!"}'

3. Check WhatsApp received on your phone ✓

4. Create demo payout:
   curl -X POST http://localhost:3000/api/payout/create \
     -H "Content-Type: application/json" \
     -d '{"amount":420,"userName":"Test","userPhone":"919876543210","claimId":"TEST1"}'

5. Get notifications:
   curl "http://localhost:3000/api/notifications?phone=919876543210"

6. Check Supabase:
   Dashboard → notifications table → should see 2 entries ✓


DEBUGGING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Check backend terminal output for detailed logs:
  📤 Sending WhatsApp to 919876543210...
  📱 WhatsApp sent: SM_xxxxx
  ✓ Notification logged to Supabase

If error, check .env.local exists with these variables:
  VITE_TWILIO_ACCOUNT_SID
  VITE_TWILIO_AUTH_TOKEN
  VITE_TWILIO_PHONE
  VITE_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY

*/
