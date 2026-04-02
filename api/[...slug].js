import app from '../backend/server-simple.js';

export default function (req, res) {
  if (!req.url.startsWith('/api') && req.url !== '/health') {
    req.url = '/api' + (req.url === '/' ? '' : req.url);
  }
  return app(req, res);
}
