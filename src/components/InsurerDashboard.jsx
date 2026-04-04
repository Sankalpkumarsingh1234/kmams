import { useState, useEffect } from "react";
import { INSURER_STATS, ZONE_RISK_MAP } from "../data.js";
import FraudScoreVisualiser from "./FraudScoreVisualiser.jsx";
import Badge from "./Badge.jsx";

const API_BASE = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

function InsurerDashboard({ onBack }) {
  const [insurerTab, setInsurerTab] = useState("overview");
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const insurerTabs = [
    { id: "overview", label: "Overview" },
    { id: "claims", label: "📋 Claims" },
    { id: "fraud", label: "🔍 Fraud AI" },
    { id: "zones", label: "Zone Risk" },
    { id: "forecast", label: "Forecast" },
  ];

  const systemStatus = [
    { name: "OpenWeather API", status: "Healthy", latency: "124ms" },
    { name: "Groq AI Service", status: "Healthy", latency: "310ms" },
    { name: "Supabase DB", status: "Healthy", latency: "85ms" },
    { name: "Twilio WhatsApp", status: "Warning", latency: "1.2s" },
  ];

  // Fetch real claims
  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/claims`);
      if (!res.ok) throw new Error("Failed to fetch claims");
      const data = await res.json();
      setClaims(data);
    } catch (err) {
      console.error(err);
      setError("Could not load real-time claims.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (insurerTab === "claims") {
      fetchClaims();
    }
  }, [insurerTab]);

  const updateClaimStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/claims/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        // Refresh local state
        setClaims(prev => prev.map(c => c.id === id ? { ...c, status } : c));
        
        // Also simulate WhatsApp if approved
        if (status === 'paid') {
          const claim = claims.find(c => c.id === id);
          if (claim) {
            console.log(`[SIMULATION] WhatsApp sent to user ${claim.user_id}: Claim Approved!`);
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update claim status");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0EB", padding: 16, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Admin Header */}
        <div style={{ background: "#1A1512", borderRadius: 16, padding: "14px 20px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#FF6B35", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🛡</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>GigShield Admin</div>
              <div style={{ color: "#9B8E84", fontSize: 10 }}>Insurer dashboard · Live view</div>
            </div>
          </div>
          <button onClick={onBack} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", fontSize: 12, cursor: "pointer" }}>← Worker view</button>
        </div>

        {/* KPI Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Active policies", value: (INSURER_STATS.activePolicies + claims.length).toLocaleString(), sub: "Total", color: "#4CAF82" },
            { label: "Premium Week", value: `₹${(INSURER_STATS.premiumThisWeek / 1000).toFixed(0)}K`, sub: "collected", color: "#FF6B35" },
            { label: "Claims Paid", value: `₹${(INSURER_STATS.claimsPaid / 1000).toFixed(0)}K`, sub: "approved", color: "#F59E0B" },
            { label: "Loss Ratio", value: `${INSURER_STATS.lossRatio}%`, sub: "healthy", color: "#4CAF82" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "12px 10px", background: "#fff", border: "1px solid #E0D9D0", borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#1A1512", marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 9, color: "#9B9589" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}>
          {insurerTabs.map(t => (
            <button key={t.id} onClick={() => setInsurerTab(t.id)} style={{ padding: "6px 14px", borderRadius: 8, background: insurerTab === t.id ? "#1A1512" : "#fff", color: insurerTab === t.id ? "#fff" : "#6B6258", fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${insurerTab === t.id ? "#1A1512" : "#E0D9D0"}`, transition: "all 0.2s", whiteSpace: "nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {insurerTab === "overview" && (
          <>
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E0D9D0", padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1512", marginBottom: 12 }}>📡 Platform Integrity Monitor</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {systemStatus.map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#FAFAF8", borderRadius: 10, border: "1px solid #E0D9D0" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1A1512" }}>{s.name}</div>
                      <div style={{ fontSize: 9, color: "#9B9589" }}>{s.latency}</div>
                    </div>
                    <Badge text={s.status} color={s.status === "Healthy" ? "#4CAF82" : "#F59E0B"} bg={s.status === "Healthy" ? "#E8F5EE" : "#FEF3C7"} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {insurerTab === "claims" && (
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E0D9D0", overflow: "hidden", minHeight: 100 }}>
             {loading && <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "#6B6258" }}>Loading live claims...</div>}
             {error && <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "#EF4444" }}>{error}</div>}
             {!loading && !error && claims.length === 0 && <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "#6B6258" }}>No active claims detected.</div>}
             
             {claims.map((c, i) => (
                <div key={c.id} style={{ padding: "12px 14px", borderBottom: "1px solid #F5F0EB" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#1A1512" }}>{c.id.substring(0, 8).toUpperCase()}</span>
                        <span style={{ fontSize: 10, color: "#6B6258" }}>{c.users?.name || "Rider"} · {c.trigger}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1512" }}>₹{c.amount_triggered || c.amount}</div>
                    </div>
                    
                    <div style={{ display: "flex", gap: 8 }}>
                      {c.status === 'paid' ? (
                        <Badge text="PAID" color="#4CAF82" bg="#E8F5EE" />
                      ) : c.status === 'rejected' ? (
                        <Badge text="REJECTED" color="#EF4444" bg="#FEE2E2" />
                      ) : (
                        <>
                          <button 
                            onClick={() => updateClaimStatus(c.id, 'rejected')}
                            style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #EF4444", background: "transparent", color: "#EF4444", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                          >Reject</button>
                          <button 
                            onClick={() => updateClaimStatus(c.id, 'paid')}
                            style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#4CAF82", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                          >Approve</button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Real-time AI Fraud Score (Private to Admin) */}
                  <FraudScoreVisualiser claim={c} />
                </div>
              ))}
          </div>
        )}

        {insurerTab === "fraud" && <FraudScoreVisualiser />}

        {insurerTab === "forecast" && (
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E0D9D0", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>📈 Payout Risk vs Premium</div>
                <div style={{ fontSize: 10, color: "#9B9589" }}>Predictive 7-day trend</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B35" }} />
                  <span style={{ fontSize: 9 }}>Premium</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF82" }} />
                  <span style={{ fontSize: 9 }}>Risk</span>
                </div>
              </div>
            </div>

            <div style={{ width: "100%", height: 160 }}>
              <svg viewBox="0 0 400 150" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                {[0, 25, 50, 75, 100].map(y => (
                  <line key={y} x1="0" y1={100 - y} x2="400" y2={100 - y} stroke="#F5F0EB" strokeWidth="1" />
                ))}
                <path d="M0,100 L40,85 L80,90 L120,70 L160,75 L200,60 L240,65 L280,50 L320,55 L360,40 L400,45" fill="none" stroke="#FF6B35" strokeWidth="2" />
                <path d="M0,120 L40,110 L80,95 L120,80 L160,60 L200,85 L240,70 L280,90 L320,65 L360,50 L400,40" fill="none" stroke="#4CAF82" strokeWidth="2" strokeDasharray="4,2" />
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                  <text key={day} x={i * 60} y="130" fontSize="8" fill="#9B9589" textAnchor="middle">{day}</text>
                ))}
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InsurerDashboard;