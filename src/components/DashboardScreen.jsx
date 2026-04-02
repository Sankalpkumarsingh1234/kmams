import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { DISRUPTION_FEED, TIERS } from "../data.js";
import Badge from "./Badge.jsx";
import LiveWeatherWidget from "./LiveWeatherWidget.jsx";
import AIChatAssistant from "./AIChatAssistant.jsx";
import HeatStressCard from "./HeatStressCard.jsx";
import DisruptionMap from "./DisruptionMap.jsx";
import ClaimsHistory from "./ClaimsHistory.jsx";
import PolicyReceipt from "./PolicyReceipt.jsx";
import WhatsAppScreen from "./WhatsAppScreen.jsx";
import UPIPaymentFlow from "./UPIPaymentFlow.jsx";

const API_BASE = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');


function DashboardScreen({ data, onBack }) {
  const { t } = useLanguage();
  const { name, platform, premium, tier, nfi, pinData, earnings } = data;
  const tierObj = TIERS.find(t => t.id === tier);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stormAlert, setStormAlert] = useState(true);
  const [payout, setPayout] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [showUPI, setShowUPI] = useState(false);
  const [protected_, setProtected] = useState(parseInt(earnings || 6000) * 0.22);
  const [showMenu, setShowMenu] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const sevColor = { high: "#EF4444", medium: "#F59E0B", low: "#4CAF82" };

  // Fetch user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setLoadingData(false);
          return;
        }

        const response = await fetch(`${API_BASE}/api/users/${userId}`);
        if (response.ok) {
          const user = await response.json();
          setUserData(user);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserData();
  }, []);

  function simulateDisruption() {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setShowUPI(true);
    }, 1800);
  }

  function handleUPIComplete() {
    const amount = Math.round(tierObj.max * (0.4 + Math.random() * 0.3));
    setShowUPI(false);
    setPayout({ amount, trigger: "Heavy Rainfall", time: new Date().toLocaleTimeString() });
    setProtected(p => p + amount);
  }

  const tabs = [
    { id: "dashboard", label: t('dashboard') },
    { id: "weather", label: t('liveWeather') },
    { id: "ai", label: t('askAI') },
    { id: "heat", label: t('heatIndex') },
    { id: "map", label: t('riskMap') },
    { id: "claims", label: t('claims') },
    { id: "policy", label: t('policy') },
    { id: "whatsapp", label: t('whatsapp') },
  ];

  return (
    <div>
      {/* Header with menu */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: "#9B9589" }}>{t('welcomeBack')}</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, margin: 0, color: "#1A1512" }}>{name}</h2>
          <div style={{ fontSize: 11, color: "#6B6258", marginTop: 1 }}>{platform} · {pinData.zone}, {pinData.city}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", background: "#E8F5EE", borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4CAF82", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#2D6B4A" }}>{t('active')}</span>
          </div>
          <div style={{ position: "relative" }}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid #E0D9D0",
                background: showMenu ? "#F5F0EB" : "#FAFAF8",
                cursor: "pointer",
                fontSize: 16,
                padding: 0
              }}
            >
              ⋮
            </button>
            {showMenu && (
              <div style={{
                position: "absolute",
                top: 40,
                right: 0,
                background: "#fff",
                border: "1px solid #E0D9D0",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                zIndex: 10,
                minWidth: 160
              }}>
                <button 
                  onClick={() => {
                    setShowMenu(false);
                    onBack?.();
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "none",
                    background: "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#1A1512",
                    borderBottom: "1px solid #E0D9D0",
                    transition: "background 0.2s"
                  }}
                  onMouseOver={(e) => e.target.style.background = "#F5F0EB"}
                  onMouseOut={(e) => e.target.style.background = "transparent"}
                >
                  ← Change Policy
                </button>
                <button 
                  onClick={() => {
                    setShowMenu(false);
                    window.location.reload();
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "none",
                    background: "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#EF4444",
                    transition: "background 0.2s"
                  }}
                  onMouseOver={(e) => e.target.style.background = "#FEE2E2"}
                  onMouseOut={(e) => e.target.style.background = "transparent"}
                >
                  ↻ Restart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "5px 9px", borderRadius: 7, border: "none", background: activeTab === tab.id ? "#1A1512" : "#F5F0EB", color: activeTab === tab.id ? "#fff" : "#6B6258", fontSize: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s", flexShrink: 0 }}>
            {tab.id === "ai" ? "✦ " + tab.label : tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <>
          {stormAlert && (
            <div style={{ padding: "11px 13px", background: "linear-gradient(135deg,#FFF3CD,#FFE4A0)", border: "1.5px solid #F59E0B", borderRadius: 12, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E" }}>{t('stormWindowAlert')}</div>
                <div style={{ fontSize: 11, color: "#78350F", marginTop: 1 }}>{t('heavyRainPredicted')}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setStormAlert(false)} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #D97706", background: "#F59E0B", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+₹8</button>
                <button onClick={() => setStormAlert(false)} style={{ padding: "4px 7px", borderRadius: 8, border: "1px solid #E0D9D0", background: "transparent", color: "#9B9589", fontSize: 11, cursor: "pointer" }}>✕</button>
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[
              { label: t('protected'), value: `₹${Math.round(protected_).toLocaleString()}`, sub: t('thisMonth'), color: "#4CAF82" },
              { label: t('premium'), value: `₹${premium}`, sub: tierObj.name, color: "#FF6B35" },
              { label: t('nfi'), value: nfi, sub: nfi > 65 ? t('highRisk') : t('moderate'), color: nfi > 65 ? "#EF4444" : "#F59E0B" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "10px 8px", background: "#FAFAF8", border: "1px solid #E0D9D0", borderRadius: 12, textAlign: "center" }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: "#1A1512", marginTop: 2 }}>{s.label}</div>
                <div style={{ fontSize: 9, color: "#9B9589" }}>{s.sub}</div>
              </div>
            ))}
          </div>
          {/* UPI flow or simulate button */}
          {showUPI ? (
            <UPIPaymentFlow amount={Math.round(tierObj.max * (0.4 + Math.random() * 0.3))} onComplete={handleUPIComplete} />
          ) : (
            <button onClick={simulateDisruption} disabled={simulating || !!payout} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: simulating ? "#E0D9D0" : payout ? "#E8F5EE" : "#1A1512", color: simulating ? "#6B6258" : payout ? "#2D6B4A" : "#fff", fontSize: 13, fontWeight: 700, cursor: simulating || payout ? "default" : "pointer", marginBottom: 12, transition: "all 0.3s" }}>
              {simulating ? t('detectingDisruption') : payout ? t('payoutProcessed') : t('simulateDisruption')}
            </button>
          )}

          {payout && !showUPI && (
            <div style={{ padding: "14px", background: "#E8F5EE", border: "2px solid #4CAF82", borderRadius: 14, marginBottom: 12, animation: "slideIn 0.4s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#2D6B4A" }}>{t('autoPayoutProcessed')}</div>
                  <div style={{ fontSize: 11, color: "#4A7C5E", marginTop: 2 }}>{t('trigger')}: {payout.trigger} · {payout.time}</div>
                  <div style={{ fontSize: 11, color: "#4A7C5E" }}>{t('upiTransferComplete')}</div>
                </div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#2D6B4A" }}>₹{payout.amount}</div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>{t('liveDisruptionFeed')}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#EF4444", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 10, color: "#9B9589" }}>{t('live')}</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {DISRUPTION_FEED.map(item => (
              <div key={item.id} style={{ display: "flex", gap: 10, padding: "9px 11px", background: "#FAFAF8", border: "1px solid #E0D9D0", borderRadius: 10, alignItems: "center" }}>
                <div style={{ fontSize: 18 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1512" }}>{item.title}</div>
                  <div style={{ fontSize: 10, color: "#6B6258" }}>{item.desc}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Badge text={item.severity} color={sevColor[item.severity]} bg={item.severity === "high" ? "#FEE2E2" : "#FEF3C7"} />
                  <div style={{ fontSize: 9, color: "#9B9589", marginTop: 2 }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "weather" && <LiveWeatherWidget city={pinData.city} />}
      {activeTab === "ai" && <AIChatAssistant userData={data} />}
      {activeTab === "heat" && <HeatStressCard />}
      {activeTab === "map" && <DisruptionMap />}
      {activeTab === "claims" && <ClaimsHistory />}
      {activeTab === "policy" && <PolicyReceipt data={data} />}
      {activeTab === "whatsapp" && <WhatsAppScreen />}
    </div>
  );
}

export default DashboardScreen;