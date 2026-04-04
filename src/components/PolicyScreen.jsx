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
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {TIERS.map(tier => {
          const p = calcPremium(tier.base, nfi, seasonal, true);
          const active = selected === tier.id;
          return (
            <div key={tier.id} onClick={() => setSelected(tier.id)} style={{ padding: "14px 16px", borderRadius: 14, cursor: "pointer", border: `2px solid ${active ? tier.color : "#E0D9D0"}`, background: active ? tier.bg : "#FAFAF8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><span style={{ fontWeight: 700, fontSize: 15 }}>{tier.name}</span></div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, color: active ? tier.color : "#1A1512" }}>₹{p}</div>
                  <div style={{ fontSize: 11, color: "#9B9589" }}>{t('perWeek')}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {error && <div style={{ color: "#DC2626", marginBottom: 10 }}>{error}</div>}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} disabled={loading} style={{ ...ctaBtn, background: "#E0D9D0", color: "#1A1512" }}>← Back</button>
        <button onClick={async () => {
          setLoading(true);
          setError("");
          try {
            const userId = localStorage.getItem('userId');
            const tier_data = TIERS.find(t => t.id === selected);
            const response = await fetch(`${API_BASE}/api/policies`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: userId,
                tier: selected,
                premium_weekly: premium, // REVERTED premium -> premium_weekly
                max_payout: tier_data.max,
              }),
            });
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            const policyData = await response.json();
            
            // Record initial premium payment
            await fetch(`${API_BASE}/api/payments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: userId,
                amount: premium,
                platform: data.platform || 'UPI'
              }),
            }).catch(e => console.error("Payment log failed", e));

            localStorage.setItem('policyId', policyData.id || policyData.policy_id);
            onNext({ ...data, tier: selected, premium });
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        }} disabled={loading} style={ctaBtn}>{loading ? 'Activating...' : t('activateMyShield')}</button>
      </div>
    </div>
  );
}

const ctaBtn = { flex: 1, padding: "14px", borderRadius: 12, border: "none", background: "#FF6B35", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" };

export default PolicyScreen;