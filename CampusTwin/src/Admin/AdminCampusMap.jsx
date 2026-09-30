import React, { useEffect, useState } from 'react';
import { campusService } from '../services/campusService';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import FormField from '../components/FormField';
import StatusBadge from '../components/StatusBadge';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Navigation, 
  Layers, 
  Info,
  CheckCircle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icon paths in Vite bundles
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Component to handle map clicks and set coordinates in form
const LocationPicker = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

const CATEGORIES = ['Academic', 'Hostel', 'Food', 'Sports', 'Administration', 'Library', 'Medical', 'Other'];

const AdminCampusMap = () => {
  const { addToast } = useToast();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal & Edit State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Academic',
    latitude: '',
    longitude: '',
    description: '',
    image: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Confirm delete
  const [deleteId, setDeleteId] = useState(null);

  const defaultCenter = [28.6139, 77.2090];

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await campusService.getLocations({
        category: categoryFilter,
        q: searchQuery
      });
      if (res.success) {
        setLocations(res.data || []);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load campus locations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLocations();
  };

  const handleMapClick = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));
    addToast(`Selected coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`, 'info');
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'Academic',
      latitude: locations[0]?.latitude?.toString() || '28.6139',
      longitude: locations[0]?.longitude?.toString() || '77.2090',
      description: '',
      image: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (loc) => {
    setEditingId(loc._id);
    setFormData({
      name: loc.name,
      category: loc.category,
      latitude: loc.latitude.toString(),
      longitude: loc.longitude.toString(),
      description: loc.description || '',
      image: loc.image || ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Location name is required';
    if (!formData.latitude || isNaN(formData.latitude)) errors.latitude = 'Valid latitude is required';
    if (!formData.longitude || isNaN(formData.longitude)) errors.longitude = 'Valid longitude is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        description: formData.description.trim(),
        image: formData.image.trim()
      };

      if (editingId) {
        await campusService.updateLocation(editingId, payload);
        addToast('Campus location updated successfully', 'success');
      } else {
        await campusService.createLocation(payload);
        addToast('Campus location added to Digital Twin', 'success');
      }
      setShowModal(false);
      fetchLocations();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save location', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await campusService.deleteLocation(deleteId);
      addToast('Campus location removed from map', 'success');
      setDeleteId(null);
      fetchLocations();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete location', 'error');
    }
  };

  const centerPos = locations.length > 0 ? [locations[0].latitude, locations[0].longitude] : defaultCenter;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Digital Twin Campus Map Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Configure and geo-locate institutional buildings, lecture complexes, libraries, and amenities.
          </p>
        </div>
        <button 
          onClick={openAddModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            background: 'var(--primary)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={18} />
          Add Campus POI
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', background: 'var(--surface-subtle)', borderRadius: '6px', padding: '0.5rem 0.75rem', border: '1px solid var(--border)' }}>
            <Search size={18} color="var(--text-secondary)" style={{ marginRight: '0.5rem' }} />
            <input 
              type="text"
              placeholder="Search points of interest or facility name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: '#FFFFFF',
                fontSize: '0.9rem'
              }}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Apply Filters
          </button>
        </form>
      </Card>

      {/* Interactive Map */}
      <Card title="Institutional Geo-Canvas" subtitle="Click anywhere on the map when creating/editing to automatically fill exact coordinates">
        <div style={{ height: '420px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <MapContainer center={centerPos} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker onLocationSelect={handleMapClick} />
            {locations.map((loc) => (
              <Marker key={loc._id} position={[loc.latitude, loc.longitude]}>
                <Popup>
                  <div style={{ minWidth: '180px' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{loc.name}</h4>
                    <span style={{ fontSize: '0.75rem', display: 'inline-block', padding: '2px 6px', background: '#F1F5F9', borderRadius: '4px', marginTop: '4px' }}>
                      {loc.category}
                    </span>
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#475569' }}>
                      {loc.description || 'Institutional facility'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '8px' }}>
                      <button 
                        onClick={() => openEditModal(loc)}
                        style={{ padding: '2px 8px', fontSize: '0.75rem', background: 'var(--primary)', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </Card>

      {/* POI Table List */}
      <Card title="Registered Campus Facilities" subtitle={`Showing ${locations.length} points of interest on the digital twin map`}>
        {loading ? (
          <Loader message="Loading campus locations..." />
        ) : locations.length === 0 ? (
          <EmptyState 
            title="No Campus Facilities Found" 
            description="Add your first campus building, hostel, or facility using the button above." 
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-subtle)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Facility Name</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Coordinates</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Description</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} color="var(--primary)" />
                        {loc.name}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <StatusBadge status={loc.category} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {loc.description || '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEditModal(loc)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: 'var(--text-primary)'
                          }}
                          title="Edit Location"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(loc._id)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            background: '#FEE2E2',
                            border: '1px solid #FECACA',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#DC2626'
                          }}
                          title="Delete Location"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Location Modal */}
      {showModal && (
        <Modal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
          title={editingId ? 'Edit Campus Facility' : 'Add New Campus Location'}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField label="Facility / Building Name" error={formErrors.name} required>
              <input 
                type="text"
                placeholder="e.g. Ramanujan Computer Center"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)' }}
              />
            </FormField>

            <FormField label="Category" required>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField label="Latitude" error={formErrors.latitude} required>
                <input 
                  type="number"
                  step="any"
                  placeholder="e.g. 28.6139"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                />
              </FormField>

              <FormField label="Longitude" error={formErrors.longitude} required>
                <input 
                  type="number"
                  step="any"
                  placeholder="e.g. 77.2090"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                />
              </FormField>
            </div>

            <FormField label="Description">
              <textarea 
                rows={3}
                placeholder="Details on departments, facilities, or operating hours housed here..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)', resize: 'vertical' }}
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '0.65rem 1.25rem', background: 'var(--primary)', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                {submitting ? 'Saving...' : editingId ? 'Update POI' : 'Create POI'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Delete Dialog */}
      {deleteId && (
        <ConfirmDialog
          isOpen={!!deleteId}
          title="Delete Campus Facility"
          message="Are you sure you want to delete this campus location? This will remove the marker from the Interactive Campus Twin map for all users."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          danger
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

export default AdminCampusMap;
