import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Home, MapPin, ShoppingCart, ClipboardList, LogOut, Store, Truck, Shield, User } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          🍽️ <span>Campus</span>Serve
        </Link>
        <div className="navbar-links">
          <Link to="/" className={isActive('/')}>
            <Home size={18} /> <span>Home</span>
          </Link>
          <Link to="/map" className={isActive('/map')}>
            <MapPin size={18} /> <span>Map</span>
          </Link>
          <Link to="/orders" className={isActive('/orders')}>
            <ClipboardList size={18} /> <span>Orders</span>
          </Link>

          {user?.role === 'vendor' && (
            <Link to="/vendor" className={isActive('/vendor')}>
              <Store size={18} /> <span>Dashboard</span>
            </Link>
          )}
          {user?.role === 'delivery' && (
            <Link to="/delivery" className={isActive('/delivery')}>
              <Truck size={18} /> <span>Deliveries</span>
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className={isActive('/admin')}>
              <Shield size={18} /> <span>Admin</span>
            </Link>
          )}

          <Link to="/cart" className={isActive('/cart')} style={{ position: 'relative' }}>
            <ShoppingCart size={18} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>

          <button onClick={logout} className="nav-link" title="Logout" style={{ background: 'none' }}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
