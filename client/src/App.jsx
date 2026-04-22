import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';

// Components
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import ShopDetail from './pages/ShopDetail';
import Cart from './pages/Cart';
import OrderTracking from './pages/OrderTracking';
import CampusMap from './pages/CampusMap';
import UserOrders from './pages/UserOrders';
import VendorDashboard from './pages/VendorDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  
  return children;
};

// Main App container
function AppContent() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Core Common Routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/shop/:id" element={<ProtectedRoute><ShopDetail /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/track/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><CampusMap /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><UserOrders /></ProtectedRoute>} />

        {/* Role Specific Routes */}
        <Route path="/vendor" element={
          <ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorDashboard /></ProtectedRoute>
        } />
        
        <Route path="/delivery" element={
          <ProtectedRoute allowedRoles={['delivery', 'admin']}><DeliveryDashboard /></ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Router>
            <AppContent />
          </Router>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
