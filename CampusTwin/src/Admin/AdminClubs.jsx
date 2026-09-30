import React, { useEffect, useState } from 'react';
import { clubService } from '../services/clubService';
import { useToast } from '../context/ToastContext';
import { CLUB_CATEGORIES } from '../utils/constants';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import ConfirmDialog from '../components/ConfirmDialog';
import { Users, Plus, Search, Trash2, Edit2 } from 'lucide-react';

const AdminClubs = () => {
  const { showSuccess, showError } = useToast();

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Technical',
    facultyCoordinator: ''
  });

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await clubService.getClubs({ q: searchQuery });
      if (res.success) {
        setClubs(res.data || []);
      }
    } catch (err) {
      showError(err.message || 'Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchClubs();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      showError('Please fill in club name and description');
      return;
    }

    try {
      setSubmitting(true);
      if (editingClub) {
        await clubService.updateClub(editingClub._id, formData);
        showSuccess('Club updated successfully!');
      } else {
        await clubService.createClub(formData);
        showSuccess('New student club chartered!');
      }
      setShowModal(false);
      setEditingClub(null);
      setFormData({
        name: '',
        description: '',
        category: 'Technical',
        facultyCoordinator: ''
      });
      fetchClubs();
    } catch (err) {
      showError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await clubService.deleteClub(deleteTarget._id);
      showSuccess(`Club "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchClubs();
    } catch (err) {
      showError(err.message || 'Failed to delete club');
    }
  };

  const columns = [
    {
      header: 'Club Name',
      accessor: 'name',
      render: (row) => <strong>{row.name}</strong>
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="status-badge student">{row.category}</span>
    },
    {
      header: 'Faculty Lead',
      accessor: 'facultyCoordinator',
      render: (row) => row.facultyCoordinator || '—'
    },
    {
      header: 'Active Members',
      accessor: 'memberCount',
      render: (row) => <strong>{row.memberCount || 0} Members</strong>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'inline-flex', gap: 6 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setEditingClub(row);
              setFormData({
                name: row.name,
                description: row.description,
                category: row.category,
                facultyCoordinator: row.facultyCoordinator || ''
              });
              setShowModal(true);
            }}
          >
            <Edit2 size={13} />
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Users size={24} color="var(--primary)" /> Clubs & Chapters Governance
          </h2>
          <p className="page-subtitle">
            Charter, configure, and moderate campus student societies
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingClub(null);
            setFormData({
              name: '',
              description: '',
              category: 'Technical',
              facultyCoordinator: ''
            });
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Charter New Club
        </button>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search clubs by name or coordinator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={clubs}
          loading={loading}
          emptyTitle="No clubs registered"
          emptyMessage="Charter student clubs using the button above."
        />
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingClub ? 'Edit Club Details' : 'Charter New Student Club'}
      >
        <form onSubmit={handleSubmit}>
          <FormField label="Club Name" required>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. IEEE Student Branch / Robotics Club"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Category" required>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CLUB_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Faculty Coordinator">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dr. Rajesh Sharma"
                value={formData.facultyCoordinator}
                onChange={(e) => setFormData({ ...formData, facultyCoordinator: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Description & Objectives" required>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Mission, activities, and membership criteria..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingClub ? 'Save Changes' : 'Charter Club'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Confirm Club Deletion"
        message={`Are you sure you want to delete club "${deleteTarget?.name}"?`}
        isDanger={true}
      />
    </div>
  );
};

export default AdminClubs;
