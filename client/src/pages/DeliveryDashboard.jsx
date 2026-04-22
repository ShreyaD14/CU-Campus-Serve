import { useState, useEffect } from 'react';
import { deliveryAPI, orderAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Truck, MapPin, CheckCircle, Navigation } from 'lucide-react';
import './Dashboards.css';

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [locationTimer, setLocationTimer] = useState(null);

  useEffect(() => {
    fetchActive();
    // Simulate location updates if there's an active order
    return () => { if (locationTimer) clearInterval(locationTimer); };
  }, []);

  const fetchActive = () => {
    deliveryAPI.getActive().then(res => {
      setActiveOrders(res.data.data);
      setLoading(false);
      startLocationSimulation(res.data.data);
    });
  };

  const startLocationSimulation = (orders) => {
    if (locationTimer) clearInterval(locationTimer);
    if (orders.length === 0) return;
    
    // Pick the first out_for_delivery order to simulate movement
    const moving = orders.find(o => o.status === 'out_for_delivery');
    if (!moving) return;

    // Simulate agent moving from center to destination (fake coords)
    let lat = 30.7714;
    let lng = 76.5762;
    
    const timer = setInterval(() => {
      lat += (Math.random() - 0.2) * 0.0005; // Drift towards North generally
      lng += (Math.random() - 0.5) * 0.0005;
      deliveryAPI.updateLocation(lat, lng).catch(() => {});
    }, 5000);
    
    setLocationTimer(timer);
  };

  const toggleAvailability = async () => {
    try {
      await deliveryAPI.setAvailability(!isAvailable);
      setIsAvailable(!isAvailable);
      toast.success(isAvailable ? 'You are offline' : 'You are online');
    } catch(e) {
      toast.error('Failed to update status');
    }
  };

  const markDelivered = async (orderId) => {
    try {
      await orderAPI.updateStatus(orderId, 'delivered');
      toast.success('Order marked as delivered!');
      fetchActive();
    } catch(e) {
      toast.error('Failed to update order');
    }
  };

  if (loading) return <div className="page-wrapper container section">Loading...</div>;

  return (
    <div className="page-wrapper container section">
      <div className="flex justify-between items-center mb-lg">
        <div>
          <h1>Delivery Agent Panel</h1>
          <p className="text-secondary mt-xs">{user.name}</p>
        </div>
        <div className="flex items-center gap-sm">
          <span className="text-sm font-semibold">{isAvailable ? 'Online' : 'Offline'}</span>
          <label className="switch">
            <input type="checkbox" checked={isAvailable} onChange={toggleAvailability} />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      <h2 className="mb-md">Active Assignments</h2>

      <div className="order-list">
        {activeOrders.length === 0 ? (
          <div className="empty-state card">
            <span style={{ fontSize: '3rem' }}>🚵</span>
            <h3>No active deliveries</h3>
            <p>Waiting for new assignments...</p>
          </div>
        ) : activeOrders.map(order => (
          <div key={order.id} className="card order-card delivery-card">
            <div className="card-header bg-primary">
              <span className="font-bold text-white">#{order.order_number}</span>
              <span className="badge" style={{background: 'white', color: 'var(--primary)'}}>
                {order.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="card-body">
              <div className="delivery-steps">
                <div className="d-step">
                  <div className="d-icon"><Store size={16} /></div>
                  <div className="d-info">
                    <div className="text-xs text-secondary">Pickup From</div>
                    <div className="font-bold">{order.shop_name}</div>
                  </div>
                </div>
                <div className="d-line"></div>
                <div className="d-step">
                  <div className="d-icon drop"><MapPin size={16} /></div>
                  <div className="d-info">
                    <div className="text-xs text-secondary">Deliver To ({order.delivery_type})</div>
                    <div className="font-bold">{order.location_name}</div>
                  </div>
                </div>
              </div>

              <div className="divider"></div>

              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-secondary">Customer</div>
                  <div className="font-semibold">{order.customer_name} ({order.customer_phone})</div>
                </div>
                <div>
                  <div className="text-sm text-secondary">To Collect</div>
                  <div className="font-bold text-lg text-primary">₹{order.total_amount + (order.delivery_fee||0)}</div>
                </div>
              </div>

              <div className="action-buttons flex gap-sm mt-md">
                <a href={`tel:${order.customer_phone}`} className="btn btn-outline flex-1 justify-center">
                  Call Customer
                </a>
                {order.status === 'out_for_delivery' && (
                  <button className="btn btn-success flex-1 justify-center" onClick={() => markDelivered(order.id)}>
                    <CheckCircle size={16} /> Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
