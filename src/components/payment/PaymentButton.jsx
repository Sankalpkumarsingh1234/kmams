// src/components/payment/PaymentButton.jsx
// Drop-in payment button — handles the full Razorpay flow

import { useState } from 'react';
import { initiatePayment } from '@/lib/razorpay';

/**
 * Props:
 *  amount      — INR amount (e.g. 299 for ₹299/week)
 *  policyId    — optional: link payment to a policy
 *  tierId      — optional: tier info
 *  description — shown in Razorpay modal
 *  onSuccess   — callback(paymentId) on success
 *  label       — button text (default: "Pay ₹{amount}")
 */
export default function PaymentButton({
  amount,
  policyId,
  tierId,
  description,
  onSuccess,
  label,
  style = {},
}) {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  async function handlePay() {
    setStatus('loading');
    setMessage('');

    await initiatePayment({
      amount,
      policyId,
      tierId,
      description: description || `GigShield Premium — ₹${amount}/week`,
      onSuccess: (paymentId) => {
        setStatus('success');
        setMessage(`Payment successful! ID: ${paymentId}`);
        onSuccess?.(paymentId);
      },
      onFailure: (err) => {
        setStatus('error');
        setMessage(err || 'Payment failed');
      },
    });

    if (status !== 'success') setStatus('idle');
  }

  const btnStyle = {
    background: status === 'success' ? '#15803d' : '#16a34a',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 700,
    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
    opacity: status === 'loading' ? 0.7 : 1,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    ...style,
  };

  return (
    <div>
      <button onClick={handlePay} disabled={status === 'loading'} style={btnStyle}>
        {status === 'loading' && <Spinner />}
        {status === 'success' ? '✅ Paid' : label || `Pay ₹${amount}`}
      </button>

      {status === 'success' && (
        <div style={{ color: '#16a34a', fontSize: 13, marginTop: 8, fontWeight: 600 }}>
          {message}
        </div>
      )}
      {status === 'error' && (
        <div style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>
          ⚠️ {message}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 14, height: 14,
      border: '2px solid rgba(255,255,255,0.4)',
      borderTopColor: '#fff', borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}
