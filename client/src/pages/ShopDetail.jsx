import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shopAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, Clock, Star, MapPin, Search, Plus, Minus, ShoppingCart, Leaf } from 'lucide-react';
import './ShopDetail.css';

export default function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addItem, updateQuantity } = useCart();
  const { toast } = useToast();
  const [shop, setShop] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([shopAPI.getById(id), shopAPI.getMenu(id)]).then(([sRes, mRes]) => {
      setShop(sRes.data.data);
      setMenuItems(mRes.data.data);
      setGrouped(mRes.data.grouped);
    }).finally(() => setLoading(false));
  }, [id]);

  const categories = ['All', ...Object.keys(grouped)];
  const filteredItems = menuItems.filter(i => {
    const matchCat = activeCategory === 'All' || i.category === activeCategory;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && i.is_available;
  });

  const getItemQty = (itemId) => {
    const ci = cart.items.find(i => i.id === itemId);
    return ci ? ci.quantity : 0;
  };

  const handleAdd = (item) => {
    if (cart.shopId && cart.shopId !== parseInt(id)) {
      if (!confirm('Adding items from a different shop will clear your cart. Continue?')) return;
    }
    addItem(parseInt(id), shop.name, { id: item.id, name: item.name, price: item.price, is_veg: item.is_veg });
    toast.success(`${item.name} added to cart`);
  };

  if (loading) return (
    <div className="page-wrapper container" style={{ padding: '100px 16px' }}>
      <div className="skeleton" style={{ height: 200, marginBottom: 20, borderRadius: 16 }}></div>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 90, marginBottom: 12, borderRadius: 12 }}></div>)}
    </div>
  );

  if (!shop) return <div className="page-wrapper container"><p>Shop not found.</p></div>;

  return (
    <div className="page-wrapper">
      {/* Banner */}
      <div className="shop-banner" style={{ background: `linear-gradient(135deg, #D32F2F 0%, #b71c1c 100%)` }}>
        <div className="container">
          <button className="back-btn glass" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <div className="shop-banner-info">
            <h1>{shop.name}</h1>
            <p>{shop.description}</p>
            <div className="shop-meta-row">
              <span className="rating"><Star size={12} fill="#fff" /> {shop.rating}</span>
              <span className="flex items-center gap-sm text-sm"><Clock size={14} /> {shop.avg_delivery_time} min</span>
              <span className="flex items-center gap-sm text-sm"><MapPin size={14} /> {shop.cluster_name}</span>
            </div>
            <div className="shop-tags">
              {shop.cuisine_tags?.split(',').map(t => <span key={t} className="badge badge-primary">{t.trim()}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="container shop-content">
        <div className="menu-header">
          <div className="menu-search">
            <Search size={18} />
            <input type="text" placeholder="Search menu items..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="menu-categories">
          {categories.map(c => (
            <button key={c} className={`cluster-tab ${activeCategory === c ? 'active' : ''}`}
              onClick={() => setActiveCategory(c)}>
              {c} {c !== 'All' && <span className="text-xs">({grouped[c]?.length || 0})</span>}
            </button>
          ))}
        </div>

        <div className="menu-list">
          {filteredItems.length === 0 ? (
            <div className="empty-state"><span style={{ fontSize: '2.5rem' }}>🍽️</span><h3>No items found</h3></div>
          ) : filteredItems.map(item => (
            <div key={item.id} className="menu-item card">
              <div className="menu-item-left">
                <div className={`veg-badge ${item.is_veg ? 'veg' : 'nonveg'}`}>
                  <div className="veg-dot"></div>
                </div>
                <div className="menu-item-info">
                  <h4>{item.name} {item.is_bestseller ? <span className="bestseller-tag">★ Bestseller</span> : ''}</h4>
                  <p className="text-sm text-secondary">{item.description}</p>
                  <span className="menu-item-price">₹{item.price}</span>
                </div>
              </div>
              <div className="menu-item-action">
                {getItemQty(item.id) > 0 ? (
                  <div className="qty-control">
                    <button onClick={() => updateQuantity(item.id, getItemQty(item.id) - 1)}><Minus size={14} /></button>
                    <span>{getItemQty(item.id)}</span>
                    <button onClick={() => updateQuantity(item.id, getItemQty(item.id) + 1)}><Plus size={14} /></button>
                  </div>
                ) : (
                  <button className="add-btn" onClick={() => handleAdd(item)}>
                    <Plus size={14} /> ADD
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Cart Bar */}
      {cart.items.length > 0 && parseInt(id) === cart.shopId && (
        <div className="sticky-cart-bar" onClick={() => navigate('/cart')}>
          <div className="container flex justify-between items-center">
            <div className="flex items-center gap-md">
              <ShoppingCart size={20} />
              <span>{cart.items.reduce((s,i) => s+i.quantity, 0)} items | ₹{cart.items.reduce((s,i) => s+i.price*i.quantity, 0)}</span>
            </div>
            <span className="font-semibold">View Cart →</span>
          </div>
        </div>
      )}
    </div>
  );
}
