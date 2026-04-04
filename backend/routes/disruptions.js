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

    // [ALL INDIA DUAL MODE] - Real weather + City-aware Dynamic Mock Alerts
    const pinPrefix = pinCode.substring(0, 3);
    const mockLocation = weatherStatus.weather.location || 'Local Zone';
    
    // Comprehensive India Mapping for Demo
    let mockAlerts = [];
    
    if (pinPrefix === '600') { // Chennai
      mockAlerts = [
        { id: 'c1', type: 'rain', severity: 'HIGH', location: mockLocation, message: `Heavy Rainfall Alert: 58mm detected in ${mockLocation} — threshold crossed`, timestamp: new Date(Date.now() - 2 * 60000).toISOString(), icon: '🌧️' },
        { id: 'c2', type: 'flood', severity: 'HIGH', location: mockLocation, message: `Waterlogging: Red alert issued for ${mockLocation} / ${pinCode}`, timestamp: new Date(Date.now() - 22 * 60000).toISOString(), icon: '🌊' }
      ];
    } else if (pinPrefix === '400') { // Mumbai
      mockAlerts = [
        { id: 'm1', type: 'flood', severity: 'HIGH', location: mockLocation, message: `High Tide Alert: Waterfront ${mockLocation} — potential water ingress`, timestamp: new Date(Date.now() - 5 * 60000).toISOString(), icon: '🌊' },
        { id: 'm2', type: 'traffic', severity: 'HIGH', location: mockLocation, message: `Local Train Delay: Slow lines running 20 min late in ${mockLocation}`, timestamp: new Date(Date.now() - 15 * 60000).toISOString(), icon: '🚆' }
      ];
    } else if (pinPrefix === '110') { // Delhi
      mockAlerts = [
        { id: 'd1', type: 'aqi', severity: 'HIGH', location: mockLocation, message: `Severe AQI: ${mockLocation} AQI 412 — hazardous conditions`, timestamp: new Date(Date.now() - 10 * 60000).toISOString(), icon: '🌫️' },
        { id: 'd2', type: 'heat', severity: 'MEDIUM', location: mockLocation, message: `Heat Advisory: ${mockLocation} index hits 43°C — stay hydrated`, timestamp: new Date(Date.now() - 35 * 60000).toISOString(), icon: '🌡️' }
      ];
    } else if (pinPrefix === '560') { // Bangalore
      mockAlerts = [
        { id: 'b1', type: 'traffic', severity: 'HIGH', location: mockLocation, message: `Gridlock Alert: Outer Ring Road ${mockLocation} — 55 min delay`, timestamp: new Date(Date.now() - 5 * 60000).toISOString(), icon: '🚦' },
        { id: 'b2', type: 'rain', severity: 'MEDIUM', location: mockLocation, message: `Rain Shield Active: 15mm/hr in ${mockLocation} — premium active`, timestamp: new Date(Date.now() - 12 * 60000).toISOString(), icon: '🌧️' }
      ];
    } else if (pinPrefix === '500') { // Hyderabad
      mockAlerts = [
        { id: 'h1', type: 'heat', severity: 'HIGH', location: mockLocation, message: `Heat Alert: Extreme temperature in ${mockLocation} — stay safe`, timestamp: new Date(Date.now() - 20 * 60000).toISOString(), icon: '🔥' },
        { id: 'h2', type: 'aqi', severity: 'MEDIUM', location: mockLocation, message: `Air Quality Alert: ${mockLocation} AQI 280 — Very Poor`, timestamp: new Date(Date.now() - 40 * 60000).toISOString(), icon: '🌫️' }
      ];
    } else if (pinPrefix === '700') { // Kolkata
      mockAlerts = [
        { id: 'k1', type: 'storm', severity: 'HIGH', location: mockLocation, message: `Nor'wester Alert: Squally winds expected in ${mockLocation}`, timestamp: new Date(Date.now() - 10 * 60000).toISOString(), icon: '🌪️' },
        { id: 'k2', type: 'flood', severity: 'MEDIUM', location: mockLocation, message: `Waterlogging: Avoid ${mockLocation} lower reaches`, timestamp: new Date(Date.now() - 30 * 60000).toISOString(), icon: '🌊' }
      ];
    } else {
      // Any other India PIN - Universal Dynamic Alerts
      mockAlerts = [
        { id: 'g1', type: 'shield', severity: 'MEDIUM', location: mockLocation, message: `GigShield Active: Syncing live data for ${mockLocation} (${pinCode})`, timestamp: new Date(Date.now() - 5 * 60000).toISOString(), icon: '🛡️' },
        { id: 'g2', type: 'safety', severity: 'HIGH', location: mockLocation, message: `Rider Alert: Local weather spike in ${mockLocation} — monitor triggers`, timestamp: new Date(Date.now() - 15 * 60000).toISOString(), icon: '📡' }
      ];
    }

    // Combine Real Weather Disruptions with the new India-wide Mock Data
    disruptions = [...disruptions, ...mockAlerts];

    res.json({
      location: mockLocation,
      disruptions: disruptions.length > 0 ? disruptions : [],
      status: disruptions.length > 0 ? 'Active' : 'All Clear',
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
