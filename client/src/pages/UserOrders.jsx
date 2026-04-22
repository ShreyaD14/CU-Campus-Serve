import { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, PackageCheck } from 'lucide-react';
import './Dashboards.css';

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getAll().then(res => {
      setOrders(res.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="page-wrapper container section">Loading orders...</div>;

  return (
    <div className="page-wrapper container section">
      <h1 className="mb-lg">My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state text-center py-2xl">
          <span style={{ fontSize: '3rem' }}>🧾</span>
          <h3>No orders yet</h3>
          <p className="text-secondary mt-sm">You haven't placed any orders.</p>
          <Link to="/" className="btn btn-primary mt-lg">Start Ordering</Link>
        </div>
      ) : (
        <div className="grid-2">
          {orders.map(order => {
            const isActive = !['delivered', 'cancelled'].includes(order.status);
            return (
              <Link to={`/track/${order.id}`} key={order.id} className={`card ${isActive ? 'active-order-card' : ''}`}>
                <div className="card-header flex justify-between p-md border-bottom">
                  <div>
                    <h4 className="font-bold text-lg">{order.shop_name}</h4>
                    <span className="text-xs text-secondary">{new Date(order.created_at).toLocaleString()}</span>
                  </div>
                  <span className={`badge status-${order.status}`}>
                    {order.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <div className="card-body p-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">₹{order.total_amount + (order.delivery_fee || 0)}</p>
                      <p className="text-sm text-secondary mt-xs">{order.delivery_type.toUpperCase()} • {order.location_name}</p>
                    </div>
                    <button className="btn btn-ghost" style={{ padding: '8px 12px' }}>
                      {isActive ? 'Track Order' : 'View Details'} <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  );
}
