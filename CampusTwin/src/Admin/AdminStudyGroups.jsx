import React, { useEffect, useState } from 'react';
import { studyGroupService } from '../services/studyGroupService';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Table from '../components/Table';
import ConfirmDialog from '../components/ConfirmDialog';
import { BookOpen, Search, Trash2, Users } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const AdminStudyGroups = () => {
  const { showSuccess, showError } = useToast();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await studyGroupService.getGroups({ q: searchQuery });
      if (res.success) {
        setGroups(res.data || []);
      }
    } catch (err) {
      showError(err.message || 'Failed to load study groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGroups();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await studyGroupService.deleteGroup(deleteTarget._id);
      showSuccess(`Study group "${deleteTarget.name}" disbanded`);
      setDeleteTarget(null);
      fetchGroups();
    } catch (err) {
      showError(err.message || 'Failed to delete');
    }
  };

  const columns = [
    {
      header: 'Group Name',
      accessor: 'name',
      render: (row) => <strong>{row.name}</strong>
    },
    {
      header: 'Subject',
      accessor: 'subject',
      render: (row) => <span className="status-badge student">{row.subject}</span>
    },
    {
      header: 'Creator',
      accessor: 'createdBy',
      render: (row) => row.createdBy?.name || 'Student'
    },
    {
      header: 'Enrollment',
      accessor: 'members',
      render: (row) => (
        <span>
          {row.members?.length || 0} / {row.maxMembers} Students
        </span>
      )
    },
    {
      header: 'Schedule & Place',
      accessor: 'meetingTime',
      render: (row) => `${row.meetingTime} (${row.location})`
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          className="btn btn-danger btn-sm"
          onClick={() => setDeleteTarget(row)}
          title="Disband group"
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
            <BookOpen size={24} color="var(--primary)" /> Study Groups Governance
          </h2>
          <p className="page-subtitle">
            Inspect active revision circles and monitor peer collaborative study spaces
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search circles by name or subject..."
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
          data={groups}
          loading={loading}
          emptyTitle="No study groups active"
          emptyMessage="No student study circles found."
        />
      </Card>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Confirm Group Disbandment"
        message={`Are you sure you want to disband study group "${deleteTarget?.name}"?`}
        isDanger={true}
      />
    </div>
  );
};

export default AdminStudyGroups;
