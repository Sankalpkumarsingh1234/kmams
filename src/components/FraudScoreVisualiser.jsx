import { useState } from "react";
import Badge from "./Badge.jsx";

function FraudScoreVisualiser({ claimData }) {
  const [expanded, setExpanded] = useState(null);
  const cases = [
    {
      id: "FRD-041", worker: "Anand S.", pin: "600028", trigger: "Waterlogging",
      score: 87,
      signals: [
        { label: "GPS vs flood zone", value: 94, desc: "Location 2.4km outside declared flood zone at trigger time", flag: true },
        { label: "Claim frequency", value: 62, desc: "4th claim in 6 weeks — above zone average of 1.2", flag: true },
        { label: "Activity pattern", value: 71, desc: "App showed active deliveries during claimed disruption window", flag: true },
        { label: "Historical baseline", value: 38, desc: "Prior claims aligned with zone disruptions", flag: false },
      ]
    },
    {
      id: "FRD-042", worker: "Priya M.", pin: "110001", trigger: "AQI Warning",
      score: 54,
      signals: [
        { label: "GPS vs AQI zone", value: 22, desc: "Location matches AQI-affected zone accurately", flag: false },
        { label: "Claim frequency", value: 81, desc: "3 claims in 8 days — statistical anomaly", flag: true },
        { label: "Activity pattern", value: 43, desc: "App offline during trigger window — consistent", flag: false },
        { label: "Duplicate check", value: 66, desc: "Similar claim pattern detected across 2 accounts", flag: true },
      ]
    },
    {
      id: "FRD-043", worker: "Mohan R.", pin: "400053", trigger: "Platform Downtime",
      score: 91,
      signals: [
        { label: "Duplicate submission", value: 98, desc: "Identical claim submitted via 2 device fingerprints", flag: true },
        { label: "GPS vs zone", value: 88, desc: "Location metadata inconsistent across submissions", flag: true },
        { label: "Earnings baseline", value: 74, desc: "Claimed amount 3x higher than 12-week average earnings", flag: true },
        { label: "Platform logs", value: 55, desc: "Partial platform activity logged during outage window", flag: true },
      ]
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>🔍 Fraud Score Visualiser</div>
          <div style={{ fontSize: 11, color: "#9B9589" }}>Isolation Forest · 4-signal anomaly model</div>
        </div>
        <Badge text="AI Model" color="#7C3AED" bg="#EDE9FE" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {cases.map((c) => {
          const scoreColor = c.score > 75 ? "#EF4444" : c.score > 50 ? "#F59E0B" : "#4CAF82";
          const isOpen = expanded === c.id;
          return (
            <div key={c.id} style={{ border: `1.5px solid ${isOpen ? scoreColor : "#E0D9D0"}`, borderRadius: 12, overflow: "hidden", transition: "border 0.2s" }}>
              <div onClick={() => setExpanded(isOpen ? null : c.id)} style={{ padding: "12px 14px", background: isOpen ? "#FAFAF8" : "#fff", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1A1512" }}>{c.id}</span>
                    <span style={{ fontSize: 11, color: "#9B9589" }}>· {c.worker} · {c.pin}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#6B6258", marginTop: 2 }}>{c.trigger}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Score arc */}
                  <div style={{ textAlign: "center" }}>
                    <svg width="48" height="32" viewBox="0 0 48 32">
                      <path d="M4 28 A20 20 0 0 1 44 28" fill="none" stroke="#EEE8E0" strokeWidth="5" strokeLinecap="round" />
                      <path d="M4 28 A20 20 0 0 1 44 28" fill="none" stroke={scoreColor} strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={`${(c.score / 100) * 63} 63`} />
                      <text x="24" y="26" textAnchor="middle" fontSize="10" fontWeight="700" fill={scoreColor}>{c.score}</text>
                    </svg>
                    <div style={{ fontSize: 9, color: "#9B9589", marginTop: -4 }}>fraud score</div>
                  </div>
                  <span style={{ fontSize: 12, color: "#9B9589" }}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>
              {isOpen && (
                <div style={{ padding: "12px 14px", borderTop: "1px solid #F5F0EB", background: "#FAFAF8" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6B6258", marginBottom: 8 }}>Signal breakdown</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {c.signals.map((s, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: 10 }}>{s.flag ? "🚩" : "✅"}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: s.flag ? "#EF4444" : "#1A1512" }}>{s.label}</span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: s.value > 70 ? "#EF4444" : s.value > 40 ? "#F59E0B" : "#4CAF82" }}>{s.value}%</span>
                        </div>
                        <div style={{ height: 4, background: "#EEE8E0", borderRadius: 2, marginBottom: 3 }}>
                          <div style={{ width: `${s.value}%`, height: "100%", background: s.value > 70 ? "#EF4444" : s.value > 40 ? "#F59E0B" : "#4CAF82", borderRadius: 2, transition: "width 0.6s ease" }} />
                        </div>
                        <div style={{ fontSize: 10, color: "#9B9589" }}>{s.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button style={{ flex: 1, padding: "7px", borderRadius: 8, border: "1px solid #FCA5A5", background: "#FEE2E2", color: "#991B1B", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🚫 Reject claim</button>
                    <button style={{ flex: 1, padding: "7px", borderRadius: 8, border: "1px solid #BBF7D0", background: "#DCFCE7", color: "#166534", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✓ Override & approve</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FraudScoreVisualiser;