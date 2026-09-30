import React, { useEffect, useState } from 'react';
import { clubService } from '../services/clubService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CLUB_CATEGORIES } from '../utils/constants';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { Users, Search, UserPlus, UserMinus, Globe, Instagram, Linkedin, Github } from 'lucide-react';

const StudentClubs = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedClub, setSelectedClub] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await clubService.getClubs({
        category: selectedCategory,
        q: searchQuery
      });
      if (res.success) {
        setClubs(res.data || []);
      }
    } catch (err) {
      showError(err.message || 'Failed to load campus clubs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchClubs();
  };

  const handleJoin = async (clubId) => {
    try {
      setActionLoading(true);
      const res = await clubService.joinClub(clubId);
      showSuccess(res.message || 'Successfully joined club! (+25 Campus Points)');
      fetchClubs();
      if (selectedClub) setSelectedClub(null);
    } catch (err) {
      showError(err.message || 'Failed to join club');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async (clubId) => {
    try {
      setActionLoading(true);
      const res = await clubService.leaveClub(clubId);
      showSuccess(res.message || 'You have left the club');
      fetchClubs();
      if (selectedClub) setSelectedClub(null);
    } catch (err) {
      showError(err.message || 'Failed to leave club');
    } finally {
      setActionLoading(false);
    }
  };

  const isMember = (club) => {
    if (!club || !club.members) return false;
    return club.members.some(
      (m) => (m.user?._id || m.user)?.toString() === user?._id?.toString()
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Users size={24} color="var(--primary)" /> Student Clubs & Societies
          </h2>
          <p className="page-subtitle">
            Connect with technical, cultural, and sports communities across campus
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
              placeholder="Search clubs by name, description, or coordinator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 160 }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {CLUB_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>
      </Card>

      {/* Clubs Grid */}
      {loading ? (
        <Loader message="Loading registered campus clubs..." />
      ) : clubs.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clubs registered"
          description="There are currently no student clubs found in this category."
        />
      ) : (
        <div className="grid-cols-3">
          {clubs.map((club) => {
            const member = isMember(club);
            return (
              <Card
                key={club._id}
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
                      marginBottom: 12
                    }}
                  >
                    <span className="status-badge student">{club.category}</span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Users size={14} /> {club.memberCount || 0} Members
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
                    {club.name}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--muted)',
                      lineHeight: 1.5,
                      marginBottom: 16,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {club.description}
                  </p>

                  {club.facultyCoordinator && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                      Faculty Lead: <strong>{club.facultyCoordinator}</strong>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    paddingTop: 14,
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedClub(club)}
                  >
                    View Info
                  </button>

                  {member ? (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleLeave(club._id)}
                      disabled={actionLoading}
                    >
                      <UserMinus size={14} /> Leave Club
                    </button>
                  ) : (
                    <button
                      className="btn btn-accent btn-sm"
                      onClick={() => handleJoin(club._id)}
                      disabled={actionLoading}
                    >
                      <UserPlus size={14} /> Join Club
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Club Details Modal */}
      {selectedClub && (
        <Modal
          isOpen={!!selectedClub}
          onClose={() => setSelectedClub(null)}
          title={selectedClub.name}
          footer={
            <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'space-between' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedClub(null)}
              >
                Close
              </button>

              {isMember(selectedClub) ? (
                <button
                  className="btn btn-danger"
                  onClick={() => handleLeave(selectedClub._id)}
                  disabled={actionLoading}
                >
                  Leave Club
                </button>
              ) : (
                <button
                  className="btn btn-accent"
                  onClick={() => handleJoin(selectedClub._id)}
                  disabled={actionLoading}
                >
                  Join Club
                </button>
              )}
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className="status-badge student">{selectedClub.category}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                {selectedClub.memberCount || 0} Registered Members
              </span>
            </div>

            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {selectedClub.description}
            </p>

            {selectedClub.facultyCoordinator && (
              <div
                style={{
                  padding: 12,
                  backgroundColor: 'var(--background)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem'
                }}
              >
                Faculty Coordinator: <strong>{selectedClub.facultyCoordinator}</strong>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentClubs;
