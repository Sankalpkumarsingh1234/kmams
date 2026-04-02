import { useLanguage } from "../i18n/LanguageContext.jsx";
import Badge from "./Badge.jsx";
import NFIGauge from "./NFIGauge.jsx";

function RiskScreen({ data, onNext, onBack }) {
  const { t } = useLanguage();
  const { name, platform, earnings, pinData } = data;
  const nfi = pinData.nfi;
  const seasonal = new Date().getMonth() >= 5 && new Date().getMonth() <= 9 ? 6 : 2;
  const factors = [
    { label: t('zoneRisk'), value: `+₹${Math.round((nfi / 100) * 12)}/wk`, color: nfi > 65 ? "#EF4444" : "#F59E0B" },
    { label: t('seasonalFactor'), value: `+₹${seasonal}/wk`, color: "#F59E0B" },
    { label: t('priorClaimsBonus'), value: "−₹5/wk", color: "#4CAF82" },
    { label: t('platformExposure'), value: t('standardExposure'), color: "#6B6258" },
  ];
  return (
    <div>
      <div style={{ marginBottom: 6 }}><Badge text="Step 2 of 4" /></div>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, margin: "8px 0 4px", color: "#1A1512" }}>{name.split(" ")[0]}{t('riskProfile')}</h2>
      <p style={{ fontSize: 14, color: "#6B6258", marginBottom: 24 }}>{t('basedOnPin')} {pinData.city}.</p>
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1, background: "#FAFAF8", border: "1px solid #E0D9D0", borderRadius: 14, padding: 16 }}>
          <NFIGauge score={nfi} />
        </div>
        <div style={{ flex: 1.4, display: "flex", flexDirection: "column", gap: 8 }}>
          {factors.map((f, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#FAFAF8", border: "1px solid #E0D9D0", borderRadius: 10 }}>
              <span style={{ fontSize: 11, color: "#6B6258" }}>{f.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: f.color }}>{f.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 16px", background: "#FFF8F5", border: "1px solid #FFD4BE", borderRadius: 12, fontSize: 13, color: "#7C3D1F", marginBottom: 24 }}>
        <strong>{pinData.zone}</strong> {t('hadDisruptionDays')} <strong>{Math.round(nfi * 0.4)} {t('disruptions')}</strong> {t('inPast12Months')}. {t('workersLose')} ~<strong>₹{Math.round(parseInt(earnings || 6000) * 0.24)}/month</strong> {t('withoutCoverage')}.
      </div>
      <button 
        onClick={onBack}
        style={{ 
          ...ctaBtn, 
          background: "#E0D9D0", 
          color: "#1A1512", 
          marginBottom: 12,
          opacity: 1
        }}
      >
        ← Back
      </button>
      <button onClick={() => onNext({ ...data, nfi, seasonal })} style={{ ...ctaBtn }}>{t('seeMyPlanOptions')}</button>
    </div>
  );
}

const ctaBtn = { width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "#FF6B35", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s", letterSpacing: "0.01em" };

export default RiskScreen;