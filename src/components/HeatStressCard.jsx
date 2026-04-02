import { useState } from "react";

function HeatStressCard() {
  const [temp, setTemp] = useState(38);
  const [humidity, setHumidity] = useState(72);
  const hi = -8.78 + 1.61 * temp + 2.34 * humidity - 0.146 * temp * humidity / 10 - 0.013 * temp * temp / 10 - 0.016 * humidity * humidity / 100 + 0.002 * temp * temp * humidity / 1000 + 0.00086 * temp * humidity * humidity / 10000;
  const feelsLike = Math.round(Math.max(temp, hi));
  const triggered = feelsLike >= 42;
  const color = feelsLike >= 45 ? "#EF4444" : feelsLike >= 42 ? "#F59E0B" : "#4CAF82";
  return (
    <div style={{ padding: "14px", background: triggered ? "#FFF8F0" : "#FAFAF8", border: `1.5px solid ${triggered ? "#F59E0B" : "#E0D9D0"}`, borderRadius: 14, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>🌡 Heat Stress Index</div>
          <div style={{ fontSize: 11, color: "#9B9589" }}>Rothfusz formula · live simulation</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color }}>{feelsLike}°C</div>
          <div style={{ fontSize: 10, color: "#9B9589" }}>feels like</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6B6258", marginBottom: 4 }}>
            <span>Temperature</span><span style={{ fontWeight: 600, color: "#1A1512" }}>{temp}°C</span>
          </div>
          <input type="range" min={28} max={48} value={temp} onChange={e => setTemp(+e.target.value)} style={{ width: "100%", accentColor: "#FF6B35" }} />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6B6258", marginBottom: 4 }}>
            <span>Humidity</span><span style={{ fontWeight: 600, color: "#1A1512" }}>{humidity}%</span>
          </div>
          <input type="range" min={20} max={100} value={humidity} onChange={e => setHumidity(+e.target.value)} style={{ width: "100%", accentColor: "#FF6B35" }} />
        </div>
      </div>
      <div style={{ padding: "8px 12px", background: triggered ? "#FEF3C7" : "#F0FDF4", borderRadius: 8, fontSize: 12, color: triggered ? "#92400E" : "#166534" }}>
        {triggered ? `⚡ Trigger fired — feels-like ${feelsLike}°C exceeds 42°C threshold. Auto-payout initiated.` : `✓ Below threshold (${feelsLike}°C < 42°C) — no trigger yet.`}
      </div>
    </div>
  );
}

export default HeatStressCard;