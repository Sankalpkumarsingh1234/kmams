import axios from 'axios';
import { getAllActiveUsers, getUserProfile, logClaim, logWeatherData } from '../config/supabase.js';

// API key is dynamically loaded in function
const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5';

// Location mapping - Pincode to Lat/Lon
const LOCATION_MAP = {
  '600001': { lat: 13.0827, lon: 80.2707, city: 'Chennai' }, // Chennai
  '560001': { lat: 12.9716, lon: 77.5946, city: 'Bangalore' }, // Bangalore
  '400001': { lat: 19.0760, lon: 72.8777, city: 'Mumbai' }, // Mumbai
  '110001': { lat: 28.7041, lon: 77.1025, city: 'Delhi' }, // Delhi
  '500001': { lat: 17.3850, lon: 78.4867, city: 'Hyderabad' }, // Hyderabad
};

// Trigger thresholds
const THRESHOLDS = {
  rain: 35, // mm in 1 hour
  heat: 42, // Celsius
  aqi: 350, // Air Quality Index
  outage: 90, // minutes (manual trigger)
};

/**
 * Calculate heat index using Rothfusz formula
 * @param tempC - Temperature in Celsius
 * @param humidity - Relative humidity percentage
 * @returns Heat index in Celsius
 */
function calculateHeatIndex(tempC, humidity) {
  const tempF = (tempC * 9) / 5 + 32;

  if (tempF < 80) return tempC;

  const c1 = -42.379;
  const c2 = 2.04901523;
  const c3 = 10.14333127;
  const c4 = -0.22475541;
  const c5 = -0.00683783;
  const c6 = -0.05481717;
  const c7 = 0.00122874;
  const c8 = 0.00085282;
  const c9 = -0.00000199;

  const hi =
    c1 +
    c2 * tempF +
    c3 * humidity +
    c4 * tempF * humidity +
    c5 * tempF * tempF +
    c6 * humidity * humidity +
    c7 * tempF * tempF * humidity +
    c8 * tempF * humidity * humidity +
    c9 * tempF * tempF * humidity * humidity;

  return ((hi - 32) * 5) / 9; // Convert back to Celsius
}

/**
 * Map AQI level (1-5) to 0-500 scale
 */
function mapAQIScore(level) {
  const mapping = {
    1: 50, // Good
    2: 100, // Fair
    3: 150, // Moderate
    4: 250, // Poor
    5: 350, // Very Poor
  };
  return mapping[level] || 50;
}

/**
 * Fetch current weather for pincode and check triggers
 */
export async function checkWeatherTriggers(pinCode) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const location = LOCATION_MAP[pinCode] || LOCATION_MAP['600001'];

    if (!apiKey) {
      console.warn('OpenWeatherMap API key not configured - using simulated data');
      // Return realistic simulated data so the UI doesn't break
      return {
        triggered: [],
        weather: {
          temp: 32,
          rainMM: 5,
          heatIndex: 34,
          aqi: 120,
          location: location.city,
          isSimulated: true
        },
        timestamp: new Date().toISOString(),
      };
    }

    // Fetch current weather
    const weatherRes = await axios.get(`${OPENWEATHER_URL}/weather`, {
      params: {
        lat: location.lat,
        lon: location.lon,
        appid: apiKey,
        units: 'metric',
      },
      timeout: 5000,
    });

    const weather = weatherRes.data;
    const tempC = weather.main.temp;
    const humidity = weather.main.humidity || 65; // Fallback to 65% if not provided
    const rainMM = (weather.rain?.['1h'] || 0); // OpenWeather returns mm/h already
    const heatIndex = calculateHeatIndex(tempC, humidity);

    // Fetch AQI
    let aqiScore = 150; // Default moderate
    try {
      const aqiRes = await axios.get(`${OPENWEATHER_URL}/air_pollution`, {
        params: {
          lat: location.lat,
          lon: location.lon,
          appid: apiKey,
        },
        timeout: 5000,
      });
      const aqiLevel = aqiRes.data.list[0].main.aqi; // 1-5
      aqiScore = mapAQIScore(aqiLevel);
    } catch (aqiErr) {
      console.warn('AQI fetch failed, using default:', aqiErr.message);
    }

    // Log weather data (optional, don't let it crash the main flow)
    try {
      await logWeatherData({
        pin_code: pinCode,
        temp_c: tempC,
        rain_mm: rainMM,
        aqi: aqiScore,
        heat_index: heatIndex,
      });
    } catch (logErr) {
      console.warn('Weather logging failed:', logErr.message);
    }

    // If triggers were hit, log them and simulate WhatsApp
    for (const trigger of triggered) {
      console.log(`[TRIGGER] ${trigger.type.toUpperCase()} hit in ${pinCode}: ${trigger.value}`);
      
      // Simulate WhatsApp Notification (P4 Task)
      try {
        await simulateWhatsAppNotification(pinCode, trigger);
      } catch (waErr) {
        console.warn('WhatsApp simulation failed:', waErr.message);
      }
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
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    // ... error handling
  }
}

