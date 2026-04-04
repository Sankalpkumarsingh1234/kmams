import { useState, useEffect } from "react";
import { CLAIMS_HISTORY } from "../data.js";
import Badge from "./Badge.jsx";

const API_BASE = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

const STATUS_STYLES = {
  pending:  { text: "Pending",  color: "#92400E", bg: "#FEF3C7" },
  approved: { text: "Approved", color: "#1E40AF", bg: "#DBEAFE" },
  paid:     { text: "Paid",     color: "#2D6B4A", bg: "#E8F5EE" },
  rejected: { text: "Rejected", color: "#991B1B", bg: "#FEE2E2" },
};

function ClaimsHistory() {
  const [liveClaims, setLiveClaims] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');

    async function fetchClaims() {
      try {
        if (!userId) throw new Error('No userId in localStorage');

        const res = await fetch(`${API_BASE}/api/claims/user/${userId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setLiveClaims(data.claims || []);
      } catch (err) {
        console.warn('[ClaimsHistory] Using static data:', err.message);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchClaims();
  }, []);

  // Use live claims if available, otherwise fallback to static demo data
  const claims = liveClaims !== null ? liveClaims : CLAIMS_HISTORY;
  const total  = claims.reduce((s, c) => s + (c.amount_triggered || c.amount || 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>Claims History</span>
          {error && (
            <div style={{ fontSize: 10, color: "#9B9589", marginTop: 2 }}>📋 Demo data — sign in to see live claims</div>
          )}
          {!error && !loading && liveClaims !== null && (
            <div style={{ fontSize: 10, color: "#4CAF82", marginTop: 2 }}>✓ Live data from your account</div>
          )}
        </div>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: "#4CAF82" }}>
          ₹{total.toLocaleString()} total
        </span>
      </div>

      {loading ? (
        <div style={{ padding: "20px", textAlign: "center", color: "#9B9589", fontSize: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B35", animation: "pulse 1s infinite", display: "inline-block", marginRight: 8 }} />
          Loading claims...
        </div>
      ) : claims.length === 0 ? (
        <div style={{ padding: "30px 16px", textAlign: "center", background: "#FAFAF8", borderRadius: 12, border: "1px dashed #E0D9D0" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🛡️</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1512", marginBottom: 4 }}>No claims yet</div>
          <div style={{ fontSize: 11, color: "#9B9589" }}>Claims will appear here automatically when weather triggers are hit</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {claims.map((c, idx) => {
            const status = STATUS_STYLES[c.status] || STATUS_STYLES.paid;
            const trigger = c.trigger || c.description || "Weather Trigger";
            const amount  = c.amount_triggered || c.amount || 0;
            const date    = c.created_at
              ? new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              : (c.date || "");
            const city   = c.users?.pin_code || c.city || "—";
            const fraudScore = c.fraud_score;

            return (
              <div key={c.id || idx} style={{ padding: "12px 14px", background: "#FAFAF8", border: "1px solid #E0D9D0", borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1512", textTransform: "capitalize" }}>
                      {trigger.replace(/_/g, " ")}
                    </div>
                    <div style={{ fontSize: 11, color: "#9B9589", marginTop: 2 }}>
                      {date}{city ? ` · ${city}` : ""}
                    </div>
                    {fraudScore !== undefined && (
                      <div style={{
                        marginTop: 4, fontSize: 10, fontWeight: 600,
                        color: fraudScore > 50 ? "#EF4444" : fraudScore > 25 ? "#D97706" : "#4CAF82"
                      }}>
                        🤖 AI Score: {fraudScore}/100 {fraudScore > 50 ? "⚠️ Review" : "✓ Legit"}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: "#4CAF82" }}>
                      ₹{amount.toLocaleString()}
                    </div>
                    <Badge text={status.text} color={status.color} bg={status.bg} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ padding: "10px 12px", background: "#FEF3C7", borderRadius: 10, marginTop: 14, border: "1px solid #F59E0B" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 14 }}>🛡️</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E" }}>Automated Verification</span>
        </div>
        <div style={{ fontSize: 10, color: "#78350F", lineHeight: 1.4 }}>
          Our AI cross-references your GPS location with live weather data and platform status. If you are active in the disruption zone, your payout is triggered instantly.
        </div>
      </div>
    </div>
  );
}

export default ClaimsHistory;