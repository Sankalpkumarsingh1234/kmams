# GigShield 12-Day Roadmap - Complete Setup Guide

## Overview

This document outlines a comprehensive 12-day development roadmap with two parallel tracks:
1. **Backend/Payment Integration** (Days 1-7): Real Razorpay payouts + WhatsApp notifications
2. **Frontend/UX Polish** (Days 1-12): Mobile responsiveness, i18n, animations, and polishing

---

## Part 1: Backend/Payment Integration (Days 1-7)

### Day 1: Third-Party Signups (ACTION REQUIRED)

#### Razorpay Signup
1. Go to **https://razorpay.com**
2. Click **Sign Up** → Create account
3. Complete KYC form submission
   - Name, PAN, Bank account details
   - Address verification
4. **⚠️ NOTE**: KYC approval takes 2-5 business days
5. While waiting, use **Test Mode** (automatically enabled)
   - Test Key ID: `rzp_test_*`
   - Test Secret Key: `rzp_test_*`

**Save these to .env**:
```env
RAZORPAY_KEY_ID=rzp_test_XXXXX
RAZORPAY_KEY_SECRET=rzp_test_XXXXX
```

#### Twilio Signup
1. Go to **https://twilio.com**
2. Click **Sign Up** → Create account
3. Go to **Messaging** → **Try it out**
4. Select **WhatsApp**
5. Click **Send a WhatsApp message**
6. Get your **Sandbox Twilio Number** and **Sandbox Consumer Number**
7. This works **immediately** (no approval needed)

**Save these to .env**:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_WHATSAPP_NUMBER=+14155552671  # Sandbox number
TWILIO_SANDBOX_NUMBER=+91XXXXXXXXXX  # Your test number
```

### Days 2-3: Real Razorpay in UPIPaymentFlow.jsx

#### What's Already Built
- ✅ `server/api/payout/create.js` - Creates real Razorpay payouts
- ✅ `src/components/UPIPaymentFlow.jsx` - Updated with real integration
- ✅ `src/lib/razorpay.js` - Payment utilities

#### What You Need To Do

1. **Update your server/index.js** to include payout endpoints:
```javascript
import { handleCreatePayout } from './api/payout/create.js';

app.post('/api/payout/create', handleCreatePayout);
app.post('/api/webhooks/razorpay-payout', handlePayoutWebhook); // Added
```

2. **Add to package.json** (server):
```json
{
  "dependencies": {
    "razorpay": "^2.8.0",
    "twilio": "^4.10.0"
  }
}
```

3. **Use UPIPaymentFlow with real transfers**:
```jsx
<UPIPaymentFlow 
  amount={420} 
  claimId="claim_123"
  useRealPayment={true}  // ← Enable real transfers
  onComplete={(result) => console.log(result)}
/>
```

#### Test a ₹1 Transfer
```bash
# In your app, trigger:
POST /api/payout/create
{
  "amount": 1,
  "claimId": "test_claim",
  "recipientType": "UPI"
}
```

### Days 4-5: WhatsApp Notifications

#### What's Already Built
- ✅ `server/services/twilio-whatsapp.js` - WhatsApp API wrapper
- ✅ Pre-built message templates for payouts, claims, rejection, OTP

#### What You Need To Do

1. **Use WhatsApp functions in your handlers**:
```javascript
import { sendPayoutNotification } from '../services/twilio-whatsapp.js';

// When payout succeeds:
await sendPayoutNotification(userPhone, {
  amount: 420,
  reference: payoutId,
  timestamp: new Date().toISOString()
});
```

2. **Update claims table schema** to add:
- `whatsapp_notification_sent` (boolean)
- `whatsapp_sid` (Twilio message ID)

3. **Test WhatsApp sending**:
```bash
POST http://localhost:5000/api/test/whatsapp
{
  "phone": "+91YOUR_PHONE",
  "message": "Test message from GigShield"
}
```

### Days 6-7: Payout Webhook Integration

#### What's Already Built
- ✅ `server/api/webhooks/razorpay-payout.js` - Webhook handler
- ✅ Automatic WhatsApp notifications on payout completion
- ✅ Database updates on webhook events

#### What You Need To Do

1. **Register webhook in Razorpay Dashboard**:
   - Settings → Webhooks → Add New Webhook
   - URL: `https://your-backend.com/webhooks/razorpay-payout`
   - Events: `payout.processed`, `payout.failed`, `payout.rejected`
   - Secret: Copy from webhook registration

