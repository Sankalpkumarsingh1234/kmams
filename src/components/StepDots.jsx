function StepDots({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "0 0 28px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ width: i === current ? 20 : 8, height: 8, borderRadius: 4, background: i === current ? "#FF6B35" : "#E0D9D0", transition: "all 0.3s ease" }} />
      ))}
    </div>
  );
}

export default StepDots;