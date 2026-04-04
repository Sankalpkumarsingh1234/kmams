import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { PINCODE_DATA } from "../data.js";
import StepDots from "./StepDots.jsx";
import Badge from "./Badge.jsx";

const API_BASE = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

function OnboardingScreen({ onNext, onLoginClick }) {
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
    const apiUrl = `${API_BASE}/api/users`;
    try {
      const nfi_score = pinData?.nfi || 55; // REVERTED
      const earnings_weekly = parseFloat(form.earnings); // REVERTED
      const email = `${form.name.toLowerCase().replace(/\s+/g, "")}@gigshield.work`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: form.name,
          platform: form.platform,
          pin_code: form.pin,
          earnings_weekly, // REVERTED
          nfi_score,       // REVERTED
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Server error: ${response.status}`);

      localStorage.setItem('userId', data.id);
      localStorage.setItem('userName', form.name);
      localStorage.setItem('userPhone', form.phone);
      localStorage.setItem('userPin', form.pin);
      localStorage.setItem('nfiScore', nfi_score);
      onNext({ ...form, nfiScore: nfi_score, pinData: pinData || { nfi: nfi_score, city: "Your city", zone: "Area", reason: "Average risk" } });
    } catch (err) {
      setError(err.message);
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
          <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </label>
        <label style={labelStyle}>
          <span style={labelText}>WhatsApp Number</span>
          <input style={inputStyle} placeholder="+91..." value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </label>
        <label style={labelStyle}>
          <span style={labelText}>{t('platform')}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {["Zomato", "Swiggy"].map(p => (
              <button key={p} onClick={() => setForm(f => ({ ...f, platform: p }))} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid", borderColor: form.platform === p ? "#FF6B35" : "#E0D9D0", background: form.platform === p ? "#FFF0EB" : "#FAFAF8", color: form.platform === p ? "#FF6B35" : "#6B6258", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>{p}</button>
            ))}
          </div>
        </label>
        <label style={labelStyle}>
          <span style={labelText}>{t('operatingPin')}</span>
          <input style={inputStyle} value={form.pin} maxLength={6} onChange={e => handlePin(e.target.value.replace(/\D/g, ""))} />
          {pinData && <div style={{ marginTop: 6, fontSize: 12, color: "#2D6B4A" }}>📍 {pinData.zone}, {pinData.city}</div>}
        </label>
        <label style={labelStyle}>
          <span style={labelText}>{t('averageEarnings')}</span>
          <input style={inputStyle} type="number" value={form.earnings} onChange={e => setForm(f => ({ ...f, earnings: e.target.value }))} />
        </label>
      </div>
      {error && <div style={{ marginTop: 16, padding: 12, background: "#FEE2E2", borderRadius: 8, color: "#DC2626", fontSize: 13 }}>{error}</div>}
      <button onClick={handleCreateUser} disabled={!valid || loading} style={ctaBtn}>{loading ? 'Creating...' : t('calculateRisk')}</button>
      
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <span style={{ fontSize: 13, color: "#9B9589" }}>Already have an account? </span>
        <button onClick={onLoginClick} style={{ background: "none", border: "none", color: "#FF6B35", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Sign in here</button>
      </div>
    </div>
  );
}

const labelStyle = { display: "flex", flexDirection: "column", gap: 6 };
const labelText = { fontSize: 13, fontWeight: 600, color: "#1A1512" };
const inputStyle = { padding: "11px 14px", borderRadius: 10, border: "1.5px solid #E0D9D0", fontSize: 14, background: "#FAFAF8", outline: "none" };
const ctaBtn = { width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "#FF6B35", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 28 };

export default OnboardingScreen;