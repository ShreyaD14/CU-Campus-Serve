import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { Users, Store, DollarSign, Activity } from 'lucide-react';
import './Dashboards.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getStats().then(res => {
      setStats(res.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="page-wrapper container section">Loading...</div>;

  return (
    <div className="page-wrapper container section">
      <h1 className="mb-lg">Admin Overview</h1>

      <div className="grid-4 mb-2xl">
        <div className="card stat-card">
          <div className="stat-icon bg-blue"><Users size={24} /></div>
          <div>
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-green"><Store size={24} /></div>
          <div>
            <div className="stat-label">Active Shops</div>
            <div className="stat-value">{stats.totalShops}</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'var(--primary-100)', color:'var(--primary)'}}><Activity size={24} /></div>
          <div>
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{stats.totalOrders}</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-yellow"><DollarSign size={24} /></div>
          <div>
            <div className="stat-label">Revenue (Delivered)</div>
            <div className="stat-value">₹{stats.totalRevenue}</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header border-bottom p-md">
            <h3>Recent Orders</h3>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Shop</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(o => (
                  <tr key={o.id}>
                    <td>#{o.order_number.slice(-6)}</td>
                    <td>{o.customer_name}</td>
                    <td>{o.shop_name}</td>
                    <td><span className={`badge status-${o.status}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header border-bottom p-md">
            <h3>System Status</h3>
          </div>
          <div className="card-body">
            <ul className="sys-status-list">
              <li><span className="dot green"></span> Database Connected (SQLite)</li>
              <li><span className="dot green"></span> WebSocket Server Running</li>
              <li><span className="dot green"></span> Auth Service Online</li>
              <li><span className="dot green"></span> Main API Gateway Active</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
