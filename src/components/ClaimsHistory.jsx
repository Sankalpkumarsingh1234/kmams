import { CLAIMS_HISTORY } from "../data.js";
import Badge from "./Badge.jsx";

function ClaimsHistory() {
  const total = CLAIMS_HISTORY.reduce((s, c) => s + c.amount, 0);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>Claims history</span>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: "#4CAF82" }}>₹{total.toLocaleString()} total</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {CLAIMS_HISTORY.map(c => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#FAFAF8", border: "1px solid #E0D9D0", borderRadius: 10 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1512" }}>{c.trigger}</div>
              <div style={{ fontSize: 11, color: "#9B9589" }}>{c.date} · {c.city}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: "#4CAF82" }}>₹{c.amount}</div>
              <Badge text="Paid" color="#2D6B4A" bg="#E8F5EE" />
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 12px", background: "#FEF3C7", borderRadius: 10, marginTop: 15, border: "1px solid #F59E0B" }}>
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