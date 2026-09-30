import React, { useEffect, useState } from 'react';
import { campusService } from '../services/campusService';
import { CAMPUS_CATEGORIES } from '../utils/constants';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { MapPin, Search, Navigation, Filter, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet standard marker icon paths in Vite bundles
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const StudentCampusMap = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLocation, setActiveLocation] = useState(null);

  // Default campus coordinates (e.g. standard college campus coordinates)
  const defaultCenter = [28.6139, 77.2090];

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await campusService.getLocations({
        category: selectedCategory,
        q: searchQuery
      });
      if (res.success) {
        setLocations(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load campus locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLocations();
  };

  const centerPos =
    locations.length > 0
      ? [locations[0].latitude, locations[0].longitude]
      : defaultCenter;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <MapPin size={24} color="var(--primary)" /> Interactive Campus Twin Map
          </h2>
          <p className="page-subtitle">
            Navigate buildings, labs, hostels, libraries, dining halls, and facilities
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <form onSubmit={handleSearch} className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search campus buildings, departments, or facilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="var(--muted)" />
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: 160 }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CAMPUS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
      </Card>

      {/* Map View & List Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Leaflet Map Card */}
        <Card style={{ padding: 0, overflow: 'hidden', height: 520 }}>
          <MapContainer
            center={centerPos}
            zoom={16}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((loc) => (
              <Marker
                key={loc._id}
                position={[loc.latitude, loc.longitude]}
                eventHandlers={{
                  click: () => setActiveLocation(loc)
                }}
              >
                <Popup>
                  <div style={{ padding: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--primary)' }}>
                      {loc.name}
                    </div>
                    <span
                      className="status-badge upcoming"
                      style={{ fontSize: '0.7rem', margin: '4px 0', display: 'inline-block' }}
                    >
                      {loc.category}
                    </span>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: 4 }}>
                      {loc.description}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Card>

        {/* Locations List Sidebar */}
        <Card
          title={
            <>
              <Navigation size={18} color="var(--primary)" />
              <span>Locations ({locations.length})</span>
            </>
          }
          style={{ height: 520, display: 'flex', flexDirection: 'column' }}
        >
          {loading ? (
            <Loader message="Loading map coordinates..." />
          ) : locations.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No locations found"
              description="No campus locations recorded for this category yet. Administration can add POIs."
            />
          ) : (
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {locations.map((loc) => {
                const isSelected = activeLocation?._id === loc._id;
                return (
                  <div
                    key={loc._id}
                    onClick={() => setActiveLocation(loc)}
                    style={{
                      padding: 12,
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                      backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--surface-alt)',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>
                      {loc.name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <span className="status-badge student" style={{ fontSize: '0.7rem' }}>
                        {loc.category}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                      </span>
                    </div>
                    {loc.description && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 6, lineHeight: 1.3 }}>
                        {loc.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentCampusMap;
