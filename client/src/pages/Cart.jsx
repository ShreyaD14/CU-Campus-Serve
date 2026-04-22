import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { orderAPI, locationAPI } from '../services/api';
import { Trash2, Plus, Minus, MapPin, Building2, CreditCard, ChevronRight } from 'lucide-react';
import './Cart.css';

export default function Cart() {
  const { cart, updateQuantity, clearCart, totalItems, totalAmount } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [deliveryType, setDeliveryType] = useState('hostel'); // 'hostel' | 'pickup'
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (deliveryType === 'hostel') {
      locationAPI.getHostels().then(res => {
        setLocations(res.data.data);
        if (res.data.data.length > 0) setSelectedLocation(res.data.data[0].id.toString());
      });
    } else {
      locationAPI.getPickupPoints().then(res => {
        setLocations(res.data.data);
        if (res.data.data.length > 0) setSelectedLocation(res.data.data[0].id.toString());
      });
    }
  }, [deliveryType]);

  const deliveryFee = deliveryType === 'hostel' ? 20 : 0;
  const grandTotal = totalAmount + deliveryFee;

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) return toast.error('Cart is empty');
    if (!selectedLocation) return toast.error('Select a delivery location');
    
    setPlacing(true);
    try {
      const items = cart.items.map(i => ({ menu_item_id: i.id, quantity: i.quantity }));
      const orderData = {
        shop_id: cart.shopId,
        items,
        delivery_location_id: parseInt(selectedLocation),
        delivery_type: deliveryType,
        special_instructions: specialInstructions
      };
      const res = await orderAPI.place(orderData);
      toast.success('Order placed successfully!');
      clearCart();
      navigate(`/track/${res.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="page-wrapper container cart-empty text-center">
        <span style={{ fontSize: '4rem', display: 'block', marginBottom: 16 }}>🛒</span>
        <h2>Your cart is empty</h2>
        <p className="text-secondary mt-sm mb-lg">Looks like you haven't added anything yet.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Browse Shops
        </button>
      </div>
    );
  }

  return (
    <div className="page-wrapper container section">
      <h1 className="mb-md">Checkout</h1>
      
      <div className="cart-layout">
        <div className="cart-left">
          <div className="card mb-lg">
            <div className="card-header flex justify-between items-center" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 className="flex items-center gap-sm">
                <span style={{ fontSize: '1.2rem' }}>🏪</span> {cart.shopName}
              </h3>
              <button className="btn-ghost text-red text-sm" style={{ padding: '4px 8px' }} onClick={clearCart}>Clear All</button>
            </div>
            
            <div className="cart-items">
              {cart.items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <div className={`veg-badge ${item.is_veg ? 'veg' : 'nonveg'}`} style={{ marginTop: 4 }}>
                      <div className="veg-dot"></div>
                    </div>
                    <div>
                      <h4 className="text-md">{item.name}</h4>
                      <div className="text-primary font-bold mt-sm">₹{item.price}</div>
                    </div>
                  </div>
                  
                  <div className="qty-control">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                  </div>
                  <div className="item-total font-bold">₹{item.price * item.quantity}</div>
                </div>
              ))}
            </div>
            
            <div className="card-body">
              <label className="form-label mb-sm block">Any special instructions for the restaurant?</label>
              <textarea 
                className="input" 
                rows="2" 
                placeholder="e.g. Make it spicy, no onions..."
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
              ></textarea>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <h3 className="mb-md">Delivery Details</h3>
              
              <div className="delivery-type-selector mb-md">
                <button 
                  className={`delivery-tab ${deliveryType === 'hostel' ? 'active' : ''}`}
                  onClick={() => setDeliveryType('hostel')}
                >
                  <Building2 size={18} /> Hostel Delivery (+₹20)
                </button>
                <button 
                  className={`delivery-tab ${deliveryType === 'pickup' ? 'active' : ''}`}
                  onClick={() => setDeliveryType('pickup')}
                >
                  <MapPin size={18} /> Pickup Point (Free)
                </button>
              </div>
              
              <div className="form-group mb-sm">
                <label className="form-label">Select {deliveryType === 'hostel' ? 'Hostel' : 'Pickup Point'}</label>
                <select 
                  className="select" 
                  value={selectedLocation} 
                  onChange={e => setSelectedLocation(e.target.value)}
                >
                  <option value="" disabled>Select a location</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              {deliveryType === 'pickup' && (
                <p className="text-xs text-secondary mt-sm">
                  You will need to walk to this location to collect your order from the delivery agent.
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="cart-right">
          <div className="card sticky-summary">
            <div className="card-body">
              <h3 className="mb-md flex items-center gap-sm">
                <CreditCard size={18} /> Bill Summary
              </h3>
              
              <div className="bill-row">
                <span>Item Total</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="bill-row">
                <span>Platform Fee</span>
                <span>₹5</span>
              </div>
              <div className="bill-row">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? "text-green font-semibold" : ""}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              
              <div className="divider"></div>
              
              <div className="bill-row grand-total">
                <span>To Pay</span>
                <span>₹{grandTotal + 5}</span>
              </div>
              
              <button 
                className="btn btn-primary btn-full mt-lg" 
                style={{ height: 50, fontSize: '1.1rem' }}
                onClick={handlePlaceOrder}
                disabled={placing}
              >
                {placing ? 'Processing...' : (
                  <>Place Order <ChevronRight size={18} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
