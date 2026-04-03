import axios from 'axios';
import { getAllActiveUsers, getUserProfile, logClaim, logWeatherData } from '../config/supabase.js';

const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5';

const LOCATION_MAP = {
  '600001': { lat: 13.0827, lon: 80.2707, city: 'Chennai' },
  '560001': { lat: 12.9716, lon: 77.5946, city: 'Bangalore' },
  '400001': { lat: 19.0760, lon: 72.8777, city: 'Mumbai' },
  '110001': { lat: 28.7041, lon: 77.1025, city: 'Delhi' },
  '500001': { lat: 17.3850, lon: 78.4867, city: 'Hyderabad' },
};

const THRESHOLDS = {
  rain: 35,
  heat: 42,
  aqi: 350,
  outage: 90,
};

function calculateHeatIndex(tempC, humidity) {
  const tempF = (tempC * 9) / 5 + 32;
  if (tempF < 80) return tempC;
  const c1 = -42.379, c2 = 2.04901523, c3 = 10.14333127, c4 = -0.22475541, c5 = -0.00683783, c6 = -0.05481717, c7 = 0.00122874, c8 = 0.00085282, c9 = -0.00000199;
  const hi = c1 + c2 * tempF + c3 * humidity + c4 * tempF * humidity + c5 * tempF * tempF + c6 * humidity * humidity + c7 * tempF * tempF * humidity + c8 * tempF * humidity * humidity + c9 * tempF * tempF * humidity * humidity;
  return ((hi - 32) * 5) / 9;
}

function mapAQIScore(level) {
  const mapping = { 1: 50, 2: 100, 3: 150, 4: 250, 5: 350 };
  return mapping[level] || 50;
}

export async function checkWeatherTriggers(pinCode) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    // Attempt to get coordinates
    let location = LOCATION_MAP[pinCode];
    
    // If not in hardcoded map, try Geocoding API (All India support)
    if (!location && apiKey) {
      try {
        console.log(`[GEO] Fetching coordinates for PIN: ${pinCode}`);
        const geoRes = await axios.get(`http://api.openweathermap.org/geo/1.0/zip`, {
          params: { zip: `${pinCode},IN`, appid: apiKey },
          timeout: 4000
        });
        if (geoRes.data) {
          location = { 
            lat: geoRes.data.lat, 
            lon: geoRes.data.lon, 
            city: geoRes.data.name || 'Unknown' 
          };
          console.log(`[GEO] Found: ${location.city} (${location.lat}, ${location.lon})`);
        }
      } catch (e) {
        console.error(`[GEO] Failed for ${pinCode}, falling back to default.`);
      }
    }

    // Ultimate fallback to Chennai if still not found
    if (!location) location = LOCATION_MAP['600001'];

    if (!apiKey) return { triggered: [], weather: { temp: 32, rainMM: 5, heatIndex: 34, aqi: 120, location: location.city, isSimulated: true }, timestamp: new Date().toISOString() };
    
    const weatherRes = await axios.get(`${OPENWEATHER_URL}/weather`, { params: { lat: location.lat, lon: location.lon, appid: apiKey, units: 'metric' }, timeout: 5000 });
    const weather = weatherRes.data;
    const tempC = weather.main.temp;
    const humidity = weather.main.humidity || 65;
    const rainMM = (weather.rain?.['1h'] || 0);
    const heatIndex = calculateHeatIndex(tempC, humidity);
    
    let aqiScore = 150;
    try {
      const aqiRes = await axios.get(`${OPENWEATHER_URL}/air_pollution`, { params: { lat: location.lat, lon: location.lon, appid: apiKey }, timeout: 5000 });
      aqiScore = mapAQIScore(aqiRes.data.list[0].main.aqi);
    } catch (e) {}
    
    try { await logWeatherData({ pin_code: pinCode, temp_c: tempC, rain_mm: rainMM, aqi: aqiScore, heat_index: heatIndex }); } catch (e) {}
    
    const triggered = [];
    if (rainMM > THRESHOLDS.rain) triggered.push({ type: 'rain', value: rainMM });
    if (heatIndex > THRESHOLDS.heat) triggered.push({ type: 'heat', value: Math.round(heatIndex) });
    if (aqiScore > THRESHOLDS.aqi) triggered.push({ type: 'aqi', value: aqiScore });
    
    for (const t of triggered) { 
      console.log(`[TRIGGER] ${t.type.toUpperCase()} hit in ${pinCode}: ${t.value}`); 
      await simulateWhatsAppNotification(pinCode, t); 
    }
    
    return { 
      triggered, 
      weather: { 
        temp: tempC, 
        rainMM, 
        heatIndex: Math.round(heatIndex), 
        aqi: aqiScore, 
        location: location.city, 
        humidity 
      }, 
      timestamp: new Date().toISOString() 
    };
  } catch (error) { 
    return { 
      triggered: [], 
      weather: { temp: 30, rainMM: 0, heatIndex: 32, aqi: 100, location: 'Unknown', isFallback: true }, 
      error: error.message, 
      timestamp: new Date().toISOString() 
    }; 
  }
}

async function simulateWhatsAppNotification(pinCode, trigger) {
  console.log(`[WHATSAPP SENT] To rider in ${pinCode}: Triggered ${trigger.type.toUpperCase()}`);
  return true;
}

export async function processAllTriggers() {
  try {
    const users = await getAllActiveUsers();
    let totalTriggered = 0;
    for (const user of users) {
      try {
        const { triggered, weather } = await checkWeatherTriggers(user.pin_code);
        for (const trigger of triggered) {
          try {
            const profile = await getUserProfile(user.id);
            if (profile.policy && profile.policy.active) {
              const payout = Math.round(profile.policy.max_payout * (0.5 + Math.random() * 0.3));
              await logClaim({ user_id: user.id, policy_id: profile.policy.id, trigger: trigger.type, amount_triggered: trigger.value, weather_data: weather }); // REVERTED amount -> amount_triggered
              totalTriggered++;
            }
          } catch (e) {}
        }
      } catch (e) {}
    }
    return { usersProcessed: users.length, totalTriggered };
  } catch (error) { throw error; }
}

export async function manualTrigger(userId, triggerType) {
  try {
    const profile = await getUserProfile(userId);
    if (!profile.policy || !profile.policy.active) throw new Error('No active policy');
    const mockWeatherData = { rain_mm: triggerType === 'rain' ? 50 : 10, temp_c: triggerType === 'heat' ? 45 : 28, aqi: triggerType === 'aqi' ? 400 : 100, heat_index: triggerType === 'heat' ? 48 : 30 };
    const claim = await logClaim({ user_id: userId, policy_id: profile.policy.id, trigger: triggerType, amount_triggered: mockWeatherData[Object.keys(mockWeatherData)[0]], weather_data: mockWeatherData }); // REVERTED amount -> amount_triggered
    return { ...claim, message: `Manual trigger processed: ${triggerType}` };
  } catch (error) { throw error; }
}

export default { checkWeatherTriggers, processAllTriggers, manualTrigger };
