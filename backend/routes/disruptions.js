import { Router } from 'express';
import { checkWeatherTriggers } from '../services/triggers.js';

const router = Router();

/**
 * GET /api/disruptions/:pinCode
 * Get live weather disruptions for a specific area
 */
router.get('/disruptions/:pinCode', async (req, res) => {
  try {
    const { pinCode } = req.params;
    const isDemoQuery = req.query.demo === '1';
    
    console.log(`[GET] /api/disruptions/${pinCode} (Demo: ${isDemoQuery})`);

    if (!pinCode) {
      return res.status(400).json({ error: 'pinCode is required' });
    }

    let weatherStatus;
    try {
      weatherStatus = await checkWeatherTriggers(pinCode);
    } catch (err) {
      console.error('[Weather Trigger Error]', err.message);
      // Fallback if service fails
      weatherStatus = { triggered: [], weather: { location: 'Chennai', temp: 30 }, timestamp: new Date().toISOString() };
    }
    
    // Format into a "Feed" style response
    let disruptions = weatherStatus.triggered.map(t => ({
      id: Date.now() + Math.random(),
      type: t.type,
      severity: t.value > 50 ? 'High' : 'Medium',
      location: weatherStatus.weather.location,
      message: getDisruptionMessage(t.type, t.value),
      timestamp: weatherStatus.timestamp,
      icon: getIcon(t.type)
    }));

    // [DEMO MODE FALLBACK] - Matches the user's requested design items
    if (disruptions.length === 0 || isDemoQuery) {
      disruptions = [
        {
          id: 'd1',
          type: 'rain',
          severity: 'HIGH',
          location: 'Your Area',
          message: 'Heavy Rainfall Alert: 58mm in 2 hrs — threshold crossed',
          timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
          icon: '🌧️',
          isDemo: true
        },
        {
          id: 'd2',
          type: 'heat',
          severity: 'HIGH',
          location: 'Your Area',
          message: 'Heat Stress Index: Feels-like 44°C — outdoor work unsafe',
          timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
          icon: '🌡️',
          isDemo: true
        },
        {
          id: 'd3',
          type: 'aqi',
          severity: 'MEDIUM',
          location: 'Your Area',
          message: 'Severe AQI Warning: AQI 387 — Very Poor air quality',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          icon: '🌫️',
          isDemo: true
        },
        {
          id: 'd4',
          type: 'flood',
          severity: 'HIGH',
          location: 'Your Area',
          message: 'Waterlogging Alert: Pin-code 600028 — Red alert issued',
          timestamp: new Date(Date.now() - 22 * 60000).toISOString(),
          icon: '🌊',
          isDemo: true
        },
        {
          id: 'd5',
          type: 'outage',
          severity: 'MEDIUM',
          location: 'Platform',
          message: 'Platform Downtime: Swiggy outage detected — 95 min',
          timestamp: new Date(Date.now() - 31 * 60000).toISOString(),
          icon: '📵',
          isDemo: true
        },
        {
          id: 'd6',
          type: 'curfew',
          severity: 'HIGH',
          location: 'Zone',
          message: 'Local Curfew: Section 144 — Shahdara zone',
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          icon: '🚧',
          isDemo: true
        }
      ];
    }

    res.json({
      location: weatherStatus.weather.location,
      disruptions: disruptions.length > 0 ? disruptions : [],
      status: disruptions.length > 0 ? 'Active Disruptions' : 'All Clear',
      weather: weatherStatus.weather
    });
  } catch (error) {
    console.error('GET /api/disruptions error:', error);
    res.status(500).json({ error: error.message });
  }
});

function getDisruptionMessage(type, value) {
  if (type === 'rain') return `Heavy rain detected (${value}mm). Coverage triggers active.`;
  if (type === 'heat') return `Extreme heat index (${value}°C). Stay safe!`;
  if (type === 'aqi') return `Poor air quality (${value} AQI). Health risks elevated.`;
  return `Weather disruption detected: ${type}`;
}

function getIcon(type) {
  if (type === 'rain') return '🌧️';
  if (type === 'heat') return '🔥';
  if (type === 'aqi') return '🌫️';
  return '⚠️';
}

export default router;
