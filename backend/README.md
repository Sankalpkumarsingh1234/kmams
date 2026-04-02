# GigShield Backend Server

Express.js backend for handling Razorpay payouts, Twilio WhatsApp notifications, and Supabase data persistence.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env file in root (copy from .env.example)
cp ../.env.example .env.local

# 3. Add credentials to .env.local:
VITE_RAZORPAY_KEY_ID=key_test_xxxxx
VITE_RAZORPAY_KEY_SECRET=secret_xxxxx
VITE_TWILIO_ACCOUNT_SID=ACxxxxx
VITE_TWILIO_AUTH_TOKEN=authtoken
VITE_TWILIO_PHONE=whatsapp:+14155238886
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# 4. Start server
npm start              # Production
npm run dev           # Development (with auto-reload)
```

Server runs on **http://localhost:3000**

## API Endpoints

### 1. Create Payout
**POST** `/api/payout/create`
```json
{
  "amount": 500,
  "recipientType": "UPI",
  "claimId": "claim_123",
  "userPhone": "919876543210",
  "userName": "Raj Kumar"
}
```
Response:
```json
{
  "success": true,
  "payoutId": "pout_xxxxx",
  "status": "initiated",
  "amount": 500
}
```

### 2. Get Payout Status
**GET** `/api/payout/:payoutId`

Response:
```json
{
  "payoutId": "pout_xxxxx",
  "status": "processed",
  "amount": 500,
  "createdAt": "2024-03-15T10:30:00Z"
}
```

### 3. Send WhatsApp
**POST** `/api/twilio/send-whatsapp`
```json
{
  "phoneNumber": "919876543210",
  "message": "Your payout of ₹500 has been processed!"
}
```
Response:
```json
{
  "success": true,
  "messageSid": "SM_xxxxx"
}
```

### 4. Health Check
**GET** `/health`

Response:
```json
{
  "status": "ok",
  "razorpay": "configured",
  "twilio": "configured",
  "supabase": "configured"
}
```

## Database Schema (Supabase)

### Table: `payouts`
```sql
CREATE TABLE payouts (
  id BIGSERIAL PRIMARY KEY,
  payout_id VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20), -- 'initiated', 'processing', 'processed', 'reversed', 'failed'
  recipient_type VARCHAR(20), -- 'UPI', 'bank_account'
  claim_id VARCHAR(50),
  user_phone VARCHAR(20),
  razorpay_contact_id VARCHAR(50),
  razorpay_fund_account_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);
```

### Table: `notifications`
```sql
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(20), -- 'whatsapp', 'sms', 'email'
  phone VARCHAR(20),
  message TEXT,
  twilio_sid VARCHAR(50),
  status VARCHAR(20), -- 'sent', 'failed', 'pending'
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Test Credentials

**Razorpay Test Mode:**
- API Key: Available after KYC approval at https://dashboard.razorpay.com
- Test UPI: dummy@okhdfcbank
- Test Account: 1121220061746170 (HDFC)

**Twilio Sandbox:**
- Phone: +14155238886 (WhatsApp Sandbox)
- Message: Approve new sender before main deployment

## Webhook Setup

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add Webhook URL: `https://yourdomain.com/api/payout/webhook`
3. Select events: `payout.processed`, `payout.reversed`, `payout.failed`
4. Backend will:
   - Verify webhook signature (implement in production)
   - Update payout status in Supabase
   - Send WhatsApp notification to user

## Deployment

### Heroku
```bash
npm install -g heroku
heroku create gigshield-api
git push heroku main
```

### Railway
```bash
railway link
railway up
```

### DigitalOcean / AWS
- Create Node.js server
- Set environment variables
- pm2 start server.js

## Error Handling

All errors return JSON:
```json
{
  "error": "Error message",
  "details": "Error details"
}
```

Status codes:
- 200: Success
- 400: Bad request (missing fields)
- 500: Server error
