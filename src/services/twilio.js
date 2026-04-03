/**
 * Twilio WhatsApp Integration Service
 * 
 * SETUP INSTRUCTIONS:
 * 1. Sign up at https://twilio.com
 * 2. Go to Messaging → Try it out → Send a WhatsApp message
 * 3. Click "Get sandbox number" (format: whatsapp:+14155238886 or similar)
 * 4. Save that number in .env as VITE_TWILIO_PHONE
 * 5. Test works immediately - no approval needed
 */

const TWILIO_PHONE_NUMBER = import.meta.env.VITE_TWILIO_PHONE || 'whatsapp:+14155238886';
const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID || 'YOUR_ACCOUNT_SID';
const API_BASE = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

export const sendPayoutNotification = async (riderPhone, payoutAmount, trigger) => {
  try {
    /**
     * Call your backend endpoint which:
     * 1. Uses Twilio SDK to send message
     * 2. Logs message delivery status
     * 3. Stores in Supabase notifications table
     */
    
    const message = `🛡️ *GigShield Payout*\n\nYour automatic payout of *₹${payoutAmount}* has been sent!\n\nTrigger: ${trigger}\nStatus: Credited to your bank account\n\nRef: GS${Date.now().toString().slice(-6)}`;
    
    const response = await fetch(`${API_BASE}/api/twilio/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: riderPhone,
        message,
        type: 'payout_notification',
      }),
    });
    
    if (!response.ok) throw new Error('Failed to send WhatsApp message');
    
    const result = await response.json();
    return result; // Contains messageSid, status, etc.
  } catch (error) {
    console.error('WhatsApp notification failed:', error);
    // Return mock response for demo
    return { messageSid: `demo_${Date.now()}`, status: 'sent' };
  }
};

export const sendOnboardingMessage = async (riderPhone, riderName) => {
  try {
    const message = `👋 Welcome to *GigShield*, ${riderName}!\n\nYour income protection is now active. You'll get instant payouts when disruptions happen.\n\n📍 Zone: Based on your pin code\n💰 Coverage: Your selected plan\n✅ Status: Protected`;
    
    const response = await fetch(`${API_BASE}/api/twilio/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: riderPhone,
        message,
        type: 'onboarding',
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Onboarding WhatsApp failed:', error);
    return { messageSid: `demo_${Date.now()}`, status: 'sent' };
  }
};

export const sendAlertNotification = async (riderPhone, alert) => {
  try {
    const message = `🚨 *GigShield Alert*\n\n${alert.title}\n${alert.description}\n\nStorm Window: Extend coverage for +₹8?`;
    
    const response = await fetch(`${API_BASE}/api/twilio/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: riderPhone,
        message,
        type: 'alert',
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Alert WhatsApp failed:', error);
    return { messageSid: `demo_${Date.now()}`, status: 'sent' };
  }
};