2. **Add webhook route to server**:
```javascript
import { handlePayoutWebhook } from './api/webhooks/razorpay-payout.js';

app.post('/webhooks/razorpay-payout', handlePayoutWebhook);
```

3. **Database schema updates** needed:
```sql
-- Add to Supabase
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  razorpay_payout_id TEXT NOT NULL UNIQUE,
  amount NUMERIC(10, 2),
  status TEXT DEFAULT 'initiated',
  claim_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending',
  amount NUMERIC(10, 2),
  payout_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Part 2: Frontend/UX Polish (Days 1-12)

### Day 1: Mobile Audit

#### What to Test
1. Open app on **Android Chrome** (primary target)
2. Test in portrait orientation
3. List issues found:
   - Text overflow
   - Button sizes too small
   - Padding too tight
   - Font sizes unreadable
   - Cards too wide
   - Tap targets < 48px

#### Action Items
Document everything in a file called `MOBILE_AUDIT.md`

### Days 2-3: Mobile Responsiveness Fixes

#### What's Already Built
- ✅ `src/utils/responsive.js` - Responsive utilities
- ✅ `src/components/MobileResponsiveWrapper.jsx` - Mobile wrapper
- ✅ Breakpoints: mobile (320px), tablet (640px), desktop (1024px)

#### What You Need To Do

1. **Wrap your main component**:
```jsx
import MobileResponsiveWrapper from './components/MobileResponsiveWrapper';

export default function App() {
  return (
    <MobileResponsiveWrapper>
      <GigShield />
    </MobileResponsiveWrapper>
  );
}
```

2. **Use responsive utilities**:
```jsx
import { isMobile, isTablet, spacing } from './utils/responsive';

const containerPadding = isMobile() ? spacing.sm : spacing.lg;
```

3. **Specific fixes needed**:
- Login form width: 100% on mobile, 440px on desktop
- Button padding: 12px on mobile, 14px on desktop
- Font size for headings: 20px mobile, 24px desktop
- Card padding: 14px mobile, 20px desktop

### Days 4-5: Hindi Language Support

#### What's Already Built
- ✅ `src/i18n/translations.js` - All translations En/Hi
- ✅ `src/i18n/LanguageContext.jsx` - Language context provider
- ✅ `useLanguage()` hook for component access

#### What You Need To Do

1. **Wrap your app with LanguageProvider**:
```jsx
import { LanguageProvider } from './i18n/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <GigShield />
    </LanguageProvider>
  );
}
```

2. **Use translations in components**:
```jsx
import { useLanguage } from './i18n/LanguageContext';

export default function LoginModal() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div>
      <h1>{t('onboarding.welcome')}</h1>
      <button onClick={() => setLanguage('hi')}>हिंदी</button>
    </div>
  );
}
```

3. **Add language toggle** to header:
```jsx
<button 
  onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
  style={{ padding: '4px 8px', fontSize: 12 }}
>
  {language === 'en' ? 'हिंदी' : 'English'}
</button>
```

### Days 6-7: Insurer Dashboard Polish

#### Improvements Needed
1. **Fraud Score Cards**:
   - Add color gradient based on risk
   - Green 0-30%, Yellow 30-70%, Red 70-100%

2. **Chart Integration**:
```jsx
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// Add charts to dashboard
```

3. **Update InsurerDashboard.jsx**:
```jsx
// Add real charts for:
- Claims over time (Line chart)
- Payout distribution (Pie chart)
- Risk score distribution (Bar chart)
```

### Days 8-9: Onboarding Animations

#### What's Already Built
- ✅ `src/utils/animations.js` - All animation utilities
- ✅ Keyframes: slideIn, fadeIn, slideUp, scaleIn, bounce, pulse

#### What You Need To Do

1. **Add fade between screens**:
```jsx
import { getFadeInUpAnimation } from './utils/animations';

// In OnboardingScreen, RiskScreen, etc:
<div style={getFadeInUpAnimation('0.5s', '0.1s')}>
  {/* Content */}
</div>
```

2. **Apply staggered animations to lists**:
```jsx
import { getStaggeredAnimation } from './utils/animations';

