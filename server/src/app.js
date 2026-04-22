const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shops');
const orderRoutes = require('./routes/orders');
const locationRoutes = require('./routes/locations');
const deliveryRoutes = require('./routes/delivery');
const userRoutes = require('./routes/users');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'CampusServe API' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/users', userRoutes);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
