# GigShield Backend Setup Guide

## Overview

All authentication, registration, and payment processing flows for your Vite frontend are integrated here. This backend connects to Supabase and Razorpay.

## Files Structure

```
server/
├── index.js                    # Express.js entry point
├── api/
│   ├── auth/
│   │   ├── register.js         # User registration handler
│   │   ├── login.js            # User login handler
│   │   └── logout.js           # User logout handler
│   └── payment/
│       ├── create-order.js     # Razorpay order creation
│       └── verify.js           # Razorpay payment verification
```

## Installation

### 1. Install Dependencies

```bash
npm install express cors dotenv razorpay @supabase/supabase-js
```

### 2. Update .env

Copy from `.env.example` and fill in your credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
PORT=5000
```

### 3. Setup Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL in `schema.sql` in your Supabase SQL Editor
4. Copy your API keys from Project Settings → API

### 4. Setup Razorpay

1. Create account at [razorpay.com](https://razorpay.com)
2. Go to Settings → API Keys
3. Copy your Test mode keys (for development)
4. Add them to .env

## Running the Server

```bash
node server/index.js
```

Server will run at `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Payments

- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify Razorpay payment

All endpoints require `Authorization: Bearer <token>` header (except register/login).

## Frontend Integration

Your frontend already has `src/lib/auth.js` and `src/lib/razorpay.js` configured to:
- Call `/api/auth/*` routes for authentication
- Call `/api/payment/*` routes for payments

Just make sure your frontend's `fetch()` calls point to this backend URL.

## Deployment Tips

- Use environment variables for production URLs
- Never commit `.env` to git
- Use Razorpay Live keys only in production
- Enable row-level security (RLS) in Supabase for production

## Troubleshooting

**"Supabase connection failed"**
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct
- Verify Supabase URL format

**"Razorpay payment failed"**
- Make sure you're using Test keys (rzp_test_*)
- Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

**"Database error when registering"**
- Run schema.sql in Supabase SQL editor
- Check profiles table exists

## Next Steps

1. Test auth endpoints with Postman or cURL
2. Test payment flow end-to-end
3. Deploy server (Heroku, Railway, Vercel, etc.)
4. Update frontend API URL in production
