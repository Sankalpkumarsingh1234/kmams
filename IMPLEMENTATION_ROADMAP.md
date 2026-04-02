# GigShield Implementation Roadmap

## 📋 Overview
Complete implementation plan for GigShield app including payment integration, WhatsApp notifications, mobile optimization, internationalization, and UI polishing.

---

## 🔴 PHASE 1: Backend Setup & Payment Integration (Days 1-7)

### Day 1: Service Registration & Sandbox Setup
**STATUS: Critical - Must complete before Days 2-3**

#### Razorpay Setup
- [ ] Go to [razorpay.com](https://razorpay.com)
- [ ] Sign up with Email/Phone
- [ ] Complete KYC Form submission (Business details, documents)
  - ⏱️ **Note**: Takes 2-5 days for approval
  - 🚀 Can proceed with **Test Mode** while waiting for approval
- [ ] Get Test Keys from Dashboard → Settings → API Keys
  - Copy `Key ID` (starts with `rzp_test_`)
  - Copy `Key Secret`
- [ ] Add to `.env`:
  ```
  RAZORPAY_KEY_ID=rzp_test_xxxxx
  RAZORPAY_KEY_SECRET=xxxxx
  ```

#### Twilio WhatsApp Setup
- [ ] Go to [twilio.com](https://www.twilio.com)
- [ ] Sign up with Email
- [ ] Go to Console → Messaging → Try it out
- [ ] Send a test WhatsApp message
- [ ] Get Sandbox Number
  - Note the sandbox phone number (like `+1415xxx`)
  - Get your test credentials
- [ ] Add to `.env`:
  ```
  TWILIO_ACCOUNT_SID=ACxxxxx
  TWILIO_AUTH_TOKEN=xxxxx
  TWILIO_WHATSAPP_NUMBER=whatsapp:+14xxxxx
  ```

**Deliverable**: `.env` file with all test credentials

---

### Days 2-3: Integrate Razorpay Payment Flow
**Files to Modify**:
- `src/lib/razorpay.js` (Payment initialization)
- `src/components/payment/UPIPaymentFlow.jsx` (Payment UI)
- `server/api/payment/create-order.js` (Order creation)
- `server/api/payment/verify.js` (Payment verification)

#### Steps
1. **Replace Fake Animation with Real Payment Call**
   - Open `src/components/payment/UPIPaymentFlow.jsx`
   - Remove dummy `setTimeout()` animations
   - Implement real Razorpay payment sequence:
     ```javascript
     const handlePayment = async () => {
       try {
         const orderRes = await fetch('/api/payment/create-order', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ 
             amount: paymentAmount * 100, // In paise
             userId: currentUser.id 
           })
         });
         const { order } = await orderRes.json();
         
         const options = {
           key: process.env.VITE_RAZORPAY_KEY_ID,
           order_id: order.id,
           handler: verifyPayment,
           // ... more options
         };
         
         const razorpay = new window.Razorpay(options);
         razorpay.open();
       } catch (error) {
         console.error('Payment error:', error);
       }
     };
     ```

2. **Update `server/api/payment/create-order.js`**
   - Ensure it creates Razorpay orders properly
   - Stores order details in `payments` table
   - Returns order object to frontend

3. **Update `server/api/payment/verify.js`**
   - Verify Razorpay signature using `crypto`
   - Update payment status in database to `'success'`
   - Return success response to frontend

4. **Test in Sandbox**
   - Use Razorpay test card: `4111 1111 1111 1111`
   - Expiry: any future date
   - CVV: any 3 digits
   - Test a ₹1 transfer (100 paise)
   - Verify payment appears in `payments` table

**Deliverable**: Working payment flow in sandbox mode

---

### Days 4-5: Build WhatsApp Notification System
**Files to Modify**:
- `server/services/twilio-whatsapp.js` (WhatsApp service)
- `server/api/payout/create.js` (Payout initiation)

#### Steps
1. **Create WhatsApp Service** (`server/services/twilio-whatsapp.js`)
   ```javascript
   const twilio = require('twilio');
   
   const client = twilio(
     process.env.TWILIO_ACCOUNT_SID,
     process.env.TWILIO_AUTH_TOKEN
   );
   
   async function sendPayoutNotification(phoneNumber, amount, referenceId) {
     await client.messages.create({
       from: process.env.TWILIO_WHATSAPP_NUMBER,
       to: `whatsapp:${phoneNumber}`,
       body: `Your GigShield payout of ₹${amount} has been sent. Ref: ${referenceId}`
     });
   }
   ```

2. **Integrate into Payout Flow**
   - When payout is triggered in `server/api/payout/create.js`
   - Call `sendPayoutNotification()` with rider's phone
   - Pass amount and transaction reference

3. **Test with Sandbox**
   - Trigger a payout
   - Verify WhatsApp message arrives to your number

**Deliverable**: WhatsApp notifications working for payouts

---

### Days 6-7: Connect Payout Webhook & Database Integration
**Files to Modify**:
- `server/api/webhooks/razorpay-payout.js` (Webhook handler)
- `schema.sql` (Database updates if needed)

#### Steps
1. **Create Webhook Handler** (`server/api/webhooks/razorpay-payout.js`)
   ```javascript
   router.post('/razorpay-payout', async (req, res) => {
     const { event, payload } = req.body;
     
     if (event === 'payout.processed') {
       const { id, amount, receipt } = payload.payout.entity;
       
       // Get reference ID to find claim in DB
       const { data } = await supabase
         .from('claims')
         .update({ 
           payout_status: 'completed',
           razorpay_payout_id: id,
           updated_at: new Date()
         })
         .eq('razorpay_payout_id', receipt);
       
       // Send WhatsApp notification
       await sendPayoutNotification(data[0].rider_phone, amount / 100, id);
       
       res.json({ ok: true });
     }
   });
   ```

2. **Update Supabase Schema**
   - Ensure `claims` table has columns:
     - `payout_status` (enum: pending, processing, completed, failed)
     - `razorpay_payout_id` (text)
     - `razorpay_order_id` (text)
     - `updated_at` (timestamp)

3. **Configure Webhook in Razorpay**
   - Razorpay Dashboard → Settings → Webhooks
   - Add endpoint: `https://your-backend.com/api/webhooks/razorpay-payout`
   - Subscribe to: `payout.processed`, `payout.failed`
   - Set API key in header

4. **Test End-to-End**
   - Trigger payout → Database updates → WhatsApp sent
   - Verify all three steps complete

**Deliverable**: Full payout workflow automated with notifications

---

## 🟡 PHASE 2: Frontend Mobile & UX (Days 1-12)

### Day 1: Mobile Testing Audit
**File**: `src/utils/responsive.js`

#### Steps
1. **Test on Physical Android Phone (or Chrome DevTools)**
   - Open app in Chrome Mobile DevTools (F12 → Toggle Device)
   - Test on Android Chrome specifically
   - **List all broken/cramped items**:
     - [ ] Button sizes too small to tap
     - [ ] Text overflow on small screens
     - [ ] Card padding crushing content
     - [ ] Images not responsive
     - [ ] Modals don't fit viewport
     - [ ] Navigation menu unreadable
     - [ ] Font sizes unreadable

2. **Document Issues**
   - Create `MOBILE_ISSUES.md` in project root
   - List each issue with:
     - Component name
     - Screen size where it breaks
     - Current vs. desired behavior

**Deliverable**: Documented list of mobile issues

---

### Days 2-3: Mobile Responsiveness Fixes
**Files to Modify**:
- `src/components/*.jsx` (All components)
- `src/utils/responsive.js` (Responsive helpers)
- `App.css` (Global styles)

#### Steps
1. **Fix Card Sizing**
   - Current: `maxWidth: 440px` ✓ (Keep this)
   - Add mobile breakpoints:
     ```css
     @media (max-width: 480px) {
       .card {
         padding: 12px; /* was 24px */
         margin: 8px;   /* was 16px */
       }
       .card-title {
         font-size: 16px; /* was 20px */
       }
     }
     ```

2. **Fix Button Sizing**
   - Min touch target: 44x44px (iOS), 48x48px (Android)
   - Update buttons to have `padding: 12px 24px` on mobile

3. **Fix Font Sizes**
   - Body text: 14px on mobile (was 16px)
   - Headings: Scale down proportionally
   - Use `responsive.js` for media queries

4. **Fix Images & Assets**
   - Add `max-width: 100%` to all images
   - Use responsive image techniques (CSS aspect-ratio)

5. **Test on Android Chrome**
   - Verify all components readable at 375px width
   - Test touch interactions are easy
   - Check landscape mode

**Deliverable**: App looks good on mobile devices

---

### Days 4-5: Hindi Language Toggle
**Files to Create/Modify**:
- `src/i18n/LanguageContext.jsx` (Already exists - enhance)
- `src/i18n/translations.js` (Already exists - add Hindi)
- `src/components/OnboardingScreen.jsx`
- `src/components/auth/LoginModal.jsx`
- `src/components/DashboardScreen.jsx`

#### Steps
1. **Enhance LanguageContext**
   ```javascript
   // src/i18n/LanguageContext.jsx
   import React, { createContext, useState } from 'react';
   
   export const LanguageContext = createContext();
   
   export function LanguageProvider({ children }) {
     const [language, setLanguage] = useState('en');
     
     const toggleLanguage = () => {
       setLanguage(lang => lang === 'en' ? 'hi' : 'en');
     };
     
     return (
       <LanguageContext.Provider value={{ language, toggleLanguage }}>
         {children}
       </LanguageContext.Provider>
     );
   }
   ```

2. **Add Hindi Translations**
   ```javascript
   // src/i18n/translations.js
   export const translations = {
     en: {
       // Onboarding
       'onboarding.welcome': 'Welcome to GigShield',
       'onboarding.subtitle': 'Insurance for delivery workers',
       'onboarding.getStarted': 'Get Started',
       
       // Auth
       'auth.login': 'Login',
       'auth.register': 'Register',
       'auth.email': 'Email',
       'auth.password': 'Password',
       'auth.forgotPassword': 'Forgot Password?',
       
       // Dashboard
       'dashboard.claims': 'My Claims',
       'dashboard.payout': 'Request Payout',
       'dashboard.coverage': 'Coverage',
     },
     hi: {
       // Onboarding
       'onboarding.welcome': 'GigShield में आपका स्वागत है',
       'onboarding.subtitle': 'डिलीवरी कर्मचारियों के लिए बीमा',
       'onboarding.getStarted': 'शुरू करें',
       
       // Auth
       'auth.login': 'लॉगिन',
       'auth.register': 'पंजीकरण',
       'auth.email': 'ईमेल',
       'auth.password': 'पासवर्ड',
       'auth.forgotPassword': 'पासवर्ड भूल गए?',
       
       // Dashboard
       'dashboard.claims': 'मेरे दावे',
       'dashboard.payout': 'भुगतान का अनुरोध करें',
       'dashboard.coverage': 'कवरेज',
     }
   };
   ```

3. **Add Language Toggle Button**
   - Add in header: `<button onClick={toggleLanguage}>EN | HI</button>`
   - Style to show current language highlighted

4. **Translate Key Screens** (Priority Order)
   - Onboarding flow
   - Auth (Login/Register)
   - Dashboard headers
   - Button labels
   - Error messages

5. **Create useTranslation Hook**
   ```javascript
   export function useTranslation() {
     const { language } = useContext(LanguageContext);
     
     const t = (key) => {
       const parts = key.split('.');
       let current = translations[language];
       for (const part of parts) {
         current = current?.[part];
       }
       return current || key;
     };
     
     return { t };
   }
   ```

**Deliverable**: App supports both English and Hindi

---

### Days 6-7: Insurer Dashboard Polish
**Files to Modify**:
- `src/components/InsurerDashboard.jsx`
- `src/components/FraudScoreVisualiser.jsx`
- `App.css`

#### Steps
1. **Fraud Score Cards Redesign**
   - Current: Plain cards with numbers
   - New: 
     - Add color gradients (Green: low risk, Red: high risk)
     - Add small sparkline charts
     - Add trend indicator (↑ ↓ →)
     - Better typography

2. **Add Chart to Forecast Tab**
   - Use Chart.js (already in project)
   - Show payout forecast over next 7 days
   - X-axis: Days
   - Y-axis: Amount in ₹
   - Example data:
     ```javascript
     const chartData = {
       labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
       datasets: [{
         label: 'Expected Payouts',
         data: [1200, 1400, 1000, 1800, 2000, 1600, 1900],
         borderColor: '#4CAF50',
         backgroundColor: 'rgba(76, 175, 80, 0.1)',
       }]
     };
     ```

3. **Add Stats Summary Cards**
   - Total claims this month
   - Fraud detection rate
   - Average payout time
   - Customer satisfaction score

**Deliverable**: Professional-looking insurer dashboard

---

### Days 8-9: Onboarding Animation Pass
**Files to Modify**:
- `src/components/OnboardingScreen.jsx`
- `src/utils/animations.js`

#### Steps
1. **Create Smooth Transitions**
   - Add fade + slide animations between steps
   - Duration: 300-400ms
   - Easing: `ease-in-out`

2. **Add CSS Keyframes** (in `App.css`)
   ```css
   @keyframes fadeSlideIn {
     from {
       opacity: 0;
       transform: translateX(20px);
     }
     to {
       opacity: 1;
       transform: translateX(0);
     }
   }
   
   @keyframes fadeSlideOut {
     from {
       opacity: 1;
       transform: translateX(0);
     }
     to {
       opacity: 0;
       transform: translateX(-20px);
     }
   }
   ```

3. **Update Step Transitions**
   - Current: Instant step change
   - New: 
     - Step exit with fadeSlideOut
     - Delay 150ms
     - Step enter with fadeSlideIn
   - Use `useState` to track animation state

4. **Add Progress Bar Animation**
   - Smooth width transition as user progresses
   - Duration: 500ms

**Deliverable**: Smooth, professional transitions between onboarding steps

---

### Day 10: Demo Screen Recording
**Deliverable**: 90-second perfect screen recording

#### Steps
1. **Prepare Demo Flow**
   - Fresh user signup → Complete onboarding → Policy selection → Payment → Dashboard
   - Keep pacing: ~12-15 seconds per step

2. **Record on Desktop**
   - Use OBS Studio or similar
   - Fullscreen app (1920x1080)
   - No system notifications
   - Clean desktop
   - Audio: Optional (or soft background music)

3. **Recording Checklist**
   - ✓ App loads instantly
   - ✓ Onboarding animations smooth
   - ✓ Payment flow works
   - ✓ Dashboard displays correctly
   - ✓ No errors in console
   - ✓ All text readable

4. **Save & Backup**
   - Save as: `demo_flow_backup.mp4`
   - Store in project `public/` folder
   - Test playback on demo day

**Deliverable**: `public/demo_flow_backup.mp4` ready for fallback

---

### Days 11-12: Final UI Review & Polish
**Files to Review/Modify**:
- All `.jsx` components
- `App.css`
- Responsive utilities

#### Checklist
- [ ] **Colors & Contrast**
  - All text meets WCAG AA standard (4.5:1 ratio)
  - Brand colors applied consistently
  
- [ ] **Typography**
  - Font sizes follow hierarchy
  - Line spacing appropriate (1.4-1.6)
  - Font weights varied for emphasis
  
- [ ] **Spacing**
  - Consistent padding (8px, 16px, 24px grid)
  - Consistent margin (8px, 16px, 24px grid)
  - White space used effectively
  
- [ ] **Components**
  - All buttons have hover states
  - All interactive elements have clear focus states
  - Loading states visible
  - Error states clear
  
- [ ] **Mobile**
  - Test on 3 devices minimum
  - Portrait and landscape modes
  - Touch interactions responsive
  
- [ ] **Demo Screen**
  - Resolution matches projector (1920x1080)
  - Font sizes readable from 10 feet away
  - Colors work on projection
  - No glare/contrast issues

**Deliverable**: Production-ready app for demo

---

## 📊 Implementation Status Dashboard

| Phase | Task | Status | Priority |
|-------|------|--------|----------|
| 1 | Razorpay KYC & sandbox setup | ⚪ Not Started | 🔴 Critical |
| 1 | Twilio WhatsApp sandbox setup | ⚪ Not Started | 🔴 Critical |
| 1 | Razorpay payment integration | ⚪ Not Started | 🔴 Critical |
| 1 | WhatsApp notification system | ⚪ Not Started | 🟡 High |
| 1 | Webhook integration & DB sync | ⚪ Not Started | 🟡 High |
| 2 | Mobile testing audit | ⚪ Not Started | 🔴 Critical |
| 2 | Mobile responsiveness fixes | ⚪ Not Started | 🔴 Critical |
| 2 | Hindi language support | ⚪ Not Started | 🟡 High |
| 2 | Dashboard polish | ⚪ Not Started | 🟡 High |
| 2 | Onboarding animations | ⚪ Not Started | 🟡 High |
| 2 | Demo recording | ⚪ Not Started | 🟡 High |
| 2 | Final polish & review | ⚪ Not Started | 🟡 High |

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start frontend dev server
npm run dev

# Start backend
cd server && node index.js

# View database schema
cat schema.sql

# Run in production mode (after build)
npm run build
npm run preview
```

---

## 📝 Environment Template

```env
# Frontend (Vite)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx

# Backend
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14xxxxx
```

---

**Last Updated**: April 1, 2026  
**Version**: 1.0  
**Next Review**: After Phase 1 completion
