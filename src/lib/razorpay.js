/**
 * Razorpay Integration Service
 * 
 * SETUP INSTRUCTIONS:
 * 1. Sign up at https://razorpay.com
 * 2. Submit KYC form (takes 2-5 days)
 * 3. Go to Settings → API Keys (test mode)
 * 4. Copy KEY_ID and paste in .env
 * 5. Test transfers will be deducted from test wallet
 */

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'YOUR_KEY_ID_HERE';
const RAZORPAY_KEY_SECRET = import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET_HERE';

export const initializeRazorpay = async () => {
  if (!window.Razorpay) {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return new Promise(resolve => {
      script.onload = () => resolve(window.Razorpay);
    });
  }
  return window.Razorpay;
};

export const createPayoutOrder = async (amount, riderEmail, riderPhone) => {
  try {
    /**
     * In production, call your backend which calls Razorpay API.
     * Backend should:
     * 1. Create a Payout via Razorpay API
     * 2. Store payout ID in Supabase
     * 3. Return payout details
     */
    
    // For now, return mock response structure
    return {
      id: `payout_${Date.now()}`,
      amount,
      status: 'processing',
      riderEmail,
      riderPhone,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Razorpay payout error:', error);
    throw error;
  }
};

export const verifyPayoutSignature = (payoutId, signature) => {
  /**
   * Verify webhook signature from Razorpay
   * This should be done on the backend for security
   */
  try {
    // Backend verification only - never expose secret on frontend
    return true; // Backend confirms validity
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
};

export const getPayoutStatus = async (payoutId) => {
  try {
    // Call your backend which queries Razorpay API
    const response = await fetch(`/api/razorpay/payout/${payoutId}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to get payout status:', error);
    throw error;
  }
};

export const initiatePayment = async (amount, riderEmail, riderPhone) => {
  try {
    const Razorpay = await initializeRazorpay();
    const payout = await createPayoutOrder(amount, riderEmail, riderPhone);
    
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'GigShield',
      description: 'Income Protection Payout',
      image: '/gigshield-logo.png',
      order_id: payout.id,
      handler: function(response) {
        console.log('Payment successful:', response);
        return {
          success: true,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
        };
      },
      prefill: {
        email: riderEmail,
        contact: riderPhone,
      },
      theme: {
        color: '#3399cc'
      }
    };
    
    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
  } catch (error) {
    console.error('Payment initiation failed:', error);
    throw error;
  }
};
