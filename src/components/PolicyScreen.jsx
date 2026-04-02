import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { TIERS } from "../data.js";
import { calcPremium } from "../utils.js";
import Badge from "./Badge.jsx";

const API_BASE = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');


function PolicyScreen({ data, onNext, onBack }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { nfi, seasonal } = data;
  const tier = TIERS.find(t => t.id === selected);
  const premium = calcPremium(tier.base, nfi, seasonal, true);
  return (
    <div>
      <div style={{ marginBottom: 6 }}><Badge text="Step 3 of 4" /></div>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, margin: "8px 0 4px", color: "#1A1512" }}>{t('chooseYourShield')}</h2>
      <p style={{ fontSize: 14, color: "#6B6258", marginBottom: 20 }}>{t('weeklyPricing')}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {TIERS.map(tier => {
          const p = calcPremium(tier.base, nfi, seasonal, true);
          const active = selected === tier.id;
          return (
            <div key={tier.id} onClick={() => setSelected(tier.id)} style={{ padding: "14px 16px", borderRadius: 14, cursor: "pointer", border: `2px solid ${active ? tier.color : "#E0D9D0"}`, background: active ? tier.bg : "#FAFAF8", transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 15, color: active ? tier.color : "#1A1512" }}>{tier.name}</span>
                  <div style={{ fontSize: 11, color: "#9B9589", marginTop: 2 }}>{tier.coverage.join(" · ")}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: active ? tier.color : "#1A1512" }}>₹{p}</div>
                  <div style={{ fontSize: 11, color: "#9B9589" }}>{t('perWeek')}</div>
                </div>
              </div>
              {active && (
                <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(255,255,255,0.7)", borderRadius: 8 }}>
                  {[[t('basePremium'), `₹${tier.base}`, "#1A1512"], [t('nfiSurcharge'), `+₹${Math.round((nfi / 100) * 12)}`, "#EF4444"], [t('noClaimLoyalty'), `−₹${Math.round(tier.base * 0.12)}`, "#4CAF82"]].map(([label, val, col], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: i > 0 ? 4 : 0 }}>
                      <span style={{ color: "#6B6258" }}>{label}</span>
                      <span style={{ color: col, fontWeight: 600 }}>{val}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4, paddingTop: 6, borderTop: "1px solid #E0D9D0" }}>
                    <span style={{ color: "#1A1512", fontWeight: 700 }}>{t('coverageLabel')}</span>
                    <span style={{ color: tier.color, fontWeight: 700 }}>₹{tier.max.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {error && <div style={{ marginTop: 16, padding: 12, background: "#FEE2E2", borderRadius: 8, color: "#DC2626", fontSize: 13, border: "1px solid #FECACA" }}>{error}</div>}
      <button 
        onClick={onBack}
        disabled={loading}
        style={{ 
          ...ctaBtn, 
          background: "#E0D9D0", 
          color: "#1A1512", 
          marginBottom: 12,
          opacity: loading ? 0.6 : 1
        }}
      >
        ← Back
      </button>
      <button 
        onClick={async () => {
          setLoading(true);
          setError("");
          try {
            const userId = localStorage.getItem('userId');
            const userPhone = localStorage.getItem('userPhone');
            const tier_data = TIERS.find(t => t.id === selected);
            
            const response = await fetch(`${API_BASE}/api/policies`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: userId,
                tier: selected,
                premium_weekly: premium,
                max_payout: tier_data.max,
              }),
            });

            if (!response.ok) {
              throw new Error(`Server error: ${response.status}`);
            }

            const policyData = await response.json();
            localStorage.setItem('policyId', policyData.id || policyData.policy_id);
            localStorage.setItem('policyTier', selected);
            
            // Send WhatsApp notification if phone available (optional - doesn't block policy creation)
            if (userPhone) {
              try {
                const notifRes = await fetch(`${API_BASE}/api/notify/policy-activated`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    phone: userPhone,
                    policyTier: selected,
                    premiumWeekly: premium,
                  }),
                });
                // 503 = Twilio not configured (expected in development), 200 = sent successfully
                if (notifRes.ok || notifRes.status === 503) {
                  console.log('Policy created (WhatsApp notification:', notifRes.status === 200 ? 'sent' : 'pending', ')');
                }
              } catch (whatsappErr) {
                // Network errors are silent - notification is optional
              }
            }
            
            onNext({ ...data, tier: selected, premium });
          } catch (err) {
            console.error('Failed to create policy:', err);
            setError(err.message || 'Failed to create policy. Please check backend.');
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
        style={{ ...ctaBtn, opacity: loading ? 0.6 : 1 }}
      >
        {loading ? 'Activating...' : t('activateMyShield')}
      </button>
    </div>
  );
}

const ctaBtn = { width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "#FF6B35", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s", letterSpacing: "0.01em" };

export default PolicyScreen;