/**
 * Simulate WhatsApp Notification via Twilio sandbox (P4 Task Mock)
 */
async function simulateWhatsAppNotification(pinCode, trigger) {
  const message = `🛡️ GigShield: Payout Triggered! ${trigger.type.toUpperCase()} threshold exceeded in your zone (${pinCode}). Your automated payout is being processed via UPI.`;
  console.log(`[WHATSAPP SENT] To rider in ${pinCode}: ${message}`);
  
  // In a real app, this would call Twilio API:
  // client.messages.create({ from: 'whatsapp:+14155238886', to: 'whatsapp:+91...', body: message });
  
  return true;
}

/**
 * Check all active users for weather triggers and auto-payout
 * Call this via cron job every 30 minutes
 */
export async function processAllTriggers() {
  try {
    console.log('[CRON] Starting weather trigger check...');

    const users = await getAllActiveUsers();
    console.log(`[CRON] Checking ${users.length} users...`);

    let totalTriggered = 0;

    for (const user of users) {
      try {
        // Check weather for this user
        const { triggered, weather } = await checkWeatherTriggers(user.pin_code);

        // For each trigger, create a claim
        for (const trigger of triggered) {
          try {
            const profile = await getUserProfile(user.id);

            if (profile.policy && profile.policy.active) {
              // Calculate payout amount (70% of max, random for demo)
              const payout = Math.round(
                profile.policy.max_payout *
                  (0.5 + Math.random() * 0.3)
              );

              await logClaim({
                user_id: user.id,
                policy_id: profile.policy.id,
                trigger: trigger.type,
                amount_triggered: trigger.value,
                weather_data: weather,
              });

              console.log(
                `[CRON] Auto-payout: ${user.name} | Trigger: ${trigger.type} | Amount: ₹${payout}`
              );
              totalTriggered++;
            }
          } catch (claimError) {
            console.error(
              `[CRON] Failed to process claim for ${user.name}:`,
              claimError.message
            );
          }
        }
      } catch (userError) {
        console.error(
          `[CRON] Failed to check triggers for ${user.name}:`,
          userError.message
        );
      }
    }

    console.log(`[CRON] Trigger check complete. Total payouts: ${totalTriggered}`);
    return { usersProcessed: users.length, totalTriggered };
  } catch (error) {
    console.error('[CRON] processAllTriggers failed:', error);
    throw error;
  }
}

/**
 * Manual trigger for testing (simulates a weather event)
 */
export async function manualTrigger(userId, triggerType) {
  try {
    const profile = await getUserProfile(userId);

    if (!profile.policy || !profile.policy.active) {
      throw new Error('No active policy found');
    }

    if (!['rain', 'heat', 'aqi', 'outage'].includes(triggerType)) {
      throw new Error(`Invalid trigger type: ${triggerType}`);
    }

    const mockWeatherData = {
      rain_mm: triggerType === 'rain' ? 50 : 10,
      temp_c: triggerType === 'heat' ? 45 : 28,
      aqi: triggerType === 'aqi' ? 400 : 100,
      heat_index: triggerType === 'heat' ? 48 : 30,
    };

    const payout = Math.round(
      profile.policy.max_payout * (0.5 + Math.random() * 0.3)
    );

    const claim = await logClaim({
      user_id: userId,
      policy_id: profile.policy.id,
      trigger: triggerType,
      amount_triggered: mockWeatherData[Object.keys(mockWeatherData)[0]],
      weather_data: mockWeatherData,
    });

    return {
      ...claim,
      payoutAmount: payout,
      message: `Manual trigger processed: ${triggerType}`,
    };
  } catch (error) {
    console.error('manualTrigger failed:', error);
    throw error;
  }
}

export default {
  checkWeatherTriggers,
  processAllTriggers,
  manualTrigger,
};
