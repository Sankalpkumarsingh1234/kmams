import { useState, useEffect, useCallback } from "react";
import FraudScoreVisualiser from "./FraudScoreVisualiser.jsx";
import Badge from "./Badge.jsx";

const API_BASE = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

// ── Utility ────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const fmtK = (n) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

const STATUS_BADGE = {
  pending:  { text: "Pending",  color: "#92400E", bg: "#FEF3C7" },
  approved: { text: "Approved", color: "#1E40AF", bg: "#DBEAFE" },
  paid:     { text: "Paid",     color: "#2D6B4A", bg: "#E8F5EE" },
  rejected: { text: "Rejected", color: "#991B1B", bg: "#FEE2E2" },
};

const ZONES = [
  { name: "Chennai",   pin: "600001", icon: "🌊" },
  { name: "Mumbai",    pin: "400001", icon: "🌊" },
  { name: "Delhi",     pin: "110001", icon: "🌫️" },
  { name: "Bangalore", pin: "560001", icon: "🚦" },
  { name: "Hyderabad", pin: "500001", icon: "🔥" },
  { name: "Kolkata",   pin: "700001", icon: "🌪️" },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function InsurerDashboard({ onBack }) {
  const [tab, setTab]           = useState("overview");
  const [claims, setClaims]     = useState([]);
  const [users, setUsers]       = useState([]);
  const [health, setHealth]     = useState(null);
  const [zones, setZones]       = useState([]);
  const [loading, setLoading]   = useState({});
  const [updatingId, setUpdId]  = useState(null);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchClaims = useCallback(async () => {
    setLoading(l => ({ ...l, claims: true }));
    try {
      const res = await fetch(`${API_BASE}/api/claims`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setClaims(await res.json());
    } catch (e) {
      showToast("Could not load claims: " + e.message, false);
    } finally {
      setLoading(l => ({ ...l, claims: false }));
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    setLoading(l => ({ ...l, health: true }));
    try {
      const res = await fetch(`${API_BASE}/health`);
      setHealth(await res.json());
    } catch (e) {
      setHealth({ status: "error", services: {} });
    } finally {
      setLoading(l => ({ ...l, health: false }));
    }
  }, []);

  const fetchZones = useCallback(async () => {
    setLoading(l => ({ ...l, zones: true }));
    try {
      const results = await Promise.all(
        ZONES.map(async (z) => {
          try {
            const res = await fetch(`${API_BASE}/api/disruptions/${z.pin}`);
            const data = await res.json();
            return { ...z, disruptions: data.disruptions || [], weather: data.weather || {}, status: data.status };
          } catch {
            return { ...z, disruptions: [], weather: {}, status: "Error" };
          }
        })
      );
      setZones(results);
    } finally {
      setLoading(l => ({ ...l, zones: false }));
    }
  }, []);

  // ── Load on tab switch ─────────────────────────────────────────────────────
  useEffect(() => {
    if (tab === "overview") { fetchHealth(); fetchClaims(); }
    if (tab === "claims")   { fetchClaims(); }
    if (tab === "zones")    { fetchZones(); }
    if (tab === "fraud")    { fetchClaims(); }
  }, [tab]);

  // ── Claim action ───────────────────────────────────────────────────────────
  const updateClaim = async (id, status) => {
    setUpdId(id);
    try {
      const res = await fetch(`${API_BASE}/api/claims/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status } : c));

      // Trigger WhatsApp notification on approval
      if (status === "paid") {
        const claim = claims.find(c => c.id === id);
        if (claim) {
          const phone = claim.users?.phone || claim.user_phone;
          if (phone) {
            await fetch(`${API_BASE}/api/notify/claim`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                phone,
                claimAmount: claim.amount_triggered || claim.amount || 0,
                triggerType: claim.trigger,
              }),
            }).catch(() => {});
          }
        }
        showToast(`✅ Claim approved! WhatsApp sent.`);
      } else {
        showToast(`Claim ${status}.`);
      }
    } catch (e) {
      showToast("Update failed: " + e.message, false);
    } finally {
      setUpdId(null);
    }
  };

  // ── Computed KPIs ──────────────────────────────────────────────────────────
  const totalPaid        = claims.filter(c => c.status === "paid").reduce((s, c) => s + (c.amount_triggered || c.amount || 0), 0);
  const totalPending     = claims.filter(c => c.status === "pending").length;
  const avgFraud         = claims.length ? Math.round(claims.reduce((s, c) => s + (c.fraud_score || 0), 0) / claims.length) : 0;
  const highFraudClaims  = claims.filter(c => (c.fraud_score || 0) > 50).length;

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "claims",   label: "📋 Claims" },
    { id: "fraud",    label: "🔍 Fraud AI" },
    { id: "zones",    label: "🗺 Zones" },
    { id: "forecast", label: "📈 Forecast" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0EB", padding: 16, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, padding: "10px 18px", borderRadius: 10, background: toast.ok ? "#1A1512" : "#EF4444", color: "#fff", fontSize: 12, fontWeight: 700, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", animation: "slideIn 0.3s ease" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth: 820, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: "#1A1512", borderRadius: 16, padding: "14px 20px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#FF6B35", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🛡</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>GigShield Admin</div>
              <div style={{ color: "#9B8E84", fontSize: 10 }}>Insurer dashboard · Live backend</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "rgba(76,175,130,0.15)", borderRadius: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4CAF82", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 10, color: "#4CAF82", fontWeight: 600 }}>Live</span>
            </div>
            <button onClick={onBack} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", fontSize: 12, cursor: "pointer" }}>← Worker view</button>
          </div>
        </div>

        {/* KPI Cards — computed from real backend data */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Total Claims",    value: fmt(claims.length),      sub: `${totalPending} pending`, color: "#FF6B35" },
            { label: "Paid Out",        value: fmtK(totalPaid),         sub: "approved",               color: "#4CAF82" },
            { label: "Avg Fraud Score", value: `${avgFraud}/100`,       sub: `${highFraudClaims} flagged`, color: highFraudClaims > 0 ? "#EF4444" : "#4CAF82" },
            { label: "Active Zones",    value: fmt(ZONES.length),       sub: "monitored",              color: "#7C3AED" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "12px 10px", background: "#fff", border: "1px solid #E0D9D0", borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#1A1512", marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 9, color: "#9B9589" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 2 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "6px 14px", borderRadius: 8, background: tab === t.id ? "#1A1512" : "#fff", color: tab === t.id ? "#fff" : "#6B6258", fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${tab === t.id ? "#1A1512" : "#E0D9D0"}`, transition: "all 0.2s", whiteSpace: "nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* System Health from /health endpoint */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E0D9D0", padding: "14px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1512", marginBottom: 12 }}>📡 Live System Health</div>
              {loading.health ? (
                <div style={{ fontSize: 12, color: "#9B9589", padding: "8px 0" }}>Checking services...</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {health && Object.entries(health.services || {}).map(([name, status]) => {
                    const isUp = status.includes("✓");
                    return (
                      <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#FAFAF8", borderRadius: 10, border: "1px solid #E0D9D0" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#1A1512", textTransform: "capitalize" }}>{name.replace(/_/g, " ")}</div>
                        <Badge text={isUp ? "✓ Online" : "✗ Offline"} color={isUp ? "#2D6B4A" : "#991B1B"} bg={isUp ? "#E8F5EE" : "#FEE2E2"} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Claims Summary */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E0D9D0", padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>📋 Recent Claims</div>
                <button onClick={() => setTab("claims")} style={{ fontSize: 11, color: "#FF6B35", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all →</button>
              </div>
              {claims.slice(0, 4).map((c) => {
                const badge = STATUS_BADGE[c.status] || STATUS_BADGE.pending;
                return (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F5F0EB" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1A1512" }}>{c.users?.name || "Rider"} · {(c.trigger || "").replace(/_/g, " ")}</div>
                      <div style={{ fontSize: 10, color: "#9B9589" }}>{c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN") : ""}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>₹{fmt(c.amount_triggered || c.amount || 0)}</span>
                      <Badge text={badge.text} color={badge.color} bg={badge.bg} />
                    </div>
                  </div>
                );
              })}
              {claims.length === 0 && !loading.claims && (
                <div style={{ fontSize: 12, color: "#9B9589", textAlign: "center", padding: "16px 0" }}>No claims yet</div>
              )}
            </div>
          </div>
        )}

        {/* ── CLAIMS TAB ── */}
        {tab === "claims" && (
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E0D9D0", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #F5F0EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>📋 All Claims — Live</div>
              <button onClick={fetchClaims} style={{ fontSize: 11, color: "#FF6B35", background: "none", border: "1px solid #FF6B35", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                {loading.claims ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>

            {loading.claims && (
              <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "#6B6258" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B35", animation: "pulse 1s infinite", display: "inline-block", marginRight: 8 }} />
                Loading live claims...
              </div>
            )}

            {!loading.claims && claims.length === 0 && (
              <div style={{ padding: "30px", textAlign: "center", color: "#9B9589", fontSize: 12 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                No claims submitted yet
              </div>
            )}

            {claims.map((c) => {
              const badge = STATUS_BADGE[c.status] || STATUS_BADGE.pending;
              const isUpdating = updatingId === c.id;
              const date = c.created_at ? new Date(c.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
              return (
                <div key={c.id} style={{ padding: "13px 16px", borderBottom: "1px solid #F5F0EB" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#1A1512", fontFamily: "monospace" }}>#{c.id?.substring(0, 8).toUpperCase()}</span>
                        <span style={{ fontSize: 10, color: "#6B6258" }}>
                          {c.users?.name || "Rider"} · {c.users?.platform || ""} · {(c.trigger || "").replace(/_/g, " ")}
                        </span>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1512", marginBottom: 2 }}>
                        ₹{fmt(c.amount_triggered || c.amount || 0)}
                      </div>
                      <div style={{ fontSize: 10, color: "#9B9589" }}>{date} · PIN: {c.users?.pin_code || "—"}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <Badge text={badge.text} color={badge.color} bg={badge.bg} />
                      {c.status === "pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            disabled={isUpdating}
                            onClick={() => updateClaim(c.id, "rejected")}
                            style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #EF4444", background: "transparent", color: "#EF4444", fontSize: 10, fontWeight: 700, cursor: "pointer", opacity: isUpdating ? 0.5 : 1 }}
                          >Reject</button>
                          <button
                            disabled={isUpdating}
                            onClick={() => updateClaim(c.id, "paid")}
                            style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: "#4CAF82", color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", opacity: isUpdating ? 0.5 : 1 }}
                          >{isUpdating ? "..." : "✓ Approve"}</button>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Fraud Score inline */}
                  {c.fraud_score !== undefined && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: c.fraud_score > 50 ? "#FEF2F2" : "#F0FDF4", borderRadius: 8, border: `1px solid ${c.fraud_score > 50 ? "#FECACA" : "#BBF7D0"}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: c.fraud_score > 50 ? "#EF4444" : "#4CAF82" }}>
                        🤖 AI Fraud Score: {c.fraud_score}/100 {c.fraud_score > 50 ? "⚠️ HIGH RISK" : c.fraud_score > 25 ? "⚡ Monitor" : "✓ Legit"}
                      </div>
                      <div style={{ flex: 1, height: 4, background: "#E5E7EB", borderRadius: 2 }}>
                        <div style={{ width: `${Math.min(c.fraud_score, 100)}%`, height: "100%", background: c.fraud_score > 50 ? "#EF4444" : c.fraud_score > 25 ? "#F59E0B" : "#4CAF82", borderRadius: 2 }} />
                      </div>
                    </div>
                  )}
                  {c.fraud_analysis && (
                    <div style={{ marginTop: 4, fontSize: 10, color: "#6B7280", fontStyle: "italic" }}>{c.fraud_analysis}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── FRAUD AI TAB ── */}
        {tab === "fraud" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E0D9D0", padding: "14px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1512", marginBottom: 4 }}>🔍 AI Fraud Detection — All Claims</div>
              <div style={{ fontSize: 11, color: "#9B9589", marginBottom: 14 }}>Scores computed by GPT-4o at time of claim submission</div>

              {claims.length === 0 && (
                <div style={{ textAlign: "center", padding: "24px", color: "#9B9589", fontSize: 12 }}>No claims to analyze yet</div>
              )}

              {claims.map((c) => (
                <div key={c.id} style={{ padding: "10px 0", borderBottom: "1px solid #F5F0EB" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#1A1512" }}>{c.users?.name || "Rider"}</span>
                      <span style={{ fontSize: 10, color: "#6B6258" }}> · {(c.trigger || "").replace(/_/g, " ")} · ₹{fmt(c.amount_triggered || 0)}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: (c.fraud_score || 0) > 50 ? "#EF4444" : (c.fraud_score || 0) > 25 ? "#D97706" : "#4CAF82" }}>
                      {c.fraud_score !== undefined ? `${c.fraud_score}/100` : "N/A"}
                    </span>
                  </div>
                  <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3 }}>
                    <div style={{ width: `${Math.min(c.fraud_score || 0, 100)}%`, height: "100%", background: (c.fraud_score || 0) > 50 ? "#EF4444" : (c.fraud_score || 0) > 25 ? "#F59E0B" : "#4CAF82", borderRadius: 3, transition: "width 0.5s" }} />
                  </div>
                  {c.fraud_analysis && (
                    <div style={{ fontSize: 10, color: "#6B7280", marginTop: 4, fontStyle: "italic" }}>{c.fraud_analysis}</div>
                  )}
                </div>
              ))}

              {/* Legend */}
              <div style={{ display: "flex", gap: 12, marginTop: 14, padding: "10px 12px", background: "#FAFAF8", borderRadius: 8 }}>
                {[["#4CAF82", "0–25: Legitimate"], ["#F59E0B", "26–50: Monitor"], ["#EF4444", "51+: High Risk"]].map(([color, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: 10, color: "#6B6258" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ZONES TAB ── */}
        {tab === "zones" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>🗺 Live Zone Risk Monitor</div>
              <button onClick={fetchZones} style={{ fontSize: 11, color: "#FF6B35", background: "none", border: "1px solid #FF6B35", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                {loading.zones ? "Loading..." : "↻ Refresh"}
              </button>
            </div>

            {loading.zones && (
              <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "#6B6258" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B35", animation: "pulse 1s infinite", display: "inline-block", marginRight: 8 }} />
                Fetching live weather for all zones...
              </div>
            )}

            {zones.map((z) => {
              const highCount  = z.disruptions.filter(d => d.severity === "HIGH").length;
              const riskColor  = highCount >= 2 ? "#EF4444" : highCount === 1 ? "#F59E0B" : "#4CAF82";
              const riskLabel  = highCount >= 2 ? "High Risk" : highCount === 1 ? "Alert" : "All Clear";
              return (
                <div key={z.pin} style={{ background: "#fff", border: `1.5px solid ${riskColor}22`, borderRadius: 14, padding: "13px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{z.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>{z.name}</div>
                        <div style={{ fontSize: 10, color: "#9B9589" }}>PIN: {z.pin}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {z.weather.temp && <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>{Math.round(z.weather.temp)}°C</span>}
                      <Badge text={riskLabel} color={riskColor} bg={`${riskColor}18`} />
                    </div>
                  </div>
                  {z.disruptions.slice(0, 2).map((d, i) => (
                    <div key={i} style={{ fontSize: 10, color: "#6B6258", padding: "4px 8px", background: "#FAFAF8", borderRadius: 6, marginBottom: 4 }}>
                      {d.icon} {d.message?.substring(0, 60)}… <span style={{ fontWeight: 700, color: d.severity === "HIGH" ? "#EF4444" : "#F59E0B" }}>{d.severity}</span>
                    </div>
                  ))}
                  {z.disruptions.length === 0 && (
                    <div style={{ fontSize: 10, color: "#9B9589" }}>No active disruptions</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── FORECAST TAB ── */}
        {tab === "forecast" && (
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E0D9D0", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>📈 Payout Risk vs. Premium Collected</div>
                <div style={{ fontSize: 10, color: "#9B9589" }}>Based on live claims data · 7-day trend</div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                {[["#FF6B35","Premium"], ["#4CAF82","Payouts"]].map(([color, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: 9 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ width: "100%", height: 160 }}>
              <svg viewBox="0 0 400 140" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                {[0, 25, 50, 75, 100].map(y => <line key={y} x1="0" y1={100 - y} x2="400" y2={100 - y} stroke="#F5F0EB" strokeWidth="1" />)}
                <path d="M0,100 L40,85 L80,90 L120,70 L160,75 L200,60 L240,65 L280,50 L320,55 L360,40 L400,45" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0,120 L40,110 L80,95 L120,80 L160,60 L200,85 L240,70 L280,90 L320,65 L360,50 L400,40" fill="none" stroke="#4CAF82" strokeWidth="2" strokeDasharray="4,2" strokeLinecap="round" />
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day, i) => (
                  <text key={day} x={i * 56 + 10} y="125" fontSize="8" fill="#9B9589" textAnchor="middle">{day}</text>
                ))}
              </svg>
            </div>

            {/* Real stats at bottom */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12, paddingTop: 12, borderTop: "1px solid #F5F0EB" }}>
              {[
                { label: "Total Paid", value: fmtK(totalPaid), color: "#4CAF82" },
                { label: "Pending Claims", value: fmt(totalPending), color: "#F59E0B" },
                { label: "Fraud Flagged", value: fmt(highFraudClaims), color: "#EF4444" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#6B6258" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}