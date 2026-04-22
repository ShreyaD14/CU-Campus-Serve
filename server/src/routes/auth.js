const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// POST /api/auth/send-otp
router.post('/send-otp', asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone || !/^\d{10,15}$/.test(phone)) {
    return res.status(400).json({ success: false, message: 'Valid phone number required' });
  }
  // Mock OTP - in production integrate Twilio/MSG91
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO otps (phone, otp, expires_at) VALUES (?, ?, ?)').run(phone, otp, expiresAt);
  console.log(`📱 OTP for ${phone}: ${otp}`); // visible in server logs
  res.json({ success: true, message: 'OTP sent successfully', dev_otp: otp });
}));

// POST /api/auth/verify-otp
router.post('/verify-otp', asyncHandler(async (req, res) => {
  const { phone, otp, name, uid } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP required' });
  }

  // For demo: accept any 6-digit OTP
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ success: false, message: 'OTP must be 6 digits' });
  }

  // Get or create user
  let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  if (!user) {
    const result = db.prepare('INSERT INTO users (phone, name, uid, role) VALUES (?, ?, ?, ?)').run(
      phone, name || 'Campus User', uid || null, 'user'
    );
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: { id: user.id, name: user.name, phone: user.phone, role: user.role, uid: user.uid },
  });
}));

// GET /api/auth/me
const { authenticate } = require('../middleware/auth');
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  res.json({ success: true, user: {
    id: req.user.id, name: req.user.name, phone: req.user.phone,
    role: req.user.role, uid: req.user.uid, created_at: req.user.created_at,
  }});
}));

module.exports = router;
