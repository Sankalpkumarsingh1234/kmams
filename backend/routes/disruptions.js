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
    
    if (!pinCode) {
      return res.status(400).json({ error: 'pinCode is required' });
    }

    const weatherStatus = await checkWeatherTriggers(pinCode);
    
    // Format into a "Feed" style response
    const disruptions = weatherStatus.triggered.map(t => ({
      id: Date.now() + Math.random(),
      type: t.type,
      severity: t.value > 50 ? 'High' : 'Medium',
      location: weatherStatus.weather.location,
      message: getDisruptionMessage(t.type, t.value),
      timestamp: weatherStatus.timestamp,
      icon: getIcon(t.type)
    }));

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
