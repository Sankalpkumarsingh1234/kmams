import axios from 'axios'
import { supabase } from '../config/supabase.js'

// Key will be loaded dynamically using process.env.OPENWEATHER_API_KEY

// Parametric trigger thresholds
const THRESHOLDS = {
  rain: 35, // mm
  heat: 42, // Celsius (heat index)
  aqi: 350, // Air Quality Index (0-500 scale)
  outage: 90 // minutes (dummy for now)
}

// Static pincode to lat/lon mapping
const PINCODE_LOCATIONS = {
  '600001': { lat: 13.0827, lon: 80.2707, city: 'Chennai' },
  '560001': { lat: 12.9716, lon: 77.5946, city: 'Bangalore' },
  '400001': { lat: 19.0760, lon: 72.8777, city: 'Mumbai' },
  '110001': { lat: 28.6358, lon: 77.2245, city: 'Delhi' },
  '700001': { lat: 22.5726, lon: 88.3639, city: 'Kolkata' },
  // Add more as needed
}

/**
 * Check weather triggers for a specific pincode
 */
export async function checkWeatherTriggers(pinCode) {
  try {
    const location = PINCODE_LOCATIONS[pinCode]

    if (!location) {
      console.warn(`Pincode ${pinCode} not found in location map`)
      return { triggered: [], weather: null }
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ OPENWEATHER_API_KEY not set. Weather triggers disabled.')
      return { triggered: [], weather: null }
    }

    // Fetch current weather
    const weatherRes = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: location.lat,
        lon: location.lon,
        appid: apiKey,
        units: 'metric'
      }
    })

    const weather = weatherRes.data
    const temp = weather.main.temp
    const rainMM = (weather.rain?.['1h'] || 0) * 25.4 // inch to mm conversion
    const humidity = weather.main.humidity

    // Calculate heat index (Rothfusz formula)
    const c1 = -42.379
    const c2 = 2.04901523
    const c3 = 10.14333127
    const c4 = -0.22475541
    const c5 = -0.00683783
    const c6 = -0.05481717
    const c7 = 0.00122874
    const c8 = 0.00085282
    const c9 = -0.00000199

    const heatIndex =
      c1 +
      c2 * temp +
      c3 * humidity +
      c4 * temp * humidity +
      c5 * temp * temp +
      c6 * humidity * humidity +
      c7 * temp * temp * humidity +
      c8 * temp * humidity * humidity +
      c9 * temp * temp * humidity * humidity

    // Fetch AQI
    let aqi = 100 // default to moderate
    try {
      const aqiRes = await axios.get('https://api.openweathermap.org/data/2.5/air_pollution', {
        params: {
          lat: location.lat,
          lon: location.lon,
          appid: apiKey
        }
      })

      // AQI scale: 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
      // Convert to 0-500 scale; 350 = trigger threshold
      const aqiLevel = aqiRes.data.list[0].main.aqi
      aqi = aqiLevel * 70 // Scale 1-5 to 70-350
    } catch (aqiError) {
      console.warn('AQI fetch failed:', aqiError.message)
    }

    // Log weather
    await supabase.from('weather_logs').insert([{
      pin_code: pinCode,
      city: location.city,
      temp_c: temp,
      rain_mm: rainMM,
      aqi,
      heat_index: heatIndex,
      triggered: false
    }])

    // Check triggers
    const triggered = []
    if (rainMM > THRESHOLDS.rain) {
      triggered.push({
        type: 'rain',
        value: rainMM,
        message: `Heavy rainfall: ${rainMM.toFixed(1)}mm`
      })
    }
    if (heatIndex > THRESHOLDS.heat) {
      triggered.push({
        type: 'heat',
        value: heatIndex,
        message: `High heat index: ${heatIndex.toFixed(1)}°C`
      })
    }
    if (aqi > THRESHOLDS.aqi) {
      triggered.push({
        type: 'aqi',
        value: aqi,
        message: `Poor air quality: AQI ${aqi.toFixed(0)}`
      })
    }

    return {
      triggered,
      weather: {
        temp,
        rainMM,
        heatIndex,
        aqi,
        humidity,
        city: location.city
      }
    }
  } catch (error) {
    console.error('Weather trigger check error:', error.message)
    return { triggered: [], weather: null, error: error.message }
  }
}

/**
 * Check all active users and process weather triggers
 * Call this via cron job (every 30 minutes)
 */
export async function checkAllUserTriggers() {
  try {
    console.log('🌦️  Checking weather triggers for all users...')

    // Get all users with active policies
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, pin_code, name, email')

    if (usersError) throw usersError

    let processedCount = 0
    let triggeredCount = 0

    for (const user of users) {
      if (!user.pin_code) continue

      // Check triggers for this user
      const { triggered, weather } = await checkWeatherTriggers(user.pin_code)

      processedCount++

      if (triggered.length === 0) continue

      // Get user's active policy
      const { data: policy, error: policyError } = await supabase
        .from('policies')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .single()

      if (policyError || !policy) {
        console.warn(`No active policy for user ${user.id}`)
        continue
      }

      // Create claims for each trigger
      for (const trigger of triggered) {
        // Calculate payout amount (40-60% of max coverage)
        const payoutPercent = 0.4 + Math.random() * 0.2
        const payoutAmount = Math.round(policy.max_payout * payoutPercent)

        const { error: claimError } = await supabase
          .from('claims')
          .insert([{
            user_id: user.id,
            policy_id: policy.id,
            trigger: trigger.type,
            amount_triggered: trigger.value,
            amount_paid: payoutAmount,
            weather_data: weather,
            status: 'paid'
          }])

        if (!claimError) {
          triggeredCount++
          console.log(
            `✅ Auto-payout for ${user.name} (${user.pin_code}): ${trigger.type} → ₹${payoutAmount}`
          )

          // Send WhatsApp notification (if service available)
          // await sendPayoutNotification(user.phone, payoutAmount, trigger.type)
        }
      }
    }

    console.log(`✅ Processed ${processedCount} users, ${triggeredCount} payouts triggered`)
    return { processedCount, triggeredCount }
  } catch (error) {
    console.error('Check all triggers error:', error)
    return { error: error.message }
  }
}

export default { checkWeatherTriggers, checkAllUserTriggers }
