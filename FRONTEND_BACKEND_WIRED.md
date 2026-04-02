# 🎯 Frontend-Backend Integration Complete!

## What Got Wired ✅

### Components Updated:
1. **OnboardingScreen.jsx** → `POST /api/users`
   - Creates user in Supabase
   - Saves userId to localStorage
   - Shows loading state + error handling

2. **PolicyScreen.jsx** → `POST /api/policies`
   - Creates policy in Supabase
   - Links to user via userId
   - Shows loading state + error handling

3. **DashboardScreen.jsx**
   - Fetches user data on mount
   - Displays live data from backend
   - Shows loading state

### Helper Created:
- **src/api/client.js** - Centralized API client for all calls
  - Has methods for: users, policies, claims, chat, weather, payments
  - Easy to use from any component: `api.createUser(data)`

---

## 🧪 How to Test Full Flow

### Step 1: Start Both Servers

**Terminal 1 - Backend:**
```powershell
cd "C:\Users\renu_\g\vite-project\backend"
node server-simple.js
# Should show: "🚀 GigShield Backend - SIMPLIFIED" + services status
```

**Terminal 2 - Frontend:**
```powershell
cd "C:\Users\renu_\g\vite-project"
npm run dev
# Should show: "VITE v5.x.x  ready in xxx ms"
```

### Step 2: Open App
- Navigate to http://localhost:5175

### Step 3: Fill Onboarding (Step 1 of 4)
```
Name: Test Worker
Platform: Zomato
Pin Code: 560001  (Bangalore)
Weekly Earnings: 8000
```
- Click "Calculate Risk"
- ✅ Should create user in Supabase
- ✅ Should show "Creating account..." while loading
- ✅ Should save userId to localStorage

### Step 4: Select Risk Level (Step 2 of 4)
- Choose any risk level
- Click "Select This Coverage"
- Should move to PolicyScreen

### Step 5: Choose Policy (Step 3 of 4)
```
Select: Standard (₹54/week)
```
- Click "Activate My Shield"
- ✅ Should create policy in Supabase
- ✅ Should show "Activating..." while loading
- ✅ Should save policyId to localStorage

### Step 6: View Dashboard (Step 4 of 4)
- Name, platform, city should display
- Active badge should show
- Menu with "Change Policy" and "Restart" options
- All tabs should be clickable

---

## 🔍 Verify Data Saved

### Check Browser Console:
```javascript
localStorage.getItem('userId')  // Should show UUID
localStorage.getItem('policyId')  // Should show UUID
```

### Check Supabase Dashboard:
1. Go to https://supabase.com → Your Project → SQL Editor
2. Run these queries:

```sql
-- See created users
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;

-- See created policies
SELECT * FROM policies ORDER BY created_at DESC LIMIT 5;

-- See all data for your test user
SELECT 
  u.name, u.platform, u.pin_code, u.earnings_weekly,
  p.tier, p.premium_weekly, p.max_payout
FROM users u
LEFT JOIN policies p ON u.id = p.user_id
ORDER BY u.created_at DESC LIMIT 1;
```

---

## ⚠️ Common Issues & Fixes

### "Failed to create user. Please check if backend is running"
**Fix:**
- Make sure backend is running: `node server-simple.js`
- Backend should be on `localhost:3001`
- Check .env.local has Supabase credentials

### "Server error: 400"
**Fix:**
- Check browser console for detailed error
- Make sure all required fields are sent
- Email might already exist - try different name

### "Server error: 500"
**Fix:**
- Check backend terminal for error message
- Might be Supabase connection issue
- Verify .env.local has correct SUPABASE_URL and KEY

### Page shows nothing/blank screen
**Fix:**
- Check browser console for JavaScript errors
- Run `localStorage.clear()` and restart
- Hard refresh: Ctrl+Shift+R

---

## 📝 Code Examples

### Using API Client in Components:

```javascript
import { api } from '../api/client.js';

// Create user
try {
  const user = await api.createUser({
    email: 'test@example.com',
    name: 'John',
    platform: 'Zomato',
    pin_code: '560001',
    earnings_weekly: 8000,
    nfi_score: 75,
  });
  console.log('User created:', user.id);
} catch (error) {
  console.error('Error:', error.message);
}

// Get user data
const user = await api.getUser(userId);

// Create policy
const policy = await api.createPolicy({
  user_id: userId,
  tier: 'standard',
  premium_weekly: 54,
  max_payout: 25000,
});

// Send chat message
const reply = await api.sendChat(
  'What triggers are covered?',
  { name: 'John', nfiScore: 75, tier: 'standard' }
);
```

---

## 🎬 Next Steps

### Option 1: Test More Features
- [ ] Try different pin codes (600001, 400001, 110001)
- [ ] Try different policy tiers
- [ ] Test "Change Policy" from menu
- [ ] Test "Restart" button

### Option 2: Add More APIs
- [ ] Wire AIChatAssistant to `/api/chat` endpoint
- [ ] Wire weather widget to `/api/triggers/check/:pinCode`
- [ ] Wire claims display to `/api/users/:userId/claims`

### Option 3: Setup Real Supabase
1. Create real Supabase project (5 min)
2. Deploy schema to real project
3. Update .env.local with real credentials
4. Test with real data

### Option 4: Add Optional Features
- [ ] Add Groq API for AI chat
- [ ] Add OpenWeather API for real weather data
- [ ] Add Razorpay for payment flow
- [ ] Add Twilio for WhatsApp notifications

---

## 📊 Current Status

| Component | Status | API Endpoint | Data Saved |
|-----------|--------|--------------|------------|
| OnboardingScreen | ✅ Wired | POST /api/users | userId |
| PolicyScreen | ✅ Wired | POST /api/policies | policyId |
| DashboardScreen | ✅ Loading data | GET /api/users/:id | — |
| RiskScreen | ⏳ Ready | — | — |
| AIChatAssistant | ⏳ Ready | POST /api/chat | — |
| LiveWeatherWidget | ⏳ Ready | POST /api/triggers/check | — |
| ClaimsHistory | ⏳ Ready | GET /api/claims | — |
| UPIPaymentFlow | ⏳ Ready | POST /api/payment | — |

✅ = Works with backend
⏳ = Ready to wire (just need fetch calls)

---

## 🆘 Need Help?

Check these files for reference:
- API calls: `src/api/client.js`
- OnboardingScreen: `src/components/OnboardingScreen.jsx`
- PolicyScreen: `src/components/PolicyScreen.jsx`
- DashboardScreen: `src/components/DashboardScreen.jsx`
- Backend routes: `backend/routes/*.js`

---

## ✨ Summary

**What Works Now:**
- ✅ User registration via form → Supabase
- ✅ Policy creation via form → Supabase
- ✅ Data persistence in localStorage
- ✅ Loading states and error messages
- ✅ Backend API integration complete
- ✅ Full data flow onboarding → dashboard

**What's Next:**
- Wire remaining components to APIs
- Test with real Supabase credentials
- Add optional services (Groq, OpenWeather, Razorpay, Twilio)
- Deploy to production

Ready to test? Follow the **How to Test Full Flow** section above! 🚀
