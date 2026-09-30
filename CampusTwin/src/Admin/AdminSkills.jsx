import React, { useEffect, useState } from 'react';
import { skillService } from '../services/skillService';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Table from '../components/Table';
import ConfirmDialog from '../components/ConfirmDialog';
import { Sparkles, Search, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const AdminSkills = () => {
  const { showSuccess, showError } = useToast();

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await skillService.getSkills({ q: searchQuery });
      if (res.success) {
        setSkills(res.data || []);
      }
    } catch (err) {
      showError(err.message || 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSkills();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await skillService.deleteSkill(deleteTarget._id);
      showSuccess(`Skill "${deleteTarget.skill}" removed`);
      setDeleteTarget(null);
      fetchSkills();
    } catch (err) {
      showError(err.message || 'Failed to delete skill');
    }
  };

  const columns = [
    {
      header: 'Skill Offered',
      accessor: 'skill',
      render: (row) => <strong>{row.skill}</strong>
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="status-badge student">{row.category}</span>
    },
    {
      header: 'Proficiency',
      accessor: 'level'
    },
    {
      header: 'Peer Mentor',
      accessor: 'user',
      render: (row) => (
        <div>
          <div>{row.user?.name || 'Student'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            {row.user?.department} • {row.user?.email}
          </div>
        </div>
      )
    },
    {
      header: 'Availability',
      accessor: 'availability'
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          className="btn btn-danger btn-sm"
          onClick={() => setDeleteTarget(row)}
          title="Remove skill listing"
        >
          <Trash2 size={13} />
        </button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Sparkles size={24} color="var(--primary)" /> Campus Skill Registry
          </h2>
          <p className="page-subtitle">
            Moderate peer mentorship topics, technical tutoring, and skill listings
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search skill listings or mentors..."
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
          data={skills}
          loading={loading}
          emptyTitle="No skills listed"
          emptyMessage="No skills found on the exchange."
        />
      </Card>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Confirm Skill Removal"
        message={`Are you sure you want to remove skill "${deleteTarget?.skill}"?`}
        isDanger={true}
      />
    </div>
  );
};

export default AdminSkills;
