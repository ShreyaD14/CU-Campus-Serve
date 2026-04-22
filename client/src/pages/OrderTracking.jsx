import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useOrderTracking } from '../hooks/useSocket';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Phone, Clock, MapPin, CheckCircle, Package, Truck, Store, ArrowLeft } from 'lucide-react';
import './OrderTracking.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const locationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Real-time hook
  const { status: liveStatus, agentLocation } = useOrderTracking(id);
  
  // Combine static and live data
  const currentStatus = liveStatus || order?.status;
  const currentAgentLocation = agentLocation || (order?.agent_latitude ? { lat: order.agent_latitude, lng: order.agent_longitude } : null);

  useEffect(() => {
    orderAPI.getById(id).then(res => {
      setOrder(res.data.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="page-wrapper container section">Loading order details...</div>;
  if (!order) return <div className="page-wrapper container section">Order not found.</div>;

  const steps = [
    { id: 'placed', label: 'Order Placed', icon: Store },
    { id: 'preparing', label: 'Preparing', icon: Package },
    { id: 'out_for_delivery', label: 'On the Way', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle }
  ];

  // Adjust steps based on delivery type/pickup
  if (order.delivery_type === 'pickup') {
    steps[2] = { id: 'ready_for_pickup', label: 'Ready for Pickup', icon: MapPin };
  }

  const currentStepIndex = steps.findIndex(s => s.id === currentStatus) !== -1 
    ? steps.findIndex(s => s.id === currentStatus) 
    : (currentStatus === 'confirmed' ? 0 : (currentStatus === 'ready_for_pickup' ? 2 : -1));

  const mapCenter = [order.loc_lat, order.loc_lng];

  return (
    <div className="page-wrapper container tracking-layout section">
      <div className="tracking-main card">
        <div className="card-header flex items-center justify-between" style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-md">
            <button className="btn-ghost" style={{ padding: '8px', borderRadius: '50%' }} onClick={() => navigate('/orders')}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="text-secondary text-sm">Order #{order.order_number}</div>
              <h3>{order.shop_name}</h3>
            </div>
          </div>
          <div className="text-right">
            <div className="text-secondary text-sm">Estimated Delivery</div>
            <div className="text-lg font-bold flex items-center gap-sm">
              <Clock size={16} className="text-primary" /> 
              {order.estimated_time} mins
            </div>
          </div>
        </div>

        <div className="card-body" style={{ padding: '32px 24px' }}>
          {/* Stepper */}
          <div className="stepper mb-2xl">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStepIndex;
              const isCompleted = idx < currentStepIndex || currentStatus === 'delivered';
              
              return (
                <div key={step.id} className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  <div className="step-icon-wrap">
                    <div className="step-icon">
                      {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                    </div>
                  </div>
                  <div className="step-label">{step.label}</div>
                  {idx < steps.length - 1 && <div className="step-line"></div>}
                </div>
              );
            })}
          </div>

          <div className="tracking-map mb-lg">
            <MapContainer center={mapCenter} zoom={15} scrollWheelZoom={false} style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-md)', zIndex: 1 }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[order.loc_lat, order.loc_lng]} icon={locationIcon}>
                <Popup>Delivery/Pickup Location</Popup>
              </Marker>
              
              {currentAgentLocation && (
                <Marker position={[currentAgentLocation.lat, currentAgentLocation.lng]} icon={deliveryIcon}>
                  <Popup>Delivery Agent</Popup>
                </Marker>
              )}
              
              {/* Draw line if agent is on the way and has location */}
              {currentAgentLocation && (currentStatus === 'out_for_delivery') && (
                <Polyline 
                  positions={[[currentAgentLocation.lat, currentAgentLocation.lng], [order.loc_lat, order.loc_lng]]}
                  color="var(--primary)" 
                  dashArray="5, 10" 
                  weight={3} 
                />
              )}
            </MapContainer>
          </div>

          {/* Delivery Agent Info */}
          {order.agent_name && (
            <div className="agent-card">
              <div className="agent-avatar">
                {order.agent_name.charAt(0)}
              </div>
              <div className="agent-info">
                <h4>{order.agent_name}</h4>
                <div className="text-secondary text-sm">Delivery Agent • ⭐ {order.agent_rating}</div>
              </div>
              <a href={`tel:${order.agent_phone}`} className="btn btn-outline" style={{ borderRadius: '50%', padding: '12px' }}>
                <Phone size={18} />
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="tracking-sidebar card">
        <div className="card-header" style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <h3>Order Details</h3>
        </div>
        <div className="card-body">
          <div className="order-items-list mb-md">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm mb-sm text-secondary">
                <span>{item.quantity} × {item.item_name}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="divider"></div>
          <div className="flex justify-between font-bold">
            <span>Total Paid</span>
            <span>₹{order.total_amount + (order.delivery_fee || 0)}</span>
          </div>
          
          <div className="delivery-info-section mt-lg p-md glass rounded">
            <h4 className="text-sm mb-sm text-primary">Delivery Address</h4>
            <p className="font-semibold">{order.location_name}</p>
            <p className="text-xs text-secondary mt-xs">{order.delivery_type.replace('_', ' ').toUpperCase()}</p>
            
            {order.special_instructions && (
              <>
                <h4 className="text-sm mb-sm text-primary mt-md">Instructions</h4>
                <p className="text-sm italic">"{order.special_instructions}"</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
