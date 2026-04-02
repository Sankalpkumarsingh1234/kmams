/*
╔════════════════════════════════════════════════════════════════════════════╗
║                  RAZORPAY INTEGRATION - SETUP GUIDE                         ║
║              Once KYC approved, plug credentials here                       ║
╚════════════════════════════════════════════════════════════════════════════╝

TIMELINE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Day 1 (TODAY):
  ☐ Sign up at https://razorpay.com
  ☐ Fill KYC form
  ☐ Wait for approval (2-5 business days)

Day 2-3 (Once KYC approved):
  ☐ Get API keys
  ☐ Update .env.local
  ☐ Test ₹1 transfer
  ☐ Wire UPIPaymentFlow.jsx

Day 4-5:
  ☐ End-to-end test: Demo → Payout → WhatsApp ✓


STEP 1: Get Razorpay API Credentials
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to: https://razorpay.com/dashboard
2. Click "Sign up" → Fill form (Business details required)
3. Complete KYC:
   - PAN card upload
   - Bank account details
   - GSTR (if GST registered)
   - Individual/Proprietor: ID proof + Address
   
4. Wait 2-5 days for approval email ✓

5. Once approved, go to Settings → API Keys

6. Copy:
   - KEY_ID (starts with key_test_)
   - KEY_SECRET (secret key)

   Example:
   KEY_ID = key_test_1234567890abcd
   KEY_SECRET = abcdefghijklmnop1234567890


STEP 2: Update Environment Variables
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Edit: .env.local (root of project)

Add/Update:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Razorpay
VITE_RAZORPAY_KEY_ID=key_test_1234567890abcd
VITE_RAZORPAY_KEY_SECRET=abcdefghijklmnop1234567890

# Also add Razorpay account number (for payouts):
VITE_RAZORPAY_ACCOUNT=2121220061746170

# Twilio
VITE_TWILIO_ACCOUNT_SID=AC1234567890abcdef
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_PHONE=whatsapp:+14155238886

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Backend
VITE_API_URL=http://localhost:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Restart dev server:
  npm run dev


STEP 3: Test with ₹1 Payout
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Backend running: npm run dev (in backend/ folder)
   Should see: "🚀 GigShield Backend Server Running"

2. Frontend running: npm run dev (in vite-project)
   Should see: "http://localhost:5175"

3. Test payout via cURL or Postman:

POST http://localhost:3000/api/payout/create
Content-Type: application/json

{
  "amount": 1,
  "recipientType": "UPI",
  "userPhone": "919876543210",
  "userName": "Test User",
  "claimId": "test_001"
}

Response (SUCCESS):
{
  "success": true,
  "payoutId": "pout_1234567890",
  "status": "initiated",
  "amount": 1
}

4. Check Razorpay Dashboard:
   - Payouts section → should show "pout_1234567890" with ₹1

5. Monitor webhook:
   - Status should change: initiated → processing → processed
   - WhatsApp alert sent to phone


STEP 4: Wire Real Payment Flow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File: src/components/UPIPaymentFlow.jsx

Already configured! Just ensure:
  - Line 5: useRealPayment = true (default)
  - Backend /api/payout/create endpoint working
  - .env.local has Razorpay credentials

When user triggers payout:
  1. Frontend calls POST /api/payout/create
  2. Backend creates Razorpay payout
  3. Shows progress: Verified → Routing → Banking → Credited
  4. Webhook confirms → Supabase updated
  5. WhatsApp: "Your payout of ₹XXX completed" ✓


STEP 5: Monitor Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Razorpay Dashboard:
  - Payouts section: Track all transfers
  - Webhooks section: Verify events received
  - Logs: Debug any failed payouts

Supabase Dashboard:
  - payouts table: Check payout_id, status, amount
  - notifications table: Verify WhatsApp sent

App Dashboard (localhost:5175):
  - Click "Simulate disruption trigger"
  - Observe payout flow animation
  - See "Payout processed" confirmation


TEST SCENARIOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Test 1: Minimum Payout (₹100)
  Amount: 100
  Expected: Processes successfully

✓ Test 2: Standard Payout (₹420)
  Amount: 420
  Expected: Matches selected tier max

✓ Test 3: Invalid Amount (₹50)
  Amount: 50
  Expected: Error "Amount must be at least ₹100"

✓ Test 4: Missing Phone
  Phone: (empty)
  Expected: Uses dummy@okhdfcbank for test

✓ Test 5: WhatsApp Notification
  After payout: Check phone for WhatsApp message
  Expected: "Your GigShield payout of ₹XXX has been processed!"


TROUBLESHOOTING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Error: "Invalid API key"
✓ Solution: 
  - Check KEY_ID/SECRET in Razorpay Dashboard
  - Paste exact values into .env.local
  - Restart servers (npm run dev)

❌ Error: "Fund account not created"
✓ Solution:
  - Check UPI address format: must be valid@bank
  - Try dummy@okhdfcbank (test)
  - For real: use actual UPI like 9876543210@paytm

❌ Error: "Payout limit exceeded"
✓ Solution:
  - Test account limited to ₹5,000/day
  - After production approval, no limits

❌ Webhook not received
✓ Solution:
  - Add webhook URL in Dashboard → Settings → Webhooks
  - Format: https://yourdomain.com/api/payout/webhook
  - Test localhost: Use ngrok tunnel
    $ ngrok http 3000
    Add: https://xxxxx.ngrok.io/api/payout/webhook

❌ WhatsApp message not sent
✓ Solution:
  - Check TWILIO credentials in .env
  - Sandbox mode: only approved numbers get messages
  - Check Twilio logs for error


RAZORPAY TEST ACCOUNT INFO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test UPI:
  - Address: dummy@okhdfcbank
  - Balance: Unlimited (test mode)

Test Bank Account:
  - IFSC: HDFC0000123
  - Account: 1121220061746170
  - Bank: HDFC
  - Name: Test
  - Routing: Instant (NEFT)

Limits:
  - Max per payout: ₹5,000 (test account)
  - Daily limit: ₹25,000 (test account)
  - Production: No limits


NEXT STEPS (After Testing):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ✓ Get Razorpay credentials
2. ✓ Test ₹1 payout
3. ✓ Verify WhatsApp notification
4. → Deploy backend to production (Heroku/Railway)
5. → Update VITE_API_URL to production endpoint
6. → Request Razorpay live mode activation
7. → Update live credentials in production .env
8. → Test full flow with real money (₹1 first)
9. → Go live! 🚀

*/
