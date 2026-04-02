function NFIGauge({ score }) {
  const color = score > 65 ? "#EF4444" : score > 40 ? "#F59E0B" : "#4CAF82";
  const label = score > 65 ? "High Risk" : score > 40 ? "Moderate" : "Low Risk";
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="120" height="70" viewBox="0 0 120 70">
        <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="#EEE8E0" strokeWidth="10" strokeLinecap="round" />
        <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(score / 100) * 157} 157`} />
        <text x="60" y="58" textAnchor="middle" fontSize="22" fontWeight="700" fill={color} fontFamily="'DM Serif Display', serif">{score}</text>
      </svg>
      <div style={{ fontSize: 12, fontWeight: 600, color, marginTop: -4 }}>{label}</div>
      <div style={{ fontSize: 11, color: "#9B9589", marginTop: 2 }}>NFI Risk Score</div>
    </div>
  );
}

export default NFIGauge;