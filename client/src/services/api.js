import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 10000 });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cs_token');
      localStorage.removeItem('cs_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (phone, otp, name, uid) => api.post('/auth/verify-otp', { phone, otp, name, uid }),
  me: () => api.get('/auth/me'),
};

// Shops
export const shopAPI = {
  getAll: (params) => api.get('/shops', { params }),
  getClusters: () => api.get('/shops/clusters'),
  getById: (id) => api.get(`/shops/${id}`),
  getMenu: (id) => api.get(`/shops/${id}/menu`),
  update: (id, data) => api.put(`/shops/${id}`, data),
  updateMenuItem: (shopId, itemId, data) => api.put(`/shops/${shopId}/menu/${itemId}`, data),
};

// Orders
export const orderAPI = {
  place: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getVendorOrders: () => api.get('/orders/vendor'),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Locations
export const locationAPI = {
  getAll: () => api.get('/locations'),
  getHostels: () => api.get('/locations/hostels'),
  getPickupPoints: () => api.get('/locations/pickup-points'),
  getNearestPickup: (lat, lng) => api.get('/locations/nearest-pickup', { params: { lat, lng } }),
};

// Delivery
export const deliveryAPI = {
  getAgents: () => api.get('/delivery/agents'),
  assignAgent: (orderId, agentUserId) => api.put(`/delivery/assign/${orderId}`, { agent_user_id: agentUserId }),
  updateLocation: (lat, lng) => api.put('/delivery/location', { latitude: lat, longitude: lng }),
  getActive: () => api.get('/delivery/active'),
  setAvailability: (isAvailable) => api.put('/delivery/availability', { is_available: isAvailable }),
};

// Users
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAllUsers: () => api.get('/users'),
  getStats: () => api.get('/users/stats'),
};

export default api;
