import { useState } from "react";
import { TIERS } from "../data.js";

function PolicyReceipt({ data }) {
  const { name, platform, premium, tier, nfi, pinData } = data;
  const tierObj = TIERS.find(t => t.id === tier);
  const weekStart = new Date();
  const weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate() + 7);
  const fmt = d => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const [downloaded, setDownloaded] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>Policy receipt</span>
        <button onClick={() => { setDownloaded(true); setTimeout(() => setDownloaded(false), 2000); }} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #E0D9D0", background: downloaded ? "#E8F5EE" : "#FAFAF8", fontSize: 12, fontWeight: 600, color: downloaded ? "#2D6B4A" : "#6B6258", cursor: "pointer" }}>
          {downloaded ? "✓ Saved" : "⬇ Download PDF"}
        </button>
      </div>
      <div style={{ border: "1.5px solid #E0D9D0", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ background: "#1A1512", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>GigShield Policy</div>
            <div style={{ color: "#9B8E84", fontSize: 10 }}>#{`GS${Date.now().toString().slice(-8)}`}</div>
          </div>
          <div style={{ background: "#FF6B35", borderRadius: 5, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#fff" }}>ACTIVE</div>
        </div>
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 7 }}>
          {[
            ["Policyholder", name],
            ["Platform", platform],
            ["Zone", `${pinData?.zone || "Anna Nagar"}, ${pinData?.city || "Chennai"}`],
            ["NFI Risk Score", `${nfi}/100`],
            ["Plan", `${tierObj.name} Plan`],
            ["Weekly Premium", `₹${premium}`],
            ["Max Weekly Payout", `₹${tierObj.max.toLocaleString()}`],
            ["Rain Trigger", "> 35mm / 2hrs"],
            ["Heat Trigger", "> 42°C Index"],
            ["AQI Trigger", "> 350 (Severe)"],
            ["Outage Trigger", "> 90 Minutes"],
            ["Payout Method", "Automatic UPI"],
            ["Coverage Period", `${fmt(weekStart)} – ${fmt(weekEnd)}`]
          ].map(([label, val], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, paddingBottom: 7, borderBottom: "1px solid #F5F0EB" }}>
              <span style={{ color: "#6B6258" }}>{label}</span>
              <span style={{ fontWeight: 600, color: "#1A1512", textAlign: "right", maxWidth: "55%" }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#F5F0EB", padding: "10px 14px", fontSize: 10, color: "#9B9589", lineHeight: 1.4 }}>
          <b>Parametric Payout Rule:</b> Money reaches your registered UPI ID automatically within 30 minutes of a trigger event. No manual claim filing required.
        </div>
      </div>
    </div>
  );
}

export default PolicyReceipt;