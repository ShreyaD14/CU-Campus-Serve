const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/shops — all shops (optional cluster filter)
router.get('/', asyncHandler(async (req, res) => {
  const { cluster_id, search, open } = req.query;
  let query = `
    SELECT s.*, c.name as cluster_name, c.icon as cluster_icon
    FROM shops s JOIN clusters c ON s.cluster_id = c.id
    WHERE 1=1
  `;
  const params = [];
  if (cluster_id) { query += ' AND s.cluster_id = ?'; params.push(cluster_id); }
  if (search) { query += ' AND (s.name LIKE ? OR s.cuisine_tags LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (open === 'true') { query += ' AND s.is_open = 1'; }
  query += ' ORDER BY s.rating DESC';
  res.json({ success: true, data: db.prepare(query).all(...params) });
}));

// GET /api/shops/clusters — all clusters
router.get('/clusters', asyncHandler(async (req, res) => {
  const clusters = db.prepare('SELECT * FROM clusters ORDER BY name').all();
  res.json({ success: true, data: clusters });
}));

// GET /api/shops/:id — shop detail
router.get('/:id', asyncHandler(async (req, res) => {
  const shop = db.prepare(`
    SELECT s.*, c.name as cluster_name, c.icon as cluster_icon
    FROM shops s JOIN clusters c ON s.cluster_id = c.id WHERE s.id = ?
  `).get(req.params.id);
  if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
  res.json({ success: true, data: shop });
}));

// GET /api/shops/:id/menu — shop menu
router.get('/:id/menu', asyncHandler(async (req, res) => {
  const items = db.prepare('SELECT * FROM menu_items WHERE shop_id = ? ORDER BY category, name').all(req.params.id);
  // Group by category
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
  res.json({ success: true, data: items, grouped });
}));

// PUT /api/shops/:id — update shop (vendor/admin)
router.put('/:id', authenticate, requireRole('vendor', 'admin'), asyncHandler(async (req, res) => {
  const { is_open, avg_delivery_time, description } = req.body;
  db.prepare(`
    UPDATE shops SET is_open = COALESCE(?, is_open),
    avg_delivery_time = COALESCE(?, avg_delivery_time),
    description = COALESCE(?, description)
    WHERE id = ?
  `).run(is_open, avg_delivery_time, description, req.params.id);
  res.json({ success: true, message: 'Shop updated' });
}));

// PUT /api/shops/:shopId/menu/:itemId — toggle item availability
router.put('/:shopId/menu/:itemId', authenticate, requireRole('vendor', 'admin'), asyncHandler(async (req, res) => {
  const { is_available, price } = req.body;
  db.prepare('UPDATE menu_items SET is_available = COALESCE(?, is_available), price = COALESCE(?, price) WHERE id = ? AND shop_id = ?')
    .run(is_available, price, req.params.itemId, req.params.shopId);
  res.json({ success: true, message: 'Menu item updated' });
}));

module.exports = router;
