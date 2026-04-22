const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/users/profile
router.get('/profile', authenticate, asyncHandler(async (req, res) => {
  const user = db.prepare('SELECT id,name,phone,uid,role,created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({ success: true, data: user });
}));

// PUT /api/users/profile
router.put('/profile', authenticate, asyncHandler(async (req, res) => {
  const { name, uid } = req.body;
  db.prepare('UPDATE users SET name = COALESCE(?, name), uid = COALESCE(?, uid) WHERE id = ?')
    .run(name, uid, req.user.id);
  res.json({ success: true, message: 'Profile updated' });
}));

// GET /api/users — admin only
router.get('/', authenticate, requireRole('admin'), asyncHandler(async (req, res) => {
  const users = db.prepare('SELECT id,name,phone,uid,role,created_at FROM users ORDER BY created_at DESC').all();
  res.json({ success: true, data: users });
}));

// GET /api/users/stats — admin stats
router.get('/stats', authenticate, requireRole('admin'), asyncHandler(async (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get();
  const totalRevenue = db.prepare('SELECT SUM(total_amount) as total FROM orders WHERE status = "delivered"').get();
  const totalShops = db.prepare('SELECT COUNT(*) as count FROM shops').get();
  const recentOrders = db.prepare(`
    SELECT o.*, s.name as shop_name, u.name as customer_name
    FROM orders o JOIN shops s ON o.shop_id = s.id JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC LIMIT 10
  `).all();
  res.json({ success: true, data: {
    totalUsers: totalUsers.count, totalOrders: totalOrders.count,
    totalRevenue: totalRevenue.total || 0, totalShops: totalShops.count,
    recentOrders,
  }});
}));

module.exports = router;
