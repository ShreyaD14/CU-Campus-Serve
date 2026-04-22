const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { getIO } = require('../sockets/orderSocket');

function generateOrderNumber() {
  return 'CS' + Date.now().toString().slice(-8);
}

// POST /api/orders — place order
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { shop_id, items, delivery_location_id, delivery_type, special_instructions } = req.body;
  if (!shop_id || !items?.length || !delivery_location_id || !delivery_type) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // Calculate total
  let total = 0;
  const validatedItems = [];
  for (const item of items) {
    const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ? AND shop_id = ? AND is_available = 1').get(item.menu_item_id, shop_id);
    if (!menuItem) return res.status(400).json({ success: false, message: `Item ${item.menu_item_id} not available` });
    total += menuItem.price * item.quantity;
    validatedItems.push({ ...item, price: menuItem.price, name: menuItem.name });
  }

  const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(shop_id);
  const deliveryFee = delivery_type === 'hostel' ? 20 : 0;

  const placeOrder = db.transaction(() => {
    const order = db.prepare(`
      INSERT INTO orders (order_number, user_id, shop_id, delivery_location_id, delivery_type,
        status, total_amount, delivery_fee, estimated_time, special_instructions)
      VALUES (?, ?, ?, ?, ?, 'placed', ?, ?, ?, ?)
    `).run(generateOrderNumber(), req.user.id, shop_id, delivery_location_id, delivery_type,
           total, deliveryFee, shop?.avg_delivery_time || 30, special_instructions || null);

    const orderId = order.lastInsertRowid;
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, menu_item_id, quantity, price, item_name) VALUES (?, ?, ?, ?, ?)
    `);
    for (const it of validatedItems) insertItem.run(orderId, it.menu_item_id, it.quantity, it.price, it.name);

    const placedOrder = db.prepare(`
      SELECT o.*, s.name as shop_name, l.name as location_name, u.name as customer_name, u.phone as customer_phone
      FROM orders o JOIN shops s ON o.shop_id = s.id JOIN locations l ON o.delivery_location_id = l.id JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `).get(orderId);
    return { ...placedOrder, items: validatedItems.map(it => ({ id: it.menu_item_id, item_name: it.name, quantity: it.quantity, price: it.price })) };
  });

  const newOrder = placeOrder();

  // Notify vendor via socket
  try {
    getIO().to(`vendor-${shop_id}`).emit('order:new', newOrder);
  } catch(e) {}

  res.status(201).json({ success: true, message: 'Order placed!', data: newOrder });
}));

// GET /api/orders — user's orders
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT o.*, s.name as shop_name, l.name as location_name
    FROM orders o JOIN shops s ON o.shop_id = s.id JOIN locations l ON o.delivery_location_id = l.id
    WHERE o.user_id = ?
  `;
  const params = [req.user.id];
  if (status) { query += ' AND o.status = ?'; params.push(status); }
  query += ' ORDER BY o.created_at DESC';
  res.json({ success: true, data: db.prepare(query).all(...params) });
}));

// GET /api/orders/vendor — vendor's orders
router.get('/vendor', authenticate, requireRole('vendor', 'admin'), asyncHandler(async (req, res) => {
  const vendor = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const shop = db.prepare('SELECT * FROM shops WHERE vendor_id = ?').get(req.user.id);
  let orders;
  if (req.user.role === 'admin') {
    orders = db.prepare(`
      SELECT o.*, s.name as shop_name, u.name as customer_name, u.phone as customer_phone, l.name as location_name
      FROM orders o JOIN shops s ON o.shop_id = s.id JOIN users u ON o.user_id = u.id JOIN locations l ON o.delivery_location_id = l.id
      ORDER BY o.created_at DESC LIMIT 100
    `).all();
  } else {
    if (!shop) return res.status(404).json({ success: false, message: 'No shop found for this vendor' });
    orders = db.prepare(`
      SELECT o.*, s.name as shop_name, u.name as customer_name, u.phone as customer_phone, l.name as location_name
      FROM orders o JOIN shops s ON o.shop_id = s.id JOIN users u ON o.user_id = u.id JOIN locations l ON o.delivery_location_id = l.id
      WHERE o.shop_id = ? ORDER BY o.created_at DESC
    `).all(shop.id);
  }

  const orderItemsFetch = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  const enrichedOrders = orders.map(o => ({ ...o, items: orderItemsFetch.all(o.id) }));

  res.json({ success: true, data: enrichedOrders });
}));

// GET /api/orders/:id
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const order = db.prepare(`
    SELECT o.*, s.name as shop_name, s.avg_delivery_time,
           l.name as location_name, l.latitude as loc_lat, l.longitude as loc_lng,
           u.name as customer_name, u.phone as customer_phone,
           da_user.name as agent_name, da_user.phone as agent_phone,
           da.rating as agent_rating
    FROM orders o
    JOIN shops s ON o.shop_id = s.id
    JOIN locations l ON o.delivery_location_id = l.id
    JOIN users u ON o.user_id = u.id
    LEFT JOIN users da_user ON o.delivery_agent_id = da_user.id
    LEFT JOIN delivery_agents da ON da.user_id = o.delivery_agent_id
    WHERE o.id = ?
  `).get(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);
  res.json({ success: true, data: { ...order, items: orderItems } });
}));

// PUT /api/orders/:id/status — update order status
router.put('/:id/status', authenticate, requireRole('vendor', 'delivery', 'admin'), asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'ready_for_pickup', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

  // Emit to order's room
  try {
    getIO().to(`order-${req.params.id}`).emit('order:statusUpdate', { orderId: req.params.id, status, order });
  } catch(e) {}

  res.json({ success: true, message: 'Status updated', data: { status } });
}));

module.exports = router;