{features.map((f, i) => (
  <div key={i} style={getStaggeredAnimation(i, 0.08)}>
    {f}
  </div>
))}
```

3. **Update step transitions**:
```jsx
// In StepDots.jsx - fade between steps
const touchStyle = getFadeInUpAnimation('0.4s', `${stage * 0.05}s`);
```

### Day 10: Demo Video Recording

#### Setup
1. **Screen recording tool**: ShareX (Windows) or QuickTime (Mac)
2. **Phone**: Open on actual device or emulator
3. **Record 90 seconds** showing:
   - 0-15s: App opens → Login
   - 15-30s: Onboarding flow → Risk assessment
   - 30-45s: Policy selection → Payment
   - 45-60s: Dashboard → Claims history
   - 60-75s: Trigger payout → Payout animation
   - 75-90s: Success screen → WhatsApp notification

#### Backup Demo Flow
If live demo fails, this video is your backup.

### Days 11-12: Final Polish

#### Checklist
- [ ] All text responsive on mobile
- [ ] All buttons >= 48px height
- [ ] No horizontal scrolling
- [ ] Hindi translations complete
- [ ] All animations smooth
- [ ] Insurer dashboard charts working
- [ ] Payout WhatsApp working
- [ ] No console errors
- [ ] Tested on Android Chrome
- [ ] Demo video recorded

---

## Files Created/Updated

### Backend
```
server/
├── services/
│   └── twilio-whatsapp.js          ✅ New
├── api/
│   ├── payout/
│   │   └── create.js               ✅ New
│   └── webhooks/
│       └── razorpay-payout.js      ✅ New
└── index.js                         (update routes)
```

### Frontend
```
src/
├── i18n/
│   ├── translations.js             ✅ New
│   └── LanguageContext.jsx         ✅ New
├── utils/
│   ├── animations.js               ✅ New
│   └── responsive.js               ✅ New
├── components/
│   ├── UPIPaymentFlow.jsx          ✅ Updated
│   └── MobileResponsiveWrapper.jsx ✅ New
```

### Configuration
```
.env
├── RAZORPAY_KEY_ID                (fill in)
├── RAZORPAY_KEY_SECRET            (fill in)
├── TWILIO_ACCOUNT_SID             (fill in)
├── TWILIO_AUTH_TOKEN              (fill in)
├── TWILIO_WHATSAPP_NUMBER         (fill in)
```

---

## Testing Checklist

### Backend Testing
- [ ] Razorpay test payout: ₹1
- [ ] WhatsApp message sends
- [ ] Webhook receives payout event
- [ ] Database updates on webhook
- [ ] Claims status updates correctly

### Frontend Testing
- [ ] Mobile: No overflow, all buttons clickable
- [ ] Tablets: Responsive layout
- [ ] Desktop: Full width respected
- [ ] English → Hindi toggle works
- [ ] All animations smooth (60fps)
- [ ] Dashboard charts render
- [ ] WhatsApp notification displays

### Device Testing
- [ ] iPhone (Safari)
- [ ] Android (Chrome) - PRIMARY
- [ ] iPad (portrait & landscape)

---

## Deployment Steps

### Backend Deployment
1. Deploy to Heroku/Railway/Vercel
2. Set environment variables in dashboard
3. Register Razorpay webhook with production URL
4. Test payout with ₹1

### Frontend Deployment
1. Build: `npm run build`
2. Deploy to Vercel/Netlify
3. Update API URL to production backend
4. Test full flow end-to-end

---

## Emergency Checklist (Before Demo)

- [ ] Backend server running
- [ ] All env variables set
- [ ] WhatsApp sandbox configured
- [ ] Test payout works (₹1)
- [ ] App loads without errors
- [ ] Mobile responsive tested
- [ ] Demo video backed up
- [ ] Team briefed on fallback plan

---

## Support & Troubleshooting

### Razorpay Issues
- **"Invalid Account"**: Check RAZORPAY_ACCOUNT_NUMBER in .env
- **"Payout rejected"**: Verify recipient UPI/bank details
- **Webhook not firing**: Check webhook URL is publicly accessible

### Twilio Issues
- **"Invalid credentials"**: Verify TWILIO_ACCOUNT_SID and AUTH_TOKEN
- **"Message not sent"**: Check phone number format (+91XXXXXXXXXX)
- **"Sandbox expired"**: Re-join sandbox in Twilio console

### Mobile Issues
- **Overflow on small phones**: Use `responsive.js` utilities
- **Touch targets too small**: Buttons should be >= 48px
- **Text unreadable**: Use responsive font sizes

---

## Next Phases (After Day 12)

- Phase 2: Push notifications (Firebase Cloud Messaging)
- Phase 3: Offline mode support
- Phase 4: Analytics integration
- Phase 5: Admin dashboard
- Phase 6: AI-powered fraud detection

---

**Total Setup Time**: ~4-6 hours
**Development Time**: ~12 days (1-2 hours/day)
**Go-Live**: Ready for production by Day 12
