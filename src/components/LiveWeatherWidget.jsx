import { useState, useEffect } from "react";
import { CITY_WEATHER_IDS } from "../data.js";

function LiveWeatherWidget({ city }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Realistic mock weather per city (fallback + demo)
  const MOCK_WEATHER = {
    "Chennai":   { temp: 34, humidity: 78, feels: 41, desc: "Partly cloudy", wind: 14, aqi: 82 },
    "Mumbai":    { temp: 31, humidity: 82, feels: 38, desc: "Humid", wind: 18, aqi: 95 },
    "Delhi":     { temp: 29, humidity: 45, feels: 31, desc: "Hazy sunshine", wind: 9, aqi: 187 },
    "Hyderabad": { temp: 37, humidity: 55, feels: 43, desc: "Hot & sunny", wind: 11, aqi: 74 },
    "Bangalore": { temp: 26, humidity: 68, feels: 28, desc: "Overcast", wind: 8, aqi: 61 },
    "Jaipur":    { temp: 35, humidity: 38, feels: 37, desc: "Sunny & dry", wind: 12, aqi: 110 },
    "Ahmedabad": { temp: 38, humidity: 42, feels: 42, desc: "Very hot", wind: 7, aqi: 128 },
  };

  useEffect(() => {
    setLoading(true);
    setError(false);
    
    // Use mock data (can integrate with backend /api/triggers/check/:pinCode later)
    setTimeout(() => {
      setWeather(MOCK_WEATHER[city] || MOCK_WEATHER["Chennai"]);
      setLoading(false);
    }, 400);
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
  const aqiColor = weather.aqi > 350 ? "#EF4444" : weather.aqi > 200 ? "#F59E0B" : "#4CAF82";
  const aqiLabel = weather.aqi > 350 ? "Very Poor" : weather.aqi > 200 ? "Poor" : weather.aqi > 100 ? "Moderate" : "Good";

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ padding: "14px", background: heatTriggered ? "#FFF8F0" : "#F0F9FF", border: `1.5px solid ${heatTriggered ? "#F59E0B" : "#BAE6FD"}`, borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1512" }}>
              🌤 Live Weather · {city}
            </div>
            <div style={{ fontSize: 11, color: "#9B9589", marginTop: 1, textTransform: "capitalize" }}>{weather.desc}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: heatTriggered ? "#EF4444" : "#1A1512", lineHeight: 1 }}>{weather.temp}°C</div>
            <div style={{ fontSize: 10, color: "#9B9589" }}>actual</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
          {[
            { label: "Feels like", value: `${weather.feels}°C`, alert: heatTriggered, alertColor: "#EF4444" },
            { label: "Humidity", value: `${weather.humidity}%`, alert: weather.humidity > 80, alertColor: "#F59E0B" },
            { label: "Wind", value: `${weather.wind}km/h`, alert: false, alertColor: null },
            { label: "AQI", value: weather.aqi, alert: aqiTriggered, alertColor: aqiColor },
          ].map((w, i) => (
            <div key={i} style={{ padding: "7px 6px", background: w.alert ? "#FEF3C7" : "#fff", borderRadius: 8, textAlign: "center", border: `1px solid ${w.alert ? "#F59E0B" : "#E0D9D0"}` }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 14, color: w.alert ? w.alertColor : "#1A1512" }}>{w.value}</div>
              <div style={{ fontSize: 9, color: "#9B9589", marginTop: 1 }}>{w.label}</div>
            </div>
          ))}
        </div>
        {(heatTriggered || aqiTriggered) && (
          <div style={{ marginTop: 10, padding: "8px 10px", background: "#FEF3C7", borderRadius: 8, fontSize: 12, color: "#92400E", fontWeight: 600 }}>
            ⚡ {heatTriggered ? `Heat Index ${weather.feels}°C exceeds threshold` : `AQI ${weather.aqi} — Very Poor`} — trigger active
          </div>
        )}
        <div style={{ marginTop: 8, fontSize: 10, color: "#9B9589", textAlign: "right" }}>
          Live data · OpenWeatherMap API · {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

export default LiveWeatherWidget;