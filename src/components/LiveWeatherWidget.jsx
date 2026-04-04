import { useState, useEffect } from "react";

const API_BASE = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

function LiveWeatherWidget({ city }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchLiveWeather = async () => {
      setLoading(true);
      setError(false);

      try {
        // Use /api/disruptions which works without Supabase and returns weather data
        const userPin = localStorage.getItem('userPin') || '600001';
        const response = await fetch(`${API_BASE}/api/disruptions/${userPin}`);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (isMounted) {
          const w = data.weather || {};
          setWeather({
            temp: Math.round(w.temp || 32),
            humidity: w.humidity || 65,
            feels: Math.round(w.heatIndex || w.temp || 34),
            rainMM: w.rainMM || 0,
            desc: w.isSimulated ? 'Simulated Data' : w.isFallback ? 'Cached Data' : 'Live · OpenWeather',
            wind: w.wind || 12,
            aqi: w.aqi || 120,
            location: data.location || city,
          });
        }
      } catch (err) {
        console.error("Live weather fetch error:", err);
        if (isMounted) {
          setError(true);
          setWeather({ temp: 34, humidity: 70, feels: 41, rainMM: 0, desc: 'Fallback Data', wind: 0, aqi: 120, location: city });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLiveWeather();
    const interval = setInterval(fetchLiveWeather, 60000); // Refresh every 60s
    return () => { isMounted = false; clearInterval(interval); };
  }, [city]);

  if (loading) return (
    <div style={{ padding: "12px 14px", background: "#FAFAF8", border: "1px solid #E0D9D0", borderRadius: 12, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B35", animation: "pulse 1s infinite" }} />
        <span style={{ fontSize: 12, color: "#9B9589" }}>Fetching live weather for {city}...</span>
      </div>
    </div>
  );

  const heatTriggered = weather.feels >= 42;
  const aqiTriggered = weather.aqi > 350;
  const rainTriggered = weather.rainMM > 35;
  const aqiLabel = weather.aqi > 350 ? "Very Poor" : weather.aqi > 200 ? "Poor" : weather.aqi > 100 ? "Moderate" : "Good";

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ padding: "14px", background: heatTriggered ? "#FFF8F0" : "#F0F9FF", border: `1.5px solid ${heatTriggered ? "#F59E0B" : "#BAE6FD"}`, borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>
              🌤 Live Weather · {weather.location || city}
            </div>
            <div style={{ fontSize: 11, color: error ? "#EF4444" : "#9B9589", marginTop: 1 }}>{weather.desc}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: heatTriggered ? "#EF4444" : "#1A1512", lineHeight: 1 }}>{weather.temp}°C</div>
            <div style={{ fontSize: 10, color: "#9B9589" }}>actual</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          {[
            { label: "Rainfall", value: `${weather.rainMM}mm`, progress: (weather.rainMM / 35) * 100, threshold: "35mm", icon: "🌧", triggered: rainTriggered },
            { label: "Heat Index", value: `${weather.feels}°C`, progress: (weather.feels / 42) * 100, threshold: "42°C", icon: "🌡", triggered: heatTriggered },
            { label: "Air Quality", value: `${weather.aqi} AQI`, progress: (weather.aqi / 350) * 100, threshold: "350", icon: "💨", triggered: aqiTriggered },
            { label: "Humidity", value: `${weather.humidity}%`, progress: weather.humidity, threshold: "80%+", icon: "💧", triggered: weather.humidity > 80 },
          ].map((w, i) => (
            <div key={i} style={{ padding: "10px", background: "#fff", borderRadius: 10, border: `1px solid ${w.triggered ? "#EF4444" : "#E0D9D0"}`, position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#1A1512" }}>{w.icon} {w.label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: w.progress >= 100 ? "#EF4444" : "#1A1512" }}>{w.value}</span>
              </div>
              <div style={{ height: 4, background: "#F5F0EB", borderRadius: 2 }}>
                <div style={{ width: `${Math.min(w.progress, 100)}%`, height: "100%", background: w.progress >= 100 ? "#EF4444" : "#FF6B35", borderRadius: 2, transition: "width 0.5s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 8, color: w.triggered ? "#EF4444" : "#9B9589", fontWeight: w.triggered ? 700 : 400 }}>
                  {w.progress >= 100 ? "⚡ Trigger hit!" : "Progress to payout"}
                </span>
                <span style={{ fontSize: 8, fontWeight: 600, color: "#6B6258" }}>Target: {w.threshold}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "8px 10px", background: "#F5F0EB", borderRadius: 8, fontSize: 10, color: "#6B6258", display: "flex", gap: 6, alignItems: "center" }}>
          <span>ℹ️</span>
          <span>Heat Index is calculated using <b>Rothfusz formula</b> (Temp + Humidity). Rainfall is measured hourly.</span>
        </div>
        {(heatTriggered || aqiTriggered || rainTriggered) && (
          <div style={{ marginTop: 10, padding: "8px 10px", background: "#FEF3C7", borderRadius: 8, fontSize: 12, color: "#92400E", fontWeight: 600 }}>
            ⚡ {rainTriggered ? `Rainfall ${weather.rainMM}mm exceeds threshold` : heatTriggered ? `Heat Index ${weather.feels}°C exceeds threshold` : `AQI ${weather.aqi} — Very Poor`} — payout trigger active!
          </div>
        )}
        <div style={{ marginTop: 8, fontSize: 10, color: "#9B9589", textAlign: "right" }}>
          {weather.desc} · {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

export default LiveWeatherWidget;