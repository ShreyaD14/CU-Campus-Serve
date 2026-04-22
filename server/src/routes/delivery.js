const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { getIO } = require('../sockets/orderSocket');

// GET /api/delivery/agents — available agents
router.get('/agents', authenticate, asyncHandler(async (req, res) => {
  const agents = db.prepare(`
    SELECT u.id, u.name, u.phone, da.is_available, da.rating, da.total_deliveries,
           da.current_latitude, da.current_longitude, da.vehicle_type
    FROM delivery_agents da JOIN users u ON da.user_id = u.id
    WHERE da.is_available = 1
  `).all();
  res.json({ success: true, data: agents });
}));

// PUT /api/delivery/assign/:orderId — assign agent
router.put('/assign/:orderId', authenticate, requireRole('vendor', 'admin'), asyncHandler(async (req, res) => {
  const { agent_user_id } = req.body;
  db.prepare('UPDATE orders SET delivery_agent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(agent_user_id, req.params.orderId);
  db.prepare('UPDATE delivery_agents SET is_available = 0 WHERE user_id = ?').run(agent_user_id);

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.orderId);
  try {
    getIO().to(`order-${req.params.orderId}`).emit('delivery:assigned', { orderId: req.params.orderId, agentId: agent_user_id });
  } catch(e) {}

  res.json({ success: true, message: 'Agent assigned', data: order });
}));

// PUT /api/delivery/location — agent updates location
router.put('/location', authenticate, requireRole('delivery'), asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  db.prepare('UPDATE delivery_agents SET current_latitude = ?, current_longitude = ? WHERE user_id = ?')
    .run(latitude, longitude, req.user.id);

  // Notify all orders this agent is working on
  const activeOrders = db.prepare(
    "SELECT id FROM orders WHERE delivery_agent_id = ? AND status = 'out_for_delivery'"
  ).all(req.user.id);
  try {
    for (const o of activeOrders) {
      getIO().to(`order-${o.id}`).emit('delivery:locationUpdate', { lat: latitude, lng: longitude });
    }
  } catch(e) {}

  res.json({ success: true });
}));

// GET /api/delivery/active — agent's active deliveries
router.get('/active', authenticate, requireRole('delivery'), asyncHandler(async (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, s.name as shop_name, u.name as customer_name, u.phone as customer_phone, l.name as location_name
    FROM orders o JOIN shops s ON o.shop_id = s.id JOIN users u ON o.user_id = u.id JOIN locations l ON o.delivery_location_id = l.id
    WHERE o.delivery_agent_id = ? AND o.status NOT IN ('delivered','cancelled')
  `).all(req.user.id);
  res.json({ success: true, data: orders });
}));

// PUT /api/delivery/availability — toggle agent availability
router.put('/availability', authenticate, requireRole('delivery'), asyncHandler(async (req, res) => {
  const { is_available } = req.body;
  db.prepare('UPDATE delivery_agents SET is_available = ? WHERE user_id = ?').run(is_available ? 1 : 0, req.user.id);
  res.json({ success: true, message: 'Availability updated' });
}));

module.exports = router;
