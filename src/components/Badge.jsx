function Badge({ text, color = "#FF6B35", bg = "#FFF0EB" }) {
  return <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", color, background: bg, borderRadius: 4, padding: "2px 7px", textTransform: "uppercase" }}>{text}</span>;
}

export default Badge;