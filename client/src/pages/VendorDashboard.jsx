import { useState, useEffect } from 'react';
import { orderAPI, shopAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../contexts/ToastContext';
import { Store, Clock, CheckCircle, Package, Truck, UtensilsCrossed, TrendingUp } from 'lucide-react';
import './Dashboards.css';

export default function VendorDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      orderAPI.getVendorOrders(),
      shopAPI.getAll().then(res => res.data.data.find(s => s.vendor_id === user.id))
    ]).then(([oRes, sData]) => {
      setOrders(oRes.data.data);
      if (sData) {
        setShop(sData);
        // Ask socket to join shop room for live alerts
        socket.emit('vendor:join', { shopId: sData.id });
      }
    }).finally(() => setLoading(false));
  }, [user.id, socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on('order:new', (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
      toast.success(`New order received! #${newOrder.order_number}`);
      // Play a sound in real app
    });
    return () => socket.off('order:new');
  }, [socket, toast]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success('Order status updated');
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const toggleShopStatus = async () => {
    if (!shop) return;
    try {
      await shopAPI.update(shop.id, { is_open: !shop.is_open });
      setShop({ ...shop, is_open: !shop.is_open });
      toast.success(shop.is_open ? 'Shop closed' : 'Shop opened');
    } catch (e) {
      toast.error('Failed to update shop status');
    }
  };

  if (loading) return <div className="page-wrapper container section">Loading dashboard...</div>;
  if (!shop) return <div className="page-wrapper container section">No shop assigned to your account.</div>;

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  const localDateStr = new Intl.DateTimeFormat('en-CA').format(new Date()); // YYYY-MM-DD
  const localMonthStr = localDateStr.substring(0, 7);
  
  const delivered = orders.filter(o => o.status === 'delivered');
  const dailyEarnings = delivered.filter(o => o.created_at && o.created_at.startsWith(localDateStr)).reduce((acc, o) => acc + (o.total_amount || 0), 0);
  const monthlyEarnings = delivered.filter(o => o.created_at && o.created_at.startsWith(localMonthStr)).reduce((acc, o) => acc + (o.total_amount || 0), 0);


  return (
    <div className="page-wrapper container section">
      <div className="flex justify-between items-center mb-lg">
        <div>
          <h1>Vendor Dashboard</h1>
          <p className="text-secondary mt-xs">{shop.name}</p>
        </div>
        <button 
          className={`btn ${shop.is_open ? 'btn-danger' : 'btn-success'}`}
          onClick={toggleShopStatus}
        >
          <Store size={18} /> {shop.is_open ? 'Close Shop' : 'Open Shop'}
        </button>
      </div>

      <div className="grid-4 mb-2xl">
        <div className="card stat-card">
          <div className="stat-icon"><UtensilsCrossed size={24} /></div>
          <div>
            <div className="stat-label">Active Orders</div>
            <div className="stat-value">{activeOrders.length}</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}><CheckCircle size={24} /></div>
          <div>
            <div className="stat-label">Completed Today</div>
            <div className="stat-value">{pastOrders.length}</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}><TrendingUp size={24} /></div>
          <div>
            <div className="stat-label">Day / Month Earnings</div>
            <div className="stat-value text-lg">₹{dailyEarnings} <span className="text-secondary text-sm">/ ₹{monthlyEarnings}</span></div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'var(--yellow-bg)', color: 'var(--yellow)' }}><Clock size={24} /></div>
          <div>
            <div className="stat-label">Avg Setup Time</div>
            <div className="stat-value">{shop.avg_delivery_time}m</div>
          </div>
        </div>
      </div>

      <h2 className="mb-md">Active Orders</h2>
      <div className="order-list">
        {activeOrders.length === 0 ? (
          <div className="empty-state card text-center p-2xl">
            <span style={{ fontSize: '3rem', opacity: 0.8, display: 'block', animation: 'bounce 2s ease-in-out infinite' }}>📋</span>
            <h3 className="mt-md">No active orders</h3>
            <p className="text-secondary mt-xs">New orders will appear here instantly</p>
          </div>
        ) : activeOrders.map(order => (
          <div key={order.id} className="card order-card">
            <div className="card-header flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)', padding: '16px 20px' }}>
              <div>
                <span className="font-bold">#{order.order_number}</span>
                <span className="text-secondary text-sm ml-sm">₹{order.total_amount}</span>
              </div>
              <span className={`badge status-${order.status}`}>
                {order.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
            <div className="card-body">
              <div className="flex gap-lg items-start">
                <div className="flex-1">
                  <div className="text-secondary text-sm mb-sm"><Clock size={14} className="inline mr-xs" /> {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  <div className="font-semibold">{order.customer_name} ({order.customer_phone})</div>
                  <div className="text-sm text-secondary mt-xs">{order.delivery_type.toUpperCase()} • {order.location_name}</div>

                  <div className="mt-sm glass rounded" style={{ border: '1px solid var(--border)', padding: '12px' }}>
                    <p className="text-xs font-semibold text-primary mb-xs" style={{ marginBottom: '8px' }}>Items to prepare:</p>
                    <ul className="text-sm" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                          <li key={item.id || idx} style={{ marginBottom: '4px', color: '#fff' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--yellow)', marginRight: '6px' }}>{item.quantity}x</span> 
                            {item.item_name || item.name || 'Unknown Item'}
                          </li>
                        ))
                      ) : (
                        <li style={{ color: 'var(--text-secondary)' }}>No items found for this order.</li>
                      )}
                    </ul>
                  </div>

                  {order.special_instructions && (
                    <div className="text-sm text-primary mt-sm italic">Note: {order.special_instructions}</div>
                  )}
                </div>
                
                <div className="action-buttons flex flex-col gap-sm">
                  {order.status === 'placed' && (
                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(order.id, 'preparing')}>
                      <Package size={14} /> Accept & Prepare
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button className="btn btn-success btn-sm" onClick={() => updateStatus(order.id, order.delivery_type === 'pickup' ? 'ready_for_pickup' : 'out_for_delivery')}>
                      <CheckCircle size={14} /> Ready
                    </button>
                  )}
                  {order.status === 'ready_for_pickup' && (
                    <button className="btn btn-outline btn-sm" onClick={() => updateStatus(order.id, 'delivered')}>
                      <CheckCircle size={14} /> Handed Over
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
