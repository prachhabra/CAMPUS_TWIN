import React, { useEffect, useState } from 'react';
import { studyGroupService } from '../services/studyGroupService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { BookOpen, Plus, Search, Users, MapPin, Clock, LogIn, LogOut, Trash2 } from 'lucide-react';

const StudentStudyGroups = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    meetingTime: '',
    location: '',
    maxMembers: 6
  });

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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.description) {
      showError('Please complete all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await studyGroupService.createGroup(formData);
      showSuccess('Study group founded! (+15 Campus Points)');
      setShowCreateModal(false);
      setFormData({
        name: '',
        subject: '',
        description: '',
        meetingTime: '',
        location: '',
        maxMembers: 6
      });
      fetchGroups();
    } catch (err) {
      showError(err.message || 'Failed to create study group');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (groupId) => {
    try {
      setActionLoading(true);
      await studyGroupService.joinGroup(groupId);
      showSuccess('You have joined the study group! (+10 Campus Points)');
      fetchGroups();
      if (selectedGroup) setSelectedGroup(null);
    } catch (err) {
      showError(err.message || 'Failed to join group');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async (groupId) => {
    try {
      setActionLoading(true);
      await studyGroupService.leaveGroup(groupId);
      showSuccess('You have left the study group');
      fetchGroups();
      if (selectedGroup) setSelectedGroup(null);
    } catch (err) {
      showError(err.message || 'Failed to leave group');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (groupId) => {
    try {
      setActionLoading(true);
      await studyGroupService.deleteGroup(groupId);
      showSuccess('Study group removed');
      fetchGroups();
      if (selectedGroup) setSelectedGroup(null);
    } catch (err) {
      showError(err.message || 'Failed to delete');
    } finally {
      setActionLoading(false);
    }
  };

  const isMember = (group) => {
    if (!group || !group.members) return false;
    return group.members.some(
      (m) => (m._id || m)?.toString() === user?._id?.toString()
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <BookOpen size={24} color="var(--primary)" /> Peer Study Circles
          </h2>
          <p className="page-subtitle">
            Form collaborative revision circles, prep for midterms, and solve assignments
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> Form a Study Group
        </button>
      </div>

      {/* Search Bar */}
      <Card>
        <form onSubmit={handleSearch} className="filters-bar" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by subject, circle name, or meeting location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
      </Card>

      {/* Groups Grid */}
      {loading ? (
        <Loader message="Loading study groups..." />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No study groups active"
          description="Create the first study group for your course or semester!"
          action={
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} /> Create Group
            </button>
          }
        />
      ) : (
        <div className="grid-cols-3">
          {groups.map((grp) => {
            const member = isMember(grp);
            const memberCount = grp.members?.length || 0;
            const isFull = memberCount >= grp.maxMembers;
            const isCreator = (grp.createdBy?._id || grp.createdBy)?.toString() === user?._id?.toString();

            return (
              <Card
                key={grp._id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 20
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10
                    }}
                  >
                    <span className="status-badge student">{grp.subject}</span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: isFull ? 'var(--danger)' : 'var(--muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Users size={14} /> {memberCount} / {grp.maxMembers} Members
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: 'var(--text)',
                      marginBottom: 8
                    }}
                  >
                    {grp.name}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--muted)',
                      lineHeight: 1.5,
                      marginBottom: 14,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {grp.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={13} color="var(--primary)" /> Schedule: {grp.meetingTime}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={13} color="var(--primary)" /> Location: {grp.location}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    paddingTop: 14,
                    borderTop: '1px solid var(--border)',
                    marginTop: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedGroup(grp)}
                  >
                    View Members
                  </button>

                  {member ? (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleLeave(grp._id)}
                      disabled={actionLoading}
                    >
                      <LogOut size={14} /> Leave
                    </button>
                  ) : (
                    <button
                      className="btn btn-accent btn-sm"
                      onClick={() => handleJoin(grp._id)}
                      disabled={actionLoading || isFull}
                    >
                      <LogIn size={14} /> {isFull ? 'Capacity Full' : 'Join Circle'}
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Form a New Study Circle"
      >
        <form onSubmit={handleCreate}>
          <FormField label="Study Circle Name" required>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Operating Systems Prep Circle"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Subject / Topic" required>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Operating Systems"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Max Capacity (Members)" required>
              <input
                type="number"
                className="form-input"
                min="2"
                max="20"
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                required
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Meeting Schedule" required>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Tuesdays & Thursdays 5:00 PM"
                value={formData.meetingTime}
                onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Location / Link" required>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Library Study Pod 4 or Google Meet"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </FormField>
          </div>

          <FormField label="Description & Goals" required>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="What topics will be covered? What expectations do you have for members?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Form Study Group'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Members Modal */}
      {selectedGroup && (
        <Modal
          isOpen={!!selectedGroup}
          onClose={() => setSelectedGroup(null)}
          title={`Members of ${selectedGroup.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="status-badge student">{selectedGroup.subject}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                {selectedGroup.members?.length || 0} / {selectedGroup.maxMembers} Students
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {selectedGroup.description}
            </p>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 10 }}>
                Enrolled Students
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedGroup.members?.map((mem) => (
                  <div
                    key={mem._id}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--surface-alt)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{mem.name}</span>
                    <span style={{ color: 'var(--muted)' }}>{mem.rollNumber || mem.department}</span>
                  </div>
                ))}
              </div>
            </div>

            {((selectedGroup.createdBy?._id || selectedGroup.createdBy)?.toString() === user?._id?.toString() || user?.role === 'admin') && (
              <div style={{ marginTop: 10 }}>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(selectedGroup._id)}
                >
                  <Trash2 size={14} /> Disband Circle
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentStudyGroups;
