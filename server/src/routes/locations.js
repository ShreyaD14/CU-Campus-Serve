const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/locations — all
router.get('/', asyncHandler(async (req, res) => {
  const data = db.prepare('SELECT * FROM locations ORDER BY type, name').all();
  res.json({ success: true, data });
}));

// GET /api/locations/hostels
router.get('/hostels', asyncHandler(async (req, res) => {
  const data = db.prepare("SELECT * FROM locations WHERE type = 'hostel' ORDER BY name").all();
  res.json({ success: true, data });
}));

// GET /api/locations/pickup-points
router.get('/pickup-points', asyncHandler(async (req, res) => {
  const data = db.prepare("SELECT * FROM locations WHERE type = 'pickup_point' ORDER BY name").all();
  res.json({ success: true, data });
}));

// GET /api/locations/nearest-pickup?lat=&lng=
router.get('/nearest-pickup', asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });
  const points = db.prepare("SELECT * FROM locations WHERE type = 'pickup_point'").all();
  let nearest = null, minDist = Infinity;
  for (const p of points) {
    const d = Math.hypot(p.latitude - parseFloat(lat), p.longitude - parseFloat(lng));
    if (d < minDist) { minDist = d; nearest = p; }
  }
  res.json({ success: true, data: nearest });
}));

module.exports = router;
