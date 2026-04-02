import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { PINCODE_DATA } from "../data.js";
import StepDots from "./StepDots.jsx";
import Badge from "./Badge.jsx";

function OnboardingScreen({ onNext }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", phone: "", pin: "", platform: "Zomato", earnings: "" });
  const [pinData, setPinData] = useState(null);
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handlePin(val) {
    setForm(f => ({ ...f, pin: val }));
    if (val.length === 6) {
      const data = PINCODE_DATA[val];
      if (data) { setPinData(data); setPinError(""); }
      else { setPinData(null); setPinError(t('pinErrorMessage')); }
    } else { setPinData(null); setPinError(""); }
  }

  const valid = form.name && form.phone && form.pin.length === 6 && form.earnings && !loading;

  const handleCreateUser = async () => {
    if (!valid) return;
    
    setLoading(true);
    setError("");
    try {
      const nfiScore = pinData?.nfi || 55;
      const earningsNum = parseFloat(form.earnings);
      const email = `${form.name.toLowerCase().replace(/\s+/g, "")}@gigshield.work`;

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001 (or deployed backend)'}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: form.name,
          platform: form.platform,
          pin_code: form.pin,
          earnings_weekly: earningsNum,
          nfi_score: nfiScore,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem('userId', data.id);
      localStorage.setItem('userName', form.name);
      localStorage.setItem('userPhone', form.phone);
      localStorage.setItem('userPin', form.pin);
      localStorage.setItem('nfiScore', nfiScore);
      
      onNext({ ...form, nfiScore, pinData: pinData || { nfi: nfiScore, city: "Your city", zone: "Area", reason: "Average risk" } });
    } catch (err) {
      console.error('Failed to create user:', err);
      setError(err.message || 'Failed to create user. Please check if backend is running on localhost:3001 (or deployed backend)');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <div style={{ marginBottom: 6 }}><Badge text="Step 1 of 4" /></div>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, margin: "8px 0 4px", color: "#1A1512" }}>{t('title')}</h2>
      <p style={{ fontSize: 14, color: "#6B6258", marginBottom: 24 }}>{t('subtitle')}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label style={labelStyle}>
          <span style={labelText}>{t('yourName')}</span>
          <input style={inputStyle} placeholder="e.g. Ravi Kumar" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </label>
        <label style={labelStyle}>
          <span style={labelText}>WhatsApp Number</span>
          <input style={inputStyle} placeholder="e.g. +919369889575" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <div style={{ fontSize: 12, color: "#6B6258", marginTop: 6 }}>Include +91 for India</div>
        </label>
        <label style={labelStyle}>
          <span style={labelText}>{t('platform')}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {["Zomato", "Swiggy"].map(p => (
              <button key={p} onClick={() => setForm(f => ({ ...f, platform: p }))} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid", borderColor: form.platform === p ? "#FF6B35" : "#E0D9D0", background: form.platform === p ? "#FFF0EB" : "#FAFAF8", color: form.platform === p ? "#FF6B35" : "#6B6258", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>{p}</button>
            ))}
          </div>
        </label>
        <label style={labelStyle}>
          <span style={labelText}>{t('operatingPin')}</span>
          <input style={inputStyle} placeholder="e.g. 600001" maxLength={6} value={form.pin} onChange={e => handlePin(e.target.value.replace(/\D/g, ""))} />
          {pinData && <div style={{ marginTop: 6, padding: "8px 12px", background: "#E8F5EE", borderRadius: 8, fontSize: 12, color: "#2D6B4A" }}>📍 {pinData.zone}, {pinData.city} — {pinData.reason}</div>}
          {pinError && <div style={{ marginTop: 6, fontSize: 12, color: "#B45309" }}>{pinError}</div>}
        </label>
        <label style={labelStyle}>
          <span style={labelText}>{t('averageEarnings')}</span>
          <input style={inputStyle} placeholder="e.g. 6000" type="number" value={form.earnings} onChange={e => setForm(f => ({ ...f, earnings: e.target.value }))} />
        </label>
      </div>
      {error && <div style={{ marginTop: 16, padding: 12, background: "#FEE2E2", borderRadius: 8, color: "#DC2626", fontSize: 13, border: "1px solid #FECACA" }}>{error}</div>}
      <button onClick={handleCreateUser} disabled={!valid || loading} style={{ ...ctaBtn, opacity: (valid && !loading) ? 1 : 0.45, marginTop: 28 }}>
        {loading ? 'Creating account...' : t('calculateRisk')}
      </button>
    </div>
  );
}

const labelStyle = { display: "flex", flexDirection: "column", gap: 6 };
const labelText = { fontSize: 13, fontWeight: 600, color: "#1A1512" };
const inputStyle = { padding: "11px 14px", borderRadius: 10, border: "1.5px solid #E0D9D0", fontSize: 14, color: "#1A1512", background: "#FAFAF8", outline: "none", fontFamily: "inherit", transition: "border 0.2s" };
const ctaBtn = { width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "#FF6B35", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s", letterSpacing: "0.01em" };

export default OnboardingScreen;