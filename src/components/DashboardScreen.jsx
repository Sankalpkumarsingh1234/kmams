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
  const tierObj = TIERS.find(t => t.id === (tier || "standard"));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stormAlert, setStormAlert] = useState(true);
  const [payout, setPayout] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [showUPI, setShowUPI] = useState(false);
  const [protected_, setProtected] = useState(parseInt(earnings || 6000) * 0.22);
  const [showMenu, setShowMenu] = useState(false);
  const [showInfo, setShowInfo] = useState(null); // 'nfi', 'tier', 'protected'
  const sevColor = { high: "#EF4444", medium: "#F59E0B", low: "#4CAF82" };

  const INFO_CONTENT = {
    nfi: { title: "NFI Risk Score", desc: "Neighborhood Fragility Index. Higher scores mean your area is more prone to flooding and heat stress. Yours is " + (nfi > 65 ? "High" : "Moderate") + "." },
    tier: { title: tierObj.name + " Plan", desc: "Your plan covers " + (tierObj.coverage.join(", ")) + ". Max weekly payout is ₹" + tierObj.max.toLocaleString() + "." },
    protected: { title: "Protected Amount", desc: "The total amount of income GigShield has protected you for this month through automated payouts." }
  };

  // Dynamic dashboard background based on risk
  const dashboardBg = nfi > 75 
    ? "linear-gradient(to bottom, #FFF3CD, #fff 150px)" 
    : "transparent";

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
    <div style={{ position: "relative", minHeight: "100%", background: dashboardBg, transition: "background 0.5s ease", borderRadius: 20 }}>
      {/* Tooltip Modal Overlay */}
      {showInfo && (
        <div onClick={() => setShowInfo(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, maxWidth: 300, boxShadow: "0 10px 25px rgba(0,0,0,0.15)", animation: "slideIn 0.3s ease" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1512", marginBottom: 8 }}>{INFO_CONTENT[showInfo].title}</div>
            <div style={{ fontSize: 13, color: "#6B6258", lineHeight: 1.5, marginBottom: 15 }}>{INFO_CONTENT[showInfo].desc}</div>
            <button style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "#FF6B35", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Got it</button>
          </div>
        </div>
      )}

      {/* Header with menu */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: "#9B9589" }}>{t('welcomeBack')}</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, margin: 0, color: "#1A1512" }}>{name}</h2>
          <div style={{ fontSize: 11, color: "#6B6258", marginTop: 1 }}>{platform} · {pinData?.zone || "Anna Nagar"}, {pinData?.city || "Chennai"}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", background: "#E8F5EE", borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4CAF82", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#2D6B4A" }}>{t('active')}</span>
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowMenu(!showMenu)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E0D9D0", background: showMenu ? "#F5F0EB" : "#FAFAF8", cursor: "pointer", fontSize: 16, padding: 0 }}>⋮</button>
            {showMenu && (
              <div style={{ position: "absolute", top: 40, right: 0, background: "#fff", border: "1px solid #E0D9D0", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", zIndex: 10, minWidth: 160 }}>
                <button onClick={() => { setShowMenu(false); onBack?.(); }} style={{ width: "100%", padding: "10px 12px", border: "none", background: "transparent", textAlign: "left", cursor: "pointer", fontSize: 13, color: "#1A1512", borderBottom: "1px solid #E0D9D0" }}>← Change Policy</button>
                <button onClick={() => { setShowMenu(false); window.location.reload(); }} style={{ width: "100%", padding: "10px 12px", border: "none", background: "transparent", textAlign: "left", cursor: "pointer", fontSize: 13, color: "#EF4444" }}>↻ Restart</button>
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
          {nfi > 75 && (
            <div style={{ padding: "10px 14px", background: "#EF4444", borderRadius: 12, marginBottom: 12, display: "flex", alignItems: "center", gap: 10, color: "#fff", animation: "pulse 2s infinite" }}>
               <div style={{ fontSize: 20 }}>⚠️</div>
               <div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{t('highDisruptionZone')}</div>
                  <div style={{ fontSize: 10, opacity: 0.9 }}>{t('shieldActiveNote')}</div>
               </div>
            </div>
          )}
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
          
          {/* KPI Cards with Interactivity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[
              { id: "protected", label: t('protected'), value: `₹${Math.round(protected_).toLocaleString()}`, sub: t('thisMonth'), color: "#4CAF82" },
              { id: "tier", label: t('premium'), value: `₹${premium}`, sub: tierObj.name, color: "#FF6B35" },
              { id: "nfi", label: t('nfi'), value: nfi, sub: nfi > 65 ? t('highRisk') : t('moderate'), color: nfi > 65 ? "#EF4444" : "#F59E0B" },
            ].map((s, i) => (
              <div key={i} onClick={() => setShowInfo(s.id)} style={{ padding: "10px 8px", background: "#FAFAF8", border: "1px solid #E0D9D0", borderRadius: 12, textAlign: "center", cursor: "help", position: "relative", transition: "transform 0.2s" }} onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"} onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}>
                 <div style={{ position: "absolute", top: 5, right: 6, fontSize: 10, color: "#9B9589" }}>ⓘ</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: "#1A1512", marginTop: 2 }}>{s.label}</div>
                <div style={{ fontSize: 9, color: "#9B9589" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Predictive Income Chart (SVG) */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E0D9D0", padding: "14px", marginBottom: 12, boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                <div>
                   <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>{t('predictedIncome')}</div>
                   <div style={{ fontSize: 10, color: "#9B9589" }}>{t('next7Days')} · {pinData?.city}</div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF82" }} />
                      <span style={{ fontSize: 9 }}>Income</span>
                   </div>
                   <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B35" }} />
                      <span style={{ fontSize: 9 }}>Risk</span>
                   </div>
                </div>
             </div>
             
             <div style={{ width: "100%", height: 100 }}>
                <svg viewBox="0 0 400 100" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                   {[0, 25, 50, 75, 100].map(v => (
                      <line key={v} x1="0" y1={v} x2="400" y2={v} stroke="#FAFAF8" strokeWidth="1" />
                   ))}
                   <path d="M0,80 L60,75 L120,78 L180,30 L240,40 L300,75 L360,70 L400,72" fill="none" stroke="#4CAF82" strokeWidth="3" strokeLinecap="round" />
                   <path d="M0,95 L60,90 L120,85 L180,45 L240,55 L300,85 L360,92 L400,90" fill="none" stroke="#FF6B35" strokeWidth="2" strokeDasharray="4,3" strokeLinecap="round" />
                   <path d="M160,35 L200,38 L240,45 L220,50 L180,45 Z" fill="#E8F5EE" stroke="none" opacity="0.6" />
                   {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                      <text key={day} x={i * 60 + 20} y="115" fontSize="9" fill="#9B9589" textAnchor="middle">{day}</text>
                   ))}
                </svg>
             </div>
             <div style={{ marginTop: 22, paddingTop: 10, borderTop: "1px solid #FAFAF8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 10, color: "#6B6258" }}>{t('shieldFillProb')} <span style={{ fontWeight: 700, color: "#4CAF82" }}>98.4%</span></div>
                <div style={{ fontSize: 10, color: "#FF6B35", fontWeight: 700 }}>{t('highestRiskLabel')}</div>
             </div>
          </div>

          {/* Simulation Button */}
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

          {/* Interactive "Know Your Coverage" Section */}
          <div style={{ padding: "16px", background: "#1A1512", borderRadius: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 10 }}>How your coverage works</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "🌧", title: "Heavy Rain Payout", desc: "Triggered if rainfall exceeds 35mm in your zone." },
                { icon: "🌡", title: "Heat Index Protection", desc: "Paid if Temperature + Humidity index hits 42°C." },
                { icon: "📵", title: "App Outage Cover", desc: "Credits if Swiggy/Zomato stays down for >90 mins." }
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ fontSize: 20 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#FF6B35" }}>{item.title}</div>
                    <div style={{ fontSize: 10, color: "#9B8E84" }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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

      {activeTab === "weather" && <LiveWeatherWidget city={pinData?.city || "Chennai"} />}
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