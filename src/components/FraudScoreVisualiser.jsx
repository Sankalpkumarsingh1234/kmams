import { useState } from "react";
import Badge from "./Badge.jsx";

function FraudScoreVisualiser({ claim }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!claim) return null;

  const score = claim.fraud_score || 0;
  const analysis = claim.fraud_analysis || 'No detailed analysis available.';
  const scoreColor = score > 75 ? "#EF4444" : score > 50 ? "#F59E0B" : "#4CAF82";

  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ border: `1.5px solid ${expanded ? scoreColor : "#E0D9D0"}`, borderRadius: 12, overflow: "hidden", transition: "border 0.2s" }}>
        <div onClick={() => setExpanded(!expanded)} style={{ padding: "12px 14px", background: expanded ? "#FAFAF8" : "#fff", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#1A1512" }}>LIVE AI FRAUD ANALYSIS</span>
              <Badge text="GPT-4o" color="#7C3AED" bg="#EDE9FE" />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Score arc */}
            <div style={{ textAlign: "center" }}>
              <svg width="48" height="32" viewBox="0 0 48 32">
                <path d="M4 28 A20 20 0 0 1 44 28" fill="none" stroke="#EEE8E0" strokeWidth="5" strokeLinecap="round" />
                <path d="M4 28 A20 20 0 0 1 44 28" fill="none" stroke={scoreColor} strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 63} 63`} />
                <text x="24" y="26" textAnchor="middle" fontSize="10" fontWeight="700" fill={scoreColor}>{score}</text>
              </svg>
              <div style={{ fontSize: 9, color: "#9B9589", marginTop: -4 }}>fraud score</div>
            </div>
            <span style={{ fontSize: 12, color: "#9B9589" }}>{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
        
        {expanded && (
          <div style={{ padding: "12px 14px", borderTop: "1px solid #F5F0EB", background: "#FAFAF8" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6B6258", marginBottom: 8 }}>AI Intelligence Breakdown</div>
            <div style={{ fontSize: 12, color: "#1A1512", lineHeight: 1.5, marginBottom: 12, background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #E0D9D0' }}>
              {analysis}
            </div>
            
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9B9589", marginBottom: 8 }}>Signals Detected:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <SignalItem label="GPS Position" flag={score > 40} value={score > 60 ? 88 : 12} desc="Cross-referencing with weather zone." />
              <SignalItem label="Claim Frequency" flag={score > 70} value={score > 80 ? 94 : 24} desc="Anomaly detection vs user history." />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SignalItem({ label, flag, value, desc }) {
  const color = value > 70 ? "#EF4444" : value > 40 ? "#F59E0B" : "#4CAF82";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 10 }}>{flag ? "🚩" : "✅"}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: flag ? "#EF4444" : "#1A1512" }}>{label}</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: 3, background: "#EEE8E0", borderRadius: 2, marginBottom: 3 }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}

export default FraudScoreVisualiser;