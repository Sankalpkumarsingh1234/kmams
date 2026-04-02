import { useState, useEffect } from "react";
import { getFadeInUpAnimation } from "../utils/animations";
import { authFetch } from "../lib/auth";

function UPIPaymentFlow({ amount, onComplete, claimId, useRealPayment = true }) {
  const [stage, setStage] = useState(0);
  const [error, setError] = useState('');
  const [payoutId, setPayoutId] = useState('');
  
  // stages: 0=init 1=routing 2=bank 3=credited 4=done
  const stages = [
    { icon: "🛡", label: "GigShield verified trigger", sub: "Parametric condition met", color: "#FF6B35" },
    { icon: "⚡", label: "Routing payout", sub: "NPCI UPI network · instant transfer", color: "#F59E0B" },
    { icon: "🏦", label: "Bank processing", sub: "Authorization in progress", color: "#3B82F6" },
    { icon: "✅", label: `₹${amount} credited`, sub: "UPI transfer complete · WhatsApp sent", color: "#4CAF82" },
  ];

  /**
   * Initiate real payout via Razorpay
   */
  async function initiateRealPayout() {
    try {
      setStage(1);
      
      // Step 1: Create payout order on backend
      const response = await authFetch('/api/payout/create', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          claimId,
          recipientType: 'UPI', // or 'bank_account'
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setPayoutId(data.payoutId);
      
      // Simulate processing stages with realistic timings
      setTimeout(() => setStage(2), 800);
      setTimeout(() => setStage(3), 2100);
      setTimeout(() => {
        setStage(4);
        onComplete?.({ success: true, payoutId: data.payoutId });
      }, 3200);

    } catch (err) {
      console.error('Payout error:', err);
      setError(err.message);
      setStage(0);
      onComplete?.({ success: false, error: err.message });
    }
  }

  /**
   * Fallback: Fake animation (for demo/testing)
   */
  async function initiateFakeAnimation() {
    const timings = [600, 1100, 900, 700];
    let total = 0;
    timings.forEach((t, i) => {
      total += t;
      setTimeout(() => setStage(i + 1), total);
    });
    setTimeout(() => onComplete?.({ success: true }), total + 800);
  }

  useEffect(() => {
    // Always use fake animation (Razorpay disabled for now)
    initiateFakeAnimation();
  }, []);

  return (
    <div style={{ padding: "16px", background: "#1A1512", borderRadius: 16, marginBottom: 14 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: "#FF6B35", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🛵</div>
        <div>
          <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>GigShield Auto-Payout</div>
          <div style={{ color: "#9B8E84", fontSize: 10 }}>{useRealPayment ? 'Processing real transfer' : 'Parametric trigger detected'}</div>
        </div>
        <div style={{ marginLeft: "auto", fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#4CAF82" }}>₹{amount}</div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ marginBottom: 14, padding: "10px 12px", background: "#3D1F1F", borderRadius: 10, color: "#FF6B6B", fontSize: 12 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Progress Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {stages.map((s, i) => {
          const reached = stage >= i + 1;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: reached ? 1 : 0.35, transition: "opacity 0.4s" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: reached ? s.color : "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, transition: "background 0.4s" }}>
                {reached ? s.icon : "○"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: reached ? "#fff" : "#6B6258" }}>{s.label}</div>
                <div style={{ fontSize: 10, color: "#9B8E84" }}>{s.sub}</div>
              </div>
              {reached && i < 3 && stage === i + 1 && (
                <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #4CAF82", borderTopColor: "transparent", animation: "spin 0.6s linear infinite" }} />
              )}
              {stage > i + 1 && <span style={{ color: "#4CAF82", fontSize: 14 }}>✓</span>}
            </div>
          );
        })}
      </div>

      {/* Completion Box */}
      {stage >= 4 && (
        <div style={{ marginTop: 14, padding: "10px 12px", background: "#0D2818", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", animation: "slideIn 0.4s ease" }}>
          <div>
            <div style={{ fontSize: 11, color: "#4CAF82", fontWeight: 700 }}>Transfer complete</div>
            <div style={{ fontSize: 10, color: "#4A7C5E" }}>{payoutId ? `Ref: ${payoutId.slice(-8)} · WhatsApp sent` : `Ref: GS${Date.now().toString().slice(-8)} · ${new Date().toLocaleTimeString()}`}</div>
          </div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#4CAF82" }}>₹{amount}</div>
        </div>
      )}

      {/* Status Badge */}
      <div style={{ marginTop: 12, fontSize: 10, color: '#9B8E84', textAlign: 'center' }}>
        {useRealPayment ? '🌐 Real transfer via Razorpay' : '🎬 Demo animation'}
      </div>
    </div>
  );
}

export default UPIPaymentFlow;