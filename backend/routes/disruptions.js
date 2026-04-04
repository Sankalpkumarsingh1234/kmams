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

    // [DYNAMIC DUAL MODE] - Real weather + Location-specific Mock Alerts
    const pinPrefix = pinCode.substring(0, 3);
    const mockLocation = weatherStatus.weather.location || 'Your Area';
    
    // Default Mock Alerts
    let mockAlerts = [];
    
    if (pinPrefix === '600') {
      // Chennai Specific
      mockAlerts = [
        {
          id: 'c1', type: 'rain', severity: 'HIGH', location: mockLocation,
          message: 'Heavy Rainfall Alert: 58mm in 2 hrs — threshold crossed',
          timestamp: new Date(Date.now() - 2 * 60000).toISOString(), icon: '🌧️',
        },
        {
          id: 'c2', type: 'flood', severity: 'HIGH', location: mockLocation,
          message: `Waterlogging Alert: Pin-code ${pinCode} — Red alert in ${mockLocation}`,
          timestamp: new Date(Date.now() - 22 * 60000).toISOString(), icon: '🌊',
        }
      ];
    } else if (pinPrefix === '110') {
      // Delhi Specific
      mockAlerts = [
        {
          id: 'd1', type: 'aqi', severity: 'HIGH', location: mockLocation,
          message: 'Severe AQI Warning: AQI 412 — Hazardous air quality in Delhi NCR',
          timestamp: new Date(Date.now() - 10 * 60000).toISOString(), icon: '🌫️',
        },
        {
          id: 'd2', type: 'heat', severity: 'MEDIUM', location: mockLocation,
          message: 'Heat Stress Index: Feels-like 43°C — outdoor work advisory',
          timestamp: new Date(Date.now() - 35 * 60000).toISOString(), icon: '🌡️',
        }
      ];
    } else if (pinPrefix === '560') {
      // Bangalore Specific
      mockAlerts = [
        {
          id: 'b1', type: 'traffic', severity: 'HIGH', location: mockLocation,
          message: 'Traffic Jam Alert: Silk Board junction — 45 min delay',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(), icon: '🚦',
        },
        {
          id: 'b2', type: 'rain', severity: 'MEDIUM', location: mockLocation,
          message: 'Sudden Rain Alert: 12mm in Whitefield — stay covered',
          timestamp: new Date(Date.now() - 12 * 60000).toISOString(), icon: '🌧️',
        }
      ];
    } else {
      // Generic Fallback
      mockAlerts = [
        {
          id: 'g1', type: 'shield', severity: 'MEDIUM', location: mockLocation,
          message: `GigShield Active: Syncing live data for zone ${pinCode}`,
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(), icon: '🛡️',
        },
        {
          id: 'g2', type: 'safety', severity: 'HIGH', location: mockLocation,
          message: 'Rider Safety Alert: Extreme humidity detected — stay hydrated',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(), icon: '🥤',
        }
      ];
    }

    // Combine Real Disruptions with Mock Data for Demo
    disruptions = [...disruptions, ...mockAlerts];

    res.json({
      location: mockLocation,
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
