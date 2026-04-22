import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopAPI, locationAPI } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { LocateFixed } from 'lucide-react';
import './CampusMap.css';

// Fix Leaflet blank icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createIcon = (color) => {
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color:${color}; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const icons = {
  shop: createIcon('#D32F2F'),      // Red
  hostel: createIcon('#2196f3'),    // Blue
  pickup: createIcon('#4caf50'),    // Green
};

export default function CampusMap() {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'shops' | 'hostels' | 'pickups'

  // Chandigarh University center approx
  const center = [30.7714, 76.5762];

  useEffect(() => {
    Promise.all([shopAPI.getAll(), locationAPI.getAll()]).then(([sRes, lRes]) => {
      // Group shops by cluster coordinates
      const uniqueClusters = [];
      const shopMap = new Map();
      
      sRes.data.data.forEach(shop => {
        // Find cluster details embedded in shop data (from the JOIN query)
        // Note: The /api/shops returns full cluster info joined with shop
        // Actually, we don't have lat/lng in the basic shop list right now. 
        // We'll need to fetch clusters separately to place shops on the map.
      });
      
      // Let's fetch clusters
      shopAPI.getClusters().then(cRes => {
        const clusters = cRes.data.data;
        // Combine shops into their clusters
        const clusteredShops = clusters.map(c => ({
          ...c,
          type: 'cluster',
          shopsInCluster: sRes.data.data.filter(s => s.cluster_id === c.id)
        }));
        setShops(clusteredShops);
      });
      
      setLocations(lRes.data.data);
    });
  }, []);

  const [mapRef, setMapRef] = useState(null);

  const resetView = () => {
    if (mapRef) {
      mapRef.setView(center, 15);
    }
  };

  const getVisibleMarkers = () => {
    let markers = [];
    if (filter === 'all' || filter === 'shops') {
      markers = [...markers, ...shops];
    }
    if (filter === 'all' || filter === 'hostels') {
      markers = [...markers, ...locations.filter(l => l.type === 'hostel')];
    }
    if (filter === 'all' || filter === 'pickups') {
      markers = [...markers, ...locations.filter(l => l.type === 'pickup_point')];
    }
    return markers;
  };

  return (
    <div className="campus-map-page">
      <div className="map-sidebar glass">
        <h2 className="mb-md">Campus Map</h2>
        <p className="text-secondary text-sm mb-lg">Explore food zones, delivery points, and hostels across Chandigarh University.</p>
        
        <div className="map-filters mb-lg">
          <label className="map-filter-item">
            <input type="radio" name="filter" checked={filter === 'all'} onChange={() => setFilter('all')} />
            <span className="filter-text">All Locations</span>
          </label>
          <label className="map-filter-item">
            <input type="radio" name="filter" checked={filter === 'shops'} onChange={() => setFilter('shops')} />
            <span className="filter-color" style={{ background: '#D32F2F' }}></span>
            <span className="filter-text">Food Zones / Shops</span>
          </label>
          <label className="map-filter-item">
            <input type="radio" name="filter" checked={filter === 'hostels'} onChange={() => setFilter('hostels')} />
            <span className="filter-color" style={{ background: '#2196f3' }}></span>
            <span className="filter-text">Hostels</span>
          </label>
          <label className="map-filter-item">
            <input type="radio" name="filter" checked={filter === 'pickups'} onChange={() => setFilter('pickups')} />
            <span className="filter-color" style={{ background: '#4caf50' }}></span>
            <span className="filter-text">Pickup Points</span>
          </label>
        </div>
        
        <button className="btn btn-outline btn-full" onClick={resetView}>
          <LocateFixed size={18} /> Reset View
        </button>
      </div>

      <div className="map-container-wrapper">
        <MapContainer 
          center={center} 
          zoom={16} 
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
          ref={setMapRef}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
            /* Using a dark map tile set to match UI */
          />

          {getVisibleMarkers().map((marker, idx) => {
            const isCluster = marker.type === 'cluster';
            const icon = isCluster ? icons.shop : (marker.type === 'hostel' ? icons.hostel : icons.pickup);
            
            return (
              <Marker 
                key={`${marker.type}-${idx}`} 
                position={[marker.latitude, marker.longitude]} 
                icon={icon}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  {marker.name}
                </Tooltip>
                <Popup>
                  <div className="custom-popup">
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>
                      {isCluster ? `${marker.icon} ${marker.name}` : marker.name}
                    </h3>
                    
                    {isCluster && marker.shopsInCluster && (
                      <div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#666' }}>
                          {marker.shopsInCluster.length} Shops Available:
                        </p>
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                          {marker.shopsInCluster.map(s => (
                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #eee' }}>
                              <span style={{ fontSize: '0.9rem' }}>{s.name}</span>
                              <button 
                                onClick={() => navigate(`/shop/${s.id}`)}
                                style={{ background: 'none', border: 'none', color: '#D32F2F', cursor: 'pointer', padding: 0 }}
                              >
                                View
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {!isCluster && (
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                        {marker.description || `Type: ${marker.type.replace('_', ' ')}`}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
