import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shopAPI } from '../services/api';
import { Search, Clock, Star, MapPin, ChevronRight, Zap } from 'lucide-react';
import './Home.css';

export default function Home() {
  const [clusters, setClusters] = useState([]);
  const [shops, setShops] = useState([]);
  const [activeCluster, setActiveCluster] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([shopAPI.getClusters(), shopAPI.getAll()]).then(([cRes, sRes]) => {
      setClusters(cRes.data.data);
      setShops(sRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const filteredShops = shops.filter(s => {
    const matchCluster = activeCluster ? s.cluster_id === activeCluster : true;
    const matchSearch = search ? s.name.toLowerCase().includes(search.toLowerCase()) || s.cuisine_tags?.toLowerCase().includes(search.toLowerCase()) : true;
    return matchCluster && matchSearch;
  });

  const openCount = shops.filter(s => s.is_open).length;

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section className="home-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Zap size={14} /> <span>{openCount} shops open right now</span>
            </div>
            <h1>Order food across<br /><span className="text-red">Chandigarh University</span></h1>
            <p className="hero-subtitle">From 37+ shops in 5 food zones — delivered to your hostel or nearest pickup point</p>
            <div className="hero-search">
              <Search size={20} />
              <input type="text" placeholder="Search shops, cuisines, dishes..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      {/* Cluster Tabs */}
      <section className="container">
        <div className="cluster-tabs">
          <button className={`cluster-tab ${!activeCluster ? 'active' : ''}`} onClick={() => setActiveCluster(null)}>
            🔥 All
          </button>
          {clusters.map(c => (
            <button key={c.id} className={`cluster-tab ${activeCluster === c.id ? 'active' : ''}`}
              onClick={() => setActiveCluster(activeCluster === c.id ? null : c.id)}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </section>

      {/* Shop Grid */}
      <section className="container" style={{ paddingBottom: 60 }}>
        <div className="section-header">
          <h2>{activeCluster ? clusters.find(c => c.id === activeCluster)?.name : 'All Shops'}</h2>
          <span className="text-secondary text-sm">{filteredShops.length} shops</span>
        </div>

        {loading ? (
          <div className="grid-shops">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="card" style={{ height: 260 }}>
                <div className="skeleton" style={{ height: 140 }}></div>
                <div className="card-body">
                  <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 8 }}></div>
                  <div className="skeleton" style={{ height: 14, width: '50%' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: '3rem' }}>🔍</span>
            <h3>No shops found</h3>
            <p>Try a different search or cluster</p>
          </div>
        ) : (
          <div className="grid-shops">
            {filteredShops.map(shop => (
              <Link to={`/shop/${shop.id}`} key={shop.id} className="card shop-card">
                <div className="shop-card-image" style={{ 
                  background: shop.image_url ? `url(${shop.image_url}) center/cover no-repeat` : shopGradient(shop.id) 
                }}>
                  {!shop.image_url && <span className="shop-card-emoji">{shopEmoji(shop.cuisine_tags)}</span>}
                  {!shop.is_open && <div className="shop-closed-overlay">CLOSED</div>}
                  <div className="shop-card-rating"><Star size={12} fill="#fff" /> {shop.rating}</div>
                </div>
                <div className="card-body">
                  <h4 className="shop-card-name">{shop.name}</h4>
                  <p className="shop-card-cuisine text-sm text-secondary">{shop.cuisine_tags}</p>
                  <div className="shop-card-meta">
                    <span className="flex items-center gap-sm text-xs">
                      <Clock size={13} /> {shop.avg_delivery_time} min
                    </span>
                    <span className="flex items-center gap-sm text-xs">
                      <MapPin size={13} /> {shop.cluster_name}
                    </span>
                  </div>
                </div>
                <div className="card-footer flex justify-between items-center">
                  <span className="text-xs text-muted">Min ₹{shop.min_order}</span>
                  <span className="text-xs text-red flex items-center gap-sm">View Menu <ChevronRight size={14} /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function shopEmoji(cuisine) {
  if (!cuisine) return '🍽️';
  const c = cuisine.toLowerCase();
  if (c.includes('pizza') || c.includes('italian')) return '🍕';
  if (c.includes('burger')) return '🍔';
  if (c.includes('momos') || c.includes('tibetan')) return '🥟';
  if (c.includes('chinese') || c.includes('noodles') || c.includes('asian')) return '🍜';
  if (c.includes('coffee') || c.includes('cafe')) return '☕';
  if (c.includes('juice') || c.includes('health') || c.includes('healthy')) return '🥤';
  if (c.includes('ice cream') || c.includes('dessert')) return '🍨';
  if (c.includes('chai') || c.includes('tea')) return '🍵';
  if (c.includes('biryani')) return '🍛';
  if (c.includes('south indian') || c.includes('dosa')) return '🫓';
  if (c.includes('chaat') || c.includes('street')) return '🧆';
  if (c.includes('sandwich') || c.includes('snack')) return '🥪';
  if (c.includes('punjabi') || c.includes('north indian') || c.includes('thali')) return '🍛';
  if (c.includes('roll') || c.includes('wrap')) return '🌯';
  if (c.includes('mughlai') || c.includes('kebab')) return '🍖';
  if (c.includes('salad') || c.includes('vegan')) return '🥗';
  if (c.includes('waffle') || c.includes('bakery')) return '🧇';
  return '🍽️';
}

function shopGradient(id) {
  const gradients = [
    'linear-gradient(135deg, #D32F2F 0%, #ff6659 100%)',
    'linear-gradient(135deg, #C62828 0%, #ef5350 100%)',
    'linear-gradient(135deg, #b71c1c 0%, #D32F2F 100%)',
    'linear-gradient(135deg, #880e4f 0%, #D32F2F 100%)',
    'linear-gradient(135deg, #4a148c 0%, #D32F2F 100%)',
    'linear-gradient(135deg, #1a237e 0%, #ef5350 100%)',
    'linear-gradient(135deg, #ff5722 0%, #D32F2F 100%)',
    'linear-gradient(135deg, #e65100 0%, #ff6659 100%)',
  ];
  return gradients[id % gradients.length];
}
